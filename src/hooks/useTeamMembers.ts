import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '@/types/implementation';
import { teamMemberService } from '@/services/teamMemberService';

interface UseTeamMembersReturn {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: () => Promise<void>;
  addMember: (memberData: Omit<TeamMember, 'id'>) => Promise<boolean>;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
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
      const members = await teamMemberService.getTeamMembers(projectId);
      setTeamMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チームメンバーの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const addMember = useCallback(async (memberData: Omit<TeamMember, 'id'>): Promise<boolean> => {
    try {
      const newMember = await teamMemberService.createTeamMember(memberData);
      setTeamMembers((prev) => [...prev, newMember]);
      return true;
    } catch (error) {
      console.error('Add member error:', error);
      return false;
    }
  }, []);

  const updateMember = useCallback(
    async (memberId: string, updates: Partial<TeamMember>): Promise<boolean> => {
      try {
        const updatedMember = await teamMemberService.updateTeamMember(memberId, updates);
        setTeamMembers((prev) =>
          prev.map((member) => (member.id === memberId ? updatedMember : member))
        );
        return true;
      } catch (error) {
        console.error('Update member error:', error);
        return false;
      }
    },
    []
  );

  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      await teamMemberService.deleteTeamMember(memberId);
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      return true;
    } catch (error) {
      console.error('Remove member error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  return {
    teamMembers,
    isLoading,
    error,
    refreshMembers,
    addMember,
    updateMember,
    removeMember,
  };
};
