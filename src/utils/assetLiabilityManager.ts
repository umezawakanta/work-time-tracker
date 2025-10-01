// 資産・負債統合管理マネージャー

import { 
  Asset, 
  Liability, 
  AssetLiabilitySummary, 
  AssetLiabilityAlert, 
  AssetLiabilityGoal,
  AssetCategory,
  LiabilityCategory,
  NetWorthTrend,
  AssetLiabilityAnalysis
} from '../types/assetLiability';
import { CashBalanceManager } from './cashBalanceManager';
import { BankAccountManager } from './bankAccountManager';
import { CardLoanManager } from './cardLoanManager';
import { PayPayCardManager } from './paypayCardManager';

export class AssetLiabilityManager {
  private static instance: AssetLiabilityManager;
  private assets: Asset[] = [];
  private liabilities: Liability[] = [];
  private goals: AssetLiabilityGoal[] = [];
  private alerts: AssetLiabilityAlert[] = [];

  private cashBalanceManager = CashBalanceManager.getInstance();
  private bankAccountManager = BankAccountManager.getInstance();
  private cardLoanManager = CardLoanManager.getInstance();
  private paypayCardManager = PayPayCardManager.getInstance();

  public static getInstance(): AssetLiabilityManager {
    if (!AssetLiabilityManager.instance) {
      AssetLiabilityManager.instance = new AssetLiabilityManager();
    }
    return AssetLiabilityManager.instance;
  }

