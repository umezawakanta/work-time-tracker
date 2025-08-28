import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';
import { connectDB } from '../../../src/server/config/database';
import { AnalyticsEvent } from '../../../src/server/models/AnalyticsEvent';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    const days = clamp(Number(req.query.days || 7), 1, 90);
    await connectDB();

    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const agg = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = new Map<string, number>();
    for (const r of agg) map.set(String(r._id), Number(r.views || 0));

    // Build dense series with zero-filled gaps
    const series: Array<{ day: string; views: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({ day: key, views: map.get(key) || 0 });
    }

    return res.status(200).json({ success: true, data: { days, series } });
  } catch (e) {
    console.error('[analytics/pageviews/daily] error', e);
    return res.status(200).json({ success: true, data: { days: 7, series: [] }, degraded: true });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMemorySample } from '../../_lib/analyticsStore.js';

type Point = { date: string; count: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const days = Math.max(1, Math.min(60, Number(req.query.days) || 14));
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    // For now, derive from memory sample (approx), later from Mongo aggregation
    const sample = getMemorySample(5000);
    const buckets = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const e of sample) {
      try {
        if (!e || !e.timestamp) continue;
        const t = new Date(e.timestamp);
        if (t < start || t > end) continue;
        if (e.event === 'page_view' || e.event === 'pageview') {
          const key = t.toISOString().slice(0, 10);
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
      } catch {}
    }
    const series: Point[] = Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
    return res
      .status(200)
      .json({ ok: true, days, start: start.toISOString(), end: end.toISOString(), series });
  } catch (e) {
    console.error('[DailyPageviews] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
