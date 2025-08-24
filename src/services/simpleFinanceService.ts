/**
 * 🏦 簡易財務サービス - ADHD/ASD特化型財務管理
 * 既存の型システムと互換性のある実装
 */

import { AssetEntry, DebtEntry } from '@/types';

interface SimpleFinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  weeklyBudget: {
    spent: number;
    remaining: number;
  };
  emergencyFundMonths: number;
  nextBill?: {
    name: string;
    amount: number;
    due: Date;
  };
  adhdInsights: string[];
}

export class SimpleFinanceService {
  private static instance: SimpleFinanceService;

  public static getInstance(): SimpleFinanceService {
    if (!SimpleFinanceService.instance) {
      SimpleFinanceService.instance = new SimpleFinanceService();
    }
    return SimpleFinanceService.instance;
  }

  /**
   * シンプルな財務サマリーを計算
   */
  public calculateFinancialSummary(
    assetEntries: AssetEntry[],
    debtEntries: DebtEntry[]
  ): SimpleFinancialSummary {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const monthStart = new Date(currentMonth + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // 今月の収入・支出を推定（資産の増減から）
    const thisMonthAssets = assetEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // 簡易収入・支出計算
    const assetIncrease = thisMonthAssets
      .filter((entry) => entry.value > 0)
      .reduce((sum, entry) => sum + entry.value, 0);

    const assetDecrease = thisMonthAssets
      .filter((entry) => entry.value < 0)
      .reduce((sum, entry) => sum + Math.abs(entry.value), 0);

    // 概算値
    const monthlyIncome = Math.max(assetIncrease, 200000); // 最低20万円として仮定
    const monthlyExpenses = Math.max(assetDecrease, 150000); // 最低15万円として仮定
    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // 週次予算（月収の20%を基準）
    const weeklyBudgetLimit = (monthlyIncome * 0.2) / 4.33;
    const currentWeekStart = this.getStartOfWeek(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

    const weeklySpent = assetEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entry.value < 0 && entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
      })
      .reduce((sum, entry) => sum + Math.abs(entry.value), 0);

    const weeklyRemaining = Math.max(0, weeklyBudgetLimit - weeklySpent);

    // 緊急資金の計算
    const totalAssets = assetEntries.reduce((sum, entry) => sum + Math.max(0, entry.value), 0);
    const emergencyFundMonths = totalAssets / (monthlyExpenses || 1);

    // 次の支払い予定
    const upcomingDebt = debtEntries
      .filter((debt) => new Date(debt.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const nextBill = upcomingDebt
      ? {
          name: upcomingDebt.name || upcomingDebt.account || '支払い',
          amount: upcomingDebt.value,
          due: new Date(upcomingDebt.date),
        }
      : undefined;

    // ADHD向けインサイト生成
    const adhdInsights = this.generateADHDInsights(
      weeklySpent,
      weeklyBudgetLimit,
      savingsRate,
      emergencyFundMonths
    );

    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      weeklyBudget: {
        spent: weeklySpent,
        remaining: weeklyRemaining,
      },
      emergencyFundMonths,
      nextBill,
      adhdInsights,
    };
  }

  /**
   * ADHD特化のインサイトを生成
   */
  private generateADHDInsights(
    weeklySpent: number,
    weeklyBudget: number,
    savingsRate: number,
    emergencyFundMonths: number
  ): string[] {
    const insights: string[] = [];
    const spendingRatio = weeklySpent / weeklyBudget;

    // 支出管理のアドバイス
    if (spendingRatio > 0.8) {
      insights.push('💡 今週の支出が予算の80%を超えています。残り数日は必要最小限に抑えましょう');
    } else if (spendingRatio < 0.5) {
      insights.push('🌟 素晴らしい支出管理です！余った予算は緊急資金に回すことをお勧めします');
    }

    // 貯蓄のアドバイス
    if (savingsRate < 10) {
      insights.push('📊 貯蓄率が低めです。自動積立で「先取り貯蓄」を設定してみませんか？');
    } else if (savingsRate > 30) {
      insights.push('🎯 優秀な貯蓄率です！一部を投資に回すことを検討してみてください');
    }

    // 緊急資金のアドバイス
    if (emergencyFundMonths < 3) {
      insights.push('🛡️ 緊急資金を3ヶ月分まで増やすことをお勧めします。安心感が向上します');
    } else if (emergencyFundMonths > 6) {
      insights.push('💪 十分な緊急資金があります！余裕資金を有効活用してみましょう');
    }

    // ADHD特有のアドバイス
    insights.push('🧠 ADHD向けTip: 支出は視覚的に記録し、予算アラートを設定しましょう');

    if (spendingRatio > 0.7) {
      insights.push(
        '⏰ 衝動的な支出を防ぐため、24時間ルール（高額商品は1日考える）を試してみてください'
      );
    }

    return insights;
  }

  /**
   * 週の開始日を取得（月曜日基準）
   */
  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(result.setDate(diff));
  }
}

export const simpleFinanceService = SimpleFinanceService.getInstance();
