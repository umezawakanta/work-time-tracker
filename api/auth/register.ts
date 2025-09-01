import type { VercelRequest, VercelResponse } from '@vercel/node';
// Lazy-load server modules to work in serverless bundles
let connectDB: (() => Promise<void>) | null = null;
let User: any = null;
let SubscriptionModel: any = null;
async function loadServerModules(): Promise<boolean> {
  if (connectDB && User) return true;
  try {
    const dbMod = await import('../../src/server/config/database.js');
    connectDB = (dbMod as any).connectDB as () => Promise<void>;
    const userMod = await import('../../src/server/models/User.js');
    User = (userMod as any).User;
    try {
      const subMod = await import('../../src/server/models/Subscription.js');
      SubscriptionModel = (subMod as any).SubscriptionModel;
    } catch {}
    return true;
  } catch {
    console.warn('[auth/register] Failed to load server modules');
    return false;
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper functions (simplified for API route)
const createEntityId = (prefix: string = 'entity'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createTimestamp = (): string => {
  return new Date().toISOString();
};

// Registration request interface
interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
  referralCode?: string;
}

// Registration response interface
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
  token?: string;
  subscription?: {
    id: string;
    planType: string;
    status: string;
    trialEndDate?: string;
  };
  error?: string;
}

// Robust JSON reader shared with login
async function readJson(req: VercelRequest): Promise<any> {
  try {
    const existingBody: unknown = (req as any).body;
    if (existingBody !== undefined) {
      return typeof existingBody === 'string' ? JSON.parse(existingBody) : existingBody;
    }
    const raw: string = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
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
    origin && origin.match(/^https:\/\/work-time-tracker-five-.*\.vercel\.app$/);
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
    } as RegisterResponse);
    return;
  }

  try {
    console.log('🔐 User registration started');

    // リクエストボディの検証
    const body: Partial<RegisterRequest> = await readJson(req);
    const email = (body?.email as string) || '';
    const password = (body?.password as string) || '';
    const displayName = (body?.displayName as string) || '';
    const firstName = (body?.firstName as string) || '';
    const lastName = (body?.lastName as string) || '';
    const acceptTerms = Boolean(body?.acceptTerms);
    const subscribeNewsletter = Boolean(body?.subscribeNewsletter);
    const referralCode = (body?.referralCode as string) || undefined;

    // 必須フィールドの検証
    if (!email || !password || !displayName || !acceptTerms) {
      return res.status(400).json({
        success: false,
        message: '必須フィールドが不足しています',
        error: 'Missing required fields: email, password, displayName, acceptTerms',
      } as RegisterResponse);
    }

    // パスワード強度の検証
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは8文字以上である必要があります',
        error: 'Password must be at least 8 characters long',
      } as RegisterResponse);
    }

    // メールアドレスの形式検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください',
        error: 'Invalid email format',
      } as RegisterResponse);
    }

    // データベース接続（失敗時はサービス不可として返却）
    try {
      const hasUri = Boolean(process.env.MONGODB_URI);
      const uriMasked = (process.env.MONGODB_URI || '').replace(
        /(mongodb(\+srv)?:\/\/)([^:@]+)(:[^@]+)?@/i,
        '$1****:****@'
      );
      console.log('[auth/register] DB connect start', {
        hasUri,
        uri: hasUri ? uriMasked : 'undefined',
        nodeEnv: process.env.NODE_ENV,
      });
      const loaded = await loadServerModules();
      if (!loaded || !connectDB) throw new Error('Server modules not available');
      await connectDB();
      console.log('[auth/register] DB connect success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('[auth/register] DB connect failed', { message: msg });
      return res.status(503).json({
        success: false,
        message: '現在ユーザー登録サービスを利用できません。しばらくしてから再試行してください。',
        error: 'Service unavailable (DB connection failed)',
      } as RegisterResponse);
    }

    // 既存ユーザーの確認
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'このメールアドレスは既に使用されています',
        error: 'Email already exists',
      } as RegisterResponse);
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーIDとタイムスタンプの生成
    const userId = createEntityId('user');
    const now = createTimestamp();

    // 新しいユーザーの作成
    const newUser = new User({
      uid: userId,
      email: email.toLowerCase(),
      displayName,
      firstName: firstName || '',
      lastName: lastName || '',
      provider: 'jwt',
      // スキーマ要件に合わせてハッシュ済みパスワードを保存
      password: hashedPassword,
      role: 'user',
      isVerified: false, // メール認証が必要
      permissions: ['read:own_data', 'write:own_data'],

      // 初期設定
      preferences: {
        theme: 'auto',
        language: 'ja',
        timezone: 'Asia/Tokyo',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        currency: 'JPY',
        notifications: {
          email: true,
          push: true,
          sms: false,
          inApp: true,
          digest: 'daily',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
        },
        dashboard: {
          layout: 'comfortable',
          defaultView: 'dashboard',
          widgets: [],
          refreshInterval: 30000,
          showWelcome: true,
        },
        productivity: {
          pomodoroEnabled: false,
          pomodoroMinutes: 25,
          breakMinutes: 5,
          longBreakMinutes: 15,
          autoStartBreaks: false,
          focusMode: false,
          distractionBlocking: false,
          goalSetting: true,
        },
      },

      settings: {
        privacy: {
          profileVisibility: 'team',
          activityVisibility: 'team',
          allowDataSharing: false,
          allowAnalytics: true,
          allowMarketing: subscribeNewsletter,
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 86400000, // 24 hours
          allowMultipleSessions: true,
          ipWhitelist: [],
          deviceTrust: false,
          loginNotifications: true,
        },
        integrations: {
          enabledProviders: [],
          autoSync: true,
          syncFrequency: 300000, // 5 minutes
          dataMapping: {},
          conflictResolution: 'manual',
        },
        features: {
          betaFeatures: false,
          experimentalFeatures: false,
          aiFeatures: true,
          advancedAnalytics: false,
          teamFeatures: false,
        },
      },

      stats: {
        totalWorkHours: 0,
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        achievementCount: 0,
        badgeCount: 0,
        streakDays: 0,
        averageProductivity: 0,
        joinDate: now,
        lastWeekHours: 0,
        lastMonthHours: 0,
      },

      status: 'active',
      metadata: {
        registrationSource: 'web',
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        referralCode: referralCode || null,
        acceptedTermsAt: now,
        subscribedNewsletter: subscribeNewsletter,
        // 互換性のため metadata にも保持（ログイン側は複数候補を参照）
        hashedPassword: hashedPassword,
      },
    });

    // ユーザーの保存
    const savedUser = await newUser.save();

    // 無料プランのサブスクリプション作成
    const freeSubscription = new SubscriptionModel({
      userId: savedUser.id,
      planId: 'free-plan',
      stripeCustomerId: `local_customer_${savedUser.id}`,
      stripeSubscriptionId: `local_sub_${Date.now()}`,
      planName: 'フリープラン',
      planType: 'free',
      billingCycle: 'monthly',
      amount: 0,
      currency: 'jpy',
      startDate: now,
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日間トライアル
      status: 'trialing',
      paymentStatus: 'paid',
      usage: {
        period: new Date().toISOString().slice(0, 7), // YYYY-MM
        workHours: 0,
        projects: 0,
        tasks: 0,
        reports: 0,
        apiCalls: 0,
        storage: 0,
        teamMembers: 0,
        integrations: 0,
      },
      limits: {
        workHours: 100, // 月100時間まで
        projects: 3,
        tasks: 50,
        reports: 5,
        apiCalls: 1000,
        storage: 1024 * 1024 * 100, // 100MB
        teamMembers: 1,
        integrations: 2,
        advancedFeatures: false,
        prioritySupport: false,
        customBranding: false,
      },
      addOns: [],
    });

    await freeSubscription.save();

    // JWTトークンの生成
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const token = jwt.sign(
      {
        userId: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
      jwtSecret,
      {
        expiresIn: '7d',
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    // レスポンス
    const response: RegisterResponse = {
      success: true,
      message: 'ユーザー登録が完了しました。',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        displayName: savedUser.displayName,
        role: savedUser.role,
        isVerified: savedUser.isVerified,
      },
      token: token,
      subscription: {
        id: freeSubscription.id,
        planType: freeSubscription.planType,
        status: freeSubscription.status,
        trialEndDate: freeSubscription.trialEndDate,
      },
    };

    console.log('✅ User registration completed:', {
      userId: savedUser.id,
      email: savedUser.email,
      subscription: freeSubscription.id,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ User registration error:', error);

    res.status(500).json({
      success: false,
      message: 'ユーザー登録中にエラーが発生しました',
      error:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Internal server error',
    } as RegisterResponse);
  }
}
