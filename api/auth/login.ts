import type { VercelRequest, VercelResponse } from '@vercel/node';
// Optional server imports to avoid hard failure when not deployed
let connectDB: (() => Promise<void>) | null = null;
let User: any = null;
let SubscriptionModel: any = null;

async function loadServerModules(): Promise<boolean> {
  if (connectDB && User) return true;
  try {
    const dbMod = await import('../../src/server/config/database.js');
    connectDB = dbMod.connectDB as () => Promise<void>;
    const userMod = await import('../../src/server/models/User.js');
    User = (userMod as any).User;
    try {
      const subMod = await import('../../src/server/models/Subscription.js');
      SubscriptionModel = (subMod as any).SubscriptionModel;
    } catch {}
    return true;
  } catch {
    return false;
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

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
  subscription?: {
    id: string;
    planType: string;
    status: string;
    limits: any;
  };
  error?: string;
}

// Robust JSON reader for Vercel Node (handles object, string, or raw stream)
async function readJson(req: VercelRequest): Promise<any> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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

    // データベース接続（失敗時はプレビュー用のインメモリデモ応答）
    let dbReady = true;
    try {
      const loaded = await loadServerModules();
      if (!loaded || !connectDB) throw new Error('Server modules not available');
      await connectDB();
    } catch (e) {
      dbReady = false;
      console.warn('Login API: DB not available, using preview demo login');
    }

    // プレビュー/デモ: DBが無い場合の簡易ログイン
    if (!dbReady) {
      const isDemoUser = /@/.test(email) && password && password.length >= 4;
      if (!isDemoUser) {
        return res.status(401).json({
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません',
          error: 'Invalid credentials (demo)',
        } as LoginResponse);
      }
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
      const token = jwt.sign(
        {
          userId: 'demo-user',
          email,
          role: 'user',
          roles: ['user'],
          isAdmin: false,
          isVerified: true,
        },
        jwtSecret,
        {
          expiresIn: '7d',
          issuer: 'work-time-tracker',
          audience: 'work-time-tracker-users',
        }
      );

      const response: LoginResponse = {
        success: true,
        message: 'ログインに成功しました (デモ)',
        user: {
          id: 'demo-user',
          email,
          displayName: email.split('@')[0],
          role: 'user',
          isVerified: true,
          preferences: {},
        },
        token,
      };

      try {
        res.setHeader(
          'Set-Cookie',
          serialize('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
          })
        );
      } catch {}

      return res.status(200).json(response);
    }

    // ユーザーの検索（DB有り）
    const user = await User.findOne({ email: email.toLowerCase() });

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
    let passwordToCompare = storedPassword;
    if (!storedPassword) {
      const allowFirstSetup = process.env.ALLOW_FIRST_HASH_SETUP === 'true';
      const allowedEmails = (process.env.FIRST_HASH_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const isAllowedEmail = allowedEmails.includes((email || '').toLowerCase());
      if (allowFirstSetup && isAllowedEmail && user && user.metadata) {
        try {
          const newHash = await bcrypt.hash(password, 12);
          const userIdForUpdate = (user as any)?._id || (user as any)?.id;
          if (!userIdForUpdate) throw new Error('Missing user id');
          await User.updateOne(
            { _id: userIdForUpdate },
            { $set: { 'metadata.hashedPassword': newHash } },
            { runValidators: false }
          );
          passwordToCompare = newHash;
          console.log('🛠 Initialized password hash via first-login claim');
        } catch (e) {
          console.warn('Failed to initialize password hash:', e);
          return res.status(422).json({
            success: false,
            message: 'パスワード再設定が必要です',
            error: 'Password hash missing',
          } as LoginResponse);
        }
      } else {
        return res.status(422).json({
          success: false,
          message: 'パスワード再設定が必要です',
          error: 'Password hash missing',
        } as LoginResponse);
      }
    }

    const isPasswordValid = await bcrypt.compare(password, passwordToCompare);
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

    // ユーザーのサブスクリプション情報を取得
    let subscription: any = null;
    try {
      if (SubscriptionModel) {
        subscription = await SubscriptionModel.findOne({
          userId: user.id,
          status: { $in: ['active', 'trialing'] },
        });
      }
    } catch {}

    // 最終ログイン時刻の更新（バリデーション回避の部分更新）
    try {
      const userIdForUpdate = (user as any)?._id || (user as any)?.id;
      if (userIdForUpdate) {
        await User.updateOne(
          { _id: userIdForUpdate },
          { $set: { lastLoginAt: new Date(), lastActivityAt: new Date() } },
          { runValidators: false }
        );
      }
    } catch (e) {
      console.warn('⚠️ Failed to update last login timestamps:', e);
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

    // サブスクリプション情報を追加
    if (subscription) {
      response.subscription = {
        id: subscription.id,
        planType: subscription.planType,
        status: subscription.status,
        limits: subscription.limits,
      };
    }

    console.log('✅ User login successful:', {
      userId: user.id,
      email: user.email,
      rememberMe,
      subscriptionPlan: subscription?.planType || 'none',
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
