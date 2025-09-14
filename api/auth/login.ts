import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[auth/login] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    // 接続オプションを追加してタイムアウトと再接続を最適化
    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10, // 接続プールサイズ
      serverSelectionTimeoutMS: 15000, // サーバー選択タイムアウト (15秒)
      socketTimeoutMS: 45000, // ソケットタイムアウト
      bufferCommands: false, // コマンドバッファリング無効化
      connectTimeoutMS: 10000, // 接続タイムアウト
      maxIdleTimeMS: 30000, // 最大アイドル時間
    });

    console.log("✅ MongoDB connected successfully");

    // 接続状態の監視
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (error) {
    console.error('[auth/login] Failed to connect to database:', error);
    throw new Error('Database connection failed: ' + (error && error.message ? error.message : String(error)));
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
  }
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

const User = mongoose.model("User", UserSchema);

// Robust JSON reader for Vercel Node (handles object, string, or raw stream)
async function readJson(req) {
  try {
    const existingBody = req.body;
    if (existingBody !== undefined) {
      return typeof existingBody === 'string' ? JSON.parse(existingBody) : existingBody;
    }
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk.toString('utf8');
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 });
  }
}

async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    });
    return;
  }

  try {
    console.log('🔐 User login started');

    // Ensure database connection is established
    await ensureDatabaseConnection();

    // Read JSON body safely across environments
    const body = await readJson(req);
    console.log('📥 Login request meta', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      bodyType: typeof body,
      hasEmail: Boolean(body && body.email),
    });
    const {
      email,
      password,
      rememberMe = false,
    } = {
      email: body && body.email,
      password: body && body.password,
      rememberMe: Boolean(body && body.rememberMe),
    };

    // 必須フィールドの検証
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスとパスワードが必要です',
        error: 'Email and password are required',
      });
    }

    // ユーザーの検索
    const emailLc = (email || '').toLowerCase();
    const maskedEmail = emailLc.replace(/^[^@]+/, '***');
    
    console.log('[auth/login] findOne(users) start', {
      modelReady: Boolean(User),
      connState: mongoose.connection && mongoose.connection.readyState,
      dbName: mongoose.connection && mongoose.connection.name,
      email: maskedEmail,
    });
    const user = await User.findOne({ email: emailLc });
    console.log('[auth/login] findOne(users) done', {
      found: Boolean(user),
      id: (user && user._id) || (user && user.id) || null,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません',
        error: 'Invalid credentials',
      });
    }

    // パスワードの確認
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません',
        error: 'Invalid credentials',
      });
    }

    // アカウント状態の確認
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'アカウントが停止されています。管理者にお問い合わせください',
        error: 'Account suspended',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'アカウントが無効です。アカウントを有効化してください',
        error: 'Account inactive',
      });
    }

    // JWTトークンの生成（管理者クレームを付与）
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const userEmailLc = String(user.email || '').toLowerCase();
    const existingRoles = Array.isArray(user.roles)
      ? user.roles
      : [];
    const computedIsAdmin =
      user.isAdmin === true ||
      String(user.role || '').toLowerCase() === 'admin' ||
      existingRoles.includes('admin') ||
      adminEmails.includes(userEmailLc);
    const roleClaim = computedIsAdmin ? 'admin' : user.role || 'user';
    const rolesClaim = computedIsAdmin
      ? Array.from(new Set([...existingRoles, 'admin']))
      : existingRoles;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: roleClaim,
        roles: rolesClaim,
        isAdmin: computedIsAdmin,
      },
      jwtSecret,
      {
        expiresIn: tokenExpiry,
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    // レスポンスの構築
    const response = {
      success: true,
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: roleClaim,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences,
      },
      token: token,
    };

    // Issue httpOnly cookie for cookie-based auth (in addition to returning token)
    try {
      res.setHeader(
        'Set-Cookie',
        serialize('access_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );
    } catch (e) {
      console.warn('⚠️ Failed to set auth cookie:', e);
    }

    console.log('✅ User login successful:', {
      userId: user.id,
      email: user.email,
      rememberMe,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Login error:', error);

    res.status(500).json({
      success: false,
      message: 'ログイン処理中にエラーが発生しました',
      error:
        process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : 'Internal server error',
    });
  }
}

export default handler;