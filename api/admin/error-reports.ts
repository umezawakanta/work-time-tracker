import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const limit = Number(req.query?.limit ?? 10);
  const now = Date.now();
  const data = Array.from({ length: Math.min(50, Math.max(1, limit)) }, (_, i) => ({
    createdAt: new Date(now - i * 60000).toISOString(),
    message: i % 3 === 0 ? 'NetworkError: Failed to fetch' : 'UnhandledRejection: TypeError',
    url: '/admin',
    email: i % 4 === 0 ? 'test@example.com' : undefined,
  }));
  res.status(200).json(data);
}

// duplicate removed
