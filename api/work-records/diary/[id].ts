import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
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

const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

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

      const updateData = {
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
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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
