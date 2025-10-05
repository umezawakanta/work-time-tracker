import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from '../utils/database.js';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Wallet Balance History Schema
const WalletBalanceHistorySchema = new mongooseDB.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  change: { type: Number, required: true }, // 前日からの変化額
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
WalletBalanceHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const WalletBalanceHistory = (mongooseDB.models['WalletBalanceHistory'] as any) || mongooseDB.model('WalletBalanceHistory', WalletBalanceHistorySchema);

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
      // ユーザーの財布残高履歴を取得
      const { startDate, endDate, limit = '30' } = req.query;
      
      let query: any = { userId };
      
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const history = await WalletBalanceHistory.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit as string));

      res.status(200).json({
        success: true,
        message: '財布残高履歴を取得しました',
        history: history.map(entry => ({
          id: entry._id.toString(),
          userId: entry.userId,
          date: entry.date.toISOString(),
          amount: entry.amount,
          change: entry.change,
          notes: entry.notes || '',
          tags: entry.tags || [],
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        }))
      });

    } else if (req.method === 'POST') {
      // 新しい財布残高履歴を作成
      const {
        date,
        amount,
        change,
        notes = '',
        tags = []
      } = req.body;

      if (!date || amount === undefined || change === undefined) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields'
        });
      }

      // 同じ日付の履歴が既に存在するかチェック
      const existingEntry = await WalletBalanceHistory.findOne({
        userId,
        date: new Date(date)
      });

      if (existingEntry) {
        // 既存の履歴を更新
        const updatedEntry = await WalletBalanceHistory.findByIdAndUpdate(
          existingEntry._id,
          {
            amount: parseFloat(amount),
            change: parseFloat(change),
            notes,
            tags,
            updatedAt: new Date()
          },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: '財布残高履歴を更新しました',
          entry: {
            id: updatedEntry._id.toString(),
            userId: updatedEntry.userId,
            date: updatedEntry.date.toISOString(),
            amount: updatedEntry.amount,
            change: updatedEntry.change,
            notes: updatedEntry.notes,
            tags: updatedEntry.tags,
            createdAt: updatedEntry.createdAt.toISOString(),
            updatedAt: updatedEntry.updatedAt.toISOString(),
          }
        });
      } else {
        // 新しい履歴を作成
        const newEntry = new WalletBalanceHistory({
          userId,
          date: new Date(date),
          amount: parseFloat(amount),
          change: parseFloat(change),
          notes,
          tags
        });

        await newEntry.save();

        res.status(201).json({
          success: true,
          message: '財布残高履歴を作成しました',
          entry: {
            id: newEntry._id.toString(),
            userId: newEntry.userId,
            date: newEntry.date.toISOString(),
            amount: newEntry.amount,
            change: newEntry.change,
            notes: newEntry.notes,
            tags: newEntry.tags,
            createdAt: newEntry.createdAt.toISOString(),
            updatedAt: newEntry.updatedAt.toISOString(),
          }
        });
      }

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Wallet Balance History API error:', error);
    return handleError(res, error, '財布残高履歴処理中にエラーが発生しました');
  }
}
