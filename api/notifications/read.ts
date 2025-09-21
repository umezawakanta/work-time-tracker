import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// データベース接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, {
      ...opts,
      dbName: 'workTimeTracker'
    }).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Notificationモデル
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  // 'admin_announcement': General announcements from admins to all users.
  // 'admin_message': Direct messages from admins to specific users.
  type: { 
    type: String, 
    enum: ['memo_response', 'status_update', 'memo_reply', 'admin_announcement', 'admin_message'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedMemoId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// JWT検証関数
const verifyJWTToken = async (req: NextApiRequest) => {
  if (!req || !req.headers) {
    console.log('Request or headers object is undefined');
    return null;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

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

    // ユーザーIDを正しく取得
    const userId = user.userId || user.id;
    console.log('Marking notification as read for user:', userId);

    // 通知を既読にする
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId },
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
