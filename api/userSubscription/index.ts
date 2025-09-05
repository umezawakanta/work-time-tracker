// CJS-compatible route for user subscription CRUD by userId
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  body?: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

async function readJson(req: any): Promise<any> {
  try {
    const body = (req && req.body) as unknown;
    if (body !== undefined) return typeof body === 'string' ? JSON.parse(body) : body;
    const raw: string = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return void res.status(200).end();

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mongoLib = require('../_lib/mongo');
    await mongoLib.connectMongoDirect();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ensureUserSubscriptionModel } = require('../_schemas/userSubscription.js');
    const UserSubscription = await ensureUserSubscriptionModel();

    if (req.method === 'GET') {
      const url = new URL(req.headers['x-forwarded-url'] || req.headers.referer || 'http://x/');
      const match = url.pathname.match(/\/api\/userSubscription\/user\/([^/]+)/);
      const userId = match ? match[1] : undefined;
      if (!userId) return void res.status(400).json({ success: false, message: 'Missing userId' });
      const doc = await UserSubscription.findOne({ userId });
      return void res.status(200).json(doc || null);
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const doc = await UserSubscription.findOneAndUpdate(
        { userId: String(body.userId) },
        { $set: { ...body, updatedAt: new Date() } },
        { new: true, upsert: true }
      );
      return void res.status(201).json(doc);
    }

    if (req.method === 'PUT') {
      const url = new URL(req.headers['x-forwarded-url'] || req.headers.referer || 'http://x/');
      const match = url.pathname.match(/\/api\/userSubscription\/user\/([^/]+)/);
      const userId = match ? match[1] : undefined;
      if (!userId) return void res.status(400).json({ success: false, message: 'Missing userId' });
      const body = await readJson(req);
      const doc = await UserSubscription.findOneAndUpdate(
        { userId },
        { $set: { ...body, updatedAt: new Date() } },
        { new: true, upsert: true }
      );
      return void res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.headers['x-forwarded-url'] || req.headers.referer || 'http://x/');
      const match = url.pathname.match(/\/api\/userSubscription\/user\/([^/]+)/);
      const userId = match ? match[1] : undefined;
      if (!userId) return void res.status(400).json({ success: false, message: 'Missing userId' });
      const body = await readJson(req);
      const doc = await UserSubscription.findOneAndUpdate(
        { userId },
        {
          $set: {
            status: 'canceled',
            cancelAtPeriodEnd: false,
            canceledAt: new Date(),
            cancelReason: body?.reason,
          },
        },
        { new: true }
      );
      return void res.status(200).json(doc);
    }

    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (e) {
    console.error('[userSubscription] handler error:', e);
    return void res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = handler as any;
