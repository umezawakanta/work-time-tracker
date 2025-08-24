import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';
import { connectDB } from '../../../src/server/config/database';
import WorkState from '../../../src/server/models/WorkState';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });

  try {
    try {
      await connectDB();
      const doc = await WorkState.findOne({ userId });
      return res.status(200).json(doc);
    } catch {
      return res.status(200).json(null);
    }
  } catch (error) {
    console.error('Error in GET /api/worktime/state/:userId', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
