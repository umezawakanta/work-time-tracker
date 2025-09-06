import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { WorkTimeEntry } from '../../src/server/models/WorkTimeEntry';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let dbConnected = true;
    try {
      await connectDB();
    } catch (error) {
      console.log('Database connection failed, using fallback:', error);
      dbConnected = false;
    }

    const method = req.method || 'GET';
    if (method === 'GET') {
      if (!dbConnected) {
        // データベース接続に失敗した場合は空の配列を返す
        return res.status(200).json([]);
      }
      const userId =
        (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'default-user';
      const query = userId ? { userId } : {};
      const docs = await WorkTimeEntry.find(query).sort({ date: -1, createdAt: -1 }).limit(500);
      return res.status(200).json(docs);
    }

    if (method === 'POST') {
      if (!dbConnected) return res.status(503).json({ success: false, error: 'DB unavailable' });
      const { projectName, startTime, endTime, description, duration, date, userId } =
        req.body || {};
      const finalUserId = userId || 'default-user';
      if (!projectName || !startTime || !endTime || !duration || !date) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }
      const created = await WorkTimeEntry.create({
        projectName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        duration,
        date: new Date(date),
        userId: finalUserId,
      });
      return res.status(201).json({ message: '作業時間が作成されました', workTime: created });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/worktime', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
