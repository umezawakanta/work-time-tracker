import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../../src/server/config/database';
import { PaymentModel as Payment } from '../../../../src/server/models/Subscription';

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

    const rows = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
      { $project: { month: '$_id', amount: 1, _id: 0 } },
      { $sort: { month: 1 } },
    ]);

    // Fill missing months with zeros
    const map = new Map<string, number>();
    rows.forEach((r: any) => map.set(r.month, r.amount));
    const series: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    for (let i = monthsParam - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = ym(d);
      series.push({ month: key, amount: map.get(key) || 0 });
    }

    res.status(200).json({ ok: true, data: { months: monthsParam, series } });
  } catch (error) {
    console.error('Failed to get revenue trend:', error);
    res.status(200).json({ ok: true, data: { months: 6, series: [] }, degraded: true });
  }
}
