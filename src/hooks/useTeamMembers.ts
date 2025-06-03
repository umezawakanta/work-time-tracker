import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types/implementation';

interface UseTeamMembersReturn {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: () => Promise<void>;
}

export const useTeamMembers = (projectId: string): UseTeamMembersReturn => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMembers = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // For now, return mock data
      const mockMembers: TeamMember[] = [
        {
          id: 'user1',
          name: '田中 太郎',
          email: 'tanaka@example.com',
          avatar: '',
          role: 'フロントエンド',
          skills: ['React', 'TypeScript', 'UI/UX'],
          availability: 'available',
          workload: 70,
        },
        {
          id: 'user2',
          name: '佐藤 花子',
          email: 'sato@example.com',
          avatar: '',
          role: 'バックエンド',
          skills: ['Node.js', 'Firebase', 'API'],
          availability: 'busy',
          workload: 90,
        },
      ];

      setTeamMembers(mockMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チームメンバーの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  return {
    teamMembers,
    isLoading,
    error,
    refreshMembers,
  };
};
