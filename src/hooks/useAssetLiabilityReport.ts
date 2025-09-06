import { useState, useEffect, useCallback } from 'react';

interface AssetRecord {
  _id: string;
  date: string;
  value: number;
  description: string;
  account: string;
  createdAt: string;
  updatedAt: string;
}

interface DebtRecord {
  _id: string;
  date: string;
  value: number;
  description: string;
  account: string;
  createdAt: string;
  updatedAt: string;
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

interface TrendData {
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
}

interface CategoryData {
  assets: Record<string, number>;
  debts: Record<string, number>;
}

interface ReportData {
  assets: AssetRecord[];
  debts: DebtRecord[];
  metrics: FinancialMetrics;
  trends: TrendData;
  categories: CategoryData;
}

interface UseAssetLiabilityReportReturn {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  metrics: FinancialMetrics | null;
  trends: TrendData | null;
  categories: CategoryData | null;
}

export function useAssetLiabilityReport(userId?: string): UseAssetLiabilityReportReturn {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/asset-liability-report?action=summary&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch report data');
      }

      setReportData(result.data);
    } catch (err) {
      console.error('Error fetching asset-liability report data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMetrics = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/asset-liability-report?action=metrics&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      return result.data;
    } catch (err) {
      console.error('Error fetching metrics:', err);
      throw err;
    }
  }, [userId]);

  const fetchTrends = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/asset-liability-report?action=trends&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch trends');
      }

      return result.data;
    } catch (err) {
      console.error('Error fetching trends:', err);
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return {
    reportData,
    loading,
    error,
    refetch: fetchReportData,
    metrics: reportData?.metrics || null,
    trends: reportData?.trends || null,
    categories: reportData?.categories || null,
  };
}
