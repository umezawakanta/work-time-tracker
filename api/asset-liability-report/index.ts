import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../src/database/services/FinancialDataService';

// データベースサービス
const financialService = FinancialDataService.getInstance();

// データベースからデータを取得する関数
const fetchUserData = async (userIdStr: string) => {
  try {
    // データベースから資産データを取得
    const assets = await financialService.getAssets(userIdStr);

    // データベースから負債データを取得
    const debts = await financialService.getDebts(userIdStr);

    // 銀行口座データの自動変換を無効化
    // 銀行口座データは別途管理し、資産データには自動変換しない

    return { assets, debts };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { assets: [], debts: [] };
  }
};

interface AssetRecord {
  _id: string;
  date: Date | string;
  value: number;
  description: string;
  account: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface DebtRecord {
  _id: string;
  date: Date | string;
  value: number;
  description: string;
  account: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface FinancialMetrics {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  debtToAssetRatio: number;
  assetGrowthRate: number;
  monthlyNetWorthChange: number;
  emergencyFundRatio: number;
  projectedNetWorth: number;
  investmentAllocation: Record<string, number>;
  liquidityRatio: number;
}

interface ReportData {
  assets: AssetRecord[];
  debts: DebtRecord[];
  metrics: FinancialMetrics;
  trends: {
    monthly: Array<{
      month: string;
      assets: number;
      debts: number;
      netWorth: number;
    }>;
    yearly: Array<{
      year: string;
      assets: number;
      debts: number;
      netWorth: number;
    }>;
  };
  categories: {
    assets: Record<string, number>;
    debts: Record<string, number>;
  };
}

// 財務指標を計算する関数
function calculateFinancialMetrics(assets: AssetRecord[], debts: DebtRecord[]): FinancialMetrics {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.value, 0);
  const netWorth = totalAssets - totalDebts;

  const debtToAssetRatio = totalAssets > 0 ? totalDebts / totalAssets : 0;

  // 過去30日間の資産成長率を計算
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentAssets = assets.filter((asset) => new Date(asset.date) >= thirtyDaysAgo);
  const oldAssets = assets.filter((asset) => new Date(asset.date) < thirtyDaysAgo);

  const recentTotal = recentAssets.reduce((sum, asset) => sum + asset.value, 0);
  const oldTotal = oldAssets.reduce((sum, asset) => sum + asset.value, 0);

  const assetGrowthRate = oldTotal > 0 ? ((recentTotal - oldTotal) / oldTotal) * 100 : 0;

  // 月次純資産変化を計算
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthAssets = assets.filter((asset) => {
    const assetDate = new Date(asset.date);
    return assetDate.getMonth() === currentMonth && assetDate.getFullYear() === currentYear;
  });

  const currentMonthDebts = debts.filter((debt) => {
    const debtDate = new Date(debt.date);
    return debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear;
  });

  const currentMonthNetWorth =
    currentMonthAssets.reduce((sum, asset) => sum + asset.value, 0) -
    currentMonthDebts.reduce((sum, debt) => sum + debt.value, 0);

  const monthlyNetWorthChange = currentMonthNetWorth;

  // 緊急資金比率（現金・預金 / 月次支出の3ヶ月分）
  const cashAssets = assets.filter(
    (asset) =>
      asset.account.toLowerCase().includes('cash') ||
      asset.account.toLowerCase().includes('bank') ||
      asset.account.toLowerCase().includes('savings')
  );
  const cashTotal = cashAssets.reduce((sum, asset) => sum + asset.value, 0);

  // 月次支出を負債の平均として推定
  const monthlyExpenses = totalDebts / 12; // 簡易計算
  const emergencyFundRatio = monthlyExpenses > 0 ? cashTotal / (monthlyExpenses * 3) : 0;

  // 将来の純資産予測（現在の成長率を基に）
  const projectedNetWorth = netWorth * (1 + assetGrowthRate / 100);

  // 投資配分（資産カテゴリ別）
  const investmentAllocation: Record<string, number> = {};
  assets.forEach((asset) => {
    const category = asset.account.split(' ')[0] || 'other';
    investmentAllocation[category] = (investmentAllocation[category] || 0) + asset.value;
  });

  // 流動性比率（現金資産 / 総資産）
  const liquidityRatio = totalAssets > 0 ? cashTotal / totalAssets : 0;

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
}

// トレンドデータを生成する関数
function generateTrends(assets: AssetRecord[], debts: DebtRecord[]) {
  const monthlyData: Record<string, { assets: number; debts: number }> = {};
  const yearlyData: Record<string, { assets: number; debts: number }> = {};

  // 資産データの処理
  assets.forEach((asset) => {
    const date = new Date(asset.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = String(date.getFullYear());

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { assets: 0, debts: 0 };
    }
    monthlyData[monthKey].assets += asset.value;

    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = { assets: 0, debts: 0 };
    }
    yearlyData[yearKey].assets += asset.value;
  });

