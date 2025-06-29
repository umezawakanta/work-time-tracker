// src/utils/trendAnalysis.ts
import { LongTermDataPoint } from '@/types';
import { parseISO, addMonths, format } from 'date-fns';

/**
 * 移動平均を計算
 * @param data データの配列
 * @param period 期間（データポイント数）
 * @param key 計算対象のキー
 */
export const calculateMovingAverage = (
  data: LongTermDataPoint[],
  period: number,
  key: 'assets' | 'debts' | 'netWorth'
): number[] => {
  const result: number[] = [];

  if (data.length < period) {
    return [];
  }

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][key];
    }
    result.push(sum / period);
  }

  return result;
};

/**
 * 線形回帰を使用して傾向を計算
 * @param data データの配列
 * @param key 計算対象のキー
 */
export const calculateLinearRegression = (
  data: LongTermDataPoint[],
  key: 'assets' | 'debts' | 'netWorth'
): { slope: number; intercept: number; r2: number } => {
  if (data.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i); // インデックスを使用

  const values = data.map((item) => item[key]);

  // xの平均とyの平均を計算
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = values.reduce((sum, val) => sum + val, 0) / n;

  // 勾配（slope）と切片（intercept）を計算
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (values[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // R2（決定係数）を計算
  let ssRes = 0; // 残差平方和
  let ssTot = 0; // 全変動平方和

  for (let i = 0; i < n; i++) {
    const prediction = slope * x[i] + intercept;
    ssRes += (values[i] - prediction) ** 2;
    ssTot += (values[i] - yMean) ** 2;
  }

  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2 };
};

/**
 * 変化率を計算（年率換算）
 * @param data データの配列
 * @param key 計算対象のキー
 */
export const calculateAnnualizedRate = (
  data: LongTermDataPoint[],
  key: 'assets' | 'debts' | 'netWorth'
): number => {
  if (data.length < 2) {
    return 0;
  }

  const firstValue = data[0][key];
  const lastValue = data[data.length - 1][key];

  if (firstValue <= 0) {
    return 0;
  }

  // 最初と最後の日付の間の年数を計算
  const firstDate = parseISO(data[0].date);
  const lastDate = parseISO(data[data.length - 1].date);
  const yearDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (yearDiff <= 0) {
    return 0;
  }

  // 年率換算の成長率を計算（CAGR = (終値/始値)^(1/年数) - 1）
  const cagr = Math.pow(lastValue / firstValue, 1 / yearDiff) - 1;

  return cagr * 100; // パーセント表示に変換
};

/**
 * トレンド分析を行う
 * @param data データの配列
 */
export const calculateTrends = (
  data: LongTermDataPoint[]
): {
  assetsTrend: { slope: number; intercept: number; r2: number };
  debtsTrend: { slope: number; intercept: number; r2: number };
  netWorthTrend: { slope: number; intercept: number; r2: number };
  assetsGrowthRate: number;
  debtsGrowthRate: number;
  netWorthGrowthRate: number;
  assetsMovingAverage: number[];
  debtsMovingAverage: number[];
  netWorthMovingAverage: number[];
} | null => {
  if (data.length < 3) {
    return null;
  }

  // 各メトリクスの傾向を計算
  const assetsTrend = calculateLinearRegression(data, 'assets');
  const debtsTrend = calculateLinearRegression(data, 'debts');
  const netWorthTrend = calculateLinearRegression(data, 'netWorth');

  // 年率換算の成長率
  const assetsGrowthRate = calculateAnnualizedRate(data, 'assets');
  const debtsGrowthRate = calculateAnnualizedRate(data, 'debts');
  const netWorthGrowthRate = calculateAnnualizedRate(data, 'netWorth');

  // 移動平均（3期間）
  const movingAveragePeriod = Math.min(3, Math.floor(data.length / 2));
  const assetsMovingAverage = calculateMovingAverage(data, movingAveragePeriod, 'assets');
  const debtsMovingAverage = calculateMovingAverage(data, movingAveragePeriod, 'debts');
  const netWorthMovingAverage = calculateMovingAverage(data, movingAveragePeriod, 'netWorth');

  return {
    assetsTrend,
    debtsTrend,
    netWorthTrend,
    assetsGrowthRate,
    debtsGrowthRate,
    netWorthGrowthRate,
    assetsMovingAverage,
    debtsMovingAverage,
    netWorthMovingAverage,
  };
};

/**
 * 将来予測を行う
 * @param data 過去のデータ
 * @param months 予測する月数
 */
export const calculateProjections = (
  data: LongTermDataPoint[],
  months: number
): LongTermDataPoint[] => {
  if (data.length < 6) {
    return [];
  }

  // 直近のデータを取得（最大12ヶ月分）
  const recentData = data.slice(-Math.min(12, data.length));

  // 各メトリクスの傾向を計算
  const assetsTrend = calculateLinearRegression(recentData, 'assets');
  const debtsTrend = calculateLinearRegression(recentData, 'debts');

  // 最後のデータポイントの日付と値
  const lastDataPoint = data[data.length - 1];
  const lastDate = parseISO(lastDataPoint.date);

  // カテゴリの割合を計算
  const categoryProportions: { [key: string]: number } = {};
  const totalAssets = lastDataPoint.assets || 1; // ゼロ除算を避けるため

  Object.entries(lastDataPoint.categories || {}).forEach(([category, value]) => {
    categoryProportions[category] = value / totalAssets;
  });

  // 将来予測を計算
  const projections: LongTermDataPoint[] = [];

  for (let i = 1; i <= months; i++) {
    const projectedDate = addMonths(lastDate, i);
    const dateStr = format(projectedDate, 'yyyy-MM-dd');

    // 線形回帰モデルに基づいて将来値を予測
    const timeStep = recentData.length + i - 1;
    const projectedAssets = Math.max(0, assetsTrend.slope * timeStep + assetsTrend.intercept);
    const projectedDebts = Math.max(0, debtsTrend.slope * timeStep + debtsTrend.intercept);
    const projectedNetWorth = projectedAssets - projectedDebts;

    // カテゴリごとの金額を計算（資産の割合は維持）
    const projectedCategories: { [key: string]: number } = {};

    Object.entries(categoryProportions).forEach(([category, proportion]) => {
      projectedCategories[category] = projectedAssets * proportion;
    });

    // 貯蓄率の推定（直近の平均値を使用）
    const avgSavingsRate =
      recentData
        .filter((item) => item.savingsRate !== undefined)
        .reduce((sum, item) => sum + (item.savingsRate || 0), 0) /
        recentData.filter((item) => item.savingsRate !== undefined).length || 0;

    projections.push({
      date: dateStr,
      assets: projectedAssets,
      debts: projectedDebts,
      netWorth: projectedNetWorth,
      savingsRate: avgSavingsRate,
      categories: projectedCategories,
      isProjected: true, // 予測値であることを示すフラグ
    });
  }

  return projections;
};

/**
 * 目標達成予測を行う
 * @param data 過去のデータ
 * @param targetValue 目標値
 * @param key 計算対象のキー
 */
export const calculateTargetDate = (
  data: LongTermDataPoint[],
  targetValue: number,
  key: 'assets' | 'debts' | 'netWorth'
): Date | null => {
  if (data.length < 3) {
    return null;
  }

  // 直近のデータを取得（最大12ヶ月分）
  const recentData = data.slice(-Math.min(12, data.length));

  // 傾向を計算
  const trend = calculateLinearRegression(recentData, key);

  // 傾向が平坦または減少している場合
  if (trend.slope <= 0) {
    return null;
  }

  // 最後のデータポイントの日付と値
  const lastDataPoint = data[data.length - 1];
  const lastDate = parseISO(lastDataPoint.date);
  const lastValue = lastDataPoint[key];

  // 目標値がすでに達成されている場合
  if (lastValue >= targetValue) {
    return new Date();
  }

  // 目標到達までの期間（ステップ数）を計算
  const timeSteps = recentData.length - 1;
  const stepsToTarget = (targetValue - trend.intercept) / trend.slope - timeSteps;

  if (stepsToTarget <= 0) {
    return new Date();
  }

  // 月単位で推定
  const monthsToTarget = Math.ceil(stepsToTarget);
  return addMonths(lastDate, monthsToTarget);
};

/**
 * 資産成長シミュレーション（複利計算）
 * @param initialValue 初期値
 * @param annualRate 年率（パーセント）
 * @param monthlyContribution 月額追加投資額
 * @param years 計算期間（年）
 */
export const simulateAssetGrowth = (
  initialValue: number,
  annualRate: number,
  monthlyContribution: number,
  years: number
): { date: string; value: number; contributions: number; interest: number }[] => {
  const result: { date: string; value: number; contributions: number; interest: number }[] = [];
  const startDate = new Date();
  let totalValue = initialValue;
  let totalContributions = initialValue;
  let totalInterest = 0;

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  for (let month = 0; month <= totalMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // 最初の月は初期値をそのまま使用
    if (month === 0) {
      result.push({
        date: dateStr,
        value: totalValue,
        contributions: totalContributions,
        interest: 0,
      });
      continue;
    }

    // 利息計算
    const monthlyInterest = totalValue * monthlyRate;
    totalValue += monthlyInterest + monthlyContribution;
    totalContributions += monthlyContribution;
    totalInterest += monthlyInterest;

    result.push({
      date: dateStr,
      value: totalValue,
      contributions: totalContributions,
      interest: totalInterest,
    });
  }

  return result;
};
