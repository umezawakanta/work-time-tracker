/**
 * 🏦 統合財務サービス - ADHD/ASD特化型財務管理
 * MoneyForward風の包括的な財務データ管理
 */

import { AssetEntry, DebtEntry } from '@/types';

// 財務データの拡張
interface FinancialAssetEntry extends AssetEntry {
  type?: 'asset' | 'income' | 'expense';
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface FinancialDebtEntry extends DebtEntry {
  interestRate?: number;
  minPayment?: number;
}

interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: {
    [category: string]: number;
  };
}

interface WeeklyBudget {
  week: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  dailyAverage: number;
  categories: {
    [category: string]: {
      budgeted: number;
      spent: number;
      remaining: number;
    };
  };
  adhdFriendlyInsights: {
    impulseSpending: number;
    savingsProgress: number;
    stressIndicator: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

interface FinancialInsights {
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  savingsGoalProgress: number;
  spendingTrends: Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    change: number;
  }>;
  adhdSpecificAdvice: {
    impulseControlTips: string[];
    automationSuggestions: string[];
    visualCues: string[];
    emergencyStrategies: string[];
  };
}

export class IntegratedFinanceService {
  private static instance: IntegratedFinanceService;

  public static getInstance(): IntegratedFinanceService {
    if (!IntegratedFinanceService.instance) {
      IntegratedFinanceService.instance = new IntegratedFinanceService();
    }
    return IntegratedFinanceService.instance;
  }

  /**
   * 月次財務データを計算
   */
  public calculateMonthlyFinancials(
    assetEntries: AssetEntry[],
    debtEntries: DebtEntry[],
    targetMonth?: string
  ): MonthlyFinancialData {
    const month = targetMonth || new Date().toISOString().slice(0, 7);
    const monthStart = new Date(month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // 該当月のエントリをフィルター
    const monthlyEntries = assetEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // 収入と支出を分類
    const income = monthlyEntries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.value, 0);

    const expenses = monthlyEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.value, 0);

    // 継続的な収入・支出を考慮（仮実装）
    const recurringIncome = 0; // TODO: 実装
    const recurringExpenses = 0; // TODO: 実装

    const totalIncome = income + recurringIncome;
    const totalExpenses = expenses + recurringExpenses;
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // カテゴリ別内訳
    const categoryBreakdown = monthlyEntries.reduce(
      (acc, entry) => {
        const category = entry.category || 'その他';
        acc[category] =
          (acc[category] || 0) + (entry.type === 'expense' ? -entry.value : entry.value);
        return acc;
      },
      {} as { [category: string]: number }
    );

    return {
      month,
      income: totalIncome,
      expenses: totalExpenses,
      savings,
      savingsRate,
      categoryBreakdown,
    };
  }

  /**
   * 週次予算を計算（ADHD特化機能付き）
   */
  public calculateWeeklyBudget(
    assetEntries: AssetEntry[],
    monthlyIncome: number,
    targetWeek?: string
  ): WeeklyBudget {
    const today = new Date();
    const weekStart = targetWeek ? new Date(targetWeek) : this.getStartOfWeek(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // 週の支出を計算
    const weeklyExpenses = assetEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entry.type === 'expense' && entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce((sum, entry) => sum + entry.value, 0);

    // 月次予算から週次予算を算出（月収の20%を基準）
    const weeklyBudgetLimit = (monthlyIncome * 0.2) / 4.33; // 月を4.33週として計算
    const remaining = Math.max(0, weeklyBudgetLimit - weeklyExpenses);
    const dailyAverage = weeklyExpenses / 7;

    // カテゴリ別予算
    const categories = this.calculateCategoryBudgets(
      assetEntries,
      weeklyBudgetLimit,
      weekStart,
      weekEnd
    );

    // ADHD特化インサイト
    const impulseSpending = this.detectImpulseSpending(assetEntries, weekStart, weekEnd);
    const adhdInsights = this.generateADHDInsights(
      weeklyExpenses,
      weeklyBudgetLimit,
      impulseSpending
    );

    return {
      week: weekStart.toISOString().slice(0, 10),
      budgetLimit: weeklyBudgetLimit,
      spent: weeklyExpenses,
      remaining,
      dailyAverage,
      categories,
      adhdFriendlyInsights: {
        impulseSpending,
        savingsProgress: (remaining / weeklyBudgetLimit) * 100,
        stressIndicator: this.calculateStressIndicator(weeklyExpenses, weeklyBudgetLimit),
        recommendations: adhdInsights,
      },
    };
  }

  /**
   * 財務インサイトを生成
   */
  public generateFinancialInsights(
    assetEntries: AssetEntry[],
    debtEntries: DebtEntry[],
    monthlyData: MonthlyFinancialData
  ): FinancialInsights {
    const totalAssets = assetEntries
      .filter((entry) => entry.type === 'asset')
      .reduce((sum, entry) => sum + entry.value, 0);

    const totalDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);
    const emergencyFundMonths = totalAssets / (monthlyData.expenses || 1);
    const debtToIncomeRatio = totalDebts / (monthlyData.income || 1);

    // 支出トレンド分析
    const spendingTrends = this.analyzeSpendingTrends(assetEntries);

    // ADHD特化アドバイス
    const adhdSpecificAdvice = this.generateADHDSpecificAdvice(
      monthlyData,
      emergencyFundMonths,
      debtToIncomeRatio
    );

    return {
      emergencyFundMonths,
      debtToIncomeRatio,
      savingsGoalProgress: Math.min(100, monthlyData.savingsRate),
      spendingTrends,
      adhdSpecificAdvice,
    };
  }

