// src/services/payment/PaymentService.ts
import { subscriptionPlans } from '@/config';

export type PaymentProvider = 'paypay' | 'linepay' | 'creditcard';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface PaymentRequest {
  userId: string;
  planId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
}

interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  error?: string;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: PaymentProvider;
}

class PaymentService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Payment creation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment error:', error);
      return {
        paymentId: '',
        status: 'failed',
        error: '決済の作成に失敗しました',
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}/verify`);

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data.status;
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: PaymentProvider
  ): Promise<Subscription> {
    const plan = this.getPlanDetails(planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    const response = await fetch(`${this.apiUrl}/subscriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        planId,
        paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error('Subscription creation failed');
    }

    return await response.json();
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const response = await fetch(`${this.apiUrl}/subscriptions/user/${userId}`);

    if (!response.ok) {
      return null;
    }

    const subscriptions = await response.json();
    return subscriptions.find((sub: Subscription) => sub.status === 'active') || null;
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });

    return response.ok;
  }

  async getPaymentHistory(userId: string): Promise<PaymentResponse[]> {
    const response = await fetch(`${this.apiUrl}/payments/user/${userId}`);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  }

  getPlanDetails(planId: string) {
    const allPlans = [
      subscriptionPlans.premium.monthly,
      subscriptionPlans.premium.annual,
      subscriptionPlans.business,
    ];

    return allPlans.find((plan) => plan.id === planId);
  }

  calculateSavings(monthlyPrice: number, annualPrice: number): number {
    const yearlyFromMonthly = monthlyPrice * 12;
    return Math.round(((yearlyFromMonthly - annualPrice) / yearlyFromMonthly) * 100);
  }

  formatPrice(amount: number, currency: string = 'JPY'): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // PayPay決済用のQRコード生成
  async generatePayPayQR(paymentId: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}/paypay-qr`);

    if (!response.ok) {
      throw new Error('PayPay QR generation failed');
    }

    const data = await response.json();
    return data.qrCodeUrl;
  }

  // LINE Pay決済用のリダイレクトURL取得
  async getLinePayUrl(paymentId: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/payments/${paymentId}/linepay-url`);

    if (!response.ok) {
      throw new Error('LINE Pay URL generation failed');
    }

    const data = await response.json();
    return data.redirectUrl;
  }
}

export default new PaymentService();
