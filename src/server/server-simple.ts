// Enhanced simple server for todo API with proper error handling
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import mongoose from 'mongoose';
import { Book } from './models/Book.js';
import { TodoModel } from './models/Todo.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  login as loginController,
  register as registerController,
  checkAuth as checkAuthController,
  getUserData as getUserDataController,
  refreshToken as refreshTokenController,
} from './controllers/authController.js';
import { serverErrorLogger, errorHandler } from '../middleware/serverErrorLogger.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Import services
import notificationService from './services/notificationService.js';
import emailService from './services/emailService.js';
import blogRoutes from './routes/blogRoutes.js';
import { BlogPost } from './models/BlogPost.js';
import { DailyVictory } from './models/DailyVictory.js';

const app = express();
const PORT = 3001;
// Disable ETag to avoid 304 on dev mock endpoints (ensures fresh JSON each time)
app.set('etag', false);

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

// Debug: Log API key status at startup
console.log('🔑 Environment variables loaded:');
console.log(
  `   VITE_ANTHROPIC_API_KEY: ${process.env.VITE_ANTHROPIC_API_KEY ? '✅ Found' : '❌ Not found'}`
);
console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Found' : '❌ Not found'}`);
console.log(
  `   Using API Key: ${ANTHROPIC_API_KEY ? '✅ Configured (VITE_ANTHROPIC_API_KEY優先)' : '❌ Not configured'}`
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(serverErrorLogger);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// JWT Authentication middleware
interface AuthedRequest extends Request {
  user?: { id: string };
}

const authenticate = (req: AuthedRequest, res: Response, next: NextFunction) => {
  // CI E2E: allow bypassing auth for stability (works with either CI or explicit flag)
  if (process.env.CI_E2E_AUTH_BYPASS === 'true' || process.env.CI === 'true') {
    req.user = { id: 'e2e-user' };
    return next();
  }
  try {
    const rawAuth = req.headers.authorization;
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '認証されていません' });
      return;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.JWT_SECRET || 'development-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as { id?: string };
    if (!decoded?.id) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.user = { id: String(decoded.id) };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Health check (no noisy logs)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Simple server running' });
});

// DB health
app.get('/api/db/status', async (_req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0=disc 1=conn 2=conn-ing 3=disc-ing
    const ok = state === 1;
    let version: string | null = null;
    try {
      const status: any = await mongoose.connection.db?.admin().serverStatus();
      version = status?.version || null;
    } catch {}
    res.json({ success: true, connected: ok, state, version });
  } catch (e) {
    res.json({ success: true, connected: false, state: 0 });
  }
});

app.post('/api/db/reconnect', async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    await connectDB();
    res.json({ success: mongoose.connection.readyState === 1 });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Reconnect failed' });
  }
});

// =============================
// Guitar Practices (In-memory)
// =============================
type GuitarPracticeDoc = {
  id: string;
  _id: string;
  date: string; // ISO string
  duration: number; // minutes
  technique: string;
  song?: string;
  bpm?: number;
  difficulty: number; // 1-5
  notes?: string;
  satisfaction: number; // 1-5
  isMilestone: boolean;
  createdAt: string;
};

const guitarPracticesStore: Map<string, GuitarPracticeDoc> = new Map();

const createPracticeId = () => 'gpr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/guitar-practices', (_req, res) => {
  const all = Array.from(guitarPracticesStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(all);
});

app.post('/api/guitar-practices', (req, res) => {
  try {
    const body = req.body || {};
    const now = new Date().toISOString();
    const id = createPracticeId();
    const doc: GuitarPracticeDoc = {
      id,
      _id: id,
      date: typeof body.date === 'string' ? body.date : now,
      duration: Number(body.duration) || 0,
      technique: String(body.technique || ''),
      song: body.song ? String(body.song) : undefined,
      bpm: body.bpm != null ? Number(body.bpm) : undefined,
      difficulty: Number(body.difficulty) || 3,
      notes: body.notes ? String(body.notes) : undefined,
      satisfaction: Number(body.satisfaction) || 3,
      isMilestone: Boolean(body.isMilestone),
      createdAt: now,
    };
    guitarPracticesStore.set(id, doc);
    res.status(201).json(doc);
  } catch (error) {
    console.error('Failed to create guitar practice:', error);
    res.status(500).json({ success: false, message: 'Failed to create guitar practice' });
  }
});

app.put('/api/guitar-practices/:id', (req, res) => {
  const { id } = req.params;
  if (!guitarPracticesStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Practice not found' });
  }
  const prev = guitarPracticesStore.get(id)!;
  const body = req.body || {};
  const next: GuitarPracticeDoc = {
    ...prev,
    date: typeof body.date === 'string' ? body.date : prev.date,
    duration: body.duration != null ? Number(body.duration) : prev.duration,
    technique: body.technique != null ? String(body.technique) : prev.technique,
    song: body.song != null ? String(body.song) : prev.song,
    bpm: body.bpm != null ? Number(body.bpm) : prev.bpm,
    difficulty: body.difficulty != null ? Number(body.difficulty) : prev.difficulty,
    notes: body.notes != null ? String(body.notes) : prev.notes,
    satisfaction: body.satisfaction != null ? Number(body.satisfaction) : prev.satisfaction,
    isMilestone: body.isMilestone != null ? Boolean(body.isMilestone) : prev.isMilestone,
  };
  guitarPracticesStore.set(id, next);
  res.json(next);
});

app.delete('/api/guitar-practices/:id', (req, res) => {
  const { id } = req.params;
  if (!guitarPracticesStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Practice not found' });
  }
  guitarPracticesStore.delete(id);
  res.json({ success: true, id });
});

// =============================
// Debt (In-memory)
// =============================
type DebtRecord = {
  _id: string;
  date: string; // ISO
  value: number;
  description: string;
  account: string;
  createdAt: string;
  updatedAt: string;
};

type AssetRecord = {
  _id: string;
  date: string; // ISO
  value: number;
  description: string;
  account: string;
  createdAt: string;
  updatedAt: string;
};

const debtStore: Map<string, DebtRecord> = new Map();
const createDebtId = () => 'debt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// Asset store and ID generator
const assetStore: Map<string, AssetRecord> = new Map();
const createAssetId = () => 'asset_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// Work Time store and ID generator
type WorkTimeRecord = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  totalHours: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const workTimeStore: Map<string, WorkTimeRecord> = new Map();
const createWorkTimeId = () => 'wt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/debt', (_req, res) => {
  const all = Array.from(debtStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json(all);
});

app.post('/api/debt', (req, res) => {
  try {
    const { date, value, description, account } = req.body || {};
    if (!date || value == null || !description || !account) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const id = createDebtId();
    const now = new Date().toISOString();
    const rec: DebtRecord = {
      _id: id,
      date: String(date),
      value: Number(value),
      description: String(description),
      account: String(account),
      createdAt: now,
      updatedAt: now,
    };
    debtStore.set(id, rec);
    res.status(201).json({ message: '負債情報が正常に記録されました', debt: rec });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create debt entry' });
  }
});

app.put('/api/debt/:id', (req, res) => {
  const { id } = req.params;
  const prev = debtStore.get(id);
  if (!prev) return res.status(404).json({ success: false, error: 'Not found' });
  const body = req.body || {};
  const next: DebtRecord = {
    ...prev,
    date: body.date ? String(body.date) : prev.date,
    value: body.value != null ? Number(body.value) : prev.value,
    description: body.description != null ? String(body.description) : prev.description,
    account: body.account != null ? String(body.account) : prev.account,
    updatedAt: new Date().toISOString(),
  };
  debtStore.set(id, next);
  res.json({ message: '負債情報が正常に更新されました', debt: next });
});

app.delete('/api/debt/:id', (req, res) => {
  const { id } = req.params;
  if (!debtStore.has(id)) return res.status(404).json({ success: false, error: 'Not found' });
  const removed = debtStore.get(id)!;
  debtStore.delete(id);
  res.json({ message: '負債情報が正常に削除されました', debt: removed });
});

