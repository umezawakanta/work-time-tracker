import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Mocked dataset for build stability
  const data = [
    { message: 'NetworkError: Failed to fetch', count: 12, url: '/admin' },
    { message: 'UnhandledRejection: TypeError', count: 9, url: '/login' },
    { message: 'QuotaExceededError', count: 3, url: '/analytics' },
  ];
  return res.status(200).json({ ok: true, data });
}
