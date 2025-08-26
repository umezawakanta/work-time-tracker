import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMemorySample, saveAnalyticsEvent } from '../_lib/analyticsStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const days = Math.max(1, Math.min(60, Number(req.query.days) || 14));
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const sample = getMemorySample(5000);

    const results: Array<{ date: string; pageviews: number; events: number; activeUsers: number }> =
      [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayKey = dayStart.toISOString().slice(0, 10);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      let pageviews = 0;
      let events = 0;
      const ids = new Set<string>();
      for (const e of sample) {
        try {
          const t = new Date(e.timestamp as string);
          if (t < dayStart || t >= dayEnd) continue;
          events++;
          if (e.event === 'page_view' || e.event === 'pageview') pageviews++;
          const id = String(e.sessionId || e.clientId || e.ip || '');
          if (id) ids.add(id);
        } catch {}
      }
      const activeUsers = ids.size;
      await saveAnalyticsEvent({
        event: 'daily_aggregate',
        timestamp: new Date().toISOString(),
        data: { date: dayKey, pageviews, events, activeUsers } as any,
        path: '/api/analytics/aggregate-backfill',
      });
      results.push({ date: dayKey, pageviews, events, activeUsers });
    }

    return res.status(200).json({ ok: true, days, results });
  } catch (e) {
    console.error('[AggregateBackfill] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
