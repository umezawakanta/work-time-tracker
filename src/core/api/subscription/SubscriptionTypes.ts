export interface SubscriptionInfo {
  plan: string;
  active: boolean;
  expiresAt?: Date;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';
