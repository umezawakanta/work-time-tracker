import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from './utils/database.js';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// ATM Transaction Schema
const ATMTransactionSchema = new mongooseDB.Schema({
  userId: { type: String, required: true, index: true },
  bankAccountId: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  transactionType: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'fee', 'interest'], 
    required: true 
  },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  atmLocation: { type: String, required: true },
  atmBranch: { type: String, required: true },
  description: { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
  fees: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
ATMTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ATMTransaction = (mongooseDB.models['ATMTransaction'] as any) || mongooseDB.model('ATMTransaction', ATMTransactionSchema);

// CORS設定
const setCorsHeaders = (res: VercelResponse, origin: string | undefined) => {
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { origin } = req.headers;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDatabaseConnection();

    const userInfo = await verifyAuth(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required'
      });
    }

    const userId = userInfo.id || userInfo.userId;

    if (req.method === 'GET') {
      // ユーザーのATM取引を取得
      const { bankAccountId, startDate, endDate, transactionType } = req.query;
      
      let query: any = { userId };
      
      if (bankAccountId) {
        query.bankAccountId = bankAccountId;
      }
      
      if (startDate && endDate) {
        query.transactionDate = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }
      
      if (transactionType) {
        query.transactionType = transactionType;
      }

      const transactions = await ATMTransaction.find(query)
        .sort({ transactionDate: -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        message: 'ATM取引を取得しました',
        transactions: transactions.map(transaction => ({
          id: transaction._id.toString(),
          userId: transaction.userId,
          bankAccountId: transaction.bankAccountId,
          transactionDate: transaction.transactionDate.toISOString(),
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          balance: transaction.balance,
          atmLocation: transaction.atmLocation,
          atmBranch: transaction.atmBranch,
          description: transaction.description || '',
          referenceNumber: transaction.referenceNumber || '',
          fees: transaction.fees || 0,
          notes: transaction.notes || '',
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        }))
      });

    } else if (req.method === 'POST') {
      // 新しいATM取引を作成
      const {
        bankAccountId,
        transactionDate,
        transactionType,
        amount,
        balance,
        atmLocation,
        atmBranch,
        description = '',
        referenceNumber = '',
        fees = 0,
        notes = ''
      } = req.body;

      if (!bankAccountId || !transactionDate || !transactionType || !amount || !balance || !atmLocation || !atmBranch) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields'
        });
      }

      const newTransaction = new ATMTransaction({
        userId,
        bankAccountId,
        transactionDate: new Date(transactionDate),
        transactionType,
        amount: parseFloat(amount),
        balance: parseFloat(balance),
        atmLocation,
        atmBranch,
        description,
        referenceNumber,
        fees: parseFloat(fees) || 0,
        notes
      });

      await newTransaction.save();

      res.status(201).json({
        success: true,
        message: 'ATM取引を作成しました',
        transaction: {
          id: newTransaction._id.toString(),
          userId: newTransaction.userId,
          bankAccountId: newTransaction.bankAccountId,
          transactionDate: newTransaction.transactionDate.toISOString(),
          transactionType: newTransaction.transactionType,
          amount: newTransaction.amount,
          balance: newTransaction.balance,
          atmLocation: newTransaction.atmLocation,
          atmBranch: newTransaction.atmBranch,
          description: newTransaction.description,
          referenceNumber: newTransaction.referenceNumber,
          fees: newTransaction.fees,
          notes: newTransaction.notes,
          createdAt: newTransaction.createdAt.toISOString(),
          updatedAt: newTransaction.updatedAt.toISOString(),
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ ATM Transaction API error:', error);
    return handleError(res, error, 'ATM取引処理中にエラーが発生しました');
  }
}
