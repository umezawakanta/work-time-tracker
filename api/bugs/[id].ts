// Bug update API endpoint
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  query: Record<string, string | string[]> & { id: string };
  body?: any;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return void res.status(200).end();

  try {
    // 管理者認証
    const ctx = require('../_lib/user-context.js');
    const auth = await ctx.verifyJwtAndExtract(req as any);

    // 管理者権限チェック
    const User = await ctx.ensureDbAndUserModel();
    const user = await ctx.findUserByIdLoose(User, auth.userId);
    if (!user || user.role !== 'admin') {
      return void res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.query;

    if (!id) {
      return void res.status(400).json({ success: false, message: 'Bug ID is required' });
    }

    // MongoDB接続
    const mongoLib = require('../_lib/mongo.js');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    // 不具合スキーマを取得
    const { ensureBugModel } = require('../_schemas/bug.js');
    const Bug = await ensureBugModel();

    if (req.method === 'GET') {
      // 不具合詳細取得
      const bug = await Bug.findById(id);
      if (!bug) {
        return void res.status(404).json({ success: false, message: 'Bug not found' });
      }
      return void res.status(200).json({ success: true, data: bug });
    }

    if (req.method === 'PATCH') {
      // 不具合更新
      const updateData = req.body || {};
      const allowedFields = ['status', 'severity', 'description', 'title'];
      const filteredUpdate: any = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredUpdate[field] = updateData[field];
        }
      }

      if (Object.keys(filteredUpdate).length === 0) {
        return void res.status(400).json({ success: false, message: 'No valid fields to update' });
      }

      const updatedBug = await Bug.findByIdAndUpdate(id, { $set: filteredUpdate }, { new: true });

      if (!updatedBug) {
        return void res.status(404).json({ success: false, message: 'Bug not found' });
      }

      return void res.status(200).json({ success: true, data: updatedBug });
    }

    if (req.method === 'DELETE') {
      // 不具合削除
      const deletedBug = await Bug.findByIdAndDelete(id);
      if (!deletedBug) {
        return void res.status(404).json({ success: false, message: 'Bug not found' });
      }
      return void res.status(200).json({ success: true, message: 'Bug deleted successfully' });
    }

    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('Bug API error:', e);
    return void res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: e?.message,
    });
  }
};
