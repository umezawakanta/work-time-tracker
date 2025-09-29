// 収入・支出投稿報酬管理ユーティリティ

import { badgeManager } from './badgeManager';
import { characterManager } from './characterManager';
import { currencyManager } from './currencyManager';

export interface IncomeExpenseRewardResult {
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

class IncomeExpenseRewardManager {
  private processedRecords: Set<string> = new Set();

  // 収入・支出投稿時の報酬を計算・付与
  public async processIncomeExpenseReward(recordData: {
    type: 'income' | 'expense';
    amount: number;
    notes: string;
    date: string;
  }, recordId?: string): Promise<IncomeExpenseRewardResult> {
    // 重複実行を防ぐため、同じ記録IDの場合はスキップ
    if (recordId && this.processedRecords.has(recordId)) {
      return {
        badges: [],
        experience: 0,
        workCoins: 0,
        leveledUp: false,
        newLevel: 0,
        achievements: []
      };
    }

    // 記録IDを記録
    if (recordId) {
      this.processedRecords.add(recordId);
    }

    const result: IncomeExpenseRewardResult = {
      badges: [],
      experience: 0,
      workCoins: 0,
      leveledUp: false,
      newLevel: 0,
      achievements: []
    };

    // 1. バッジチェック・付与
    const unlockedBadges = this.checkIncomeExpenseBadges(recordData);
    result.badges = unlockedBadges.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      xpReward: badge.xpReward
    }));

    // 2. 経験値計算
    const baseExperience = this.calculateIncomeExpenseExperience(recordData);
    result.experience = baseExperience;

    // 3. ワークコイン計算
    result.workCoins = this.calculateIncomeExpenseWorkCoins(recordData);

    // 4. キャラクターに経験値を追加
    const characterResult = characterManager.addExperience(baseExperience, 0);
    result.leveledUp = characterResult.leveledUp;
    result.newLevel = characterResult.newLevel;
    result.achievements = characterResult.achievements;

    // 5. ワークコインを付与
    if (result.workCoins > 0) {
      currencyManager.addCurrency('work_coins', result.workCoins, '収支記録', 'income_expense');
    }

    // 6. 収支履歴を記録（バッジシステム用）
    this.recordIncomeExpense(recordData, recordId);

    return result;
  }

  // 収入・支出関連のバッジをチェック
  private checkIncomeExpenseBadges(recordData: any): any[] {
    const unlockedBadges: any[] = [];

    // 初回収入バッジ
    if (recordData.type === 'income') {
      const firstIncomeBadge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'first_income');
      if (firstIncomeBadge && !badgeManager.isBadgeUnlocked(firstIncomeBadge.id)) {
        if (badgeManager.unlockBadge(firstIncomeBadge.id)) {
          unlockedBadges.push(firstIncomeBadge);
        }
      }
    }

    // 初回支出バッジ
    if (recordData.type === 'expense') {
      const firstExpenseBadge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'first_expense');
      if (firstExpenseBadge && !badgeManager.isBadgeUnlocked(firstExpenseBadge.id)) {
        if (badgeManager.unlockBadge(firstExpenseBadge.id)) {
          unlockedBadges.push(firstExpenseBadge);
        }
      }
    }

    // 大収入者バッジ（10万円以上）
    if (recordData.type === 'income' && recordData.amount >= 100000) {
      const bigEarnerBadge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'big_earner');
      if (bigEarnerBadge && !badgeManager.isBadgeUnlocked(bigEarnerBadge.id)) {
        if (badgeManager.unlockBadge(bigEarnerBadge.id)) {
          unlockedBadges.push(bigEarnerBadge);
        }
      }
    }

    // 累計記録バッジをチェック
    const cumulativeBadges = this.checkCumulativeBadges(recordData.type);
    unlockedBadges.push(...cumulativeBadges);

    return unlockedBadges;
  }

  // 累計記録バッジをチェック
  private checkCumulativeBadges(type: 'income' | 'expense'): any[] {
    const unlockedBadges: any[] = [];
    const recordCounts = this.getRecordCounts();

    if (type === 'income') {
      // 収入トラッカー（10回）
      if (recordCounts.income >= 10) {
        const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'income_tracker');
        if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
          unlockedBadges.push(badge);
        }
      }
    }

    if (type === 'expense') {
      // 支出トラッカー（10回）
      if (recordCounts.expense >= 10) {
        const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'expense_tracker');
        if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
          unlockedBadges.push(badge);
        }
      }

      // 予算意識者（10回の支出）
      if (recordCounts.expense >= 10) {
        const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'budget_conscious');
        if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
          unlockedBadges.push(badge);
        }
      }
    }

    // 財務マスター（50回の収支）
    const totalRecords = recordCounts.income + recordCounts.expense;
    if (totalRecords >= 50) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'financial_master');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    // 財務アナリスト（100回の収支）
    if (totalRecords >= 100) {
      const badge = badgeManager.getBadgesByCategory('finance').find(b => b.id === 'financial_analyst');
      if (badge && !badgeManager.isBadgeUnlocked(badge.id) && badgeManager.unlockBadge(badge.id)) {
        unlockedBadges.push(badge);
      }
    }

    return unlockedBadges;
  }

  // 収入・支出の経験値を計算
  private calculateIncomeExpenseExperience(recordData: any): number {
    let experience = 15; // 基本経験値

    // 金額によるボーナス
    if (recordData.amount >= 10000) experience += 5;
    if (recordData.amount >= 50000) experience += 10;
    if (recordData.amount >= 100000) experience += 20;

    // メモの長さによるボーナス
    if (recordData.notes && recordData.notes.length > 0) {
      experience += 5;
      if (recordData.notes.length > 50) experience += 5;
    }

    // 収入の場合は少し多めの経験値
    if (recordData.type === 'income') {
      experience += 5;
    }

    return Math.min(experience, 80); // 最大80経験値
  }

  // 収入・支出のワークコインを計算
  private calculateIncomeExpenseWorkCoins(recordData: any): number {
    let coins = 8; // 基本コイン

    // 金額によるボーナス
    if (recordData.amount >= 10000) coins += 3;
    if (recordData.amount >= 50000) coins += 5;
    if (recordData.amount >= 100000) coins += 10;

    // メモの長さによるボーナス
    if (recordData.notes && recordData.notes.length > 0) {
      coins += 2;
      if (recordData.notes.length > 50) coins += 3;
    }

    // 収入の場合は少し多めのコイン
    if (recordData.type === 'income') {
      coins += 2;
    }

    return Math.min(coins, 30); // 最大30コイン
  }

  // 記録数を取得
  private getRecordCounts(): { income: number; expense: number } {
    const recordHistory = JSON.parse(localStorage.getItem('incomeExpenseHistory') || '[]');
    
    return recordHistory.reduce((counts: any, record: any) => {
      if (record.type === 'income') counts.income++;
      else if (record.type === 'expense') counts.expense++;
      return counts;
    }, { income: 0, expense: 0 });
  }

  // 収支履歴を記録
  private recordIncomeExpense(recordData: any, recordId?: string): void {
    const recordHistory = JSON.parse(localStorage.getItem('incomeExpenseHistory') || '[]');
    recordHistory.push({
      type: recordData.type,
      amount: recordData.amount,
      id: recordId || `record_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('incomeExpenseHistory', JSON.stringify(recordHistory));
  }

  // 収入・支出の品質スコアを計算
  public calculateIncomeExpenseQuality(recordData: any): {
    score: number;
    grade: 'C' | 'B' | 'A' | 'S';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // 金額評価
    if (recordData.amount >= 100000) {
      score += 30;
      feedback.push('大きな金額の記録ですね！');
    } else if (recordData.amount >= 50000) {
      score += 20;
      feedback.push('中程度の金額を記録しました！');
    } else if (recordData.amount >= 10000) {
      score += 10;
      feedback.push('適切な金額を記録しています！');
    }

    // メモ評価
    if (recordData.notes && recordData.notes.length > 0) {
      score += 20;
      feedback.push('詳細なメモが記録されています！');
    }

    // 収入の場合はボーナス
    if (recordData.type === 'income') {
      score += 15;
      feedback.push('収入の記録は重要です！');
    } else {
      score += 10;
      feedback.push('支出の記録で予算管理ができています！');
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

export const incomeExpenseRewardManager = new IncomeExpenseRewardManager();
