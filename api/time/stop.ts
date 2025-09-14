import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// データベース接続の確認と接続
const ensureDatabaseConnection = async (): Promise<void> => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[time/stop] Database not connected, attempting to connect...');
  try {
    const { connectDB } = await import('../../src/server/config/database.ts');
    await connectDB();
    console.log('[time/stop] Database connection established');
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
