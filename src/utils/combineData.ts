/**
 * 資産と負債のデータを結合するユーティリティ関数
 */

import { AssetEntry, CombinedDataPoint, DebtEntry } from '@/types';
import { DataGenerator } from './idGenerator';

/**
 * 資産と負債のデータを結合して時系列データを生成する
 * @param assetEntries 資産エントリの配列
 * @param debtEntries 負債エントリの配列
 * @returns 結合されたデータポイントの配列
 */
export const combineData = (
  assetEntries: AssetEntry[],
  debtEntries: DebtEntry[]
): CombinedDataPoint[] => {
  if (assetEntries.length === 0 && debtEntries.length === 0) {
    return [];
  }

  // デモ用のデータ生成（実際のアプリでは履歴データなどを使用）
  const now = new Date();
  const combinedData: CombinedDataPoint[] = [];

  // 決定論的なデータ生成のためのジェネレーター
  const dataGenerator = new DataGenerator(12345); // 固定シードで決定論的

  // 過去12ヶ月分のデータを生成
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

    // 総資産・負債のベース値を計算
    const baseAssets = assetEntries.reduce((sum, entry) => sum + entry.value, 0);
    const baseDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);

    // より現実的な財務データ生成
    const financialData = dataGenerator.generateFinancialData(baseAssets);

    // 時間経過による調整（過去ほど小さい値）
    const timeAdjustment = 1 - i * 0.008; // 毎月0.8%ずつ調整

    const totalAssets = financialData.assets * timeAdjustment;
    const totalDebts = baseDebts * timeAdjustment * 0.95; // 負債は少しずつ減少

    // 純資産の計算
    const netWorth = totalAssets - totalDebts;

    // データポイントを追加
    combinedData.push({
      date: dateStr,
      value: Math.round(totalAssets),
      type: 'asset',
    });

    combinedData.push({
      date: dateStr,
      value: Math.round(totalDebts),
      type: 'debt',
    });

    combinedData.push({
      date: dateStr,
      value: Math.round(netWorth),
      type: 'netWorth',
    });
  }

  // 個別の資産・負債データも追加（現在時点のみ）
  const currentDateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  assetEntries.forEach((entry) => {
    combinedData.push({
      date: currentDateStr,
      value: entry.value,
      type: 'asset',
      account: entry.account,
    });
  });

  debtEntries.forEach((entry) => {
    combinedData.push({
      date: currentDateStr,
      value: entry.value,
      type: 'debt',
      account: entry.account,
    });
  });

  return combinedData;
};

/**
 * 結合データから特定の種類のデータのみを抽出する
 * @param data 結合データ
 * @param type 抽出する種類 ('asset', 'debt', 'netWorth')
 * @returns 抽出されたデータポイント
 */
export const filterDataByType = (
  data: CombinedDataPoint[],
  type: 'asset' | 'debt' | 'netWorth'
): CombinedDataPoint[] => {
  return data.filter((item) => item.type === type);
};

/**
 * 結合データから日付ごとのサマリーデータを生成する
 * @param data 結合データ
 * @returns 日付ごとのサマリーデータ
 */
export const generateDateSummary = (data: CombinedDataPoint[]) => {
  const dateMap = new Map<
    string,
    {
      totalAssets: number;
      totalDebts: number;
      netWorth: number;
      assetGrowth?: number;
      debtGrowth?: number;
      netWorthGrowth?: number;
    }
  >();

  // 日付ごとにデータをグループ化
  data.forEach((item) => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, {
        totalAssets: 0,
        totalDebts: 0,
        netWorth: 0,
      });
    }

    const dateData = dateMap.get(item.date)!;

    if (item.type === 'asset' && !item.account) {
      dateData.totalAssets = item.value;
    } else if (item.type === 'debt' && !item.account) {
      dateData.totalDebts = item.value;
    } else if (item.type === 'netWorth') {
      dateData.netWorth = item.value;
    }
  });

  // 日付順にソート
  const sortedDates = Array.from(dateMap.keys()).sort();

  // 前月比の成長率を計算
  let prevData: {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
  } | null = null;

  sortedDates.forEach((date) => {
    const currentData = dateMap.get(date)!;

    if (prevData) {
      currentData.assetGrowth =
        prevData.totalAssets > 0 ? (currentData.totalAssets / prevData.totalAssets - 1) * 100 : 0;

      currentData.debtGrowth =
        prevData.totalDebts > 0 ? (currentData.totalDebts / prevData.totalDebts - 1) * 100 : 0;

      currentData.netWorthGrowth =
        prevData.netWorth > 0 ? (currentData.netWorth / prevData.netWorth - 1) * 100 : 0;
    }

    prevData = { ...currentData };
  });

  // 結果を配列として返す
  return sortedDates.map((date) => ({
    date,
    ...dateMap.get(date)!,
  }));
};
