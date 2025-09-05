// Resolve current user from Authorization header and ensure Stripe customer linkage
// CommonJS only to avoid ESM pitfalls in Vercel functions

async function verifyJwtAndExtract(req) {
  const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
  const header = typeof auth === 'string' ? auth : '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new Error('UNAUTHORIZED');
  const jwtMod = await import('jsonwebtoken');
  const jwt = jwtMod.default || jwtMod;
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  const decoded = jwt.verify(token, secret, {
    issuer: 'work-time-tracker',
    audience: 'work-time-tracker-users',
  });
  const obj = decoded || {};
  return {
    userId: String(obj.userId || ''),
    email: String(obj.email || ''),
    name: String(obj.displayName || obj.name || ''),
  };
}

async function ensureDbAndUserModel() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mongoLib = require('../_lib/mongo');
  if (mongoLib.connectMongoDirect) {
    await mongoLib.connectMongoDirect();
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ensureUserModel } = require('../_schemas/user');
  const User = await ensureUserModel();
  return User;
}

async function findUserByIdLoose(User, userId) {
  const u = await User.findOne({ $or: [{ _id: userId }, { id: userId }] });
  if (!u) throw new Error('USER_NOT_FOUND');
  return u;
}

async function ensureStripeCustomerForUser(user, stripe) {
  const meta = user.metadata || {};
  if (meta.stripeCustomerId) return meta.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName || user.username || user.name || undefined,
    metadata: { userId: String(user.id || user._id || '') },
  });
  user.metadata = { ...meta, stripeCustomerId: customer.id };
  await user.save();
  return customer.id;
}

module.exports = {
  verifyJwtAndExtract,
  ensureDbAndUserModel,
  findUserByIdLoose,
  ensureStripeCustomerForUser,
};


