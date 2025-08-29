import { USE_MOCK_DATA } from '@/services/api/apiConfig';

export type FeatureStatus = 'complete' | 'in_progress' | 'planned';

export interface Feature {
  id: string;
  name: string;
  path: string; // leading slash path prefix
  category: string;
  description?: string;
  status: FeatureStatus;
  requiresRealAPI?: boolean;
}

export const featuresRegistry: Feature[] = [
  {
    id: 'home',
    name: 'ホーム',
    path: '/',
    category: 'コア',
    description: 'ホームとダッシュボード（タブ切替）',
    status: 'complete',
    requiresRealAPI: false,
  },
  {
    id: 'sitemap',
    name: 'サイトマップ',
    path: '/sitemap',
    category: 'コア',
    description: '全機能一覧・使用ガイド・新機能案内',
    status: 'complete',
    requiresRealAPI: false,
  },
  {
    id: 'dashboard',
    name: '統合ダッシュボード',
    path: '/integrated-dashboard',
    category: 'コア',
    description: 'プロジェクト・タスク統合ビュー',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'tasks',
    name: 'タスク管理センター',
    path: '/tasks',
    category: '仕事',
    description: '統合タスク管理',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'calendar',
    name: 'カレンダー',
    path: '/calendar',
    category: '仕事',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'worktime-entry',
    name: '勤怠入力',
    path: '/worktime-entry',
    category: '勤怠',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'realtime-clock',
    name: 'リアルタイム勤怠',
    path: '/realtime-clock',
    category: '勤怠',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'monthly-timesheet',
    name: '月次勤怠集計',
    path: '/monthly-timesheet',
    category: '勤怠',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'reports',
    name: '勤怠レポート',
    path: '/reports',
    category: '勤怠',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'ai-assistant',
    name: 'AI秘書',
    path: '/ai-assistant',
    category: 'AI',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'adhd-integrated-life',
    name: '🧠 ADHD統合ライフ',
    path: '/adhd-integrated-life',
    category: 'コア',
    description: 'ADHD/ASD特化型生活支援システム',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'adhd-integrated-life-page',
    name: '🧠 ADHD統合ライフ（ページ）',
    path: '/adhd-integrated-life-page',
    category: 'コア',
    description: 'ADHD/ASD特化型生活支援ページ',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'assessments',
    name: '自己診断',
    path: '/assessments',
    category: '診断',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'adhd-cognitive-assessment',
    name: '🧪 認知機能評価',
    path: '/adhd-cognitive-assessment',
    category: 'コア',
    description: 'WEIS準拠の科学的認知機能測定',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'learning',
    name: '学習ハブ',
    path: '/learning',
    category: '学習',
    status: 'planned',
    requiresRealAPI: false,
  },
  {
    id: 'analytics',
    name: 'アナリティクス',
    path: '/analytics',
    category: '分析',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'quality-dashboard',
    name: '品質ダッシュボード',
    path: '/quality-dashboard',
    category: '品質',
    status: 'planned',
    requiresRealAPI: false,
  },
  {
    id: 'settings',
    name: '設定',
    path: '/settings',
    category: 'コア',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'admin',
    name: '管理者ダッシュボード',
    path: '/admin',
    category: '運用',
    description: '管理・運用メトリクス/設定',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'diary',
    name: '📖 日記',
    path: '/diary',
    category: '個人',
    description: '日々の記録と振り返り',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'cognitive-finance',
    name: '💰 認知最適化財務管理',
    path: '/cognitive-finance',
    category: '財務',
    description: 'ADHD/ASD特性に配慮した資産管理',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'beta-user-recruitment',
    name: '🌟 ベータユーザー募集',
    path: '/beta-user-recruitment',
    category: '運用',
    description: '開発参加・フィードバック募集',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'user-testing',
    name: '🧪 実ユーザーテスト',
    path: '/user-testing',
    category: '品質',
    description: 'ユーザビリティテスト・品質検証',
    status: 'in_progress',
    requiresRealAPI: true,
  },
];

const ALLOWLIST_PATHS: string[] = [
  '/',
  '/home',
  '/features',
  '/sitemap',
  '/docs',
  '/login',
  '/register',
  '/privacy',
  '/changelog',
  '/how-it-works',
  '/invite',
];

export function getFeatureByPath(pathname: string): Feature | undefined {
  const match = featuresRegistry.find(
    (f) => pathname === f.path || pathname.startsWith(f.path + '/')
  );
  return match;
}

export function isFeatureAccessible(pathname: string): {
  allowed: boolean;
  reason?: string;
  feature?: Feature;
} {
  if (ALLOWLIST_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return { allowed: true };
  }
  const feature = getFeatureByPath(pathname);
  if (!feature) return { allowed: true };
  if (feature.status !== 'complete') {
    return { allowed: false, reason: '未完成の機能です', feature };
  }
  if (feature.requiresRealAPI && USE_MOCK_DATA) {
    return { allowed: false, reason: 'モックAPIモードでは利用できません', feature };
  }
  return { allowed: true, feature };
}
