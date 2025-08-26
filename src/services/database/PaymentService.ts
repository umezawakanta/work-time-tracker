import { connectDB } from '../../server/config/database';
import mongoose from 'mongoose';

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // 決済を記録
  async recordPayment(paymentData: {
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    customerId: string;
    description: string;
    failureReason?: string;
    metadata: any;
  }): Promise<void> {
    try {
      await connectDB();

      const { PaymentModel } = await import('../../server/models/Subscription');

      const payment = new PaymentModel({
        stripePaymentIntentId: paymentData.stripePaymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        amountReceived: paymentData.status === 'succeeded' ? paymentData.amount : 0,
        status: paymentData.status,
        description: paymentData.description,
        failureReason: paymentData.failureReason,
        metadata: paymentData.metadata,
        syncStatus: 'synced',
        lastSyncAt: new Date(),
        createdAt: new Date(),
        ...(paymentData.status === 'succeeded' && { paidAt: new Date().toISOString() }),
        ...(paymentData.status === 'failed' && { failedAt: new Date().toISOString() }),
      });

      await payment.save();
      console.log(`✅ Payment recorded: ${paymentData.stripePaymentIntentId}`);
    } catch (error) {
      console.error('❌ Failed to record payment:', error);
      throw error;
    }
  }

  // 決済履歴を取得
  async getPaymentHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      await connectDB();

      const { PaymentModel } = await import('../../server/models/Subscription');

      const payments = await PaymentModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return payments;
    } catch (error) {
      console.error('❌ Failed to get payment history:', error);
      throw error;
    }
  }
}
