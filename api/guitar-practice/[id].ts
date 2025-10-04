import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from '../utils/database.js';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Guitar Practice Schema
const GuitarPracticeSchema = new mongooseDB.Schema({
  userId: { type: String, required: true, index: true },
  practiceDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 },
  songTitle: { type: String, default: '' },
  technique: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  notes: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
GuitarPracticeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const GuitarPractice = (mongooseDB.models['GuitarPractice'] as any) || mongooseDB.model('GuitarPractice', GuitarPracticeSchema);

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
        message: '練習記録のIDが必要です',
        error: 'Record ID required'
      });
    }

    if (req.method === 'GET') {
      // 特定の練習記録を取得
      const record = await GuitarPractice.findOne({ _id: id, userId });
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: '練習記録が見つかりません',
          error: 'Record not found'
        });
      }

      res.status(200).json({
        success: true,
        message: '練習記録を取得しました',
        record: {
          id: record._id.toString(),
          userId: record.userId,
          practiceDate: record.practiceDate.toISOString(),
          duration: record.duration,
          songTitle: record.songTitle,
          technique: record.technique,
          difficulty: record.difficulty,
          notes: record.notes,
          rating: record.rating,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'PUT') {
      // 練習記録を更新
      const updateData = req.body || {};
      
      // 日付フィールドを変換
      if (updateData.practiceDate) {
        updateData.practiceDate = new Date(updateData.practiceDate);
      }
      
      // 数値フィールドを変換
      if (updateData.duration) {
        updateData.duration = parseInt(updateData.duration);
      }
      if (updateData.rating) {
        updateData.rating = parseInt(updateData.rating);
      }

      const record = await GuitarPractice.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '練習記録が見つかりません',
          error: 'Record not found'
        });
      }

      res.status(200).json({
        success: true,
        message: '練習記録を更新しました',
        record: {
          id: record._id.toString(),
          userId: record.userId,
          practiceDate: record.practiceDate.toISOString(),
          duration: record.duration,
          songTitle: record.songTitle,
          technique: record.technique,
          difficulty: record.difficulty,
          notes: record.notes,
          rating: record.rating,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'DELETE') {
      // 練習記録を削除
      const record = await GuitarPractice.findOneAndDelete({ _id: id, userId });
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: '練習記録が見つかりません',
          error: 'Record not found'
        });
      }

      res.status(200).json({
        success: true,
        message: '練習記録を削除しました'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Guitar Practice Detail API error:', error);
    return handleError(res, error, 'ギター練習記録処理中にエラーが発生しました');
  }
}
