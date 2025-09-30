// カードローン負債管理マネージャー

import { 
  CardLoan, 
  CardLoanTransaction, 
  CardLoanSummary, 
  CardLoanAlert, 
  CardLoanSettings,
  InterestCalculation,
  RepaymentSimulation,
  DEFAULT_CARD_LOAN,
  DEFAULT_CARD_LOAN_SETTINGS 
} from '../types/cardLoan';

export class CardLoanManager {
  private static instance: CardLoanManager;
  private cardLoans: CardLoan[] = [];
  private cardLoanTransactions: CardLoanTransaction[] = [];
  private cardLoanSettings: CardLoanSettings[] = [];
  private cardLoanAlerts: CardLoanAlert[] = [];

  public static getInstance(): CardLoanManager {
    if (!CardLoanManager.instance) {
      CardLoanManager.instance = new CardLoanManager();
    }
    return CardLoanManager.instance;
  }

  // カードローンを取得または初期化
  public getCardLoan(userId: string, cardLoanId?: string): CardLoan | null {
    if (cardLoanId) {
      return this.cardLoans.find(loan => 
        loan.id === cardLoanId && loan.userId === userId
      ) || null;
    }
    
    // 最初のアクティブなローンを返す（複数ローン対応の場合は変更が必要）
    return this.cardLoans.find(loan => 
      loan.userId === userId && loan.isActive
    ) || null;
  }

