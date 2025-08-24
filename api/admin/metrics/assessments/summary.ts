import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';
import { connectDB } from '../../../../src/server/config/database';
import AnalyticsEvent from '../../../../src/server/models/AnalyticsEvent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    const now = new Date();
    const since30 = new Date(now);
    since30.setDate(now.getDate() - 29);

    // Counts derived from analytics events for simplicity
    const iqSaved = await AnalyticsEvent.countDocuments({
      event: 'assessment_saved',
      'data.kind': 'iq',
    }).catch(() => 0);
    const mbtiSaved = await AnalyticsEvent.countDocuments({
      event: 'assessment_saved',
      'data.kind': 'mbti',
    }).catch(() => 0);
    const totalSaved30d = await AnalyticsEvent.countDocuments({
      event: 'assessment_saved',
      timestamp: { $gte: since30 },
    }).catch(() => 0);

    return res
      .status(200)
      .json({
        ok: true,
        data: { iqSaved, mbtiSaved, totalSaved30d, generatedAt: now.toISOString() },
      });
  } catch (error) {
    console.error('Failed to get assessments summary:', error);
    return res
      .status(200)
      .json({
        ok: true,
        data: { iqSaved: 0, mbtiSaved: 0, totalSaved30d: 0, generatedAt: new Date().toISOString() },
        degraded: true,
      });
  }
}
