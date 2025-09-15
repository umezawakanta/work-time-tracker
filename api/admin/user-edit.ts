// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { UserDocument } = require('../utils/types');
const { 
  createValidationError, 
  createAuthError, 
  createResourceError, 
  createServerError,
  sendErrorResponse 
} = require('../utils/errorHandler');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[admin/user-edit] Database not connected, attempting to connect...');
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
    console.error('[admin/user-edit] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};


// User schema
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

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

const User = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

// Edit user request interface
interface EditUserRequest {
  userId: string;
  displayName?: string;
  role?: string;
  isVerified?: boolean;
  status?: "active" | "inactive" | "suspended";
}

// Edit user response interface
interface EditUserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isVerified: boolean;
    status: string;
  };
  error?: string;
}

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    } as EditUserResponse);
    return;
  }

  try {
    console.log('✏️ Admin user edit request started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // 管理者権限の確認
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      } as EditUserResponse);
    }

    // JWTトークンを検証してユーザー情報を取得
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    let userInfo: any;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, jwtSecret) as any;
      userInfo = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '無効な認証トークンです',
        error: 'Invalid authentication token',
      } as EditUserResponse);
    }

    // 管理者権限の確認
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限が必要です',
        error: 'Admin privileges required',
      } as EditUserResponse);
    }

    const { userId, displayName, role, isVerified, status }: EditUserRequest = req.body;

    // デバッグ用ログ（機密情報は除外）
    console.log('📝 Edit user request body:', {
      userId,
      displayName: displayName ? displayName.substring(0, 10) + '...' : displayName, // 表示名を短縮
      role,
      isVerified,
      status,
      bodyKeys: Object.keys(req.body || {}).filter(key => !['password', 'token', 'secret'].includes(key.toLowerCase()))
    });

    // 必須フィールドの検証
    if (!userId) {
      return sendErrorResponse(res, 400, createValidationError(
        'ユーザーIDが必要です',
        'userId',
        userId
      ));
    }

    // ユーザーを検索
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, 404, createResourceError(
        'ユーザーが見つかりません',
        'user',
        userId
      ));
    }

    // 更新データの構築
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (role !== undefined) {
      updateData.role = role;
      // 管理者権限の設定
      if (role === 'admin') {
        updateData.isAdmin = true;
        updateData.roles = ['admin'];
      } else {
        updateData.isAdmin = false;
        updateData.roles = ['user'];
      }
    }
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (status !== undefined) updateData.status = status;

    // ユーザーを更新
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ User updated successfully:', {
      userId: updatedUser && updatedUser.id,
      adminUserId: userInfo.userId,
    });

    // レスポンスの構築
    const response: EditUserResponse = {
      success: true,
      message: 'ユーザー情報を更新しました',
      user: {
        id: updatedUser!._id.toString(),
        email: updatedUser!.email,
        displayName: updatedUser!.displayName,
        role: updatedUser!.role,
        isVerified: updatedUser!.isVerified,
        status: updatedUser!.status,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ User edit error:', error);

    res.status(500).json({
      success: false,
      message: 'ユーザー情報更新中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as EditUserResponse);
  }
}