// =============================
// Sleep Tracker (In-memory)
// =============================
type SleepRecord = {
  _id: string;
  date: string; // YYYY-MM-DD
  wakeUp: string | null; // HH:mm or null
  bedtime: string | null; // HH:mm or null
  quality?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const sleepRecordsStore: Map<string, SleepRecord> = new Map();

const createSleepId = () => 'slp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

// GET all sleep records
app.get('/api/sleep-records', (_req, res) => {
  const all = Array.from(sleepRecordsStore.values()).sort((a, b) => (a.date > b.date ? -1 : 1));
  res.json(all);
});

// POST create sleep record
app.post('/api/sleep-records', (req, res) => {
  try {
    const body = req.body || {};
    const id = createSleepId();
    const nowIso = new Date().toISOString();
    const record: SleepRecord = {
      _id: id,
      date: typeof body.date === 'string' ? body.date : nowIso.split('T')[0],
      wakeUp: body.wakeUp ?? null,
      bedtime: body.bedtime ?? null,
      quality: body.quality,
      notes: body.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    sleepRecordsStore.set(id, record);
    res.status(201).json({ message: 'created', sleepRecord: record });
  } catch (error) {
    console.error('Failed to create sleep record:', error);
    res.status(500).json({ success: false, message: 'Failed to create sleep record' });
  }
});

// PUT update sleep record
app.put('/api/sleep-records/:id', (req, res) => {
  const { id } = req.params;
  if (!sleepRecordsStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  const prev = sleepRecordsStore.get(id)!;
  const body = req.body || {};
  const next: SleepRecord = {
    ...prev,
    date: typeof body.date === 'string' ? body.date : prev.date,
    wakeUp: body.wakeUp !== undefined ? body.wakeUp : prev.wakeUp,
    bedtime: body.bedtime !== undefined ? body.bedtime : prev.bedtime,
    quality: body.quality !== undefined ? body.quality : prev.quality,
    notes: body.notes !== undefined ? body.notes : prev.notes,
    updatedAt: new Date().toISOString(),
  };
  sleepRecordsStore.set(id, next);
  res.json({ message: 'updated', sleepRecord: next });
});

// DELETE sleep record
app.delete('/api/sleep-records/:id', (req, res) => {
  const { id } = req.params;
  if (!sleepRecordsStore.has(id)) {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }
  sleepRecordsStore.delete(id);
  res.json({ success: true });
});

// =============================
// Bugs (dev server, mirrors Vercel API)
// =============================
type BugDoc = {
  _id: string;
  title: string;
  description?: string;
  featureId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source?: 'client' | 'server' | 'manual';
  fingerprint?: string;
  occurrences?: number;
  lastOccurredAt?: string;
  createdAt: string;
  updatedAt: string;
};

const bugStore: Map<string, BugDoc> = new Map();
const bugIndexByFingerprint: Map<string, string> = new Map();
const createBugId = () => 'bug_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/bugs', (req, res) => {
  const featureId = typeof req.query.featureId === 'string' ? req.query.featureId : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  let list = Array.from(bugStore.values());
  if (featureId && featureId !== 'all') list = list.filter((b) => b.featureId === featureId);
  if (status && status !== 'all') list = list.filter((b) => b.status === status);
  list.sort((a, b) =>
    (b.lastOccurredAt || b.createdAt).localeCompare(a.lastOccurredAt || a.createdAt)
  );
  res.json({ success: true, data: list });
});

// Password reset API endpoint
app.post('/api/auth/password-reset', async (req, res) => {
  try {
    const { action, email, token, password, confirmPassword } = req.body;

    if (action === 'forgot') {
      // パスワード忘れ処理
      if (!email) {
        return res.status(400).json({ success: false, message: 'メールアドレスは必須です' });
      }

      // メール形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ success: false, message: 'メールアドレスの形式が正しくありません' });
      }

      console.log('[PASSWORD-RESET] Forgot password requested for:', email);

      // 本番環境では実際のデータベースでユーザーを検索し、メールを送信
      const host = req.get('host') || '';
      const isProduction = host.includes('vercel.app');

      console.log('[PASSWORD-RESET] Environment check for forgot password:', {
        host,
        isProduction,
      });

      if (isProduction) {
        try {
          // MongoDB接続
          const mongoose = await import('mongoose');
          await mongoose.default.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker'
          );

          const User = mongoose.default.model(
            'User',
            new mongoose.Schema({
              email: { type: String, required: true, unique: true },
              password: { type: String, required: true },
              name: { type: String, required: true },
              role: { type: String, default: 'user' },
              isEmailVerified: { type: Boolean, default: false },
              passwordResetToken: String,
              passwordResetExpires: Date,
            })
          );

          // ユーザーが存在するかチェック
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            // セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
            return res.json({
              success: true,
              message: 'パスワードリセットメールを送信しました',
              email: email,
            });
          }

          // パスワードリセットトークンを生成
          const crypto = await import('crypto');
          const resetToken = crypto.default.randomBytes(32).toString('hex');
          const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間

          console.log('[PASSWORD-RESET] Generated token for user:', {
            userId: user._id,
            email: user.email,
            token: resetToken.substring(0, 10) + '...',
            expires: resetExpires,
          });

          // ユーザーのリセットトークンを更新
          await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
          });

          console.log('[PASSWORD-RESET] Token saved to database successfully');

          // メール送信（実際の実装ではNodemailerなどを使用）
          console.log('[PASSWORD-RESET] Reset token generated:', resetToken);
          console.log(
            '[PASSWORD-RESET] Reset URL:',
            `https://work-time-tracker-five.vercel.app/reset-password?token=${resetToken}`
          );

          res.json({
            success: true,
            message: 'パスワードリセットメールを送信しました',
            email: email,
          });
        } catch (dbError) {
          console.error('[PASSWORD-RESET] Database error:', dbError);
          res.status(500).json({ success: false, message: 'データベースエラーが発生しました' });
        }
      } else {
        // 開発環境では常に成功として返す
        res.json({
          success: true,
          message: 'パスワードリセットメールを送信しました',
          email: email,
        });
      }
    } else if (action === 'reset') {
      // パスワードリセット処理
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'すべてのフィールドは必須です' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'パスワードが一致しません' });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ success: false, message: 'パスワードは8文字以上である必要があります' });
      }

      console.log('[PASSWORD-RESET] Password reset requested for token:', token);

      // 本番環境では実際のデータベースでパスワードをリセット
      const host = req.get('host') || '';
      const isProduction = host.includes('vercel.app');

      if (isProduction) {
        try {
          // MongoDB接続
          const mongoose = await import('mongoose');
          await mongoose.default.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker'
          );

          const User = mongoose.default.model(
            'User',
            new mongoose.Schema({
              email: { type: String, required: true, unique: true },
              password: { type: String, required: true },
              name: { type: String, required: true },
              role: { type: String, default: 'user' },
              isEmailVerified: { type: Boolean, default: false },
              passwordResetToken: String,
              passwordResetExpires: Date,
            })
          );

          // トークンでユーザーを検索
          const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
          });

          if (!user) {
            return res.status(400).json({
              success: false,
              message: '無効または期限切れのトークンです',
            });
          }

          // パスワードをハッシュ化
          const bcrypt = await import('bcrypt').catch(() => null);
          if (!bcrypt) {
            throw new Error('bcrypt module not available');
          }
          const hashedPassword = await (bcrypt as any).default.hash(password, 12);

          // ユーザーのパスワードを更新し、リセットトークンをクリア
          await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
          });

          console.log('[PASSWORD-RESET] Password reset successful for user:', user.email);

          res.json({
            success: true,
            message: 'パスワードが正常にリセットされました',
          });
        } catch (dbError) {
          console.error('[PASSWORD-RESET] Database error:', dbError);
          res.status(500).json({ success: false, message: 'データベースエラーが発生しました' });
        }
      } else {
        // 開発環境では常に成功として返す
        res.json({
          success: true,
          message: 'パスワードが正常にリセットされました',
        });
      }
    } else {
      res.status(400).json({ success: false, message: '無効なアクションです' });
    }
  } catch (error) {
    console.error('Password reset API error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Password reset token verification endpoint
app.post('/api/auth/password-reset/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'トークンは必須です' });
    }

    console.log('[PASSWORD-RESET] Token verification requested for:', token);

    // 本番環境では実際のデータベースでトークンを検証
    const host = req.get('host') || '';
    const isProduction = host.includes('vercel.app');

    console.log('[PASSWORD-RESET] Environment check:', {
      host,
      isProduction,
      token: token.substring(0, 10) + '...',
    });

    if (isProduction) {
      try {
        console.log('[PASSWORD-RESET] Connecting to MongoDB...');
        // MongoDB接続
        const mongoose = await import('mongoose');
        await mongoose.default.connect(
          process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker'
        );
        console.log('[PASSWORD-RESET] MongoDB connected successfully');

        const User = mongoose.default.model(
          'User',
          new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            role: { type: String, default: 'user' },
            isEmailVerified: { type: Boolean, default: false },
            passwordResetToken: String,
            passwordResetExpires: Date,
          })
        );

        console.log('[PASSWORD-RESET] Searching for user with token...');
        // トークンでユーザーを検索
        const user = await User.findOne({
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() },
        });

        console.log('[PASSWORD-RESET] User search result:', {
          found: !!user,
          userId: user?._id,
          email: user?.email,
          tokenExpires: user?.passwordResetExpires,
          currentTime: new Date(),
        });

        if (!user) {
          console.log('[PASSWORD-RESET] Invalid or expired token');
          return res.json({
            success: true,
            valid: false,
            message: '無効または期限切れのトークンです',
          });
        }

        console.log('[PASSWORD-RESET] Token is valid for user:', user.email);
        res.json({
          success: true,
          valid: true,
        });
      } catch (dbError) {
        console.error('[PASSWORD-RESET] Database error:', dbError);
        res.status(500).json({ success: false, message: 'データベースエラーが発生しました' });
      }
    } else {
      // 開発環境では常に有効として返す
      console.log('[PASSWORD-RESET] Development mode - token always valid');
      res.json({
        success: true,
        valid: true,
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Debug endpoint to check password reset tokens
app.get('/api/debug/password-reset-tokens', async (req, res) => {
  try {
    const host = req.get('host') || '';
    const isProduction = host.includes('vercel.app');

    if (!isProduction) {
      return res.status(403).json({ error: 'This endpoint is only available in production' });
    }

    console.log('[DEBUG] Checking password reset tokens...');

    // MongoDB接続
    const mongoose = await import('mongoose');
    await mongoose.default.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker'
    );

    const User = mongoose.default.model(
      'User',
      new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isEmailVerified: { type: Boolean, default: false },
        passwordResetToken: String,
        passwordResetExpires: Date,
      })
    );

    // パスワードリセットトークンを持つユーザーを検索
    const usersWithTokens = await User.find({
      passwordResetToken: { $exists: true, $ne: null },
      passwordResetExpires: { $exists: true, $ne: null },
    }).select('email passwordResetToken passwordResetExpires createdAt updatedAt');

    console.log('[DEBUG] Found users with reset tokens:', usersWithTokens.length);

    res.json({
      success: true,
      count: usersWithTokens.length,
      tokens: usersWithTokens.map((user) => ({
        email: user.email,
        token: user.passwordResetToken?.substring(0, 10) + '...',
        expires: user.passwordResetExpires,
        isExpired: user.passwordResetExpires ? user.passwordResetExpires < new Date() : true,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      })),
    });
  } catch (error) {
    console.error('[DEBUG] Error checking tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Password reset confirmation endpoint
app.post('/api/auth/password-reset/confirm', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'トークンとパスワードは必須です' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: 'パスワードは8文字以上である必要があります' });
    }

    console.log('[PASSWORD-RESET] Password reset confirmation for token:', token);

    // 本番環境では実際のデータベースでパスワードをリセット
    const host = req.get('host') || '';
    const isProduction = host.includes('vercel.app');

    if (isProduction) {
      try {
        // MongoDB接続
        const mongoose = await import('mongoose');
        await mongoose.default.connect(
          process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker'
        );

        const User = mongoose.default.model(
          'User',
          new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            role: { type: String, default: 'user' },
            isEmailVerified: { type: Boolean, default: false },
            passwordResetToken: String,
            passwordResetExpires: Date,
          })
        );

        // トークンでユーザーを検索
        const user = await User.findOne({
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
          return res.status(400).json({
            success: false,
            message: '無効または期限切れのトークンです',
          });
        }

        // パスワードをハッシュ化
        const bcrypt = await import('bcrypt').catch(() => null);
        if (!bcrypt) {
          throw new Error('bcrypt module not available');
        }
        const hashedPassword = await (bcrypt as any).default.hash(password, 12);

        // ユーザーのパスワードを更新し、リセットトークンをクリア
        await User.findByIdAndUpdate(user._id, {
          password: hashedPassword,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        });

        console.log('[PASSWORD-RESET] Password reset successful for user:', user.email);

        res.json({
          success: true,
          message: 'パスワードが正常にリセットされました',
        });
      } catch (dbError) {
        console.error('[PASSWORD-RESET] Database error:', dbError);
        res.status(500).json({ success: false, message: 'データベースエラーが発生しました' });
      }
    } else {
      // 開発環境では常に成功として返す
      res.json({
        success: true,
        message: 'パスワードが正常にリセットされました',
      });
    }
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Server error reporting API endpoint
app.get('/api/admin/server-errors', async (req, res) => {
  try {
    // Mock implementation for development
    const mockErrors = [
      {
        id: 'error_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        stack: 'Error: Connection timeout\n    at connectDB (/app/src/config/database.js:45:12)',
        userId: 'user_123',
        endpoint: '/api/todos',
        method: 'GET',
        statusCode: 500,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '192.168.1.100',
        sessionId: 'session_456',
        tags: ['database', 'timeout'],
        metadata: { query: { limit: '10' } },
      },
      {
        id: 'error_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'warn',
        message: 'Rate limit exceeded',
        stack:
          'Error: Rate limit exceeded\n    at rateLimiter (/app/src/middleware/rateLimit.js:23:8)',
        userId: 'user_456',
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 429,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ip: '192.168.1.101',
        sessionId: 'session_789',
        tags: ['rate-limit', 'auth'],
        metadata: { attempts: 5 },
      },
    ];

    const stats = {
      totalErrors: mockErrors.length,
      errorsByLevel: { error: 1, warn: 1 },
      errorsByEndpoint: { '/api/todos': 1, '/api/auth/login': 1 },
      errorsByHour: { '14': 1, '15': 1 },
      recentErrors: mockErrors.slice(0, 2),
      topErrors: [
        { message: 'Database connection timeout', count: 1 },
        { message: 'Rate limit exceeded', count: 1 },
      ],
    };

    res.json({ success: true, errors: mockErrors, stats });
  } catch (error) {
    console.error('Server errors API error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/bugs', (req, res) => {
  try {
    const body = req.body || {};
    const title = String(body.title || '').slice(0, 500);
    if (!title) return res.status(400).json({ success: false, message: 'title は必須です' });
    const featureId = body.featureId ? String(body.featureId) : 'unknown';
    const description = body.description ? String(body.description) : undefined;
    const source = ['client', 'server', 'manual'].includes(String(body.source))
      ? (body.source as any)
      : 'manual';
    const severity = ['low', 'medium', 'high', 'critical'].includes(String(body.severity))
      ? (body.severity as any)
      : 'medium';
    const status = ['open', 'in_progress', 'resolved', 'closed'].includes(String(body.status))
      ? (body.status as any)
      : 'open';
    const fingerprint = String(
      body.fingerprint || `${title}|${featureId}|${source}|${(body.endpoint || '').slice(0, 120)}`
    ).slice(0, 512);
    const now = new Date().toISOString();

    // dedupe upsert by fingerprint
    const existingId = bugIndexByFingerprint.get(fingerprint);
    if (existingId && bugStore.has(existingId)) {
      const prev = bugStore.get(existingId)!;
      const next: BugDoc = {
        ...prev,
        description,
        severity,
        status,
        source,
        lastOccurredAt: now,
        occurrences: (prev.occurrences || 0) + 1,
        updatedAt: now,
      };
      bugStore.set(existingId, next);
      return res.status(201).json({ success: true, data: next });
    }

    const id = createBugId();
    const doc: BugDoc = {
      _id: id,
      title,
      description,
      featureId,
      severity,
      status,
      source,
      fingerprint,
      occurrences: 1,
      lastOccurredAt: now,
      createdAt: now,
      updatedAt: now,
    };
    bugStore.set(id, doc);
    bugIndexByFingerprint.set(fingerprint, id);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to ingest bug' });
  }
});

// WBS endpoints not implemented yet
app.post('/api/wbs', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.get('/api/wbs/project/:projectId', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.put('/api/wbs/:id', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.delete('/api/wbs/:id', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);

// Authentication endpoints (real controllers)
app.post('/api/auth/login', (req: Request, res: Response) => {
  void loginController(req, res);
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  void registerController(req, res);
});

// Magic link endpoint (not implemented)
app.post('/api/auth/magic-link', (req, res) => {
  console.log('✅ POST /api/auth/magic-link called');
  return res.status(501).json({ success: false, message: 'Not implemented' });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('✅ POST /api/auth/logout called');
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  void getUserDataController(req as AuthedRequest, res);
});

// whoami endpoint for frontend compatibility
app.get('/api/auth/whoami', authenticate, (req: Request, res: Response) => {
  void checkAuthController(req as AuthedRequest, res);
});

// /api/auth/check エンドポイントを追加
app.get('/api/auth/check', authenticate, (req: Request, res: Response) => {
  void checkAuthController(req as AuthedRequest, res);
});

// /api/auth/user エンドポイントを追加
app.get('/api/auth/user', authenticate, (req: Request, res: Response) => {
  void getUserDataController(req as AuthedRequest, res);
});

// /api/auth/profile エンドポイントを追加
app.put('/api/auth/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, email, traits } = req.body;
    const userId = (req as AuthedRequest).user?.id;

    if (!userId) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // バリデーション
    if (!name || !email) {
      return res.status(400).json({ error: '名前とメールアドレスは必須です' });
    }

    // ユーザー情報を更新（実際のデータベース更新は実装に応じて調整）
    const updatedUser = {
      id: userId,
      name: name,
      email: email,
      isAdmin: false,
      traits: traits || {},
      _id: userId,
    };

    console.log('Profile updated:', { userId, name, email });
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'プロフィールの更新に失敗しました' });
  }
});

// =============================
// Work Time API endpoints
// =============================
app.get('/api/worktime', (req, res) => {
  const all = Array.from(workTimeStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ストアが空の場合はモックデータを返す
  if (all.length === 0) {
    const mockWorkTimeData = [
      {
        id: 'wt_1',
        date: '2024-01-20',
        startTime: '09:00',
        endTime: '18:00',
        breakTime: 60,
        totalHours: 8,
        description: '通常勤務',
        createdAt: '2024-01-20T09:00:00.000Z',
        updatedAt: '2024-01-20T18:00:00.000Z',
      },
      {
        id: 'wt_2',
        date: '2024-01-19',
        startTime: '09:30',
        endTime: '17:30',
        breakTime: 60,
        totalHours: 7,
        description: '通常勤務',
        createdAt: '2024-01-19T09:30:00.000Z',
        updatedAt: '2024-01-19T17:30:00.000Z',
      },
    ];
    res.json(mockWorkTimeData);
  } else {
    res.json(all);
  }
});

app.post('/api/worktime', (req, res) => {
  try {
    const { date, startTime, endTime, breakTime, description } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: '日付、開始時間、終了時間は必須です' });
    }

    const id = createWorkTimeId();
    const now = new Date().toISOString();

    // 勤務時間計算
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - (breakTime || 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const workTimeEntry: WorkTimeRecord = {
      id,
      date,
      startTime,
      endTime,
      breakTime: breakTime || 0,
      totalHours,
      description: description || '',
      createdAt: now,
      updatedAt: now,
    };

    workTimeStore.set(id, workTimeEntry);
    res.status(201).json(workTimeEntry);
  } catch (error) {
    console.error('Work time creation error:', error);
    res.status(500).json({ error: '勤務時間の記録に失敗しました' });
  }
});

// =============================
// Asset API endpoints
// =============================
app.get('/api/asset', (req, res) => {
  const all = Array.from(assetStore.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ストアが空の場合はモックデータを返す
  if (all.length === 0) {
    const mockAssetData = [
      {
        _id: 'asset_1',
        date: '2024-01-01',
        value: 1000000,
        description: '銀行預金',
        account: 'Bank Savings',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        _id: 'asset_2',
        date: '2024-01-15',
        value: 500000,
        description: '投資信託',
        account: 'Investment Fund',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
    ];
    res.json(mockAssetData);
  } else {
    res.json(all);
  }
});

app.post('/api/asset', (req, res) => {
  try {
    const { date, value, description, account } = req.body;

    if (!date || value == null || !description || !account) {
      return res.status(400).json({ error: '日付、金額、説明、口座名は必須です' });
    }

    const id = createAssetId();
    const now = new Date().toISOString();

    const assetEntry: AssetRecord = {
      _id: id,
      date: String(date),
      value: Number(value),
      description: String(description),
      account: String(account),
      createdAt: now,
      updatedAt: now,
    };

    assetStore.set(id, assetEntry);
    res.status(201).json(assetEntry);
  } catch (error) {
    console.error('Asset creation error:', error);
    res.status(500).json({ error: '資産の記録に失敗しました' });
  }
});

// MongoDB風の高度なメモリストレージ
interface TodoDocument {
  id: string;
  _id: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  type: 'input' | 'output' | 'idea' | 'meeting';
  category?: string;
  tags?: string[];
  deadline?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number;
  actualTime?: number;
}

interface UserDocument {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'ja' | 'en';
    notifications: boolean;
  };
}

// Note: MemoryDatabase removed - now using MongoDB directly

// Mapping functions to convert frontend values to schema-valid values
const mapTypeToSchema = (frontendType: string): 'task' | 'reminder' | 'goal' | 'habit' => {
  const typeMapping: Record<string, 'task' | 'reminder' | 'goal' | 'habit'> = {
    input: 'task',
    output: 'task',
    task: 'task',
    reminder: 'reminder',
    goal: 'goal',
    habit: 'habit',
  };
  return typeMapping[frontendType] || 'task';
};

const mapPriorityToSchema = (frontendPriority: any): 'low' | 'medium' | 'high' | 'critical' => {
  // Handle both numeric and string inputs
  if (typeof frontendPriority === 'number') {
    const priorityMapping: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
      1: 'critical',
      2: 'high',
      3: 'medium',
      4: 'low',
      5: 'low',
    };
    return priorityMapping[frontendPriority] || 'medium';
  }

  // Handle string inputs
  const stringMapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  };
  return stringMapping[frontendPriority] || 'medium';
};

const mapCategoryToSchema = (
  frontendCategory: string
): 'personal' | 'work' | 'project' | 'learning' | 'health' => {
  const categoryMapping: Record<string, 'personal' | 'work' | 'project' | 'learning' | 'health'> = {
    general: 'personal',
    personal: 'personal',
    work: 'work',
    project: 'project',
    learning: 'learning',
    health: 'health',
    development: 'work',
    design: 'work',
  };
  return categoryMapping[frontendCategory] || 'personal';
};

// GET todos with MongoDB operations
app.get('/api/todos', async (req, res) => {
  console.log('✅ GET /api/todos called');

  try {
    // クエリパラメータの解析
    const {
      completed,
      priority,
      category,
      type,
      tags,
      sort = 'createdAt',
      order = 'desc',
      limit,
      skip,
    } = req.query;

    // フィルター条件の構築
    const filter: any = {};
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (tags) filter.tags = { $in: (tags as string).split(',') };

    // ソートオプションの構築
    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'asc' ? 1 : -1;

    // データベースからTodoを取得
    let query = TodoModel.find(filter);

    if (Object.keys(sortOptions).length > 0) {
      query = query.sort(sortOptions);
    }

    if (skip) {
      query = query.skip(parseInt(skip as string));
    }

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const todos = await query.exec();
    const totalCount = await TodoModel.countDocuments(filter);

    // 統計情報の生成
    const stats = {
      total: totalCount,
      completed: await TodoModel.countDocuments({ ...filter, completed: true }),
      pending: await TodoModel.countDocuments({ ...filter, completed: false }),
      byCategory: await TodoModel.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      byType: await TodoModel.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    };

    console.log(`📊 Filtered todos count: ${todos.length} (total: ${totalCount})`);
    console.log(`🔍 Applied filters:`, filter);
    console.log(`📈 Stats:`, stats);

    // フロントエンドが期待する形式でTodoデータを変換
    const formattedTodos = todos.map((todo) => ({
      _id: String((todo as any)._id),
      id: String((todo as any)._id),
      task: todo.title || todo.description || '',
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      completedAt: todo.completedAt,
      priority: todo.priority,
      category: todo.category,
      type: todo.type,
      tags: todo.tags,
      dueDate: todo.dueDate,
      estimatedMinutes: todo.estimatedMinutes,
      actualMinutes: todo.actualMinutes,
      userId: todo.userId,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    res.json(formattedTodos);
  } catch (error) {
    console.error('❌ Error in GET /api/todos:', error);
    res.status(500).json({
      error: 'Failed to fetch todos',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Debug endpoint to test connectivity
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  res.json({
    success: true,
    message: 'Debug endpoint working',
    server: 'server-simple.ts',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
  });
});

// POST todos with validation
app.post('/api/todos', async (req, res) => {
  console.log('✅ POST /api/todos called');
  console.log('📝 Request body:', req.body);

  try {
    // バリデーション
    const {
      task,
      title,
      description,
      priority,
      type,
      category,
      tags,
      deadline,
      dueDate,
      estimatedTime,
      estimatedMinutes,
    } = req.body;

    const taskText = task || title || description;
    if (!taskText || taskText.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task title or description is required and cannot be empty',
      });
    }

    // 新しいTODOの作成（フロントエンド値をスキーマ対応値にマッピング）
    const todoData = {
      title: title || taskText.trim(),
      description: description || taskText.trim(),
      priority: mapPriorityToSchema(priority),
      type: mapTypeToSchema(type || 'task'),
      category: mapCategoryToSchema(category || 'personal'),
      tags: Array.isArray(tags) ? tags : [],
      dueDate: dueDate || deadline || undefined,
      estimatedMinutes: estimatedMinutes || (estimatedTime ? parseInt(estimatedTime) : undefined),
      userId: (req as any)?.user?.id,
      completed: false,
      source: 'manual' as const,
      context: [],
      subtodos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📋 Mapped todo data:', {
      originalType: type,
      mappedType: todoData.type,
      originalPriority: priority,
      mappedPriority: todoData.priority,
      originalCategory: category,
      mappedCategory: todoData.category,
    });

    const newTodo = new TodoModel(todoData);
    const savedTodo = await newTodo.save();

    console.log(`📝 Todo created successfully. ID: ${savedTodo._id}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedTodo = {
      _id: String((savedTodo as any)._id),
      id: String((savedTodo as any)._id),
      task: savedTodo.title || savedTodo.description || '',
      title: savedTodo.title,
      description: savedTodo.description,
      completed: savedTodo.completed,
      completedAt: savedTodo.completedAt,
      priority: savedTodo.priority,
      category: savedTodo.category,
      type: savedTodo.type,
      tags: savedTodo.tags,
      dueDate: savedTodo.dueDate,
      estimatedMinutes: savedTodo.estimatedMinutes,
      userId: savedTodo.userId,
      createdAt: savedTodo.createdAt,
      updatedAt: savedTodo.updatedAt,
    };

    res.status(201).json(formattedTodo);
  } catch (error) {
    console.error('❌ Error in POST /api/todos:', error);
    res.status(500).json({
      error: 'Failed to create todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT todos/:id (更新) with enhanced validation
app.put('/api/todos/:id', async (req, res) => {
  console.log('✅ PUT /api/todos/:id called');
  console.log('📝 ID:', req.params.id);
  console.log('📝 Update data:', req.body);

  try {
    const todoId = req.params.id;
    const {
      task,
      title,
      description,
      priority,
      type,
      category,
      tags,
      deadline,
      dueDate,
      completed,
      actualTime,
      estimatedMinutes,
      actualMinutes,
    } = req.body;

    // バリデーション
    const taskText = task || title || description;
    if (taskText !== undefined && (!taskText || taskText.trim().length === 0)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Task cannot be empty',
      });
    }

    // 更新データの準備
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (task !== undefined) {
      updateData.title = task.trim();
      updateData.description = task.trim();
    }
    if (priority !== undefined) updateData.priority = mapPriorityToSchema(priority);
    if (type !== undefined) updateData.type = mapTypeToSchema(type);
    if (category !== undefined) updateData.category = mapCategoryToSchema(category);
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (dueDate !== undefined || deadline !== undefined) updateData.dueDate = dueDate || deadline;
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date().toISOString();
      } else {
        updateData.completedAt = null;
      }
    }
    if (actualMinutes !== undefined || actualTime !== undefined) {
      updateData.actualMinutes = actualMinutes || (actualTime ? parseInt(actualTime) : undefined);
    }
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;

    const updatedTodo = await TodoModel.findByIdAndUpdate(todoId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    console.log(`✅ Todo updated successfully: ${updatedTodo.title}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedTodo = {
      _id: String((updatedTodo as any)._id),
      id: String((updatedTodo as any)._id),
      task: updatedTodo.title || updatedTodo.description || '',
      title: updatedTodo.title,
      description: updatedTodo.description,
      completed: updatedTodo.completed,
      completedAt: updatedTodo.completedAt,
      priority: updatedTodo.priority,
      category: updatedTodo.category,
      type: updatedTodo.type,
      tags: updatedTodo.tags,
      dueDate: updatedTodo.dueDate,
      estimatedMinutes: updatedTodo.estimatedMinutes,
      actualMinutes: updatedTodo.actualMinutes,
      userId: updatedTodo.userId,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    };

    res.json(formattedTodo);
  } catch (error) {
    console.error('❌ Error in PUT /api/todos/:id:', error);
    res.status(500).json({
      error: 'Failed to update todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE todos/:id (削除)
app.delete('/api/todos/:id', async (req, res) => {
  console.log('✅ DELETE /api/todos/:id called');
  console.log('📝 ID:', req.params.id);

  try {
    const todoId = req.params.id;
    const deletedTodo = await TodoModel.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      console.log(`❌ Todo not found with ID: ${todoId}`);
      return res.status(404).json({
        error: 'Todo not found',
        message: `Todo with ID ${todoId} does not exist`,
      });
    }

    console.log(`🗑️ Todo deleted successfully: ${deletedTodo.title}`);

    // フロントエンドが期待する形式でデータを変換
    const formattedDeletedTodo = {
      _id: String((deletedTodo as any)._id),
      id: String((deletedTodo as any)._id),
      task: deletedTodo.title || deletedTodo.description || '',
      title: deletedTodo.title,
      description: deletedTodo.description,
      completed: deletedTodo.completed,
      completedAt: deletedTodo.completedAt,
      priority: deletedTodo.priority,
      category: deletedTodo.category,
      type: deletedTodo.type,
      tags: deletedTodo.tags,
      dueDate: deletedTodo.dueDate,
      estimatedMinutes: deletedTodo.estimatedMinutes,
      actualMinutes: deletedTodo.actualMinutes,
      userId: deletedTodo.userId,
      createdAt: deletedTodo.createdAt,
      updatedAt: deletedTodo.updatedAt,
    };

    res.json({
      success: true,
      message: 'Todo deleted successfully',
      deletedTodo: formattedDeletedTodo,
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/todos/:id:', error);
    res.status(500).json({
      error: 'Failed to delete todo',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST todos/reset - reset all todos
app.post('/api/todos/reset', async (req, res) => {
  console.log('✅ POST /api/todos/reset called');

  try {
    // Delete all todos
    const deleteResult = await TodoModel.deleteMany({});

    console.log(`🗑️ Reset completed: ${deleteResult.deletedCount} todos deleted`);

    res.json({
      success: true,
      message: `すべてのTODOをリセットしました (${deleteResult.deletedCount}件削除)`,
      deletedCount: deleteResult.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in POST /api/todos/reset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset todos',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET todos/history - todo completion history
app.get('/api/todos/history', async (_req, res) => {
  return res.status(501).json({ success: false, message: 'Not implemented' });
});

// GET todos/history/daily - daily history summary
app.get('/api/todos/history/daily', async (_req, res) => {
  return res.status(501).json({ success: false, message: 'Not implemented' });
});

// GET projects
app.get('/api/projects', (_req, res) => {
  return res.status(501).json({ success: false, message: 'Not implemented' });
});

// Temporarily remove 404 handler - will be moved after all routes

// Route debugging - log all registered routes
// Books API - Real database implementation
// GET all books
app.get('/api/books', async (req, res) => {
  console.log('✅ GET /api/books called');
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    console.log(`📚 Found ${books.length} books in database`);
    res.json(books);
  } catch (error) {
    console.error('❌ Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST new book
app.post('/api/books', async (req, res) => {
  console.log('✅ POST /api/books called');
  console.log('📝 Book data:', req.body);
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    console.log(`📚 Book created with ID: ${savedBook._id}`);
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book: savedBook,
    });
  } catch (error) {
    console.error('❌ Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT update book
app.put('/api/books/:id', async (req, res) => {
  console.log('✅ PUT /api/books/:id called');
  console.log('📝 Book ID:', req.params.id);
  console.log('📝 Update data:', req.body);
  try {
    const bookId = req.params.id;
    const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    console.log(`📚 Book updated: ${updatedBook._id}`);
    res.json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('❌ Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE book
app.delete('/api/books/:id', async (req, res) => {
  console.log('✅ DELETE /api/books/:id called');
  console.log('📝 Book ID:', req.params.id);
  try {
    const bookId = req.params.id;
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    console.log(`📚 Book deleted: ${deletedBook._id}`);
    res.json({
      success: true,
      message: 'Book deleted successfully',
      book: deletedBook,
    });
  } catch (error) {
    console.error('❌ Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Analytics API routes
app.post('/api/analytics/track', (req, res) => {
  // In CI or when analytics disabled, return immediately to avoid network noise/hangs
  if (process.env.ANALYTICS_DISABLED === 'true' || !process.env.MONGODB_URI) {
    return res.status(204).end();
  }
  console.log('📊 POST /api/analytics/track called');
  console.log('📝 Analytics event:', req.body);

  try {
    const { event, data, timestamp } = req.body;

    if (!event || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Required fields: event, timestamp',
      });
    }

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log different event types for debugging
    switch (event) {
      case 'session_start':
        console.log(`🎯 Session started: ${data?.sessionId} (User: ${data?.userId})`);
        break;
      case 'session_end':
        console.log(`⏰ Session ended: ${data?.sessionId} (Duration: ${data?.totalTimeSpent}s)`);
        break;
      case 'page_view':
        console.log(`📄 Page view: ${data?.page} (Title: ${data?.title})`);
        break;
      case 'page_view_end':
        console.log(
          `📄 Page view ended: ${data?.page} (Time: ${data?.timeSpent}s, Scroll: ${data?.scrollDepth}%)`
        );
        break;
      case 'interaction':
        console.log(`👆 User interaction: ${data?.type} on ${data?.element}`);
        break;
      case 'user_attributes':
        console.log(`👤 User attributes: ${data?.userId} (Role: ${data?.role})`);
        break;
      default:
        console.log(`❓ Unknown event: ${event}`);
    }

    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'トラッキングイベントが正常に記録されました',
      eventId: eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'トラッキングの記録に失敗しました',
    });
  }
});

// Simple in-memory pageview store (date buckets) and per-path totals
const __pageviewBuckets: Record<string, number> = {};
const __pagePathBuckets: Record<string, number> = {};
const __getDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

// Record pageview (DB-backed)
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    if (process.env.ANALYTICS_DISABLED === 'true' || !process.env.MONGODB_URI) {
      return res.status(204).end();
    }
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const now = new Date();
    const key = __getDateKey(now);
    const {
      path: url,
      title,
      referrer,
      clientId,
      sessionId,
      userId,
      meta,
    } = (req.body as any) || {};

    // Persist to MongoDB
    await AnalyticsEvent.create({
      event: 'page_view',
      timestamp: now,
      userId: typeof userId === 'string' ? userId : undefined,
      sessionId: typeof sessionId === 'string' ? sessionId : undefined,
      clientId:
        typeof clientId === 'string'
          ? clientId
          : (req.headers['x-client-id'] as string | undefined),
      url: typeof url === 'string' ? url : undefined,
      referrer: typeof referrer === 'string' ? referrer : undefined,
      userAgent: (req.headers['user-agent'] as string) || undefined,
      data: {
        title: typeof title === 'string' ? title : undefined,
        ...(typeof meta === 'object' && meta ? meta : {}),
      },
    });

    // Lightweight in-memory counters kept for quick summaries (optional)
    __pageviewBuckets[key] = (__pageviewBuckets[key] || 0) + 1;
    if (typeof url === 'string' && url.length > 0) {
      __pagePathBuckets[url] = (__pagePathBuckets[url] || 0) + 1;
    }

    console.log('📄 Pageview recorded', { key, url, title, referrer });
    return res.json({ success: true });
  } catch (e) {
    console.warn('⚠️ Failed to record pageview:', e);
    return res.status(200).json({ success: true, degraded: true });
  }
});

// Admin pageviews trend (DB-backed)
app.get('/api/admin/metrics/pageviews/trend', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const agg = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => [] as Array<{ _id: string; views: number }>);

    const map = new Map<string, number>();
    for (const r of agg) map.set(String(r._id), Number(r.views || 0));
    const series: Array<{ day: string; views: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({ day: key, views: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { window: days, series } });
  } catch (e) {
    console.error('❌ Error building pageviews trend:', e);
    return res.json({ success: true, data: { window: 7, series: [] }, degraded: true });
  }
});

// Admin top pages
app.get('/api/admin/metrics/top-pages', async (req, res) => {
  try {
    const windowParam = String(req.query.window || '7d');
    const now = new Date();
    const from = new Date(now);
    if (windowParam === '30d') from.setDate(now.getDate() - 30);
    else if (windowParam === '90d') from.setDate(now.getDate() - 90);
    else from.setDate(now.getDate() - 7);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const rows = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 100 },
      { $project: { page: '$_id', views: 1, _id: 0 } },
    ]).catch(() => []);
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('❌ Error building top pages:', e);
    return res.json({ success: true, data: [] });
  }
});

// Admin users trend (DB-backed)
app.get('/api/admin/metrics/users/trend', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const windowParam = String(req.query.window || '7d');
    const days = windowParam === '30d' ? 30 : windowParam === '90d' ? 90 : 7;
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const dailyActive = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          users: { $addToSet: '$clientId' },
        },
      },
      { $project: { day: '$_id.day', activeUsers: { $size: '$users' }, _id: 0 } },
      { $sort: { day: 1 } },
    ]).catch(() => [] as Array<{ day: string; activeUsers: number }>);

    const registrations = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      { $group: { _id: '$clientId', firstSeen: { $min: '$timestamp' } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } } } },
      { $group: { _id: '$day', newUsers: { $sum: 1 } } },
      { $project: { day: '$_id', newUsers: 1, _id: 0 } },
      { $sort: { day: 1 } },
    ]).catch(() => [] as Array<{ day: string; newUsers: number }>);

    const activeMap = new Map<string, number>(
      dailyActive.map((r: any) => [String(r.day), Number(r.activeUsers || 0)] as const)
    );
    const newMap = new Map<string, number>(
      registrations.map((r: any) => [String(r.day), Number(r.newUsers || 0)] as const)
    );
    const series: Array<{ day: string; newUsers: number; activeUsers: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({
        day: key,
        newUsers: newMap.get(key) || 0,
        activeUsers: activeMap.get(key) || 0,
      });
    }
    return res.json({ success: true, data: { window: days, series } });
  } catch (e) {
    console.error('❌ Error building users trend:', e);
    return res.json({ success: true, data: { window: 7, series: [] } });
  }
});

// Admin revenue trend (DB-backed from payments)
app.get('/api/admin/metrics/revenue/trend', async (req, res) => {
  try {
    const { Payment } = await import('./models/Subscription.js');
    const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [{ paidAt: { $exists: true } }, { createdAt: { $exists: true } }],
        },
      },
      {
        $addFields: {
          paidDate: {
            $cond: [{ $ifNull: ['$paidAt', false] }, { $toDate: '$paidAt' }, '$createdAt'],
          },
        },
      },
      { $match: { paidDate: { $gte: start, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
          amount: { $sum: { $ifNull: ['$amountReceived', '$amount'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => [] as Array<{ _id: string; amount: number }>);

    const map = new Map<string, number>();
    for (const r of rows) map.set(r._id, Number(r.amount || 0));
    const series: Array<{ month: string; amount: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      series.push({ month: key, amount: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { months, series } });
  } catch (e) {
    console.error('❌ Error building revenue trend:', e);
    return res.json({ success: true, data: { months: 6, series: [] } });
  }
});

// Admin paid users trend (DB-backed from successful payments)
app.get('/api/admin/metrics/paid-users/trend', async (req, res) => {
  try {
    const { Payment } = await import('./models/Subscription.js');
    const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $addFields: {
          paidDate: {
            $cond: [{ $ifNull: ['$paidAt', false] }, { $toDate: '$paidAt' }, '$createdAt'],
          },
        },
      },
      { $match: { paidDate: { $gte: start, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
          users: { $addToSet: '$userId' },
        },
      },
      { $project: { month: '$_id', count: { $size: '$users' }, _id: 0 } },
      { $sort: { month: 1 } },
    ]).catch(() => [] as Array<{ month: string; count: number }>);

    const map = new Map<string, number>(
      rows.map((r: any) => [String(r.month), Number(r.count || 0)] as const)
    );
    const series: Array<{ month: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      series.push({ month: key, count: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { months, series } });
  } catch (e) {
    console.error('❌ Error building paid-users trend:', e);
    return res.json({ success: true, data: { months: 6, series: [] } });
  }
});

// Admin revenue summary (dev mock)
app.get('/api/admin/metrics/revenue/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const { Subscription: SubscriptionModel, Payment: PaymentModel } = await import(
      './models/Subscription.js'
    );
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    // Active paid subscriptions
    const activePaid = await SubscriptionModel.countDocuments({
      status: { $in: ['active'] },
      planType: { $ne: 'free' },
    }).catch(() => 0);

    // MRR = active monthly sums + active yearly sums / 12
    const [monthlyAgg, yearlyAgg] = await Promise.all([
      SubscriptionModel.aggregate([
        { $match: { status: 'active', planType: { $ne: 'free' }, billingCycle: 'monthly' } },
        { $group: { _id: null, sum: { $sum: { $ifNull: ['$amount', 0] } } } },
      ]).catch(() => [] as Array<{ sum: number }>),
      SubscriptionModel.aggregate([
        { $match: { status: 'active', planType: { $ne: 'free' }, billingCycle: 'yearly' } },
        { $group: { _id: null, sum: { $sum: { $ifNull: ['$amount', 0] } } } },
      ]).catch(() => [] as Array<{ sum: number }>),
    ]);
    const monthlySum = Number((monthlyAgg?.[0] as any)?.sum || 0);
    const yearlySum = Number((yearlyAgg?.[0] as any)?.sum || 0);
    const mrr = Math.round(monthlySum + yearlySum / 12);

    // Prev MRR (previous month end snapshot approximation): use payments succeeded in prev month as proxy
    const prevPayments = await PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [
            {
              paidAt: { $gte: startOfPrevMonth.toISOString(), $lte: endOfPrevMonth.toISOString() },
            },
            { createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } },
          ],
        },
      },
      { $group: { _id: null, sum: { $sum: { $ifNull: ['$amountReceived', '$amount'] } } } },
    ]).catch(() => [] as Array<{ sum: number }>);
    const prevMrr = Math.round(Number((prevPayments?.[0] as any)?.sum || 0));

    const arr = mrr * 12;

    // New paid users this month = succeeded payments in this month (unique userIds)
    const newPaidUsersAgg = await PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          $or: [
            { paidAt: { $gte: startOfMonth.toISOString() } },
            { createdAt: { $gte: startOfMonth } },
          ],
        },
      },
      { $group: { _id: '$userId' } },
      { $count: 'count' },
    ]).catch(() => [] as Array<{ count: number }>);
    const newPaidThisMonth = Number((newPaidUsersAgg?.[0] as any)?.count || 0);

    // Churn rate approximation: cancellations in month / (active at start of month + cancellations)
    const cancellationsThisMonth = await SubscriptionModel.countDocuments({
      cancelledAt: { $gte: startOfMonth.toISOString() },
    }).catch(() => 0);
    const churnRate = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (cancellationsThisMonth / Math.max(activePaid + cancellationsThisMonth, 1)) * 100
        )
      )
    );

    // Conversion rate approximation: new paid / new registrations in month (from AnalyticsEvent)
    const newRegs = await AnalyticsEvent.countDocuments({
      event: 'register',
      timestamp: { $gte: startOfMonth, $lte: now },
    }).catch(() => 0);
    const conversionRate = newRegs > 0 ? Math.round((newPaidThisMonth / newRegs) * 100) : 0;

    return res.json({
      success: true,
      data: { mrr, arr, churnRate, conversionRate, activePaid, newPaidThisMonth, prevMrr },
    });
  } catch (e) {
    console.error('❌ Error building revenue summary:', e);
    return res.json({
      success: true,
      data: {
        mrr: 0,
        arr: 0,
        churnRate: 0,
        conversionRate: 0,
        activePaid: 0,
        newPaidThisMonth: 0,
        prevMrr: 0,
      },
      degraded: true,
    });
  }
});

