export async function verifyToken(token: string): Promise<string> {
  // Minimal stub for Vercel preview environments
  if (!token) throw new Error('Invalid token');
  return 'preview-user';
}
