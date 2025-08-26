import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { cors } from '../../lib/cors';

// Stripe設定
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  const operationId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  let event: Stripe.Event;

  try {
    console.log(`🔔 [${operationId}] Stripe webhook received`);

    if (!endpointSecret) {
      console.error(`❌ [${operationId}] Webhook secret not configured`);
      res.status(400).json({ error: 'Webhook secret not configured' });
      return;
    }

    // Webhookの署名を検証
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`✅ [${operationId}] Webhook signature verified: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ [${operationId}] Webhook signature verification failed:`, err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  try {
    // イベントタイプに応じた処理
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, operationId);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, operationId);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, operationId);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, operationId);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, operationId);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, operationId);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, operationId);
        break;

      default:
        console.log(`ℹ️ [${operationId}] Unhandled event type: ${event.type}`);
    }

    console.log(`✅ [${operationId}] Webhook processed successfully`);
    res.status(200).json({ received: true, operationId });
  } catch (error: any) {
    console.error(`💥 [${operationId}] Webhook processing error:`, {
      error: error.message,
      stack: error.stack,
      eventType: event.type,
    });

    res.status(500).json({
      error: 'Webhook processing failed',
      operationId,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// 決済成功処理
async function handlePaymentSucceeded(invoice: Stripe.Invoice, operationId: string) {
  console.log(`💰 [${operationId}] Payment succeeded for invoice: ${invoice.id}`);

  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) {
    console.log(`ℹ️ [${operationId}] One-time payment, no subscription update needed`);
    return;
  }

  try {
    // データベースでサブスクリプション状態を更新
    const { SubscriptionService } = await import('../_lib/subscription.js');
    const subscriptionService = SubscriptionService.getInstance();

    await subscriptionService.updateSubscriptionStatus(subscriptionId as string, 'active', {
      lastPaymentDate: new Date(invoice.created * 1000).toISOString(),
      lastPaymentAmount: invoice.amount_paid,
      paymentStatus: 'paid',
      metadata: {
        invoiceId: invoice.id,
        source: 'stripe_webhook',
        operationId,
      },
    });

    // ユーザーの機能制限を解除
    if (invoice.customer) {
      await subscriptionService.updateUserFeatureAccess(
        invoice.customer as string,
        'premium',
        true
      );
    }

    console.log(`✅ [${operationId}] Subscription activated for customer: ${invoice.customer}`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to update subscription:`, error.message);
    throw error;
  }
}

// 決済失敗処理
async function handlePaymentFailed(invoice: Stripe.Invoice, operationId: string) {
  console.log(`💸 [${operationId}] Payment failed for invoice: ${invoice.id}`);

  try {
    const { SubscriptionService } = await import('../_lib/subscription.js');
    const subscriptionService = SubscriptionService.getInstance();

    // サブスクリプション状態を「支払い遅延」に更新
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId) {
      await subscriptionService.updateSubscriptionStatus(subscriptionId as string, 'past_due', {
        paymentStatus: 'failed',
        failureReason: 'Payment failed',
        metadata: {
          invoiceId: invoice.id,
          source: 'stripe_webhook',
          operationId,
          attemptCount: invoice.attempt_count,
        },
      });
    }

    // ユーザーに通知（メール送信など）
    if (invoice.customer) {
      await sendPaymentFailureNotification(invoice.customer as string, invoice, operationId);
    }

    console.log(
      `⚠️ [${operationId}] Subscription marked as past_due for customer: ${invoice.customer}`
    );
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to handle payment failure:`, error.message);
    throw error;
  }
}

// サブスクリプション作成処理
async function handleSubscriptionCreated(subscription: Stripe.Subscription, operationId: string) {
  console.log(`🎉 [${operationId}] New subscription created: ${subscription.id}`);

  try {
    const { SubscriptionService } = await import('../_lib/subscription.js');
    const subscriptionService = SubscriptionService.getInstance();

    // データベースにサブスクリプションを記録
    await subscriptionService.createSubscription({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      userId: subscription.metadata.userId || 'unknown',
      planId: subscription.metadata.planId || 'unknown',
      status: subscription.status as any,
      startDate: new Date(subscription.created * 1000).toISOString(),
      trialEndDate: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : undefined,
      metadata: {
        source: 'stripe_webhook',
        operationId,
        priceId: subscription.items.data[0]?.price.id,
      },
    });

    console.log(`✅ [${operationId}] Subscription recorded in database`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to create subscription record:`, error.message);
    throw error;
  }
}

// サブスクリプション更新処理
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, operationId: string) {
  console.log(`🔄 [${operationId}] Subscription updated: ${subscription.id}`);

  try {
    const { SubscriptionService } = await import('../_lib/subscription.js');
    const subscriptionService = SubscriptionService.getInstance();

    await subscriptionService.updateSubscriptionStatus(
      subscription.id,
      subscription.status as any,
      {
        endDate: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : undefined,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        cancelledAt: (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000).toISOString()
          : undefined,
        metadata: {
          source: 'stripe_webhook',
          operationId,
          previousStatus: subscription.metadata.previousStatus,
        },
      }
    );

    console.log(`✅ [${operationId}] Subscription status updated to: ${subscription.status}`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to update subscription:`, error.message);
    throw error;
  }
}

// サブスクリプション削除処理
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, operationId: string) {
  console.log(`🗑️ [${operationId}] Subscription deleted: ${subscription.id}`);

  try {
    const { SubscriptionService } = await import('../_lib/subscription.js');
    const subscriptionService = SubscriptionService.getInstance();

    await subscriptionService.updateSubscriptionStatus(subscription.id, 'cancelled', {
      cancelledAt: new Date().toISOString(),
      endDate: new Date().toISOString(),
      metadata: {
        source: 'stripe_webhook',
        operationId,
        reason: 'subscription_deleted',
      },
    });

    // ユーザーの機能アクセスを制限
    await subscriptionService.updateUserFeatureAccess(
      subscription.customer as string,
      'free',
      false
    );

    console.log(`✅ [${operationId}] Subscription cancelled and user downgraded`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to handle subscription deletion:`, error.message);
    throw error;
  }
}

// PaymentIntent成功処理
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  operationId: string
) {
  console.log(`💳 [${operationId}] PaymentIntent succeeded: ${paymentIntent.id}`);

  try {
    const { PaymentService } = await import('../_lib/payment.js');
    const paymentService = PaymentService.getInstance();

    await paymentService.recordPayment({
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      customerId: paymentIntent.customer as string,
      description: paymentIntent.description || 'Payment',
      metadata: {
        source: 'stripe_webhook',
        operationId,
        paymentMethodId: paymentIntent.payment_method as string,
      },
    });

    console.log(`✅ [${operationId}] Payment recorded successfully`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to record payment:`, error.message);
    throw error;
  }
}

// PaymentIntent失敗処理
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, operationId: string) {
  console.log(`💥 [${operationId}] PaymentIntent failed: ${paymentIntent.id}`);

  try {
    const { PaymentService } = await import('../_lib/payment.js');
    const paymentService = PaymentService.getInstance();

    await paymentService.recordPayment({
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      customerId: paymentIntent.customer as string,
      description: paymentIntent.description || 'Failed Payment',
      failureReason: paymentIntent.last_payment_error?.message,
      metadata: {
        source: 'stripe_webhook',
        operationId,
        errorCode: paymentIntent.last_payment_error?.code,
      },
    });

    console.log(`⚠️ [${operationId}] Failed payment recorded`);
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to record failed payment:`, error.message);
    throw error;
  }
}

// 決済失敗通知の送信
async function sendPaymentFailureNotification(
  customerId: string,
  invoice: Stripe.Invoice,
  operationId: string
) {
  try {
    // ユーザー情報を取得
    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;

    if (!customer.email) {
      console.warn(`⚠️ [${operationId}] No email found for customer: ${customerId}`);
      return;
    }

    // メール送信サービス統合
    console.log(`📧 [${operationId}] Sending payment failure notification to: ${customer.email}`);

    try {
      // 実際のメール送信サービスを使用
      const { EmailService } = await import('../_lib/email.js');
      const emailService = EmailService.getInstance();

      await emailService.sendPaymentFailureNotification({
        to: customer.email!,
        customerName: customer.name ?? 'お客様',
        invoiceId: invoice.id!,
        amount: invoice.amount_due,
        currency: invoice.currency,
        dueDate: new Date((invoice.due_date ?? Date.now() / 1000) * 1000),
        attemptCount: invoice.attempt_count,
        nextRetry: invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000)
          : null,
      });

      console.log(`✅ [${operationId}] Payment failure notification sent successfully`);
    } catch (emailError: any) {
      console.error(`❌ [${operationId}] Failed to send email notification:`, emailError.message);
      // メール送信失敗は決済処理の失敗とはしない
    }
  } catch (error: any) {
    console.error(`❌ [${operationId}] Failed to send notification:`, error.message);
    // 通知失敗はエラーとして投げない（課金処理は正常に完了すべき）
  }
}
