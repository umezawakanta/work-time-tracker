export async function fetchTokenFromDB(): Promise<string> {
  const response = await fetch('/api/auth/token', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch access token');
  const data = await response.json();
  return data.accessToken;
}
