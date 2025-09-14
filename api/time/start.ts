import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async (): Promise<void> => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[time/start] Database not connected, attempting to connect...');
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
    console.error('[time/start] Failed to connect to database:', message);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      console.error('[time/start] JWT_SECRET not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error('[time/start] JWT verification failed:', jwtError);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { description } = req.body;
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    // 既存のアクティブな記録をチェック
    const existingEntry = await TimeEntry.findOne({
      userId: decoded.userId,
      endTime: { $exists: false }
    });

    if (existingEntry) {
      return res.status(400).json({ 
        success: false, 
        message: '既に時間記録が進行中です。先に現在の記録を停止してください。' 
      });
    }

    // 新しい時間記録を作成
    const timeEntry = new TimeEntry({
      userId: decoded.userId,
      description: description.trim(),
      startTime: new Date(),
    });

    await timeEntry.save();

    console.log('[time/start] Time entry created:', timeEntry._id);

    return res.status(200).json({
      success: true,
      message: '時間記録を開始しました',
      entry: {
        id: timeEntry._id,
        description: timeEntry.description,
        startTime: timeEntry.startTime,
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[time/start] Error:', message);
    return res.status(500).json({ 
      success: false, 
      message: `時間記録の開始に失敗しました: ${message}` 
    });
  }
}