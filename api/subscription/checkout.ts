// Starts checkout session (placeholder gateway). Real Stripe integration can be wired later.
interface VercelRequest {
  method?: string;
  headers: any;
  body?: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: any) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Resolve current user and stripe customer
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ctx = require('../_lib/user-context.js');
    const stripeMod: any = await import('../_lib/stripe.js');
    const { getStripe } = (stripeMod as any).default || stripeMod;
    const stripe = await getStripe();
    const auth = await ctx.verifyJwtAndExtract(req as any);
    const User = await ctx.ensureDbAndUserModel();
    const user = await ctx.findUserByIdLoose(User, auth.userId);
    await ctx.ensureStripeCustomerForUser(user, stripe);
    const priceId = (req.body && req.body.planId) || process.env.STRIPE_DEFAULT_PRICE_ID;
    if (!priceId) throw new Error('Missing price id');
    const successUrl = 'https://work-time-tracker-five.vercel.app/subscription?success=1';
    const cancelUrl = 'https://work-time-tracker-five.vercel.app/subscription';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
    });
    res.status(200).json({ sessionUrl: session.url });
  } catch (e: any) {
    res.status(500).json({ error: 'CHECKOUT_FAILED', message: e?.message || 'unknown' });
  }
}

module.exports = handler as any;
