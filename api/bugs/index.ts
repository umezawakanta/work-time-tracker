// CommonJS compatible bugs API with direct Mongo connect and lazy model
interface VercelRequest {
  method?: string;
  headers: any;
  query?: any;
  body?: any;
  url?: string;
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
      const raw = (req.body || {}) as any;
      const title = String(raw.title || '').slice(0, 500);
      const featureId = raw.featureId ? String(raw.featureId) : 'unknown';
      const description = raw.description ? String(raw.description) : undefined;
      const source = ['client', 'server', 'manual'].includes(String(raw.source))
        ? String(raw.source)
        : 'manual';
      const severity = ['low', 'medium', 'high', 'critical'].includes(String(raw.severity))
        ? String(raw.severity)
        : 'medium';
      const status = ['open', 'in_progress', 'resolved', 'closed'].includes(String(raw.status))
        ? String(raw.status)
        : 'open';
      const createdBy = raw.createdBy ? String(raw.createdBy) : undefined;
      const fingerprint = String(
        raw.fingerprint ||
          `${title}|${featureId}|${source}|${(raw.endpoint || raw.component || '').slice(0, 120)}`
      ).slice(0, 512);

      if (!title) {
        res.status(400).json({ success: false, message: 'title は必須です' });
        return;
      }

      // Upsert with dedup on fingerprint
      const now = new Date();
      const updated = await Bug.findOneAndUpdate(
        { fingerprint },
        {
          $setOnInsert: {
            title,
            featureId,
            severity,
            status,
            createdBy,
            source,
            fingerprint,
            occurrences: 0,
          },
          $set: {
            lastOccurredAt: now,
            severity,
            status,
            source,
          },
          $inc: { occurrences: 1 },
        },
        { new: true, upsert: true }
      );
      
      // Update description separately if provided
      if (description) {
        await Bug.findByIdAndUpdate(updated._id, { $set: { description } });
      }
      res.status(201).json({ success: true, data: updated });
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
      if (featureId && featureId !== 'all') filter.featureId = featureId;
      if (status && status !== 'all') filter.status = status;
      const bugs = await Bug.find(filter).sort({ lastOccurredAt: -1, createdAt: -1 }).lean();
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
