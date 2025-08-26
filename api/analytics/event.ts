import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyticsEventSchema } from '../_schemas/analytics.js';

type AnalyticsEventBody = {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: string;
};

function isValidEventName(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  const n = name.trim();
  if (n.length === 0 || n.length > 64) return false;
  return /^[a-z0-9_]+$/i.test(n);
}

function sanitizeData(input: unknown): Record<string, unknown> | undefined {
  if (!input || typeof input !== 'object') return undefined;
  try {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof k !== 'string' || k.length > 64) continue;
      const key = k.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 64);
      if (v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        copy[key] = v as any;
      } else if (typeof v === 'object') {
        // Prevent deep nesting; store a compact summary
        copy[key] = '[object]';
      }
    }
    return copy;
  } catch {
    return undefined;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Validate via Zod (api scope schema)
    const parsed = analyticsEventSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ ok: false, error: 'Invalid body', issues: parsed.error.issues });
    }

    const body = (parsed.data || {}) as AnalyticsEventBody & Record<string, unknown>;
    const event = body.event;
    const timestamp =
      typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString();
    const data = sanitizeData(body.data) || {};

    if (!isValidEventName(event)) {
      return res.status(400).json({ ok: false, error: 'Invalid event name' });
    }

    // Stub persistence: write to console (isolation from src/* database)
    console.log('[AnalyticsEvent]', {
      event,
      data,
      timestamp,
      clientId: (body as any).clientId,
      sessionId: (body as any).sessionId,
      path: (body as any).path,
      ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    // Respond success
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[AnalyticsEvent] Error', e);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
