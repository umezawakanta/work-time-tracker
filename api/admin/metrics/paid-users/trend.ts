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
  const months = Number(req.query?.months ?? 6);
  const now = new Date();
  const series = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: Math.max(0, Math.round(100 + Math.cos(i / 2) * 15)),
    };
  });
  res.status(200).json({ series });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../../src/server/config/database';
import { SubscriptionModel as Subscription } from '../../../../src/server/models/Subscription';

function ym(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    await connectDB();
    const monthsParam = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const since = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - (monthsParam - 1), 1)
    );

    const rows = await Subscription.aggregate([
      { $match: { createdAt: { $gte: since }, planType: { $ne: 'free' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $project: { month: '$_id', count: 1, _id: 0 } },
      { $sort: { month: 1 } },
    ]);

    const map = new Map<string, number>();
    rows.forEach((r: any) => map.set(r.month, r.count));
    const series: Array<{ month: string; count: number }> = [];
    const now = new Date();
    for (let i = monthsParam - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = ym(d);
      series.push({ month: key, count: map.get(key) || 0 });
    }

    res.status(200).json({ ok: true, data: { months: monthsParam, series } });
  } catch (error) {
    console.error('Failed to get paid users trend:', error);
    res.status(200).json({ ok: true, data: { months: 6, series: [] }, degraded: true });
  }
}
