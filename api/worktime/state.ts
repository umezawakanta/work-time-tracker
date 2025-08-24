import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

// In-memory fallback store for serverless cold starts (best-effort)
const memoryState = new Map<string, any>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const userId = body.userId as string;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
    memoryState.set(userId, body);
    return res.status(200).json({ message: '作業状態が保存されました', workState: body });
  } catch (error) {
    console.error('Error in POST /api/worktime/state', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
