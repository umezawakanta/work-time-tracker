import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';

// Reuse the in-memory map by module scoping (note: per-lambda instance)
const memoryState: Map<string, any> = (global as any).__WT_MEMORY_STATE__ || new Map();
(global as any).__WT_MEMORY_STATE__ = memoryState;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });

  try {
    const state = memoryState.get(userId) || null;
    return res.status(200).json(state);
  } catch (error) {
    console.error('Error in GET /api/worktime/state/:userId', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
