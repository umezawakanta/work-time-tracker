import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import WorkState from '../../src/server/models/WorkState';

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
    try {
      await connectDB();
      const doc = await WorkState.findOneAndUpdate(
        { userId },
        {
          userId,
          isWorking: Boolean(body.isWorking),
          startTime: body.startTime ? new Date(body.startTime) : null,
          projectName: String(body.projectName || ''),
          description: String(body.description || ''),
        },
        { new: true, upsert: true }
      );
      return res.status(200).json({ message: '作業状態が保存されました', workState: doc });
    } catch {
      // DB不可でも成功扱い（クライアントUI維持のため）
      return res
        .status(200)
        .json({ message: '作業状態が保存されました', workState: body, degraded: true });
    }
  } catch (error) {
    console.error('Error in POST /api/worktime/state', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
