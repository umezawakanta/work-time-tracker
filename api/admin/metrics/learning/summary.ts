import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  res.status(200).json({
    progressSaved30d: 134,
    uniqueLearners30d: 77,
    generatedAt: new Date().toISOString(),
  });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../../../lib/cors';
import { requireAdmin } from '../../../../lib/authAdmin';
import { connectDB } from '../../../../src/server/config/database';
import AnalyticsEvent from '../../../../src/server/models/AnalyticsEvent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ctx = requireAdmin(req, res);
  if (!ctx) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    const now = new Date();
    const since30 = new Date(now);
    since30.setDate(now.getDate() - 29);

    const progressSaved30d = await AnalyticsEvent.countDocuments({
      event: 'learning_progress_saved',
      timestamp: { $gte: since30 },
    }).catch(() => 0);
    const uniqueLearners30d = await AnalyticsEvent.distinct('userId', {
      event: 'learning_progress_saved',
      timestamp: { $gte: since30 },
    })
      .then((a) => a.filter(Boolean).length)
      .catch(() => 0);

    return res.status(200).json({
      ok: true,
      data: { progressSaved30d, uniqueLearners30d, generatedAt: now.toISOString() },
    });
  } catch (error) {
    console.error('Failed to get learning summary:', error);
    return res.status(200).json({
      ok: true,
      data: { progressSaved30d: 0, uniqueLearners30d: 0, generatedAt: new Date().toISOString() },
      degraded: true,
    });
  }
}
