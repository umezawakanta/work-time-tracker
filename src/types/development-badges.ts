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
    requirements: [{ type: 'commit_count', target: 1, current: 0, description: '1回のコミット' }],
    isUnlocked: false,
    progress: 0,
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
        current: '',
        description: 'フォルダ構造の整理',
      },
      {
        type: 'feature_complete',
        target: 'type_definitions',
        current: '',
        description: '型定義の整備',
      },
    ],
    isUnlocked: false,
    progress: 0,
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
      { type: 'feature_complete', target: 'todo_crud', current: '', description: 'CRUD操作完成' },
      {
        type: 'feature_complete',
        target: 'todo_filters',
        current: '',
        description: 'フィルタ機能',
      },
      { type: 'feature_complete', target: 'todo_analytics', current: '', description: '分析機能' },
    ],
    isUnlocked: false,
    progress: 75,
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
        current: '',
        description: 'ワークフローエンジン',
      },
      {
        type: 'feature_complete',
        target: 'automation_rules',
        current: '',
        description: '自動化ルール',
      },
    ],
    isUnlocked: false,
    progress: 30,
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
        current: '',
        description: 'レスポンシブ対応',
      },
      {
        type: 'feature_complete',
        target: 'accessibility',
        current: '',
        description: 'アクセシビリティ',
      },
    ],
    isUnlocked: false,
    progress: 60,
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
      { type: 'performance_score', target: 90, current: 0, description: 'Lighthouse Score 90+' },
    ],
    isUnlocked: false,
    progress: 45,
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
        current: '',
        description: '全コア機能完成',
      },
    ],
    isUnlocked: false,
    progress: 85,
  },
  {
    id: 'grand-master',
    name: '👑 グランドマスター',
    description: 'すべてのバッジを獲得',
    category: 'completion',
    difficulty: 'legendary',
    icon: '👑',
    requirements: [
      { type: 'feature_complete', target: 'all_badges', current: '', description: '全バッジ獲得' },
    ],
    isUnlocked: false,
    progress: 0,
  },
];

export const findNextAchievableBadge = (): DevelopmentBadge | null => {
  const unlockedBadges = DEVELOPMENT_BADGES.filter((b) => !b.isUnlocked && b.progress > 0);
  return unlockedBadges.sort((a, b) => b.progress - a.progress)[0] || null;
};

export const generateDailyDevelopmentGoal = (badge: DevelopmentBadge | null): string => {
  if (!badge) return '新しいバッジに挑戦しましょう！';

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
