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
  console.warn('[bank-accounts] Database not connected, attempting to connect...');
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
    console.error('[bank-accounts] Failed to connect to database:', message);
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
  console.error('Bank accounts error:', error);
  res.status(500).json({
    success: false,
    message,
    error: process.env['NODE_ENV'] === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
  });
};

// 銀行口座スキーマ
const BankAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['普通', '当座', '貯蓄', '定期'], 
    required: true 
  },
  accountNumber: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// 銀行取引スキーマ
const BankTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bankAccountId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'adjustment'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: '' },
  counterparty: { type: String, default: '' },
  transactionDate: { type: Date, required: true },
  balanceAfter: { type: Number, required: true }
}, {
  timestamps: true
});

const BankAccount = (mongoose.models['BankAccount'] as any) || mongoose.model('BankAccount', BankAccountSchema);
const BankTransaction = (mongoose.models['BankTransaction'] as any) || mongoose.model('BankTransaction', BankTransactionSchema);

interface BankAccountResponse {
  success: boolean;
  message: string;
  accounts?: Array<{
    id: string;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolderName: string;
    currentBalance: number;
    lastUpdated: string;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    counterparty: string;
    transactionDate: string;
    balanceAfter: number;
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
      // 銀行口座一覧を取得
      const accounts = await BankAccount.find({ userId, isActive: true }).sort({ createdAt: -1 });
      const transactions = await BankTransaction.find({ userId }).sort({ transactionDate: -1 }).limit(50);

      const response: BankAccountResponse = {
        success: true,
        message: '銀行口座データを取得しました',
        accounts: accounts.map(account => ({
          id: account._id.toString(),
          bankName: account.bankName,
          branchName: account.branchName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          accountHolderName: account.accountHolderName,
          currentBalance: account.currentBalance,
          lastUpdated: account.lastUpdated.toISOString(),
          notes: account.notes,
          isActive: account.isActive,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString()
        })),
        transactions: transactions.map(transaction => ({
          id: transaction._id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          counterparty: transaction.counterparty,
          transactionDate: transaction.transactionDate.toISOString(),
          balanceAfter: transaction.balanceAfter
        }))
      };

      res.status(200).json(response);

    } else if (req.method === 'POST') {
      // 銀行口座を作成
      const { 
        bankName, 
        branchName, 
        accountType, 
        accountNumber, 
        accountHolderName, 
        currentBalance, 
        notes 
      } = req.body;

      // 必須フィールドのバリデーション
      if (!bankName || !branchName || !accountType || !accountNumber || !accountHolderName) {
        return handleError(res, { 
          statusCode: 400, 
          message: '銀行名、支店名、口座種別、口座番号、口座名義人は必須です' 
        });
      }

      const account = new BankAccount({
        userId,
        bankName,
        branchName,
        accountType,
        accountNumber,
        accountHolderName,
        currentBalance: Number(currentBalance) || 0,
        notes: notes || '',
        isActive: true
      });

      await account.save();

      const response: BankAccountResponse = {
        success: true,
        message: '銀行口座を作成しました',
        accounts: [{
          id: account._id.toString(),
          bankName: account.bankName,
          branchName: account.branchName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          accountHolderName: account.accountHolderName,
          currentBalance: account.currentBalance,
          lastUpdated: account.lastUpdated.toISOString(),
          notes: account.notes,
          isActive: account.isActive,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString()
        }]
      };

      res.status(201).json(response);

    } else if (req.method === 'PUT') {
      // 銀行口座を更新
      const { 
        accountId, 
        bankName, 
        branchName, 
        accountType, 
        accountNumber, 
        accountHolderName, 
        currentBalance, 
        notes 
      } = req.body;

      const account = await BankAccount.findOneAndUpdate(
        { _id: accountId, userId },
        {
          bankName,
          branchName,
          accountType,
          accountNumber,
          accountHolderName,
          currentBalance: Number(currentBalance),
          notes,
          lastUpdated: new Date()
        },
        { new: true }
      );

      if (!account) {
        return handleError(res, { statusCode: 404, message: '銀行口座が見つかりません' });
      }

      const response: BankAccountResponse = {
        success: true,
        message: '銀行口座を更新しました',
        accounts: [{
          id: account._id.toString(),
          bankName: account.bankName,
          branchName: account.branchName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          accountHolderName: account.accountHolderName,
          currentBalance: account.currentBalance,
          lastUpdated: account.lastUpdated.toISOString(),
          notes: account.notes,
          isActive: account.isActive,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString()
        }]
      };

      res.status(200).json(response);

    } else if (req.method === 'DELETE') {
      // 銀行口座を削除（論理削除）
      const { accountId } = req.body;

      const account = await BankAccount.findOneAndUpdate(
        { _id: accountId, userId },
        { isActive: false },
        { new: true }
      );

      if (!account) {
        return handleError(res, { statusCode: 404, message: '銀行口座が見つかりません' });
      }

      const response: BankAccountResponse = {
        success: true,
        message: '銀行口座を削除しました'
      };

      res.status(200).json(response);

    } else {
      return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }

  } catch (error) {
    console.error('❌ Bank accounts error:', error);
    return handleError(res, error, '銀行口座処理中にエラーが発生しました');
  }
}
