import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import { ENV, getEnv } from '@/utils/env';

// Mask helper for safe console logging
const maskKey = (raw?: string): string => {
  if (!raw) return 'undefined';
  const head = raw.slice(0, 6);
  const tail = raw.slice(-4);
  return `${head}...${tail} (len=${raw.length})`;
};

const debugStripeEnv = () => {
  try {
    let importMetaEnv: Record<string, any> | undefined;
    try {
      importMetaEnv = (0, eval)('import.meta').env as Record<string, any> | undefined;
    } catch {}
    const fromImportMeta = importMetaEnv?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    const fromHelper = ENV.STRIPE_PUBLISHABLE_KEY();
    const winEnv = typeof window !== 'undefined' ? (window as any).__VITE_ENV__ : undefined;
    const fromWindow = winEnv?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    const fromProcess =
      typeof process !== 'undefined'
        ? (process.env as any)?.VITE_STRIPE_PUBLISHABLE_KEY
        : undefined;

    console.log('[stripe.env] diagnostics', {
      isBrowser: typeof window !== 'undefined',
      hasImportMeta: Boolean(importMetaEnv),
      key_importMeta: maskKey(fromImportMeta),
      key_helper: maskKey(fromHelper || undefined),
      key_window: maskKey(fromWindow),
      key_process: maskKey(fromProcess),
      nodeEnv: typeof process !== 'undefined' ? process.env?.NODE_ENV : 'unknown',
    });
  } catch (e) {
    console.warn('[stripe.env] diagnostics failed', e);
  }
};

// Environment variables validation
const validateStripeConfig = () => {
  console.log('[validateStripeConfig] start', { isBrowser: typeof window !== 'undefined' });
  const requiredServerKeys = ['STRIPE_SECRET_KEY'];
  console.log('[validateStripeConfig] requiredServerKeys:', requiredServerKeys);
  const requiredClientKeys = ['VITE_STRIPE_PUBLISHABLE_KEY'];
  console.log('[validateStripeConfig] requiredClientKeys:', requiredClientKeys);

  // Server-side validation (Node.js environment)
  if (typeof window === 'undefined') {
    const missingServerKeys = requiredServerKeys.filter((key) => !process.env[key]);
    console.error('[validateStripeConfig] missingServerKeys:', missingServerKeys);
    if (missingServerKeys.length > 0) {
      console.error('[validateStripeConfig] missingServerKeys:', missingServerKeys);
      if (process.env.NODE_ENV === 'development') {
        console.error('[validateStripeConfig] missingServerKeys:', missingServerKeys);
        console.error('🚧 Development: Missing Stripe server keys:', missingServerKeys);
        return false;
      } else {
        console.error('[validateStripeConfig] missingServerKeys:', missingServerKeys);
        console.error('❌ Production: Missing required Stripe server keys:', missingServerKeys);
        throw new Error(`Missing Stripe server configuration: ${missingServerKeys.join(', ')}`);
      }
    }
  }

  // Client-side validation (browser environment)
  if (typeof window !== 'undefined') {
    debugStripeEnv();
    const missingClientKeys = requiredClientKeys.filter((key) => !getEnv(key));

    if (missingClientKeys.length > 0) {
      if (ENV.isDev()) {
        console.error('🚧 Development: Missing Stripe client keys:', missingClientKeys);
        debugStripeEnv();
        return false;
      } else {
        console.error('❌ Production: Missing required Stripe client keys:', missingClientKeys);
        debugStripeEnv();
        throw new Error(`Missing Stripe client configuration: ${missingClientKeys.join(', ')}`);
      }
    }
  }

  return true;
};

// Server-side Stripe instance (Node.js only)
let stripe: Stripe | null = null;

if (typeof window === 'undefined') {
  const isConfigValid = validateStripeConfig();

  if (isConfigValid && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
      telemetry: false,
    });
    console.log('✅ Stripe server initialized successfully');
  } else {
    console.log('🎭 Development: Using mock Stripe server');
    // Mock Stripe for development
    stripe = null;
  }
}

// Client-side Stripe promise (browser only)
let stripePromise: Promise<StripeJS | null> | null = null;

if (typeof window !== 'undefined') {
  const isConfigValid = validateStripeConfig();

  if (isConfigValid && ENV.STRIPE_PUBLISHABLE_KEY()) {
    const key = ENV.STRIPE_PUBLISHABLE_KEY()!;
    console.log('[stripe.client] initializing', { key: maskKey(key) });
    stripePromise = loadStripe(key);
    console.log('✅ Stripe client initialized successfully');
  } else {
    console.warn('[stripe.client] config invalid or missing key', {
      isConfigValid,
      key: maskKey(ENV.STRIPE_PUBLISHABLE_KEY() || undefined),
    });
    console.log('🎭 Development: Using mock Stripe client');
    stripePromise = Promise.resolve(null);
  }
}

// Stripe configuration
export const stripeConfig = {
  // Currency settings
  defaultCurrency: 'jpy',
  supportedCurrencies: ['jpy', 'usd', 'eur'],

  // Payment settings
  paymentMethods: ['card'],
  automaticPaymentMethods: { enabled: true },

  // Subscription settings
  subscriptionSettings: {
    paymentBehavior: 'default_incomplete' as const,
    expandBy: ['latest_invoice.payment_intent'] as const,
    collectPaymentMethod: true,
  },

  // Webhook settings
  webhookEndpointSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // Feature flags
  features: {
    enableTrials: true,
    enableProration: true,
    enableTaxes: false, // 日本の税制対応は後で実装
    enableCoupons: true,
    enableMeteredBilling: false,
  },
} as const;

// Subscription plan IDs (環境変数から取得するか、デフォルト値を使用)
export const stripePlans = {
  free: {
    priceId: process.env.STRIPE_FREE_PLAN_PRICE_ID || 'price_free_plan',
    productId: process.env.STRIPE_FREE_PLAN_PRODUCT_ID || 'prod_free_plan',
  },
  basic: {
    monthly: {
      priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly',
      productId: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_basic',
    },
    yearly: {
      priceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || 'price_basic_yearly',
      productId: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_basic',
    },
  },
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
      productId: process.env.STRIPE_PREMIUM_PRODUCT_ID || 'prod_premium',
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
      productId: process.env.STRIPE_PREMIUM_PRODUCT_ID || 'prod_premium',
    },
  },
  enterprise: {
    monthly: {
      priceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
      productId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || 'prod_enterprise',
    },
    yearly: {
      priceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
      productId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || 'prod_enterprise',
    },
  },
} as const;

// Helper functions
export const formatPrice = (amount: number, currency: string = 'jpy'): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: currency === 'jpy' ? 0 : 2,
  }).format(amount);
};

export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean => {
  if (!stripe) return false;

  try {
    stripe.webhooks.constructEvent(payload, signature, secret);
    return true;
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
};

// Export instances
export { stripe };
export { stripePromise };

// Development mode helpers
export const isDevelopmentMode = process.env.NODE_ENV === 'development';
export const isStripeEnabled = !!stripe || !!stripePromise;

// Type definitions for better TypeScript support
export type SupportedCurrency = (typeof stripeConfig.supportedCurrencies)[number];
export type StripePlanType = keyof typeof stripePlans;
export type BillingCycle = 'monthly' | 'yearly';

export interface StripeCustomerData {
  email: string;
  name?: string;
  phone?: string;
  address?: Stripe.AddressParam;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
  coupon?: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: SupportedCurrency;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export default {
  stripe,
  stripePromise,
  stripeConfig,
  stripePlans,
  formatPrice,
  validateWebhookSignature,
  isDevelopmentMode,
  isStripeEnabled,
};
