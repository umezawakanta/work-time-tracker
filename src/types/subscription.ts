export interface Subscription {
  id: string;
  plan: SubscriptionInfo;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  paymentMethod: string;
  amount: number;
}

export interface SubscriptionInfo {
  id: string;
  name: string;
  features: string[];
  price: number;
  billing: 'monthly' | 'yearly';
}

export interface SubscriptionSummary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  plans: SubscriptionInfo[];
  monthlyRevenue: number;
  yearlyRevenue: number;
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