app.get('/api/analytics/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/analytics/summary called');
    const range = String(req.query.range || '7d');
    const now = new Date();
    const from = new Date(now);
    if (range === '24h') from.setDate(now.getDate() - 1);
    else if (range === '7d') from.setDate(now.getDate() - 7);
    else from.setDate(now.getDate() - 30);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    // Distinct users
    const totalUsers = await AnalyticsEvent.distinct('userId')
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);
    const activeUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: from, $lte: now },
    })
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);

    // New users and page views in window
    const [newUsers, pageViewsTotal] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: from, $lte: now },
        event: 'register',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: from, $lte: now },
        event: 'page_view',
      }).catch(() => 0),
    ]);

    // Top pages
    const topPages = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view' } },
      { $group: { _id: '$url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { page: '$_id', views: 1, _id: 0 } },
    ]).catch(() => []);

    // Average session duration from page_view_end
    const sessionAgg = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now }, event: 'page_view_end' } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ['$data.timeSpent', 0] } } } },
    ]).catch(() => [] as Array<{ avg: number }>);
    const averageSessionDuration = Math.round((sessionAgg?.[0] as any)?.avg || 0);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers: Math.max(activeUsers - newUsers, 0),
        averageSessionDuration,
        pageViewsTotal,
        topPages,
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/analytics/summary:', e);
    return res.status(200).json({ success: true, data: {}, degraded: true });
  }
});

