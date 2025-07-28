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
  confirmationToken?: string; // 重複防止用
}

interface SubscriptionResponse {
  success: boolean;
  data?: {
    subscription: any;
    clientSecret?: string;
    message: string;
    nextSteps?: string[];
  };
  error?: string;
  message?: string;
  retryable?: boolean;
  errorCode?: string;
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'このメソッドは許可されていません',
    } as SubscriptionResponse);
    return;
  }

  const startTime = Date.now();
  const operationId = `subscription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const {
      planId,
      paymentMethodId,
      billingCycle = 'monthly',
      confirmationToken,
    }: CreateSubscriptionRequest = req.body;
    const userId = req.user!.userId;

    console.log(`🚀 [${operationId}] サブスクリプション作成開始:`, {
      userId,
      planId,
      billingCycle,
      hasPaymentMethod: !!paymentMethodId,
      hasConfirmationToken: !!confirmationToken,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
    });

    // 入力値検証
    if (!planId) {
      console.error(`❌ [${operationId}] プランIDが不足:`, { userId });
      res.status(400).json({
        success: false,
        error: 'Plan ID is required',
        message: 'プランIDが必要です。選択したプランを再度確認してください。',
        errorCode: 'PLAN_ID_MISSING',
        retryable: false,
      } as SubscriptionResponse);
      return;
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      console.error(`❌ [${operationId}] 無効な請求サイクル:`, { userId, billingCycle });
      res.status(400).json({
        success: false,
        error: 'Invalid billing cycle',
        message: '請求サイクルは月次または年次のみ選択可能です。',
        errorCode: 'INVALID_BILLING_CYCLE',
        retryable: false,
      } as SubscriptionResponse);
      return;
    }

    // データベース接続（リトライ機能付き）
    let dbConnected = false;
    for (let i = 0; i < 3; i++) {
      try {
        await connectDB();
        dbConnected = true;
        break;
      } catch (dbError) {
        console.warn(`⚠️ [${operationId}] DB接続試行 ${i + 1}/3 失敗:`, dbError);
        if (i === 2) throw dbError;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // 指数バックオフ
      }
    }

    if (!dbConnected) {
      throw new Error('Database connection failed after 3 attempts');
    }

    // ユーザー取得
    const user = await User.findOne({ $or: [{ _id: userId }, { id: userId }] });
    if (!user) {
      console.error(`❌ [${operationId}] ユーザーが見つからない:`, { userId });
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'ユーザーが見つかりません。再度ログインしてお試しください。',
        errorCode: 'USER_NOT_FOUND',
        retryable: false,
      } as SubscriptionResponse);
      return;
    }

    // プラン取得
    const plan = await SubscriptionPlanModel.findOne({
      $or: [{ _id: planId }, { id: planId }],
      isActive: true,
    });
    if (!plan) {
      console.error(`❌ [${operationId}] プランが見つからない:`, { planId });
      res.status(404).json({
        success: false,
        error: 'Plan not found',
        message: '指定されたプランが見つかりません。利用可能なプランを確認してください。',
        errorCode: 'PLAN_NOT_FOUND',
        retryable: false,
      } as SubscriptionResponse);
      return;
    }

    // 重複チェック（confirmationTokenがある場合）
    if (confirmationToken) {
      const existingOperation = await SubscriptionModel.findOne({
        userId: user.id,
        'metadata.confirmationToken': confirmationToken,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // 10分以内
      });

      if (existingOperation) {
        console.warn(`⚠️ [${operationId}] 重複操作検出:`, { confirmationToken });
        res.status(409).json({
          success: false,
          error: 'Duplicate operation',
          message: '同じ操作が既に実行中です。しばらくお待ちください。',
          errorCode: 'DUPLICATE_OPERATION',
          retryable: false,
        } as SubscriptionResponse);
        return;
      }
    }

    // 既存サブスクリプションのチェック
    const existingSubscription = await SubscriptionModel.findOne({
      userId: user.id,
      status: { $in: ['active', 'trialing'] },
    });

    // フリープランの場合の処理
    if (plan.price === 0) {
      console.log(`💰 [${operationId}] フリープラン登録:`, { userId, planName: plan.name });

      // 既存の有料サブスクリプションをキャンセル
      if (existingSubscription && (existingSubscription.amount ?? 0) > 0) {
        try {
          if (existingSubscription.stripeSubscriptionId?.startsWith('sub_') && stripe) {
            await stripe.subscriptions.cancel(existingSubscription.stripeSubscriptionId);
            console.log(`✅ [${operationId}] 既存Stripeサブスクリプションをキャンセル`);
          }
          existingSubscription.status = 'cancelled';
          existingSubscription.cancelledAt = new Date().toISOString();
          await existingSubscription.save();
        } catch (cancelError) {
          console.error(
            `❌ [${operationId}] 既存サブスクリプションのキャンセルに失敗:`,
            cancelError
          );
          // キャンセル失敗でも新しいフリープランは作成する
        }
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
        trialEndDate: new Date(
          Date.now() + (plan.trialDays ?? 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
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
        metadata: {
          operationId,
          confirmationToken,
          createdFrom: 'api',
          userAgent: req.headers['user-agent'],
          ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        },
      });

      await freeSubscription.save();

      console.log(`✅ [${operationId}] フリープラン作成完了 (${Date.now() - startTime}ms)`);

      res.status(201).json({
        success: true,
        data: {
          subscription: freeSubscription,
          message: 'フリープランに登録しました',
          nextSteps: [
            'プロフィールを設定してください',
            '最初のプロジェクトを作成してみましょう',
            '必要に応じて有料プランにアップグレードできます',
          ],
        },
      } as SubscriptionResponse);
      return;
    }

    // 有料プランの処理
    console.log(`💳 [${operationId}] 有料プラン処理開始:`, {
      planName: plan.name,
      amount: plan.price,
    });

    if (!stripe) {
      // 開発環境でのStripe未設定時のフォールバック
      console.warn(`⚠️ [${operationId}] Stripe未設定、モックサブスクリプション作成`);

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
          (plan.trialDays ?? 0) > 0
            ? new Date(Date.now() + (plan.trialDays ?? 0) * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        status: (plan.trialDays ?? 0) > 0 ? 'trialing' : 'active',
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
        metadata: {
          operationId,
          confirmationToken,
          createdFrom: 'api_mock',
          userAgent: req.headers['user-agent'],
          ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        },
      });

      await mockSubscription.save();

      console.log(
        `✅ [${operationId}] モックサブスクリプション作成完了 (${Date.now() - startTime}ms)`
      );

      res.status(201).json({
        success: true,
        data: {
          subscription: mockSubscription,
          message: 'サブスクリプションを作成しました（開発環境）',
          nextSteps: [
            'プロフィールを設定してください',
            '機能をお試しください',
            '不明な点があればサポートにお問い合わせください',
          ],
        },
      } as SubscriptionResponse);
      return;
    }

    // 本番Stripe処理
    let stripeCustomerId = user.metadata?.stripeCustomerId;

    // Stripeカスタマー作成（存在しない場合）
    if (!stripeCustomerId) {
      try {
        console.log(`👤 [${operationId}] Stripeカスタマー作成中...`);
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName,
          metadata: {
            userId: user.id,
            operationId,
          },
        });
        stripeCustomerId = customer.id;

        // ユーザーにStripeカスタマーIDを保存
        user.metadata = { ...user.metadata, stripeCustomerId };
        await user.save();

        console.log(`✅ [${operationId}] Stripeカスタマー作成完了:`, {
          customerId: stripeCustomerId,
        });
      } catch (customerError) {
        console.error(`❌ [${operationId}] Stripeカスタマー作成エラー:`, customerError);
        res.status(500).json({
          success: false,
          error: 'Customer creation failed',
          message: 'アカウントの設定中にエラーが発生しました。しばらく待ってからお試しください。',
          errorCode: 'STRIPE_CUSTOMER_ERROR',
          retryable: true,
        } as SubscriptionResponse);
        return;
      }
    }

    // 適切なPriceIDを取得
    const priceId =
      billingCycle === 'yearly' && plan.stripePriceId?.includes('monthly')
        ? plan.stripePriceId.replace('monthly', 'yearly')
        : (plan.stripePriceId ?? '');

    if (!priceId) {
      console.error(`❌ [${operationId}] PriceIDが設定されていない:`, { planId, billingCycle });
      res.status(500).json({
        success: false,
        error: 'Price ID not configured',
        message: 'プランの設定にエラーがあります。サポートにお問い合わせください。',
        errorCode: 'PRICE_ID_MISSING',
        retryable: false,
      } as SubscriptionResponse);
      return;
    }

    // Stripeサブスクリプション作成
    let stripeSubscription;
    try {
      console.log(`💳 [${operationId}] Stripeサブスクリプション作成中...`);
      stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: (plan.trialDays ?? 0) > 0 ? plan.trialDays : undefined,
        metadata: {
          userId: user.id,
          planId: plan.id,
          operationId,
        },
      });

      console.log(`✅ [${operationId}] Stripeサブスクリプション作成完了:`, {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
      });
    } catch (stripeError: any) {
      console.error(`❌ [${operationId}] Stripeサブスクリプション作成エラー:`, stripeError);

      const isRetryable = !['card_declined', 'insufficient_funds', 'invalid_cvc'].includes(
        stripeError.code
      );

      res.status(402).json({
        success: false,
        error: 'Payment error',
        message:
          stripeError.code === 'card_declined'
            ? 'カードが拒否されました。別のカードをお試しください。'
            : stripeError.code === 'insufficient_funds'
              ? '残高不足です。カードの残高を確認してください。'
              : stripeError.code === 'invalid_cvc'
                ? 'CVCコードが無効です。正しいコードを入力してください。'
                : '決済処理中にエラーが発生しました。しばらく待ってからお試しください。',
        errorCode: `STRIPE_${stripeError.code?.toUpperCase()}`,
        retryable: isRetryable,
      } as SubscriptionResponse);
      return;
    }

    // データベースにサブスクリプションを保存
    let subscription;
    try {
      subscription = new SubscriptionModel({
        userId: user.id,
        planId: plan.id,
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscription.id,
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
        metadata: {
          operationId,
          confirmationToken,
          createdFrom: 'api_stripe',
          userAgent: req.headers['user-agent'],
          ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        },
      });

      await subscription.save();
      console.log(`✅ [${operationId}] DBサブスクリプション保存完了`);
    } catch (dbSaveError) {
      console.error(`❌ [${operationId}] DBサブスクリプション保存エラー:`, dbSaveError);

      // Stripeサブスクリプションは作成されているので、クリーンアップを試行
      try {
        await stripe.subscriptions.cancel(stripeSubscription.id);
        console.log(`🧹 [${operationId}] Stripeサブスクリプションをクリーンアップ`);
      } catch (cleanupError) {
        console.error(`❌ [${operationId}] クリーンアップ失敗:`, cleanupError);
      }

      res.status(500).json({
        success: false,
        error: 'Database save failed',
        message:
          'サブスクリプションの保存中にエラーが発生しました。サポートにお問い合わせください。',
        errorCode: 'DB_SAVE_ERROR',
        retryable: true,
      } as SubscriptionResponse);
      return;
    }

    // 既存サブスクリプションのキャンセル
    if (existingSubscription && existingSubscription.stripeSubscriptionId?.startsWith('sub_')) {
      try {
        await stripe.subscriptions.cancel(existingSubscription.stripeSubscriptionId);
        existingSubscription.status = 'cancelled';
        existingSubscription.cancelledAt = new Date().toISOString();
        await existingSubscription.save();
        console.log(`✅ [${operationId}] 既存サブスクリプションをキャンセル`);
      } catch (cancelError) {
        console.warn(`⚠️ [${operationId}] 既存サブスクリプションのキャンセルに失敗:`, cancelError);
        // 新しいサブスクリプションは有効なので、エラーにはしない
      }
    }

    const clientSecret = (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret;

    console.log(`🎉 [${operationId}] サブスクリプション作成成功 (${Date.now() - startTime}ms):`, {
      subscriptionId: subscription.id,
      stripeSubscriptionId: stripeSubscription.id,
      userId: user.id,
      planName: plan.name,
      hasClientSecret: !!clientSecret,
    });

    res.status(201).json({
      success: true,
      data: {
        subscription,
        clientSecret,
        message: 'サブスクリプションを作成しました',
        nextSteps: [
          clientSecret
            ? '決済情報の確認を完了してください'
            : 'サブスクリプションが有効になりました',
          'プロフィールを設定してください',
          '新機能をお試しください',
          'ご不明な点があればサポートにお問い合わせください',
        ],
      },
    } as SubscriptionResponse);
  } catch (error: any) {
    console.error(`💥 [${operationId}] 予期しないエラー (${Date.now() - startTime}ms):`, {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        'サブスクリプションの作成中に予期しないエラーが発生しました。サポートにお問い合わせください。',
      errorCode: 'INTERNAL_ERROR',
      retryable: true,
    } as SubscriptionResponse);
  }
};

// Export with authentication
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false,
});
