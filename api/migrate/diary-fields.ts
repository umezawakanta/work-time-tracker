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

// 日記のスキーマ（新しいフィールドを含む）
const WorkDiarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['1', '2', '3', '4', '5'], default: '3' },
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // 既存の日記レコードを取得
    const diaries = await WorkDiary.find({});
    console.log(`Found ${diaries.length} diary records to migrate`);

    let updatedCount = 0;
    const newFields = {
      activities: [],
      workSummary: '',
      achievements: [],
      challenges: [],
      learnings: [],
      nextGoals: [],
      energyLevel: 5,
      stressLevel: 5,
      workHours: 0,
      breakTime: 0,
      productivity: 5,
      notes: '',
      gratitude: '',
      reflection: ''
    };

    // 各日記レコードを更新
    for (const diary of diaries) {
      const updateData = {};
      let needsUpdate = false;

      // 新しいフィールドが存在しない場合は追加
      if (!diary.activities) {
        updateData.activities = newFields.activities;
        needsUpdate = true;
      }
      if (!diary.workSummary) {
        updateData.workSummary = newFields.workSummary;
        needsUpdate = true;
      }
      if (!diary.achievements) {
        updateData.achievements = newFields.achievements;
        needsUpdate = true;
      }
      if (!diary.challenges) {
        updateData.challenges = newFields.challenges;
        needsUpdate = true;
      }
      if (!diary.learnings) {
        updateData.learnings = newFields.learnings;
        needsUpdate = true;
      }
      if (!diary.nextGoals) {
        updateData.nextGoals = newFields.nextGoals;
        needsUpdate = true;
      }
      if (!diary.energyLevel) {
        updateData.energyLevel = newFields.energyLevel;
        needsUpdate = true;
      }
      if (!diary.stressLevel) {
        updateData.stressLevel = newFields.stressLevel;
        needsUpdate = true;
      }
      if (!diary.workHours) {
        updateData.workHours = newFields.workHours;
        needsUpdate = true;
      }
      if (!diary.breakTime) {
        updateData.breakTime = newFields.breakTime;
        needsUpdate = true;
      }
      if (!diary.productivity) {
        updateData.productivity = newFields.productivity;
        needsUpdate = true;
      }
      if (!diary.notes) {
        updateData.notes = newFields.notes;
        needsUpdate = true;
      }
      if (!diary.gratitude) {
        updateData.gratitude = newFields.gratitude;
        needsUpdate = true;
      }
      if (!diary.reflection) {
        updateData.reflection = newFields.reflection;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateData.updatedAt = new Date();
        await WorkDiary.findByIdAndUpdate(diary._id, updateData);
        updatedCount++;
        console.log(`Updated diary ${diary._id}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Migration completed. Updated ${updatedCount} out of ${diaries.length} diary records.`,
      totalRecords: diaries.length,
      updatedRecords: updatedCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
