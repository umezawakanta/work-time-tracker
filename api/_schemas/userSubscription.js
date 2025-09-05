// CJS-friendly Mongoose model for user subscriptions
// Kept minimal and permissive to avoid schema drift issues

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
let cachedModel = null;

async function ensureUserSubscriptionModel() {
    if (cachedModel) return cachedModel;
    const m = mongoLib.mongoose || (mongoLib.getMongoose ? await mongoLib.getMongoose() : null);
    if (!m) throw new Error('Mongoose unavailable');
    const existing = m.models && m.models.UserSubscription;
    if (existing) {
        cachedModel = existing;
        return cachedModel;
    }
    const UserSubscriptionSchema = new m.Schema(
        {
            userId: { type: String, required: true, index: true, unique: true },
            planId: { type: String, required: true },
            status: { type: String, enum: ['active', 'canceled', 'expired'], default: 'active' },
            currentPeriodEnd: { type: Date },
            cancelAtPeriodEnd: { type: Boolean, default: false },
            canceledAt: { type: Date },
            cancelReason: { type: String },
            checkStatuses: { type: Map, of: Boolean, default: {} },
            paymentMethod: {
                type: {
                    type: String,
                    enum: ['credit_card', 'bank_transfer', 'other'],
                },
                lastFour: String,
                expiryDate: String,
                cardholderName: String,
                isDefault: { type: Boolean, default: true },
            },
            scheduledChanges: {
                newPlanId: String,
                effectiveDate: Date,
            },
            resetAt: { type: Date },
            resetBy: { type: String },
        },
        { timestamps: true, strict: false }
    );
    UserSubscriptionSchema.index({ userId: 1 }, { unique: true });
    cachedModel = m.model('UserSubscription', UserSubscriptionSchema, 'userSubscriptions');
    return cachedModel;
}

module.exports = { ensureUserSubscriptionModel };


