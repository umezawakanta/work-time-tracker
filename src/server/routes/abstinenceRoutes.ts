import express, { Request, Response, NextFunction } from 'express';
import { AbstinenceChallenge } from '../models/AbstinenceChallenge.js';
import { AbstinenceLog } from '../models/AbstinenceLog.js';
import { Achievement } from '../models/Achievement.js';
import { UserAchievement } from '../models/UserAchievement.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { ABSTINENCE_CONFIG } from '../../types/abstinence.js';

const router = express.Router();

// GET /api/abstinence/challenges - ユーザーのチャレンジ一覧取得
router.get(
  '/challenges',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const challenges = await AbstinenceChallenge.find({ userId }).sort({ createdAt: -1 });
      res.json(challenges);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/abstinence/challenges - 新しいチャレンジを作成
router.post(
  '/challenges',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { type, title, description } = req.body;

      const config = ABSTINENCE_CONFIG.types[type as keyof typeof ABSTINENCE_CONFIG.types];
      if (!config) {
        res.status(400).json({ message: 'Invalid challenge type' });
        return;
      }

      const challengeData = {
        userId,
        type,
        title: title || config.name,
        description,
        startDate: new Date(),
        difficultyMultiplier: config.difficulty,
      };

      const newChallenge = new AbstinenceChallenge(challengeData);
      const savedChallenge = await newChallenge.save();

      res.status(201).json(savedChallenge);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        res.status(400).json({ message: 'このタイプのチャレンジは既に存在します' });
        return;
      }
      next(error);
    }
  }
);

// PUT /api/abstinence/challenges/:challengeId/record - 日々の記録を追加
router.put(
  '/challenges/:challengeId/record',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { challengeId } = req.params;
      const { status, note } = req.body;
      const userId = req.user?.id;

      // Validate status
      if (typeof status !== 'string' || !['success', 'failure', 'reset'].includes(status)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }

      const challenge = await AbstinenceChallenge.findOne({ _id: challengeId, userId });
      if (!challenge) {
        res.status(404).json({ message: 'Challenge not found' });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 今日のログを取得または作成
      let log = await AbstinenceLog.findOne({ challengeId, date: today });

      if (!log) {
        log = new AbstinenceLog({
          challengeId,
          userId,
          date: today,
          status: status as 'success' | 'failure' | 'reset',
          note: typeof note === 'string' ? note : undefined,
          experienceGained: 0,
        });
      } else {
        log.status = status as 'success' | 'failure' | 'reset';
        log.note = typeof note === 'string' ? note : undefined;
      }

      // 経験値とストリーク計算
      if (status === 'success') {
        challenge.currentStreak += 1;
        const expGained = ABSTINENCE_CONFIG.experienceFormula(1, challenge.difficultyMultiplier);
        challenge.experience += expGained;
        log.experienceGained = expGained;

        // レベルアップ判定
        const newLevel = ABSTINENCE_CONFIG.levelFormula(challenge.experience);
        if (newLevel > challenge.level) {
          challenge.level = newLevel;
        }
        challenge.experienceToNext =
          ABSTINENCE_CONFIG.experienceToNextLevel(challenge.level) - challenge.experience;

        // 最長記録更新
        if (challenge.currentStreak > challenge.longestStreak) {
          challenge.longestStreak = challenge.currentStreak;
        }
      } else if (status === 'failure') {
        challenge.currentStreak = 0;
        log.experienceGained = 0;
      }

      await Promise.all([challenge.save(), log.save()]);

      // アチーブメント判定
      if (userId) {
        await checkAchievements(userId, challenge);
      }

      res.json({ challenge, log });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/abstinence/stats - ユーザーの統計情報取得
router.get(
  '/stats',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      const challenges = await AbstinenceChallenge.find({ userId });
      const achievements = await UserAchievement.find({ userId });

      const totalDays = challenges.reduce((sum, c) => sum + c.longestStreak, 0);
      const totalExperience = challenges.reduce((sum, c) => sum + c.experience, 0);
      const averageLevel =
        challenges.length > 0
          ? challenges.reduce((sum, c) => sum + c.level, 0) / challenges.length
          : 0;

      // ランク計算
      const maxLevel = Math.max(...challenges.map((c) => c.level), 0);
      const currentRank =
        ABSTINENCE_CONFIG.ranks
          .slice()
          .reverse()
          .find((rank) => maxLevel >= rank.minLevel) || ABSTINENCE_CONFIG.ranks[0];

      const nextRank = ABSTINENCE_CONFIG.ranks.find((rank) => rank.minLevel > maxLevel);
      const nextRankProgress = nextRank
        ? ((maxLevel - currentRank.minLevel) / (nextRank.minLevel - currentRank.minLevel)) * 100
        : 100;

      const stats = {
        totalDays,
        totalExperience,
        averageLevel,
        activeChallenges: challenges.filter((c) => c.isActive).length,
        completedChallenges: challenges.filter((c) => !c.isActive).length,
        achievements: achievements.length,
        rank: currentRank.name,
        nextRankProgress,
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/abstinence/achievements - ユーザーのアチーブメント取得
router.get(
  '/achievements',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      const userAchievements = await UserAchievement.find({ userId }).populate('achievementId');
      const allAchievements = await Achievement.find();

      res.json({
        unlocked: userAchievements,
        all: allAchievements,
      });
    } catch (error) {
      next(error);
    }
  }
);

// アチーブメント判定関数
async function checkAchievements(userId: string, challenge: any) {
  const achievements = await Achievement.find();

  for (const achievement of achievements) {
    // 既に取得済みかチェック
    const existing = await UserAchievement.findOne({
      userId,
      achievementId: achievement._id,
    });
    if (existing) continue;

    let shouldUnlock = false;

    switch (achievement.condition.type) {
      case 'streak':
        if (challenge.currentStreak >= achievement.condition.value) {
          shouldUnlock = true;
        }
        break;
      case 'level':
        if (challenge.level >= achievement.condition.value) {
          shouldUnlock = true;
        }
        break;
      // 他の条件も実装...
    }

    if (shouldUnlock) {
      const userAchievement = new UserAchievement({
        userId,
        achievementId: achievement._id,
        challengeId: challenge._id,
      });
      await userAchievement.save();

      // 経験値ボーナス付与
      if (achievement.experienceReward > 0) {
        challenge.experience += achievement.experienceReward;
        await challenge.save();
      }
    }
  }
}

export default router;
