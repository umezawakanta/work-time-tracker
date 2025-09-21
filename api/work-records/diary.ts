import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// 日記のスキーマ
const WorkDiarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['1', '2', '3', '4', '5'], default: '3' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);

// JWT認証ヘルパー関数
const verifyJWT = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  try {
    if (req.method === 'GET') {
      // 日記一覧を取得
      const { userId, isPrivate } = req.query;
      
      // JWT認証からユーザーIDを取得（フォールバック）
      let actualUserId = userId;
      if (!actualUserId) {
        const user = verifyJWT(req);
        if (user && user.id) {
          actualUserId = user.id;
          console.log('User ID obtained from JWT token:', actualUserId);
        }
      }
      
      if (!actualUserId) {
        console.warn('User ID not provided in query parameters or JWT token');
        return res.status(400).json({ 
          success: false, 
          message: 'ユーザーIDが必要です' 
        });
      }

      const query: any = { userId: actualUserId };
      if (isPrivate !== undefined) {
        query.isPrivate = isPrivate === 'true';
      }

      const diaries = await WorkDiary.find(query)
        .sort({ date: -1 })
        .limit(50);


      res.status(200).json({
        success: true,
        diaries
      });

    } else if (req.method === 'POST') {
      // 新しい日記を作成
      const { userId, date, title, content, mood, tags, isPrivate } = req.body;

      // JWT認証からユーザーIDを取得（フォールバック）
      let actualUserId = userId;
      if (!actualUserId) {
        const user = verifyJWT(req);
        if (user && user.id) {
          actualUserId = user.id;
          console.log('User ID obtained from JWT token for POST:', actualUserId);
        }
      }

      if (!actualUserId || !date || !title || !content) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています'
        });
      }

      // 日本時間で保存するため、UTC時間に変換
      const jstDate = new Date(date);
      const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
      
      const diary = new WorkDiary({
        userId: actualUserId,
        date: utcDate,
        title,
        content,
        mood: mood || '3',
        tags: tags || [],
        isPrivate: isPrivate !== undefined ? isPrivate : true
      });

      await diary.save();

      res.status(201).json({
        success: true,
        message: '日記が作成されました',
        diary
      });

    } else if (req.method === 'PUT') {
      // 日記を更新
      const { id, userId, date, title, content, mood, tags, isPrivate } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      // JWT認証からユーザーIDを取得（フォールバック）
      let actualUserId = userId;
      if (!actualUserId) {
        const user = verifyJWT(req);
        if (user && user.id) {
          actualUserId = user.id;
          console.log('User ID obtained from JWT token for PUT:', actualUserId);
        }
      }

      const updateData: any = {
        updatedAt: new Date()
      };

      if (date) {
        const jstDate = new Date(date);
        const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
        updateData.date = utcDate;
      }
      if (title) {
        updateData.title = title;
      }
      if (content) {
        updateData.content = content;
      }
      if (mood) {
        updateData.mood = mood;
      }
      if (tags) {
        updateData.tags = tags;
      }
      if (isPrivate !== undefined) {
        updateData.isPrivate = isPrivate;
      }

      // ユーザーIDが提供されている場合は、そのユーザーの日記のみ更新可能にする
      const query: any = { _id: id };
      if (actualUserId) {
        query.userId = actualUserId;
      }

      const diary = await WorkDiary.findOneAndUpdate(
        query,
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
      const { id, userId } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      // JWT認証からユーザーIDを取得（フォールバック）
      let actualUserId = userId;
      if (!actualUserId) {
        const user = verifyJWT(req);
        if (user && user.id) {
          actualUserId = user.id;
          console.log('User ID obtained from JWT token for DELETE:', actualUserId);
        }
      }

      // ユーザーIDが提供されている場合は、そのユーザーの日記のみ削除可能にする
      const query: any = { _id: id };
      if (actualUserId) {
        query.userId = actualUserId;
      }

      const diary = await WorkDiary.findOneAndDelete(query);

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
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Work diary API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
