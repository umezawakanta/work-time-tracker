import { api } from './apiConfig';
import type { PublicUser } from '@/types/admin';

export interface ListUsersParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string; // e.g. "-createdAt,email"
}

export interface ListUsersResponse {
  success: true;
  data: PublicUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  const { q = '', page = 1, limit = 20, sort = '-createdAt' } = params;
  const res = await api.get<ListUsersResponse>('/admin/users', {
    params: { q, page, limit, sort },
  });
  return res.data;
}

export type UpdateUserPayload = Partial<{
  role: 'user' | 'admin';
  roles: Array<'user' | 'admin'>; // server also validates
  isActive: boolean;
  blocked: boolean;
}>;

export interface UpdateUserResponse {
  success: true;
  data: PublicUser;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<PublicUser> {
  const res = await api.patch<UpdateUserResponse>(`/admin/users/${id}`, payload);
  return res.data.data;
}
