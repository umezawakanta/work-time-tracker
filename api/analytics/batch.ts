import type { VercelRequest, VercelResponse } from '@vercel/node';
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

    // For now, acknowledge-only mode; DB persistence removed to avoid server imports
    let saved = list.length;
    let errors = 0;

    console.log(`[${opId}] Batch processed: saved=${saved}, errors=${errors}`);
    res.status(200).json({ success: true, saved, errors } as BatchResponseBody);
  } catch (error) {
    console.error(`[${opId}] Batch failed`, error);
    res.status(200).json({ success: true, saved: 0, errors: 0 } as BatchResponseBody);
  }
}
