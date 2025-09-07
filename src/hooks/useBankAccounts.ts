import { useState, useEffect, useCallback } from 'react';

interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'time_deposit' | 'credit_card';
  accountNumber: string;
  branchName?: string;
  accountName: string;
  isMain: boolean;
  isActive: boolean;
  lastBalance?: number;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

export const useBankAccounts = (userId: string) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/bank-accounts?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setAccounts(data.data);
      } else {
        setError(data.message || '銀行口座の取得に失敗しました');
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.status === 404
          ? 'APIエンドポイントが見つかりません。デプロイを確認してください。'
          : err?.response?.status === 500
            ? 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
            : err?.message || '銀行口座の取得中にエラーが発生しました';
      setError(errorMessage);
      console.error('Error fetching bank accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId, fetchAccounts]);

  const mainAccount = accounts.find((account) => account.isMain && account.isActive);

  return {
    accounts,
    mainAccount,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
};
