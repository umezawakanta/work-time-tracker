// PayPayカード負債管理マネージャー

import { 
  PayPayCard, 
  PayPayCardTransaction, 
  PayPayCardSummary, 
  PayPayCardAlert, 
  PayPayCardSettings,
  PayPayInterestCalculation,
  PayPayPaymentSimulation,
  DEFAULT_PAYPAY_CARD,
  DEFAULT_PAYPAY_CARD_SETTINGS 
} from '../types/paypayCard';

export class PayPayCardManager {
  private static instance: PayPayCardManager;
  private paypayCards: PayPayCard[] = [];
  private paypayCardTransactions: PayPayCardTransaction[] = [];
  private paypayCardSettings: PayPayCardSettings[] = [];
  private paypayCardAlerts: PayPayCardAlert[] = [];

  public static getInstance(): PayPayCardManager {
    if (!PayPayCardManager.instance) {
      PayPayCardManager.instance = new PayPayCardManager();
    }
    return PayPayCardManager.instance;
  }

  // PayPayカードを取得または初期化
  public getPayPayCard(userId: string, paypayCardId?: string): PayPayCard | null {
    if (paypayCardId) {
      return this.paypayCards.find(card => 
        card.id === paypayCardId && card.userId === userId
      ) || null;
    }
    
    // 最初のアクティブなカードを返す（複数カード対応の場合は変更が必要）
    return this.paypayCards.find(card => 
      card.userId === userId && card.isActive
    ) || null;
  }

