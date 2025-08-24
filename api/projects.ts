import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from '../src/server/config/database';
import { Project as ProjectModel } from '../src/server/models/Project';

interface ProjectHubProject {
  id: string;
  name: string;
  description: string;
  type: 'improvement' | 'feature' | 'maintenance';
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  phase: 'phase0' | 'phase1' | 'phase2' | 'phase3';
  startDate: string;
  endDate: string;
  estimatedDays: number;
  actualDays: number;
  progress: number;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    dependencies: string[];
    deliverables: string[];
  }>;
  improvementItemId: string;
  wbsProjectId: string;
  wbsNodes: string[];
  todoIds: string[];
  category: string;
  tags: string[];
  assignees: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

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
      error: 'Method not allowed',
      message: 'Only GET method is supported',
    });
  }

  try {
    // 認証ヘッダーからユーザーを判定
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    let userId: string | null = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback-secret-for-development',
          { issuer: 'work-time-tracker', audience: 'work-time-tracker-users' }
        );
        userId = decoded.userId || decoded.sub || null;
      } catch (e) {
        // トークン不正でも続行（全体/公開プロジェクトにフォールバック）
        userId = null;
      }
    }

    // DB接続を試行
    let dbConnected = true;
    try {
      await connectDB();
    } catch (e) {
      dbConnected = false;
    }

    if (!dbConnected) {
      // DB未接続: 実データは返せないため空配列（モックは返さない）
      return res
        .status(200)
        .json({ success: true, data: [], message: 'DB未接続（プレビュー環境）' });
    }

    // ユーザーに紐づくプロジェクトを取得（userIdがなければ全件の上位N件）
    const query: any = userId ? { userId } : {};
    const docs = await ProjectModel.find(query).sort({ updatedAt: -1 }).limit(100);

    const projects: ProjectHubProject[] = docs.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: '',
      type: 'feature',
      status: 'active',
      priority: 'medium',
      phase: 'phase0',
      startDate: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
      endDate: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)).toISOString(),
      estimatedDays: 0,
      actualDays: 0,
      progress: 0,
      milestones: [],
      improvementItemId: '',
      wbsProjectId: '',
      wbsNodes: [],
      todoIds: [],
      category: 'feature',
      tags: [],
      assignees: [p.userId],
      dependencies: [],
      createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
      updatedAt: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt)).toISOString(),
      createdBy: p.userId,
    }));

    return res.status(200).json({ success: true, data: projects, message: 'Projects loaded' });
  } catch (error) {
    console.error('Error loading projects:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to load projects',
    });
  }
}