// CI status mirror for local dev (matches serverless shape)
app.get('/api/status/ci', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
    // Minimal placeholder with links to repo/actions and vercel project to avoid external token usage locally
    const github = Array.from({ length: limit }).map((_, i) => ({
      id: Date.now() - i,
      name: 'workflow',
      status: 'completed',
      conclusion: i % 3 === 0 ? 'failure' : 'success',
      html_url: 'https://github.com/umezawakanta/work-time-tracker/actions',
      created_at: new Date(Date.now() - i * 3600_000).toISOString(),
    }));
    const vercel = Array.from({ length: limit }).map((_, i) => ({
      uid: `dpl_${Date.now() - i}`,
      url: 'work-time-tracker-five.vercel.app',
      state: i % 4 === 0 ? 'ERROR' : 'READY',
      createdAt: Date.now() - i * 3600_000,
      commit: { sha: undefined, message: undefined },
    }));
    return res.json({
      success: true,
      data: { github, vercel },
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.json({ success: false, error: e instanceof Error ? e.message : 'failed' });
  }
});

// Server-Sent Events for realtime analytics
app.get('/api/analytics/events', (req, res) => {
  console.log('📡 GET /api/analytics/events (SSE) connected');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    const payload = {
      type: 'analytics_update',
      data: {
        activeUsers: Math.floor(Math.random() * 40) + 5,
        completionRate: Math.floor(Math.random() * 30) + 60,
        todaysTasks: Math.floor(Math.random() * 15) + 3,
        weeklyTrend: Math.floor(Math.random() * 20) - 10,
      },
      ts: Date.now(),
    };
    send('message', payload);
  }, 5000);

  req.on('close', () => {
    console.log('📡 /api/analytics/events disconnected');
    clearInterval(interval);
    res.end();
  });
});

