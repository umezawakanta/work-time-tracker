import { connectDB } from '../../server/config/database';
import mongoose from 'mongoose';

export class SubscriptionService {
  private static instance: SubscriptionService;

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // サブスクリプション状態を更新
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
    updateData: any
  ): Promise<void> {
    try {
      await connectDB();

      // Subscriptionモデルを動的にインポート（named export）
      const { SubscriptionModel } = await import('../../server/models/Subscription');

      await SubscriptionModel.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          status,
          ...updateData,
          lastSyncAt: new Date(),
          syncStatus: 'synced',
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Subscription ${subscriptionId} updated to status: ${status}`);
    } catch (error) {
      console.error('❌ Failed to update subscription status:', error);
      throw error;
    }
  }

  // サブスクリプションを作成
  async createSubscription(subscriptionData: any): Promise<void> {
    try {
      await connectDB();

      const { SubscriptionModel } = await import('../../server/models/Subscription');

      const subscription = new SubscriptionModel({
        ...subscriptionData,
        createdAt: new Date(),
        syncStatus: 'synced',
        lastSyncAt: new Date(),
      });

      await subscription.save();
      console.log(`✅ Subscription created: ${subscriptionData.stripeSubscriptionId}`);
    } catch (error) {
      console.error('❌ Failed to create subscription:', error);
      throw error;
    }
  }

  // ユーザーの機能アクセスを更新
  async updateUserFeatureAccess(
    customerId: string,
    planType: string,
    isPremium: boolean
  ): Promise<void> {
    try {
      await connectDB();

      const { UserModel } = await import('../../server/models/User');

      // customerIdからuserIdを取得
      const { SubscriptionModel } = await import('../../server/models/Subscription');
      const subscription = await SubscriptionModel.findOne({ stripeCustomerId: customerId });

      if (!subscription) {
        console.warn(`⚠️ No subscription found for customer: ${customerId}`);
        return;
      }

      await UserModel.findByIdAndUpdate(subscription.userId, {
        subscriptionStatus: planType,
        isPremium,
        updatedAt: new Date(),
      });

      console.log(`✅ User feature access updated for customer: ${customerId}`);
    } catch (error) {
      console.error('❌ Failed to update user feature access:', error);
      throw error;
    }
  }
}
