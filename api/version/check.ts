const { mongoose: mongooseInstance } = require('../utils/database');
const dotenv = require('dotenv');

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

    await mongooseInstance.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[version/check] Database connection failed:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

module.exports = async function handler(req, res) {
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
    await ensureDatabaseConnection();

    const { version, buildId } = req.query;

    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Version parameter is required'
      });
    }

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

  } catch (error) {
    console.error('[version/check] Error:', error);
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
