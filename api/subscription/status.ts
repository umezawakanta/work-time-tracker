// CommonJS-friendly subscription status endpoint (mock → real gateway連携は将来拡張)
interface VercelRequest {
  method?: string;
  headers: any;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const stripeMod: any = await import('../_lib/stripe.js');
    const { getStripe } = (stripeMod as any).default || stripeMod;
    const stripe = await getStripe();
    const customerId = process.env.STRIPE_CUSTOMER_ID; // 将来: ユーザーから解決
    if (!customerId) throw new Error('No customer context');
    const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
    const s = subs.data[0] || null;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });
    const pm = paymentMethods.data[0] || null;
    res.status(200).json({
      plan: s?.items?.data?.[0]?.price?.id || null,
      status: (s?.status as any) || null,
      renewAt: s?.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null,
      card: pm ? { last4: pm.card?.last4, brand: pm.card?.brand } : null,
      atPeriodEnd: Boolean(s?.cancel_at_period_end),
    });
  } catch {
    // フォールバック: 中立ステータス
    res
      .status(200)
      .json({ plan: null, status: null, renewAt: null, card: null, atPeriodEnd: false });
  }
}

module.exports = handler as any;
