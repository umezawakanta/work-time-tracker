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
    const since7 = new Date(now);
    since7.setDate(now.getDate() - 6);
    const since30 = new Date(now);
    since30.setDate(now.getDate() - 29);

    // Distinct users overall (approx by AnalyticsEvent.userId)
    const totalUsers = await AnalyticsEvent.distinct('userId').then(
      (a) => a.filter(Boolean).length
    );

    // DAU (today)
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    const dau = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: startOfDay, $lt: endOfDay },
    }).then((a) => a.filter(Boolean).length);

    // WAU and MAU (distinct active users by timeframe)
    const wau = await AnalyticsEvent.distinct('userId', { timestamp: { $gte: since7 } }).then(
      (a) => a.filter(Boolean).length
    );
    const mau = await AnalyticsEvent.distinct('userId', { timestamp: { $gte: since30 } }).then(
      (a) => a.filter(Boolean).length
    );

    // New registrations (based on event: 'register')
    const new7d = await AnalyticsEvent.countDocuments({
      event: 'register',
      timestamp: { $gte: since7 },
    }).catch(() => 0);

    return res.status(200).json({
      ok: true,
      data: {
        totalUsers,
        dau,
        wau,
        mau,
        new7d,
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to get users summary:', error);
    return res.status(200).json({
      ok: true,
      data: {
        totalUsers: 0,
        dau: 0,
        wau: 0,
        mau: 0,
        new7d: 0,
        generatedAt: new Date().toISOString(),
      },
      degraded: true,
    });
  }
}
