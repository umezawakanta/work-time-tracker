// VercelRequest, VercelResponse types are not needed in CommonJS
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { ProjectSchema } = require('../utils/schemas');
// Type definitions are now in comments for reference

dotenv.config();



const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

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
    return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
  }

  try {
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // JWTトークンを検証してユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }
    const userId = userInfo.userId;

    // プロジェクト一覧を取得
    const projects = await Project.find({ 
      userId,
      isActive: true 
    }).sort({ createdAt: -1 });


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
    return handleError(res, error, 'プロジェクト一覧取得中にエラーが発生しました');
  }
}
