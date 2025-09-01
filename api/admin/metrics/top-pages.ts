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
  const base = windowArg === '7d' ? 1000 : windowArg === '30d' ? 4200 : 12500;
  const rows = [
    { page: '/', views: Math.round(base * 0.32) },
    { page: '/tasks', views: Math.round(base * 0.22) },
    { page: '/login', views: Math.round(base * 0.1) },
    { page: '/admin', views: Math.round(base * 0.05) },
  ];
  res.status(200).json(rows);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../src/server/config/database';
import AnalyticsEvent from '../../../src/server/models/AnalyticsEvent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const rows = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$url',
          views: { $sum: 1 },
        },
      },
      { $project: { page: '$_id', views: 1, _id: 0 } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]);

    res.status(200).json({ ok: true, data: rows });
  } catch (error) {
    console.error('Failed to get top pages:', error);
    res.status(200).json({ ok: true, data: [] });
  }
}
