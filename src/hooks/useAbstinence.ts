import { useState, useEffect, useCallback } from 'react';
import { AbstinenceChallenge, AbstinenceStats } from '@/types/abstinence';
import { abstinenceService } from '@/services/abstinenceService';
import { toast } from 'react-hot-toast';

interface UseAbstinenceReturn {
  challenges: AbstinenceChallenge[];
  stats: AbstinenceStats | null;
  achievements: any;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createChallenge: (type: string, title?: string, description?: string) => Promise<boolean>;
  recordDaily: (
    challengeId: string,
    status: 'success' | 'failure',
    note?: string
  ) => Promise<boolean>;
}

export const useAbstinence = (): UseAbstinenceReturn => {
  const [challenges, setChallenges] = useState<AbstinenceChallenge[]>([]);
  const [stats, setStats] = useState<AbstinenceStats | null>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [challengesData, statsData, achievementsData] = await Promise.all([
        abstinenceService.getChallenges(),
        abstinenceService.getStats(),
        abstinenceService.getAchievements(),
      ]);

      setChallenges(challengesData);
      setStats(statsData);
      setAchievements(achievementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChallenge = useCallback(
    async (type: string, title?: string, description?: string): Promise<boolean> => {
      try {
        await abstinenceService.createChallenge({ type, title, description });
        await refreshData();
        return true;
      } catch (error) {
        console.error('Create challenge error:', error);
        return false;
      }
    },
    [refreshData]
  );

  const recordDaily = useCallback(
    async (challengeId: string, status: 'success' | 'failure', note?: string): Promise<boolean> => {
      try {
        await abstinenceService.recordDaily(challengeId, status, note);
        await refreshData();
        return true;
      } catch (error) {
        console.error('Record daily error:', error);
        return false;
      }
    },
    [refreshData]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    challenges,
    stats,
    achievements,
    isLoading,
    error,
    refreshData,
    createChallenge,
    recordDaily,
  };
};