  // プライベートヘルパーメソッド

  private calculateRecurringAmount(
    entries: AssetEntry[],
    type: 'income' | 'expense',
    frequency: string
  ): number {
    return entries
      .filter((entry) => entry.type === type && entry.recurring && entry.frequency === frequency)
      .reduce((sum, entry) => sum + entry.value, 0);
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    return new Date(result.setDate(diff));
  }

  private calculateCategoryBudgets(
    assetEntries: AssetEntry[],
    totalBudget: number,
    weekStart: Date,
    weekEnd: Date
  ) {
    const categorySpending = assetEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entry.type === 'expense' && entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce(
        (acc, entry) => {
          const category = entry.category || 'その他';
          acc[category] = (acc[category] || 0) + entry.value;
          return acc;
        },
        {} as { [category: string]: number }
      );

    // 標準的なカテゴリ予算配分（ADHD向け調整済み）
    const standardAllocation = {
      食費: 0.25,
      交通費: 0.15,
      娯楽: 0.2, // ADHD：報酬系を考慮して少し多め
      医療: 0.1,
      日用品: 0.15,
      その他: 0.15,
    };

    const result: { [category: string]: { budgeted: number; spent: number; remaining: number } } =
      {};

    Object.entries(standardAllocation).forEach(([category, allocation]) => {
      const budgeted = totalBudget * allocation;
      const spent = categorySpending[category] || 0;
      const remaining = Math.max(0, budgeted - spent);

      result[category] = { budgeted, spent, remaining };
    });

    return result;
  }

  private detectImpulseSpending(
    assetEntries: AssetEntry[],
    weekStart: Date,
    weekEnd: Date
  ): number {
    // 衝動的支出の検出（短時間での小額決済の集中）
    const impulseCategories = ['娯楽', 'その他', '外食'];
    const impulseThreshold = 1000; // 1時間以内の支出閾値

    const weeklyExpenses = assetEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entry.type === 'expense' &&
          entryDate >= weekStart &&
          entryDate <= weekEnd &&
          impulseCategories.includes(entry.category || 'その他')
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let impulseAmount = 0;
    for (let i = 0; i < weeklyExpenses.length - 1; i++) {
      const current = new Date(weeklyExpenses[i].date);
      const next = new Date(weeklyExpenses[i + 1].date);
      const timeDiff = next.getTime() - current.getTime();

      if (timeDiff <= impulseThreshold * 60 * 1000) {
        // 1時間以内
        impulseAmount += weeklyExpenses[i + 1].value;
      }
    }

    return impulseAmount;
  }

  private calculateStressIndicator(spent: number, budget: number): 'low' | 'medium' | 'high' {
    const ratio = spent / budget;
    if (ratio < 0.7) return 'low';
    if (ratio < 0.9) return 'medium';
    return 'high';
  }

  private generateADHDInsights(spent: number, budget: number, impulseSpending: number): string[] {
    const insights: string[] = [];
    const ratio = spent / budget;

    if (ratio > 0.8) {
      insights.push('💡 予算の80%を使用しています。残り3日間は必要最小限の支出に抑えましょう');
    }

    if (impulseSpending > budget * 0.2) {
      insights.push(
        '🎯 衝動的な支出が多めです。次回は10分ルール（購入前に10分待つ）を試してみてください'
      );
    }

    if (ratio < 0.5) {
      insights.push(
        '🌟 素晴らしい！予算管理ができています。余った分は緊急資金に回すことをお勧めします'
      );
    }

    return insights;
  }

  private analyzeSpendingTrends(assetEntries: AssetEntry[]) {
    // 簡易的なトレンド分析（実装簡略化）
    const categories = ['食費', '交通費', '娯楽', '医療', '日用品'];

    return categories.map((category) => ({
      category,
      trend: 'stable' as const,
      change: 0,
    }));
  }

  private generateADHDSpecificAdvice(
    monthlyData: MonthlyFinancialData,
    emergencyFundMonths: number,
    debtToIncomeRatio: number
  ) {
    return {
      impulseControlTips: [
        '24時間ルール：高額商品は1日考えてから購入する',
        '買い物リストを事前に作成し、リスト以外は購入しない',
        'クレジットカードではなく現金やデビットカードを使用する',
      ],
      automationSuggestions: [
        '給与の20%を自動的に貯蓄口座に振り分ける',
        '光熱費や家賃などの固定費を自動引き落としに設定する',
        '投資信託の積立を毎月自動実行する',
      ],
      visualCues: [
        '支出をグラフで可視化して進捗を確認する',
        '目標貯蓄額までのプログレスバーを設置する',
        '月次レポートを色分けして感覚的に理解しやすくする',
      ],
      emergencyStrategies: [
        '緊急時の支出上限額を事前に決めておく',
        '複数の銀行口座に資金を分散して衝動的な大きな支出を防ぐ',
        '信頼できる人に財務状況を定期的に報告する',
      ],
    };
  }
}

export const integratedFinanceService = IntegratedFinanceService.getInstance();
