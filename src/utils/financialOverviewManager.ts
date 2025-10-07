// 財務統合管理マネージャー

import { 
  FinancialOverview, 
  MonthlyFinancialData, 
  FinancialTrend, 
  FinancialAlert, 
  FinancialGoal,
  FinancialSummary,
  FinancialCategory,
  FinancialHealthScore,
  MonthlyAggregation,
  DEFAULT_FINANCIAL_ALERTS,
  FINANCIAL_CATEGORIES,
  TREND_PERIODS,
  CHART_COLORS
} from '../types/financialOverview';
import { CashBalanceManager } from './cashBalanceManager';
import { BankAccountManager } from './bankAccountManager';
import { CardLoanManager } from './cardLoanManager';
import { PayPayCardManager } from './paypayCardManager';
import { WalletBalanceManager } from './walletBalanceManager';
import { CreditCardManager } from './creditCardManager';

export class FinancialOverviewManager {
  private static instance: FinancialOverviewManager;
  private monthlyData: MonthlyFinancialData[] = [];
  private alerts: FinancialAlert[] = [];
  private goals: FinancialGoal[] = [];

  private cashBalanceManager = CashBalanceManager.getInstance();
  private bankAccountManager = BankAccountManager.getInstance();
  private cardLoanManager = CardLoanManager.getInstance();
  private paypayCardManager = PayPayCardManager.getInstance();
  private walletBalanceManager = WalletBalanceManager.getInstance();
  private creditCardManager = CreditCardManager.getInstance();

  public static getInstance(): FinancialOverviewManager {
    if (!FinancialOverviewManager.instance) {
      FinancialOverviewManager.instance = new FinancialOverviewManager();
    }
    return FinancialOverviewManager.instance;
  }

  // 財務概要を取得
  public getFinancialOverview(userId: string, walletBalanceHistory?: any[]): FinancialOverview {
    this.cashBalanceManager.loadFromLocalStorage();
    this.bankAccountManager.loadFromLocalStorage();
    this.cardLoanManager.loadFromLocalStorage();
    this.paypayCardManager.loadFromLocalStorage();
    this.walletBalanceManager.loadFromLocalStorage();
    this.creditCardManager.loadFromLocalStorage();

    const cashBalance = this.cashBalanceManager.getCashBalance(userId)?.currentBalance || 0;
    
    // 財布残高履歴から最新の値を取得、なければローカルデータから取得
    let walletBalance = 0;
    if (walletBalanceHistory && walletBalanceHistory.length > 0) {
      const latestHistory = walletBalanceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      walletBalance = latestHistory.amount || 0;
    } else {
      walletBalance = this.walletBalanceManager.getWalletBalance(userId)?.amount || 0;
    }
    
    const bankAccountBalance = this.bankAccountManager.getBankAccountSummary(userId).totalBalance;
    const cardLoanDebt = this.cardLoanManager.getCardLoanSummary(userId).totalDebt;
    const paypayCardDebt = this.paypayCardManager.getPayPayCardSummary(userId).totalDebt;
    const creditCardDebt = this.creditCardManager.getCreditCardSummary(userId).totalDebt;

    const totalAssets = cashBalance + walletBalance + bankAccountBalance;
    const totalLiabilities = cardLoanDebt + paypayCardDebt + creditCardDebt;
    const netWorth = totalAssets - totalLiabilities;

    return {
      userId,
      totalAssets,
      totalLiabilities,
      netWorth,
      cashBalance: cashBalance + walletBalance, // 現金と財布残高を合算
      bankAccountBalance,
      cardLoanDebt,
      paypayCardDebt,
      creditCardDebt,
      lastUpdated: new Date()
    };
  }

  // 月次財務データを記録
  public recordMonthlyData(userId: string): MonthlyFinancialData {
    const overview = this.getFinancialOverview(userId);
    const now = new Date();
    
    const monthlyData: MonthlyFinancialData = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      totalAssets: overview.totalAssets,
      totalLiabilities: overview.totalLiabilities,
      netWorth: overview.netWorth,
      cashBalance: overview.cashBalance,
      bankAccountBalance: overview.bankAccountBalance,
      cardLoanDebt: overview.cardLoanDebt,
      paypayCardDebt: overview.paypayCardDebt,
      creditCardDebt: overview.creditCardDebt,
      date: now
    };

