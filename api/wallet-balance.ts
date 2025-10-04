import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDatabaseConnection, verifyJWT, handleError } from '../utils/database.js';

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

      res.status(200).json({
        success: true,
        balance: balance || { amount: 0, currency: 'JPY' },
        transactions: transactions || []
      });

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

      res.status(200).json({
        success: true,
        message: '残高が更新されました',
        balance
      });

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

      await WalletBalance.findOneAndUpdate(
        { userId },
        { 
          amount: newAmount,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        message: '取引が追加されました',
        transaction
      });

    } else {
      return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }

  } catch (error) {
    console.error('❌ Wallet balance error:', error);
    return handleError(res, error, '財布の残高処理中にエラーが発生しました');
  }
}
