import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  if (req.method === 'GET') {
    try {
      // デモプロジェクトデータ
      const projects: ProjectHubProject[] = [
        {
          id: 'proj-mvp',
          name: 'MVP機能完成',
          description: '勤怠管理アプリとして必要最低限の機能を実装',
          type: 'improvement',
          status: 'active',
          priority: 'high',
          phase: 'phase0',
          startDate: '2024-02-01',
          endDate: '2024-02-21',
          estimatedDays: 20,
          actualDays: 5,
          progress: 85,
          milestones: [
            {
              id: 'ms-1',
              title: 'リアルタイム打刻機能完成',
              description: 'ワンクリック出勤・退勤機能の実装',
              dueDate: '2024-02-07',
              completed: true,
              dependencies: [],
              deliverables: ['打刻コンポーネント', 'API実装', 'テスト'],
            },
            {
              id: 'ms-2',
              title: '認証システム実装完成',
              description: 'JWT認証、ユーザー登録、データベース統合',
              dueDate: '2024-02-14',
              completed: true,
              dependencies: ['ms-1'],
              deliverables: ['認証API', 'データベース設計', 'セキュリティ実装'],
            },
            {
              id: 'ms-3',
              title: '課金システム統合完成',
              description: 'Stripe課金システムとサブスクリプション管理',
              dueDate: '2024-02-21',
              completed: true,
              dependencies: ['ms-2'],
              deliverables: ['Stripe統合', 'プラン管理', '決済処理'],
            },
          ],
          improvementItemId: 'production-system',
          wbsProjectId: 'wbs-proj-1',
          wbsNodes: ['wbs-node-1', 'wbs-node-2'],
          todoIds: ['todo-1', 'todo-2', 'todo-3'],
          category: 'feature',
          tags: ['production', 'authentication', 'payment'],
          assignees: ['system', 'ai-assistant'],
          dependencies: [],
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
        },
      ];

      return res.status(200).json({
        success: true,
        data: projects,
        message: 'Projects loaded successfully',
      });
    } catch (error) {
      console.error('Error loading projects:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to load projects',
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    message: 'Only GET method is supported',
  });
}
