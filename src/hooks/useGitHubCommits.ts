import { useState, useEffect, useCallback } from 'react';
import { EnhancedCommit, UpdateHistoryStats, CommitSearchParams } from '@/types/github';
import { getGitHubService } from '@/services/githubService';
import { useToast } from '@/components/ui/use-toast';

interface UseGitHubCommitsReturn {
  commits: EnhancedCommit[];
  stats: UpdateHistoryStats | null;
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchCommits: (params: CommitSearchParams) => Promise<void>;
}

export const useGitHubCommits = (
  initialParams: CommitSearchParams = {}
): UseGitHubCommitsReturn => {
  const [commits, setCommits] = useState<EnhancedCommit[]>([]);
  const [stats, setStats] = useState<UpdateHistoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<CommitSearchParams>(initialParams);

  const { toast } = useToast();
  const githubService = getGitHubService();

  // コミットを取得する関数
  const fetchCommits = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          ...searchParams,
          page,
          per_page: 20,
        };

        const rawCommits = await githubService.getCommits(params);

        if (rawCommits.length === 0) {
          setHasNextPage(false);
          if (!append) {
            setCommits([]);
          }
          return;
        }

        const enhancedCommits = githubService.enhanceCommits(rawCommits);

        if (append) {
          setCommits((prev) => [...prev, ...enhancedCommits]);
        } else {
          setCommits(enhancedCommits);

          // 統計情報を計算（初回読み込み時のみ）
          try {
            const allCommitsForStats = await githubService.getCommits({
              ...searchParams,
              per_page: 100, // 統計用により多くのコミットを取得
            });
            const calculatedStats = await githubService.calculateStats(allCommitsForStats);
            setStats(calculatedStats);
          } catch (statsError) {
            console.warn('統計情報の計算に失敗しました:', statsError);
          }
        }

        setHasNextPage(rawCommits.length === (params.per_page || 20));
        setCurrentPage(page);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
        setError(errorMessage);

        toast({
          title: 'エラー',
          description: `コミット履歴の取得に失敗しました: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [searchParams, githubService, toast]
  );

  // 初回読み込み
  useEffect(() => {
    fetchCommits(1, false);
  }, [fetchCommits]);

  // さらに読み込む
  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await fetchCommits(currentPage + 1, true);
  }, [hasNextPage, loading, currentPage, fetchCommits]);

  // データを更新
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasNextPage(true);
    await fetchCommits(1, false);
  }, [fetchCommits]);

  // 検索パラメータでコミットを検索
  const searchCommits = useCallback(async (params: CommitSearchParams) => {
    setSearchParams(params);
    setCurrentPage(1);
    setHasNextPage(true);
    // fetchCommitsは自動的に新しいsearchParamsで呼ばれる
  }, []);

  // 定期的な更新（5分間隔）
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!loading) {
          refresh();
        }
      },
      5 * 60 * 1000
    ); // 5分

    return () => clearInterval(interval);
  }, [loading, refresh]);

  return {
    commits,
    stats,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh,
    searchCommits,
  };
};

// 特定のコミットの詳細を取得するフック
export const useCommitDetail = (sha: string) => {
  const [commit, setCommit] = useState<EnhancedCommit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const githubService = getGitHubService();

  const fetchCommitDetail = useCallback(async () => {
    if (!sha) return;

    try {
      setLoading(true);
      setError(null);

      const rawCommit = await githubService.getCommitDetail(sha);
      const [enhancedCommit] = githubService.enhanceCommits([rawCommit]);

      setCommit(enhancedCommit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sha, githubService]);

  useEffect(() => {
    fetchCommitDetail();
  }, [fetchCommitDetail]);

  return { commit, loading, error, refetch: fetchCommitDetail };
};
