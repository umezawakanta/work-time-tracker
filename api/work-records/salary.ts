import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { verifyJWT, handleError } from '../utils/database.js';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    await mongoose.connect(process.env['MONGODB_URI'] || '', {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// 給与記録スキーマ
const SalaryRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SalaryRecord = (mongoose.models['SalaryRecord'] as any) || mongoose.model('SalaryRecord', SalaryRecordSchema);

// メインハンドラー
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
    // データベース接続
    await connectDB();

    // 認証
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }

    const userId = userInfo.userId || userInfo.id;

    if (req.method === 'GET') {
      // 給与記録一覧取得
      const { startDate, endDate, type, category } = req.query;
      
      let query: any = { userId };
      
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }
      
      if (type) {
        query.type = type;
      }
      
      if (category) {
        query.category = category;
      }

      const records = await SalaryRecord.find(query)
        .sort({ date: -1 })
        .limit(1000);

      res.status(200).json({
        success: true,
        records: records
      });

    } else if (req.method === 'POST') {
      // 給与記録作成
      const { date, amount, type, category, description, tags } = req.body;

      if (!date || !amount || !type || !category) {
        return handleError(res, { statusCode: 400, message: '必須フィールドが不足しています' });
      }

      const record = new SalaryRecord({
        userId,
        date: new Date(date),
        amount: Number(amount),
        type,
        category,
        description,
        tags: tags || []
      });

      await record.save();

      res.status(201).json({
        success: true,
        message: '給与記録を作成しました',
        record: record
      });

    } else if (req.method === 'PUT') {
      // 給与記録更新
      const { id, date, amount, type, category, description, tags } = req.body;

      if (!id) {
        return handleError(res, { statusCode: 400, message: 'IDが必要です' });
      }

      const record = await SalaryRecord.findOneAndUpdate(
        { _id: id, userId },
        {
          date: date ? new Date(date) : undefined,
          amount: amount ? Number(amount) : undefined,
          type,
          category,
          description,
          tags: tags || undefined,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!record) {
        return handleError(res, { statusCode: 404, message: '記録が見つかりません' });
      }

      res.status(200).json({
        success: true,
        message: '給与記録を更新しました',
        record: record
      });

    } else if (req.method === 'DELETE') {
      // 給与記録削除
      const { id } = req.query;

      if (!id) {
        return handleError(res, { statusCode: 400, message: 'IDが必要です' });
      }

      const record = await SalaryRecord.findOneAndDelete({ _id: id, userId });

      if (!record) {
        return handleError(res, { statusCode: 404, message: '記録が見つかりません' });
      }

      res.status(200).json({
        success: true,
        message: '給与記録を削除しました'
      });

    } else {
      return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }

  } catch (error) {
    console.error('❌ Salary records error:', error);
    return handleError(res, error, '給与記録処理中にエラーが発生しました');
  }
}
