import { ATMTransaction, ATMTransactionSummary, ATMTransactionAnalysis, ATM_TRANSACTION_TYPES } from '../types/atmTransaction';
import { apiFetch } from './apiClient';

export class ATMTransactionManager {
  private static instance: ATMTransactionManager;
  private atmTransactions: ATMTransaction[] = [];

  private constructor() {}

  public static getInstance(): ATMTransactionManager {
    if (!ATMTransactionManager.instance) {
      ATMTransactionManager.instance = new ATMTransactionManager();
    }
    return ATMTransactionManager.instance;
  }

  // サーバーからATM取引を読み込み
  public async loadFromServer(userId: string): Promise<void> {
    try {
      const response = await apiFetch(`/api/atm-transactions?userId=${userId}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transactions) {
          this.atmTransactions = data.transactions.map((transaction: any) => ({
            ...transaction,
            transactionDate: new Date(transaction.transactionDate),
            createdAt: new Date(transaction.createdAt),
            updatedAt: new Date(transaction.updatedAt)
          }));
        }
      }
    } catch (error) {
      console.error('ATM取引の読み込みエラー:', error);
    }
  }

  // サーバーにATM取引を保存
  public async saveToServer(userId: string, transaction: Omit<ATMTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const response = await apiFetch('/api/atm-transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...transaction,
          userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transaction) {
          this.atmTransactions.push({
            ...data.transaction,
            transactionDate: new Date(data.transaction.transactionDate),
            createdAt: new Date(data.transaction.createdAt),
            updatedAt: new Date(data.transaction.updatedAt)
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('ATM取引の保存エラー:', error);
      return false;
    }
  }

  // ATM取引を更新
  public async updateTransaction(transactionId: string, updates: Partial<Omit<ATMTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/atm-transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.transaction) {
          const index = this.atmTransactions.findIndex(t => t.id === transactionId);
          if (index !== -1) {
            this.atmTransactions[index] = {
              ...this.atmTransactions[index],
              ...data.transaction,
              transactionDate: new Date(data.transaction.transactionDate),
              updatedAt: new Date(data.transaction.updatedAt)
            };
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('ATM取引の更新エラー:', error);
      return false;
    }
  }

  // ATM取引を削除
  public async deleteTransaction(transactionId: string): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/atm-transactions/${transactionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.atmTransactions = this.atmTransactions.filter(t => t.id !== transactionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('ATM取引の削除エラー:', error);
      return false;
    }
  }

  // ATM取引を取得
  public getTransactions(userId: string, bankAccountId?: string): ATMTransaction[] {
    let transactions = this.atmTransactions.filter(t => t.userId === userId);
    if (bankAccountId) {
      transactions = transactions.filter(t => t.bankAccountId === bankAccountId);
    }
    return transactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  // ATM取引のサマリーを取得
  public getTransactionSummary(userId: string, bankAccountId?: string): ATMTransactionSummary {
    const transactions = this.getTransactions(userId, bankAccountId);
    const now = new Date();

    const totalDeposits = transactions
      .filter(t => t.transactionType === 'deposit' || t.transactionType === 'transfer_in' || t.transactionType === 'interest')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.transactionType === 'withdrawal' || t.transactionType === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = transactions
      .filter(t => t.transactionType === 'fee')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalDeposits - totalWithdrawals - totalFees;
    const transactionCount = transactions.length;
    const lastTransactionDate = transactions.length > 0 ? transactions[0].transactionDate : undefined;

    // 最も利用したATM
    const atmUsage: { [key: string]: number } = {};
    transactions.forEach(t => {
      const key = `${t.atmLocation} - ${t.atmBranch}`;
      atmUsage[key] = (atmUsage[key] || 0) + 1;
    });
    const mostUsedATM = Object.keys(atmUsage).reduce((a, b) => 
      atmUsage[a] > atmUsage[b] ? a : b, 'なし'
    );

    const averageTransactionAmount = transactionCount > 0 ? 
      transactions.reduce((sum, t) => sum + t.amount, 0) / transactionCount : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      totalFees,
      netAmount,
      transactionCount,
      lastTransactionDate,
      mostUsedATM,
      averageTransactionAmount: Math.round(averageTransactionAmount)
    };
  }

  // ATM取引の分析を取得
  public getTransactionAnalysis(userId: string, bankAccountId?: string): ATMTransactionAnalysis {
    const transactions = this.getTransactions(userId, bankAccountId);
    const now = new Date();

    // 月別トレンド（過去12ヶ月）
    const monthlyTrend: Array<{
      month: string;
      deposits: number;
      withdrawals: number;
      fees: number;
      netAmount: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.transactionDate >= monthStart && t.transactionDate <= monthEnd
      );

      const deposits = monthTransactions
        .filter(t => t.transactionType === 'deposit' || t.transactionType === 'transfer_in' || t.transactionType === 'interest')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawals = monthTransactions
        .filter(t => t.transactionType === 'withdrawal' || t.transactionType === 'transfer_out')
        .reduce((sum, t) => sum + t.amount, 0);

      const fees = monthTransactions
        .filter(t => t.transactionType === 'fee')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrend.push({
        month: `${monthStart.getFullYear()}/${monthStart.getMonth() + 1}`,
        deposits,
        withdrawals,
        fees,
        netAmount: deposits - withdrawals - fees
      });
    }

    // ATM利用状況
    const atmUsage: { [key: string]: { count: number; totalAmount: number } } = {};
    transactions.forEach(t => {
      const key = `${t.atmLocation} - ${t.atmBranch}`;
      if (!atmUsage[key]) {
        atmUsage[key] = { count: 0, totalAmount: 0 };
      }
      atmUsage[key].count += 1;
      atmUsage[key].totalAmount += t.amount;
    });

    const atmUsageArray = Object.keys(atmUsage).map(key => ({
      location: key.split(' - ')[0],
      branch: key.split(' - ')[1],
      transactionCount: atmUsage[key].count,
      totalAmount: atmUsage[key].totalAmount
    })).sort((a, b) => b.transactionCount - a.transactionCount);

    // 取引種別分布
    const typeDistribution: { [key: string]: { count: number; totalAmount: number } } = {};
    transactions.forEach(t => {
      if (!typeDistribution[t.transactionType]) {
        typeDistribution[t.transactionType] = { count: 0, totalAmount: 0 };
      }
      typeDistribution[t.transactionType].count += 1;
      typeDistribution[t.transactionType].totalAmount += t.amount;
    });

    const transactionTypeDistribution = Object.keys(typeDistribution).map(type => ({
      type: ATM_TRANSACTION_TYPES.find(t => t.value === type)?.label || type,
      count: typeDistribution[type].count,
      totalAmount: typeDistribution[type].totalAmount,
      percentage: Math.round((typeDistribution[type].count / transactions.length) * 100)
    }));

    // 利用パターンの判定
    const avgMonthlyTransactions = transactions.length / 12;
    let spendingPattern: 'conservative' | 'moderate' | 'frequent' | 'heavy' = 'conservative';
    
    if (avgMonthlyTransactions >= 20) {
      spendingPattern = 'heavy';
    } else if (avgMonthlyTransactions >= 10) {
      spendingPattern = 'frequent';
    } else if (avgMonthlyTransactions >= 5) {
      spendingPattern = 'moderate';
    }

    return {
      monthlyTrend,
      atmUsage: atmUsageArray,
      transactionTypeDistribution,
      spendingPattern
    };
  }
}
