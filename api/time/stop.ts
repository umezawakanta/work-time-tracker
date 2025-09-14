// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[time/stop] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    // テスト環境などでMongoDBを無効化する場合
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    // 接続オプションを追加してタイムアウトと再接続を最適化
    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10, // 接続プールサイズ
      serverSelectionTimeoutMS: 15000, // サーバー選択タイムアウト (15秒)
      socketTimeoutMS: 45000, // ソケットタイムアウト
      bufferCommands: false, // コマンドバッファリング無効化
      connectTimeoutMS: 10000, // 接続タイムアウト
      maxIdleTimeMS: 30000, // 最大アイドル時間
    });

    console.log("✅ MongoDB connected successfully");

    // 接続状態の監視
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[time/stop] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// TimeEntry スキーマ
const TimeEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // 秒単位
  project: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TimeEntry = mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // データベース接続確認
    await ensureDatabaseConnection();

    // 認証チェック
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[time/stop] JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error('[time/stop] JWT verification failed:', jwtError);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { entryId } = req.body;
    if (!entryId || typeof entryId !== 'string') {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    // 時間記録を検索
    const timeEntry = await TimeEntry.findOne({
      _id: entryId,
      userId: decoded.userId,
      endTime: { $exists: false }
    });

    if (!timeEntry) {
      return res.status(404).json({ 
        success: false, 
        message: 'アクティブな時間記録が見つかりません' 
      });
    }

    // 終了時間と経過時間を計算
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 1000);

    // 時間記録を更新
    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.updatedAt = new Date();
    
    await timeEntry.save();

    console.log('[time/stop] Time entry stopped:', timeEntry._id, 'Duration:', duration);

    return res.status(200).json({
      success: true,
      message: '時間記録を停止しました',
      entry: {
        id: timeEntry._id,
        description: timeEntry.description,
        startTime: timeEntry.startTime,
        endTime: timeEntry.endTime,
        duration: timeEntry.duration,
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[time/stop] Error:', message);
    return res.status(500).json({ 
      success: false, 
      message: `時間記録の停止に失敗しました: ${message}` 
    });
  }
}