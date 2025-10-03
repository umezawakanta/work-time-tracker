import { mongoose: mongooseInstance } from '../utils/database.js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

// バージョン情報のスキーマ
const VersionSchema = new mongooseInstance.Schema(
  {
    version: { type: String, required: true },
    buildId: { type: String, required: true },
    buildDate: { type: String, required: true },
    isLatest: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Version = mongooseInstance.models.Version || mongooseInstance.model("Version", VersionSchema);

// データベース接続確認
const ensureDatabaseConnection = async () => {
  const isConnected = mongooseInstance.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[version/check] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      return;
    }

    // 接続タイムアウトを短縮してより早くフォールバックに移行
    await mongooseInstance.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000, // 5秒に短縮
      socketTimeoutMS: 10000, // 10秒に短縮
      connectTimeoutMS: 5000, // 5秒に短縮
      bufferCommands: false,
      maxIdleTimeMS: 10000,
    });
    
    console.log('[version/check] Database connected successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[version/check] Database connection failed:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // VercelのAPIルートでは、クエリパラメータをURLから直接取得する必要がある
    const url = new URL(req.url, `http://${req.headers.host}`);
    const version = url.searchParams.get('version');
    const buildId = url.searchParams.get('buildId');

    console.log('[version/check] Received parameters:', { version, buildId });

    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Version parameter is required'
      });
    }

    // データベース接続を試行
    let databaseConnected = false;
    try {
      await ensureDatabaseConnection();
      databaseConnected = true;
    } catch (dbError) {
      console.warn('[version/check] Database connection failed, using fallback response:', dbError.message);
    }

    // データベースが利用可能な場合のみバージョン比較を実行
    if (databaseConnected) {
      try {
        // 最新バージョンを取得
        const latestVersion = await Version.findOne({ isLatest: true }).sort({ createdAt: -1 });
        
        if (!latestVersion) {
          // 最新バージョンが存在しない場合は、現在のバージョンを最新として登録
          const currentVersion = new Version({
            version: version,
            buildId: buildId || `build-${Date.now()}`,
            buildDate: new Date().toISOString(),
            isLatest: true
          });
          
          await currentVersion.save();
          
          return res.status(200).json({
            success: true,
            hasUpdate: false,
            currentVersion: version,
            latestVersion: version,
            message: 'Version registered as latest'
          });
        }

        // バージョン比較
        const hasUpdate = compareVersions(version, latestVersion.version) < 0;

        return res.status(200).json({
          success: true,
          hasUpdate,
          currentVersion: version,
          latestVersion: latestVersion.version,
          latestBuildId: latestVersion.buildId,
          latestBuildDate: latestVersion.buildDate
        });
      } catch (dbOperationError) {
        console.warn('[version/check] Database operation failed, using fallback response:', dbOperationError.message);
      }
    }

    // データベースが利用できない場合のフォールバック応答
    return res.status(200).json({
      success: true,
      hasUpdate: false,
      currentVersion: version,
      latestVersion: version,
      message: 'Database unavailable, assuming current version is latest',
      fallback: true
    });

  } catch (error) {
    console.error('[version/check] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// バージョン比較関数
function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) {
      return 1;
    }
    if (v1part < v2part) {
      return -1;
    }
  }
  
  return 0;
}
