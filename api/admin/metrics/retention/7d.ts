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
    const now = new Date();
    const since = new Date();
    since.setDate(now.getDate() - 6);

    await connectDB();

    const newByDay = await AnalyticsEvent.aggregate([
      { $match: { event: 'register', timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            user: '$userId',
          },
        },
      },
      { $group: { _id: '$_id.day', users: { $addToSet: '$_id.user' } } },
      { $sort: { _id: 1 } },
    ]).catch(() => [] as Array<{ _id: string; users: string[] }>);

    const out: Array<{ day: string; newUsers: number; retainedNextDay: number }> = [];
    for (const row of newByDay as any[]) {
      const dayStr: string = row._id as string;
      const users: string[] = (row.users || []).filter(Boolean);
      const dayStart = new Date(dayStr + 'T00:00:00Z');
      const nextStart = new Date(dayStart);
      nextStart.setUTCDate(nextStart.getUTCDate() + 1);
      const nextEnd = new Date(nextStart);
      nextEnd.setUTCDate(nextEnd.getUTCDate() + 1);
      let retained = 0;
      if (users.length > 0) {
        retained = await AnalyticsEvent.distinct('userId', {
          userId: { $in: users },
          timestamp: { $gte: nextStart, $lt: nextEnd },
        })
          .then((a) => a.filter(Boolean).length)
          .catch(() => 0);
      }
      out.push({ day: dayStr, newUsers: users.length, retainedNextDay: retained });
    }

    return res.status(200).json({ ok: true, data: out });
  } catch (error) {
    console.error('Failed to build retention 7d:', error);
    return res.status(200).json({ ok: true, data: [], degraded: true });
  }
}