    // 既存の同じ月のデータを更新または新規追加
    const existingIndex = this.monthlyData.findIndex(
      data => data.userId === userId && data.year === monthlyData.year && data.month === monthlyData.month
    );

    if (existingIndex >= 0) {
      this.monthlyData[existingIndex] = { ...monthlyData, userId };
    } else {
      this.monthlyData.push({ ...monthlyData, userId });
    }

    this.saveToLocalStorage();
    this.checkAlerts(userId);
    
    return monthlyData;
  }

  // 月次データを取得
  public getMonthlyData(userId: string, months: number = 12): MonthlyFinancialData[] {
    this.loadFromLocalStorage();
    
    const userData = this.monthlyData
      .filter(data => data.userId === userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (months === 0) {
      return userData;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return userData.filter(data => data.date >= cutoffDate);
  }

  // 財務トレンドを取得
  public getFinancialTrend(userId: string, period: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '6M'): FinancialTrend {
    const periodInfo = TREND_PERIODS.find(p => p.value === period) || TREND_PERIODS[2];
    const data = this.getMonthlyData(userId, periodInfo.months);
    
    if (data.length === 0) {
      return {
        period,
        data: [],
        totalChange: { assets: 0, liabilities: 0, netWorth: 0 },
        percentageChange: { assets: 0, liabilities: 0, netWorth: 0 },
        averageMonthlyChange: { assets: 0, liabilities: 0, netWorth: 0 }
      };
    }

    const firstData = data[0];
    const lastData = data[data.length - 1];

    const totalChange = {
      assets: lastData.totalAssets - firstData.totalAssets,
      liabilities: lastData.totalLiabilities - firstData.totalLiabilities,
      netWorth: lastData.netWorth - firstData.netWorth
    };

    const percentageChange = {
      assets: firstData.totalAssets !== 0 ? (totalChange.assets / firstData.totalAssets) * 100 : 0,
      liabilities: firstData.totalLiabilities !== 0 ? (totalChange.liabilities / firstData.totalLiabilities) * 100 : 0,
      netWorth: firstData.netWorth !== 0 ? (totalChange.netWorth / firstData.netWorth) * 100 : 0
    };

    const averageMonthlyChange = {
      assets: data.length > 1 ? totalChange.assets / (data.length - 1) : 0,
      liabilities: data.length > 1 ? totalChange.liabilities / (data.length - 1) : 0,
      netWorth: data.length > 1 ? totalChange.netWorth / (data.length - 1) : 0
    };

    return {
      period,
      data,
      totalChange,
      percentageChange,
      averageMonthlyChange
    };
  }

  // 財務カテゴリを取得
  public getFinancialCategories(userId: string): FinancialCategory[] {
    const overview = this.getFinancialOverview(userId);
    
    const categories: FinancialCategory[] = [
      {
        name: '現金',
        type: 'asset',
        amount: overview.cashBalance,
        percentage: overview.totalAssets > 0 ? (overview.cashBalance / overview.totalAssets) * 100 : 0,
        color: CHART_COLORS.cash,
        icon: '💰'
      },
      {
        name: '銀行口座',
        type: 'asset',
        amount: overview.bankAccountBalance,
        percentage: overview.totalAssets > 0 ? (overview.bankAccountBalance / overview.totalAssets) * 100 : 0,
        color: CHART_COLORS.bankAccount,
        icon: '🏦'
      },
      {
        name: 'カードローン',
        type: 'liability',
        amount: overview.cardLoanDebt,
        percentage: overview.totalLiabilities > 0 ? (overview.cardLoanDebt / overview.totalLiabilities) * 100 : 0,
        color: CHART_COLORS.cardLoan,
        icon: '💳'
      },
      {
        name: 'PayPayカード',
        type: 'liability',
        amount: overview.paypayCardDebt,
        percentage: overview.totalLiabilities > 0 ? (overview.paypayCardDebt / overview.totalLiabilities) * 100 : 0,
        color: CHART_COLORS.paypayCard,
        icon: '💎'
      }
    ];

    return categories.filter(category => category.amount > 0);
  }

  // 財務ヘルススコアを計算
  public calculateFinancialHealthScore(userId: string): FinancialHealthScore {
    const overview = this.getFinancialOverview(userId);
    const trend = this.getFinancialTrend(userId, '6M');
    
    // 負債対資産比率
    const debtToAssetRatio = overview.totalAssets > 0 ? overview.totalLiabilities / overview.totalAssets : 0;
    
    // 緊急資金比率（3ヶ月分の生活費を想定）
    const monthlyExpenses = Math.abs(trend.averageMonthlyChange.liabilities) || 100000; // デフォルト10万円
    const emergencyFundRatio = overview.cashBalance / (monthlyExpenses * 3);
    
    // 月次貯蓄率
    const monthlySavingsRate = trend.averageMonthlyChange.netWorth / (overview.totalAssets || 1);
    
    // 負債返済比率
    const debtServiceRatio = overview.totalLiabilities / (overview.totalAssets || 1);

    // スコア計算（0-100点）
    let score = 100;
    
    // 負債比率による減点
    if (debtToAssetRatio > 0.5) score -= 30;
    else if (debtToAssetRatio > 0.3) score -= 20;
    else if (debtToAssetRatio > 0.1) score -= 10;
    
    // 緊急資金比率による減点
    if (emergencyFundRatio < 1) score -= 25;
    else if (emergencyFundRatio < 3) score -= 15;
    else if (emergencyFundRatio < 6) score -= 5;
    
    // 貯蓄率による減点
    if (monthlySavingsRate < 0) score -= 20;
    else if (monthlySavingsRate < 0.05) score -= 10;
    else if (monthlySavingsRate > 0.1) score += 10;
    
    // 負債返済比率による減点
    if (debtServiceRatio > 0.8) score -= 25;
    else if (debtServiceRatio > 0.5) score -= 15;
    else if (debtServiceRatio > 0.3) score -= 5;

    score = Math.max(0, Math.min(100, score));

    // グレード決定
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    // 推奨事項
    const recommendations: string[] = [];
    if (debtToAssetRatio > 0.3) {
      recommendations.push('負債を減らすことを優先してください');
    }
    if (emergencyFundRatio < 3) {
      recommendations.push('緊急資金を3ヶ月分以上確保してください');
    }
    if (monthlySavingsRate < 0.1) {
      recommendations.push('月収の10%以上を貯蓄に回してください');
    }
    if (overview.netWorth < 0) {
      recommendations.push('純資産をプラスに転換する計画を立ててください');
    }

    return {
      score,
      grade,
      factors: {
        debtToAssetRatio,
        emergencyFundRatio,
        monthlySavingsRate,
        debtServiceRatio
      },
      recommendations
    };
  }

  // アラートをチェック
  private checkAlerts(userId: string): void {
    const overview = this.getFinancialOverview(userId);
    const healthScore = this.calculateFinancialHealthScore(userId);
    
    // 現金不足アラート
    if (overview.cashBalance < DEFAULT_FINANCIAL_ALERTS.low_cash) {
      this.addAlert({
        userId,
        type: 'low_cash',
        severity: overview.cashBalance < DEFAULT_FINANCIAL_ALERTS.low_cash / 2 ? 'critical' : 'high',
        title: '現金残高が少なくなっています',
        message: `現在の現金残高: ${overview.cashBalance.toLocaleString()}円（推奨: ${DEFAULT_FINANCIAL_ALERTS.low_cash.toLocaleString()}円以上）`,
        currentValue: overview.cashBalance,
        threshold: DEFAULT_FINANCIAL_ALERTS.low_cash
      });
    }

    // 高負債アラート
    if (overview.totalLiabilities > DEFAULT_FINANCIAL_ALERTS.high_debt) {
      this.addAlert({
        userId,
        type: 'high_debt',
        severity: overview.totalLiabilities > DEFAULT_FINANCIAL_ALERTS.high_debt * 2 ? 'critical' : 'high',
        title: '負債が高くなっています',
        message: `現在の負債総額: ${overview.totalLiabilities.toLocaleString()}円`,
        currentValue: overview.totalLiabilities,
        threshold: DEFAULT_FINANCIAL_ALERTS.high_debt
      });
    }

    // 純資産マイナスアラート
    if (overview.netWorth < 0) {
      this.addAlert({
        userId,
        type: 'negative_net_worth',
        severity: 'critical',
        title: '純資産がマイナスです',
        message: `現在の純資産: ${overview.netWorth.toLocaleString()}円`,
        currentValue: overview.netWorth
      });
    }

    // 財務ヘルススコアアラート
    if (healthScore.score < 50) {
      this.addAlert({
        userId,
        type: 'debt_increase',
        severity: healthScore.score < 30 ? 'critical' : 'high',
        title: '財務状況が悪化しています',
        message: `財務ヘルススコア: ${healthScore.score}点（${healthScore.grade}）`,
        currentValue: healthScore.score
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<FinancialAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: FinancialAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.alerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // アラートを取得
  public getAlerts(userId: string): FinancialAlert[] {
    this.loadFromLocalStorage();
    return this.alerts
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 未読アラート数を取得
  public getUnreadAlertsCount(userId: string): number {
    return this.getAlerts(userId).filter(a => !a.isRead).length;
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // 財務サマリーを取得
  public getFinancialSummary(userId: string, walletBalanceHistory?: any[]): FinancialSummary {
    const overview = this.getFinancialOverview(userId, walletBalanceHistory);
    const trend = this.getFinancialTrend(userId, '6M');
    const categories = this.getFinancialCategories(userId);
    const alerts = this.getAlerts(userId);
    const goals = this.getGoals(userId);
    const monthlyData = this.getMonthlyData(userId, 12);

    return {
      overview,
      trend,
      categories,
      alerts,
      goals,
      monthlyData
    };
  }

  // 目標を取得
  public getGoals(userId: string): FinancialGoal[] {
    this.loadFromLocalStorage();
    return this.goals
      .filter(g => g.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // 目標を作成
  public createGoal(userId: string, goal: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): FinancialGoal {
    const newGoal: FinancialGoal = {
      ...goal,
      id: this.generateId(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.goals.push(newGoal);
    this.saveToLocalStorage();
    return newGoal;
  }

  // 目標を更新
  public updateGoal(goalId: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return null;

    Object.assign(goal, updates, { updatedAt: new Date() });
    this.saveToLocalStorage();
    return goal;
  }

  // 目標を削除
  public deleteGoal(goalId: string): boolean {
    const index = this.goals.findIndex(g => g.id === goalId);
    if (index === -1) return false;

    this.goals.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // データをlocalStorageに保存
  private saveToLocalStorage(): void {
    localStorage.setItem('financialMonthlyData', JSON.stringify(this.monthlyData));
    localStorage.setItem('financialAlerts', JSON.stringify(this.alerts));
    localStorage.setItem('financialGoals', JSON.stringify(this.goals));
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const monthlyData = localStorage.getItem('financialMonthlyData');
    const alerts = localStorage.getItem('financialAlerts');
    const goals = localStorage.getItem('financialGoals');

    if (monthlyData) {
      this.monthlyData = JSON.parse(monthlyData).map((data: any) => ({
        ...data,
        date: new Date(data.date)
      }));
    }

    if (alerts) {
      this.alerts = JSON.parse(alerts).map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt)
      }));
    }

    if (goals) {
      this.goals = JSON.parse(goals).map((goal: any) => ({
        ...goal,
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt)
      }));
    }
  }

  // IDを生成
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 月次データを自動記録（毎月1日に実行）
  public autoRecordMonthlyData(userId: string): void {
    const now = new Date();
    const lastRecorded = this.monthlyData
      .filter(data => data.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    if (!lastRecorded || 
        lastRecorded.year !== now.getFullYear() || 
        lastRecorded.month !== now.getMonth() + 1) {
      this.recordMonthlyData(userId);
    }
  }
}
