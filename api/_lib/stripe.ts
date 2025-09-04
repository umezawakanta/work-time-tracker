// CJS-friendly dynamic Stripe loader
let stripeInstance: any = null;

async function getStripe(): Promise<any> {
  if (stripeInstance) return stripeInstance;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  const mod: any = await import('stripe');
  const StripeCtor = mod && mod.default ? mod.default : mod;
  stripeInstance = new StripeCtor(secret, { apiVersion: '2024-06-20' });
  return stripeInstance;
}

module.exports = { getStripe };
