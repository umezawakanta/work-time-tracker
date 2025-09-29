// 日記投稿報酬管理ユーティリティ

import { badgeManager } from './badgeManager';
import { characterManager } from './characterManager';
import { currencyManager } from './currencyManager';

export interface DiaryRewardResult {
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    xpReward: number;
  }>;
  experience: number;
  workCoins: number;
  leveledUp: boolean;
  newLevel: number;
  achievements: any[];
}

class DiaryRewardManager {
  private processedDiaries: Set<string> = new Set();

  // 日記投稿時の報酬を計算・付与
  public async processDiaryReward(diaryData: {
    title: string;
    content: string;
    mood: number;
    workHours: number;
    isPrivate: boolean;
    activities: string[];
    achievements: string[];
    energyLevel: number;
    productivity: number;
  }, diaryId?: string): Promise<DiaryRewardResult> {
    // 重複実行を防ぐため、同じ日記IDの場合はスキップ
    if (diaryId && this.processedDiaries.has(diaryId)) {
      return {
        badges: [],
        experience: 0,
        workCoins: 0,
        leveledUp: false,
        newLevel: 0,
        achievements: []
      };
    }

    // 日記IDを記録
    if (diaryId) {
      this.processedDiaries.add(diaryId);
    }
    const result: DiaryRewardResult = {
      badges: [],
      experience: 0,
      workCoins: 0,
      leveledUp: false,
      newLevel: 0,
      achievements: []
    };

    // 1. バッジチェック・付与
    const unlockedBadges = badgeManager.checkMemoBadges(!diaryData.isPrivate);
    result.badges = unlockedBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward
    }));

    // 2. 経験値計算
    const baseExperience = this.calculateDiaryExperience(diaryData);
    result.experience = baseExperience;

    // 3. ワークコイン計算
    result.workCoins = this.calculateDiaryWorkCoins(diaryData);

    // 4. キャラクターに経験値を追加
    const characterResult = characterManager.addExperience(baseExperience, diaryData.workHours);
    result.leveledUp = characterResult.leveledUp;
    result.newLevel = characterResult.newLevel;
    result.achievements = characterResult.achievements;

    // 5. ワークコインを付与
    if (result.workCoins > 0) {
      currencyManager.addCurrency(userId, 'work_coins', result.workCoins, '日記投稿', '日記投稿による報酬');
    }

    // 6. メモ履歴を記録（バッジシステム用）
    const memoId = `diary_${Date.now()}`;
    badgeManager.recordMemo(memoId, !diaryData.isPrivate);

    return result;
  }

  // 日記の経験値を計算
  private calculateDiaryExperience(diaryData: any): number {
    let experience = 10; // 基本経験値

    // 文字数によるボーナス
    const contentLength = diaryData.content.length;
    if (contentLength > 100) experience += 5;
    if (contentLength > 300) experience += 10;
    if (contentLength > 500) experience += 15;

    // 気分によるボーナス
    if (diaryData.mood >= 4) experience += 5;
    if (diaryData.mood >= 5) experience += 10;

    // 作業時間によるボーナス
    if (diaryData.workHours > 0) {
      experience += Math.floor(diaryData.workHours * 2);
    }

    // 活動項目によるボーナス
    if (diaryData.activities && diaryData.activities.length > 0) {
      experience += diaryData.activities.length * 2;
    }

    // 達成項目によるボーナス
    if (diaryData.achievements && diaryData.achievements.length > 0) {
      experience += diaryData.achievements.length * 5;
    }

    // エネルギー・生産性によるボーナス
    if (diaryData.energyLevel >= 4) experience += 3;
    if (diaryData.productivity >= 4) experience += 3;

    // 公開設定によるボーナス
    if (!diaryData.isPrivate) {
      experience += 5;
    }

    return Math.min(experience, 100); // 最大100経験値
  }

  // 日記のワークコインを計算
  private calculateDiaryWorkCoins(diaryData: any): number {
    let coins = 5; // 基本コイン

    // 文字数によるボーナス
    const contentLength = diaryData.content.length;
    if (contentLength > 100) coins += 2;
    if (contentLength > 300) coins += 5;
    if (contentLength > 500) coins += 8;

    // 気分によるボーナス
    if (diaryData.mood >= 4) coins += 3;
    if (diaryData.mood >= 5) coins += 5;

    // 作業時間によるボーナス
    if (diaryData.workHours > 0) {
      coins += Math.floor(diaryData.workHours * 3);
    }

    // 活動項目によるボーナス
    if (diaryData.activities && diaryData.activities.length > 0) {
      coins += diaryData.activities.length * 1;
    }

    // 達成項目によるボーナス
    if (diaryData.achievements && diaryData.achievements.length > 0) {
      coins += diaryData.achievements.length * 3;
    }

    // 公開設定によるボーナス
    if (!diaryData.isPrivate) {
      coins += 5;
    }

    return Math.min(coins, 50); // 最大50コイン
  }

  // 日記投稿の品質スコアを計算
  public calculateDiaryQuality(diaryData: any): {
    score: number;
    grade: 'C' | 'B' | 'A' | 'S';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // 文字数評価
    const contentLength = diaryData.content.length;
    if (contentLength >= 500) {
      score += 30;
      feedback.push('詳細な記録で素晴らしいです！');
    } else if (contentLength >= 300) {
      score += 20;
      feedback.push('充実した内容ですね！');
    } else if (contentLength >= 100) {
      score += 10;
      feedback.push('良い記録です！');
    }

    // 気分評価
    if (diaryData.mood >= 4) {
      score += 15;
      feedback.push('良い気分で記録できました！');
    }

    // 作業時間評価
    if (diaryData.workHours > 0) {
      score += 20;
      feedback.push('作業時間も記録できています！');
    }

    // 活動・達成項目評価
    if (diaryData.activities && diaryData.activities.length > 0) {
      score += 10;
      feedback.push('活動内容が詳しく記録されています！');
    }

    if (diaryData.achievements && diaryData.achievements.length > 0) {
      score += 15;
      feedback.push('達成したことを記録できています！');
    }

    // 公開設定評価
    if (!diaryData.isPrivate) {
      score += 10;
      feedback.push('他の人と共有できています！');
    }

    // グレード判定
    let grade: 'C' | 'B' | 'A' | 'S';
    if (score >= 80) grade = 'S';
    else if (score >= 60) grade = 'A';
    else if (score >= 40) grade = 'B';
    else grade = 'C';

    return { score, grade, feedback };
  }
}

export const diaryRewardManager = new DiaryRewardManager();
