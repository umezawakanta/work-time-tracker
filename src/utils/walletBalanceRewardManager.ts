// 財布残高更新報酬管理ユーティリティ

import { badgeManager } from './badgeManager';
import { characterManager } from './characterManager';
import { currencyManager } from './currencyManager';

export interface WalletBalanceRewardResult {
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

class WalletBalanceRewardManager {
  private processedUpdates: Set<string> = new Set();

  // 財布残高更新時の報酬を計算・付与
  public async processWalletBalanceReward(userId: string, updateData: {
    amount: number;
    notes: string;
    date: string;
    change: number;
  }, updateId?: string): Promise<WalletBalanceRewardResult> {
    // 重複実行を防ぐため、同じ更新IDの場合はスキップ
    if (updateId && this.processedUpdates.has(updateId)) {
      return {
        badges: [],
        experience: 0,
        workCoins: 0,
        leveledUp: false,
        newLevel: 0,
        achievements: []
      };
    }

    // 更新IDを記録
    if (updateId) {
      this.processedUpdates.add(updateId);
    }

    const result: WalletBalanceRewardResult = {
      badges: [],
      experience: 0,
      workCoins: 0,
      leveledUp: false,
      newLevel: 0,
      achievements: []
    };

    // 1. バッジチェック・付与
    const unlockedBadges = this.checkWalletBalanceBadges(updateData);
    result.badges = unlockedBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward
    }));

    // 2. 経験値計算
    const baseExperience = this.calculateWalletBalanceExperience(updateData);
    result.experience = baseExperience;

    // 3. ワークコイン計算
    result.workCoins = this.calculateWalletBalanceWorkCoins(updateData);

    // 4. キャラクターに経験値を追加
    const characterResult = characterManager.addExperience(baseExperience, 0);
    result.leveledUp = characterResult.leveledUp;
    result.newLevel = characterResult.newLevel;
    result.achievements = characterResult.achievements;

    // 5. ワークコインを付与
    if (result.workCoins > 0) {
      currencyManager.addCurrency(userId, 'work_coins', result.workCoins, '財布残高更新', '財布残高更新による報酬');
    }

    // 6. 更新履歴を記録（バッジシステム用）
    this.recordWalletBalanceUpdate(updateData, updateId);

    return result;
  }

  // 財布残高更新関連のバッジをチェック
  private checkWalletBalanceBadges(updateData: any): any[] {
    const unlockedBadges: any[] = [];

    // 初回財布残高更新バッジ
    const firstUpdateBadge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'first_wallet_update');
    if (firstUpdateBadge && !badgeManager.isBadgeUnlocked(firstUpdateBadge.id)) {
      if (badgeManager.unlockBadge(firstUpdateBadge.id)) {
        unlockedBadges.push(firstUpdateBadge);
      }
    }

    // 連続更新バッジ（7日連続）
    const consecutiveDays = this.getConsecutiveUpdateDays();
    if (consecutiveDays >= 7) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'wallet_streak_7');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 連続更新バッジ（30日連続）
    if (consecutiveDays >= 30) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'wallet_streak_30');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 財布管理マスター（100回更新）
    const updateCount = this.getUpdateCount();
    if (updateCount >= 100) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'wallet_master');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 高額残高バッジ（10万円以上）
    if (updateData.amount >= 100000) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'high_wallet_balance');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 残高増加バッジ（前日比1万円以上増加）
    if (updateData.change >= 10000) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'wallet_growth');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // 財布残高更新の経験値を計算
  private calculateWalletBalanceExperience(updateData: any): number {
    let experience = 10; // 基本経験値

    // 残高によるボーナス
    if (updateData.amount >= 50000) experience += 5;
    if (updateData.amount >= 100000) experience += 10;
    if (updateData.amount >= 500000) experience += 15;

    // 変化額によるボーナス
    if (Math.abs(updateData.change) >= 10000) experience += 5;
    if (Math.abs(updateData.change) >= 50000) experience += 10;

    // メモの長さによるボーナス
    if (updateData.notes && updateData.notes.length > 0) {
      experience += 3;
      if (updateData.notes.length > 50) experience += 2;
    }

    // 連続更新ボーナス
    const consecutiveDays = this.getConsecutiveUpdateDays();
    if (consecutiveDays >= 7) experience += 5;
    if (consecutiveDays >= 30) experience += 10;

    return Math.min(experience, 50); // 最大50経験値
  }

  // 財布残高更新のワークコインを計算
  private calculateWalletBalanceWorkCoins(updateData: any): number {
    let coins = 5; // 基本コイン

    // 残高によるボーナス
    if (updateData.amount >= 50000) coins += 2;
    if (updateData.amount >= 100000) coins += 3;
    if (updateData.amount >= 500000) coins += 5;

    // 変化額によるボーナス
    if (Math.abs(updateData.change) >= 10000) coins += 2;
    if (Math.abs(updateData.change) >= 50000) coins += 3;

    // メモの長さによるボーナス
    if (updateData.notes && updateData.notes.length > 0) {
      coins += 1;
      if (updateData.notes.length > 50) coins += 1;
    }

    // 連続更新ボーナス
    const consecutiveDays = this.getConsecutiveUpdateDays();
    if (consecutiveDays >= 7) coins += 3;
    if (consecutiveDays >= 30) coins += 5;

    return Math.min(coins, 20); // 最大20コイン
  }

  // 連続更新日数を取得
  private getConsecutiveUpdateDays(): number {
    const updateHistory = JSON.parse(localStorage.getItem('walletBalanceHistory') || '[]');
    if (updateHistory.length === 0) return 0;

    // 日付順でソート
    const sortedHistory = updateHistory.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let consecutiveDays = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const currentDate = new Date(sortedHistory[i].date);
      const nextDate = new Date(sortedHistory[i + 1].date);
      
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  // 更新回数を取得
  private getUpdateCount(): number {
    const updateHistory = JSON.parse(localStorage.getItem('walletBalanceHistory') || '[]');
    return updateHistory.length;
  }

  // 更新履歴を記録
  private recordWalletBalanceUpdate(updateData: any, updateId?: string): void {
    const updateHistory = JSON.parse(localStorage.getItem('walletBalanceHistory') || '[]');
    updateHistory.push({
      amount: updateData.amount,
      change: updateData.change,
      id: updateId || `update_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('walletBalanceHistory', JSON.stringify(updateHistory));
  }

  // 財布残高更新の品質スコアを計算
  public calculateWalletBalanceQuality(updateData: any): {
    score: number;
    grade: 'C' | 'B' | 'A' | 'S';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // 残高評価
    if (updateData.amount >= 500000) {
      score += 30;
      feedback.push('高額な残高を管理していますね！');
    } else if (updateData.amount >= 100000) {
      score += 20;
      feedback.push('しっかりとした残高管理ができています！');
    } else if (updateData.amount >= 50000) {
      score += 10;
      feedback.push('適切な残高管理をしています！');
    }

    // 変化額評価
    if (Math.abs(updateData.change) >= 50000) {
      score += 20;
      feedback.push('大きな変化を記録しました！');
    } else if (Math.abs(updateData.change) >= 10000) {
      score += 10;
      feedback.push('変化をしっかりと記録しています！');
    }

    // メモ評価
    if (updateData.notes && updateData.notes.length > 0) {
      score += 15;
      feedback.push('詳細なメモが記録されています！');
    }

    // 連続更新評価
    const consecutiveDays = this.getConsecutiveUpdateDays();
    if (consecutiveDays >= 30) {
      score += 25;
      feedback.push('30日連続更新！素晴らしい継続力です！');
    } else if (consecutiveDays >= 7) {
      score += 15;
      feedback.push('7日連続更新！継続できています！');
    }

    // グレード判定
    let grade: 'C' | 'B' | 'A' | 'S';
    if (score >= 70) grade = 'S';
    else if (score >= 50) grade = 'A';
    else if (score >= 30) grade = 'B';
    else grade = 'C';

    return { score, grade, feedback };
  }
}

export const walletBalanceRewardManager = new WalletBalanceRewardManager();
