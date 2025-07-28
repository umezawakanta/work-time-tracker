import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { User } from '../../src/server/models/User';
import { SubscriptionModel, SubscriptionPlanModel } from '../../src/server/models/Subscription';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { stripe } from '../../src/config/stripe';

interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  billingCycle?: 'monthly' | 'yearly';
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    const {
      planId,
      paymentMethodId,
      billingCycle = 'monthly',
    }: CreateSubscriptionRequest = req.body;
    const userId = req.user!.userId;

    if (!planId) {
      res.status(400).json({
        success: false,
        error: 'Plan ID is required',
        message: 'プランIDが必要です',
      });
      return;
    }

    console.log('🔄 Creating subscription:', { userId, planId, billingCycle });

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findOne({ $or: [{ _id: userId }, { id: userId }] });
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません',
      });
      return;
    }

    // Get plan
    const plan = await SubscriptionPlanModel.findOne({
      $or: [{ _id: planId }, { id: planId }],
      isActive: true,
    });
    if (!plan) {
      res.status(404).json({
        success: false,
        error: 'Plan not found',
        message: '指定されたプランが見つかりません',
      });
      return;
    }

    // Check if user already has an active subscription
    const existingSubscription = await SubscriptionModel.findOne({
      userId: user.id,
      status: { $in: ['active', 'trialing'] },
    });

    // If free plan, create directly without Stripe
    if (plan.price === 0) {
      // Cancel existing subscription if upgrading from paid to free
      if (existingSubscription && existingSubscription.amount > 0) {
        existingSubscription.status = 'cancelled';
        existingSubscription.cancelledAt = new Date().toISOString();
        await existingSubscription.save();
      }

      const freeSubscription = new SubscriptionModel({
        userId: user.id,
        planId: plan.id,
        stripeCustomerId: user.metadata?.stripeCustomerId || `local_customer_${user.id}`,
        stripeSubscriptionId: `local_sub_free_${Date.now()}`,
        planName: plan.name,
        planType: 'free',
        billingCycle: 'monthly',
        amount: 0,
        currency: 'jpy',
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'trialing',
        paymentStatus: 'paid',
        usage: {
          period: new Date().toISOString().slice(0, 7),
          workHours: 0,
          projects: 0,
          tasks: 0,
          reports: 0,
          apiCalls: 0,
          storage: 0,
          teamMembers: 0,
          integrations: 0,
        },
        limits: plan.limits,
        addOns: [],
      });

      await freeSubscription.save();

      res.status(201).json({
        success: true,
        data: {
          subscription: freeSubscription,
          message: 'フリープランに登録しました',
        },
      });
      return;
    }

    // For paid plans, handle Stripe integration
    if (!stripe) {
      // Fallback for development without Stripe
      console.warn('⚠️ Stripe not configured, creating mock subscription');

      const mockSubscription = new SubscriptionModel({
        userId: user.id,
        planId: plan.id,
        stripeCustomerId: `mock_customer_${user.id}`,
        stripeSubscriptionId: `mock_sub_${Date.now()}`,
        planName: plan.name,
        planType:
          plan.target === 'individual'
            ? 'basic'
            : plan.target === 'team'
              ? 'premium'
              : 'enterprise',
        billingCycle,
        amount: plan.price,
        currency: plan.currency,
        startDate: new Date().toISOString(),
        trialEndDate:
          plan.trialDays > 0
            ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        status: plan.trialDays > 0 ? 'trialing' : 'active',
        paymentStatus: 'paid',
        usage: {
          period: new Date().toISOString().slice(0, 7),
          workHours: 0,
          projects: 0,
          tasks: 0,
          reports: 0,
          apiCalls: 0,
          storage: 0,
          teamMembers: 0,
          integrations: 0,
        },
        limits: plan.limits,
        addOns: [],
      });

      await mockSubscription.save();

      res.status(201).json({
        success: true,
        data: {
          subscription: mockSubscription,
          message: 'サブスクリプションを作成しました（開発環境）',
        },
      });
      return;
    }

    // Real Stripe integration
    let stripeCustomerId = user.metadata?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      user.metadata = { ...user.metadata, stripeCustomerId };
      await user.save();
    }

    // Get appropriate price ID based on billing cycle
    const priceId =
      billingCycle === 'yearly' && plan.stripePriceId.includes('monthly')
        ? plan.stripePriceId.replace('monthly', 'yearly')
        : plan.stripePriceId;

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    });

    // Create subscription record
    const subscription = new SubscriptionModel({
      userId: user.id,
      planId: plan.id,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscription.id,
      planName: plan.name,
      planType:
        plan.target === 'individual' ? 'basic' : plan.target === 'team' ? 'premium' : 'enterprise',
      billingCycle,
      amount: plan.price,
      currency: plan.currency,
      startDate: new Date(stripeSubscription.created * 1000).toISOString(),
      trialEndDate: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000).toISOString()
        : undefined,
      status: stripeSubscription.status as any,
      paymentStatus: 'pending',
      usage: {
        period: new Date().toISOString().slice(0, 7),
        workHours: 0,
        projects: 0,
        tasks: 0,
        reports: 0,
        apiCalls: 0,
        storage: 0,
        teamMembers: 0,
        integrations: 0,
      },
      limits: plan.limits,
      addOns: [],
    });

    await subscription.save();

    // Cancel existing subscription if exists
    if (existingSubscription && existingSubscription.stripeSubscriptionId.startsWith('sub_')) {
      try {
        await stripe.subscriptions.cancel(existingSubscription.stripeSubscriptionId);
        existingSubscription.status = 'cancelled';
        existingSubscription.cancelledAt = new Date().toISOString();
        await existingSubscription.save();
      } catch (cancelError) {
        console.warn('⚠️ Failed to cancel existing subscription:', cancelError);
      }
    }

    console.log('✅ Subscription created:', {
      subscriptionId: subscription.id,
      stripeSubscriptionId: stripeSubscription.id,
      userId: user.id,
      planName: plan.name,
    });

    res.status(201).json({
      success: true,
      data: {
        subscription,
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret,
        message: 'サブスクリプションを作成しました',
      },
    });
  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'サブスクリプションの作成中にエラーが発生しました',
    });
  }
};

// Export with authentication
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false,
});
