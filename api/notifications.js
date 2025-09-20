const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// データベース接続（グローバルキャッシュされた接続を使用）
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
    enum: ['memo_response', 'status_update', 'admin_message', 'memo_reply', 'admin_announcement'], 
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
const verifyJWTToken = async (req) => {
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

module.exports = async function handler(req, res) {
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

    // ユーザーIDを正しく取得（JWTトークンの構造に応じて調整）
    const userId = user.userId || user.id;
    console.log('Fetching notifications for user:', userId);

    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // クエリ条件を構築
    const query = { userId: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    console.log('Query conditions:', query);

    // 通知を取得
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    console.log('Found notifications:', notifications.length);

    // 未読通知数を取得
    const unreadCount = await Notification.countDocuments({ 
      userId: userId, 
      isRead: false 
    });

    console.log('Unread count:', unreadCount);

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
