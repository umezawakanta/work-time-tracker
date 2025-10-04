// 銀行口座残高管理マネージャー

import { 
  BankAccount, 
  BankTransaction, 
  BankAccountSummary, 
  BankAccountAlert, 
  BankAccountSettings,
  DEFAULT_BANK_ACCOUNT,
  DEFAULT_BANK_ACCOUNT_SETTINGS 
} from '../types/bankAccount';

export class BankAccountManager {
  private static instance: BankAccountManager;
  private bankAccounts: BankAccount[] = [];
  private bankTransactions: BankTransaction[] = [];
  private bankAccountSettings: BankAccountSettings[] = [];
  private bankAccountAlerts: BankAccountAlert[] = [];

  public static getInstance(): BankAccountManager {
    if (!BankAccountManager.instance) {
      BankAccountManager.instance = new BankAccountManager();
    }
    return BankAccountManager.instance;
  }

  // 銀行口座を取得または初期化
  public getBankAccount(userId: string, bankAccountId?: string): BankAccount | null {
    if (bankAccountId) {
      return this.bankAccounts.find(account => 
        account.id === bankAccountId && account.userId === userId
      ) || null;
    }
    
    // 最初のアクティブな口座を返す（複数口座対応の場合は変更が必要）
    return this.bankAccounts.find(account => 
      account.userId === userId && account.isActive
    ) || null;
  }

