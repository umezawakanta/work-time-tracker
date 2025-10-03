import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Type definitions
interface UsersListResponse {
  success: boolean;
  message: string;
  users?: Array<{
    id: string;
    email: string;
    displayName: string;
    role: string;
    isVerified: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[admin/users] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
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

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin/users] Failed to connect to database:', message);
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

/**
 * Users list response object structure:
 * @typedef {Object} UsersListResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Array<Object>} [users]
 * @property {string} users[].id
 * @property {string} users[].email
 * @property {string} users[].displayName
 * @property {string} users[].role
 * @property {boolean} users[].isVerified
 * @property {string} users[].status
 * @property {string} users[].createdAt
 * @property {string} users[].updatedAt
 * @property {string} [error]
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    } as UsersListResponse);
    return;
  }

  try {
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // 管理者権限の確認
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      } as UsersListResponse);
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
      } as UsersListResponse);
    }

    // 管理者権限の確認
    if (userInfo.role !== 'admin' || !userInfo.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限が必要です',
        error: 'Admin privileges required',
      } as UsersListResponse);
    }

    // ユーザー一覧を取得
    const users = await User.find({}).sort({ createdAt: -1 });


    // レスポンスの構築
    const response: UsersListResponse = {
      success: true,
      message: 'ユーザー一覧を取得しました',
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Users list error:', error);

    res.status(500).json({
      success: false,
      message: 'ユーザー一覧取得中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as UsersListResponse);
  }
}
