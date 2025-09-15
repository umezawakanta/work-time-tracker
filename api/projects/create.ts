// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { ProjectSchema } = require('../utils/schemas');
// Type definitions are now in comments for reference

dotenv.config();

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

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

module.exports = async function handler(req, res) {
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
    
    const { name, description, color = '#3B82F6' }: CreateProjectRequest = req.body;

    // 必須フィールドの検証
    if (!name || !name.trim()) {
      return handleError(res, { statusCode: 400, message: 'プロジェクト名が必要です' });
    }

    // JWTトークンを検証してユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }
    const userId = userInfo.userId;

    // 新しいプロジェクトを作成
    const newProject = new Project({
      name: name.trim(),
      description: description && description.trim(),
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
    return handleError(res, error, 'プロジェクト作成中にエラーが発生しました');
  }
}
