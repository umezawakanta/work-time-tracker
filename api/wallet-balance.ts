import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続関数
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[wallet-balance] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env['MONGODB_URI'];
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
    console.error('[wallet-balance] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// JWT検証関数
const verifyJWT = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    return jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret-for-development') as any;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// エラーハンドリング関数
const handleError = (res: VercelResponse, error: any, message: string = 'エラーが発生しました') => {
  console.error('API Error:', error);
  const statusCode = error?.statusCode || 500;
  const errorMessage = error?.message || message;
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: process.env['NODE_ENV'] === 'development' ? error?.stack : undefined
  });
};

// 財布の残高スキーマ
const WalletBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'JPY' },
  notes: { type: String },
  tags: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 財布の取引スキーマ
const WalletTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  walletId: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  date: { type: Date, required: true }
}, {
  timestamps: true
});

const WalletBalance = (mongoose.models['WalletBalance'] as any) || mongoose.model('WalletBalance', WalletBalanceSchema);
const WalletTransaction = (mongoose.models['WalletTransaction'] as any) || mongoose.model('WalletTransaction', WalletTransactionSchema);

// レスポンス型定義
interface WalletBalanceResponse {
  success: boolean;
  message: string;
  balance?: {
    amount: number;
    currency: string;
    notes?: string;
    tags?: string[];
    lastUpdated: string;
  };
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    tags?: string[];
    date: string;
  }>;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDatabaseConnection();
    
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }
    
    const userId = userInfo.userId || userInfo.id;

    if (req.method === 'GET') {
      // 財布の残高と取引履歴を取得
      const balance = await WalletBalance.findOne({ userId });
      const transactions = await WalletTransaction.find({ userId }).sort({ date: -1 }).limit(50);

      const response: WalletBalanceResponse = {
        success: true,
        message: '財布の残高データを取得しました',
        balance: balance ? {
          amount: balance.amount,
          currency: balance.currency,
          notes: balance.notes,
          tags: balance.tags,
          lastUpdated: balance.lastUpdated.toISOString()
        } : {
          amount: 0,
          currency: 'JPY',
          lastUpdated: new Date().toISOString()
        },
        transactions: transactions.map((tx: any) => ({
          id: tx._id.toString(),
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
          tags: tx.tags,
          date: tx.date.toISOString()
        }))
      };

      res.status(200).json(response);

    } else if (req.method === 'POST') {
      // 残高を更新
      const { amount, notes, tags } = req.body;

      const balance = await WalletBalance.findOneAndUpdate(
        { userId },
        { 
          amount: Number(amount),
          notes,
          tags: tags || [],
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      const response: WalletBalanceResponse = {
        success: true,
        message: '残高が更新されました',
        balance: {
          amount: balance.amount,
          currency: balance.currency,
          notes: balance.notes,
          tags: balance.tags,
          lastUpdated: balance.lastUpdated.toISOString()
        }
      };

      res.status(200).json(response);

    } else if (req.method === 'PUT') {
      // 取引を追加
      const { type, amount, description, category, tags, date } = req.body;

      const transaction = new WalletTransaction({
        userId,
        walletId: 'default',
        type,
        amount: Number(amount),
        description,
        category,
        tags: tags || [],
        date: new Date(date)
      });

      await transaction.save();

      // 残高を更新
      const currentBalance = await WalletBalance.findOne({ userId });
      const newAmount = currentBalance 
        ? currentBalance.amount + (type === 'income' ? Number(amount) : -Number(amount))
        : (type === 'income' ? Number(amount) : -Number(amount));

      const updatedBalance = await WalletBalance.findOneAndUpdate(
        { userId },
        { 
          amount: newAmount,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      const response: WalletBalanceResponse = {
        success: true,
        message: '取引が追加されました',
        balance: {
          amount: updatedBalance.amount,
          currency: updatedBalance.currency,
          notes: updatedBalance.notes,
          tags: updatedBalance.tags,
          lastUpdated: updatedBalance.lastUpdated.toISOString()
        }
      };

      res.status(200).json(response);

    } else {
      return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }

  } catch (error) {
    console.error('❌ Wallet balance error:', error);
    return handleError(res, error, '財布の残高処理中にエラーが発生しました');
  }
}
