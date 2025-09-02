interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, any>;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getMemorySample, saveAnalyticsEvent } = require('../_lib/analyticsStore');

// Minimal daily aggregation stub: writes an 'daily_aggregate' event per day with counts
async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const start = new Date(todayKey + 'T00:00:00.000Z');
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const sample = getMemorySample(5000);
    let pageviews = 0;
    let events = 0;
    const identities = new Set<string>();
    for (const e of sample) {
      try {
        const t = new Date(e.timestamp as string);
        if (t < start || t >= end) continue;
        events++;
        if (e.event === 'page_view' || e.event === 'pageview') pageviews++;
        const id = String(e.sessionId || e.clientId || e.ip || '');
        if (id) identities.add(id);
      } catch {}
    }

    await saveAnalyticsEvent({
      event: 'daily_aggregate',
      timestamp: now.toISOString(),
      data: {
        date: todayKey,
        pageviews,
        events,
        activeUsers: identities.size,
      } as any,
      path: '/api/analytics/aggregate-daily',
    });

    if (req.method && req.method !== 'GET') {
      // Cron invocation can be a POST; allow both
      return res.status(200).json({ ok: true, aggregated: todayKey });
    }
    return res.status(200).json({ ok: true, aggregated: todayKey });
  } catch (e) {
    console.error('[AggregateDaily] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}

module.exports = handler;
