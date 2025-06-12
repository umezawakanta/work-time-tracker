import { api } from './apiConfig';

export async function fetchTokenFromDB(): Promise<string> {
  const response = await api.get('/auth/token', { withCredentials: true });
  if (!response.data) throw new Error('Failed to fetch access token');
  return response.data.accessToken;
}
