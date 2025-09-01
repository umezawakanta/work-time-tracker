import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';

// Simple in-memory store keyed by YYYY-MM-DD (fallback when DB not persisted due to cold start)
const pageviewBuckets: Record<string, number> = {};

function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { path, referrer, title, clientId, utm } = (req.body as any) || {};
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ ok: false, error: 'INVALID_PATH' });
    }
    const safeTitle = typeof title === 'string' ? title : undefined;
    const safeRef = typeof referrer === 'string' ? referrer : undefined;
    const safeClientId = typeof clientId === 'string' ? clientId : undefined;
    const safeUtm = utm && typeof utm === 'object' ? utm : undefined;
    const key = getDateKey();
    pageviewBuckets[key] = (pageviewBuckets[key] || 0) + 1;

    // DB persistence removed for build stability; keep memory bucket only

    // Log
    console.log('[Pageview]', {
      key,
      path: typeof path === 'string' ? path : undefined,
      referrer: typeof referrer === 'string' ? referrer : undefined,
      title: typeof title === 'string' ? title : undefined,
      clientId,
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