// Notifications SSE (health + stream) used by Error Dashboard
app.get('/api/notifications/health', (_req, res) => {
  res.json({ success: true, sse: true });
});

app.get('/api/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send('heartbeat', { t: Date.now() });
  const interval = setInterval(() => send('heartbeat', { t: Date.now() }), 10000);
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// Live metrics (DB-backed)
app.get('/api/analytics/live-metrics', async (req, res) => {
  console.log('📊 GET /api/analytics/live-metrics called');
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since1h = new Date(Date.now() - 60 * 60 * 1000);

    // Active users (last 15 minutes)
    const since15m = new Date(Date.now() - 15 * 60 * 1000);
    const activeDistinct = await AnalyticsEvent.distinct('clientId', {
      timestamp: { $gte: since15m },
      event: { $in: ['page_view', 'page_view_end', 'task_completed', 'ai_assistant_reply'] },
    }).catch(() => [] as string[]);
    const activeUsers = (activeDistinct || []).filter(Boolean).length;

    // Completion rate approximation from task events in last 24h
    const [completedTasks, createdTasks] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: since24h },
        event: 'task_completed',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: since24h }, event: 'task_created' }).catch(
        () => 0
      ),
    ]);
    const completionRate = Math.max(
      0,
      Math.min(100, createdTasks ? Math.round((completedTasks / createdTasks) * 100) : 0)
    );

    // Average task time approximation from events (fallback to 0 if missing)
    const avgTaskTime = 0;

    // Today's tasks from midnight
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysTasks = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: startOfDay },
      event: 'task_completed',
    }).catch(() => 0);

    // Weekly trend based on last 7 days tasks vs prior 7 days
    const start7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const prevStart7d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [last7, prev7] = await Promise.all([
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: start7d },
        event: 'task_completed',
      }).catch(() => 0),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: prevStart7d, $lt: start7d },
        event: 'task_completed',
      }).catch(() => 0),
    ]);
    const weeklyTrend = prev7 ? Math.round(((last7 - prev7) / Math.max(prev7, 1)) * 100) : 0;

    // Hourly activity in last 24h
    const hourlyAgg = await AnalyticsEvent.aggregate([
      {
        $match: { timestamp: { $gte: since24h }, event: { $in: ['task_completed', 'page_view'] } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%H:00', date: '$timestamp', timezone: 'Asia/Tokyo' } },
          tasks: {
            $sum: {
              $cond: [{ $eq: ['$event', 'task_completed'] }, 1, 0],
            },
          },
          users: { $addToSet: '$clientId' },
        },
      },
      { $project: { hour: '$_id', tasks: 1, users: { $size: '$users' }, _id: 0 } },
      { $sort: { hour: 1 } },
    ]).catch(() => [] as Array<{ hour: string; tasks: number; users: number }>);

    const data = {
      activeUsers,
      completionRate,
      avgTaskTime,
      todaysTasks,
      weeklyTrend,
      hourlyActivity: hourlyAgg,
    };
    return res.json({ success: true, data });
  } catch (e) {
    console.error('❌ Error in /api/analytics/live-metrics:', e);
    return res.status(200).json({
      success: true,
      data: {
        activeUsers: 0,
        completionRate: 0,
        avgTaskTime: 0,
        todaysTasks: 0,
        weeklyTrend: 0,
        hourlyActivity: [],
      },
      degraded: true,
    });
  }
});

// ===== Additional analytics endpoints for AdminDashboard =====
// Daily pageviews series
app.get('/api/analytics/pageviews/daily', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const daysParam = Number(req.query.days || 7);
    const days = Math.max(1, Math.min(90, Number.isFinite(daysParam) ? daysParam : 7));
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));

    const agg = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const map = new Map<string, number>();
    for (const r of agg) map.set(String(r._id), Number(r.views || 0));
    const series: Array<{ day: string; views: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = __getDateKey(d);
      series.push({ day: key, views: map.get(key) || 0 });
    }
    return res.json({ success: true, data: { days, series } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/pageviews/daily:', e);
    return res.json({ success: true, data: { days: 7, series: [] }, degraded: true });
  }
});

// Active users in the last N hours (simplified)
app.get('/api/analytics/users/active', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const hoursParam = Number(req.query.hours || 24);
    const hours = Math.max(1, Math.min(72, Number.isFinite(hoursParam) ? hoursParam : 24));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const distinct = await AnalyticsEvent.distinct('clientId', {
      timestamp: { $gte: since },
      event: { $in: ['page_view', 'page_view_end', 'ai_assistant_reply', 'assessment_saved'] },
    });
    const activeUsers = (distinct || []).filter(Boolean).length;
    return res.json({ success: true, data: { hours, activeUsers } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/users/active:', e);
    return res.json({ success: true, data: { hours: 24, activeUsers: 0 }, degraded: true });
  }
});

// 30d retention cohorts (simplified)
app.get('/api/analytics/retention/30d', async (req, res) => {
  try {
    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 29);

    const registrations = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      { $group: { _id: '$clientId', firstSeen: { $min: '$timestamp' } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } } } },
      { $group: { _id: '$day', size: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const d1 = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: now } } },
      {
        $group: {
          _id: '$clientId',
          days: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
        },
      },
      { $project: { days: 1 } },
    ]);
    const dailyMap = new Map<string, number>();
    for (const r of registrations) dailyMap.set(String(r._id), Number(r.size || 0));
    const allDays: string[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    const retainedMap = new Map<string, number>(allDays.map((d) => [d, 0]));
    for (const row of d1) {
      const set = new Set<string>((row?.days as string[]) || []);
      for (const day of allDays) {
        const next = new Date(day + 'T00:00:00Z');
        next.setDate(next.getDate() + 1);
        const nextKey = next.toISOString().slice(0, 10);
        if (set.has(day) && set.has(nextKey)) {
          retainedMap.set(day, (retainedMap.get(day) || 0) + 1);
        }
      }
    }
    const cohorts = allDays.map((day) => ({
      date: day,
      size: dailyMap.get(day) || 0,
      days: [0, retainedMap.get(day) || 0],
    }));
    return res.json({ success: true, data: { cohorts } });
  } catch (e) {
    console.error('❌ Error in /api/analytics/retention/30d:', e);
    return res.json({ success: true, data: { cohorts: [] }, degraded: true });
  }
});

// Recent error reports
app.get('/api/admin/error-reports', async (req, res) => {
  try {
    const limitParam = Number(req.query.limit || 10);
    const limit = Math.max(1, Math.min(200, Number.isFinite(limitParam) ? limitParam : 10));
    try {
      // Prefer shared serverless store if available
      const { listErrorReports } = await import('../../api/_lib/errorStore');
      const rows = await listErrorReports(limit);
      return res.json({ success: true, data: rows });
    } catch {}

    const { default: mongoose } = await import('mongoose');
    const rows = await (mongoose.connection.db as any)
      .collection('error_reports')
      .find({}, { sort: { createdAt: -1 } as any })
      .limit(limit)
      .toArray();
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('❌ Error in /api/admin/error-reports:', e);
    return res.json({ success: true, data: [], degraded: true });
  }
});

// Admin analytics summary (DB-backed)
app.get('/api/admin/analytics/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/admin/analytics/summary called');
    const range = String(req.query.range || '7d');
    const now = new Date();
    const from = new Date(now);
    if (range === '24h') from.setDate(now.getDate() - 1);
    else if (range === '7d') from.setDate(now.getDate() - 7);
    else from.setDate(now.getDate() - 30);

    const { AnalyticsEvent } = await import('./models/AnalyticsEvent.js');

    const match = { timestamp: { $gte: from, $lte: now } } as any;

    const totalUsers = await AnalyticsEvent.distinct('userId')
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);
    const activeUsers = await AnalyticsEvent.distinct('userId', match)
      .then((a: unknown[]) => a.filter(Boolean).length)
      .catch(() => 0);

    const [newUsers, pageViewsTotal] = await Promise.all([
      AnalyticsEvent.countDocuments({ ...match, event: 'register' }).catch(() => 0),
      AnalyticsEvent.countDocuments({ ...match, event: 'page_view' }).catch(() => 0),
    ]);

    const sessionAgg = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view_end' } },
      { $group: { _id: null, avg: { $avg: { $ifNull: ['$data.timeSpent', 0] } } } },
    ]).catch(() => [] as Array<{ avg: number }>);
    const averageSessionDuration = Math.round((sessionAgg?.[0] as any)?.avg || 0);

    const topReferrers = await AnalyticsEvent.aggregate([
      { $match: { ...match, event: 'page_view', referrer: { $ne: null } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { referrer: '$_id', count: 1, _id: 0 } },
    ]).catch(() => []);

    // Simple day-over-day compare by event count
    const todayKey = now.toISOString().slice(0, 10);
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const yKey = y.toISOString().slice(0, 10);
    const dailyCounts = await AnalyticsEvent.aggregate([
      { $match: { event: 'page_view', timestamp: { $gte: new Date(yKey), $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          c: { $sum: 1 },
        },
      },
    ]).catch(() => [] as Array<{ _id: string; c: number }>);
    const map = new Map<string, number>(
      (dailyCounts as Array<{ _id: string; c: number }>).map((d) => [
        String(d._id),
        Number(d.c || 0),
      ])
    );
    const today: number = Number(map.get(todayKey) || 0);
    const yesterday: number = Number(map.get(yKey) || 0);
    const diff = today - yesterday;
    const pct = yesterday > 0 ? Math.round((diff / yesterday) * 100) : 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers: Math.max(activeUsers - newUsers, 0),
        averageSessionDuration,
        pageViewsTotal,
        topReferrers,
        compare: { today, yesterday, diff, pct },
        generatedAt: new Date().toISOString(),
        range,
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/analytics/summary:', e);
    return res.status(200).json({ success: true, data: {}, degraded: true });
  }
});

