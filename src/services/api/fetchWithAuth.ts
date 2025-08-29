import { tokenManager } from '@/services/auth/TokenManager';

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = await tokenManager.getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