  // 負債データの処理
  debts.forEach((debt) => {
    const date = new Date(debt.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = String(date.getFullYear());

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { assets: 0, debts: 0 };
    }
    monthlyData[monthKey].debts += debt.value;

    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = { assets: 0, debts: 0 };
    }
    yearlyData[yearKey].debts += debt.value;
  });

  // 月次トレンドの生成
  const monthly = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      assets: data.assets,
      debts: data.debts,
      netWorth: data.assets - data.debts,
    }));

  // 年次トレンドの生成
  const yearly = Object.entries(yearlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, data]) => ({
      year,
      assets: data.assets,
      debts: data.debts,
      netWorth: data.assets - data.debts,
    }));

  return { monthly, yearly };
}

// カテゴリ別集計を生成する関数
function generateCategories(assets: AssetRecord[], debts: DebtRecord[]) {
  const assetCategories: Record<string, number> = {};
  const debtCategories: Record<string, number> = {};

  assets.forEach((asset) => {
    const category = asset.account.split(' ')[0] || 'other';
    assetCategories[category] = (assetCategories[category] || 0) + asset.value;
  });

  debts.forEach((debt) => {
    const category = debt.account.split(' ')[0] || 'other';
    debtCategories[category] = (debtCategories[category] || 0) + debt.value;
  });

  return {
    assets: assetCategories,
    debts: debtCategories,
  };
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { action, userIdStr, timeRange = 'year' } = req.query;

      // 認証チェック（簡易版）
      if (!userIdStr || Array.isArray(userIdStr)) {
        return res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const userIdStrStr = String(userIdStr);

      if (action === 'summary') {
        // レポートサマリーを取得 - 実際のデータベースから取得
        try {
          // 実際のデータベースからデータを取得
          const { assets, debts } = await fetchUserData(userIdStrStr);

          const metrics = calculateFinancialMetrics(assets, debts);
          const trends = generateTrends(assets, debts);
          const categories = generateCategories(assets, debts);

          const reportData: ReportData = {
            assets,
            debts,
            metrics,
            trends,
            categories,
          };

          res.status(200).json({
            success: true,
            data: reportData,
          });
          return;
        } catch (error) {
          console.error('Error fetching asset/debt data:', error);
          // エラー時は空のデータでレスポンス
          const emptyAssets: AssetRecord[] = [];
          const emptyDebts: DebtRecord[] = [];

          const metrics = calculateFinancialMetrics(emptyAssets, emptyDebts);
          const trends = generateTrends(emptyAssets, emptyDebts);
          const categories = generateCategories(emptyAssets, emptyDebts);

          const reportData: ReportData = {
            assets: emptyAssets,
            debts: emptyDebts,
            metrics,
            trends,
            categories,
          };

          res.status(200).json({
            success: true,
            data: reportData,
          });
          return;
        }
      }

      if (action === 'metrics') {
        // 財務指標のみを取得 - 実際のデータベースから取得
        try {
          const { assets, debts } = await fetchUserData(userIdStrStr);

          const metrics = calculateFinancialMetrics(assets, debts);

          res.status(200).json({
            success: true,
            data: metrics,
          });
          return;
        } catch (error) {
          console.error('Error fetching metrics data:', error);
          const emptyAssets: AssetRecord[] = [];
          const emptyDebts: DebtRecord[] = [];
          const metrics = calculateFinancialMetrics(emptyAssets, emptyDebts);

          res.status(200).json({
            success: true,
            data: metrics,
          });
          return;
        }
      }

      if (action === 'trends') {
        // トレンドデータのみを取得 - 実際のデータベースから取得
        try {
          const { assets, debts } = await fetchUserData(userIdStrStr);

          const trends = generateTrends(assets, debts);

          res.status(200).json({
            success: true,
            data: trends,
          });
          return;
        } catch (error) {
          console.error('Error fetching trends data:', error);
          const emptyAssets: AssetRecord[] = [];
          const emptyDebts: DebtRecord[] = [];
          const trends = generateTrends(emptyAssets, emptyDebts);

          res.status(200).json({
            success: true,
            data: trends,
          });
          return;
        }
      }

      // デフォルトはサマリーを返す - 実際のデータベースから取得
      try {
        const { assets, debts } = await fetchUserData(userIdStrStr);

        const metrics = calculateFinancialMetrics(assets, debts);
        const trends = generateTrends(assets, debts);
        const categories = generateCategories(assets, debts);

        const reportData: ReportData = {
          assets,
          debts,
          metrics,
          trends,
          categories,
        };

        res.status(200).json({
          success: true,
          data: reportData,
        });
        return;
      } catch (error) {
        console.error('Error fetching default report data:', error);
        const emptyAssets: AssetRecord[] = [];
        const emptyDebts: DebtRecord[] = [];

        const metrics = calculateFinancialMetrics(emptyAssets, emptyDebts);
        const trends = generateTrends(emptyAssets, emptyDebts);
        const categories = generateCategories(emptyAssets, emptyDebts);

        const reportData: ReportData = {
          assets: emptyAssets,
          debts: emptyDebts,
          metrics,
          trends,
          categories,
        };

        res.status(200).json({
          success: true,
          data: reportData,
        });
        return;
      }
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Asset-Liability Report API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}

export default handler;
