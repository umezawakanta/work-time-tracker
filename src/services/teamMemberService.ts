import { TeamMember } from '@/types/implementation';

class TeamMemberService {
  private baseUrl = '/api/team';

  async getTeamMembers(projectId: string): Promise<TeamMember[]> {
    try {
      const response = await fetch(`${this.baseUrl}/members/${projectId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return await response.json();
    } catch (error) {
      console.error('Get team members error:', error);
      throw error;
    }
  }

  async createTeamMember(memberData: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    try {
      const response = await fetch(`${this.baseUrl}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error('Failed to create team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Create team member error:', error);
      throw error;
    }
  }

  async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    try {
      const response = await fetch(`${this.baseUrl}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Update team member error:', error);
      throw error;
    }
  }

  async deleteTeamMember(memberId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Delete team member error:', error);
      throw error;
    }
  }
}

export const teamMemberService = new TeamMemberService();
export default teamMemberService;