  // カードローンを作成
  public createCardLoan(
    userId: string, 
    loanData: Partial<CardLoan>
  ): CardLoan {
    const newLoan: CardLoan = {
      id: this.generateId(),
      userId,
      bankName: loanData.bankName || DEFAULT_CARD_LOAN.bankName,
      branchName: loanData.branchName || DEFAULT_CARD_LOAN.branchName,
      loanType: loanData.loanType || DEFAULT_CARD_LOAN.loanType,
      loanName: loanData.loanName || DEFAULT_CARD_LOAN.loanName,
      accountNumber: loanData.accountNumber || '',
      accountHolderName: loanData.accountHolderName || '',
      currentBalance: loanData.currentBalance || 0,
      originalAmount: loanData.originalAmount || loanData.currentBalance || 0,
      interestRate: loanData.interestRate || DEFAULT_CARD_LOAN.interestRate,
      monthlyPayment: loanData.monthlyPayment || 0,
      lastPaymentDate: loanData.lastPaymentDate,
      nextPaymentDate: loanData.nextPaymentDate,
      lastUpdated: new Date(),
      notes: loanData.notes || DEFAULT_CARD_LOAN.notes,
      isActive: loanData.isActive !== undefined ? loanData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cardLoans.push(newLoan);
    this.saveToLocalStorage();
    return newLoan;
  }

  // カードローンを更新
  public updateCardLoan(
    cardLoanId: string, 
    updates: Partial<CardLoan>
  ): CardLoan | null {
    const loan = this.cardLoans.find(l => l.id === cardLoanId);
    if (!loan) return null;

    Object.assign(loan, updates, { 
      updatedAt: new Date(),
      lastUpdated: new Date()
    });
    
    this.saveToLocalStorage();
    this.checkAlerts(loan.userId, cardLoanId);
    
    return loan;
  }

  // カードローンの残高を更新
  public updateCardLoanBalance(
    cardLoanId: string, 
    newBalance: number, 
    notes?: string
  ): CardLoan | null {
    const loan = this.cardLoans.find(l => l.id === cardLoanId);
    if (!loan) return null;

    const oldBalance = loan.currentBalance;
    loan.currentBalance = newBalance;
    loan.lastUpdated = new Date();
    loan.updatedAt = new Date();
    if (notes) {
      loan.notes = notes;
    }
    
    // 調整取引を記録
    if (oldBalance !== newBalance) {
      this.addTransaction({
        userId: loan.userId,
        cardLoanId,
        type: 'adjustment',
        amount: newBalance - oldBalance,
        description: notes || '残高調整',
        transactionDate: new Date(),
        balanceAfter: newBalance
      });
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(loan.userId, cardLoanId);
    
    return loan;
  }

  // カードローン取引を追加
  public addTransaction(transaction: Omit<CardLoanTransaction, 'id' | 'createdAt' | 'updatedAt'>): CardLoanTransaction {
    const newTransaction: CardLoanTransaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cardLoanTransactions.push(newTransaction);
    
    // カードローンの残高を更新
    const loan = this.cardLoans.find(l => l.id === transaction.cardLoanId);
    if (loan) {
      loan.currentBalance = transaction.balanceAfter;
      loan.lastUpdated = new Date();
      loan.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(transaction.userId, transaction.cardLoanId);
    
    return newTransaction;
  }

  // 返済を記録
  public recordRepayment(
    cardLoanId: string, 
    amount: number, 
    description: string, 
    category?: string,
    principalAmount?: number,
    interestAmount?: number
  ): CardLoanTransaction | null {
    const loan = this.cardLoans.find(l => l.id === cardLoanId);
    if (!loan) return null;

    const newBalance = loan.currentBalance - amount;
    
    return this.addTransaction({
      userId: loan.userId,
      cardLoanId,
      type: 'repayment',
      amount: -amount, // 返済は負の値
      description,
      category,
      transactionDate: new Date(),
      balanceAfter: newBalance,
      principalAmount,
      interestAmount
    });
  }

  // 借入を記録
  public recordBorrowing(
    cardLoanId: string, 
    amount: number, 
    description: string, 
    category?: string
  ): CardLoanTransaction | null {
    const loan = this.cardLoans.find(l => l.id === cardLoanId);
    if (!loan) return null;

    const newBalance = loan.currentBalance + amount;
    
    return this.addTransaction({
      userId: loan.userId,
      cardLoanId,
      type: 'borrowing',
      amount,
      description,
      category,
      transactionDate: new Date(),
      balanceAfter: newBalance
    });
  }

  // 利息を計算
  public calculateInterest(calculation: Omit<InterestCalculation, 'interestAmount'>): InterestCalculation {
    const dailyRate = calculation.interestRate / 100 / 365;
    const interestAmount = calculation.principal * dailyRate * calculation.days;
    
    return {
      ...calculation,
      interestAmount: Math.round(interestAmount)
    };
  }

  // 返済シミュレーション
  public simulateRepayment(
    principal: number,
    monthlyPayment: number,
    interestRate: number
  ): RepaymentSimulation {
    const monthlyRate = interestRate / 100 / 12;
    const schedule: RepaymentSimulation['schedule'] = [];
    
    let balance = principal;
    let month = 0;
    let totalInterest = 0;
    
    while (balance > 0 && month < 300) { // 最大25年
      month++;
      const interest = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interest, balance);
      const actualPayment = principalPayment + interest;
      
      balance = Math.max(0, balance - principalPayment);
      totalInterest += interest;
      
      schedule.push({
        month,
        principal: principalPayment,
        interest,
        balance
      });
      
      if (balance <= 0) break;
    }
    
    return {
      monthlyPayment,
      totalMonths: month,
      totalInterest,
      totalAmount: principal + totalInterest,
      schedule
    };
  }

  // カードローンサマリーを取得
  public getCardLoanSummary(userId: string): CardLoanSummary {
    const userLoans = this.cardLoans.filter(l => l.userId === userId && l.isActive);
    const userTransactions = this.cardLoanTransactions.filter(t => t.userId === userId);
    
    const totalDebt = userLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    
    const totalRepaid = Math.abs(userTransactions
      .filter(t => t.type === 'repayment')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const monthlyTotalPayment = userLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    
    const averageInterestRate = userLoans.length > 0 
      ? userLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / userLoans.length
      : 0;
    
    const nextPaymentDate = userLoans
      .filter(loan => loan.nextPaymentDate)
      .sort((a, b) => (a.nextPaymentDate?.getTime() || 0) - (b.nextPaymentDate?.getTime() || 0))[0]?.nextPaymentDate;
    
    return {
      totalDebt,
      loanCount: userLoans.length,
      totalBorrowed,
      totalRepaid,
      monthlyTotalPayment,
      averageInterestRate,
      nextPaymentDate,
      loans: userLoans.map(loan => ({
        loanId: loan.id,
        bankName: loan.bankName,
        branchName: loan.branchName,
        loanType: loan.loanType,
        loanName: loan.loanName,
        balance: loan.currentBalance,
        monthlyPayment: loan.monthlyPayment,
        interestRate: loan.interestRate,
        nextPaymentDate: loan.nextPaymentDate
      }))
    };
  }

  // 取引履歴を取得
  public getTransactions(userId: string, cardLoanId?: string, limit?: number): CardLoanTransaction[] {
    let userTransactions = this.cardLoanTransactions.filter(t => t.userId === userId);
    
    if (cardLoanId) {
      userTransactions = userTransactions.filter(t => t.cardLoanId === cardLoanId);
    }
    
    const sortedTransactions = userTransactions
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
    
    return limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  }

  // 設定を取得または初期化
  public getSettings(userId: string): CardLoanSettings {
    let settings = this.cardLoanSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_CARD_LOAN_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.cardLoanSettings.push(settings);
      this.saveToLocalStorage();
    }
    
    return settings;
  }

  // 設定を更新
  public updateSettings(userId: string, updates: Partial<CardLoanSettings>): CardLoanSettings {
    const settings = this.getSettings(userId);
    Object.assign(settings, updates, { updatedAt: new Date() });
    this.saveToLocalStorage();
    return settings;
  }

  // アラートをチェック
  private checkAlerts(userId: string, cardLoanId: string): void {
    const loan = this.cardLoans.find(l => l.id === cardLoanId);
    const settings = this.getSettings(userId);
    
    if (!loan || !settings.enableAlerts) return;
    
    // 高負債アラート
    if (loan.currentBalance > settings.highDebtThreshold) {
      this.addAlert({
        userId,
        cardLoanId,
        type: 'high_debt',
        severity: loan.currentBalance > settings.highDebtThreshold * 2 ? 'critical' : 'high',
        title: `${loan.bankName}${loan.branchName}の負債が高くなっています`,
        message: `現在の残高: ${loan.currentBalance.toLocaleString()}円（閾値: ${settings.highDebtThreshold.toLocaleString()}円）`,
        threshold: settings.highDebtThreshold,
        currentValue: loan.currentBalance
      });
    }
    
    // 返済日アラート
    if (loan.nextPaymentDate) {
      const daysUntilPayment = Math.ceil((loan.nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment <= settings.paymentDueDays && daysUntilPayment >= 0) {
        this.addAlert({
          userId,
          cardLoanId,
          type: 'payment_due',
          severity: daysUntilPayment === 0 ? 'critical' : 'high',
          title: `${loan.bankName}${loan.branchName}の返済日が近づいています`,
          message: `返済予定日: ${loan.nextPaymentDate.toLocaleDateString('ja-JP')}（${daysUntilPayment}日後）`,
          dueDate: loan.nextPaymentDate,
          currentValue: daysUntilPayment
        });
      }
    }
    
    // 延滞アラート
    if (loan.nextPaymentDate && loan.nextPaymentDate < new Date()) {
      const overdueDays = Math.ceil((new Date().getTime() - loan.nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
      this.addAlert({
        userId,
        cardLoanId,
        type: 'overdue',
        severity: 'critical',
        title: `${loan.bankName}${loan.branchName}の返済が延滞しています`,
        message: `延滞日数: ${overdueDays}日（返済予定日: ${loan.nextPaymentDate.toLocaleDateString('ja-JP')}）`,
        dueDate: loan.nextPaymentDate,
        currentValue: overdueDays
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<CardLoanAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: CardLoanAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.cardLoanAlerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // アラートを取得
  public getAlerts(userId: string): CardLoanAlert[] {
    return this.cardLoanAlerts
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 未読アラート数を取得
  public getUnreadAlertsCount(userId: string): number {
    return this.getAlerts(userId).filter(a => !a.isRead).length;
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.cardLoanAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // データをlocalStorageに保存
  private saveToLocalStorage(): void {
    localStorage.setItem('cardLoans', JSON.stringify(this.cardLoans));
    localStorage.setItem('cardLoanTransactions', JSON.stringify(this.cardLoanTransactions));
    localStorage.setItem('cardLoanSettings', JSON.stringify(this.cardLoanSettings));
    localStorage.setItem('cardLoanAlerts', JSON.stringify(this.cardLoanAlerts));
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const loans = localStorage.getItem('cardLoans');
    const transactions = localStorage.getItem('cardLoanTransactions');
    const settings = localStorage.getItem('cardLoanSettings');
    const alerts = localStorage.getItem('cardLoanAlerts');

    if (loans) {
      this.cardLoans = JSON.parse(loans).map((loan: any) => ({
        ...loan,
        lastPaymentDate: loan.lastPaymentDate ? new Date(loan.lastPaymentDate) : undefined,
        nextPaymentDate: loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : undefined,
        lastUpdated: new Date(loan.lastUpdated),
        createdAt: new Date(loan.createdAt),
        updatedAt: new Date(loan.updatedAt)
      }));
    }

    if (transactions) {
      this.cardLoanTransactions = JSON.parse(transactions).map((transaction: any) => ({
        ...transaction,
        transactionDate: new Date(transaction.transactionDate),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt)
      }));
    }

    if (settings) {
      this.cardLoanSettings = JSON.parse(settings).map((setting: any) => ({
        ...setting,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt)
      }));
    }

    if (alerts) {
      this.cardLoanAlerts = JSON.parse(alerts).map((alert: any) => ({
        ...alert,
        dueDate: alert.dueDate ? new Date(alert.dueDate) : undefined,
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
    const index = this.cardLoanTransactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    const transaction = this.cardLoanTransactions[index];
    this.cardLoanTransactions.splice(index, 1);
    
    // 残高を再計算
    const loanTransactions = this.cardLoanTransactions
      .filter(t => t.cardLoanId === transaction.cardLoanId)
      .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    
    let currentBalance = 0;
    loanTransactions.forEach(t => {
      currentBalance += t.amount;
    });
    
    const loan = this.cardLoans.find(l => l.id === transaction.cardLoanId);
    if (loan) {
      loan.currentBalance = currentBalance;
      loan.lastUpdated = new Date();
      loan.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    return true;
  }

  // カードローンを削除
  public deleteCardLoan(cardLoanId: string): boolean {
    const index = this.cardLoans.findIndex(l => l.id === cardLoanId);
    if (index === -1) return false;

    this.cardLoans.splice(index, 1);
    
    // 関連する取引も削除
    this.cardLoanTransactions = this.cardLoanTransactions.filter(t => t.cardLoanId !== cardLoanId);
    
    this.saveToLocalStorage();
    return true;
  }
}
