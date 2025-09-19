import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../src/server/models/database';
import { Notification } from '../../src/server/models/Notification';
import { verifyJWTToken } from '../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    // 通知を既読にする
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification: {
        id: notification._id,
        isRead: notification.isRead
      }
    });

  } catch (error) {
    console.error('Error in read notification API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
