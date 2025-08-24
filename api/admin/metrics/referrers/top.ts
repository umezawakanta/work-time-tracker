import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../../src/server/config/database';
import AnalyticsEvent from '../../../../src/server/models/AnalyticsEvent';
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

  try {
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    await connectDB();
    const rows = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: since } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res
      .status(200)
      .json({
        ok: true,
        data: rows.map((r: any) => ({ referrer: r._id || 'direct', count: r.count })),
      });
  } catch (error) {
    console.error('Failed to get top referrers:', error);
    return res.status(200).json({ ok: true, data: [], degraded: true });
  }
}
