import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

interface SalesMetrics {
  revenue: {
    monthly: number;
    target: number;
    achievement: number;
    growth: number;
  };
  pipeline: {
    value: number;
    deals: number;
    conversion: number;
    forecast: number;
  };
  leads: {
    total: number;
    qualified: number;
    contacted: number;
    converted: number;
  };
  customers: {
    total: number;
    active: number;
    churn: number;
    satisfaction: number;
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
    const metrics: SalesMetrics = {
      revenue: {
        monthly: 8500000,
        target: 10000000,
        achievement: 85,
        growth: 15.2,
      },
      pipeline: {
        value: 25000000,
        deals: 47,
        conversion: 23.5,
        forecast: 18500000,
      },
      leads: {
        total: 156,
        qualified: 89,
        contacted: 67,
        converted: 23,
      },
      customers: {
        total: 234,
        active: 198,
        churn: 3.2,
        satisfaction: 4.6,
      },
    };

    const deals = [
      {
        id: 'deal-001',
        company: 'XYZ商事株式会社',
        value: 2400000,
        stage: 'negotiation',
        probability: 75,
        closeDate: '2025-02-15',
        assignee: '営業1課',
        priority: 'high',
        status: 'active',
      },
      {
        id: 'deal-002',
        company: 'ABC株式会社',
        value: 1800000,
        stage: 'proposal',
        probability: 60,
        closeDate: '2025-02-28',
        assignee: '営業2課',
        priority: 'medium',
        status: 'follow_up',
      },
      {
        id: 'deal-003',
        company: 'DEF技研',
        value: 3500000,
        stage: 'qualified',
        probability: 40,
        closeDate: '2025-03-15',
        assignee: '営業1課',
        priority: 'high',
        status: 'active',
      },
    ];

    const activities = [
      {
        id: 'activity-001',
        title: 'XYZ商事価格交渉',
        description: '最終提案への回答期限',
        priority: 'critical',
        dueDate: '2025-01-30',
        status: 'pending',
        assignee: '営業1課',
      },
      {
        id: 'activity-002',
        title: 'ABC株式会社フォローアップ',
        description: '提案書への質問対応',
        priority: 'high',
        dueDate: '2025-01-31',
        status: 'in_progress',
        assignee: '営業2課',
      },
      {
        id: 'activity-003',
        title: '新規リード3件面談設定',
        description: '今週の初回面談スケジュール',
        priority: 'medium',
        dueDate: '2025-02-07',
        status: 'pending',
        assignee: '営業企画',
      },
    ];

    console.log('✅ Sales metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        deals,
        activities,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch sales metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '営業メトリクスの取得に失敗しました',
    });
  }
};

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: true,
});
