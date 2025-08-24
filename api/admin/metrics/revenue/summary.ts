import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../../src/server/config/database';
import {
  SubscriptionModel as Subscription,
  PaymentModel as Payment,
} from '../../../../src/server/models/Subscription';

function startOfUTCMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    await connectDB();
    const now = new Date();
    const thisMonthStart = startOfUTCMonth(now);
    const prevMonthStart = startOfUTCMonth(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    );
    const prevMonthEnd = thisMonthStart;

    const currentMonthPayments = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const previousMonthPayments = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const mrr = Math.round(currentMonthPayments?.[0]?.total || 0);
    const prevMrr = Math.round(previousMonthPayments?.[0]?.total || 0);
    const arr = mrr * 12;

    const activePaid = await Subscription.countDocuments({ status: 'active' }).catch(() => 0);
    const newPaidThisMonth = await Subscription.countDocuments({
      createdAt: { $gte: thisMonthStart },
    }).catch(() => 0);

    // Simple placeholders when detailed cohorts are unavailable
    const churnRate = 0; // TODO: compute from cancellations over starting active users
    const conversionRate = 0; // TODO: compute from new subscriptions / trials or visits

    res
      .status(200)
      .json({
        ok: true,
        data: { mrr, arr, churnRate, conversionRate, activePaid, newPaidThisMonth, prevMrr },
      });
  } catch (error) {
    console.error('Failed to get revenue summary:', error);
    res
      .status(200)
      .json({
        ok: true,
        data: {
          mrr: 0,
          arr: 0,
          churnRate: 0,
          conversionRate: 0,
          activePaid: 0,
          newPaidThisMonth: 0,
          prevMrr: 0,
        },
        degraded: true,
      });
  }
}
