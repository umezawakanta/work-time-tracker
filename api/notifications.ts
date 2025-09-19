import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../src/server/models/database';
import { Notification } from '../src/server/models/Notification';
import { verifyJWTToken } from './utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース接続
    await connectToDatabase();

    // ユーザー認証
    const user = await verifyJWTToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // クエリ条件を構築
    const query: any = { userId: user.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // 通知を取得
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // 未読通知数を取得
    const unreadCount = await Notification.countDocuments({ 
      userId: user.userId, 
      isRead: false 
    });

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: notifications.length
      }
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
