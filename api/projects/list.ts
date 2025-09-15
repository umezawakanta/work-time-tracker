// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ProjectDocument } = require('../utils/types');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[projects/list] Database not connected, attempting to connect...');
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
    console.error('[projects/list] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};


// Project schema
const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#3b82f6' },
    userId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Virtual for project ID
ProjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
ProjectSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    const { _id, __v, ...cleanRet } = ret;
    return cleanRet;
  },
});

const Project = mongoose.model<ProjectDocument>("Project", ProjectSchema);

// List projects response interface
interface ListProjectsResponse {
  success: boolean;
  message: string;
  projects?: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
    isActive: boolean;
    createdAt: string;
  }>;
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
    } as ListProjectsResponse);
    return;
  }

  try {
    console.log('📋 Project list request started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // ユーザーIDの取得（認証トークンから）
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      } as ListProjectsResponse);
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
      } as ListProjectsResponse);
    }

    // プロジェクト一覧を取得
    const projects = await Project.find({ 
      userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log('✅ Project list retrieved:', {
      count: projects.length,
      userId,
    });

    // レスポンスの構築
    const response: ListProjectsResponse = {
      success: true,
      message: 'プロジェクト一覧を取得しました',
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        isActive: project.isActive,
        createdAt: project.createdAt.toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Project list error:', error);

    res.status(500).json({
      success: false,
      message: 'プロジェクト一覧取得中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as ListProjectsResponse);
  }
}