// =============================
// Admin metrics (DB-backed summary for total users)
// =============================
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const now = new Date();
    const total = await User.countDocuments({}).catch(() => 0);
    const active = await User.countDocuments({ status: 'active' }).catch(() => 0);
    const newUsers24h = await User.countDocuments({
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    }).catch(() => 0);

    return res.json({
      success: true,
      data: {
        metrics: {
          users: {
            total,
            active,
            new: newUsers24h,
          },
          revenue: {
            mrr: 0,
            arr: 0,
            conversionRate: 0,
          },
          system: {
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            activeConnections: 0,
          },
          support: {
            openTickets: 0,
            avgResponseTime: '0h',
            satisfaction: 0,
          },
        },
        priorityActions: [],
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/metrics:', e);
    return res.json({
      success: true,
      data: { metrics: { users: { total: 0, active: 0, new: 0 } } },
      degraded: true,
    });
  }
});

// =============================
// Admin live metrics (real-time data)
// =============================
app.get('/api/admin/live-metrics', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const { TodoModel } = await import('./models/Todo.js');

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Active users (last 24 hours)
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: last24h },
    }).catch(() => 0);

    // Today's tasks
    const todaysTasks = await TodoModel.countDocuments({
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    }).catch(() => 0);

    // Completion rate (last 7 days)
    const completedTasks = await TodoModel.countDocuments({
      completed: true,
      updatedAt: { $gte: last7d },
    }).catch(() => 0);

    const totalTasks = await TodoModel.countDocuments({
      createdAt: { $gte: last7d },
    }).catch(() => 0);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Weekly trend (tasks this week vs last week)
    const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekTasks = await TodoModel.countDocuments({
      createdAt: { $gte: thisWeekStart },
    }).catch(() => 0);

    const lastWeekTasks = await TodoModel.countDocuments({
      createdAt: { $gte: lastWeekStart, $lt: thisWeekStart },
    }).catch(() => 0);

    const weeklyTrend =
      lastWeekTasks > 0 ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100) : 0;

    // Average task time (mock data for now)
    const avgTaskTime = 25; // minutes

    // Hourly activity (last 24 hours)
    const hourlyActivity: { hour: string; tasks: number; users: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourTasks = await TodoModel.countDocuments({
        createdAt: { $gte: hourStart, $lt: hourEnd },
      }).catch(() => 0);

      const hourUsers = await User.countDocuments({
        lastLoginAt: { $gte: hourStart, $lt: hourEnd },
      }).catch(() => 0);

      hourlyActivity.push({
        hour: hourStart.getHours().toString().padStart(2, '0') + ':00',
        tasks: hourTasks,
        users: hourUsers,
      });
    }

    return res.json({
      success: true,
      data: {
        activeUsers,
        completionRate,
        avgTaskTime,
        todaysTasks,
        weeklyTrend,
        hourlyActivity,
      },
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/live-metrics:', e);
    return res.json({
      success: true,
      data: {
        activeUsers: 0,
        completionRate: 0,
        avgTaskTime: 0,
        todaysTasks: 0,
        weeklyTrend: 0,
        hourlyActivity: [],
      },
    });
  }
});

// =============================
// Admin features (feature list management)
// =============================
app.get('/api/admin/features', async (req, res) => {
  try {
    // Import the features registry
    const featuresModule = await import('../../src/config/features.js');
    const featuresRegistry = featuresModule.featuresRegistry;

    // Calculate completion rates and other metrics
    const adminFeatures = featuresRegistry.map((feature: any) => {
      const statusOrder = [
        'planning',
        'designing',
        'developing',
        'unit_testing',
        'integration_testing',
        'system_testing',
        'documenting',
        'review',
        'release_pending',
        'complete',
      ];
      const currentIndex = statusOrder.indexOf(feature.status);
      const completionRate =
        currentIndex >= 0 ? Math.round((currentIndex / (statusOrder.length - 1)) * 100) : 0;

      // Release status calculation
      const today = new Date();
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      let releaseStatus = 'normal';
      if (feature.targetRelease) {
        const releaseDate = new Date(feature.targetRelease);
        if (releaseDate < today && feature.status !== 'complete') {
          releaseStatus = 'overdue';
        } else if (
          releaseDate >= today &&
          releaseDate <= oneWeekFromNow &&
          feature.status !== 'complete'
        ) {
          releaseStatus = 'thisWeek';
        }
      }

      return {
        id: feature.id,
        name: feature.name,
        path: feature.path,
        category: feature.category,
        description: feature.description,
        status: feature.status,
        requiresRealAPI: feature.requiresRealAPI || false,
        priority: feature.priority || 'P3',
        disabled: feature.disabled || false,
        targetRelease: feature.targetRelease,
        createdAt: feature.createdAt || new Date().toISOString(),
        updatedAt: feature.updatedAt || new Date().toISOString(),
        completionRate,
        dependencies: feature.dependencies || [],
        blockers: feature.blockers || [],
        assignee: feature.assignee || 'unassigned',
        estimatedHours: feature.estimatedHours || 0,
        actualHours: feature.actualHours || 0,
        lastActivity: feature.lastActivity || new Date().toISOString(),
        testCoverage: feature.testCoverage || 0,
        documentationStatus: feature.documentationStatus || 'none',
        deploymentStatus: feature.deploymentStatus || 'not_deployed',
        userFeedback: feature.userFeedback || {
          rating: 0,
          count: 0,
          lastUpdated: new Date().toISOString(),
        },
        releaseStatus,
      };
    });

    // Calculate summary statistics
    const summary = {
      total: adminFeatures.length,
      byStatus: adminFeatures.reduce((acc: any, feature: any) => {
        acc[feature.status] = (acc[feature.status] || 0) + 1;
        return acc;
      }, {}),
      byCategory: adminFeatures.reduce((acc: any, feature: any) => {
        acc[feature.category] = (acc[feature.category] || 0) + 1;
        return acc;
      }, {}),
      byPriority: adminFeatures.reduce((acc: any, feature: any) => {
        acc[feature.priority] = (acc[feature.priority] || 0) + 1;
        return acc;
      }, {}),
      completionRate: Math.round(
        adminFeatures.reduce((sum: number, feature: any) => sum + feature.completionRate, 0) /
          adminFeatures.length
      ),
      overdueCount: adminFeatures.filter((feature: any) => {
        if (!feature.targetRelease) return false;
        const releaseDate = new Date(feature.targetRelease);
        return releaseDate < new Date() && feature.status !== 'complete';
      }).length,
      thisWeekCount: adminFeatures.filter((feature: any) => {
        if (!feature.targetRelease) return false;
        const releaseDate = new Date(feature.targetRelease);
        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return (
          releaseDate >= new Date() &&
          releaseDate <= oneWeekFromNow &&
          feature.status !== 'complete'
        );
      }).length,
    };

    return res.json({
      success: true,
      features: adminFeatures,
      summary,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/features:', e);
    return res.json({
      success: false,
      message: 'Internal Server Error',
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
});

// =============================
// Admin analytics (real-time analytics data)
// =============================
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { range = '7d' } = req.query as { range?: string };

    // MongoDB接続
    const { default: mongoose } = await import('mongoose');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/workTimeTracker'
      );
    }

    // 時間範囲の計算
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // ユーザー統計
    const { User } = await import('./models/User.js');
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: startDate },
    });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });
    const returningUsers = activeUsers - newUsers;

    // タスク統計
    let Todo;
    try {
      Todo = mongoose.model('Todo');
    } catch (error) {
      Todo = mongoose.model(
        'Todo',
        new mongoose.Schema({
          userId: { type: String, required: true },
          title: { type: String, required: true },
          completed: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        })
      );
    }

    const totalTasks = await Todo.countDocuments({});
    const completedTasks = await Todo.countDocuments({ completed: true });
    const tasksInRange = await Todo.countDocuments({
      createdAt: { $gte: startDate },
    });
    const completedTasksInRange = await Todo.countDocuments({
      completed: true,
      updatedAt: { $gte: startDate },
    });

    // セッション統計（簡易実装）
    const averageSessionDuration = 240;

    // ページビュー統計（簡易実装）
    const pageViewsTotal = Math.floor(totalUsers * 6);

    // トップページ（簡易実装）
    const topPages = [
      { page: '/', views: Math.floor(pageViewsTotal * 0.3) },
      { page: '/tasks', views: Math.floor(pageViewsTotal * 0.2) },
      { page: '/subscription', views: Math.floor(pageViewsTotal * 0.1) },
      { page: '/admin', views: Math.floor(pageViewsTotal * 0.05) },
    ];

    // デバイス統計（簡易実装）
    const deviceStats = {
      desktop: Math.floor(activeUsers * 0.6),
      mobile: Math.floor(activeUsers * 0.35),
      tablet: Math.floor(activeUsers * 0.05),
    };

    // 地域統計（簡易実装）
    const regionStats = {
      JP: Math.floor(activeUsers * 0.8),
      US: Math.floor(activeUsers * 0.1),
      Other: Math.floor(activeUsers * 0.1),
    };

    // 時間別アクティビティ（過去24時間）
    const hourlyActivity: { hour: string; tasks: number; users: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hour);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hour);
      hourEnd.setMinutes(59, 59, 999);

      const hourTasks = await Todo.countDocuments({
        createdAt: { $gte: hourStart, $lte: hourEnd },
      });

      const hourUsers = await User.countDocuments({
        lastLoginAt: { $gte: hourStart, $lte: hourEnd },
      });

      hourlyActivity.unshift({
        hour: hourStart.getHours().toString().padStart(2, '0') + ':00',
        tasks: hourTasks,
        users: hourUsers,
      });
    }

    // リテンション分析（簡易実装）
    const retentionData: Array<{ startDate: string; size: number; d1Rate: number }> = [];
    for (let i = 0; i < 7; i++) {
      const cohortDate = new Date(now.getTime() - (i + 7) * 24 * 60 * 60 * 1000);
      const cohortStart = new Date(cohortDate);
      cohortStart.setHours(0, 0, 0, 0);
      const cohortEnd = new Date(cohortDate);
      cohortEnd.setHours(23, 59, 59, 999);

      const cohortSize = await User.countDocuments({
        createdAt: { $gte: cohortStart, $lte: cohortEnd },
      });

      const d1Returned = await User.countDocuments({
        createdAt: { $gte: cohortStart, $lte: cohortEnd },
        lastLoginAt: { $gte: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000) },
      });

      const d1Rate = cohortSize > 0 ? (d1Returned / cohortSize) * 100 : 0;

      retentionData.push({
        startDate: cohortStart.toISOString().split('T')[0],
        size: cohortSize,
        d1Rate: Math.round(d1Rate * 100) / 100,
      });
    }

    const analyticsData = {
      totalUsers,
      activeUsers,
      newUsers,
      returningUsers,
      averageSessionDuration,
      pageViewsTotal,
      topPages,
      deviceStats,
      regionStats,
      // Map to expected component fields
      deviceBreakdown: {
        desktop: deviceStats.desktop,
        mobile: deviceStats.mobile,
        tablet: deviceStats.tablet,
      },
      trafficSources: {
        direct: Math.floor(activeUsers * 0.4),
        search: Math.floor(activeUsers * 0.3),
        social: Math.floor(activeUsers * 0.2),
        referral: Math.floor(activeUsers * 0.1),
      },
      hourlyActivity,
      retentionData,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        inRange: tasksInRange,
        completedInRange: completedTasksInRange,
      },
      generatedAt: new Date().toISOString(),
      range,
    };

    console.log('✅ Admin analytics route registered: /api/admin/analytics');
    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/analytics:', e);
    res.json({
      success: false,
      message: 'Internal Server Error',
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const search = String((req.query.search || (req.query as any).q || '') as string).trim();
    const role = String(req.query.role || '').trim();
    const status = String(req.query.status || '').trim();

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter).catch(() => 0);
    const rows = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('uid email displayName username role status createdAt lastLoginAt')
      .lean()
      .catch(() => [] as any[]);

    const users = rows.map((u: any) => ({
      _id: String(u._id || u.uid || ''),
      email: String(u.email || ''),
      name: String(u.displayName || u.username || ''),
      role: (u.role as string) || 'user',
      roles: [(u.role as string) || 'user'],
      isActive: String(u.status || 'inactive') === 'active',
      blocked: String(u.status || '') === 'suspended',
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date(0).toISOString(),
    }));

    return res.json({
      success: true,
      data: users,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) {
    console.error('❌ Error in /api/admin/users:', e);
    return res.json({
      success: true,
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      degraded: true,
    });
  }
});

// Delete user (mock/dev implementation)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { User } = await import('./models/User.js');
    const id = String(req.params.id);
    // Try to delete; in mock/dev, if not found, still respond success for idempotency
    await User.deleteOne({ $or: [{ _id: id }, { uid: id }] }).catch(() => null);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('❌ Error in DELETE /api/admin/users/:id', e);
    // Respond 200 to avoid blocking UI when running without full backend
    return res.status(200).json({ success: true, degraded: true });
  }
});

