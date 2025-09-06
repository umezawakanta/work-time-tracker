// Minimal invoices endpoint (CJS-friendly)
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  query: Record<string, string | string[]>;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  res.setHeader(
    'Access-Control-Allow-Origin',
    origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return void res.status(200).end();
  if (req.method !== 'GET')
    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { userId } = req.query as { userId?: string };
    
    if (!userId) {
      return void res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Stripe連携による請求履歴取得
    const ctx = require('../../_lib/user-context.js');
    const stripeMod: any = await import('../../_lib/stripe.js');
    const { getStripe } = (stripeMod as any).default || stripeMod;
    const stripe = await getStripe();
    
    // ユーザー認証
    const auth = await ctx.verifyJwtAndExtract(req as any);
    if (auth.userId !== userId) {
      return void res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // ユーザーのStripe顧客IDを取得
    const User = await ctx.ensureDbAndUserModel();
    const user = await ctx.findUserByIdLoose(User, userId);
    const customerId = await ctx.ensureStripeCustomerForUser(user, stripe);

    // Stripeから請求履歴を取得
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
      expand: ['data.payment_intent'],
    });

    // レスポンス形式に変換
    const formattedInvoices = invoices.data.map((invoice: any) => ({
      id: invoice.id,
      userId: userId,
      amount: invoice.amount_paid || 0,
      currency: invoice.currency,
      status: invoice.status === 'paid' ? 'paid' : invoice.status === 'open' ? 'unpaid' : 'failed',
      periodStart: new Date(invoice.period_start * 1000).toISOString(),
      periodEnd: new Date(invoice.period_end * 1000).toISOString(),
      paymentMethod: {
        type: 'credit_card',
        lastFour: invoice.payment_intent?.payment_method?.card?.last4 || '0000',
      },
      createdAt: new Date(invoice.created * 1000).toISOString(),
    }));

    return void res.status(200).json({ success: true, data: formattedInvoices });
  } catch (e: any) {
    console.error('Invoice history fetch error:', e);
    return void res.status(500).json({ success: false, message: 'Internal Server Error', error: e?.message });
  }
};
