import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from '../../utils/database.js';
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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: '履歴IDが必要です',
        error: 'History ID is required'
      });
    }

    // 履歴の存在確認とユーザー権限チェック
    const existingEntry = await WalletBalanceHistory.findOne({
      _id: id,
      userId
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: '履歴が見つかりません',
        error: 'History not found'
      });
    }

    if (req.method === 'GET') {
      // 特定の履歴を取得
      res.status(200).json({
        success: true,
        message: '財布残高履歴を取得しました',
        entry: {
          id: existingEntry._id.toString(),
          userId: existingEntry.userId,
          date: existingEntry.date.toISOString(),
          amount: existingEntry.amount,
          change: existingEntry.change,
          notes: existingEntry.notes || '',
          tags: existingEntry.tags || [],
          createdAt: existingEntry.createdAt.toISOString(),
          updatedAt: existingEntry.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'PUT') {
      // 履歴を修正
      const {
        date,
        amount,
        change,
        notes = '',
        tags = []
      } = req.body;

      if (!date || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields'
        });
      }

      // 同じ日付の他の履歴が存在するかチェック（自分以外）
      const duplicateEntry = await WalletBalanceHistory.findOne({
        userId,
        date: new Date(date),
        _id: { $ne: id }
      });

      if (duplicateEntry) {
        return res.status(400).json({
          success: false,
          message: '同じ日付の履歴が既に存在します',
          error: 'Duplicate entry for the same date'
        });
      }

      // 変化額を計算（指定されていない場合）
      let calculatedChange = change;
      if (calculatedChange === undefined) {
        // 前日の履歴を取得して変化額を計算
        const previousDay = new Date(date);
        previousDay.setDate(previousDay.getDate() - 1);
        
        const previousEntry = await WalletBalanceHistory.findOne({
          userId,
          date: {
            $gte: new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate()),
            $lt: new Date(previousDay.getFullYear(), previousDay.getMonth(), previousDay.getDate() + 1)
          }
        }).sort({ date: -1 });

        if (previousEntry) {
          calculatedChange = parseFloat(amount) - previousEntry.amount;
        } else {
          calculatedChange = 0; // 前日の履歴がない場合は0
        }
      }

      const updatedEntry = await WalletBalanceHistory.findByIdAndUpdate(
        id,
        {
          date: new Date(date),
          amount: parseFloat(amount),
          change: calculatedChange,
          notes,
          tags,
          updatedAt: new Date()
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: '財布残高履歴を修正しました',
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

    } else if (req.method === 'DELETE') {
      // 履歴を削除
      await WalletBalanceHistory.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: '財布残高履歴を削除しました'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Wallet Balance History [id] API error:', error);
    return handleError(res, error, '財布残高履歴処理中にエラーが発生しました');
  }
}
