import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { cors } from '../../lib/cors';

interface OperationsMetrics {
  servers: {
    total: number;
    online: number;
    warning: number;
    critical: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
  incidents: {
    open: number;
    resolved: number;
    averageTime: number;
    severity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  monitoring: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    availability: number;
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
    const metrics: OperationsMetrics = {
      servers: {
        total: 24,
        online: 23,
        warning: 1,
        critical: 0,
      },
      performance: {
        cpuUsage: 65,
        memoryUsage: 78,
        diskUsage: 45,
        networkUsage: 32,
      },
      incidents: {
        open: 2,
        resolved: 15,
        averageTime: 45,
        severity: {
          low: 8,
          medium: 6,
          high: 3,
          critical: 0,
        },
      },
      monitoring: {
        uptime: 99.95,
        responseTime: 180,
        errorRate: 0.02,
        availability: 99.9,
      },
    };

    const tasks = [
      {
        id: 'ops-001',
        title: 'データベース使用量チェック',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-01-30',
      },
      {
        id: 'ops-002',
        title: 'バックアップ検証実施',
        priority: 'medium',
        status: 'in_progress',
        dueDate: '2025-01-31',
      },
      {
        id: 'ops-003',
        title: 'SSL証明書更新',
        priority: 'low',
        status: 'completed',
        dueDate: '2025-01-29',
      },
    ];

    console.log('✅ Operations metrics fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        metrics,
        tasks,
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch operations metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '運用メトリクスの取得に失敗しました',
    });
  }
};

export default withAuth(handler, {
  requireAuth: true,
  requireVerified: true,
});
