export interface SubscriptionInfo {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
}

export type PremiumPlanType = 'basic' | 'pro' | 'enterprise';
export type PremiumPlanCycle = 'monthly' | 'yearly';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  plans: SubscriptionPlan[];
  limit?: number;
}

export interface PricingPlans {
  [term: string]: {
    [plan: string]: number;
  };
}
