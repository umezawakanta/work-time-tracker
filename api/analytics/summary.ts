import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import AnalyticsEvent from '../../src/server/models/AnalyticsEvent';
import { cors } from '../../lib/cors';

type RangeParam = 'day' | 'week' | 'month' | '24h' | '7d' | '30d';

function resolveWindow(range: string | undefined): { from: Date; to: Date } {
  const now = new Date();
  const r = String(range || '7d').toLowerCase();
  const from = new Date(now);
  if (r === 'day' || r === '24h') from.setDate(now.getDate() - 1);
  else if (r === 'week' || r === '7d') from.setDate(now.getDate() - 7);
  else if (r === 'month' || r === '30d') from.setDate(now.getDate() - 30);
  else from.setDate(now.getDate() - 7);
  return { from, to: now };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const { from, to } = resolveWindow((req.query?.range as RangeParam) || '7d');

  try {
    await connectDB();
    const match: any = { timestamp: { $gte: from, $lte: to } };

    const totalUsers = await AnalyticsEvent.distinct('userId').then(
      (a) => a.filter(Boolean).length
    );
    const activeUsers = await AnalyticsEvent.distinct('userId', { ...match })
      .then((a) => a.filter(Boolean).length)
      .catch(() => 0);
    const newUsers = await AnalyticsEvent.countDocuments({ ...match, event: 'register' }).catch(
      () => 0
    );
    const pageViewsTotal = await AnalyticsEvent.countDocuments({
      ...match,
      event: 'page_view',
    }).catch(() => 0);

    // Top pages (best-effort)
    const topPages = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { page: '$_id', views: 1, _id: 0 } },
    ]).catch(() => []);

    // Average session duration approximation
    const sessionAgg = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view_end' } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ['$data.timeSpent', 0] } } } },
    ]).catch(() => [] as Array<{ avg: number }>);
    const averageSessionDuration = Math.round((sessionAgg?.[0] as any)?.avg || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers: Math.max(0, activeUsers - newUsers),
        averageSessionDuration,
        pageViewsTotal,
        topPages,
        generatedAt: new Date().toISOString(),
        range: req.query?.range || '7d',
      },
    });
  } catch (e) {
    console.warn('analytics summary fallback (no DB)', e);
    return res.status(200).json({
      success: true,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        averageSessionDuration: 0,
        pageViewsTotal: 0,
        topPages: [],
        generatedAt: new Date().toISOString(),
        range: req.query?.range || '7d',
      },
      degraded: true,
    });
  }
}
