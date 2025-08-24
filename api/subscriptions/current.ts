import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { SubscriptionModel } from '../../src/server/models/Subscription';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    const userId = req.user!.userId;

    console.log('🔍 Fetching current subscription for user:', userId);

    // Connect to database
    await connectDB();

    // Get current active subscription
    const subscription = await SubscriptionModel.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      res.status(404).json({
        success: false,
        error: 'No active subscription found',
        message: 'アクティブなサブスクリプションが見つかりません',
      });
      return;
    }

    // Calculate usage percentage for limits
    const usagePercentages = {
      workHours:
        subscription.limits?.workHours > 0
          ? Math.round(((subscription.usage?.workHours ?? 0) / subscription.limits.workHours) * 100)
          : 0,
      projects:
        subscription.limits?.projects > 0
          ? Math.round(((subscription.usage?.projects ?? 0) / subscription.limits.projects) * 100)
          : 0,
      tasks:
        subscription.limits?.tasks > 0
          ? Math.round(((subscription.usage?.tasks ?? 0) / subscription.limits.tasks) * 100)
          : 0,
      reports:
        subscription.limits?.reports > 0
          ? Math.round(((subscription.usage?.reports ?? 0) / subscription.limits.reports) * 100)
          : 0,
      storage:
        subscription.limits?.storage > 0
          ? Math.round(((subscription.usage?.storage ?? 0) / subscription.limits.storage) * 100)
          : 0,
    };

    // Check if trial is ending soon
    const isTrialEndingSoon =
      subscription.trialEndDate &&
      new Date(subscription.trialEndDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000; // 3 days

    // Check if any limits are near capacity
    const nearLimits = Object.entries(usagePercentages)
      .filter(([_, percentage]) => percentage > 80)
      .map(([limit, percentage]) => ({ limit, percentage }));

    console.log('✅ Current subscription retrieved:', {
      subscriptionId: subscription.id,
      planType: subscription.planType,
      status: subscription.status,
      usagePercentages,
      isTrialEndingSoon,
      nearLimits: nearLimits.length,
    });

    res.status(200).json({
      success: true,
      data: {
        subscription,
        usage: {
          current: subscription.usage ?? {},
          limits: subscription.limits ?? {},
          percentages: usagePercentages,
        },
        alerts: {
          isTrialEndingSoon,
          nearLimits,
        },
      },
      message: '現在のサブスクリプションを取得しました',
    });
  } catch (error) {
    console.error('❌ Error fetching current subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'サブスクリプションの取得中にエラーが発生しました',
    });
  }
};

// Export with authentication
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false,
});
