import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';

/**
 * 🏆 拡張バッジサービス
 * 要求された全分野のバッジを管理する包括的サービス
 */

// 🔧 仮想化・コンテナバッジ
const virtualizationBadges: DevelopmentBadge[] = [
  {
    id: 'docker-master',
    name: 'Docker Master',
    description: 'Dockerコンテナ技術を完全習得',
    category: 'virtualization',
    difficulty: 'gold',
    icon: '🐳',
    requirements: [
      {
        type: 'container_deployment',
        target: 10,
        current: 0,
        description: '10個以上のコンテナアプリケーションを構築',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 15,
    points: 150,
  },
  {
    id: 'kubernetes-orchestrator',
    name: 'Kubernetes Orchestrator',
    description: 'Kubernetesによるコンテナオーケストレーション専門家',
    category: 'orchestration',
    difficulty: 'platinum',
    icon: '☸️',
    requirements: [
      {
        type: 'orchestration_setup',
        target: 3,
        current: 0,
        description: 'Kubernetesクラスターの構築と管理',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 200,
    prerequisites: ['docker-master'],
  },
];

// 📈 スケーリング・パフォーマンスバッジ
const scalingBadges: DevelopmentBadge[] = [
  {
    id: 'load-balancer-expert',
    name: 'Load Balancer Expert',
    description: '負荷分散とスケーリングの専門家',
    category: 'scaling',
    difficulty: 'gold',
    icon: '⚖️',
    requirements: [
      {
        type: 'scalability',
        target: 3,
        current: 0,
        description: '高負荷対応システムの構築',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 25,
    points: 120,
  },
];

// 🎬 動画・マルチメディア制作バッジ
const multimediaBadges: DevelopmentBadge[] = [
  {
    id: 'video-content-creator',
    name: 'Video Content Creator',
    description: '魅力的な動画コンテンツの制作者',
    category: 'multimedia',
    difficulty: 'silver',
    icon: '🎥',
    requirements: [
      {
        type: 'multimedia_projects',
        target: 10,
        current: 0,
        description: '10本以上の動画コンテンツ制作',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 40,
    points: 100,
  },
];

// 🎮 ゲーム開発バッジ
const gameDevBadges: DevelopmentBadge[] = [
  {
    id: 'indie-game-developer',
    name: 'Indie Game Developer',
    description: 'インディーゲーム開発の開拓者',
    category: 'game_development',
    difficulty: 'gold',
    icon: '🎮',
    requirements: [
      {
        type: 'game_development_cycle',
        target: 1,
        current: 0,
        description: '完成したゲームのリリース',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 30,
    points: 200,
  },
];

// 🛒 EC・オンライン販売バッジ
const ecommerceBadges: DevelopmentBadge[] = [
  {
    id: 'online-store-builder',
    name: 'Online Store Builder',
    description: 'オンラインストアの構築専門家',
    category: 'ecommerce',
    difficulty: 'silver',
    icon: '🏪',
    requirements: [
      {
        type: 'ecommerce_integration',
        target: 1,
        current: 0,
        description: 'ECサイトの構築と運用開始',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 60,
    points: 120,
  },
];

// 📚 教育・学習支援バッジ
const educationBadges: DevelopmentBadge[] = [
  {
    id: 'learning-platform-creator',
    name: 'Learning Platform Creator',
    description: '学習プラットフォームの構築者',
    category: 'education',
    difficulty: 'gold',
    icon: '🎓',
    requirements: [
      {
        type: 'learning_impact',
        target: 100,
        current: 0,
        description: '100人以上の学習者支援',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 45,
    points: 150,
  },
];

// 💼 起業・投資バッジ
const entrepreneurshipBadges: DevelopmentBadge[] = [
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'スタートアップの創設者',
    category: 'entrepreneurship',
    difficulty: 'platinum',
    icon: '🚀',
    requirements: [
      {
        type: 'business_launch',
        target: 1,
        current: 0,
        description: 'スタートアップの設立と運営',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 20,
    points: 300,
  },
];

// 📊 経済・市場分析バッジ
const economicsBadges: DevelopmentBadge[] = [
  {
    id: 'market-analyst',
    name: 'Market Analyst',
    description: '市場分析の専門家',
    category: 'economics',
    difficulty: 'silver',
    icon: '📈',
    requirements: [
      {
        type: 'market_analysis',
        target: 10,
        current: 0,
        description: '10件の詳細市場分析レポート作成',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 35,
    points: 120,
  },
];

// 🤔 哲学・倫理バッジ
const philosophyBadges: DevelopmentBadge[] = [
  {
    id: 'tech-ethicist',
    name: 'Tech Ethicist',
    description: 'テクノロジー倫理の専門家',
    category: 'philosophy',
    difficulty: 'gold',
    icon: '⚖️',
    requirements: [
      {
        type: 'ethics_framework',
        target: 1,
        current: 0,
        description: 'AI倫理フレームワークの開発',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 50,
    points: 150,
  },
];

// 📜 歴史・文化バッジ
const historyBadges: DevelopmentBadge[] = [
  {
    id: 'digital-historian',
    name: 'Digital Historian',
    description: 'デジタル歴史学の専門家',
    category: 'history',
    difficulty: 'silver',
    icon: '🔍',
    requirements: [
      {
        type: 'historical_research',
        target: 20,
        current: 0,
        description: '20件の歴史調査プロジェクト',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 30,
    points: 100,
  },
];

// 🎨 芸術・文化バッジ
const artBadges: DevelopmentBadge[] = [
  {
    id: 'digital-artist',
    name: 'Digital Artist',
    description: 'デジタルアートの創作者',
    category: 'art',
    difficulty: 'silver',
    icon: '🎨',
    requirements: [
      {
        type: 'art_installation',
        target: 10,
        current: 0,
        description: '10作品以上のデジタルアート制作',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 40,
    points: 100,
  },
];

// 🌍 語学・国際化バッジ
const linguisticsBadges: DevelopmentBadge[] = [
  {
    id: 'localization-specialist',
    name: 'Localization Specialist',
    description: '多言語対応の専門家',
    category: 'linguistics',
    difficulty: 'silver',
    icon: '🌐',
    requirements: [
      {
        type: 'multilingual_support',
        target: 5,
        current: 0,
        description: '5言語以上のサポート実装',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 55,
    points: 120,
  },
];

// 📖 文学・出版バッジ
const literatureBadges: DevelopmentBadge[] = [
  {
    id: 'digital-publisher',
    name: 'Digital Publisher',
    description: 'デジタル出版の開拓者',
    category: 'literature',
    difficulty: 'silver',
    icon: '📖',
    requirements: [
      {
        type: 'publishing_platform',
        target: 1,
        current: 0,
        description: 'デジタル出版プラットフォームの立ち上げ',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 25,
    points: 100,
  },
];

// ✏️ 編集・コンテンツ管理バッジ
const editingBadges: DevelopmentBadge[] = [
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'コンテンツ戦略の専門家',
    category: 'editing',
    difficulty: 'silver',
    icon: '📝',
    requirements: [
      {
        type: 'content_published',
        target: 5,
        current: 0,
        description: '5つのコンテンツ戦略の成功実施',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 70,
    points: 100,
  },
];

// 全バッジを統合
export const allExpandedBadges: DevelopmentBadge[] = [
  ...virtualizationBadges,
  ...scalingBadges,
  ...multimediaBadges,
  ...gameDevBadges,
  ...ecommerceBadges,
  ...educationBadges,
  ...entrepreneurshipBadges,
  ...economicsBadges,
  ...philosophyBadges,
  ...historyBadges,
  ...artBadges,
  ...linguisticsBadges,
  ...literatureBadges,
  ...editingBadges,
];

/**
 * 🏆 拡張バッジサービスクラス
 */
export class ExpandedBadgeService {
  private static instance: ExpandedBadgeService | null = null;
  private badges: DevelopmentBadge[] = [];

  private constructor() {
    this.badges = [...allExpandedBadges];
  }

  public static getInstance(): ExpandedBadgeService {
    if (!ExpandedBadgeService.instance) {
      ExpandedBadgeService.instance = new ExpandedBadgeService();
    }
    return ExpandedBadgeService.instance;
  }

  /**
   * 📊 全バッジ取得
   */
  public getAllBadges(): DevelopmentBadge[] {
    return this.badges;
  }

  /**
   * 🎯 カテゴリ別バッジ取得
   */
  public getBadgesByCategory(category: BadgeCategory): DevelopmentBadge[] {
    return this.badges.filter((badge) => badge.category === category);
  }

  /**
   * 🔍 バッジ検索
   */
  public searchBadges(query: string): DevelopmentBadge[] {
    const lowercaseQuery = query.toLowerCase();
    return this.badges.filter(
      (badge) =>
        badge.name.toLowerCase().includes(lowercaseQuery) ||
        badge.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * 📈 バッジ統計取得
   */
  public getBadgeStatistics() {
    const totalBadges = this.badges.length;
    const unlockedBadges = this.badges.filter((badge) => badge.isUnlocked).length;
    const completedBadges = this.badges.filter((badge) => badge.isCompleted).length;

    return {
      totalBadges,
      unlockedBadges,
      completedBadges,
      completionRate: totalBadges > 0 ? (completedBadges / totalBadges) * 100 : 0,
      totalPoints: this.badges.reduce((sum, badge) => sum + (badge.points || 0), 0),
      averageProgress: this.badges.reduce((sum, badge) => sum + badge.progress, 0) / totalBadges,
    };
  }

  /**
   * 🏆 次に達成可能なバッジ
   */
  public getNextAchievableBadge(): DevelopmentBadge | null {
    const availableBadges = this.badges.filter((badge) => badge.isUnlocked && !badge.isCompleted);

    return availableBadges.sort((a, b) => b.progress - a.progress)[0] || null;
  }

  /**
   * 🎯 週次目標生成
   */
  public generateWeeklyGoals() {
    const nextBadges = this.badges
      .filter((badge) => badge.isUnlocked && !badge.isCompleted)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    const focusAreas = [...new Set(nextBadges.map((badge) => badge.category))];
    const estimatedHours = nextBadges.reduce((sum, badge) => {
      const difficultyHours = {
        bronze: 5,
        silver: 10,
        gold: 15,
        platinum: 25,
        legendary: 40,
      };
      return sum + difficultyHours[badge.difficulty] * (1 - badge.progress / 100);
    }, 0);

    return {
      targetBadges: nextBadges,
      focusAreas,
      estimatedHours: Math.round(estimatedHours),
      weeklyTarget: Math.min(3, nextBadges.length),
    };
  }

  /**
   * 📊 カテゴリ別進捗
   */
  public getCategoryProgress(): Record<string, number> {
    const categories = [...new Set(this.badges.map((badge) => badge.category))];
    const progress: Record<string, number> = {};

    categories.forEach((category) => {
      const categoryBadges = this.getBadgesByCategory(category);
      const totalProgress = categoryBadges.reduce((sum, badge) => sum + badge.progress, 0);
      progress[category] = categoryBadges.length > 0 ? totalProgress / categoryBadges.length : 0;
    });

    return progress;
  }

  /**
   * 🔄 バッジ進捗更新
   */
  public updateBadgeProgress(badgeId: string, progressDelta: number): boolean {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (!badge) return false;

    badge.progress = Math.min(100, badge.progress + progressDelta);

    if (badge.progress >= 100 && !badge.isCompleted) {
      badge.isCompleted = true;
      badge.completedAt = new Date().toISOString();

      // 前提条件バッジのアンロック
      this.unlockPrerequisiteBadges(badge);
    }

    return true;
  }

  /**
   * 🔓 前提条件バッジアンロック
   */
  private unlockPrerequisiteBadges(completedBadge: DevelopmentBadge): void {
    this.badges.forEach((badge) => {
      if (!badge.isUnlocked && badge.prerequisites?.includes(completedBadge.id)) {
        badge.isUnlocked = true;
      }
    });
  }

  /**
   * 📈 今週の推奨アクション
   */
  public getWeeklyRecommendations(): string[] {
    const weeklyGoals = this.generateWeeklyGoals();
    const recommendations = [];

    if (weeklyGoals.targetBadges.length > 0) {
      const topBadge = weeklyGoals.targetBadges[0];
      recommendations.push(
        `「${topBadge.name}」バッジの完了を目指しましょう（進捗: ${topBadge.progress}%）`
      );
    }

    recommendations.push(
      `今週は${weeklyGoals.focusAreas.join('、')}分野に集中することをお勧めします`
    );
    recommendations.push(`予想作業時間: ${weeklyGoals.estimatedHours}時間`);

    return recommendations;
  }
}

// シングルトンインスタンスをエクスポート
export const expandedBadgeService = ExpandedBadgeService.getInstance();
export default expandedBadgeService;
