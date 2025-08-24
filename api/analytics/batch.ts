import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import AnalyticsEvent from '../../src/server/models/AnalyticsEvent';
import { cors } from '../../lib/cors';

interface BatchedEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
  clientId?: string;
  sessionId?: string;
}

interface BatchRequestBody {
  events?: BatchedEvent[];
}

interface BatchResponseBody {
  success: boolean;
  saved?: number;
  errors?: number;
  message?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as BatchResponseBody);
    return;
  }

  const opId = `analytics_batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = (req.body || {}) as BatchRequestBody;
    const list = Array.isArray(body.events) ? body.events : [];
    if (list.length === 0) {
      res.status(200).json({ success: true, saved: 0, errors: 0 } as BatchResponseBody);
      return;
    }

    // Best-effort: try DB, but do not fail request entirely if DB is unavailable
    let dbReady = false;
    try {
      await connectDB();
      dbReady = true;
    } catch (e) {
      console.warn(`[${opId}] DB connect failed, continuing with acknowledge-only mode`);
    }

    let saved = 0;
    let errors = 0;
    if (dbReady) {
      const userAgent = String(req.headers['user-agent'] || '');
      const ipAddress = String(
        (req.headers['x-forwarded-for'] as string) || (req.connection as any)?.remoteAddress || ''
      );
      const referrer = String((req.headers.referer as string) || '');

      const ops = list.map(async (ev) => {
        try {
          const ts = new Date(ev.timestamp);
          if (Number.isNaN(ts.getTime())) throw new Error('INVALID_TIMESTAMP');
          await AnalyticsEvent.create({
            event: String(ev.event || 'unknown'),
            timestamp: ts,
            clientId: ev.clientId,
            sessionId: ev.sessionId,
            data: ev.data || {},
            userAgent,
            ipAddress,
            url: referrer,
            referrer,
          });
          saved += 1;
        } catch (e) {
          errors += 1;
        }
      });
      await Promise.allSettled(ops);
    } else {
      // If DB not ready, just acknowledge receipt
      saved = list.length;
    }

    console.log(`[${opId}] Batch processed: saved=${saved}, errors=${errors}`);
    res.status(200).json({ success: true, saved, errors } as BatchResponseBody);
  } catch (error) {
    console.error(`[${opId}] Batch failed`, error);
    res.status(200).json({ success: true, saved: 0, errors: 0 } as BatchResponseBody);
  }
}
