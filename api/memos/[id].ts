const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[memos/id] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[memos/id] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Memo Schema
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Memo = mongoose.model('Memo', MemoSchema);

// JWT verification utility
const verifyJWT = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[memos/id] JWT_SECRET not configured');
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('[memos/id] JWT verification failed:', error);
    return null;
  }
};

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('📝 Memo detail API request started');
    
    // Ensure database connection
    await ensureDatabaseConnection();

    // Verify JWT token
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'メモのIDが必要です',
        error: 'Memo ID is required',
      });
    }

    if (req.method === 'GET') {
      // 特定のメモを取得
      const memo = await Memo.findOne({ _id: id, userId: userInfo.userId });
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }

      console.log('✅ Memo retrieved:', {
        memoId: memo._id.toString(),
        title: memo.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: 'メモの詳細を取得しました',
        memo: {
          id: memo._id.toString(),
          title: memo.title,
          content: memo.content,
          category: memo.category,
          tags: memo.tags || [],
          isPublic: memo.isPublic,
          isFamilyOnly: memo.isFamilyOnly || false,
          isAdminOnly: memo.isAdminOnly || false,
          createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else if (req.method === 'PUT') {
      // メモを更新
      const updateData = req.body || {};
      
      const memo = await Memo.findOneAndUpdate(
        { _id: id, userId: userInfo.userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }

      console.log('✅ Memo updated successfully:', {
        memoId: memo._id.toString(),
        title: memo.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: 'メモを更新しました',
        memo: {
          id: memo._id.toString(),
          title: memo.title,
          content: memo.content,
          category: memo.category,
          tags: memo.tags || [],
          isPublic: memo.isPublic,
          isFamilyOnly: memo.isFamilyOnly || false,
          isAdminOnly: memo.isAdminOnly || false,
          createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else if (req.method === 'DELETE') {
      // メモを削除
      const memo = await Memo.findOneAndDelete({ _id: id, userId: userInfo.userId });
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }

      console.log('✅ Memo deleted successfully:', {
        memoId: memo._id.toString(),
        title: memo.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: 'メモを削除しました',
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Memo detail API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
