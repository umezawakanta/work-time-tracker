// CJS-friendly: avoid top-level ESM import
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
const mongoose = mongoLib.mongoose as typeof import('mongoose');

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

function ensureSubscriptionModel() {
  return (
    mongoose.models.Subscription ||
    mongoose.model('Subscription', SubscriptionSchema, 'subscriptions')
  );
}

module.exports = { ensureSubscriptionModel };
