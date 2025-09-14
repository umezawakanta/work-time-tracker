import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Database already connected');
      return;
    }
    
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
    console.log('Database connected successfully');
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
  mood: { type: String, enum: ['😊', '😐', '😔', '😤', '😴', '🤔', '😍', '😢'], default: '😊' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);

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
      
      console.log('Diary API - GET request, userId:', userId);
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ユーザーIDが必要です' 
        });
      }

      const query = { userId };
      if (isPrivate !== undefined) {
        query.isPrivate = isPrivate === 'true';
      }

      const diaries = await WorkDiary.find(query)
        .sort({ date: -1 })
        .limit(50);

      console.log('Diaries found:', diaries.length);

      res.status(200).json({
        success: true,
        diaries
      });

    } else if (req.method === 'POST') {
      // 新しい日記を作成
      const { userId, date, title, content, mood, tags, isPrivate } = req.body;

      if (!userId || !date || !title || !content) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています'
        });
      }

      const diary = new WorkDiary({
        userId,
        date: new Date(date),
        title,
        content,
        mood: mood || '😊',
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
      const { id, date, title, content, mood, tags, isPrivate } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (date) updateData.date = new Date(date);
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (mood) updateData.mood = mood;
      if (tags) updateData.tags = tags;
      if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

      const diary = await WorkDiary.findByIdAndUpdate(
        id,
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
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      const diary = await WorkDiary.findByIdAndDelete(id);

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
