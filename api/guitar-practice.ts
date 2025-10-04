import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from './utils/database.js';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Guitar Practice Schema
const GuitarPracticeSchema = new mongooseDB.Schema({
  userId: { type: String, required: true, index: true },
  practiceDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 }, // 練習時間（分）
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
      // ユーザーの練習記録を取得
      const { startDate, endDate, technique, difficulty } = req.query;
      
      let query: any = { userId };
      
      if (startDate && endDate) {
        query.practiceDate = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }
      
      if (technique) {
        query.technique = technique;
      }
      
      if (difficulty) {
        query.difficulty = difficulty;
      }

      const records = await GuitarPractice.find(query)
        .sort({ practiceDate: -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        message: 'ギター練習記録を取得しました',
        records: records.map(record => ({
          id: record._id.toString(),
          userId: record.userId,
          practiceDate: record.practiceDate.toISOString(),
          duration: record.duration,
          songTitle: record.songTitle || '',
          technique: record.technique,
          difficulty: record.difficulty,
          notes: record.notes || '',
          rating: record.rating,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        }))
      });

    } else if (req.method === 'POST') {
      // 新しい練習記録を作成
      const {
        practiceDate,
        duration,
        songTitle = '',
        technique,
        difficulty,
        notes = '',
        rating
      } = req.body;

      if (!practiceDate || !duration || !technique || !difficulty || !rating) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields'
        });
      }

      const newRecord = new GuitarPractice({
        userId,
        practiceDate: new Date(practiceDate),
        duration: parseInt(duration),
        songTitle,
        technique,
        difficulty,
        notes,
        rating: parseInt(rating)
      });

      await newRecord.save();

      res.status(201).json({
        success: true,
        message: 'ギター練習記録を作成しました',
        record: {
          id: newRecord._id.toString(),
          userId: newRecord.userId,
          practiceDate: newRecord.practiceDate.toISOString(),
          duration: newRecord.duration,
          songTitle: newRecord.songTitle,
          technique: newRecord.technique,
          difficulty: newRecord.difficulty,
          notes: newRecord.notes,
          rating: newRecord.rating,
          createdAt: newRecord.createdAt.toISOString(),
          updatedAt: newRecord.updatedAt.toISOString(),
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
    console.error('❌ Guitar Practice API error:', error);
    return handleError(res, error, 'ギター練習記録処理中にエラーが発生しました');
  }
}
