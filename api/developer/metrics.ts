import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

interface DeveloperMetrics {
  code: {
    totalLines: number;
    commits: number;
    pullRequests: number;
    coverage: number;
  };
  quality: {
    bugs: number;
    codeSmells: number;
    vulnerabilities: number;
    technicalDebt: number;
  };
  performance: {
    buildTime: number;
    deployTime: number;
    testTime: number;
    successRate: number;
  };
  team: {
    velocity: number;
    burndown: number;
    capacity: number;
    efficiency: number;
  };
}

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const metrics: DeveloperMetrics = {
      code: {
        totalLines: 125000,
        commits: 1247,
        pullRequests: 89,
        coverage: 87,
      },
      quality: {
        bugs: 12,
        codeSmells: 45,
        vulnerabilities: 3,
        technicalDebt: 2.5,
      },
      performance: {
        buildTime: 4.2,
        deployTime: 1.8,
        testTime: 2.1,
        successRate: 94.5,
      },
      team: {
        velocity: 42,
        burndown: 78,
        capacity: 85,
        efficiency: 92,
      },
    };

    const tasks = [
      {
        id: 'dev-001',
        title: 'クリティカルバグ修正',
        description: 'ユーザー認証でタイムアウトエラー',
        priority: 'critical',
        status: 'in_progress',
        assignee: '田中エンジニア',
        dueDate: '2025-01-30',
      },
      {
        id: 'dev-002',
        title: 'PR #123 レビュー',
        description: '決済システムのリファクタリング',
        priority: 'high',
        status: 'pending',
        assignee: '佐藤シニア',
        dueDate: '2025-01-31',
      },
      {
        id: 'dev-003',
        title: 'テストカバレッジ向上',
        description: 'APIテストの追加実装',
        priority: 'medium',
        status: 'pending',
        assignee: '山田エンジニア',
        dueDate: '2025-02-05',
      },
    ];

    const pullRequests = [
      {
        id: 123,
        title: '決済システムのリファクタリング',
        status: 'open',
        author: '田中エンジニア',
        createdAt: '2025-01-28',
        reviewers: ['佐藤シニア', '山田エンジニア'],
        priority: 'high',
      },
      {
        id: 124,
        title: 'ダッシュボードUI改善',
        status: 'review',
        author: '鈴木デザイナー',
        createdAt: '2025-01-29',
        reviewers: ['田中エンジニア'],
        priority: 'medium',
      },
    ];

    console.log('✅ Developer metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        tasks,
        pullRequests,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch developer metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '開発メトリクスの取得に失敗しました',
    });
  }
};

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: true,
});