// Anthropic AI proxy endpoint
app.post('/api/ai/anthropic', async (req, res) => {
  console.log('🤖 POST /api/ai/anthropic called');

  // Check for API key
  if (!ANTHROPIC_API_KEY) {
    console.log('❌ Anthropic API key not configured');
    return res.status(500).json({
      error: 'Anthropic API key not configured',
      code: 'NOT_CONFIGURED',
    });
  }

  try {
    const body = req.body;

    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required',
        code: 'INVALID_REQUEST',
      });
    }

    console.log(`📤 Proxying request to Anthropic API (${body.messages.length} messages)`);

    // Forward request to Anthropic API
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-3-5-sonnet-20241022',
        max_tokens: body.max_tokens || 8192,
        temperature: body.temperature || 0.7,
        top_p: body.top_p || 0.95,
        messages: body.messages,
        system: body.system,
      }),
    });

    // Handle Anthropic API errors
    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json().catch(() => ({}));

      if (anthropicResponse.status === 429) {
        console.log('⚠️ Anthropic rate limit exceeded');
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
          retryAfter: anthropicResponse.headers.get('retry-after'),
        });
      } else if (anthropicResponse.status === 401) {
        console.log('❌ Invalid Anthropic API key');
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      } else if (anthropicResponse.status === 400) {
        console.log('❌ Bad request to Anthropic API');
        return res.status(400).json({
          error: errorData.error?.message || 'Bad request',
          code: 'BAD_REQUEST',
        });
      } else {
        console.log(`❌ Anthropic API error: ${anthropicResponse.status}`);
        return res.status(anthropicResponse.status).json({
          error: `API request failed: ${anthropicResponse.statusText}`,
          code: 'API_ERROR',
        });
      }
    }

    // Return successful response
    const data = await anthropicResponse.json();
    console.log('✅ Anthropic API response received successfully');
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Anthropic API proxy error:', error);

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check for AI API
app.get('/api/ai/health', (_req, res) => {
  res.json({
    status: 'OK',
    hasApiKey: !!ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// =============================
// General Subscriptions (In-memory)
// Matches frontend subscriptionApi.ts expectations
// =============================
type UIPaymentMethod =
  | 'credit'
  | 'bank'
  | 'paypal'
  | 'apple'
  | 'google'
  | { type: 'credit' | 'bank' | 'paypal' | 'apple' | 'google'; isDefault?: boolean };

type UISubscription = {
  _id: string;
  name: string;
  billingDate: string | number;
  type: string;
  amount: number;
  paymentMethod?: UIPaymentMethod;
  bankAccount?: string;
  isActive: boolean;
  expiresAt?: string;
  checkedMonths?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const __uiSubscriptions: Map<string, UISubscription> = new Map();
const createUiSubId = () => 'usub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

const toMonthKey = (billingDate: string | number): string | null => {
  try {
    const s = String(billingDate);
    if (s.includes('/')) {
      const parts = s.split('/');
      // Expect YYYY/MM[/DD]
      if (parts.length >= 2) return `${parts[0]}/${parts[1].padStart(2, '0')}`;
      return null;
    }
    // Possibly YYYYMMDD or YYYYMM
    if (s.length >= 6) return `${s.slice(0, 4)}/${s.slice(4, 6)}`;
    return null;
  } catch {
    return null;
  }
};

app.get('/api/subscription', (_req, res) => {
  const rows = Array.from(__uiSubscriptions.values()).sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
  res.json(rows);
});

app.post('/api/subscription', (req, res) => {
  try {
    const body = (req.body || {}) as Partial<UISubscription>;
    if (!body.name || body.amount == null) {
      return res.status(400).json({ success: false, message: 'name と amount は必須です' });
    }
    const id = createUiSubId();
    const now = new Date().toISOString();
    const doc: UISubscription = {
      _id: id,
      name: String(body.name),
      billingDate: body.billingDate ?? '1970/01/01',
      type: String(body.type || 'その他'),
      amount: Number(body.amount) || 0,
      paymentMethod: body.paymentMethod ?? { type: 'credit', isDefault: true },
      bankAccount: body.bankAccount,
      isActive: Boolean(body.isActive ?? true),
      expiresAt: body.expiresAt ?? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      checkedMonths: Array.isArray(body.checkedMonths) ? body.checkedMonths.map(String) : [],
      createdAt: now,
      updatedAt: now,
    };
    __uiSubscriptions.set(id, doc);
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create subscription' });
  }
});

app.put('/api/subscription/:id', (req, res) => {
  const { id } = req.params;
  const prev = __uiSubscriptions.get(id);
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  const body = (req.body || {}) as Partial<UISubscription>;
  const next: UISubscription = {
    ...prev,
    name: body.name != null ? String(body.name) : prev.name,
    billingDate: body.billingDate != null ? body.billingDate : prev.billingDate,
    type: body.type != null ? String(body.type) : prev.type,
    amount: body.amount != null ? Number(body.amount) : prev.amount,
    paymentMethod:
      body.paymentMethod != null ? (body.paymentMethod as UIPaymentMethod) : prev.paymentMethod,
    bankAccount: body.bankAccount != null ? String(body.bankAccount) : prev.bankAccount,
    isActive: body.isActive != null ? Boolean(body.isActive) : prev.isActive,
    expiresAt: body.expiresAt != null ? String(body.expiresAt) : prev.expiresAt,
    checkedMonths: Array.isArray(body.checkedMonths)
      ? body.checkedMonths.map(String)
      : prev.checkedMonths || [],
    updatedAt: new Date().toISOString(),
  };
  __uiSubscriptions.set(id, next);
  res.json(next);
});

app.delete('/api/subscription/:id', (req, res) => {
  const { id } = req.params;
  const existed = __uiSubscriptions.has(id);
  __uiSubscriptions.delete(id);
  res.json({ success: true, existed });
});

app.patch('/api/subscription/:id/check-status', (req, res) => {
  const { id } = req.params;
  const { month, checked } = (req.body || {}) as { month?: string; checked?: boolean };
  const prev = __uiSubscriptions.get(id);
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  if (!month) return res.status(400).json({ success: false, message: 'month is required' });
  const set = new Set((prev.checkedMonths || []).map(String));
  if (checked) set.add(month);
  else set.delete(month);
  const next = { ...prev, checkedMonths: Array.from(set), updatedAt: new Date().toISOString() };
  __uiSubscriptions.set(id, next);
  res.json(next);
});

app.get('/api/subscription/month/:yearMonth', (req, res) => {
  const ym = String(req.params.yearMonth || '');
  const rows = Array.from(__uiSubscriptions.values()).filter(
    (s) => toMonthKey(s.billingDate) === ym
  );
  res.json(rows);
});

app.get('/api/subscription/type/:type', (req, res) => {
  const t = String(req.params.type || '');
  const rows = Array.from(__uiSubscriptions.values()).filter((s) => String(s.type) === t);
  res.json(rows);
});

app.get('/api/subscription/payment-method/:paymentMethod', (req, res) => {
  const p = String(req.params.paymentMethod || '');
  const rows = Array.from(__uiSubscriptions.values()).filter((s) => {
    const pm = s.paymentMethod as any;
    const typ = typeof pm === 'object' && pm ? pm.type : pm;
    return String(typ) === p;
  });
  res.json(rows);
});

app.get('/api/subscription/total-amount', (_req, res) => {
  const totalAmount = Array.from(__uiSubscriptions.values()).reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );
  res.json({ totalAmount });
});

app.get('/api/subscription/monthly-totals', (_req, res) => {
  const map = new Map<string, number>();
  for (const s of __uiSubscriptions.values()) {
    const key = toMonthKey(s.billingDate);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + (Number(s.amount) || 0));
  }
  const entries = Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, amount]) => ({ month, amount }));
  res.json(entries);
});

// =============================
// User Subscription (per-user) - minimal mock for UpgradePage
// =============================
type DevUserSubscription = {
  _id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
};

const __userSubscriptions = new Map<string, DevUserSubscription>();
const createUserSubId = () => 'us_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

app.get('/api/userSubscription', (_req, res) => {
  res.json(Array.from(__userSubscriptions.values()));
});

app.get('/api/userSubscription/user/:userId', (req, res) => {
  const userId = String(req.params.userId);
  const sub = Array.from(__userSubscriptions.values()).find((s) => s.userId === userId) || null;
  return res.json({ data: sub });
});

app.post('/api/userSubscription', (req, res) => {
  try {
    const { userId, planId, status, currentPeriodEnd, cancelAtPeriodEnd } = (req.body || {}) as {
      userId?: string;
      planId?: string;
      status?: 'active' | 'canceled' | 'expired';
      currentPeriodEnd?: string | Date;
      cancelAtPeriodEnd?: boolean;
    };
    if (!userId || !planId)
      return res.status(400).json({ success: false, message: 'userId/planId are required' });
    // Overwrite existing sub for user to keep one active doc per user
    for (const [id, s] of __userSubscriptions.entries()) {
      if (s.userId === userId) __userSubscriptions.delete(id);
    }
    const id = createUserSubId();
    const sub: DevUserSubscription = {
      _id: id,
      userId,
      planId,
      status: status || 'active',
      currentPeriodEnd:
        typeof currentPeriodEnd === 'string'
          ? currentPeriodEnd
          : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
    };
    __userSubscriptions.set(id, sub);
    return res.status(201).json({ success: true, data: { subscription: sub } });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to create user subscription' });
  }
});

app.put('/api/userSubscription/:id', (req, res) => {
  const { id } = req.params;
  const prev = __userSubscriptions.get(id);
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  const body = req.body || {};
  const next: DevUserSubscription = {
    ...prev,
    planId: body.planId != null ? String(body.planId) : prev.planId,
    status: body.status != null ? body.status : prev.status,
    currentPeriodEnd:
      body.currentPeriodEnd != null
        ? typeof body.currentPeriodEnd === 'string'
          ? body.currentPeriodEnd
          : new Date(body.currentPeriodEnd).toISOString()
        : prev.currentPeriodEnd,
    cancelAtPeriodEnd:
      body.cancelAtPeriodEnd != null ? Boolean(body.cancelAtPeriodEnd) : prev.cancelAtPeriodEnd,
  };
  __userSubscriptions.set(id, next);
  return res.json(next);
});

app.post('/api/userSubscription/:id/cancel-immediately', (req, res) => {
  const { id } = req.params;
  const prev = __userSubscriptions.get(id);
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  const next: DevUserSubscription = { ...prev, status: 'canceled', cancelAtPeriodEnd: false };
  __userSubscriptions.set(id, next);
  return res.json({ success: true, data: next });
});

app.post('/api/userSubscription/:id/reactivate', (req, res) => {
  const { id } = req.params;
  const prev = __userSubscriptions.get(id);
  if (!prev) return res.status(404).json({ success: false, message: 'Not found' });
  const next: DevUserSubscription = {
    ...prev,
    status: 'active',
    cancelAtPeriodEnd: false,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  };
  __userSubscriptions.set(id, next);
  return res.json({ success: true, data: next });
});

app.post('/api/userSubscription/payment-method', (_req, res) => {
  // No-op mock
  return res.json({ success: true });
});

app.get('/api/userSubscription/invoices/:userId', (_req, res) => {
  return res.json({ success: true, data: [] });
});

// =============================
// Subscription (Dev Mock)
// =============================
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
type PaymentCard = { last4: string; brand: string };
type RuntimeSubscription = {
  id: string;
  userId: string;
  plan: string; // planId
  status: SubscriptionStatus;
  renewAt: string | null; // ISO date
  card: PaymentCard | null;
  cancelAtPeriodEnd: boolean;
};

const __subscriptionsByUser: Map<string, RuntimeSubscription> = new Map();

// GET /api/subscription/status
app.get('/api/subscription/status', (req, res) => {
  try {
    // Prevent browser caching and conditional requests
    res.status(200);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');
    const userId = (req as any)?.user?.id || 'local-dev-user';
    const sub = __subscriptionsByUser.get(userId);
    if (!sub)
      return res.json({ plan: null, status: null, renewAt: null, card: null, atPeriodEnd: false });
    return res.json({
      plan: sub.plan,
      status: sub.status,
      renewAt: sub.renewAt,
      card: sub.card,
      atPeriodEnd: sub.cancelAtPeriodEnd,
    });
  } catch (e) {
    return res.status(503).json({ error: 'Service unavailable' });
  }
});

// POST /api/subscription/checkout → returns sessionUrl
app.post('/api/subscription/checkout', (req, res) => {
  const { planId } = (req.body || {}) as { planId?: string };
  if (!planId || typeof planId !== 'string') {
    return res.status(400).json({ error: 'planId is required' });
  }
  // In dev/mock, immediately create/activate the subscription for the current user
  const userId = (req as any)?.user?.id || 'local-dev-user';
  const sub: RuntimeSubscription = {
    id: `sub_${Date.now()}`,
    userId,
    plan: planId,
    status: 'active',
    renewAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    card: { last4: '4242', brand: 'visa' },
    cancelAtPeriodEnd: false,
  };
  __subscriptionsByUser.set(userId, sub);

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  // Return success flag so frontend can show toast and refetch
  const sessionUrl = `http://localhost:3000/subscription?success=1&session_id=${sessionId}`;
  return res.json({ sessionUrl });
});