  // PayPayカードを作成
  public createPayPayCard(
    userId: string, 
    cardData: Partial<PayPayCard>
  ): PayPayCard {
    const creditLimit = cardData.creditLimit || 0;
    const currentBalance = cardData.currentBalance || 0;
    const availableCredit = creditLimit - currentBalance;

    const newCard: PayPayCard = {
      id: this.generateId(),
      userId,
      cardName: cardData.cardName || DEFAULT_PAYPAY_CARD.cardName,
      cardType: cardData.cardType || DEFAULT_PAYPAY_CARD.cardType,
      cardNumber: cardData.cardNumber || '',
      cardHolderName: cardData.cardHolderName || '',
      currentBalance,
      creditLimit,
      availableCredit,
      minimumPayment: cardData.minimumPayment || DEFAULT_PAYPAY_CARD.minimumPayment,
      interestRate: cardData.interestRate || DEFAULT_PAYPAY_CARD.interestRate,
      paymentDueDate: cardData.paymentDueDate,
      lastPaymentDate: cardData.lastPaymentDate,
      lastUpdated: new Date(),
      notes: cardData.notes || DEFAULT_PAYPAY_CARD.notes,
      isActive: cardData.isActive !== undefined ? cardData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.paypayCards.push(newCard);
    this.saveToLocalStorage();
    return newCard;
  }

  // PayPayカードを更新
  public updatePayPayCard(
    paypayCardId: string, 
    updates: Partial<PayPayCard>
  ): PayPayCard | null {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    if (!card) return null;

    // 利用可能残高を再計算
    if (updates.creditLimit !== undefined || updates.currentBalance !== undefined) {
      const creditLimit = updates.creditLimit !== undefined ? updates.creditLimit : card.creditLimit;
      const currentBalance = updates.currentBalance !== undefined ? updates.currentBalance : card.currentBalance;
      updates.availableCredit = creditLimit - currentBalance;
    }

    Object.assign(card, updates, { 
      updatedAt: new Date(),
      lastUpdated: new Date()
    });
    
    this.saveToLocalStorage();
    this.checkAlerts(card.userId, paypayCardId);
    
    return card;
  }

  // PayPayカードの残高を更新
  public updatePayPayCardBalance(
    paypayCardId: string, 
    newBalance: number, 
    notes?: string
  ): PayPayCard | null {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    if (!card) return null;

    const oldBalance = card.currentBalance;
    card.currentBalance = newBalance;
    card.availableCredit = card.creditLimit - newBalance;
    card.lastUpdated = new Date();
    card.updatedAt = new Date();
    if (notes) {
      card.notes = notes;
    }
    
    // 調整取引を記録
    if (oldBalance !== newBalance) {
      this.addTransaction({
        userId: card.userId,
        paypayCardId,
        type: 'adjustment',
        amount: newBalance - oldBalance,
        description: notes || '残高調整',
        transactionDate: new Date(),
        balanceAfter: newBalance
      });
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(card.userId, paypayCardId);
    
    return card;
  }

  // PayPayカード取引を追加
  public addTransaction(transaction: Omit<PayPayCardTransaction, 'id' | 'createdAt' | 'updatedAt'>): PayPayCardTransaction {
    const newTransaction: PayPayCardTransaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.paypayCardTransactions.push(newTransaction);
    
    // PayPayカードの残高を更新
    const card = this.paypayCards.find(c => c.id === transaction.paypayCardId);
    if (card) {
      card.currentBalance = transaction.balanceAfter;
      card.availableCredit = card.creditLimit - transaction.balanceAfter;
      card.lastUpdated = new Date();
      card.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    this.checkAlerts(transaction.userId, transaction.paypayCardId);
    
    return newTransaction;
  }

  // 支払いを記録
  public recordPayment(
    paypayCardId: string, 
    amount: number, 
    description: string, 
    category?: string
  ): PayPayCardTransaction | null {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    if (!card) return null;

    const newBalance = card.currentBalance - amount;
    
    return this.addTransaction({
      userId: card.userId,
      paypayCardId,
      type: 'payment',
      amount: -amount, // 支払いは負の値
      description,
      category,
      transactionDate: new Date(),
      balanceAfter: newBalance
    });
  }

  // 購入を記録
  public recordPurchase(
    paypayCardId: string, 
    amount: number, 
    description: string, 
    category?: string,
    merchant?: string,
    cashbackAmount?: number
  ): PayPayCardTransaction | null {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    if (!card) return null;

    const newBalance = card.currentBalance + amount;
    
    return this.addTransaction({
      userId: card.userId,
      paypayCardId,
      type: 'purchase',
      amount,
      description,
      category,
      merchant,
      transactionDate: new Date(),
      balanceAfter: newBalance,
      cashbackAmount
    });
  }

  // キャッシュバックを記録
  public recordCashback(
    paypayCardId: string, 
    amount: number, 
    description: string, 
    category?: string
  ): PayPayCardTransaction | null {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    if (!card) return null;

    const newBalance = card.currentBalance - amount; // キャッシュバックは残高を減らす
    
    return this.addTransaction({
      userId: card.userId,
      paypayCardId,
      type: 'cashback',
      amount: -amount, // キャッシュバックは負の値
      description,
      category,
      transactionDate: new Date(),
      balanceAfter: newBalance,
      cashbackAmount: amount
    });
  }

  // 利息を計算
  public calculateInterest(calculation: Omit<PayPayInterestCalculation, 'interestAmount'>): PayPayInterestCalculation {
    const dailyRate = calculation.interestRate / 100 / 365;
    const interestAmount = calculation.principal * dailyRate * calculation.days;
    
    return {
      ...calculation,
      interestAmount: Math.round(interestAmount)
    };
  }

  // 支払いシミュレーション
  public simulatePayment(
    principal: number,
    monthlyPayment: number,
    interestRate: number
  ): PayPayPaymentSimulation {
    const monthlyRate = interestRate / 100 / 12;
    const schedule: PayPayPaymentSimulation['schedule'] = [];
    
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

  // PayPayカードサマリーを取得
  public getPayPayCardSummary(userId: string): PayPayCardSummary {
    const userCards = this.paypayCards.filter(c => c.userId === userId && c.isActive);
    const userTransactions = this.paypayCardTransactions.filter(t => t.userId === userId);
    
    const totalDebt = userCards.reduce((sum, card) => sum + card.currentBalance, 0);
    const totalCreditLimit = userCards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalAvailableCredit = userCards.reduce((sum, card) => sum + card.availableCredit, 0);
    
    const totalPurchases = userTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = Math.abs(userTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const totalCashback = Math.abs(userTransactions
      .filter(t => t.type === 'cashback')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const averageInterestRate = userCards.length > 0 
      ? userCards.reduce((sum, card) => sum + card.interestRate, 0) / userCards.length
      : 0;
    
    const nextPaymentDate = userCards
      .filter(card => card.paymentDueDate)
      .sort((a, b) => (a.paymentDueDate?.getTime() || 0) - (b.paymentDueDate?.getTime() || 0))[0]?.paymentDueDate;
    
    return {
      totalDebt,
      totalCreditLimit,
      totalAvailableCredit,
      cardCount: userCards.length,
      totalPurchases,
      totalPayments,
      totalCashback,
      averageInterestRate,
      nextPaymentDate,
      cards: userCards.map(card => ({
        cardId: card.id,
        cardName: card.cardName,
        cardType: card.cardType,
        balance: card.currentBalance,
        creditLimit: card.creditLimit,
        availableCredit: card.availableCredit,
        interestRate: card.interestRate,
        paymentDueDate: card.paymentDueDate
      }))
    };
  }

  // 取引履歴を取得
  public getTransactions(userId: string, paypayCardId?: string, limit?: number): PayPayCardTransaction[] {
    let userTransactions = this.paypayCardTransactions.filter(t => t.userId === userId);
    
    if (paypayCardId) {
      userTransactions = userTransactions.filter(t => t.paypayCardId === paypayCardId);
    }
    
    const sortedTransactions = userTransactions
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
    
    return limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  }

  // 設定を取得または初期化
  public getSettings(userId: string): PayPayCardSettings {
    let settings = this.paypayCardSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        ...DEFAULT_PAYPAY_CARD_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.paypayCardSettings.push(settings);
      this.saveToLocalStorage();
    }
    
    return settings;
  }

  // 設定を更新
  public updateSettings(userId: string, updates: Partial<PayPayCardSettings>): PayPayCardSettings {
    const settings = this.getSettings(userId);
    Object.assign(settings, updates, { updatedAt: new Date() });
    this.saveToLocalStorage();
    return settings;
  }

  // アラートをチェック
  private checkAlerts(userId: string, paypayCardId: string): void {
    const card = this.paypayCards.find(c => c.id === paypayCardId);
    const settings = this.getSettings(userId);
    
    if (!card || !settings.enableAlerts) return;
    
    // 高残高アラート
    if (card.currentBalance > settings.highBalanceThreshold) {
      this.addAlert({
        userId,
        paypayCardId,
        type: 'high_balance',
        severity: card.currentBalance > settings.highBalanceThreshold * 2 ? 'critical' : 'high',
        title: `${card.cardName}の残高が高くなっています`,
        message: `現在の残高: ${card.currentBalance.toLocaleString()}円（閾値: ${settings.highBalanceThreshold.toLocaleString()}円）`,
        threshold: settings.highBalanceThreshold,
        currentValue: card.currentBalance
      });
    }
    
    // 利用枠超過アラート
    const creditUsageRate = card.currentBalance / card.creditLimit;
    if (creditUsageRate > settings.creditLimitThreshold) {
      this.addAlert({
        userId,
        paypayCardId,
        type: 'credit_limit_exceeded',
        severity: creditUsageRate > 1 ? 'critical' : 'high',
        title: `${card.cardName}の利用枠が${Math.round(creditUsageRate * 100)}%に達しています`,
        message: `利用額: ${card.currentBalance.toLocaleString()}円 / 利用枠: ${card.creditLimit.toLocaleString()}円`,
        threshold: settings.creditLimitThreshold,
        currentValue: creditUsageRate
      });
    }
    
    // 支払期日アラート
    if (card.paymentDueDate) {
      const daysUntilPayment = Math.ceil((card.paymentDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment <= settings.paymentDueDays && daysUntilPayment >= 0) {
        this.addAlert({
          userId,
          paypayCardId,
          type: 'payment_due',
          severity: daysUntilPayment === 0 ? 'critical' : 'high',
          title: `${card.cardName}の支払期日が近づいています`,
          message: `支払期日: ${card.paymentDueDate.toLocaleDateString('ja-JP')}（${daysUntilPayment}日後）`,
          dueDate: card.paymentDueDate,
          currentValue: daysUntilPayment
        });
      }
    }
    
    // 延滞アラート
    if (card.paymentDueDate && card.paymentDueDate < new Date()) {
      const overdueDays = Math.ceil((new Date().getTime() - card.paymentDueDate.getTime()) / (1000 * 60 * 60 * 24));
      this.addAlert({
        userId,
        paypayCardId,
        type: 'overdue',
        severity: 'critical',
        title: `${card.cardName}の支払いが延滞しています`,
        message: `延滞日数: ${overdueDays}日（支払期日: ${card.paymentDueDate.toLocaleDateString('ja-JP')}）`,
        dueDate: card.paymentDueDate,
        currentValue: overdueDays
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<PayPayCardAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: PayPayCardAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.paypayCardAlerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // アラートを取得
  public getAlerts(userId: string): PayPayCardAlert[] {
    return this.paypayCardAlerts
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 未読アラート数を取得
  public getUnreadAlertsCount(userId: string): number {
    return this.getAlerts(userId).filter(a => !a.isRead).length;
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.paypayCardAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // データをlocalStorageに保存
  private saveToLocalStorage(): void {
    localStorage.setItem('paypayCards', JSON.stringify(this.paypayCards));
    localStorage.setItem('paypayCardTransactions', JSON.stringify(this.paypayCardTransactions));
    localStorage.setItem('paypayCardSettings', JSON.stringify(this.paypayCardSettings));
    localStorage.setItem('paypayCardAlerts', JSON.stringify(this.paypayCardAlerts));
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const cards = localStorage.getItem('paypayCards');
    const transactions = localStorage.getItem('paypayCardTransactions');
    const settings = localStorage.getItem('paypayCardSettings');
    const alerts = localStorage.getItem('paypayCardAlerts');

    if (cards) {
      this.paypayCards = JSON.parse(cards).map((card: any) => ({
        ...card,
        paymentDueDate: card.paymentDueDate ? new Date(card.paymentDueDate) : undefined,
        lastPaymentDate: card.lastPaymentDate ? new Date(card.lastPaymentDate) : undefined,
        lastUpdated: new Date(card.lastUpdated),
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt)
      }));
    }

    if (transactions) {
      this.paypayCardTransactions = JSON.parse(transactions).map((transaction: any) => ({
        ...transaction,
        transactionDate: new Date(transaction.transactionDate),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt)
      }));
    }

    if (settings) {
      this.paypayCardSettings = JSON.parse(settings).map((setting: any) => ({
        ...setting,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt)
      }));
    }

    if (alerts) {
      this.paypayCardAlerts = JSON.parse(alerts).map((alert: any) => ({
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
    const index = this.paypayCardTransactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    const transaction = this.paypayCardTransactions[index];
    this.paypayCardTransactions.splice(index, 1);
    
    // 残高を再計算
    const cardTransactions = this.paypayCardTransactions
      .filter(t => t.paypayCardId === transaction.paypayCardId)
      .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    
    let currentBalance = 0;
    cardTransactions.forEach(t => {
      currentBalance += t.amount;
    });
    
    const card = this.paypayCards.find(c => c.id === transaction.paypayCardId);
    if (card) {
      card.currentBalance = currentBalance;
      card.availableCredit = card.creditLimit - currentBalance;
      card.lastUpdated = new Date();
      card.updatedAt = new Date();
    }
    
    this.saveToLocalStorage();
    return true;
  }

  // PayPayカードを削除
  public deletePayPayCard(paypayCardId: string): boolean {
    const index = this.paypayCards.findIndex(c => c.id === paypayCardId);
    if (index === -1) return false;

    this.paypayCards.splice(index, 1);
    
    // 関連する取引も削除
    this.paypayCardTransactions = this.paypayCardTransactions.filter(t => t.paypayCardId !== paypayCardId);
    
    this.saveToLocalStorage();
    return true;
  }
}
