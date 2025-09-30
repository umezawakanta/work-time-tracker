import { characterManager } from './characterManager';
import { currencyManager } from './currencyManager';
import { badgeManager } from './badgeManager';
import { BADGES } from '../constants/badges';

export interface ReorderRewardResult {
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

class ReorderRewardManager {
  private processedReorders: Set<string> = new Set();

  // 並べ替え完了時の報酬を計算・付与
  public async processReorderReward(
    userId: string,
    reorderData: {
      fromOrder: string[];
      toOrder: string[];
      reorderCount: number;
    }
  ): Promise<ReorderRewardResult> {
    // 重複実行を防ぐため、同じ並べ替えの場合はスキップ
    const reorderKey = `${userId}_${reorderData.fromOrder.join(',')}_${reorderData.toOrder.join(',')}`;
    if (this.processedReorders.has(reorderKey)) {
      return {
        badges: [],
        experience: 0,
        workCoins: 0,
        leveledUp: false,
        newLevel: 0,
        achievements: []
      };
    }

    // 並べ替えキーを記録
    this.processedReorders.add(reorderKey);

    const result: ReorderRewardResult = {
      badges: [],
      experience: 0,
      workCoins: 0,
      leveledUp: false,
      newLevel: 0,
      achievements: []
    };

    // 1. バッジチェック・付与
    const unlockedBadges = this.checkReorderBadges(reorderData);
    result.badges = unlockedBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward
    }));

    // 2. 経験値計算
    const baseExperience = this.calculateReorderExperience(reorderData);
    result.experience = baseExperience;

    // 3. ワークコイン計算
    result.workCoins = this.calculateReorderWorkCoins(reorderData);

    // 4. キャラクターに経験値を追加
    const characterResult = characterManager.addExperience(baseExperience, 0);
    result.leveledUp = characterResult.leveledUp;
    result.newLevel = characterResult.newLevel;
    result.achievements = characterResult.achievements;

    // 5. ワークコインを付与
    if (result.workCoins > 0) {
      currencyManager.addCurrency(
        userId, 
        'work_coins', 
        result.workCoins, 
        '並べ替え完了', 
        '機能の並べ替えによる報酬'
      );
    }

    // 6. 並べ替え履歴を記録（バッジシステム用）
    this.recordReorderHistory(userId, reorderData);

    return result;
  }

  // 並べ替え関連のバッジをチェック
  private checkReorderBadges(reorderData: any): any[] {
    const unlockedBadges: any[] = [];
    const reorderHistory = this.getReorderHistory();

    // 初回並べ替えバッジ
    if (reorderHistory.totalReorders === 1) {
      const badge = BADGES.find(b => b.id === 'first_reorder');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    // 並べ替え回数バッジ
    if (reorderHistory.totalReorders === 5) {
      const badge = BADGES.find(b => b.id === 'reorder_5');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    if (reorderHistory.totalReorders === 10) {
      const badge = BADGES.find(b => b.id === 'reorder_10');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    if (reorderHistory.totalReorders === 25) {
      const badge = BADGES.find(b => b.id === 'reorder_25');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    // 連続並べ替えバッジ
    if (reorderHistory.consecutiveReorders >= 3) {
      const badge = BADGES.find(b => b.id === 'reorder_streak_3');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    // 完璧な並べ替えバッジ（すべての機能を並べ替えた場合）
    if (reorderData.toOrder.length >= 8) {
      const badge = BADGES.find(b => b.id === 'perfect_reorder');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id)) {
        badgeManager.unlockBadge(badge.id);
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // 並べ替えの経験値を計算
  private calculateReorderExperience(reorderData: any): number {
    let experience = 5; // 基本経験値

    // 並べ替え回数によるボーナス
    const reorderHistory = this.getReorderHistory();
    if (reorderHistory.totalReorders > 1) {
      experience += Math.min(reorderHistory.totalReorders * 2, 20);
    }

    // 並べ替えた機能数によるボーナス
    const movedFeatures = this.getMovedFeatures(reorderData.fromOrder, reorderData.toOrder);
    experience += movedFeatures.length * 3;

    // 連続並べ替えボーナス
    if (reorderHistory.consecutiveReorders >= 2) {
      experience += reorderHistory.consecutiveReorders * 5;
    }

    return Math.min(experience, 50); // 最大50経験値
  }

  // 並べ替えのワークコインを計算
  private calculateReorderWorkCoins(reorderData: any): number {
    let coins = 3; // 基本コイン

    // 並べ替え回数によるボーナス
    const reorderHistory = this.getReorderHistory();
    if (reorderHistory.totalReorders > 1) {
      coins += Math.min(reorderHistory.totalReorders, 10);
    }

    // 並べ替えた機能数によるボーナス
    const movedFeatures = this.getMovedFeatures(reorderData.fromOrder, reorderData.toOrder);
    coins += movedFeatures.length * 2;

    // 連続並べ替えボーナス
    if (reorderHistory.consecutiveReorders >= 2) {
      coins += reorderHistory.consecutiveReorders * 2;
    }

    return Math.min(coins, 25); // 最大25コイン
  }

  // 移動した機能を特定
  private getMovedFeatures(fromOrder: string[], toOrder: string[]): string[] {
    const movedFeatures: string[] = [];
    
    for (let i = 0; i < fromOrder.length; i++) {
      if (fromOrder[i] !== toOrder[i]) {
        movedFeatures.push(toOrder[i]);
      }
    }
    
    return movedFeatures;
  }

  // 並べ替え履歴を記録
  private recordReorderHistory(userId: string, reorderData: any): void {
    const history = this.getReorderHistory();
    
    history.totalReorders += 1;
    history.consecutiveReorders += 1;
    history.lastReorderDate = new Date().toISOString().split('T')[0];
    
    // 連続並べ替えのリセット（1日以上空いた場合）
    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(history.lastReorderDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      history.consecutiveReorders = 1;
    }
    
    localStorage.setItem('reorderHistory', JSON.stringify(history));
  }

  // 並べ替え履歴を取得
  private getReorderHistory(): {
    totalReorders: number;
    consecutiveReorders: number;
    lastReorderDate: string;
  } {
    const defaultHistory = {
      totalReorders: 0,
      consecutiveReorders: 0,
      lastReorderDate: new Date().toISOString().split('T')[0]
    };
    
    try {
      const stored = localStorage.getItem('reorderHistory');
      return stored ? JSON.parse(stored) : defaultHistory;
    } catch {
      return defaultHistory;
    }
  }
}

export const reorderRewardManager = new ReorderRewardManager();
