// 現金残高管理マネージャー

import { 
  CashBalance, 
  CashTransaction, 
  CashBalanceSummary, 
  CashBalanceAlert, 
  CashBalanceSettings,
  DEFAULT_CASH_BALANCE_SETTINGS 
} from '../types/cashBalance';

export class CashBalanceManager {
  private static instance: CashBalanceManager;
  private cashBalances: CashBalance[] = [];
  private cashTransactions: CashTransaction[] = [];
  private cashBalanceSettings: CashBalanceSettings[] = [];
  private cashBalanceAlerts: CashBalanceAlert[] = [];

  public static getInstance(): CashBalanceManager {
    if (!CashBalanceManager.instance) {
      CashBalanceManager.instance = new CashBalanceManager();
    }
    return CashBalanceManager.instance;
  }

  // 現金残高を取得または初期化
  public getCashBalance(userId: string): CashBalance {
    let balance = this.cashBalances.find(b => b.userId === userId);
    
    if (!balance) {
      // 初期残高を0円で作成
      balance = {
        id: this.generateId(),
        userId,
        amount: 0,
        lastUpdated: new Date(),
        notes: '初期残高',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.cashBalances.push(balance);
      this.saveToLocalStorage();
    }
    
    return balance;
  }

  // 現金残高を更新
  public updateCashBalance(
    userId: string, 
    newAmount: number, 
    notes?: string
  ): CashBalance {
    const balance = this.getCashBalance(userId);
    const oldAmount = balance.amount;
    
    balance.amount = newAmount;
    balance.lastUpdated = new Date();
    balance.updatedAt = new Date();
    if (notes) {
      balance.notes = notes;
    }
    
    // 調整取引を記録
    if (oldAmount !== newAmount) {
      this.addTransaction({
        userId,
        type: 'adjustment',
        amount: newAmount - oldAmount,
        description: notes || '残高調整',
        date: new Date(),
        balanceAfter: newAmount
      });
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(userId);
    
    return balance;
  }

  // 現金取引を追加
  public addTransaction(transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'updatedAt'>): CashTransaction {
    const newTransaction: CashTransaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cashTransactions.push(newTransaction);
    
    // 現金残高を更新
    const balance = this.getCashBalance(transaction.userId);
    balance.amount = transaction.balanceAfter;
    balance.lastUpdated = new Date();
    balance.updatedAt = new Date();
    
    this.saveToLocalStorage();
    this.checkAlerts(transaction.userId);
    
    return newTransaction;
  }

  // 現金支出を記録
  public recordExpense(
    userId: string, 
    amount: number, 
    description: string, 
    category?: string
  ): CashTransaction {
    const balance = this.getCashBalance(userId);
    const newBalance = balance.amount - amount;
    
    return this.addTransaction({
      userId,
      type: 'expense',
      amount: -amount, // 支出は負の値
      description,
      category,
      date: new Date(),
      balanceAfter: newBalance
    });
  }

  // 現金収入を記録
  public recordIncome(
    userId: string, 
    amount: number, 
    description: string, 
    category?: string
  ): CashTransaction {
    const balance = this.getCashBalance(userId);
    const newBalance = balance.amount + amount;
    
    return this.addTransaction({
      userId,
      type: 'income',
      amount,
      description,
      category,
      date: new Date(),
      balanceAfter: newBalance
    });
  }

  // 現金残高サマリーを取得
  public getCashBalanceSummary(userId: string): CashBalanceSummary {
    const balance = this.getCashBalance(userId);
    const userTransactions = this.cashTransactions.filter(t => t.userId === userId);
    
    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = Math.abs(userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const lastTransaction = userTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    // 週間変化を計算
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyTransactions = userTransactions.filter(t => t.date >= oneWeekAgo);
    const weeklyChange = weeklyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // 月間変化を計算
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyTransactions = userTransactions.filter(t => t.date >= oneMonthAgo);
    const monthlyChange = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      currentBalance: balance.amount,
      totalIncome,
      totalExpense,
      transactionCount: userTransactions.length,
      lastTransactionDate: lastTransaction?.date,
      weeklyChange,
      monthlyChange
    };
  }

  // 取引履歴を取得
  public getTransactions(userId: string, limit?: number): CashTransaction[] {
    const userTransactions = this.cashTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  // 設定を取得または初期化
  public getSettings(userId: string): CashBalanceSettings {
    let settings = this.cashBalanceSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_CASH_BALANCE_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.cashBalanceSettings.push(settings);
      this.saveToLocalStorage();
    }
    
    return settings;
  }

  // 設定を更新
  public updateSettings(userId: string, updates: Partial<CashBalanceSettings>): CashBalanceSettings {
    const settings = this.getSettings(userId);
    Object.assign(settings, updates, { updatedAt: new Date() });
    this.saveToLocalStorage();
    return settings;
  }

  // アラートをチェック
  private checkAlerts(userId: string): void {
    const balance = this.getCashBalance(userId);
    const settings = this.getSettings(userId);
    const summary = this.getCashBalanceSummary(userId);
    
    if (!settings.enableAlerts) return;
    
    // 低残高アラート
    if (balance.amount < settings.lowBalanceThreshold) {
      this.addAlert({
        userId,
        type: 'low_balance',
        severity: balance.amount < settings.lowBalanceThreshold / 2 ? 'high' : 'medium',
        title: '現金残高が少なくなっています',
        message: `現在の残高: ${balance.amount.toLocaleString()}円（閾値: ${settings.lowBalanceThreshold.toLocaleString()}円）`,
        threshold: settings.lowBalanceThreshold,
        currentValue: balance.amount
      });
    }
    
    // 高支出アラート（今日の支出）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExpenses = this.cashTransactions
      .filter(t => t.userId === userId && t.type === 'expense' && t.date >= today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (todayExpenses > settings.highExpenseThreshold) {
      this.addAlert({
        userId,
        type: 'high_expense',
        severity: todayExpenses > settings.highExpenseThreshold * 2 ? 'high' : 'medium',
        title: '今日の支出が多くなっています',
        message: `今日の支出: ${todayExpenses.toLocaleString()}円（閾値: ${settings.highExpenseThreshold.toLocaleString()}円）`,
        threshold: settings.highExpenseThreshold,
        currentValue: todayExpenses
      });
    }
    
    // 異常な活動アラート（急激な残高変化）
    if (Math.abs(summary.weeklyChange) > balance.amount * 0.5) {
      this.addAlert({
        userId,
        type: 'unusual_activity',
        severity: 'medium',
        title: '異常な現金活動が検出されました',
        message: `週間変化: ${summary.weeklyChange > 0 ? '+' : ''}${summary.weeklyChange.toLocaleString()}円`,
        currentValue: summary.weeklyChange
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<CashBalanceAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: CashBalanceAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.cashBalanceAlerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // アラートを取得
  public getAlerts(userId: string): CashBalanceAlert[] {
    return this.cashBalanceAlerts
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 未読アラート数を取得
  public getUnreadAlertsCount(userId: string): number {
    return this.getAlerts(userId).filter(a => !a.isRead).length;
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.cashBalanceAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // データをlocalStorageに保存
  private saveToLocalStorage(): void {
    localStorage.setItem('cashBalances', JSON.stringify(this.cashBalances));
    localStorage.setItem('cashTransactions', JSON.stringify(this.cashTransactions));
    localStorage.setItem('cashBalanceSettings', JSON.stringify(this.cashBalanceSettings));
    localStorage.setItem('cashBalanceAlerts', JSON.stringify(this.cashBalanceAlerts));
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const balances = localStorage.getItem('cashBalances');
    const transactions = localStorage.getItem('cashTransactions');
    const settings = localStorage.getItem('cashBalanceSettings');
    const alerts = localStorage.getItem('cashBalanceAlerts');

    if (balances) {
      this.cashBalances = JSON.parse(balances).map((balance: any) => ({
        ...balance,
        lastUpdated: new Date(balance.lastUpdated),
        createdAt: new Date(balance.createdAt),
        updatedAt: new Date(balance.updatedAt)
      }));
    }

    if (transactions) {
      this.cashTransactions = JSON.parse(transactions).map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt)
      }));
    }

    if (settings) {
      this.cashBalanceSettings = JSON.parse(settings).map((setting: any) => ({
        ...setting,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt)
      }));
    }

    if (alerts) {
      this.cashBalanceAlerts = JSON.parse(alerts).map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt)
      }));
    }
  }

  // IDを生成
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 取引を削除
  public deleteTransaction(transactionId: string): boolean {
    const index = this.cashTransactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    const transaction = this.cashTransactions[index];
    this.cashTransactions.splice(index, 1);
    
    // 残高を再計算
    const userTransactions = this.cashTransactions
      .filter(t => t.userId === transaction.userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let currentBalance = 0;
    userTransactions.forEach(t => {
      currentBalance += t.amount;
    });
    
    const balance = this.getCashBalance(transaction.userId);
    balance.amount = currentBalance;
    balance.lastUpdated = new Date();
    balance.updatedAt = new Date();
    
    this.saveToLocalStorage();
    return true;
  }
}
