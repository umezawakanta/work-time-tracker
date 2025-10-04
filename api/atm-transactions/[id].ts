import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from '../utils/database.js';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '取引のIDが必要です',
        error: 'Transaction ID required'
      });
    }

    if (req.method === 'GET') {
      // 特定のATM取引を取得
      const transaction = await ATMTransaction.findOne({ _id: id, userId });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'ATM取引が見つかりません',
          error: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'ATM取引を取得しました',
        transaction: {
          id: transaction._id.toString(),
          userId: transaction.userId,
          bankAccountId: transaction.bankAccountId,
          transactionDate: transaction.transactionDate.toISOString(),
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          balance: transaction.balance,
          atmLocation: transaction.atmLocation,
          atmBranch: transaction.atmBranch,
          description: transaction.description,
          referenceNumber: transaction.referenceNumber,
          fees: transaction.fees,
          notes: transaction.notes,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'PUT') {
      // ATM取引を更新
      const updateData = req.body || {};
      
      // 日付フィールドを変換
      if (updateData.transactionDate) {
        updateData.transactionDate = new Date(updateData.transactionDate);
      }
      
      // 数値フィールドを変換
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }
      if (updateData.balance) {
        updateData.balance = parseFloat(updateData.balance);
      }
      if (updateData.fees) {
        updateData.fees = parseFloat(updateData.fees);
      }

      const transaction = await ATMTransaction.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'ATM取引が見つかりません',
          error: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'ATM取引を更新しました',
        transaction: {
          id: transaction._id.toString(),
          userId: transaction.userId,
          bankAccountId: transaction.bankAccountId,
          transactionDate: transaction.transactionDate.toISOString(),
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          balance: transaction.balance,
          atmLocation: transaction.atmLocation,
          atmBranch: transaction.atmBranch,
          description: transaction.description,
          referenceNumber: transaction.referenceNumber,
          fees: transaction.fees,
          notes: transaction.notes,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'DELETE') {
      // ATM取引を削除
      const transaction = await ATMTransaction.findOneAndDelete({ _id: id, userId });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'ATM取引が見つかりません',
          error: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'ATM取引を削除しました'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ ATM Transaction Detail API error:', error);
    return handleError(res, error, 'ATM取引処理中にエラーが発生しました');
  }
}