  // 銀行口座を作成
  public createBankAccount(
    userId: string, 
    accountData: Partial<BankAccount>
  ): BankAccount {
    const newAccount: BankAccount = {
      id: this.generateId(),
      userId,
      bankName: accountData.bankName || DEFAULT_BANK_ACCOUNT.bankName,
      branchName: accountData.branchName || DEFAULT_BANK_ACCOUNT.branchName,
      accountType: accountData.accountType || DEFAULT_BANK_ACCOUNT.accountType,
      accountNumber: accountData.accountNumber || '',
      accountHolderName: accountData.accountHolderName || '',
      currentBalance: accountData.currentBalance || 0,
      lastUpdated: new Date(),
      notes: accountData.notes || DEFAULT_BANK_ACCOUNT.notes,
      isActive: accountData.isActive !== undefined ? accountData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankAccounts.push(newAccount);
    this.saveToLocalStorage();
    return newAccount;
  }

  // 銀行口座を更新
  public updateBankAccount(
    bankAccountId: string, 
    updates: Partial<BankAccount>
  ): BankAccount | null {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    if (!account) return null;

    Object.assign(account, updates, { 
      updatedAt: new Date(),
      lastUpdated: new Date()
    });
    
    this.saveToLocalStorage();
    this.checkAlerts(account.userId, bankAccountId);
    
    return account;
  }

  // 銀行口座の残高を更新
  public updateBankAccountBalance(
    bankAccountId: string, 
    newBalance: number, 
    notes?: string
  ): BankAccount | null {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    if (!account) return null;

    const oldBalance = account.currentBalance;
    account.currentBalance = newBalance;
    account.lastUpdated = new Date();
    account.updatedAt = new Date();
    if (notes) {
      account.notes = notes;
    }
    
    // 調整取引を記録
    if (oldBalance !== newBalance) {
      this.addTransaction({
        userId: account.userId,
        bankAccountId,
        type: 'adjustment',
        amount: newBalance - oldBalance,
        description: notes || '残高調整',
        transactionDate: new Date(),
        balanceAfter: newBalance
      });
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(account.userId, bankAccountId);
    
    return account;
  }

  // 銀行取引を追加
  public addTransaction(transaction: Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>): BankTransaction {
    const newTransaction: BankTransaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankTransactions.push(newTransaction);
    
    // 銀行口座の残高を更新
    const account = this.bankAccounts.find(a => a.id === transaction.bankAccountId);
    if (account) {
      account.currentBalance = transaction.balanceAfter;
      account.lastUpdated = new Date();
      account.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(transaction.userId, transaction.bankAccountId);
    
    return newTransaction;
  }

  // 銀行出金を記録
  public recordWithdrawal(
    bankAccountId: string, 
    amount: number, 
    description: string, 
    category?: string,
    counterparty?: string
  ): BankTransaction | null {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    if (!account) return null;

    const newBalance = account.currentBalance - amount;
    
    return this.addTransaction({
      userId: account.userId,
      bankAccountId,
      type: 'withdrawal',
      amount: -amount, // 出金は負の値
      description,
      category,
      counterparty,
      transactionDate: new Date(),
      balanceAfter: newBalance
    });
  }

  // 銀行入金を記録
  public recordDeposit(
    bankAccountId: string, 
    amount: number, 
    description: string, 
    category?: string,
    counterparty?: string
  ): BankTransaction | null {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    if (!account) return null;

    const newBalance = account.currentBalance + amount;
    
    return this.addTransaction({
      userId: account.userId,
      bankAccountId,
      type: 'deposit',
      amount,
      description,
      category,
      counterparty,
      transactionDate: new Date(),
      balanceAfter: newBalance
    });
  }

  // 銀行口座サマリーを取得
  public getBankAccountSummary(userId: string): BankAccountSummary {
    const userAccounts = this.bankAccounts.filter(a => a.userId === userId && a.isActive);
    const userTransactions = this.bankTransactions.filter(t => t.userId === userId);
    
    const totalBalance = userAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
    
    const totalDeposits = userTransactions
      .filter(t => t.type === 'deposit' || t.type === 'transfer_in')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = Math.abs(userTransactions
      .filter(t => t.type === 'withdrawal' || t.type === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const lastTransaction = userTransactions
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime())[0];
    
    // 月間変化を計算
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyTransactions = userTransactions.filter(t => t.transactionDate >= oneMonthAgo);
    const monthlyChange = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalBalance,
      accountCount: userAccounts.length,
      totalDeposits,
      totalWithdrawals,
      monthlyChange,
      lastTransactionDate: lastTransaction?.transactionDate,
      accounts: userAccounts.map(account => ({
        accountId: account.id,
        bankName: account.bankName,
        branchName: account.branchName,
        accountType: account.accountType,
        balance: account.currentBalance,
        lastUpdated: account.lastUpdated
      }))
    };
  }

  // 取引履歴を取得
  public getTransactions(userId: string, bankAccountId?: string, limit?: number): BankTransaction[] {
    let userTransactions = this.bankTransactions.filter(t => t.userId === userId);
    
    if (bankAccountId) {
      userTransactions = userTransactions.filter(t => t.bankAccountId === bankAccountId);
    }
    
    const sortedTransactions = userTransactions
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
    
    return limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  }

  // 設定を取得または初期化
  public getSettings(userId: string): BankAccountSettings {
    let settings = this.bankAccountSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_BANK_ACCOUNT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.bankAccountSettings.push(settings);
      this.saveToLocalStorage();
    }
    
    return settings;
  }

  // 設定を更新
  public updateSettings(userId: string, updates: Partial<BankAccountSettings>): BankAccountSettings {
    const settings = this.getSettings(userId);
    Object.assign(settings, updates, { updatedAt: new Date() });
    this.saveToLocalStorage();
    return settings;
  }

  // アラートをチェック
  private checkAlerts(userId: string, bankAccountId: string): void {
    const account = this.bankAccounts.find(a => a.id === bankAccountId);
    const settings = this.getSettings(userId);
    
    if (!account || !settings.enableAlerts) return;
    
    // 低残高アラート
    if (account.currentBalance < settings.lowBalanceThreshold) {
      this.addAlert({
        userId,
        bankAccountId,
        type: 'low_balance',
        severity: account.currentBalance < settings.lowBalanceThreshold / 2 ? 'high' : 'medium',
        title: `${account.bankName}${account.branchName}の残高が少なくなっています`,
        message: `現在の残高: ${account.currentBalance.toLocaleString()}円（閾値: ${settings.lowBalanceThreshold.toLocaleString()}円）`,
        threshold: settings.lowBalanceThreshold,
        currentValue: account.currentBalance
      });
    }
    
    // 高出金アラート（今日の出金）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWithdrawals = this.bankTransactions
      .filter(t => t.userId === userId && 
                   t.bankAccountId === bankAccountId && 
                   (t.type === 'withdrawal' || t.type === 'transfer_out') && 
                   t.transactionDate >= today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (todayWithdrawals > settings.highWithdrawalThreshold) {
      this.addAlert({
        userId,
        bankAccountId,
        type: 'high_withdrawal',
        severity: todayWithdrawals > settings.highWithdrawalThreshold * 2 ? 'high' : 'medium',
        title: `${account.bankName}${account.branchName}の今日の出金が多くなっています`,
        message: `今日の出金: ${todayWithdrawals.toLocaleString()}円（閾値: ${settings.highWithdrawalThreshold.toLocaleString()}円）`,
        threshold: settings.highWithdrawalThreshold,
        currentValue: todayWithdrawals
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<BankAccountAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: BankAccountAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.bankAccountAlerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // アラートを取得
  public getAlerts(userId: string): BankAccountAlert[] {
    return this.bankAccountAlerts
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 未読アラート数を取得
  public getUnreadAlertsCount(userId: string): number {
    return this.getAlerts(userId).filter(a => !a.isRead).length;
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.bankAccountAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // データをlocalStorageに保存（機密情報は暗号化）
  private saveToLocalStorage(): void {
    // 機密情報を含むデータを暗号化して保存
    const encryptedBankAccounts = this.encryptData(this.bankAccounts);
    const encryptedBankTransactions = this.encryptData(this.bankTransactions);
    const encryptedBankAccountSettings = this.encryptData(this.bankAccountSettings);
    const encryptedBankAccountAlerts = this.encryptData(this.bankAccountAlerts);
    
    localStorage.setItem('bankAccounts', encryptedBankAccounts);
    localStorage.setItem('bankTransactions', encryptedBankTransactions);
    localStorage.setItem('bankAccountSettings', encryptedBankAccountSettings);
    localStorage.setItem('bankAccountAlerts', encryptedBankAccountAlerts);
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const accounts = localStorage.getItem('bankAccounts');
    const transactions = localStorage.getItem('bankTransactions');
    const settings = localStorage.getItem('bankAccountSettings');
    const alerts = localStorage.getItem('bankAccountAlerts');

    if (accounts) {
      try {
        // 有効なJSONかどうかをチェック
        if (accounts.startsWith('encrypted:') || !accounts.startsWith('[') && !accounts.startsWith('{')) {
          console.warn('Invalid bank accounts data in localStorage, clearing...');
          localStorage.removeItem('bankAccounts');
          this.bankAccounts = [];
        } else {
          this.bankAccounts = JSON.parse(accounts).map((account: any) => ({
            ...account,
            lastUpdated: new Date(account.lastUpdated),
            createdAt: new Date(account.createdAt),
            updatedAt: new Date(account.updatedAt)
          }));
        }
      } catch (error) {
        console.error('Error parsing bank accounts from localStorage:', error);
        localStorage.removeItem('bankAccounts');
        this.bankAccounts = [];
      }
    }

    if (transactions) {
      try {
        if (transactions.startsWith('encrypted:') || !transactions.startsWith('[') && !transactions.startsWith('{')) {
          console.warn('Invalid bank transactions data in localStorage, clearing...');
          localStorage.removeItem('bankTransactions');
          this.bankTransactions = [];
        } else {
          this.bankTransactions = JSON.parse(transactions).map((transaction: any) => ({
            ...transaction,
            transactionDate: new Date(transaction.transactionDate),
            createdAt: new Date(transaction.createdAt),
            updatedAt: new Date(transaction.updatedAt)
          }));
        }
      } catch (error) {
        console.error('Error parsing bank transactions from localStorage:', error);
        localStorage.removeItem('bankTransactions');
        this.bankTransactions = [];
      }
    }

    if (settings) {
      try {
        if (settings.startsWith('encrypted:') || !settings.startsWith('[') && !settings.startsWith('{')) {
          console.warn('Invalid bank account settings data in localStorage, clearing...');
          localStorage.removeItem('bankAccountSettings');
          this.bankAccountSettings = [];
        } else {
          this.bankAccountSettings = JSON.parse(settings).map((setting: any) => ({
            ...setting,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt)
          }));
        }
      } catch (error) {
        console.error('Error parsing bank account settings from localStorage:', error);
        localStorage.removeItem('bankAccountSettings');
        this.bankAccountSettings = [];
      }
    }

    if (alerts) {
      try {
        if (alerts.startsWith('encrypted:') || !alerts.startsWith('[') && !alerts.startsWith('{')) {
          console.warn('Invalid bank account alerts data in localStorage, clearing...');
          localStorage.removeItem('bankAccountAlerts');
          this.bankAccountAlerts = [];
        } else {
          this.bankAccountAlerts = JSON.parse(alerts).map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt)
          }));
        }
      } catch (error) {
        console.error('Error parsing bank account alerts from localStorage:', error);
        localStorage.removeItem('bankAccountAlerts');
        this.bankAccountAlerts = [];
      }
    }
  }

  // IDを生成
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 取引を削除
  public deleteTransaction(transactionId: string): boolean {
    const index = this.bankTransactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    const transaction = this.bankTransactions[index];
    this.bankTransactions.splice(index, 1);
    
    // 残高を再計算
    const accountTransactions = this.bankTransactions
      .filter(t => t.bankAccountId === transaction.bankAccountId)
      .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    
    let currentBalance = 0;
    accountTransactions.forEach(t => {
      currentBalance += t.amount;
    });
    
    const account = this.bankAccounts.find(a => a.id === transaction.bankAccountId);
    if (account) {
      account.currentBalance = currentBalance;
      account.lastUpdated = new Date();
      account.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    return true;
  }

  // 銀行口座を削除
  public deleteBankAccount(bankAccountId: string): boolean {
    const index = this.bankAccounts.findIndex(a => a.id === bankAccountId);
    if (index === -1) return false;

    this.bankAccounts.splice(index, 1);
    
    // 関連する取引も削除
    this.bankTransactions = this.bankTransactions.filter(t => t.bankAccountId !== bankAccountId);
    
    this.saveToLocalStorage();
    return true;
  }

  // データを暗号化（簡易的なBase64エンコーディング + キー）
  private encryptData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // 簡易的な暗号化（実際の本番環境ではより強力な暗号化を使用）
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));
      return `encrypted:${encoded}`;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return JSON.stringify(data);
    }
  }

  // データを復号化
  private decryptData(encryptedData: string): any {
    try {
      if (encryptedData.startsWith('encrypted:')) {
        const encoded = encryptedData.substring(10);
        const jsonString = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(jsonString);
      } else {
        // 古い形式のデータをそのまま解析
        return JSON.parse(encryptedData);
      }
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }
}
