// CJS-friendly and lazy: resolve mongoose at call time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
let cachedModel: any = null;

async function ensureSubscriptionModel(): Promise<any> {
  if (cachedModel) return cachedModel;
  const m = mongoLib.mongoose || (mongoLib.getMongoose ? await mongoLib.getMongoose() : null);
  if (!m) throw new Error('Mongoose unavailable');
  const existing = m.models?.Subscription;
  if (existing) {
    cachedModel = existing;
    return cachedModel;
  }
  const SubscriptionSchema = new m.Schema(
    {
      userId: { type: m.Schema.Types.ObjectId, ref: 'User', index: true },
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
  cachedModel = m.model('Subscription', SubscriptionSchema, 'subscriptions');
  return cachedModel;
}

module.exports = { ensureSubscriptionModel };
