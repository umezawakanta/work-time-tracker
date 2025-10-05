import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env['MONGODB_URI'] || '', {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// 日記のスキーマ
const WorkDiarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['😊', '😐', '😔', '😤', '😴', '🤔', '😍', '😢'], default: '😊' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  // 新しい項目
  activities: [{ type: String }],
  workSummary: { type: String, default: '' },
  achievements: [{ type: String }],
  challenges: [{ type: String }],
  learnings: [{ type: String }],
  nextGoals: [{ type: String }],
  energyLevel: { type: Number, min: 1, max: 10, default: 5 },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  workHours: { type: Number, default: 0 },
  breakTime: { type: Number, default: 0 },
  productivity: { type: Number, min: 1, max: 10, default: 5 },
  notes: { type: String, default: '' },
  gratitude: { type: String, default: '' },
  reflection: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorkDiary = (mongoose.models['WorkDiary'] as any) || mongoose.model('WorkDiary', WorkDiarySchema);

// JWT認証ヘルパー関数
interface JWTPayload {
  id?: string;
  userId?: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

const verifyJWT = (req: VercelRequest): JWTPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // 型安全性のための検証
    if (!decoded || typeof decoded !== 'object' || (!decoded.id && !decoded.userId)) {
      console.error('Invalid JWT payload structure');
      return null;
    }

    // トークンの有効期限をチェック
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      console.error('JWT token has expired');
      return null;
    }

    // 必須フィールドの検証
    if (!decoded.email || !decoded.role) {
      console.error('JWT payload missing required fields');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env['NODE_ENV'] === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin || '') ? (req.headers.origin || 'https://work-time-tracker-five.vercel.app') : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  // JWT認証
  const user = verifyJWT(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '認証が必要です'
    });
  }

  const userId = user.id || user.userId;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '日記IDが必要です'
    });
  }

  try {
    if (req.method === 'GET') {
      // 特定の日記を取得
      const diary = await WorkDiary.findById(id);

      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日記が見つかりません'
        });
      }

      // ユーザー認証：自分の日記のみアクセス可能
      if (diary.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'この日記にアクセスする権限がありません'
        });
      }

      res.status(200).json({
        success: true,
        diary
      });

    } else if (req.method === 'PUT') {
      // 日記を更新
      const { 
        date, title, content, mood, tags, isPrivate,
        activities, workSummary, achievements, challenges, learnings, nextGoals,
        energyLevel, stressLevel, workHours, breakTime, productivity,
        notes, gratitude, reflection
      } = req.body;

      const updateData: any = {
        updatedAt: new Date()
      };

      if (date) {
        const jstDate = new Date(date);
        const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
        updateData.date = utcDate;
      }
      if (title) { updateData.title = title; }
      if (content) { updateData.content = content; }
      if (mood) { updateData.mood = mood; }
      if (tags) { updateData.tags = tags; }
      if (isPrivate !== undefined) { updateData.isPrivate = isPrivate; }
      
      // 新しい項目の処理
      if (activities) { updateData.activities = activities; }
      if (workSummary !== undefined) { updateData.workSummary = workSummary; }
      if (achievements) { updateData.achievements = achievements; }
      if (challenges) { updateData.challenges = challenges; }
      if (learnings) { updateData.learnings = learnings; }
      if (nextGoals) { updateData.nextGoals = nextGoals; }
      if (energyLevel !== undefined) { updateData.energyLevel = energyLevel; }
      if (stressLevel !== undefined) { updateData.stressLevel = stressLevel; }
      if (workHours !== undefined) { updateData.workHours = workHours; }
      if (breakTime !== undefined) { updateData.breakTime = breakTime; }
      if (productivity !== undefined) { updateData.productivity = productivity; }
      if (notes !== undefined) { updateData.notes = notes; }
      if (gratitude !== undefined) { updateData.gratitude = gratitude; }
      if (reflection !== undefined) { updateData.reflection = reflection; }

      const diary = await WorkDiary.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      );

      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日記が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '日記が更新されました',
        diary
      });

    } else if (req.method === 'DELETE') {
      // 日記を削除
      const diary = await WorkDiary.findOneAndDelete({ _id: id, userId });

      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日記が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '日記が削除されました'
      });

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Work diary API error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env['NODE_ENV'] === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
