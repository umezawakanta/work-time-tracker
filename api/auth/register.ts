import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async (): Promise<void> => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[auth/register] Database not connected, attempting to connect...');
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
    console.error('[auth/register] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// User document interface
interface UserDocument extends mongoose.Document {
  id: string;
  email: string;
  displayName: string;
  password: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    roles: [{ type: String }],
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

const User = mongoose.model<UserDocument>("User", UserSchema);

// Register request interface
interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// Register response interface
interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isVerified: boolean;
  };
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    } as RegisterResponse);
    return;
  }

  try {
    console.log('📝 User registration started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { email, password, displayName }: RegisterRequest = req.body;

    // 必須フィールドの検証
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレス、パスワード、表示名が必要です',
        error: 'Email, password, and display name are required',
      } as RegisterResponse);
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください',
        error: 'Invalid email format',
      } as RegisterResponse);
    }

    // パスワードの長さと複雑性チェック
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは8文字以上で入力してください',
        error: 'Password must be at least 8 characters',
      } as RegisterResponse);
    }

    // パスワードの複雑性チェック（大文字、小文字、数字を含む）
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは大文字、小文字、数字を含む8文字以上である必要があります',
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      } as RegisterResponse);
    }

    // 既存ユーザーのチェック
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'このメールアドレスは既に登録されています',
        error: 'User already exists',
      } as RegisterResponse);
    }

    // パスワードのハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 新しいユーザーを作成
    const newUser = new User({
      email: email.toLowerCase(),
      displayName: displayName.trim(),
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      preferences: {},
      status: 'active',
    });

    await newUser.save();

    console.log('✅ User registration successful:', {
      userId: newUser.id,
      email: newUser.email,
    });

    // レスポンスの構築（パスワードは除外）
    const response: RegisterResponse = {
      success: true,
      message: 'アカウントが正常に作成されました',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'アカウント作成中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as RegisterResponse);
  }
}
