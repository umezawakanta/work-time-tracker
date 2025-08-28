import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../lib/cors';
import { connectDB } from '../../../src/server/config/database';
import { AnalyticsEvent } from '../../../src/server/models/AnalyticsEvent';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    const hours = clamp(Number(req.query.hours || 24), 1, 72);
    await connectDB();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const distinct = await AnalyticsEvent.distinct('clientId', {
      timestamp: { $gte: since },
      event: { $in: ['page_view', 'page_view_end', 'ai_assistant_reply', 'assessment_saved'] },
    });
    const activeUsers = (distinct || []).filter(Boolean).length;

    return res.status(200).json({ success: true, data: { hours, activeUsers } });
  } catch (e) {
    console.error('[analytics/users/active] error', e);
    return res
      .status(200)
      .json({ success: true, data: { hours: 24, activeUsers: 0 }, degraded: true });
  }
}

// (removed duplicate legacy handler)