// POST /api/subscription/portal → returns management url
app.post('/api/subscription/portal', (_req, res) => {
  const url = 'http://localhost:3000/subscription?portal=1';
  return res.json({ url });
});

// POST /api/subscription/cancel
app.post('/api/subscription/cancel', (req, res) => {
  try {
    const userId = (req as any)?.user?.id || 'local-dev-user';
    const atPeriodEnd = Boolean((req.body || {}).atPeriodEnd);
    const sub = __subscriptionsByUser.get(userId);
    if (!sub) {
      // Idempotent cancel for mock
      return res.json({ success: true });
    }
    if (atPeriodEnd) {
      sub.cancelAtPeriodEnd = true;
      sub.status = 'active';
      sub.renewAt = sub.renewAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    } else {
      sub.status = 'canceled';
      sub.renewAt = null;
      sub.cancelAtPeriodEnd = false;
    }
    __subscriptionsByUser.set(userId, sub);
    return res.json({ success: true });
  } catch (e) {
    return res.status(503).json({ error: 'Service unavailable' });
  }
});

// Legacy dev route used by EnhancedSubscriptionForm
// POST /api/subscriptions/create → creates mock subscription and returns message
app.post('/api/subscriptions/create', (req, res) => {
  try {
    const userId = (req as any)?.user?.id || 'local-dev-user';
    const { planId } = (req.body || {}) as { planId?: string };
    if (!planId) return res.status(400).json({ message: 'planId is required' });

    const sub: RuntimeSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      plan: planId,
      status: 'active',
      renewAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      card: { last4: '4242', brand: 'visa' },
      cancelAtPeriodEnd: false,
    };
    __subscriptionsByUser.set(userId, sub);
    return res.json({
      success: true,
      data: { subscription: sub, message: 'Subscription created successfully' },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to create subscription' });
  }
});

// Blog API routes (MongoDB-backed)
console.log('📚 Loading blog routes...');
app.use('/api/blog', blogRoutes);
console.log('✅ Blog routes loaded at /api/blog');

// Silence dev HEAD check noise for tokens endpoint (used by TokenManager)
app.head('/api/auth/tokens', (_req, res) => res.sendStatus(200));
app.get('/api/auth/tokens', (_req, res) => res.sendStatus(200));

// Fallback minimal handlers for blog in case route mounting fails in some envs
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('comments').sort({ createdAt: -1 });
    return res.json(posts);
  } catch (e) {
    console.warn(
      '⚠️ Fallback /api/blog used. Returning empty array.',
      e instanceof Error ? e.message : e
    );
    return res.json([]);
  }
});

app.get('/api/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('comments');
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json(post);
  } catch (e) {
    console.error('❌ Error in fallback GET /api/blog/:id', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

console.log('\n🗺️  Registered Routes:');
console.log('   GET  /api/health');
console.log('   GET  /api/debug');
console.log('   POST /api/auth/login');
console.log('   POST /api/auth/register');
console.log('   POST /api/auth/logout');
console.log('   GET  /api/auth/me');
console.log('   GET  /api/auth/check'); // 追加
console.log('   GET  /api/auth/user'); // 追加
console.log('   GET  /api/auth/whoami'); // 追加
console.log('   GET  /api/todos');
console.log('   POST /api/todos');
console.log('   PUT  /api/todos/:id'); // 追加
console.log('   DELETE /api/todos/:id'); // 追加
console.log('   POST /api/todos/reset'); // 追加
console.log('   GET  /api/todos/history'); // 追加
console.log('   GET  /api/todos/history/daily'); // 追加
console.log('   GET  /api/projects'); // 追加
console.log('   GET  /api/books'); // 追加
console.log('   POST /api/books'); // 追加
console.log('   PUT  /api/books/:id'); // 追加
console.log('   DELETE /api/books/:id'); // 追加
console.log('   POST /api/analytics/track'); // 追加
console.log('   GET  /api/analytics/summary'); // 追加
console.log('   GET  /api/analytics/live-metrics'); // 追加
console.log('   POST /api/analytics/pageview'); // 追加
console.log('   GET  /api/daily-victory/today');
console.log('   GET  /api/daily-victory/history');
console.log('   POST /api/daily-victory/today');
console.log('   PATCH /api/daily-victory/today');
console.log('   GET  /api/admin/metrics/pageviews/trend'); // 追加
console.log('   POST /api/ai/anthropic'); // 追加
console.log('   GET  /api/ai/health'); // 追加
console.log('   POST /api/todos/notify-added'); // 追加
console.log('   GET  /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/settings/:userId'); // 追加
console.log('   POST /api/notifications/test'); // 追加
console.log('   GET  /api/notifications/status'); // 追加
console.log('   GET  /api/admin/metrics/users/summary'); // 追加
console.log('   GET  /api/admin/metrics/assessments/summary'); // 追加
console.log('   GET  /api/admin/metrics/learning/summary'); // 追加
console.log('   GET  /api/admin/live-metrics'); // 追加
console.log('   GET  /api/admin/features'); // 追加
console.log('   POST /api/user/assessments/iq'); // 追加
console.log('   POST /api/user/assessments/mbti'); // 追加
console.log('   POST /api/user/learning/progress'); // 追加

// ========================================
// Notification API Endpoints
// ========================================

// Notify task added
app.post('/api/todos/notify-added', async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    // タスクを取得
    const todo = await TodoModel.findById(taskId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // 全タスク数を取得
    const totalTasks = await TodoModel.countDocuments({ userId });

    // 通知を送信（TodoDocumentをTodoItem形式に変換）
    const priorityMap = { low: 1, medium: 2, high: 3, critical: 5 };
    const todoItem = {
      _id: String((todo as any)._id),
      task: todo.title, // TodoDocumentではtitleプロパティ
      priority: priorityMap[todo.priority] || 2,
      isPrioritized: todo.priority === 'high' || todo.priority === 'critical',
      completed: todo.completed,
      completedDate: todo.completedAt,
      createdAt: todo.createdAt?.toISOString(),
      updatedAt: todo.updatedAt?.toISOString(),
      deadline: todo.dueDate,
      type: todo.type === 'task' ? 'output' : 'input',
      description: todo.description,
      category: todo.category,
      tags: todo.tags,
    };
    await notificationService.notifyTaskAdded(userId, todoItem as any, totalTasks);

    res.json({
      success: true,
      message: 'Notification sent',
    });
  } catch (error) {
    console.error('Error sending task notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
    });
  }
});

// Get notification settings
app.get('/api/notifications/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await notificationService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings',
    });
  }
});

// Update notification settings
app.post('/api/notifications/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;

    await notificationService.saveUserSettings(userId, settings);

    res.json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notification settings',
    });
  }
});

// Send test notification
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { userId, type } = req.body;

    const settings = await notificationService.getUserSettings(userId);
    if (!settings || !settings.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Notifications are disabled',
      });
    }

    // Send test email（ユーザー設定を使用）
    const testSent = await emailService.sendDailyDigest(
      settings.emailAddress,
      {
        totalTasks: 10,
        completedToday: 3,
        pendingTasks: 7,
        upcomingDeadlines: [],
        highPriorityTasks: [],
      },
      settings
    );

    res.json({
      success: testSent,
      message: testSent ? 'Test notification sent' : 'Failed to send test notification',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
});

// Check email service status
app.get('/api/notifications/status', (req, res) => {
  const isReady = emailService.isReady();

  res.json({
    success: true,
    data: {
      emailServiceReady: isReady,
      message: isReady
        ? 'Email service is configured and ready'
        : 'Email service is not configured. Check EMAIL_USER and EMAIL_PASS environment variables.',
    },
  });
});

// ==== Admin metrics summaries ====
app.get('/api/admin/metrics/users/summary', (req, res) => {
  try {
    const now = new Date();
    return res.json({
      ok: true,
      data: {
        totalUsers: 123,
        dau: 9,
        wau: 27,
        mau: 72,
        new7d: 15,
        generatedAt: now.toISOString(),
      },
    });
  } catch (e) {
    return res.json({
      ok: true,
      data: { totalUsers: 0, dau: 0, wau: 0, mau: 0, new7d: 0 },
      degraded: true,
    });
  }
});

app.get('/api/admin/metrics/assessments/summary', (req, res) => {
  try {
    const now = new Date();
    return res.json({
      ok: true,
      data: { iqSaved: 12, mbtiSaved: 18, totalSaved30d: 26, generatedAt: now.toISOString() },
    });
  } catch (e) {
    return res.json({
      ok: true,
      data: { iqSaved: 0, mbtiSaved: 0, totalSaved30d: 0 },
      degraded: true,
    });
  }
});

app.get('/api/admin/metrics/learning/summary', (_req, res) => {
  // Not implemented with real analytics yet. Return empty until DB-backed implementation lands.
  return res.json({ ok: true, data: { progressSaved30d: 0, uniqueLearners30d: 0 } });
});

// Assessment/Learning endpoints are not yet implemented. Disable mocks explicitly.
app.post('/api/user/assessments/iq', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.post('/api/user/assessments/mbti', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);
app.post('/api/user/learning/progress', (_req, res) =>
  res.status(501).json({ success: false, message: 'Not implemented' })
);

// =============================
// Daily Victory (DB-backed)
// =============================
app.get('/api/daily-victory/today', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.json({ success: true, data: null });
    const userId = (req as any)?.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: '認証が必要です' });
    const key = new Date().toISOString().slice(0, 10);
    const doc = await DailyVictory.findOne({ userId, date: key }).lean();
    const data = doc
      ? {
          date: doc.date,
          winCondition: doc.winCondition,
          criteria: doc.criteria,
          result: doc.result,
          score: doc.score,
          notes: doc.notes,
          createdAt: doc.createdAt?.toISOString(),
          updatedAt: doc.updatedAt?.toISOString(),
        }
      : null;
    return res.json({ success: true, data });
  } catch (e) {
    console.error('❌ Error in GET /api/daily-victory/today:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

app.get('/api/daily-victory/history', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.json({ success: true, data: [] });
    const userId = (req as any)?.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: '認証が必要です' });
    const limit = Math.max(1, Math.min(90, Number(req.query.limit || 30)));
    const docs = await DailyVictory.find({ userId }).sort({ date: -1 }).limit(limit).lean();
    const data = docs.map((d) => ({
      date: d.date,
      winCondition: d.winCondition,
      criteria: d.criteria,
      result: d.result,
      score: d.score,
      notes: d.notes,
      createdAt: d.createdAt?.toISOString(),
      updatedAt: d.updatedAt?.toISOString(),
    }));
    return res.json({ success: true, data });
  } catch (e) {
    console.error('❌ Error in GET /api/daily-victory/history:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

app.post('/api/daily-victory/today', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI)
      return res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
    const userId = (req as any)?.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: '認証が必要です' });
    const { winCondition, criteria } = req.body || {};
    if (!winCondition || !Array.isArray(criteria) || criteria.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'winCondition と criteria は必須です' });
    }
    const date = new Date().toISOString().slice(0, 10);
    const updated = await DailyVictory.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        winCondition: String(winCondition),
        criteria: criteria.map(String),
        result: 'pending',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({
      success: true,
      data: {
        date: updated.date,
        winCondition: updated.winCondition,
        criteria: updated.criteria,
        result: updated.result,
        score: updated.score,
        notes: updated.notes,
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      },
    });
  } catch (e) {
    console.error('❌ Error in POST /api/daily-victory/today:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

app.patch('/api/daily-victory/today', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI)
      return res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
    const userId = (req as any)?.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: '認証が必要です' });
    const { result, notes, score } = req.body || {};
    if (result !== 'win' && result !== 'lose') {
      return res.status(400).json({ success: false, message: 'result は win か lose が必要です' });
    }
    const date = new Date().toISOString().slice(0, 10);
    const updated = await DailyVictory.findOneAndUpdate(
      { userId, date },
      { result, notes, score },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: '本日の勝利条件が未設定です' });
    return res.json({
      success: true,
      data: {
        date: updated.date,
        winCondition: updated.winCondition,
        criteria: updated.criteria,
        result: updated.result,
        score: updated.score,
        notes: updated.notes,
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      },
    });
  } catch (e) {
    console.error('❌ Error in PATCH /api/daily-victory/today:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// 404 Error handler - must be after all known routes; allow future mocks via pattern
app.use((req: Request, res: Response): void => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('🚨 Global Error Handler:');
  console.error('Error:', err);
  console.error('Request:', req.method, req.url);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Connect to database and start server
const startServer = async () => {
  let dbConnected = false;
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    dbConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️ Database connection failed. Running in degraded mode (limited APIs).');
    console.warn('   Set MONGODB_URI in .env.local to enable full features.');
  }

  // Error handling middleware (must be last)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`\n✅ Enhanced server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`📍 Todos: http://localhost:${PORT}/api/todos`);
    console.log(`📚 Books: http://localhost:${PORT}/api/books`);
    console.log(`🤖 AI API: http://localhost:${PORT}/api/ai/anthropic`);
    console.log(`   API Key configured: ${ANTHROPIC_API_KEY ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Database connected: ${dbConnected ? 'Yes ✅' : 'No ❌ (degraded mode)'}`);
    console.log('🔍 Debug mode enabled - detailed logging active\n');
  });
};

startServer();
