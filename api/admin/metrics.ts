interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, unknown>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

interface AdminUsersMetrics {
  total: number;
  active: number;
  newToday: number;
  churnRate: number;
}

interface AdminRevenueMetrics {
  mrr: number;
  arr: number;
  todayRevenue: number;
  conversionRate: number;
}

interface AdminSystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

interface AdminSupportMetrics {
  openTickets: number;
  avgResponseTime: string;
  satisfaction: number;
}

interface AdminMetricsPayload {
  users: AdminUsersMetrics;
  revenue: AdminRevenueMetrics;
  system: AdminSystemMetrics;
  support: AdminSupportMetrics;
}

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'users' | 'revenue' | 'system' | 'support';
  deadline?: string;
  assignee?: string;
  completed: boolean;
}

function numberInRange(min: number, max: number): number {
  return Math.round(min + (max - min) * 0.42);
}

function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const users: AdminUsersMetrics = {
    total: 1234,
    active: 321,
    newToday: 12,
    churnRate: 2.1,
  };
  const revenue: AdminRevenueMetrics = {
    mrr: 845000,
    arr: 845000 * 12,
    todayRevenue: 12000,
    conversionRate: 3.4,
  };
  const system: AdminSystemMetrics = {
    uptime: 99.9,
    responseTime: numberInRange(80, 120),
    errorRate: 0.2,
    activeConnections: 57,
  };
  const support: AdminSupportMetrics = {
    openTickets: 3,
    avgResponseTime: '2h',
    satisfaction: 4.6,
  };

  const priorityActions: PriorityAction[] = [
    {
      id: 'act-1',
      title: '本番 Stripe 公開鍵の再確認',
      description: 'ビルド時注入とランタイム読込いずれも動作するか検証',
      urgency: 'high',
      category: 'revenue',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      assignee: 'admin',
      completed: false,
    },
    {
      id: 'act-2',
      title: 'MongoDB URI の監視',
      description: 'SRV/DB名/クエリパラメータの整合性を監視',
      urgency: 'medium',
      category: 'system',
      completed: false,
    },
  ];

  const metrics: AdminMetricsPayload = { users, revenue, system, support };

  res.status(200).json({ metrics, priorityActions });
}

module.exports = handler;
