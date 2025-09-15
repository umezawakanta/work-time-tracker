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
  console.warn('[admin/user-delete] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin/user-delete] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  isAdmin: { type: Boolean, default: false },
  roles: [{ type: String }],
}, {
  timestamps: true,
});

// Virtual for user ID
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, password, ...cleanRet } = ret;
    return cleanRet;
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// JWT verification utility
const verifyJWT = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret);
    
    if (!decoded.userId || !decoded.role) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      isAdmin: decoded.isAdmin || decoded.role === 'admin',
    };
  } catch (error) {
    console.error('[admin/user-delete] JWT verification failed:', error);
    return null;
  }
};

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    console.log('🗑️ Admin user delete request started');

    // Ensure database connection
    await ensureDatabaseConnection();

    // JWT認証
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authorization header missing or invalid',
      });
    }

    const token = authHeader.substring(7);
    const userInfo = verifyJWT(token);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '無効なトークンです',
        error: 'Invalid token',
      });
    }

    // 管理者権限の確認
    if (!userInfo.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限が必要です',
        error: 'Admin access required',
      });
    }

    // リクエストボディの取得
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ユーザーIDが必要です',
        error: 'User ID is required',
      });
    }

    // 自分自身の削除を防ぐ
    if (userId === userInfo.userId) {
      return res.status(400).json({
        success: false,
        message: '自分自身を削除することはできません',
        error: 'Cannot delete yourself',
      });
    }

    // ユーザーの存在確認
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません',
        error: 'User not found',
      });
    }

    // ユーザーを削除
    await User.findByIdAndDelete(userId);

    console.log('✅ User deleted successfully:', {
      deletedUserId: userId,
      adminUserId: userInfo.userId,
    });

    // レスポンスの構築
    res.status(200).json({
      success: true,
      message: 'ユーザーを削除しました',
    });
  } catch (error) {
    console.error('❌ User delete error:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー削除中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
}