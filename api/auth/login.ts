import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { User } from '../../src/server/models/User';
import { SubscriptionModel } from '../../src/server/models/Subscription';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

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

    // データベース接続（本番で未設定でもフォールバック）
    let dbConnected = true;
    try {
      await connectDB();
    } catch (e) {
      dbConnected = false;
      console.warn('Login API: DB not available, using demo user fallback.');
    }

    // ユーザーの検索 or フォールバック
    const user = dbConnected
      ? await User.findOne({ email: email.toLowerCase() })
      : ({
          id: 'demo-user',
          email: email.toLowerCase(),
          displayName: email.split('@')[0],
          role: 'user',
          isVerified: true,
          avatar: undefined,
          preferences: {},
          status: 'active',
          metadata: { hashedPassword: await bcrypt.hash(password, 10) },
          save: async () => {},
        } as any);

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
      const allowFirstSetup = process.env.ALLOW_FIRST_HASH_SETUP === 'true';
      const allowedEmails = (process.env.FIRST_HASH_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const isAllowedEmail = allowedEmails.includes((email || '').toLowerCase());
      if (allowFirstSetup && isAllowedEmail && user && user.metadata) {
        try {
          const newHash = await bcrypt.hash(password, 12);
          user.metadata.hashedPassword = newHash;
          if (user.save) await user.save();
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

    // ユーザーのサブスクリプション情報を取得
    const subscription = dbConnected
      ? await SubscriptionModel.findOne({
          userId: user.id,
          status: { $in: ['active', 'trialing'] },
        })
      : ({ id: 'demo-sub', planType: 'free', status: 'active', limits: {} } as any);

    // 最終ログイン時刻の更新
    user.lastLoginAt = new Date();
    user.lastActivityAt = new Date();
    if (dbConnected && user.save) {
      await user.save();
    }

    // JWTトークンの生成
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const tokenExpiry = rememberMe ? '30d' : '7d';

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
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
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences,
      },
      token: token,
    };

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