  // ローカルストレージからデータを読み込み
  public loadFromLocalStorage(): void {
    try {
      const assetsData = localStorage.getItem('assetLiability_assets');
      if (assetsData) {
        this.assets = JSON.parse(assetsData).map((asset: any) => ({
          ...asset,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt)
        }));
      }

      const liabilitiesData = localStorage.getItem('assetLiability_liabilities');
      if (liabilitiesData) {
        this.liabilities = JSON.parse(liabilitiesData).map((liability: any) => ({
          ...liability,
          createdAt: new Date(liability.createdAt),
          updatedAt: new Date(liability.updatedAt)
        }));
      }

      const goalsData = localStorage.getItem('assetLiability_goals');
      if (goalsData) {
        this.goals = JSON.parse(goalsData).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          targetDate: new Date(goal.targetDate)
        }));
      }

      const alertsData = localStorage.getItem('assetLiability_alerts');
      if (alertsData) {
        this.alerts = JSON.parse(alertsData).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt)
        }));
      }
    } catch (error) {
      console.error('資産・負債データの読み込みエラー:', error);
    }
  }

  // ローカルストレージにデータを保存
  public saveToLocalStorage(): void {
    try {
      localStorage.setItem('assetLiability_assets', JSON.stringify(this.assets));
      localStorage.setItem('assetLiability_liabilities', JSON.stringify(this.liabilities));
      localStorage.setItem('assetLiability_goals', JSON.stringify(this.goals));
      localStorage.setItem('assetLiability_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('資産・負債データの保存エラー:', error);
    }
  }

  // 資産を追加
  public addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset {
    const newAsset: Asset = {
      ...asset,
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.assets.push(newAsset);
    this.saveToLocalStorage();
    this.generateAlerts(asset.userId);
    return newAsset;
  }

  // 負債を追加
  public addLiability(liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Liability {
    const newLiability: Liability = {
      ...liability,
      id: `liability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.liabilities.push(newLiability);
    this.saveToLocalStorage();
    this.generateAlerts(liability.userId);
    return newLiability;
  }

  // 資産を更新
  public updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    const index = this.assets.findIndex(asset => asset.id === id);
    if (index === -1) return null;

    this.assets[index] = {
      ...this.assets[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToLocalStorage();
    this.generateAlerts(this.assets[index].userId);
    return this.assets[index];
  }

  // 負債を更新
  public updateLiability(id: string, updates: Partial<Liability>): Liability | null {
    const index = this.liabilities.findIndex(liability => liability.id === id);
    if (index === -1) return null;

    this.liabilities[index] = {
      ...this.liabilities[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToLocalStorage();
    this.generateAlerts(this.liabilities[index].userId);
    return this.liabilities[index];
  }

  // 資産を削除
  public deleteAsset(id: string): boolean {
    const index = this.assets.findIndex(asset => asset.id === id);
    if (index === -1) return false;

    this.assets.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // 負債を削除
  public deleteLiability(id: string): boolean {
    const index = this.liabilities.findIndex(liability => liability.id === id);
    if (index === -1) return false;

    this.liabilities.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // ユーザーの資産を取得
  public getAssets(userId: string): Asset[] {
    return this.assets.filter(asset => asset.userId === userId);
  }

  // ユーザーの負債を取得
  public getLiabilities(userId: string): Liability[] {
    return this.liabilities.filter(liability => liability.userId === userId);
  }

  // 統合された資産・負債サマリーを取得
  public getAssetLiabilitySummary(userId: string): AssetLiabilitySummary {
    this.cashBalanceManager.loadFromLocalStorage();
    this.bankAccountManager.loadFromLocalStorage();
    this.cardLoanManager.loadFromLocalStorage();
    this.paypayCardManager.loadFromLocalStorage();

    const userAssets = this.getAssets(userId);
    const userLiabilities = this.getLiabilities(userId);

    // 現金残高を資産として追加
    const cashBalance = this.cashBalanceManager.getCashBalance(userId);
    const totalCash = cashBalance.amount;

    // 銀行口座残高を資産として追加
    const bankAccount = this.bankAccountManager.getBankAccount(userId);
    const totalBankBalance = bankAccount ? bankAccount.balance : 0;

    // カードローン負債を負債として追加
    const cardLoan = this.cardLoanManager.getCardLoan(userId);
    const totalCardLoanDebt = cardLoan ? cardLoan.remainingBalance : 0;

    // PayPayカード負債を負債として追加
    const paypayCard = this.paypayCardManager.getPayPayCard(userId);
    const totalPayPayDebt = paypayCard ? paypayCard.remainingBalance : 0;

    // 資産合計
    const totalAssets = userAssets.reduce((sum, asset) => sum + asset.currentValue, 0) + 
                       totalCash + totalBankBalance;

    // 負債合計
    const totalLiabilities = userLiabilities.reduce((sum, liability) => sum + liability.currentBalance, 0) + 
                            totalCardLoanDebt + totalPayPayDebt;

    // 純資産
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown: {
        cash: totalCash,
        bankAccounts: totalBankBalance,
        investments: userAssets.filter(a => a.category === 'investment').reduce((sum, a) => sum + a.currentValue, 0),
        realEstate: userAssets.filter(a => a.category === 'real_estate').reduce((sum, a) => sum + a.currentValue, 0),
        other: userAssets.filter(a => a.category === 'other').reduce((sum, a) => sum + a.currentValue, 0)
      },
      liabilityBreakdown: {
        cardLoans: totalCardLoanDebt,
        paypayCards: totalPayPayDebt,
        mortgages: userLiabilities.filter(l => l.category === 'mortgage').reduce((sum, l) => sum + l.currentBalance, 0),
        personalLoans: userLiabilities.filter(l => l.category === 'personal_loan').reduce((sum, l) => sum + l.currentBalance, 0),
        other: userLiabilities.filter(l => l.category === 'other').reduce((sum, l) => sum + l.currentBalance, 0)
      },
      lastUpdated: new Date()
    };
  }

  // 純資産トレンドを取得
  public getNetWorthTrend(userId: string, months: number = 12): NetWorthTrend[] {
    const trends: NetWorthTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const summary = this.getAssetLiabilitySummary(userId);
      
      trends.push({
        date,
        netWorth: summary.netWorth,
        assets: summary.totalAssets,
        liabilities: summary.totalLiabilities
      });
    }

    return trends;
  }

  // 資産・負債分析を生成
  public generateAssetLiabilityAnalysis(userId: string): AssetLiabilityAnalysis {
    const summary = this.getAssetLiabilitySummary(userId);
    const trends = this.getNetWorthTrend(userId, 6);

    // 純資産の変化率を計算
    const netWorthChange = trends.length > 1 
      ? ((trends[trends.length - 1].netWorth - trends[0].netWorth) / Math.abs(trends[0].netWorth)) * 100
      : 0;

    // 資産の多様性スコアを計算
    const assetCategories = Object.keys(summary.assetBreakdown).length;
    const assetDiversificationScore = Math.min(assetCategories * 20, 100);

    // 負債比率を計算
    const debtToAssetRatio = summary.totalAssets > 0 
      ? (summary.totalLiabilities / summary.totalAssets) * 100 
      : 0;

    // 緊急資金比率を計算（現金 + 銀行口座 / 月支出の3ヶ月分）
    const emergencyFundRatio = summary.assetBreakdown.cash + summary.assetBreakdown.bankAccounts;
    // 仮の月支出として負債の1/12を使用
    const monthlyExpenses = summary.totalLiabilities / 12;
    const emergencyFundCoverage = monthlyExpenses > 0 ? emergencyFundRatio / (monthlyExpenses * 3) : 0;

    return {
      netWorthChange,
      assetDiversificationScore,
      debtToAssetRatio,
      emergencyFundCoverage,
      financialHealthScore: this.calculateFinancialHealthScore(summary, netWorthChange, assetDiversificationScore, debtToAssetRatio, emergencyFundCoverage),
      recommendations: this.generateRecommendations(summary, netWorthChange, debtToAssetRatio, emergencyFundCoverage),
      riskAssessment: this.assessRisk(summary, debtToAssetRatio, emergencyFundCoverage)
    };
  }

  // 財務健全性スコアを計算
  private calculateFinancialHealthScore(
    summary: AssetLiabilitySummary, 
    netWorthChange: number, 
    assetDiversificationScore: number, 
    debtToAssetRatio: number, 
    emergencyFundCoverage: number
  ): number {
    let score = 0;

    // 純資産の成長 (30点)
    if (netWorthChange > 10) score += 30;
    else if (netWorthChange > 5) score += 25;
    else if (netWorthChange > 0) score += 20;
    else if (netWorthChange > -5) score += 10;

    // 資産の多様性 (25点)
    score += (assetDiversificationScore / 100) * 25;

    // 負債比率 (25点)
    if (debtToAssetRatio < 20) score += 25;
    else if (debtToAssetRatio < 40) score += 20;
    else if (debtToAssetRatio < 60) score += 15;
    else if (debtToAssetRatio < 80) score += 10;

    // 緊急資金 (20点)
    if (emergencyFundCoverage >= 1) score += 20;
    else if (emergencyFundCoverage >= 0.5) score += 15;
    else if (emergencyFundCoverage >= 0.25) score += 10;

    return Math.min(Math.max(score, 0), 100);
  }

  // 改善提案を生成
  private generateRecommendations(
    summary: AssetLiabilitySummary, 
    netWorthChange: number, 
    debtToAssetRatio: number, 
    emergencyFundCoverage: number
  ): string[] {
    const recommendations: string[] = [];

    if (netWorthChange < 0) {
      recommendations.push('純資産が減少しています。支出を見直し、収入を増やすことを検討してください。');
    }

    if (debtToAssetRatio > 50) {
      recommendations.push('負債比率が高いです。借金の返済を優先し、新たな借入を控えてください。');
    }

    if (emergencyFundCoverage < 1) {
      recommendations.push('緊急資金が不足しています。3ヶ月分の生活費を目標に貯蓄を増やしてください。');
    }

    if (summary.assetBreakdown.investments === 0) {
      recommendations.push('投資資産がありません。長期資産形成のため投資を検討してください。');
    }

    if (summary.liabilityBreakdown.cardLoans > 0 || summary.liabilityBreakdown.paypayCards > 0) {
      recommendations.push('高金利の借入があります。返済を優先し、金利の低い借入への借り換えを検討してください。');
    }

    return recommendations;
  }

  // リスク評価
  private assessRisk(summary: AssetLiabilitySummary, debtToAssetRatio: number, emergencyFundCoverage: number): 'low' | 'medium' | 'high' {
    if (debtToAssetRatio > 70 || emergencyFundCoverage < 0.25) return 'high';
    if (debtToAssetRatio > 40 || emergencyFundCoverage < 0.5) return 'medium';
    return 'low';
  }

  // アラートを生成
  private generateAlerts(userId: string): void {
    const summary = this.getAssetLiabilitySummary(userId);
    const analysis = this.generateAssetLiabilityAnalysis(userId);

    // 既存のアラートをクリア
    this.alerts = this.alerts.filter(alert => alert.userId !== userId);

    // 負債比率が高い場合のアラート
    if (analysis.debtToAssetRatio > 60) {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'high_debt_ratio',
        severity: 'high',
        title: '負債比率が高いです',
        message: `負債比率が${analysis.debtToAssetRatio.toFixed(1)}%と高くなっています。借金の返済を優先してください。`,
        userId,
        createdAt: new Date(),
        isRead: false
      });
    }

    // 緊急資金が不足している場合のアラート
    if (analysis.emergencyFundCoverage < 0.5) {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'insufficient_emergency_fund',
        severity: 'medium',
        title: '緊急資金が不足しています',
        message: '緊急時のための資金が不足しています。3ヶ月分の生活費を目標に貯蓄を増やしてください。',
        userId,
        createdAt: new Date(),
        isRead: false
      });
    }

    // 純資産が減少している場合のアラート
    if (analysis.netWorthChange < -10) {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'declining_net_worth',
        severity: 'medium',
        title: '純資産が減少しています',
        message: `純資産が${Math.abs(analysis.netWorthChange).toFixed(1)}%減少しています。支出を見直してください。`,
        userId,
        createdAt: new Date(),
        isRead: false
      });
    }

    this.saveToLocalStorage();
  }

  // ユーザーのアラートを取得
  public getAlerts(userId: string): AssetLiabilityAlert[] {
    return this.alerts.filter(alert => alert.userId === userId);
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // 目標を追加
  public addGoal(goal: Omit<AssetLiabilityGoal, 'id' | 'createdAt'>): AssetLiabilityGoal {
    const newGoal: AssetLiabilityGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.goals.push(newGoal);
    this.saveToLocalStorage();
    return newGoal;
  }

  // ユーザーの目標を取得
  public getGoals(userId: string): AssetLiabilityGoal[] {
    return this.goals.filter(goal => goal.userId === userId);
  }

  // 目標を更新
  public updateGoal(id: string, updates: Partial<AssetLiabilityGoal>): AssetLiabilityGoal | null {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) return null;

    this.goals[index] = { ...this.goals[index], ...updates };
    this.saveToLocalStorage();
    return this.goals[index];
  }

  // 目標を削除
  public deleteGoal(id: string): boolean {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) return false;

    this.goals.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }
}
