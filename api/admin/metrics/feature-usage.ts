import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../src/server/config/database';
import AnalyticsEvent from '../../../src/server/models/AnalyticsEvent';
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    await connectDB();

    const [aiOk, assessSaved, learningSaved] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: since },
        event: 'ai_assistant_reply',
        'data.ok': true,
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: since },
        event: 'assessment_saved',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: since },
        event: 'learning_progress_saved',
      }).catch(() => 0),
    ]);

    return res
      .status(200)
      .json({
        ok: true,
        data: { ai_ok: aiOk, assessment_saved: assessSaved, learning_saved: learningSaved },
      });
  } catch (error) {
    console.error('Failed to get feature usage:', error);
    return res
      .status(200)
      .json({
        ok: true,
        data: { ai_ok: 0, assessment_saved: 0, learning_saved: 0 },
        degraded: true,
      });
  }
}
