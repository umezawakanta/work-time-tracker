import { api } from './apiConfig';
import { Team, TeamMember, TeamInvitation } from '@/types/team';

export interface TeamApiResponse {
  message: string;
  team: Team;
}

export interface TeamsListResponse {
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const teamApi = {
  // チーム取得
  getAll: (page = 1, limit = 10) => {
    return api.get<TeamsListResponse>(`/teams?page=${page}&limit=${limit}`);
  },

  getById: (teamId: string) => {
    return api.get<TeamApiResponse>(`/teams/${teamId}`);
  },

  // チーム作成
  create: (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt' | 'members'>) => {
    return api.post<TeamApiResponse>('/teams', teamData);
  },

  // チーム更新
  update: (teamId: string, updates: Partial<Team>) => {
    return api.put<TeamApiResponse>(`/teams/${teamId}`, updates);
  },

  // チーム削除
  delete: (teamId: string) => {
    return api.delete(`/teams/${teamId}`);
  },

  // メンバー管理
  getMembers: (teamId: string) => {
    return api.get<{ members: TeamMember[] }>(`/teams/${teamId}/members`);
  },

  inviteMember: (teamId: string, email: string, role: TeamMember['role']) => {
    return api.post<{ invitation: TeamInvitation }>(`/teams/${teamId}/invite`, {
      email,
      role,
    });
  },

  removeMember: (teamId: string, userId: string) => {
    return api.delete(`/teams/${teamId}/members/${userId}`);
  },

  updateMemberRole: (teamId: string, userId: string, role: TeamMember['role']) => {
    return api.put(`/teams/${teamId}/members/${userId}`, { role });
  },

  // 招待管理
  acceptInvitation: (token: string) => {
    return api.post<TeamApiResponse>(`/teams/invitations/${token}/accept`);
  },

  declineInvitation: (token: string) => {
    return api.post(`/teams/invitations/${token}/decline`);
  },

  getInvitations: () => {
    return api.get<{ invitations: TeamInvitation[] }>('/teams/invitations');
  },

  // チーム検索
  search: (query: string) => {
    return api.get<{ teams: Team[] }>(`/teams/search?q=${encodeURIComponent(query)}`);
  },
};
