import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data for implementation tasks
const getMockTasks = (projectId: string) => {
  const now = new Date().toISOString();
  return [
    {
      id: 'task-1',
      title: 'Vercel デプロイメント問題修正',
      description: 'MIME type エラーとAPI接続問題を解決',
      phase: '本番環境修正',
      status: 'in-progress',
      priority: 'high',
      assignee: 'AI Assistant',
      checklist: [
        { id: 'c1', label: 'vercel.json リライトルール修正', completed: true, createdAt: now },
        { id: 'c2', label: 'API エンドポイント作成', completed: true, createdAt: now },
        { id: 'c3', label: '環境別URL設定修正', completed: true, createdAt: now },
      ],
      startDate: now,
      estimatedHours: 3,
      actualHours: 2,
      projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['vercel', 'deployment', 'api'],
      dependencies: [],
      notes: 'localhost接続問題をVercel API エンドポイントで解決',
    },
    {
      id: 'task-2',
      title: 'JavaScript module MIME type エラー修正',
      description: 'Vercel でのJavaScriptファイル配信問題を解決',
      phase: '本番環境修正',
      status: 'completed',
      priority: 'critical',
      assignee: 'AI Assistant',
      checklist: [
        { id: 'c4', label: 'vercel.json rewrite ルール更新', completed: true, createdAt: now },
        { id: 'c5', label: 'static asset ヘッダー設定', completed: true, createdAt: now },
      ],
      startDate: now,
      completedDate: now,
      estimatedHours: 2,
      actualHours: 1,
      projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: ['mime-type', 'javascript', 'vercel'],
      dependencies: [],
      notes: 'リライトルールの regex パターンでアセットファイルを除外',
    },
  ];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const tasks = getMockTasks(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching implementation tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
