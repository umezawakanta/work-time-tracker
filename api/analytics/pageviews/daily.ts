import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' } as any);

  const days = Number(req.query.days || 7);
  const today = new Date();
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 200) + 50,
    };
  });
  res.status(200).json({ success: true, data } as any);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMemorySample } from '../../_lib/analyticsStore';

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
