// 仮想通貨管理ユーティリティ

import { VirtualCurrency, UserCurrency, CurrencyTransaction, CurrencyReward, CURRENCIES, CurrencyId } from '../types/currency';

class CurrencyManager {
  private userCurrencies: UserCurrency[] = [];
  private transactions: CurrencyTransaction[] = [];

  constructor() {
    this.loadUserCurrencies();
    this.loadTransactions();
  }

  // ユーザーの通貨データを読み込み
  private loadUserCurrencies(): void {
    const saved = localStorage.getItem('userCurrencies');
    if (saved) {
      try {
        this.userCurrencies = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load user currencies:', error);
        this.userCurrencies = [];
      }
    }
  }

  // 通貨データを保存
  private saveUserCurrencies(): void {
    localStorage.setItem('userCurrencies', JSON.stringify(this.userCurrencies));
  }

  // 取引履歴を読み込み
  private loadTransactions(): void {
    const saved = localStorage.getItem('currencyTransactions');
    if (saved) {
      try {
        this.transactions = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        this.transactions = [];
      }
    }
  }

  // 取引履歴を保存
  private saveTransactions(): void {
    localStorage.setItem('currencyTransactions', JSON.stringify(this.transactions));
  }

  // ユーザーの通貨残高を取得
  public getUserCurrency(userId: string, currencyId: CurrencyId): number {
    const userCurrency = this.userCurrencies.find(
      uc => uc.userId === userId && uc.currencyId === currencyId
    );
    return userCurrency ? userCurrency.amount : 0;
  }

  // 通貨を追加
  public addCurrency(userId: string, currencyId: CurrencyId, amount: number, source: string, description: string, metadata?: any): boolean {
    if (amount <= 0) return false;

    const existingCurrency = this.userCurrencies.find(
      uc => uc.userId === userId && uc.currencyId === currencyId
    );

    if (existingCurrency) {
      existingCurrency.amount += amount;
      existingCurrency.lastUpdated = new Date();
    } else {
      this.userCurrencies.push({
        userId,
        currencyId,
        amount,
        lastUpdated: new Date()
      });
    }

    // 取引履歴を追加
    const transaction: CurrencyTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      currencyId,
      amount,
      type: 'earn',
      source: source as any,
      description,
      timestamp: new Date(),
      metadata
    };

    this.transactions.push(transaction);

    this.saveUserCurrencies();
    this.saveTransactions();

    return true;
  }

  // 通貨を消費
  public spendCurrency(userId: string, currencyId: CurrencyId, amount: number, source: string, description: string, metadata?: any): boolean {
    if (amount <= 0) return false;

    const currentAmount = this.getUserCurrency(userId, currencyId);
    if (currentAmount < amount) return false;

    const existingCurrency = this.userCurrencies.find(
      uc => uc.userId === userId && uc.currencyId === currencyId
    );

    if (existingCurrency) {
      existingCurrency.amount -= amount;
      existingCurrency.lastUpdated = new Date();
    }

    // 取引履歴を追加
    const transaction: CurrencyTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      currencyId,
      amount: -amount,
      type: 'spend',
      source: source as any,
      description,
      timestamp: new Date(),
      metadata
    };

    this.transactions.push(transaction);

    this.saveUserCurrencies();
    this.saveTransactions();

    return true;
  }

  // 報酬を付与
  public grantReward(userId: string, rewards: CurrencyReward[], source: string, description: string, metadata?: any): boolean {
    let success = true;

    rewards.forEach(reward => {
      const added = this.addCurrency(
        userId,
        reward.currencyId as CurrencyId,
        reward.amount,
        source,
        `${reward.reason}: ${description}`,
        metadata
      );
      if (!added) success = false;
    });

    return success;
  }

  // 不具合報告の報酬を計算
  public calculateBugReportReward(reportType: 'bug' | 'feature' | 'improvement', severity: 'low' | 'medium' | 'high'): CurrencyReward[] {
    const baseRewards: { [key: string]: { [key: string]: number } } = {
      bug: { low: 10, medium: 25, high: 50 },
      feature: { low: 15, medium: 30, high: 60 },
      improvement: { low: 20, medium: 40, high: 80 }
    };

    const amount = baseRewards[reportType][severity] || 0;

    return [{
      currencyId: 'work_coins',
      amount,
      reason: `${reportType}報告報酬`,
      source: 'bug_report'
    }];
  }

  // 取引履歴を取得
  public getTransactions(userId: string, limit?: number): CurrencyTransaction[] {
    const userTransactions = this.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  // 通貨統計を取得
  public getCurrencyStats(userId: string): {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
  } {
    const userTransactions = this.transactions.filter(t => t.userId === userId);
    
    const totalEarned = userTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(userTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const currentBalance = this.getUserCurrency(userId, 'work_coins');

    return {
      totalEarned,
      totalSpent,
      currentBalance,
      transactionCount: userTransactions.length
    };
  }

  // 通貨をリセット（デバッグ用）
  public resetUserCurrency(userId: string): void {
    this.userCurrencies = this.userCurrencies.filter(uc => uc.userId !== userId);
    this.transactions = this.transactions.filter(t => t.userId !== userId);
    this.saveUserCurrencies();
    this.saveTransactions();
  }
}

export const currencyManager = new CurrencyManager();
