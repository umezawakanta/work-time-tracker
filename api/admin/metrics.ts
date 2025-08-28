import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { requireAdmin } from '../../lib/authAdmin';
// Use existing server models to query real counts
import { connectDB } from '../../src/server/config/database';
import { User } from '../../src/server/models/User';

interface AdminMetrics {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
  };
  system: {
    uptime: number;
    performance: number;
    issues: number;
    capacity: number;
  };
  support: {
    tickets: number;
    satisfaction: number;
    responseTime: number;
    resolved: number;
  };
}

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  assignee?: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const handler = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
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
    // Admin only
    const ctx = requireAdmin(req, res);
    if (!ctx) return;

    // Connect DB and fetch real metrics
    try {
      await connectDB();
    } catch {}
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ status: 'active' });
    const newUsers24h = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Base metrics (keep other fields as placeholders until wired)
    const metrics: AdminMetrics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers24h,
        growth: 0,
      },
      revenue: {
        mrr: 12500000,
        arr: 150000000,
        growth: 18.5,
        churn: 3.2,
      },
      system: {
        uptime: 99.9,
        performance: 87,
        issues: 3,
        capacity: 78,
      },
      support: {
        tickets: 12,
        satisfaction: 4.7,
        responseTime: 2.3,
        resolved: 47,
      },
    };

    const priorityActions: PriorityAction[] = [
      {
        id: 'action-001',
        title: 'サーバー容量監視',
        description: '使用率80%超過時のスケーリング対応',
        priority: 'critical',
        dueDate: '2025-01-30',
        assignee: '運用チーム',
        category: 'インフラ',
        status: 'pending',
      },
      {
        id: 'action-002',
        title: '新規企業契約対応',
        description: 'ABC株式会社との契約条件調整',
        priority: 'high',
        dueDate: '2025-01-31',
        assignee: '営業部',
        category: '契約',
        status: 'in_progress',
      },
      {
        id: 'action-003',
        title: 'セキュリティ監査',
        description: '四半期セキュリティ監査の実施',
        priority: 'medium',
        dueDate: '2025-02-15',
        assignee: 'セキュリティチーム',
        category: 'セキュリティ',
        status: 'pending',
      },
    ];

    console.log('✅ Admin metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        priorityActions,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch admin metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '管理者メトリクスの取得に失敗しました',
    });
  }
};

export default handler;
