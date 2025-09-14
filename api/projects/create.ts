import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async (): Promise<void> => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[projects/create] Database not connected, attempting to connect...');
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
    console.error('[projects/create] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Project document interface
interface ProjectDocument extends mongoose.Document {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

// Create project request interface
interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

// Create project response interface
interface CreateProjectResponse {
  success: boolean;
  message: string;
  project?: {
    id: string;
    name: string;
    description?: string;
    color: string;
    isActive: boolean;
  };
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    } as CreateProjectResponse);
    return;
  }

  try {
    console.log('📝 Project creation started');
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { name, description, color = '#3b82f6' }: CreateProjectRequest = req.body;

    // 必須フィールドの検証
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'プロジェクト名が必要です',
        error: 'Project name is required',
      } as CreateProjectResponse);
    }

    // ユーザーIDの取得（認証トークンから）
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      } as CreateProjectResponse);
    }

    // 簡単なユーザーID取得（実際の実装ではJWTトークンを検証）
    const userId = 'user_' + Date.now(); // 仮のユーザーID

    // 新しいプロジェクトを作成
    const newProject = new Project({
      name: name.trim(),
      description: description?.trim(),
      color,
      userId,
      isActive: true,
    });

    await newProject.save();

    console.log('✅ Project creation successful:', {
      projectId: newProject.id,
      name: newProject.name,
    });

    // レスポンスの構築
    const response: CreateProjectResponse = {
      success: true,
      message: 'プロジェクトが作成されました',
      project: {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        isActive: newProject.isActive,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Project creation error:', error);

    res.status(500).json({
      success: false,
      message: 'プロジェクト作成中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    } as CreateProjectResponse);
  }
}
