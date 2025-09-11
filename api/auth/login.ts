// ES module imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import mongoose from 'mongoose';

// Dynamic imports for server modules
let connectDB: (() => Promise<void>) | null = null;
let User: any = null;

async function loadServerModules(): Promise<boolean> {
  if (connectDB && User) {
    return true;
  }
  try {
    // Try different import paths based on environment with fallback
    const isVercel = process.env.VERCEL === '1';
    
    // Try primary path first
    let dbMod, userMod;
    try {
      const dbPath = isVercel 
        ? '../../src/server/config/database.js' 
        : '../../src/server/config/database';
      const userPath = isVercel 
        ? '../../src/server/models/User.js' 
        : '../../src/server/models/User';
      
      dbMod = await import(dbPath);
      userMod = await import(userPath);
    } catch (primaryError) {
      // Fallback to alternative paths
      console.warn('[auth/login] Primary import failed, trying fallback paths:', primaryError);
      try {
        dbMod = await import('../../src/server/config/database');
        userMod = await import('../../src/server/models/User');
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback imports failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      }
    }
    
    connectDB = (dbMod as any).connectDB as () => Promise<void>;
    User = (userMod as any).User;
    
    // Database connection will be established in the handler after modules are loaded
    
    return true;
  } catch (error) {
    console.warn('[auth/login] Failed to load server modules:', error);
    return false;
  }
}

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Login response interface
interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isVerified: boolean;
    avatar?: string;
    preferences: any;
  };
  token?: string;
  error?: string;
}

// Robust JSON reader for Vercel Node (handles object, string, or raw stream)
async function readJson(req: any): Promise<any> {
  try {
    const existingBody: unknown = (req as any).body;
    if (existingBody !== undefined) {
      return typeof existingBody === 'string' ? JSON.parse(existingBody) : existingBody;
    }
    const raw: string = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => {
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

async function ensureUserModel(): Promise<void> {
  if (User) {
    return;
  }
  try {
    const existing = mongoose.models?.User;
    if (existing) {
      User = existing;
      return;
    }
    const schema = new mongoose.Schema({}, { strict: false });
    User = mongoose.model('User', schema, 'users');
  } catch (e) {
    console.warn('[auth/login] Failed to ensure fallback User model', e);
  }
}

async function handler(req: any, res: any) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
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
    } as LoginResponse);
    return;
  }

  try {
    console.log('🔐 User login started');
    
    // Ensure database connection is established
    const modulesLoaded = await loadServerModules();
    if (!modulesLoaded) {
      console.error('❌ Failed to load server modules');
      return res.status(500).json({
        success: false,
        message: 'サーバー初期化に失敗しました',
        error: 'Server modules not available',
      } as LoginResponse);
    }
    
    // Ensure User model is available
    ensureUserModel();
    
    // Read JSON body safely across environments
    const body: Partial<LoginRequest> = await readJson(req);
    console.log('📥 Login request meta', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      bodyType: typeof body,
      hasEmail: Boolean((body as any)?.email),
    });
    const {
      email,
      password,
      rememberMe = false,
    }: LoginRequest = {
      email: body?.email as string,
      password: body?.password as string,
      rememberMe: Boolean(body?.rememberMe),
    };

    // 必須フィールドの検証
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスとパスワードが必要です',
        error: 'Email and password are required',
      } as LoginResponse);
    }

    // データベース接続確認
    const isConnected = mongoose.connection.readyState === 1;
    console.log('[auth/login] DB connection state:', {
      readyState: mongoose.connection.readyState,
      isConnected,
      dbName: mongoose.connection.db?.databaseName,
    });
    
    if (!isConnected) {
      console.warn('[auth/login] Database not connected, attempting to connect...');
      try {
        if (connectDB) {
          await connectDB();
        } else {
          // Fallback: direct connection
          const mongoUri = process.env.MONGODB_URI;
          if (mongoUri) {
            await mongoose.connect(mongoUri);
          } else {
            throw new Error('MONGODB_URI not found');
          }
        }
        console.log('[auth/login] Database connection established');
      } catch (e) {
        console.error('[auth/login] Database connection failed:', e);
        return res.status(500).json({
          success: false,
          message: 'データベース接続に失敗しました',
          error: 'Database connection failed',
        } as LoginResponse);
      }
    }

    // データベース接続が確立されたので、通常のログイン処理を実行

    // ユーザーの検索（DB有り）
    if (!User) {
      await ensureUserModel();
    }
    const emailLc = (email || '').toLowerCase();
    const maskedEmail = emailLc.replace(/^[^@]+/, '***');
    console.log('[auth/login] findOne(users) start', {
      modelReady: Boolean(User),
      connState: mongoose.connection?.readyState,
      dbName: mongoose.connection?.name,
      email: maskedEmail,
    });
    const user = await User.findOne({ email: emailLc });
    console.log('[auth/login] findOne(users) done', {
      found: Boolean(user),
      id: (user as any)?._id || (user as any)?.id || null,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません',
        error: 'Invalid credentials',
      } as LoginResponse);
    }

    // パスワードの確認（後方互換を考慮したフォールバック）
    const passwordHashCandidates = [
      { value: user?.metadata?.hashedPassword, source: 'metadata.hashedPassword' },
      { value: (user as any)?.hashedPassword, source: 'hashedPassword' },
      { value: (user as any)?.passwordHash, source: 'passwordHash' },
      { value: (user as any)?.password, source: 'password' },
    ];
    const found = passwordHashCandidates.find(
      (c) => typeof c.value === 'string' && (c.value as string).length > 0
    );
    const storedPassword = (found?.value as string) || '';
    console.log('🔎 password hash source:', found?.source || 'none');
    
    if (!storedPassword) {
      return res.status(422).json({
        success: false,
        message: 'パスワード再設定が必要です',
        error: 'Password hash missing',
      } as LoginResponse);
    }

    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません',
        error: 'Invalid credentials',
      } as LoginResponse);
    }

    // アカウント状態の確認
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'アカウントが停止されています。管理者にお問い合わせください',
        error: 'Account suspended',
      } as LoginResponse);
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'アカウントが無効です。アカウントを有効化してください',
        error: 'Account inactive',
      } as LoginResponse);
    }

    // JWTトークンの生成（管理者クレームを付与）
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const userEmailLc = String(user.email || '').toLowerCase();
    const existingRoles: string[] = Array.isArray((user as any).roles)
      ? ((user as any).roles as string[])
      : [];
    const computedIsAdmin =
      (user as any).isAdmin === true ||
      String(user.role || '').toLowerCase() === 'admin' ||
      existingRoles.includes('admin') ||
      adminEmails.includes(userEmailLc);
    const roleClaim = computedIsAdmin ? 'admin' : user.role || 'user';
    const rolesClaim: string[] = computedIsAdmin
      ? Array.from(new Set([...existingRoles, 'admin']))
      : existingRoles;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: roleClaim,
        roles: rolesClaim,
        isAdmin: computedIsAdmin,
        isVerified: user.isVerified,
      },
      jwtSecret,
      {
        expiresIn: tokenExpiry,
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    // レスポンスの構築
    const response: LoginResponse = {
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
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Internal server error',
    } as LoginResponse);
  }
}

export default handler;
