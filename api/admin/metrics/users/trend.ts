import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const windowArg = String((req.query?.window as string) || '7d');
  const days = windowArg === '90d' ? 90 : windowArg === '30d' ? 30 : 7;
  const series = Array.from({ length: days }, (_, i) => ({
    day: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
    newUsers: Math.max(0, Math.round(20 + Math.sin(i / 2) * 10)),
    activeUsers: Math.max(0, Math.round(200 + Math.cos(i / 3) * 50)),
  }));
  res.status(200).json({ series });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../../src/server/config/database';
import User from '../../../../src/server/models/User';
import AnalyticsEvent from '../../../../src/server/models/AnalyticsEvent';
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    await connectDB();

    // New users by createdAt
    const newRows = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { day: '$_id', count: 1, _id: 0 } },
      { $sort: { day: 1 } },
    ]);
    const newMap = new Map<string, number>();
    newRows.forEach((r: any) => newMap.set(r.day, r.count));

    // Active users: distinct clientId/userId seen via events per day (page_view or activation)
    const activeRows = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: since },
          event: { $in: ['page_view', 'activation_first_success'] },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            user: { $ifNull: ['$userId', '$clientId'] },
          },
        },
      },
      { $group: { _id: '$_id.day', count: { $sum: 1 } } },
      { $project: { day: '$_id', count: 1, _id: 0 } },
      { $sort: { day: 1 } },
    ]);
    const activeMap = new Map<string, number>();
    activeRows.forEach((r: any) => activeMap.set(r.day, r.count));

    const series: Array<{ day: string; newUsers: number; activeUsers: number }> = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDate(d);
      series.push({
        day: key,
        newUsers: newMap.get(key) || 0,
        activeUsers: activeMap.get(key) || 0,
      });
    }

    res.status(200).json({ ok: true, data: { window: days, series } });
  } catch (error) {
    console.error('Failed to get users trend:', error);
    res.status(200).json({ ok: true, data: { window: 7, series: [] }, degraded: true });
  }
}
