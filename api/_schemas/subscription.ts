import { mongoose } from '../_lib/mongo';

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    planId: { type: String, required: true },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    planName: { type: String, required: true },
    planType: { type: String, required: true },
    billingCycle: { type: String, default: 'monthly' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'jpy' },
    startDate: { type: String },
    trialEndDate: { type: String },
    status: { type: String, default: 'trialing' },
    paymentStatus: { type: String, default: 'paid' },
    usage: { type: Object, default: {} },
    limits: { type: Object, default: {} },
    addOns: { type: Array, default: [] },
  },
  { timestamps: true, strict: false }
);

export function ensureSubscriptionModel() {
  return (
    mongoose.models.Subscription ||
    mongoose.model('Subscription', SubscriptionSchema, 'subscriptions')
  );
}
