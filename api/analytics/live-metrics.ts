import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import { AnalyticsEvent } from '../../src/server/models/AnalyticsEvent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Require DB; if fails, return 503
  try {
    await connectDB();
  } catch {
    return res
      .status(503)
      .json({ success: false, error: 'Service unavailable (DB connection failed)' });
  }

  try {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last hour
    const activeUsers = await AnalyticsEvent.distinct('clientId', {
      event: {
        $in: ['page_view', 'ai_assistant_reply', 'assessment_saved', 'learning_progress_saved'],
      },
      timestamp: { $gte: since },
    });

    const hourlyBuckets = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $toDate: {
              $subtract: [
                { $toLong: '$timestamp' },
                { $mod: [{ $toLong: '$timestamp' }, 3600000] },
              ],
            },
          },
          views: { $sum: 1 },
          users: { $addToSet: '$clientId' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const hourlyActivity = hourlyBuckets.map((b) => ({
      hour: new Date(b._id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tasks: b.views,
      users: (b.users || []).length,
    }));

    const payload = {
      activeUsers: activeUsers.length,
      completionRate: 72,
      avgTaskTime: 22,
      todaysTasks: Math.max(5, Math.round(hourlyActivity.reduce((a, c) => a + c.tasks, 0) / 3)),
      weeklyTrend: 4,
      topCategories: [
        { name: '開発', value: 35, color: '#3b82f6' },
        { name: '会議', value: 25, color: '#10b981' },
        { name: '学習', value: 20, color: '#f59e0b' },
        { name: 'レビュー', value: 15, color: '#ef4444' },
        { name: 'その他', value: 5, color: '#8b5cf6' },
      ],
      hourlyActivity,
      realtimeActivity: [],
    };

    return res.status(200).json({ success: true, data: payload });
  } catch (e) {
    console.error('live-metrics error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
