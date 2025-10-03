import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureDatabaseConnection, verifyJWT, handleError } from '../utils/database.js';
import { ProjectSchema } from '../utils/schemas.js';
// Type definitions are now in comments for reference

dotenv.config();



const Project = (mongoose.models['Project'] as any) || mongoose.model("Project", ProjectSchema);

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

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
    const { userId } = userInfo;

    // プロジェクト一覧を取得
    const projects = await Project.find({ 
      userId,
      isActive: true 
    }).sort({ createdAt: -1 });


    // レスポンスの構築
    const response: ListProjectsResponse = {
      success: true,
      message: 'プロジェクト一覧を取得しました',
      projects: projects.map((project: any) => ({
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
