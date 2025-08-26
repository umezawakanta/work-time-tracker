export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing' | string;

export class SubscriptionService {
  private static instance: SubscriptionService | null = null;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    payload: Record<string, unknown>
  ): Promise<void> {
    console.log('[SubscriptionService] updateSubscriptionStatus', {
      subscriptionId,
      status,
      payload,
    });
  }

  async updateUserFeatureAccess(
    customerId: string,
    tier: 'free' | 'premium' | string,
    enabled: boolean
  ): Promise<void> {
    console.log('[SubscriptionService] updateUserFeatureAccess', {
      customerId,
      tier,
      enabled,
    });
  }

  async createSubscription(data: Record<string, unknown>): Promise<void> {
    console.log('[SubscriptionService] createSubscription', data);
  }
}


