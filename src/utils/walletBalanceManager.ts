// 財布の残高管理マネージャー

import {
  WalletBalance,
  WalletTransaction,
  WalletBalanceSummary,
  WalletBalanceAnalysis,
  WALLET_CATEGORIES,
  WALLET_INSIGHTS
} from '../types/walletBalance';

export class WalletBalanceManager {
  private static instance: WalletBalanceManager;
  private balances: WalletBalance[] = [];
  private transactions: WalletTransaction[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): WalletBalanceManager {
    if (!WalletBalanceManager.instance) {
      WalletBalanceManager.instance = new WalletBalanceManager();
    }
    return WalletBalanceManager.instance;
  }

  // サーバーからデータを読み込み
  public async loadFromServer(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found');
        return;
      }

      const response = await fetch('/api/wallet-balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.balances = data.balance ? [{
            id: 'default',
            userId,
            amount: data.balance.amount,
            currency: data.balance.currency || 'JPY',
            lastUpdated: new Date(data.balance.lastUpdated || Date.now()),
            notes: data.balance.notes,
            tags: data.balance.tags || []
          }] : [];
          
          this.transactions = (data.transactions || []).map((transaction: any) => ({
            id: transaction.id,
            walletId: 'default',
            userId,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            category: transaction.category,
            tags: transaction.tags || [],
            date: new Date(transaction.date),
            createdAt: new Date(transaction.date)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load wallet data from server:', error);
      this.balances = [];
      this.transactions = [];
    }
  }

  // ローカルストレージからデータを読み込み（フォールバック）
  public loadFromLocalStorage(): void {
    try {
      const balancesData = localStorage.getItem('walletBalances');
      if (balancesData) {
        this.balances = JSON.parse(balancesData).map((balance: any) => ({
          ...balance,
          lastUpdated: new Date(balance.lastUpdated)
        }));
      }

      const transactionsData = localStorage.getItem('walletTransactions');
      if (transactionsData) {
        this.transactions = JSON.parse(transactionsData).map((transaction: any) => ({
          ...transaction,
          date: new Date(transaction.date)
        }));
      }
    } catch (error) {
      console.error('Failed to load wallet data from localStorage:', error);
      this.balances = [];
      this.transactions = [];
    }
  }

  // サーバーにデータを保存
  public async saveToServer(userId: string, data: any, type: 'balance' | 'transaction'): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found');
        return false;
      }

      const url = '/api/wallet-balance';
      const method = type === 'balance' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // サーバーから最新データを再読み込み
          await this.loadFromServer(userId);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to save wallet data to server:', error);
      return false;
    }
  }

  // ローカルストレージにデータを保存
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('walletBalances', JSON.stringify(this.balances));
      localStorage.setItem('walletTransactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save wallet data to localStorage:', error);
    }
  }

  // 財布の残高を取得
  public getWalletBalance(userId: string): WalletBalance | null {
    return this.balances.find(balance => balance.userId === userId) || null;
  }

  // 財布の残高を設定・更新
  public setWalletBalance(userId: string, amount: number, notes?: string, tags?: string[]): WalletBalance {
    const existingBalance = this.getWalletBalance(userId);
    
    if (existingBalance) {
      // 既存の残高を更新
      existingBalance.amount = amount;
      existingBalance.lastUpdated = new Date();
      existingBalance.notes = notes;
      existingBalance.tags = tags;
    } else {
      // 新しい残高を作成
      const newBalance: WalletBalance = {
        id: `wallet_${Date.now()}`,
        userId,
        amount,
        currency: 'JPY',
        lastUpdated: new Date(),
        notes,
        tags
      };
      this.balances.push(newBalance);
    }

    this.saveToLocalStorage();
    return this.getWalletBalance(userId)!;
  }

  // 取引を追加
  public addTransaction(
    userId: string,
    walletId: string,
    type: 'income' | 'expense',
    amount: number,
    description: string,
    category: string,
    tags?: string[]
  ): WalletTransaction {
    const transaction: WalletTransaction = {
      id: `transaction_${Date.now()}`,
      userId,
      walletId,
      type,
      amount,
      description,
      category,
      date: new Date(),
      tags
    };

    this.transactions.push(transaction);

    // 残高を更新
    const balance = this.getWalletBalance(userId);
    if (balance) {
      const newAmount = type === 'income' 
        ? balance.amount + amount 
        : balance.amount - amount;
      this.setWalletBalance(userId, newAmount, balance.notes, balance.tags);
    }

    this.saveToLocalStorage();
    return transaction;
  }

  // 取引履歴を取得
  public getTransactions(userId: string, limit?: number): WalletTransaction[] {
    const userTransactions = this.transactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  // 残高サマリーを生成
  public getWalletBalanceSummary(userId: string): WalletBalanceSummary {
    const balance = this.getWalletBalance(userId);
    const userTransactions = this.getTransactions(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = userTransactions.filter(t => t.date >= startOfMonth);

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const daysInMonth = now.getDate();
    const averageDailyIncome = totalIncome / daysInMonth;
    const averageDailyExpense = totalExpense / daysInMonth;

    const lastTransaction = userTransactions[0];

    return {
      currentBalance: balance?.amount || 0,
      totalIncome,
      totalExpense,
      transactionCount: userTransactions.length,
      lastTransactionDate: lastTransaction?.date,
      averageDailyExpense,
      averageDailyIncome
    };
  }

  // 残高分析を生成
  public generateWalletBalanceAnalysis(userId: string): WalletBalanceAnalysis {
    const summary = this.getWalletBalanceSummary(userId);
    const userTransactions = this.getTransactions(userId);

    // 日別トレンド
    const dailyTrends = this.generateDailyTrends(userTransactions);
    const weeklyTrends = this.generateWeeklyTrends(userTransactions);
    const monthlyTrends = this.generateMonthlyTrends(userTransactions);

    // インサイトを生成
    const insights = this.generateInsights(summary, userTransactions);

    return {
      balance: summary,
      trends: {
        daily: dailyTrends,
        weekly: weeklyTrends,
        monthly: monthlyTrends
      },
      insights
    };
  }

  // 日別トレンドを生成
  private generateDailyTrends(transactions: WalletTransaction[]): Array<{
    date: string;
    balance: number;
    income: number;
    expense: number;
  }> {
    const trends: { [key: string]: { balance: number; income: number; expense: number } } = {};
    
    // 過去30日分のデータを生成
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trends[dateStr] = { balance: 0, income: 0, expense: 0 };
    }

    // 取引データを日別に集計
    let runningBalance = 0;
    transactions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(transaction => {
        const dateStr = transaction.date.toISOString().split('T')[0];
        if (trends[dateStr]) {
          if (transaction.type === 'income') {
            runningBalance += transaction.amount;
            trends[dateStr].income += transaction.amount;
          } else {
            runningBalance -= transaction.amount;
            trends[dateStr].expense += transaction.amount;
          }
          trends[dateStr].balance = runningBalance;
        }
      });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  // 週別トレンドを生成
  private generateWeeklyTrends(transactions: WalletTransaction[]): Array<{
    week: string;
    balance: number;
    income: number;
    expense: number;
  }> {
    const trends: { [key: string]: { balance: number; income: number; expense: number } } = {};
    
    // 過去12週分のデータを生成
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekStr = this.getWeekString(date);
      trends[weekStr] = { balance: 0, income: 0, expense: 0 };
    }

    // 取引データを週別に集計
    let runningBalance = 0;
    transactions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(transaction => {
        const weekStr = this.getWeekString(transaction.date);
        if (trends[weekStr]) {
          if (transaction.type === 'income') {
            runningBalance += transaction.amount;
            trends[weekStr].income += transaction.amount;
          } else {
            runningBalance -= transaction.amount;
            trends[weekStr].expense += transaction.amount;
          }
          trends[weekStr].balance = runningBalance;
        }
      });

    return Object.entries(trends).map(([week, data]) => ({
      week,
      ...data
    }));
  }

  // 月別トレンドを生成
  private generateMonthlyTrends(transactions: WalletTransaction[]): Array<{
    month: string;
    balance: number;
    income: number;
    expense: number;
  }> {
    const trends: { [key: string]: { balance: number; income: number; expense: number } } = {};
    
    // 過去12ヶ月分のデータを生成
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends[monthStr] = { balance: 0, income: 0, expense: 0 };
    }

    // 取引データを月別に集計
    let runningBalance = 0;
    transactions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(transaction => {
        const monthStr = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
        if (trends[monthStr]) {
          if (transaction.type === 'income') {
            runningBalance += transaction.amount;
            trends[monthStr].income += transaction.amount;
          } else {
            runningBalance -= transaction.amount;
            trends[monthStr].expense += transaction.amount;
          }
          trends[monthStr].balance = runningBalance;
        }
      });

    return Object.entries(trends).map(([month, data]) => ({
      month,
      ...data
    }));
  }

  // 週の文字列を取得
  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  // 週番号を取得
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // インサイトを生成
  private generateInsights(summary: WalletBalanceSummary, transactions: WalletTransaction[]): Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }> {
    const insights = [];

    // 残高不足の警告
    if (summary.currentBalance < 1000) {
      insights.push({
        type: 'warning' as const,
        title: '残高不足',
        description: `現在の残高は${summary.currentBalance.toLocaleString()}円です。支出を見直しましょう。`,
        action: '支出を確認'
      });
    }

    // 支出パターンの分析
    if (summary.averageDailyExpense > summary.averageDailyIncome) {
      insights.push({
        type: 'info' as const,
        title: '支出超過',
        description: '1日の平均支出が平均収入を上回っています。',
        action: '支出を確認'
      });
    }

    // 節約成功の確認
    if (summary.totalExpense < summary.totalIncome * 0.8) {
      insights.push({
        type: 'success' as const,
        title: '節約成功',
        description: '今月は収入の80%以下に支出を抑えられています。',
        action: '成果を確認'
      });
    }

    return insights;
  }

  // データをクリア
  public clearData(userId: string): void {
    this.balances = this.balances.filter(balance => balance.userId !== userId);
    this.transactions = this.transactions.filter(transaction => transaction.userId !== userId);
    this.saveToLocalStorage();
  }
}
