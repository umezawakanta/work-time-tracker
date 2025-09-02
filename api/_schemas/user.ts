// CJS-friendly: avoid top-level ESM import
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
const mongoose = mongoLib.mongoose as typeof import('mongoose');

const UserSchema = new mongoose.Schema(
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

function ensureUserModel() {
  return mongoose.models.User || mongoose.model('User', UserSchema, 'users');
}

module.exports = { ensureUserModel };
