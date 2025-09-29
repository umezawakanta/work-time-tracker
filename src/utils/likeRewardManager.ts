// いいね報酬管理ユーティリティ

import { badgeManager } from './badgeManager';
import { characterManager } from './characterManager';
import { currencyManager } from './currencyManager';

export interface LikeRewardResult {
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

class LikeRewardManager {
  // いいね時の報酬を計算・付与
  public async processLikeReward(authorId: string, memoId: string, likeCount: number): Promise<LikeRewardResult> {
    const result: LikeRewardResult = {
      badges: [],
      experience: 0,
      workCoins: 0,
      leveledUp: false,
      newLevel: 0,
      achievements: []
    };

    // 1. バッジチェック・付与
    const unlockedBadges = this.checkLikeBadges(authorId, likeCount);
    result.badges = unlockedBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward
    }));

    // 2. 経験値計算
    const baseExperience = this.calculateLikeExperience(likeCount);
    result.experience = baseExperience;

    // 3. ワークコイン計算
    result.workCoins = this.calculateLikeWorkCoins(likeCount);

    // 4. キャラクターに経験値を追加（投稿者のキャラクター）
    const characterResult = characterManager.addExperience(baseExperience, 0);
    result.leveledUp = characterResult.leveledUp;
    result.newLevel = characterResult.newLevel;
    result.achievements = characterResult.achievements;

    // 5. ワークコインを付与
    if (result.workCoins > 0) {
      currencyManager.addCurrency(authorId, 'work_coins', result.workCoins, 'いいね獲得', 'いいね獲得による報酬');
    }

    // 6. いいね履歴を記録
    this.recordLike(authorId, memoId, likeCount);

    return result;
  }

  // いいね関連のバッジをチェック
  private checkLikeBadges(authorId: string, likeCount: number): any[] {
    const unlockedBadges: any[] = [];
    const totalLikes = this.getTotalLikes(authorId);

    // 初回いいねバッジ
    if (totalLikes === 1) {
      const firstLikeBadge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'first_like');
      if (firstLikeBadge && !badgeManager.isBadgeUnlocked(firstLikeBadge.id)) {
        if (badgeManager.unlockBadge(firstLikeBadge.id)) {
          unlockedBadges.push(firstLikeBadge);
        }
      }
    }

    // 人気ライターバッジ（10個のいいね）
    if (totalLikes >= 10) {
      const badge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'liked_writer');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 人気作家バッジ（50個のいいね）
    if (totalLikes >= 50) {
      const badge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'popular_author');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // バイラルクリエイターバッジ（100個のいいね）
    if (totalLikes >= 100) {
      const badge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'viral_creator');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // いいねマグネットバッジ（1つのメモで10個のいいね）
    if (likeCount >= 10) {
      const badge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'like_magnet');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // コミュニティの寵児バッジ（5つのメモでそれぞれ5個以上のいいね）
    const popularMemos = this.getPopularMemos(authorId);
    if (popularMemos >= 5) {
      const badge = badgeManager.getBadgesByCategory('social').find(b => b.id === 'community_favorite');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // いいねの経験値を計算
  private calculateLikeExperience(likeCount: number): number {
    let experience = 5; // 基本経験値

    // いいね数によるボーナス
    if (likeCount >= 5) experience += 5;
    if (likeCount >= 10) experience += 10;
    if (likeCount >= 20) experience += 15;
    if (likeCount >= 50) experience += 25;

    return Math.min(experience, 60); // 最大60経験値
  }

  // いいねのワークコインを計算
  private calculateLikeWorkCoins(likeCount: number): number {
    let coins = 3; // 基本コイン

    // いいね数によるボーナス
    if (likeCount >= 5) coins += 2;
    if (likeCount >= 10) coins += 5;
    if (likeCount >= 20) coins += 8;
    if (likeCount >= 50) coins += 15;

    return Math.min(coins, 35); // 最大35コイン
  }

  // 総いいね数を取得
  private getTotalLikes(authorId: string): number {
    const likeHistory = JSON.parse(localStorage.getItem('likeHistory') || '[]');
    return likeHistory
      .filter((like: any) => like.authorId === authorId)
      .reduce((total: number, like: any) => total + like.likeCount, 0);
  }

  // 人気メモ数を取得（5個以上のいいねを獲得したメモ数）
  private getPopularMemos(authorId: string): number {
    const likeHistory = JSON.parse(localStorage.getItem('likeHistory') || '[]');
    const authorLikes = likeHistory.filter((like: any) => like.authorId === authorId);
    return authorLikes.filter((like: any) => like.likeCount >= 5).length;
  }

  // いいね履歴を記録
  private recordLike(authorId: string, memoId: string, likeCount: number): void {
    const likeHistory = JSON.parse(localStorage.getItem('likeHistory') || '[]');
    
    // 既存の記録を更新または新規追加
    const existingIndex = likeHistory.findIndex((like: any) => like.memoId === memoId);
    if (existingIndex >= 0) {
      likeHistory[existingIndex].likeCount = likeCount;
    } else {
      likeHistory.push({
        authorId,
        memoId,
        likeCount,
        timestamp: new Date().toISOString()
      });
    }
    
    localStorage.setItem('likeHistory', JSON.stringify(likeHistory));
  }

  // いいねの品質スコアを計算
  public calculateLikeQuality(likeCount: number): {
    score: number;
    grade: 'C' | 'B' | 'A' | 'S';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // いいね数評価
    if (likeCount >= 50) {
      score += 40;
      feedback.push('素晴らしい！多くの人に愛されています！');
    } else if (likeCount >= 20) {
      score += 30;
      feedback.push('とても人気があります！');
    } else if (likeCount >= 10) {
      score += 20;
      feedback.push('人気のメモですね！');
    } else if (likeCount >= 5) {
      score += 10;
      feedback.push('いい反応をいただいています！');
    } else if (likeCount >= 1) {
      score += 5;
      feedback.push('誰かが気に入ってくれました！');
    }

    // グレード判定
    let grade: 'C' | 'B' | 'A' | 'S';
    if (score >= 35) grade = 'S';
    else if (score >= 25) grade = 'A';
    else if (score >= 15) grade = 'B';
    else grade = 'C';

    return { score, grade, feedback };
  }
}

export const likeRewardManager = new LikeRewardManager();
