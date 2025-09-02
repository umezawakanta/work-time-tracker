// CJS-friendly and lazy: resolve mongoose at call time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
let cachedModel: any = null;

async function ensureUserModel(): Promise<any> {
  if (cachedModel) return cachedModel;
  const m = mongoLib.mongoose || (mongoLib.getMongoose ? await mongoLib.getMongoose() : null);
  if (!m) throw new Error('Mongoose unavailable');
  const existing = m.models?.User;
  if (existing) {
    cachedModel = existing;
    return cachedModel;
  }
  const UserSchema = new m.Schema(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
      },
      password: { type: String, required: true },
      displayName: { type: String, required: true },
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: false },
      provider: { type: String, default: 'jwt' },
      status: { type: String, default: 'active' },
      metadata: {
        hashedPassword: { type: String },
        registrationSource: { type: String },
        userAgent: { type: String },
        ipAddress: { type: String },
        referralCode: { type: String },
        acceptedTermsAt: { type: String },
        subscribedNewsletter: { type: Boolean },
      },
      preferences: { type: Object, default: {} },
      settings: { type: Object, default: {} },
      stats: { type: Object, default: {} },
    },
    {
      timestamps: true,
      strict: false,
    }
  );
  cachedModel = m.model('User', UserSchema, 'users');
  return cachedModel;
}

module.exports = { ensureUserModel };
