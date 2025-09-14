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
  console.warn('[reports/summary] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[reports/summary] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// TimeEntry document interface
interface TimeEntryDocument extends mongoose.Document {
  id: string;
  userId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// TimeEntry schema
const TimeEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    projectId: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Virtual for time entry ID
TimeEntrySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
TimeEntrySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, ...cleanRet } = ret;
    return cleanRet;
  },
});

const TimeEntry = mongoose.model<TimeEntryDocument>("TimeEntry", TimeEntrySchema);

// Summary report response interface
interface SummaryReportResponse {
  success: boolean;
  message: string;
  summary?: {
    totalTime: number;
    totalEntries: number;
    averageSessionTime: number;
    todayTime: number;
    thisWeekTime: number;
    thisMonthTime: number;
    projectBreakdown: Array<{
      projectId: string;
      projectName: string;
      totalTime: number;
      entryCount: number;
    }>;
  };
  error?: string;
}

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    } as SummaryReportResponse);
    return;
  }

  try {
    console.log('📊 Summary report request started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // ユーザーIDの取得（認証トークンから）
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      } as SummaryReportResponse);
    }

    // JWTトークンを検証してユーザーIDを取得
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    let userId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, jwtSecret) as any;
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '無効な認証トークンです',
        error: 'Invalid authentication token',
      } as SummaryReportResponse);
    }

    // 日付範囲の計算
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 時間記録を取得
    const allEntries = await TimeEntry.find({ 
      userId,
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const todayEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: today },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const weekEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: weekStart },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    const monthEntries = await TimeEntry.find({ 
      userId,
      startTime: { $gte: monthStart },
      endTime: { $exists: true },
      duration: { $exists: true }
    });

    // 統計計算
    const totalTime = allEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalEntries = allEntries.length;
    const averageSessionTime = totalEntries > 0 ? Math.round(totalTime / totalEntries) : 0;
    const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const thisWeekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const thisMonthTime = monthEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    // プロジェクト別集計
    const projectBreakdown = allEntries.reduce((acc, entry) => {
      const projectId = entry.projectId || 'no-project';
      const projectName = projectId === 'no-project' ? 'プロジェクト未設定' : `プロジェクト ${projectId}`;
      
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName,
          totalTime: 0,
          entryCount: 0,
        };
      }
      
      acc[projectId].totalTime += entry.duration || 0;
      acc[projectId].entryCount += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const projectBreakdownArray = Object.values(projectBreakdown);

    console.log('✅ Summary report generated:', {
      totalTime,
      totalEntries,
      userId,
    });

    // レスポンスの構築
    const response: SummaryReportResponse = {
      success: true,
      message: 'サマリーレポートを生成しました',
      summary: {
        totalTime,
        totalEntries,
        averageSessionTime,
        todayTime,
        thisWeekTime,
        thisMonthTime,
        projectBreakdown: projectBreakdownArray,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Summary report error:', error);

    res.status(500).json({
      success: false,
      message: 'サマリーレポート生成中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as SummaryReportResponse);
  }
}
