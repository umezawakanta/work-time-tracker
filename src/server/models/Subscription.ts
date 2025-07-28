import mongoose, { Schema, Document } from 'mongoose';
import {
  Subscription,
  SubscriptionPlan,
  Payment,
  Invoice,
} from '@/database/schema/UnifiedDatabaseSchema';

// Simplified document interfaces to avoid conflicts
export interface SubscriptionDocument extends Document {
  userId: string;
  planId: string;
  planName: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete';
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanDocument extends Document {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDocument extends Document {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceDocument extends Document {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subdocument schemas
const SubscriptionUsageSchema = new Schema(
  {
    period: { type: String, required: true }, // YYYY-MM
    workHours: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    tasks: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    storage: { type: Number, default: 0 }, // bytes
    teamMembers: { type: Number, default: 0 },
    integrations: { type: Number, default: 0 },
  },
  { _id: false }
);

const SubscriptionLimitsSchema = new Schema(
  {
    workHours: { type: Number, default: -1 }, // -1 for unlimited
    projects: { type: Number, default: -1 },
    tasks: { type: Number, default: -1 },
    reports: { type: Number, default: -1 },
    apiCalls: { type: Number, default: -1 },
    storage: { type: Number, default: -1 }, // bytes
    teamMembers: { type: Number, default: 1 },
    integrations: { type: Number, default: -1 },
    advancedFeatures: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
  },
  { _id: false }
);

const PlanFeatureSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    included: { type: Boolean, required: true },
    limit: { type: Number },
    category: {
      type: String,
      enum: ['core', 'advanced', 'integration', 'support'],
      required: true,
    },
  },
  { _id: false }
);

const AddOnSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const DiscountInfoSchema = new Schema(
  {
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    validUntil: { type: String },
    appliedAt: { type: String, required: true },
  },
  { _id: false }
);

const PaymentMethodSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'paypal', 'other'],
      required: true,
    },
    card: {
      brand: { type: String },
      last4: { type: String },
      expMonth: { type: Number },
      expYear: { type: Number },
    },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const InvoiceLineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitAmount: { type: Number, required: true },
    amount: { type: Number, required: true },
    period: {
      start: { type: String },
      end: { type: String },
    },
    proration: { type: Boolean, default: false },
  },
  { _id: false }
);

// Main schemas
const SubscriptionSchema = new Schema(
  {
    // 基本情報
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true, index: true },
    stripeCustomerId: { type: String, required: true, index: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },

    // プラン詳細
    planName: { type: String, required: true },
    planType: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'jpy' },

    // 期間
    startDate: { type: String, required: true },
    endDate: { type: String },
    trialEndDate: { type: String },
    cancelledAt: { type: String },
    cancelAtPeriodEnd: { type: Boolean, default: false },

    // 状態
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'cancelled', 'unpaid', 'incomplete'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      required: true,
    },

    // 使用量
    usage: { type: SubscriptionUsageSchema, required: true },
    limits: { type: SubscriptionLimitsSchema, required: true },

    // メタデータ
    discount: DiscountInfoSchema,
    addOns: [AddOnSchema],

    // Base fields
    version: { type: Number, default: 1 },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict', 'error'],
      default: 'synced',
    },
    lastSyncAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SubscriptionPlanSchema = new Schema(
  {
    // 基本情報
    name: { type: String, required: true },
    description: { type: String, required: true },
    stripePriceId: { type: String, required: true, unique: true },
    stripeProductId: { type: String, required: true },

    // 価格
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: 'jpy' },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      required: true,
    },

    // 制限
    limits: { type: SubscriptionLimitsSchema, required: true },
    features: [PlanFeatureSchema],

    // 設定
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    trialDays: { type: Number, default: 0 },

    // 対象
    target: {
      type: String,
      enum: ['individual', 'team', 'enterprise'],
      required: true,
    },
    maxUsers: { type: Number, default: 1 },

    // Base fields
    version: { type: Number, default: 1 },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict', 'error'],
      default: 'synced',
    },
    lastSyncAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PaymentSchema = new Schema(
  {
    // 基本情報
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    stripeChargeId: { type: String },

    // 金額
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'jpy' },
    amountReceived: { type: Number, required: true },

    // 状態
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'cancelled', 'refunded'],
      required: true,
    },
    paymentMethod: { type: PaymentMethodSchema, required: true },

    // 期間
    paidAt: { type: String },
    refundedAt: { type: String },
    failedAt: { type: String },

    // 詳細
    description: { type: String },
    invoiceId: { type: String },
    receiptUrl: { type: String },
    failureReason: { type: String },

    // Base fields
    version: { type: Number, default: 1 },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict', 'error'],
      default: 'synced',
    },
    lastSyncAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const InvoiceSchema = new Schema(
  {
    // 基本情報
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: String, index: true },
    stripeInvoiceId: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },

    // 金額
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, required: true },
    currency: { type: String, required: true, default: 'jpy' },

    // 期間
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    dueDate: { type: String, required: true },
    paidAt: { type: String },

    // 状態
    status: {
      type: String,
      enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
      required: true,
    },

    // ファイル
    pdfUrl: { type: String },
    hostedInvoiceUrl: { type: String },

    // 項目
    lineItems: [InvoiceLineItemSchema],

    // Base fields
    version: { type: Number, default: 1 },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict', 'error'],
      default: 'synced',
    },
    lastSyncAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ planType: 1 });

SubscriptionPlanSchema.index({ target: 1, isActive: 1 });
SubscriptionPlanSchema.index({ sortOrder: 1 });

PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });

InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Virtuals
// Virtual for id field
SubscriptionSchema.virtual('id').get(function () {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

// Ensure virtual fields are serialized
SubscriptionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Pre-save middleware
SubscriptionSchema.pre('save', function (next) {
  if (this.isModified()) {
    (this as any).version += 1;
  }
  next();
});

// Static methods
SubscriptionSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

SubscriptionSchema.statics.findActiveSubscription = function (userId: string) {
  return this.findOne({ userId, status: { $in: ['active', 'trialing'] } });
};

PaymentSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

InvoiceSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

export const SubscriptionModel = mongoose.model<SubscriptionDocument>(
  'Subscription',
  SubscriptionSchema
);
export const SubscriptionPlanModel = mongoose.model<SubscriptionPlanDocument>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);
export const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);
export const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);

export {
  SubscriptionModel as Subscription,
  SubscriptionPlanModel as SubscriptionPlan,
  PaymentModel as Payment,
  InvoiceModel as Invoice,
};
