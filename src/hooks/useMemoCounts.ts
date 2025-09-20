import { useState, useEffect } from 'react';

interface MemoCounts {
  personal: {
    total: number;
    general: number;
    errorReports: number;
    updateRequests: number;
  };
  public: {
    total: number;
    general: number;
    errorReports: number;
    updateRequests: number;
  };
}

export const useMemoCounts = () => {
  const [memoCounts, setMemoCounts] = useState<MemoCounts>({
    personal: {
      total: 0,
      general: 0,
      errorReports: 0,
      updateRequests: 0
    },
    public: {
      total: 0,
      general: 0,
      errorReports: 0,
      updateRequests: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      const response = await fetch('/api/memos/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setMemoCounts(data.counts);
      } else {
        throw new Error(data.error || 'Failed to fetch memo counts');
      }
    } catch (err) {
      console.error('Error fetching memo counts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoCounts();

    // メモ件数更新イベントをリッスン
    const handleUpdate = () => {
      fetchMemoCounts();
    };

    window.addEventListener('updateMemoCounts', handleUpdate);

    return () => {
      window.removeEventListener('updateMemoCounts', handleUpdate);
    };
  }, []);

  return {
    memoCounts,
    loading,
    error,
    refetch: fetchMemoCounts
  };
};
