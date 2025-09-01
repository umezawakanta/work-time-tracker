import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });

  const hours = clamp(Number(req.query.hours || 24), 1, 72);
  // Mocked for stability
  const activeUsers = Math.max(0, Math.round(50 + Math.random() * 50));
  return res.status(200).json({ success: true, data: { hours, activeUsers } });
}

// (removed duplicate legacy handler)
