import { USE_MOCK_DATA } from '@/services/api/apiConfig';

export type FeatureStatus =
  // New granular flow
  | 'planning' // 計画中
  | 'designing' // 設計中
  | 'developing' // 開発中
  | 'unit_testing' // 単体テスト中（ユニット）
  | 'integration_testing' // 結合テスト中（ローカル手動操作/e2e）
  | 'system_testing' // 総合テスト中（本番環境での操作）
  | 'documenting' // ドキュメント整備中
  | 'review' // 確認中（ドキュメントレビュー）
  | 'release_pending' // リリース待ち
  | 'complete' // 完成
  // Back-compat (will be mapped)
  | 'in_progress'
  | 'planned'
  | 'testing'
  | 'docs';

export interface Feature {
  id: string;
  name: string;
  path: string; // leading slash path prefix
  category: string;
  description?: string;
  status: FeatureStatus;
  requiresRealAPI?: boolean;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  // 無効化（全ユーザー/管理者含めアクセス不可・メニュー非表示）
  disabled?: boolean;
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
    priority: 'P2',
  },
  {
    id: 'sitemap',
    name: 'サイトマップ',
    path: '/sitemap',
    category: 'コア',
    description: '全機能一覧・使用ガイド・新機能案内',
    status: 'complete',
    requiresRealAPI: false,
    priority: 'P2',
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
    id: 'work-pattern-settings',
    name: '勤務パターン設定',
    path: '/work-pattern-settings',
    category: '勤怠',
    description: '勤務時間・休憩・残業設定',
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
    id: 'worktime-form',
    name: '📝 勤怠フォーム',
    path: '/worktime-form',
    category: '勤怠',
    description: '詳細な勤怠情報入力フォーム',
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
    id: 'daily-work-visualization',
    name: '📊 日次勤務可視化',
    path: '/daily-work-visualization',
    category: '勤怠',
    description: '当日の勤務/休憩/残業を可視化',
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
    id: 'approval-workflow',
    name: '承認ワークフロー',
    path: '/approval-workflow',
    category: '勤怠',
    description: '勤怠データの承認申請・承認',
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
    id: 'quadrant-dashboard',
    name: '🎯 4象限マトリックス',
    path: '/quadrant-dashboard',
    category: '分析',
    description: 'AI駆動タスク分類・生産性分析',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'accessibility-audit',
    name: '♿ アクセシビリティ監査',
    path: '/accessibility-audit',
    category: '品質',
    description: 'WCAG 2.1 準拠監査と改善提案',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'advanced-performance-monitoring',
    name: '🚀 高度パフォーマンス監視',
    path: '/advanced-performance-monitoring',
    category: '品質',
    description: 'Lighthouse 監視とリアルタイム性能分析',
    status: 'in_progress',
    requiresRealAPI: false,
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
    id: 'production-optimization',
    name: '🏭 本番環境最適化',
    path: '/production-optimization',
    category: '運用',
    description: 'CDN・キャッシュ戦略・監視最適化',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'mobile-optimization',
    name: '📱 モバイル最適化',
    path: '/mobile-optimization',
    category: '品質',
    description: 'PWA/タッチ操作/通知最適化',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'error-dashboard',
    name: '⚠️ エラーダッシュボード',
    path: '/error-dashboard',
    category: '品質',
    description: 'エラー監視・アラート',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'coverage-report',
    name: '📊 カバレッジレポート',
    path: '/coverage-report',
    category: '品質',
    description: 'テストカバレッジの可視化',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'dev-status',
    name: '🧩 開発ステータス',
    path: '/dev-status',
    category: '品質',
    description: '未実装・モック・WIPの自動検出',
    status: 'in_progress',
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
  // 機能一覧（開発状況） - 管理者のみ閲覧可能
  {
    id: 'features',
    name: '🧭 機能一覧（開発状況）',
    path: '/features',
    category: 'システム・分析',
    description: '機能別の完成状況とアクセス制御',
    status: 'complete',
    requiresRealAPI: false,
  },
  {
    id: 'impulse-countermeasures',
    name: '衝動対策',
    path: '/impulse-countermeasures',
    category: '衝動対策',
    description: '衝動性への対処法・行動設計（プレースホルダー）',
    status: 'planning',
    requiresRealAPI: false,
    priority: 'P3',
    disabled: true,
  },
  {
    id: 'procrastination-guard',
    name: '先延ばし予防ガード',
    path: '/_bg/procrastination-guard',
    category: '衝動対策',
    description: 'バックグラウンドの先延ばし防止ガード',
    status: 'in_progress',
    requiresRealAPI: false,
    disabled: true,
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
  // 個人・ライフスタイル
  {
    id: 'bookshelf',
    name: '📚 本棚',
    path: '/bookshelf',
    category: '個人・ライフスタイル',
    description: '読書記録と本の管理',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'sleep-tracker',
    name: '😴 睡眠トラッカー',
    path: '/sleep-tracker',
    category: '個人・ライフスタイル',
    description: '睡眠パターンの記録と分析',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'quit-smoking',
    name: '🚭 禁煙コーチ',
    path: '/quit-smoking',
    category: '個人・ライフスタイル',
    description: 'AIコーチ・衝動対処・節約可視化',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'impulse-tracker',
    name: '⚡ 衝動トラッカー',
    path: '/impulse-tracker',
    category: '個人・ライフスタイル',
    description: 'ADHD衝動性の記録と管理',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'guitar-practice',
    name: '🎸 ギター練習',
    path: '/guitar-practice',
    category: '個人・ライフスタイル',
    description: 'ギター練習の記録と進捗管理',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'asset-calendar',
    name: '💼 資産カレンダー',
    path: '/asset-calendar',
    category: '個人・ライフスタイル',
    description: '資産管理とイベント計画',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  // 開発・ゲーミフィケーション
  {
    id: 'development-badges',
    name: '🏆 開発バッジ',
    path: '/development-badges',
    category: '開発・ゲーミフィケーション',
    description: '開発実績とバッジの確認',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'ai-gamification',
    name: '🎮 ゲーミフィケーション',
    path: '/ai-gamification',
    category: '開発・ゲーミフィケーション',
    description: 'AI強化ゲーミフィケーション機能',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  // 選挙・政治
  {
    id: 'election-candidates',
    name: '🗳️ 選挙候補者',
    path: '/election-candidates',
    category: '選挙・政治',
    description: '選挙候補者一覧と情報',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'candidate-registration',
    name: '📝 候補者登録',
    path: '/candidate-registration',
    category: '選挙・政治',
    description: '新しい候補者の登録',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'district',
    name: '🏛️ 地区情報',
    path: '/district',
    category: '選挙・政治',
    description: '地区別の詳細情報',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'twitter',
    name: '🐦 Twitter',
    path: '/twitter',
    category: '選挙・政治',
    description: 'Twitter統合機能',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'political-trends',
    name: '📈 政治トレンド',
    path: '/political-trends',
    category: '選挙・政治',
    description: '政治動向とトレンド分析',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  // サブスクリプション・請求
  {
    id: 'subscription',
    name: '💳 サブスクリプション',
    path: '/subscription',
    category: 'サブスクリプション・請求',
    description: 'サブスクリプション管理',
    status: 'in_progress',
    requiresRealAPI: true,
    priority: 'P1',
  },
  {
    id: 'billing-payments',
    name: '課金',
    path: '/subscription',
    category: 'サブスクリプション・請求',
    description: '決済/課金処理（バックエンド連携）',
    status: 'planning',
    requiresRealAPI: true,
    priority: 'P1',
  },
  {
    id: 'subscription-upgrade',
    name: '⭐ アップグレード',
    path: '/subscription-upgrade',
    category: 'サブスクリプション・請求',
    description: 'プレミアムプランへのアップグレード',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'billing-history',
    name: '🧾 請求履歴',
    path: '/billing-history',
    category: 'サブスクリプション・請求',
    description: '過去の請求書と支払い履歴',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  {
    id: 'asset-liability-report',
    name: '📊 資産負債レポート',
    path: '/asset-liability-report',
    category: 'サブスクリプション・請求',
    description: '資産と負債の詳細レポート',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  // プロジェクト管理
  {
    id: 'improvement-plan',
    name: '💡 改善計画',
    path: '/improvement-plan',
    category: 'プロジェクト管理',
    description: 'サイト改善プランの管理',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  // 規約
  {
    id: 'terms-of-service',
    name: '利用規約',
    path: '/docs/terms',
    category: 'コア',
    description: 'サービス利用規約（ドキュメント表示）',
    status: 'planning',
    requiresRealAPI: false,
    priority: 'P1',
  },
  {
    id: 'wbs-creator',
    name: '📊 WBSクリエイター',
    path: '/wbs-creator',
    category: 'プロジェクト管理',
    description: 'ワークブレイクダウン構造作成',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'bug-new',
    name: '🐞 不具合登録',
    path: '/bugs/new',
    category: 'プロジェクト管理',
    description: '機能に紐づく不具合の登録',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  // ユーザー・設定
  {
    id: 'profile',
    name: '👤 プロフィール',
    path: '/profile',
    category: 'ユーザー・設定',
    description: 'ユーザープロフィール設定',
    status: 'in_progress',
    requiresRealAPI: false,
    priority: 'P2',
  },
  // 認証・アカウント
  {
    id: 'login',
    name: 'ログイン',
    path: '/login',
    category: 'ユーザー・設定',
    description: 'サインイン（メール/外部IdP）',
    status: 'developing',
    requiresRealAPI: true,
    priority: 'P0',
  },
  {
    id: 'user-registration',
    name: 'ユーザー登録',
    path: '/register',
    category: 'ユーザー・設定',
    description: '新規アカウント作成',
    status: 'planning',
    requiresRealAPI: true,
    priority: 'P0',
  },
  {
    id: 'logout',
    name: 'ログアウト',
    path: '/_bg/logout',
    category: 'ユーザー・設定',
    description: 'セッション終了（バックグラウンド機能）',
    status: 'planning',
    requiresRealAPI: true,
    priority: 'P0',
  },
  // 生産性
  {
    id: 'game-loop-tasks',
    name: 'ゲームループタスク',
    path: '/game-loop-tasks',
    category: '生産性',
    description: 'プロシージネーション対策・自動タスク分解・マイクロタスク管理',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'todos-legacy',
    name: '従来タスク',
    path: '/todos',
    category: '生産性',
    description: '標準ToDo管理・チェックリスト',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'task-management',
    name: 'タスク管理',
    path: '/task-management',
    category: '生産性',
    description: 'タスク一覧・編集・管理',
    status: 'in_progress',
    requiresRealAPI: true,
  },
  // 分析・レポート
  {
    id: 'badge-completion',
    name: 'バッジ完了予測',
    path: '/badge-completion',
    category: '分析・レポート',
    description: 'AI駆動バッジ完了予測',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'badge-showcase',
    name: 'バッジショーケース',
    path: '/badge-showcase',
    category: '分析・レポート',
    description: '実績展示・共有機能',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  // 自動化
  {
    id: 'automation-rules',
    name: '自動化ルール',
    path: '/automation-rules',
    category: '自動化',
    description: 'システム自動化・ルール設定',
    status: 'in_progress',
    requiresRealAPI: false,
  },
  {
    id: 'multi-ai',
    name: 'AI統合',
    path: '/multi-ai',
    category: '自動化',
    description: 'AI機能統合・複数AI連携',
    status: 'in_progress',
    requiresRealAPI: false,
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
    id: 'blog',
    name: '📝 ブログ',
    path: '/blog',
    category: 'コンテンツ',
    description: 'ブログ記事一覧・投稿',
    status: 'in_progress',
    requiresRealAPI: true,
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
  if ((feature as any).disabled) {
    return { allowed: false, reason: '無効化された機能です', feature };
  }
  if (feature.status !== 'complete') {
    return { allowed: false, reason: '未完成の機能です', feature };
  }
  if (feature.requiresRealAPI && USE_MOCK_DATA) {
    return { allowed: false, reason: 'モックAPIモードでは利用できません', feature };
  }
  return { allowed: true, feature };
}
