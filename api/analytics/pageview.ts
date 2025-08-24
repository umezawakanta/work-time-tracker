import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory store keyed by YYYY-MM-DD
// Note: For serverless, each invocation can be cold; this is best-effort and complemented by AnalyticsEvent storage elsewhere.
const pageviewBuckets: Record<string, number> = {};

function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { path, referrer, title } = (req.body as any) || {};
    const key = getDateKey();
    pageviewBuckets[key] = (pageviewBuckets[key] || 0) + 1;

    // Best-effort logging (does not block)
    console.log('[Pageview]', {
      key,
      path: typeof path === 'string' ? path : undefined,
      referrer: typeof referrer === 'string' ? referrer : undefined,
      title: typeof title === 'string' ? title : undefined,
      ua: req.headers['user-agent'] || '',
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to record pageview:', error);
    // Do not fail the client for observability path
    res.status(200).json({ ok: true, degraded: true });
  }
}

// Export store for other endpoints in the same runtime (best-effort)
export { pageviewBuckets };
