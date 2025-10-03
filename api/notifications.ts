import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';

// データベース接続（グローバルキャッシュされた接続を使用）
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/work-time-tracker';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
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

// 通知スキーマ
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// ユーザースキーマ
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  roles: [{ type: String }],
  avatar: { type: String },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// JWT検証関数
async function verifyJWT(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret-for-development';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// 通知作成関数
async function createNotification(userId: string, type: string, title: string, message: string, data = {}) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// メインハンドラー
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // データベース接続
    await connectToDatabase();

    // 認証
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    // 管理者権限チェック
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限が必要です'
      });
    }

    if (req.method === 'GET') {
      // 通知一覧取得
      const notifications = await Notification.find({})
        .populate('userId', 'email displayName')
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        notifications: notifications
      });

    } else if (req.method === 'POST') {
      // 通知作成
      const { userId, type, title, message, data } = req.body;

      if (!userId || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています'
        });
      }

      const notification = await createNotification(userId, type, title, message, data);

      res.status(201).json({
        success: true,
        message: '通知を作成しました',
        notification: notification
      });

    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません'
      });
    }

  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      message: '通知処理中にエラーが発生しました',
      error: process.env['NODE_ENV'] === 'development' ? error.message : 'Internal server error'
    });
  }
}
