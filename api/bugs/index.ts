import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import Bug from '../../src/server/models/Bug';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hasDb = Boolean(process.env.MONGODB_URI);
  if (!hasDb) {
    return res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
  }

  await connectDB();

  if (req.method === 'POST') {
    try {
      const { title, description, featureId, severity, status, createdBy } = req.body || {};
      if (!title || !featureId) {
        return res.status(400).json({ success: false, message: 'title と featureId は必須です' });
      }
      const bug = await Bug.create({ title, description, featureId, severity, status, createdBy });
      return res.status(201).json({ success: true, data: bug });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: '不具合登録に失敗しました', error: error?.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { featureId, status } = req.query as { featureId?: string; status?: string };
      const filter: any = {};
      if (featureId) filter.featureId = featureId;
      if (status) filter.status = status;
      const bugs = await Bug.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: bugs });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: '不具合一覧の取得に失敗しました', error: error?.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
