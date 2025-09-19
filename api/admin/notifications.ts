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

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
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
  type: { 
    type: String, 
    enum: ['memo_response', 'status_update', 'admin_message'], 
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

// Memoモデル
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  postType: { 
    type: String, 
    enum: ['update_request', 'error_report', 'general'], 
    default: 'general' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'closed'], 
    default: 'pending' 
  },
  adminResponse: { type: String },
  adminResponseDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Memo = mongoose.models.Memo || mongoose.model('Memo', MemoSchema);

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース接続
    await connectToDatabase();

    // 管理者認証
    const user = await verifyJWTToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { memoId, response, status } = req.body;

    if (!memoId || !response) {
      return res.status(400).json({ error: 'Memo ID and response are required' });
    }

    // メモを取得
    const memo = await Memo.findById(memoId);
    if (!memo) {
      return res.status(404).json({ error: 'Memo not found' });
    }

    // メモを更新
    const updateData: any = {
      adminResponse: response,
      adminResponseDate: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    await Memo.findByIdAndUpdate(memoId, updateData);

    // 通知を作成
    const notification = new Notification({
      userId: memo.userId,
      type: 'memo_response',
      title: memo.postType === 'error_report' ? '不具合報告への対応完了' : '更新要望への対応完了',
      message: response,
      relatedMemoId: memoId,
    });

    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'Response sent and notification created',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
