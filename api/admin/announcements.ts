const mongooseDB = require('mongoose');
const jwtLib = require('jsonwebtoken');
const dotenvLib = require('dotenv');

dotenvLib.config();

// Database connection utility
const ensureDatabaseConnectionAdmin = async () => {
  const isConnected = mongooseDB.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[admin/announcements] Database not connected, attempting to connect...');
  try {
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    await mongooseDB.connect(MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
    console.info('[admin/announcements] Database connected successfully');
  } catch (error) {
    console.error('[admin/announcements] Database connection error:', error);
    throw error;
  }
};

// Notificationモデル
const NotificationSchema = new mongooseDB.Schema({
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

const NotificationModel = mongooseDB.models.Notification || mongooseDB.model('Notification', NotificationSchema);

// Userモデル
const UserSchema = new mongooseDB.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserModel = mongooseDB.models.User || mongooseDB.model('User', UserSchema);

// JWT verification utility
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
    return jwtLib.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

module.exports = async function handler(req, res) {
  console.log('Admin announcements API called:', req.method, req.url);
  
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    // データベース接続
    await ensureDatabaseConnectionAdmin();
    console.log('Database connected successfully');

    // 管理者認証
    const user = await verifyJWTToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, message, targetUsers } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    // 対象ユーザーを取得
    let userIds = [];
    if (targetUsers === 'all') {
      // 全ユーザーに送信
      const users = await UserModel.find({}, '_id');
      userIds = users.map(user => user._id.toString());
    } else if (targetUsers === 'active') {
      // アクティブユーザーに送信（過去30日以内にログインしたユーザー）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const users = await UserModel.find({ 
        updatedAt: { $gte: thirtyDaysAgo } 
      }, '_id');
      userIds = users.map(user => user._id.toString());
    } else if (Array.isArray(targetUsers)) {
      // 指定されたユーザーに送信
      userIds = targetUsers;
    } else {
      return res.status(400).json({ error: 'Invalid target users' });
    }

    if (userIds.length === 0) {
      return res.status(400).json({ error: 'No target users found' });
    }

    // 各ユーザーに通知を作成
    const notifications = [];
    for (const userId of userIds) {
      const notification = new NotificationModel({
        userId: userId,
        type: 'admin_announcement',
        title: title,
        message: message,
      });

      await notification.save();
      notifications.push(notification);
      console.log(`Announcement notification created for user: ${userId}`);
    }

    res.status(200).json({ 
      success: true, 
      message: `Announcement sent to ${notifications.length} users`,
      notificationCount: notifications.length
    });

  } catch (error) {
    console.error('Error in announcements API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
