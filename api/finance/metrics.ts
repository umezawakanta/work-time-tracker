import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

interface FinanceMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    recurring: number;
  };
  expenses: {
    current: number;
    budget: number;
    categories: { [key: string]: number };
    variance: number;
  };
  billing: {
    outstanding: number;
    overdue: number;
    processed: number;
    disputes: number;
  };
  cash: {
    balance: number;
    inflow: number;
    outflow: number;
    forecast: number;
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
    const metrics: FinanceMetrics = {
      revenue: {
        current: 2450000,
        previous: 2180000,
        growth: 12.4,
        recurring: 1980000,
      },
      expenses: {
        current: 1650000,
        budget: 1800000,
        categories: {
          人件費: 950000,
          インフラ: 280000,
          マーケティング: 220000,
          その他: 200000,
        },
        variance: -8.3,
      },
      billing: {
        outstanding: 580000,
        overdue: 120000,
        processed: 1870000,
        disputes: 3,
      },
      cash: {
        balance: 3200000,
        inflow: 2450000,
        outflow: 1650000,
        forecast: 4000000,
      },
    };

    const invoices = [
      {
        id: 'inv-001',
        customer: 'ABC株式会社',
        amount: 580000,
        status: 'sent',
        dueDate: '2025-02-15',
        issueDate: '2025-01-15',
        description: 'エンタープライズプラン月額利用料',
      },
      {
        id: 'inv-002',
        customer: 'XYZ商事',
        amount: 120000,
        status: 'overdue',
        dueDate: '2025-01-31',
        issueDate: '2025-01-01',
        description: 'ベーシックプラン月額利用料',
      },
      {
        id: 'inv-003',
        customer: 'DEF技研',
        amount: 350000,
        status: 'paid',
        dueDate: '2025-02-28',
        issueDate: '2025-01-28',
        description: 'プレミアムプラン初期費用',
        paymentMethod: 'bank_transfer',
      },
    ];

    const expenses = [
      {
        id: 'exp-001',
        description: 'AWS インフラ利用料',
        amount: 45000,
        category: 'インフラ',
        date: '2025-01-29',
        status: 'approved',
        approver: '経理部長',
      },
      {
        id: 'exp-002',
        description: 'マーケティング広告費',
        amount: 180000,
        category: 'マーケティング',
        date: '2025-01-28',
        status: 'pending',
      },
      {
        id: 'exp-003',
        description: 'オフィス賃料',
        amount: 250000,
        category: 'その他',
        date: '2025-01-27',
        status: 'paid',
        approver: '総務部',
      },
    ];

    const taxTasks = [
      {
        id: 'tax-001',
        title: '消費税申告（1月分）',
        type: 'monthly',
        dueDate: '2025-02-28',
        status: 'pending',
        amount: 98000,
        priority: 'high',
      },
      {
        id: 'tax-002',
        title: '法人税四半期予定納税',
        type: 'quarterly',
        dueDate: '2025-03-31',
        status: 'in-progress',
        amount: 450000,
        priority: 'critical',
      },
      {
        id: 'tax-003',
        title: '源泉所得税納付',
        type: 'monthly',
        dueDate: '2025-02-10',
        status: 'completed',
        amount: 125000,
        priority: 'medium',
      },
    ];

    console.log('✅ Finance metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        invoices,
        expenses,
        taxTasks,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch finance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '財務メトリクスの取得に失敗しました',
    });
  }
};

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: true,
});
