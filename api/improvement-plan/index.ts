import { NextApiRequest, NextApiResponse } from 'next';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  category: 'ui' | 'architecture' | 'performance' | 'security' | 'ux' | 'devops';
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  estimatedDays: number;
  actualDays?: number;
  assignee?: string;
  dueDate?: string;
  tags: string[];
  dependencies?: string[];
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

// モックデータ
const mockImprovementItems: ImprovementItem[] = [
  {
    id: 'ui-unification',
    title: 'UIライブラリの統一',
    description: 'Material-UI、Radix UI、shadcn-uiを統一し、一貫したデザインシステムを構築',
    category: 'ui',
    priority: 'high',
    status: 'in_progress',
    progress: 30,
    estimatedDays: 14,
    actualDays: 4,
    assignee: 'フロントエンドチーム',
    dueDate: '2025-09-20',
    tags: ['UI', 'Design System', 'shadcn-ui'],
    dependencies: [],
    impact: 'high',
    effort: 'high',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-06T00:00:00Z',
  },
  {
    id: 'folder-restructure',
    title: 'フォルダ構造の再編成',
    description: '機能別モジュール構造への移行とコードの整理',
    category: 'architecture',
    priority: 'high',
    status: 'planned',
    progress: 0,
    estimatedDays: 21,
    assignee: 'アーキテクチャチーム',
    dueDate: '2025-10-10',
    tags: ['Architecture', 'Code Organization', 'Monorepo'],
    dependencies: ['ui-unification'],
    impact: 'high',
    effort: 'high',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'performance-optimization',
    title: 'パフォーマンス最適化',
    description: 'バンドルサイズの削減、レンダリング最適化、キャッシュ戦略の実装',
    category: 'performance',
    priority: 'medium',
    status: 'planned',
    progress: 0,
    estimatedDays: 10,
    assignee: 'パフォーマンスチーム',
    dueDate: '2025-10-01',
    tags: ['Performance', 'Bundle Size', 'Optimization'],
    dependencies: ['ui-unification'],
    impact: 'medium',
    effort: 'medium',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'security-hardening',
    title: 'セキュリティ強化',
    description: '認証・認可の改善、データ保護の強化、セキュリティ監査の実施',
    category: 'security',
    priority: 'high',
    status: 'planned',
    progress: 0,
    estimatedDays: 14,
    assignee: 'セキュリティチーム',
    dueDate: '2025-09-25',
    tags: ['Security', 'Authentication', 'Data Protection'],
    dependencies: [],
    impact: 'high',
    effort: 'medium',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'mobile-optimization',
    title: 'モバイル最適化',
    description: 'レスポンシブデザインの改善、モバイル専用機能の追加',
    category: 'ux',
    priority: 'medium',
    status: 'planned',
    progress: 0,
    estimatedDays: 7,
    assignee: 'UXチーム',
    dueDate: '2025-09-30',
    tags: ['Mobile', 'Responsive', 'UX'],
    dependencies: ['ui-unification'],
    impact: 'medium',
    effort: 'medium',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'testing-framework',
    title: 'テストフレームワークの整備',
    description: '単体テスト、統合テスト、E2Eテストの包括的なテストスイート構築',
    category: 'devops',
    priority: 'medium',
    status: 'in_progress',
    progress: 15,
    estimatedDays: 12,
    actualDays: 2,
    assignee: 'QAチーム',
    dueDate: '2025-10-05',
    tags: ['Testing', 'Quality Assurance', 'Automation'],
    dependencies: [],
    impact: 'medium',
    effort: 'high',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-06T00:00:00Z',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // クエリパラメータの処理
        const { category, status, priority, search } = req.query;

        let filteredItems = [...mockImprovementItems];

        // カテゴリでフィルタリング
        if (category && typeof category === 'string') {
          filteredItems = filteredItems.filter((item) => item.category === category);
        }

        // ステータスでフィルタリング
        if (status && typeof status === 'string') {
          filteredItems = filteredItems.filter((item) => item.status === status);
        }

        // 優先度でフィルタリング
        if (priority && typeof priority === 'string') {
          filteredItems = filteredItems.filter((item) => item.priority === priority);
        }

        // 検索でフィルタリング
        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.title.toLowerCase().includes(searchLower) ||
              item.description.toLowerCase().includes(searchLower) ||
              item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        res.status(200).json({
          success: true,
          data: filteredItems,
          total: filteredItems.length,
        });
        break;

      case 'POST':
        // 新しい改善項目の作成
        const newItem: ImprovementItem = {
          id: `item-${Date.now()}`,
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockImprovementItems.push(newItem);

        res.status(201).json({
          success: true,
          data: newItem,
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Improvement plan API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
