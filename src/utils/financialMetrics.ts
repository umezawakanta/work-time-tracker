/**
 * 財務指標計算のためのユーティリティ関数
 */

import { AssetEntry, DebtEntry, FinancialMetrics } from '@/types';

/**
 * 資産と負債のデータから各種財務指標を計算する
 * @param assetEntries 資産エントリの配列
 * @param debtEntries 負債エントリの配列
 * @returns 計算された財務指標
 */
export const calculateFinancialMetrics = (assetEntries: AssetEntry[], debtEntries: DebtEntry[]) => {
  // 口座ごとに最新の資産情報を取得
  const latestAssetByAccount = new Map<string, AssetEntry>();
  assetEntries.forEach((entry) => {
    const existingEntry = latestAssetByAccount.get(entry.account);
    if (!existingEntry || new Date(entry.date) > new Date(existingEntry.date)) {
      latestAssetByAccount.set(entry.account, entry);
    }
  });

  // 口座ごとに最新の負債情報を取得
  const latestDebtByAccount = new Map<string, DebtEntry>();
  debtEntries.forEach((entry) => {
    const existingEntry = latestDebtByAccount.get(entry.account);
    if (!existingEntry || new Date(entry.date) > new Date(existingEntry.date)) {
      latestDebtByAccount.set(entry.account, entry);
    }
  });

  // 最新のエントリを使って総資産を計算
  const totalAssets = Array.from(latestAssetByAccount.values()).reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  // 最新のエントリを使って総負債を計算
  const totalDebts = Array.from(latestDebtByAccount.values()).reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  // 他の財務指標計算
  const netWorth = totalAssets - totalDebts;
  const debtToAssetRatio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;

  // 過去の資産データを日付でソート（古い順）
  const sortedAssetEntries = [...assetEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 資産成長率（直近の増減率を計算）
  let assetGrowthRate = 0;
  if (sortedAssetEntries.length > 1) {
    // 各口座の成長率を計算する前に、ポイントインタイムの資産合計を計算する必要がある
    const assetByDate = new Map<string, Map<string, number>>();

    sortedAssetEntries.forEach((entry) => {
      if (!assetByDate.has(entry.date)) {
        assetByDate.set(entry.date, new Map<string, number>());
      }
      assetByDate.get(entry.date)!.set(entry.account, entry.value);
    });

    // 日付でソートした資産合計を計算
    const dateValuePairs: { date: string; totalValue: number }[] = [];

    assetByDate.forEach((accounts, date) => {
      let total = 0;
      accounts.forEach((value) => {
        total += value;
      });
      dateValuePairs.push({ date, totalValue: total });
    });

    // 日付でソート
    dateValuePairs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 少なくとも2つのポイントがある場合、成長率を計算
    if (dateValuePairs.length >= 2) {
      const prevPoint = dateValuePairs[dateValuePairs.length - 2];
      const currPoint = dateValuePairs[dateValuePairs.length - 1];

      if (prevPoint.totalValue > 0) {
        assetGrowthRate =
          ((currPoint.totalValue - prevPoint.totalValue) / prevPoint.totalValue) * 100;
      }
    }
  }

  // 月次純資産変化（簡易計算）
  const monthlyNetWorthChange = netWorth * 0.02; // 仮定値（実際には履歴データに基づく計算が必要）

  // 緊急資金率（現金性資産 / 月間支出の倍率）
  const cashAssets = Array.from(latestAssetByAccount.values())
    .filter((asset) => {
      const name = asset.account.toLowerCase();
      return name.includes('現金') || name.includes('銀行') || name.includes('預金');
    })
    .reduce((sum, asset) => sum + asset.value, 0);

  const monthlyExpenses = 300000; // 仮定値（実際にはデータから計算）
  const emergencyFundRatio = monthlyExpenses > 0 ? cashAssets / monthlyExpenses : 0;

  // 投資配分比率（投資資産 / 総資産）
  const investmentAssets = Array.from(latestAssetByAccount.values())
    .filter((asset) => {
      const name = asset.account.toLowerCase();
      return name.includes('株') || name.includes('投資') || name.includes('fund');
    })
    .reduce((sum, asset) => sum + asset.value, 0);

  const investmentAllocation = totalAssets > 0 ? (investmentAssets / totalAssets) * 100 : 0;

  // 流動比率（流動資産 / 流動負債）
  const liquidAssets = cashAssets; // 簡易的に現金性資産を流動資産とみなす
  const currentDebts = Array.from(latestDebtByAccount.values())
    .filter((debt) => {
      const name = debt.account.toLowerCase();
      return !name.includes('住宅') && !name.includes('ローン');
    })
    .reduce((sum, debt) => sum + debt.value, 0);

  const liquidityRatio =
    currentDebts > 0 ? liquidAssets / currentDebts : liquidAssets > 0 ? 999 : 0;

  // 将来純資産予測（年間成長率5%と仮定）
  const projectedGrowthRate = Math.max(1, assetGrowthRate > 0 ? 1 + assetGrowthRate / 100 : 1.05);
  const projectedNetWorth = netWorth * projectedGrowthRate;

  return {
    totalAssets,
    totalDebts,
    netWorth,
    debtToAssetRatio,
    assetGrowthRate,
    monthlyNetWorthChange,
    emergencyFundRatio,
    projectedNetWorth,
    investmentAllocation,
    liquidityRatio,
  };
};

/**
 * 財務改善のための提案を生成
 * @param metrics 財務指標
 * @returns 改善提案の配列
 */
export const generateFinancialSuggestions = (metrics: FinancialMetrics): string[] => {
  const suggestions: string[] = [];

  // 緊急資金に関する提案
  if (metrics.emergencyFundRatio < 3) {
    suggestions.push(
      '緊急資金が3ヶ月分に満たないため、現金または流動性の高い資産の積み増しを検討してください。'
    );
  }

  // 負債に関する提案
  if (metrics.debtToAssetRatio > 50) {
    suggestions.push(
      '負債資産比率が50%を超えています。高金利の負債から優先的に返済することを検討してください。'
    );
  }

  // 投資配分に関する提案
  if (metrics.investmentAllocation < 20) {
    suggestions.push('長期的な資産形成のため、投資配分の増加を検討してください。');
  } else if (metrics.investmentAllocation > 80) {
    suggestions.push(
      '投資配分が非常に高くなっています。リスク分散のため、一部を安全資産にシフトすることも検討してください。'
    );
  }

  // 流動性に関する提案
  if (metrics.liquidityRatio < 1) {
    suggestions.push(
      '短期的な支払い能力を示す流動比率が1を下回っています。流動資産の増加を検討してください。'
    );
  }

  return suggestions;
};
