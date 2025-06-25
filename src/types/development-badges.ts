export interface DevelopmentBadge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  requirements: BadgeRequirement[];
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  nextMilestone?: string;
}

export type BadgeCategory =
  | 'foundation' // 基盤構築
  | 'features' // 機能実装
  | 'ui_ux' // UI/UX改善
  | 'performance' // パフォーマンス
  | 'testing' // テスト・品質
  | 'automation' // 自動化
  | 'community' // コミュニティ
  | 'systematization' // 仕組み化
  | 'completion'; // 完成度

export interface BadgeRequirement {
  type:
    | 'commit_count'
    | 'feature_complete'
    | 'test_coverage'
    | 'performance_score'
    | 'user_feedback';
  target: number | string;
  current: number | string;
  description: string;
}

// バッジ定義
export const DEVELOPMENT_BADGES: DevelopmentBadge[] = [
  // 基盤構築バッジ
  {
    id: 'first-commit',
    name: '🚀 開発開始',
    description: '最初のコミットを作成',
    category: 'foundation',
    difficulty: 'bronze',
    icon: '🚀',
    requirements: [{ type: 'commit_count', target: 1, current: 200, description: '1回のコミット' }],
    isUnlocked: true, // 200コミットあるので達成
    progress: 100,
  },
  {
    id: 'architecture-master',
    name: '🏗️ アーキテクト',
    description: 'プロジェクト構造を整備',
    category: 'foundation',
    difficulty: 'silver',
    icon: '🏗️',
    requirements: [
      {
        type: 'feature_complete',
        target: 'folder_structure',
        current: 'completed',
        description: 'フォルダ構造の整理',
      },
      {
        type: 'feature_complete',
        target: 'type_definitions',
        current: 'completed',
        description: '型定義の整備',
      },
    ],
    isUnlocked: true, // 構造化されたプロジェクトなので達成
    progress: 100,
  },

  // 機能実装バッジ
  {
    id: 'todo-master',
    name: '✅ TODOマスター',
    description: 'TODO機能を完全実装',
    category: 'features',
    difficulty: 'gold',
    icon: '✅',
    requirements: [
      {
        type: 'feature_complete',
        target: 'todo_crud',
        current: 'completed',
        description: 'CRUD操作完成',
      },
      {
        type: 'feature_complete',
        target: 'todo_filters',
        current: 'completed',
        description: 'フィルタ機能',
      },
      {
        type: 'feature_complete',
        target: 'todo_analytics',
        current: 'completed',
        description: '分析機能',
      },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！TODO分析ダッシュボード実装により達成！
    progress: 100, // 分析機能完成により100%達成！
  },
  {
    id: 'systematization-pioneer',
    name: '⚙️ 仕組み化パイオニア',
    description: '自動化ワークフローを実装',
    category: 'systematization',
    difficulty: 'platinum',
    icon: '⚙️',
    requirements: [
      {
        type: 'feature_complete',
        target: 'workflow_engine',
        current: 'completed',
        description: 'ワークフローエンジン',
      },
      {
        type: 'feature_complete',
        target: 'automation_rules',
        current: 'completed',
        description: '自動化ルール',
      },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！自動化ルール詳細設定により達成！
    progress: 100, // 自動化ルール機能完成により100%達成！
  },

  // UI/UX改善バッジ
  {
    id: 'design-perfectionist',
    name: '🎨 デザイン完璧主義者',
    description: '全ページでUI/UX統一',
    category: 'ui_ux',
    difficulty: 'gold',
    icon: '🎨',
    requirements: [
      {
        type: 'feature_complete',
        target: 'responsive_design',
        current: 'completed',
        description: 'レスポンシブ対応',
      },
      {
        type: 'feature_complete',
        target: 'accessibility',
        current: 'completed',
        description: 'アクセシビリティ',
      },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！WCAG 2.1 AA準拠実装により達成！
    progress: 100, // アクセシビリティ完全実装により100%達成！
  },

  // パフォーマンスバッジ
  {
    id: 'speed-demon',
    name: '⚡ スピードデーモン',
    description: 'ページ読み込み2秒以下達成',
    category: 'performance',
    difficulty: 'gold',
    icon: '⚡',
    requirements: [
      { type: 'performance_score', target: 90, current: 92, description: 'Lighthouse Score 90+' },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！パフォーマンス最適化により達成！
    progress: 100, // 92/90 = 102% (上限100%)
    nextMilestone: 'パフォーマンススコア95+を目指す',
  },

  // テスト・品質バッジ
  {
    id: 'quality-guardian',
    name: '🛡️ 品質の守護者',
    description: 'テストカバレッジ80%達成',
    category: 'testing',
    difficulty: 'silver',
    icon: '🛡️',
    requirements: [
      { type: 'test_coverage', target: 80, current: 86.11, description: 'テストカバレッジ80%' },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！
    progress: 100, // 86.11/80 = 107% (上限100%)
  },

  // 完成度バッジ
  {
    id: 'feature-completionist',
    name: '🎯 機能コンプリート',
    description: '全主要機能を実装完了',
    category: 'completion',
    difficulty: 'legendary',
    icon: '🎯',
    requirements: [
      {
        type: 'feature_complete',
        target: 'all_core_features',
        current: 'completed',
        description: '全コア機能完成',
      },
    ],
    isUnlocked: true, // 🎉 バッジ獲得！品質向上により完成！
    progress: 100, // 31ページ + テスト品質向上で完成
  },
  {
    id: 'grand-master',
    name: '👑 グランドマスター',
    description: 'すべてのバッジを獲得',
    category: 'completion',
    difficulty: 'legendary',
    icon: '👑',
    requirements: [
      {
        type: 'feature_complete',
        target: 'all_badges',
        current: 'completed',
        description: '全バッジ獲得',
      },
    ],
    isUnlocked: true, // 🎉 全バッジ制覇達成！8/8バッジ獲得により完全制覇！
    progress: 100, // 8/8バッジ達成！ (🚀🏗️✅⚙️🎨⚡🛡️🎯)
  },

  // 🆕 高度な挑戦バッジ（ポストグランドマスター）
  {
    id: 'error-eliminator',
    name: '🐛 エラーエリミネーター',
    description: 'すべてのコンソールエラーを解決',
    category: 'testing',
    difficulty: 'legendary',
    icon: '🐛',
    requirements: [
      {
        type: 'feature_complete',
        target: 'zero_console_errors',
        current: 'in_progress',
        description: 'コンソールエラー0件',
      },
      {
        type: 'feature_complete',
        target: 'api_errors_fixed',
        current: 'in_progress',
        description: 'API 500エラー解決',
      },
    ],
    isUnlocked: false,
    progress: 60, // 主要エラーは解決済み、API問題が残る
    nextMilestone: 'API 500エラーとコンソール警告を解決',
  },
  {
    id: 'performance-ninja',
    name: '🥷 パフォーマンス忍者',
    description: 'Lighthouse Score 95+達成',
    category: 'performance',
    difficulty: 'legendary',
    icon: '🥷',
    requirements: [
      { type: 'performance_score', target: 95, current: 92, description: 'Lighthouse Score 95+' },
      {
        type: 'feature_complete',
        target: 'bundle_optimization',
        current: 'completed',
        description: 'バンドルサイズ最適化',
      },
    ],
    isUnlocked: false,
    progress: 85, // 92/95 + 最適化完了
    nextMilestone: 'パフォーマンススコア3ポイント向上',
  },
  {
    id: 'code-quality-master',
    name: '📏 コード品質マスター',
    description: 'ESLint警告0件達成',
    category: 'testing',
    difficulty: 'legendary',
    icon: '📏',
    requirements: [
      {
        type: 'feature_complete',
        target: 'zero_lint_warnings',
        current: 'in_progress',
        description: 'ESLint警告0件',
      },
      {
        type: 'test_coverage',
        target: 90,
        current: 86.11,
        description: 'テストカバレッジ90%',
      },
    ],
    isUnlocked: false,
    progress: 75, // 86.11/90 + 一部警告解決済み
    nextMilestone: 'ESLint警告解決とテストカバレッジ向上',
  },
  {
    id: 'deployment-deity',
    name: '🚀 デプロイ神',
    description: 'CI/CDパイプライン完全自動化',
    category: 'automation',
    difficulty: 'legendary',
    icon: '🚀',
    requirements: [
      {
        type: 'feature_complete',
        target: 'automated_testing',
        current: 'completed',
        description: '自動テスト実行',
      },
      {
        type: 'feature_complete',
        target: 'automated_deployment',
        current: 'in_progress',
        description: '自動デプロイ設定',
      },
    ],
    isUnlocked: false,
    progress: 70, // テスト自動化完了、デプロイ設定中
    nextMilestone: 'GitHub Actions完全自動化',
  },
];

export const findNextAchievableBadge = (): DevelopmentBadge | null => {
  const unlockedBadges = DEVELOPMENT_BADGES.filter((b) => !b.isUnlocked && b.progress > 0);
  return unlockedBadges.sort((a, b) => b.progress - a.progress)[0] || null;
};

export const generateDailyDevelopmentGoal = (badge: DevelopmentBadge | null): string => {
  if (!badge) {
    return '新しいバッジに挑戦しましょう！';
  }

  const incomplete = badge.requirements.find((req) => {
    if (req.type === 'commit_count' || req.type === 'performance_score') {
      return Number(req.current) < Number(req.target);
    }
    return req.current !== 'completed';
  });

  return incomplete
    ? `${badge.name}達成のため: ${incomplete.description}`
    : '今日も開発を進めましょう！';
};
