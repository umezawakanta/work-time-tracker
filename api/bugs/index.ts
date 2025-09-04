// CommonJS compatible bugs API with direct Mongo connect and lazy model
interface VercelRequest {
  method?: string;
  headers: any;
  query?: any;
  body?: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: any) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.MONGODB_URI) {
    res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
    return;
  }

  const libMod: any = await import('../_lib/mongo.js');
  const lib = (libMod as any).default || libMod;
  await lib.connectMongoDirect();
  const schemaMod: any = await import('../_schemas/bug.js');
  const { ensureBugModel } = (schemaMod as any).default || schemaMod;
  const Bug = await ensureBugModel();

  if (req.method === 'POST') {
    try {
      const { title, description, featureId, severity, status, createdBy } = (req.body ||
        {}) as any;
      if (!title || !featureId) {
        res.status(400).json({ success: false, message: 'title と featureId は必須です' });
        return;
      }
      const bug = await Bug.create({ title, description, featureId, severity, status, createdBy });
      res.status(201).json({ success: true, data: bug });
      return;
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: '不具合登録に失敗しました', error: error?.message });
      return;
    }
  }

  if (req.method === 'GET') {
    try {
      const { featureId, status } = (req.query || {}) as { featureId?: string; status?: string };
      const filter: any = {};
      if (featureId) filter.featureId = featureId;
      if (status) filter.status = status;
      const bugs = await Bug.find(filter).sort({ createdAt: -1 }).lean();
      res.status(200).json({ success: true, data: bugs });
      return;
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: '不具合一覧の取得に失敗しました', error: error?.message });
      return;
    }
  }

  res.status(405).json({ success: false, message: 'Method Not Allowed' });
}

module.exports = handler as any;
