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

// 機能設定のスキーマ
const UserSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  featureOrder: { 
    type: [String], 
    default: [
      'time-tracking',
      'projects', 
      'reports',
      'admin-panel',
      'bookshelf',
      'memos',
      'public-memos',
      'work-records'
    ]
  },
  hiddenFeatures: { 
    type: [String], 
    default: [] 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);

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
      // ユーザー設定を取得
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ユーザーIDが必要です' 
        });
      }

      let settings = await UserSettings.findOne({ userId });
      
      // 設定が存在しない場合はデフォルト設定を作成
      if (!settings) {
        settings = new UserSettings({ userId });
        await settings.save();
      }

      res.status(200).json({
        success: true,
        settings
      });

    } else if (req.method === 'PUT') {
      // ユーザー設定を更新
      const { userId, featureOrder, hiddenFeatures } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ユーザーIDが必要です'
        });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (featureOrder) updateData.featureOrder = featureOrder;
      if (hiddenFeatures !== undefined) updateData.hiddenFeatures = hiddenFeatures;

      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: '設定が更新されました',
        settings
      });

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('User settings API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
