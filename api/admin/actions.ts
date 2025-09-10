import { VercelRequest, VercelResponse } from '@vercel/node';

interface AdminAction {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'users' | 'revenue' | 'system' | 'support';
  deadline?: string;
  assignee?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    console.log('[admin/actions] Starting request');

    // 管理者認証
    const ctx = await import('../_lib/user-context.js');
    console.log('[admin/actions] Context loaded');

    const auth = await ctx.verifyJwtAndExtract(req as any);
    console.log('[admin/actions] Auth verified:', { userId: auth?.userId });

    // 管理者権限チェック
    const User = await ctx.ensureDbAndUserModel();
    console.log('[admin/actions] User model ensured');

    const user = await ctx.findUserByIdLoose(User, auth.userId);
    console.log('[admin/actions] User found:', {
      user: user ? { id: user._id, role: user.role } : null,
    });

    if (!user || user.role !== 'admin') {
      return void res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // 優先アクションのスタブデータ
    const actions: AdminAction[] = [
      {
        id: 'act-1',
        title: 'データベース最適化',
        description: 'ユーザー増加に伴うクエリパフォーマンスの最適化',
        urgency: 'high',
        category: 'system',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        assignee: 'admin',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'act-2',
        title: 'セキュリティ監査',
        description: '認証システムとAPIエンドポイントのセキュリティ監査',
        urgency: 'medium',
        category: 'system',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        assignee: 'admin',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    res.status(200).json({
      success: true,
      actions,
      summary: {
        total: actions.length,
        byUrgency: actions.reduce(
          (acc, action) => {
            acc[action.urgency] = (acc[action.urgency] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        byCategory: actions.reduce(
          (acc, action) => {
            acc[action.category] = (acc[action.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin actions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
