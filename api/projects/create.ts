// VercelRequest, VercelResponse types are not needed in CommonJS
import { mongoose, ensureDatabaseConnection, verifyJWT, handleError } from '../utils/database.js';
import { ProjectSchema } from '../utils/schemas.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';
// Type definitions are now in comments for reference

dotenv.config();

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

/**
 * Create project request interface
 * @typedef {Object} CreateProjectRequest
 * @property {string} name - Project name
 * @property {string} [description] - Project description
 * @property {string} [color] - Project color
 */

/**
 * Create project response interface
 * @typedef {Object} CreateProjectResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Response message
 * @property {Object} [project] - Project object if successful
 * @property {string} project.id - Project ID
 * @property {string} project.name - Project name
 * @property {string} [project.description] - Project description
 * @property {string} project.color - Project color
 * @property {boolean} project.isActive - Whether project is active
 * @property {string} [error] - Error message if failed
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

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
    });
    return;
  }

  try {
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { name, description, color = '#3B82F6' } = req.body;

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


    // レスポンスの構築
    const response = {
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
