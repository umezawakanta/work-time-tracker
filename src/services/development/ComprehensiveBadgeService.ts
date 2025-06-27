import { toast } from '@/components/ui/use-toast';
import { DevelopmentBadge, BadgeCategory, BadgeRequirement } from '@/types/development-badges';
import { getBadgeStatsByCategory, findNextAchievableBadge } from '@/types/development-badges';

export interface BadgeProgress {
  badgeId: string;
  currentProgress: number;
  targetProgress: number;
  progressPercentage: number;
  estimatedCompletionDays: number;
  recentActivities: BadgeActivity[];
  blockers: string[];
  recommendations: string[];
}

export interface BadgeActivity {
  id: string;
  badgeId: string;
  activity: string;
  timestamp: string;
  progressContribution: number;
  source: 'manual' | 'automatic' | 'system';
  metadata?: Record<string, any>;
}

export interface BadgeStatistics {
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  availableBadges: number;
  completionRate: number;
  averageCompletionTime: number;
  categoriesCompleted: Record<BadgeCategory, number>;
  recentAchievements: DevelopmentBadge[];
  topCategories: Array<{ category: BadgeCategory; progress: number }>;
  streakCount: number;
  totalPoints: number;
  nextMilestone: {
    badge: DevelopmentBadge;
    daysToCompletion: number;
    blockers: string[];
  } | null;
}

export interface PageSyncData {
  pageName: string;
  lastUpdated: string;
  badgeUpdates: BadgeActivity[];
  progressChanges: Record<string, number>;
  completedActions: string[];
  metrics: Record<string, number>;
  crossPageUpdates: CrossPageUpdate[];
  syncVersion: number;
}

export interface CrossPageUpdate {
  sourcePageName: string;
  targetPageName: string;
  updateType: 'badge_completion' | 'progress_update' | 'metric_change' | 'activity_log';
  data: any;
  timestamp: string;
  applied: boolean;
}

export interface BadgePrediction {
  badgeId: string;
  predictedCompletionDate: string;
  confidenceLevel: number; // 0-100
  requiredDailyProgress: number;
  currentVelocity: number;
  factors: {
    historical: number;
    current: number;
    trend: number;
    complexity: number;
  };
  recommendations: string[];
  risksAndMitigations: Array<{
    risk: string;
    probability: number;
    impact: string;
    mitigation: string;
  }>;
}

export interface ComprehensiveReport {
  overview: {
    totalBadges: number;
    completedBadges: number;
    overallProgress: number;
    totalPoints: number;
    activeStreaks: number;
  };
  categoryBreakdown: Array<{
    category: string;
    name: string;
    badges: number;
    completed: number;
    progress: number;
    trending: 'up' | 'down' | 'stable';
  }>;
  recommendations: string[];
  achievements: DevelopmentBadge[];
  upcomingMilestones: Array<{
    badge: DevelopmentBadge;
    estimatedDays: number;
    requiredActions: string[];
  }>;
  crossPageMetrics: Record<string, any>;
}

/**
 * 🏆 包括的バッジサービス - 全カテゴリ対応の進捗管理
 */
class ComprehensiveBadgeService {
  private static instance: ComprehensiveBadgeService | null = null;
  private badges: Map<string, DevelopmentBadge> = new Map();
  private badgeProgress: Map<string, BadgeProgress> = new Map();
  private activities: BadgeActivity[] = [];
  private pageData: Map<string, PageSyncData> = new Map();
  private syncListeners: Map<string, (data: PageSyncData) => void> = new Map();
  private autoProgressTracking: boolean = true;
  private progressUpdateInterval: NodeJS.Timeout | null = null;
  private activityLog: ActivityRecord[] = [];
  private categoryMetrics: Map<string, CategoryMetrics> = new Map();
  private autoTracking: boolean = true;
  private progressInterval: NodeJS.Timeout | null = null;
  private crossPageUpdates: CrossPageUpdate[] = [];
  private syncVersion: number = 0;

  // 大幅に拡張されたカテゴリ情報
  private readonly CATEGORY_CONFIG = {
    // 技術系基盤
    foundation: {
      name: '技術基盤',
      trackingWeight: 1.0,
      autoProgressTriggers: ['code', 'implement', 'develop', 'build'],
      skillAreas: ['programming', 'software engineering', 'computer science'],
      prerequisites: [],
    },
    testing: {
      name: 'テスト・品質',
      trackingWeight: 1.6,
      autoProgressTriggers: ['test', 'quality', 'qa', 'validation'],
      skillAreas: ['unit testing', 'integration testing', 'quality assurance'],
      prerequisites: ['foundation'],
    },

    // CI/CD・DevOps系
    cicd: {
      name: 'CI/CD・DevOps',
      trackingWeight: 1.8,
      autoProgressTriggers: ['commit', 'deploy', 'pipeline', 'test', 'automation'],
      skillAreas: ['continuous integration', 'deployment', 'automation', 'monitoring'],
      prerequisites: ['foundation'],
    },
    deployment: {
      name: 'デプロイ・ホスティング',
      trackingWeight: 1.6,
      autoProgressTriggers: ['deploy', 'hosting', 'server', 'cloud', 'cdn'],
      skillAreas: ['deployment strategies', 'hosting platforms', 'server management'],
      prerequisites: ['cicd'],
    },
    virtualization: {
      name: '仮想化・コンテナ',
      trackingWeight: 2.0,
      autoProgressTriggers: ['docker', 'kubernetes', 'container', 'vm', 'orchestration'],
      skillAreas: ['containerization', 'orchestration', 'virtual machines'],
      prerequisites: ['infrastructure'],
    },
    infrastructure: {
      name: 'インフラ・クラウド',
      trackingWeight: 2.2,
      autoProgressTriggers: ['aws', 'azure', 'gcp', 'terraform', 'ansible', 'infrastructure'],
      skillAreas: ['cloud architecture', 'infrastructure as code', 'networking'],
      prerequisites: ['foundation'],
    },
    scaling: {
      name: 'スケーリング・パフォーマンス',
      trackingWeight: 2.4,
      autoProgressTriggers: ['scale', 'performance', 'optimization', 'load', 'capacity'],
      skillAreas: ['horizontal scaling', 'performance optimization', 'load balancing'],
      prerequisites: ['infrastructure', 'monitoring'],
    },
    monitoring: {
      name: '監視・運用',
      trackingWeight: 1.9,
      autoProgressTriggers: ['monitor', 'alert', 'logging', 'metrics', 'observability'],
      skillAreas: ['system monitoring', 'alerting', 'incident response'],
      prerequisites: ['infrastructure'],
    },

    // 設計・アーキテクチャ系
    architecture: {
      name: 'システム設計・アーキテクチャ',
      trackingWeight: 2.5,
      autoProgressTriggers: ['design', 'architecture', 'pattern', 'structure', 'blueprint'],
      skillAreas: ['system design', 'architectural patterns', 'scalable design'],
      prerequisites: ['foundation'],
    },
    specification: {
      name: '仕様・要件定義',
      trackingWeight: 1.7,
      autoProgressTriggers: ['spec', 'requirement', 'analysis', 'documentation'],
      skillAreas: ['requirements gathering', 'technical specification', 'documentation'],
      prerequisites: [],
    },
    product_selection: {
      name: '製品選定・技術評価',
      trackingWeight: 1.8,
      autoProgressTriggers: ['evaluation', 'comparison', 'selection', 'assessment'],
      skillAreas: ['technology assessment', 'vendor evaluation', 'decision making'],
      prerequisites: ['architecture'],
    },

    // プロジェクト管理系
    project_management: {
      name: 'プロジェクト管理・PM',
      trackingWeight: 1.5,
      autoProgressTriggers: ['project', 'management', 'planning', 'coordination'],
      skillAreas: ['project planning', 'risk management', 'team coordination'],
      prerequisites: [],
    },
    agile: {
      name: 'アジャイル・スクラム',
      trackingWeight: 1.4,
      autoProgressTriggers: ['agile', 'scrum', 'sprint', 'retrospective', 'kanban'],
      skillAreas: ['agile methodologies', 'scrum framework', 'iterative development'],
      prerequisites: ['project_management'],
    },
    skill_mapping: {
      name: 'スキルマップ・人材育成',
      trackingWeight: 1.6,
      autoProgressTriggers: ['skill', 'training', 'development', 'learning', 'assessment'],
      skillAreas: ['skill assessment', 'training programs', 'career development'],
      prerequisites: ['project_management'],
    },

    // デザイン・UX系
    design: {
      name: 'デザイン・UX/UI',
      trackingWeight: 1.5,
      autoProgressTriggers: ['design', 'ui', 'ux', 'interface', 'user experience'],
      skillAreas: ['user interface design', 'user experience', 'visual design'],
      prerequisites: [],
    },
    creative: {
      name: 'クリエイティブ・コンテンツ',
      trackingWeight: 1.3,
      autoProgressTriggers: ['creative', 'content', 'video', 'animation', 'graphics'],
      skillAreas: ['content creation', 'multimedia production', 'creative direction'],
      prerequisites: ['design'],
    },

    // ビジネス・経営系
    business: {
      name: 'ビジネス・経営',
      trackingWeight: 1.3,
      autoProgressTriggers: ['strategy', 'planning', 'analysis', 'management', 'business'],
      skillAreas: ['strategic planning', 'business analysis', 'operations'],
      prerequisites: [],
    },
    entrepreneurship: {
      name: '起業・スタートアップ',
      trackingWeight: 2.5,
      autoProgressTriggers: ['startup', 'pitch', 'funding', 'business model', 'venture'],
      skillAreas: ['venture creation', 'fundraising', 'business development'],
      prerequisites: ['business', 'finance'],
    },
    investment: {
      name: '投資・資金調達',
      trackingWeight: 2.3,
      autoProgressTriggers: ['investment', 'funding', 'capital', 'equity', 'valuation'],
      skillAreas: ['investment analysis', 'fundraising', 'financial modeling'],
      prerequisites: ['business', 'finance'],
    },

    // マーケティング・営業系
    marketing: {
      name: 'マーケティング・プロモーション',
      trackingWeight: 1.4,
      autoProgressTriggers: ['campaign', 'analytics', 'seo', 'social', 'promotion'],
      skillAreas: ['digital marketing', 'content strategy', 'customer acquisition'],
      prerequisites: ['business'],
    },
    sales: {
      name: '営業・セールス',
      trackingWeight: 1.5,
      autoProgressTriggers: ['sales', 'customer', 'revenue', 'negotiation', 'closing'],
      skillAreas: ['sales strategy', 'customer relationship', 'revenue generation'],
      prerequisites: ['business', 'marketing'],
    },
    ecommerce: {
      name: 'EC・オンライン販売',
      trackingWeight: 1.8,
      autoProgressTriggers: ['ecommerce', 'online store', 'payment', 'logistics'],
      skillAreas: ['e-commerce platforms', 'online retail', 'digital payments'],
      prerequisites: ['marketing', 'sales'],
    },
    monetization: {
      name: 'マネタイズ・収益化',
      trackingWeight: 2.0,
      autoProgressTriggers: ['monetize', 'revenue', 'pricing', 'subscription', 'ads'],
      skillAreas: ['revenue models', 'pricing strategy', 'monetization'],
      prerequisites: ['business', 'marketing'],
    },

    // 財務・会計・法務系
    finance: {
      name: '財務・会計・税務',
      trackingWeight: 1.7,
      autoProgressTriggers: ['accounting', 'budget', 'finance', 'tax', 'audit'],
      skillAreas: ['financial analysis', 'budgeting', 'tax planning'],
      prerequisites: ['business'],
    },
    legal: {
      name: '法務・コンプライアンス',
      trackingWeight: 2.3,
      autoProgressTriggers: ['compliance', 'contract', 'legal', 'regulation', 'privacy'],
      skillAreas: ['regulatory compliance', 'contract law', 'corporate governance'],
      prerequisites: ['business'],
    },
    secretary: {
      name: '秘書・事務管理',
      trackingWeight: 1.2,
      autoProgressTriggers: ['administration', 'organization', 'scheduling', 'correspondence'],
      skillAreas: ['administrative support', 'office management', 'communication'],
      prerequisites: [],
    },

    // 人事・労務系
    hr: {
      name: '人事・労務管理',
      trackingWeight: 1.5,
      autoProgressTriggers: ['hr', 'recruitment', 'performance', 'training', 'employee'],
      skillAreas: ['talent management', 'organizational development', 'compensation'],
      prerequisites: ['business'],
    },

    // 教育・学習系
    education: {
      name: '教育・学習支援',
      trackingWeight: 1.4,
      autoProgressTriggers: ['education', 'learning', 'teaching', 'curriculum', 'training'],
      skillAreas: ['educational technology', 'curriculum design', 'learning assessment'],
      prerequisites: [],
    },
    certification: {
      name: '資格・認定試験',
      trackingWeight: 1.6,
      autoProgressTriggers: ['certification', 'exam', 'qualification', 'accreditation'],
      skillAreas: ['professional certification', 'skill validation', 'continuing education'],
      prerequisites: ['education'],
    },
    information_sharing: {
      name: '情報発信・コミュニティ',
      trackingWeight: 1.3,
      autoProgressTriggers: ['blog', 'community', 'sharing', 'presentation', 'knowledge'],
      skillAreas: ['content creation', 'community building', 'knowledge sharing'],
      prerequisites: ['education'],
    },

    // 文化・芸術系
    art: {
      name: '芸術・創作',
      trackingWeight: 1.2,
      autoProgressTriggers: ['art', 'creative', 'visual', 'aesthetic', 'artistic'],
      skillAreas: ['digital art', 'creative design', 'visual communication'],
      prerequisites: [],
    },
    culture: {
      name: '文化・歴史研究',
      trackingWeight: 1.5,
      autoProgressTriggers: ['culture', 'history', 'heritage', 'tradition', 'civilization'],
      skillAreas: ['cultural analysis', 'historical research', 'cultural preservation'],
      prerequisites: [],
    },
    publishing: {
      name: '出版・編集',
      trackingWeight: 1.6,
      autoProgressTriggers: ['writing', 'editing', 'publishing', 'content', 'manuscript'],
      skillAreas: ['content creation', 'editorial workflow', 'publishing'],
      prerequisites: ['linguistics'],
    },
    literature: {
      name: '文学・執筆',
      trackingWeight: 1.7,
      autoProgressTriggers: ['writing', 'literature', 'story', 'narrative', 'author'],
      skillAreas: ['creative writing', 'literary analysis', 'storytelling'],
      prerequisites: ['linguistics'],
    },

    // 学術・研究系
    philosophy: {
      name: '哲学・思想',
      trackingWeight: 3.0,
      autoProgressTriggers: ['philosophy', 'ethics', 'logic', 'morality', 'wisdom'],
      skillAreas: ['philosophical analysis', 'ethical reasoning', 'critical thinking'],
      prerequisites: [],
    },
    religion: {
      name: '宗教・精神性',
      trackingWeight: 2.8,
      autoProgressTriggers: ['religion', 'spirituality', 'faith', 'meditation', 'belief'],
      skillAreas: ['religious studies', 'spiritual practices', 'interfaith dialogue'],
      prerequisites: ['philosophy'],
    },
    politics: {
      name: '政治・公共政策',
      trackingWeight: 2.1,
      autoProgressTriggers: ['politics', 'policy', 'governance', 'democracy', 'public'],
      skillAreas: ['political analysis', 'policy development', 'public administration'],
      prerequisites: ['philosophy'],
    },
    economics: {
      name: '経済・経済学',
      trackingWeight: 2.0,
      autoProgressTriggers: ['economics', 'market', 'trade', 'macro', 'micro'],
      skillAreas: ['economic analysis', 'market research', 'economic modeling'],
      prerequisites: ['business'],
    },
    linguistics: {
      name: '語学・言語学',
      trackingWeight: 1.8,
      autoProgressTriggers: ['language', 'translation', 'multilingual', 'i18n', 'linguistics'],
      skillAreas: ['multilingual communication', 'translation', 'localization'],
      prerequisites: [],
    },

    // 社会貢献・持続可能性系
    social_contribution: {
      name: '社会貢献・CSR',
      trackingWeight: 1.4,
      autoProgressTriggers: ['sustainability', 'social', 'community', 'volunteer', 'impact'],
      skillAreas: ['social impact', 'community engagement', 'corporate responsibility'],
      prerequisites: [],
    },
    sustainability: {
      name: '持続可能性・ESG',
      trackingWeight: 1.9,
      autoProgressTriggers: ['green', 'carbon', 'renewable', 'circular', 'esg'],
      skillAreas: ['environmental management', 'carbon footprint', 'circular economy'],
      prerequisites: ['social_contribution'],
    },

    // AI・先端技術系
    ai_ml: {
      name: 'AI・機械学習',
      trackingWeight: 2.8,
      autoProgressTriggers: ['ai', 'ml', 'neural', 'model', 'algorithm', 'data science'],
      skillAreas: ['machine learning', 'neural networks', 'data science'],
      prerequisites: ['foundation', 'testing'],
    },
    cybersecurity: {
      name: 'サイバーセキュリティ',
      trackingWeight: 2.4,
      autoProgressTriggers: ['security', 'encryption', 'vulnerability', 'audit', 'cyber'],
      skillAreas: ['threat analysis', 'security architecture', 'incident response'],
      prerequisites: ['infrastructure'],
    },

    // ゲーム・エンターテイメント系
    game_development: {
      name: 'ゲーム開発',
      trackingWeight: 2.1,
      autoProgressTriggers: ['game', 'unity', 'unreal', 'gameplay', 'graphics'],
      skillAreas: ['game design', 'game programming', 'interactive entertainment'],
      prerequisites: ['foundation', 'creative'],
    },
    multimedia: {
      name: '動画・マルチメディア',
      trackingWeight: 1.7,
      autoProgressTriggers: ['video', 'audio', 'streaming', 'production', 'media'],
      skillAreas: ['video production', 'audio engineering', 'streaming technology'],
      prerequisites: ['creative'],
    },
  };

  private constructor() {
    this.initializeBadgeSystem();
    this.startAutoProgressTracking();
    this.initializeCategoryMetrics();
    this.startAutoTracking();
    console.log(
      '🏆 Comprehensive Badge Service initialized with',
      Object.keys(this.CATEGORY_CONFIG).length,
      'categories'
    );
  }

  public static getInstance(): ComprehensiveBadgeService {
    if (!ComprehensiveBadgeService.instance) {
      ComprehensiveBadgeService.instance = new ComprehensiveBadgeService();
    }
    return ComprehensiveBadgeService.instance;
  }

  /**
   * 🚀 バッジシステム初期化
   */
  private initializeBadgeSystem(): void {
    this.loadComprehensiveBadgeData();
    this.initializePageSyncData();
    this.calculateAllBadgeProgress();
    console.log('🏆 バッジシステム初期化:', this.badges.size, 'バッジ');
  }

  /**
   * 📊 包括的バッジデータ読み込み
   */
  private loadComprehensiveBadgeData(): void {
    const comprehensiveBadges: DevelopmentBadge[] = [
      // 技術基盤系
      {
        id: 'code-architect',
        name: 'コードアーキテクト',
        description: '優れたコード構造とアーキテクチャを設計する能力を証明',
        category: 'architecture',
        difficulty: 'platinum',
        icon: '🏗️',
        requirements: [
          {
            type: 'feature_complete',
            target: 100,
            description: 'アーキテクチャ設計の完了',
            progress: 85,
            isCompleted: false,
          },
          {
            type: 'code_quality',
            target: 95,
            description: 'コード品質スコア95%以上',
            progress: 88,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 86,
        isCompleted: false,
        points: 1000,
        prerequisites: ['foundation-master'],
      },

      // CI/CD・DevOps系
      {
        id: 'cicd-master',
        name: 'CI/CDマスター',
        description: '継続的インテグレーション・デプロイメントのエキスパート',
        category: 'cicd',
        difficulty: 'gold',
        icon: '🔄',
        requirements: [
          {
            type: 'pipeline_setup',
            target: 100,
            description: 'CI/CDパイプラインの構築',
            progress: 75,
            isCompleted: false,
          },
          {
            type: 'automation',
            target: 90,
            description: '自動化スコア90%以上',
            progress: 70,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 72,
        isCompleted: false,
        points: 800,
      },

      {
        id: 'deployment-specialist',
        name: 'デプロイメントスペシャリスト',
        description: '安全で効率的なデプロイメント戦略を実行',
        category: 'deployment',
        difficulty: 'silver',
        icon: '🚀',
        requirements: [
          {
            type: 'deployment_success',
            target: 95,
            description: 'デプロイ成功率95%以上',
            progress: 90,
            isCompleted: false,
          },
          {
            type: 'rollback_strategy',
            target: 100,
            description: 'ロールバック戦略の実装',
            progress: 85,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 87,
        isCompleted: false,
        points: 600,
        prerequisites: ['cicd-master'],
      },

      {
        id: 'container-orchestrator',
        name: 'コンテナオーケストレーター',
        description: 'Docker・Kubernetesを使いこなすコンテナ技術者',
        category: 'virtualization',
        difficulty: 'gold',
        icon: '🐳',
        requirements: [
          {
            type: 'container_deployment',
            target: 100,
            description: 'コンテナデプロイの実装',
            progress: 60,
            isCompleted: false,
          },
          {
            type: 'orchestration',
            target: 90,
            description: 'オーケストレーション設定',
            progress: 55,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 57,
        isCompleted: false,
        points: 750,
      },

      {
        id: 'cloud-architect',
        name: 'クラウドアーキテクト',
        description: 'スケーラブルなクラウドインフラを設計・構築',
        category: 'infrastructure',
        difficulty: 'platinum',
        icon: '☁️',
        requirements: [
          {
            type: 'cloud_deployment',
            target: 100,
            description: 'クラウド環境の構築',
            progress: 70,
            isCompleted: false,
          },
          {
            type: 'scalability',
            target: 95,
            description: 'スケーラビリティの実装',
            progress: 65,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 67,
        isCompleted: false,
        points: 1200,
      },

      {
        id: 'performance-optimizer',
        name: 'パフォーマンスオプティマイザー',
        description: 'システムパフォーマンスを極限まで最適化',
        category: 'scaling',
        difficulty: 'gold',
        icon: '⚡',
        requirements: [
          {
            type: 'performance_improvement',
            target: 50,
            description: 'パフォーマンス50%向上',
            progress: 35,
            isCompleted: false,
          },
          {
            type: 'load_testing',
            target: 100,
            description: '負荷テストの実施',
            progress: 80,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 57,
        isCompleted: false,
        points: 900,
      },

      {
        id: 'monitoring-specialist',
        name: '監視スペシャリスト',
        description: '包括的なシステム監視とアラート体制を構築',
        category: 'monitoring',
        difficulty: 'silver',
        icon: '📊',
        requirements: [
          {
            type: 'monitoring_setup',
            target: 100,
            description: '監視システムの構築',
            progress: 95,
            isCompleted: false,
          },
          {
            type: 'alert_configuration',
            target: 100,
            description: 'アラート設定の完了',
            progress: 90,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 92,
        isCompleted: false,
        points: 700,
      },

      // プロジェクト管理系
      {
        id: 'project-maestro',
        name: 'プロジェクトマエストロ',
        description: '複雑なプロジェクトを成功に導くプロジェクト管理の達人',
        category: 'project_management',
        difficulty: 'gold',
        icon: '🎯',
        requirements: [
          {
            type: 'project_completion',
            target: 95,
            description: 'プロジェクト成功率95%以上',
            progress: 88,
            isCompleted: false,
          },
          {
            type: 'team_satisfaction',
            target: 90,
            description: 'チーム満足度90%以上',
            progress: 85,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 86,
        isCompleted: false,
        points: 850,
      },

      {
        id: 'agile-champion',
        name: 'アジャイルチャンピオン',
        description: 'アジャイル開発手法をマスターし、チームを牽引',
        category: 'agile',
        difficulty: 'silver',
        icon: '🔄',
        requirements: [
          {
            type: 'sprint_velocity',
            target: 90,
            description: 'スプリント目標達成率90%',
            progress: 82,
            isCompleted: false,
          },
          {
            type: 'retrospective_insights',
            target: 50,
            description: '改善提案50件以上',
            progress: 35,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 58,
        isCompleted: false,
        points: 600,
      },

      {
        id: 'skill-mapper',
        name: 'スキルマッパー',
        description: '包括的なスキルマップを作成し、チーム能力を可視化',
        category: 'skill_mapping',
        difficulty: 'gold',
        icon: '🗺️',
        requirements: [
          {
            type: 'skill_assessment',
            target: 100,
            description: 'スキル評価システムの完成',
            progress: 100,
            isCompleted: true,
          },
          {
            type: 'development_plan',
            target: 80,
            description: '育成計画の策定',
            progress: 75,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 87,
        isCompleted: false,
        points: 750,
      },

      // ビジネス系
      {
        id: 'business-strategist',
        name: 'ビジネスストラテジスト',
        description: '戦略的思考でビジネス価値を最大化',
        category: 'business',
        difficulty: 'gold',
        icon: '💼',
        requirements: [
          {
            type: 'strategy_development',
            target: 100,
            description: 'ビジネス戦略の策定',
            progress: 70,
            isCompleted: false,
          },
          {
            type: 'roi_improvement',
            target: 25,
            description: 'ROI25%改善',
            progress: 18,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 44,
        isCompleted: false,
        points: 900,
      },

      {
        id: 'startup-founder',
        name: 'スタートアップファウンダー',
        description: '起業家精神を発揮し、新規事業を立ち上げ',
        category: 'entrepreneurship',
        difficulty: 'platinum',
        icon: '🚀',
        requirements: [
          {
            type: 'business_launch',
            target: 100,
            description: '事業立ち上げの完了',
            progress: 30,
            isCompleted: false,
          },
          {
            type: 'revenue_generation',
            target: 100,
            description: '収益化の達成',
            progress: 15,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 22,
        isCompleted: false,
        points: 1500,
      },

      {
        id: 'marketing-guru',
        name: 'マーケティンググル',
        description: 'デジタルマーケティングで圧倒的な成果を創出',
        category: 'marketing',
        difficulty: 'gold',
        icon: '📢',
        requirements: [
          {
            type: 'campaign_success',
            target: 80,
            description: 'キャンペーン成功率80%',
            progress: 65,
            isCompleted: false,
          },
          {
            type: 'conversion_rate',
            target: 5,
            description: 'コンバージョン率5%達成',
            progress: 3.2,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 55,
        isCompleted: false,
        points: 800,
      },

      // 教育・文化系
      {
        id: 'knowledge-master',
        name: 'ナレッジマスター',
        description: '知識共有と学習文化の醸成に貢献',
        category: 'education',
        difficulty: 'silver',
        icon: '📚',
        requirements: [
          {
            type: 'knowledge_sharing',
            target: 100,
            description: 'ナレッジ共有システムの構築',
            progress: 90,
            isCompleted: false,
          },
          {
            type: 'learning_impact',
            target: 80,
            description: '学習効果80%向上',
            progress: 75,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 82,
        isCompleted: false,
        points: 650,
      },

      {
        id: 'certification-champion',
        name: '認定資格チャンピオン',
        description: '複数の専門資格を取得し、専門性を証明',
        category: 'certification',
        difficulty: 'gold',
        icon: '🏆',
        requirements: [
          {
            type: 'certifications_earned',
            target: 5,
            description: '専門資格5つ以上取得',
            progress: 3,
            isCompleted: false,
          },
          {
            type: 'skill_validation',
            target: 95,
            description: 'スキル検証95%以上',
            progress: 88,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 72,
        isCompleted: false,
        points: 850,
      },

      {
        id: 'content-creator',
        name: 'コンテンツクリエイター',
        description: '価値あるコンテンツを継続的に創出・発信',
        category: 'information_sharing',
        difficulty: 'silver',
        icon: '📝',
        requirements: [
          {
            type: 'content_published',
            target: 50,
            description: '高品質コンテンツ50件公開',
            progress: 32,
            isCompleted: false,
          },
          {
            type: 'audience_engagement',
            target: 80,
            description: 'エンゲージメント率80%',
            progress: 70,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 64,
        isCompleted: false,
        points: 600,
      },

      // AI・先端技術系
      {
        id: 'ai-pioneer',
        name: 'AI開拓者',
        description: 'AI・機械学習技術を実用的なソリューションに応用',
        category: 'ai_ml',
        difficulty: 'platinum',
        icon: '🤖',
        requirements: [
          {
            type: 'ai_model_deployment',
            target: 100,
            description: 'AIモデルの本番デプロイ',
            progress: 45,
            isCompleted: false,
          },
          {
            type: 'ml_accuracy',
            target: 90,
            description: 'モデル精度90%以上',
            progress: 85,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 65,
        isCompleted: false,
        points: 1300,
      },

      {
        id: 'security-sentinel',
        name: 'セキュリティセンチネル',
        description: 'システムとデータを守り抜くサイバーセキュリティの専門家',
        category: 'cybersecurity',
        difficulty: 'gold',
        icon: '🛡️',
        requirements: [
          {
            type: 'security_assessment',
            target: 100,
            description: 'セキュリティ監査の実施',
            progress: 80,
            isCompleted: false,
          },
          {
            type: 'vulnerability_remediation',
            target: 95,
            description: '脆弱性対応95%完了',
            progress: 88,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 84,
        isCompleted: false,
        points: 950,
      },

      // デザイン・クリエイティブ系
      {
        id: 'ux-maestro',
        name: 'UXマエストロ',
        description: 'ユーザー体験を革新的に改善するデザインの匠',
        category: 'design',
        difficulty: 'gold',
        icon: '🎨',
        requirements: [
          {
            type: 'user_satisfaction',
            target: 95,
            description: 'ユーザー満足度95%以上',
            progress: 88,
            isCompleted: false,
          },
          {
            type: 'usability_improvement',
            target: 40,
            description: 'ユーザビリティ40%向上',
            progress: 32,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 60,
        isCompleted: false,
        points: 850,
      },

      {
        id: 'multimedia-artist',
        name: 'マルチメディアアーティスト',
        description: '動画・音声・ビジュアルコンテンツの総合クリエイター',
        category: 'multimedia',
        difficulty: 'silver',
        icon: '🎬',
        requirements: [
          {
            type: 'multimedia_projects',
            target: 20,
            description: 'マルチメディア作品20点制作',
            progress: 12,
            isCompleted: false,
          },
          {
            type: 'creative_impact',
            target: 80,
            description: 'クリエイティブインパクト80%',
            progress: 70,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 65,
        isCompleted: false,
        points: 700,
      },

      // 社会貢献系
      {
        id: 'sustainability-advocate',
        name: 'サステナビリティアドボケート',
        description: '持続可能な社会の実現に向けた取り組みを牽引',
        category: 'sustainability',
        difficulty: 'gold',
        icon: '🌱',
        requirements: [
          {
            type: 'carbon_reduction',
            target: 30,
            description: 'カーボンフットプリント30%削減',
            progress: 20,
            isCompleted: false,
          },
          {
            type: 'esg_initiatives',
            target: 10,
            description: 'ESG施策10件実施',
            progress: 6,
            isCompleted: false,
          },
        ],
        isUnlocked: true,
        progress: 43,
        isCompleted: false,
        points: 900,
      },
    ];

    comprehensiveBadges.forEach((badge) => {
      this.badges.set(badge.id, badge);
    });

    console.log('📊 包括的バッジデータ読み込み完了:', comprehensiveBadges.length, 'バッジ');
  }

  /**
   * 📄 ページ同期データ初期化（拡張版）
   */
  private initializePageSyncData(): void {
    const pages = [
      'home',
      'integrated-dashboard',
      'todo-management',
      'automation-rules',
      'badge-dashboard',
      'badge-prediction',
      'badge-showcase',
      'wbs-creation',
      'ai-wbs-generation',
      'gamification',
      'attendance-management',
      'reports',
      'improvement-planning',
      'system-design',
      'admin-dashboard',
      'api-testing',
      'quality-dashboard',
      'error-monitoring',
      'performance-monitoring',
      'profile',
      'settings',
      'achievements-badges',
    ];

    pages.forEach((page) => {
      this.pageData.set(page, {
        pageName: page,
        lastUpdated: new Date().toISOString(),
        badgeUpdates: [],
        progressChanges: {},
        completedActions: [],
        metrics: {},
        crossPageUpdates: [],
        syncVersion: this.syncVersion,
      });
    });

    console.log('📄 ページ同期データ初期化:', pages.length, 'ページ');
  }

  /**
   * 📊 全バッジ進捗計算
   */
  private calculateAllBadgeProgress(): void {
    this.badges.forEach((badge, badgeId) => {
      const progress = this.calculateBadgeProgress(badge);
      this.badgeProgress.set(badgeId, progress);
    });
  }

  /**
   * 📈 個別バッジ進捗計算
   */
  private calculateBadgeProgress(badge: DevelopmentBadge): BadgeProgress {
    const totalRequirements = badge.requirements.length;
    const progressSum = badge.requirements.reduce((sum, req) => sum + (req.progress || 0), 0);

    const currentProgress = progressSum / totalRequirements;
    const targetProgress = 100;
    const progressPercentage = (currentProgress / targetProgress) * 100;

    const recentActivities = this.activities
      .filter((activity) => activity.badgeId === badge.id)
      .slice(-10);

    const averageDailyProgress = this.calculateAverageDailyProgress(recentActivities);
    const remainingProgress = targetProgress - currentProgress;
    const estimatedCompletionDays =
      averageDailyProgress > 0 ? Math.ceil(remainingProgress / averageDailyProgress) : -1;

    const blockers = this.identifyBlockers(badge);
    const recommendations = this.generateRecommendations(badge);

    return {
      badgeId: badge.id,
      currentProgress,
      targetProgress,
      progressPercentage,
      estimatedCompletionDays,
      recentActivities,
      blockers,
      recommendations,
    };
  }

  private calculateAverageDailyProgress(activities: BadgeActivity[]): number {
    if (activities.length === 0) return 0;
    const totalProgress = activities.reduce(
      (sum, activity) => sum + activity.progressContribution,
      0
    );
    return totalProgress / Math.max(1, activities.length);
  }

  private identifyBlockers(badge: DevelopmentBadge): string[] {
    const blockers: string[] = [];

    if (badge.prerequisites) {
      const unmetPrerequisites = badge.prerequisites.filter((prereqId) => {
        const prereqBadge = this.badges.get(prereqId);
        return !prereqBadge?.isCompleted;
      });

      if (unmetPrerequisites.length > 0) {
        blockers.push(`未完了の前提条件: ${unmetPrerequisites.join(', ')}`);
      }
    }

    return blockers;
  }

  private generateRecommendations(badge: DevelopmentBadge): string[] {
    const recommendations: string[] = [];

    const incompleteRequirements = badge.requirements.filter((req) => !req.isCompleted);
    if (incompleteRequirements.length > 0) {
      const nextRequirement = incompleteRequirements[0];
      recommendations.push(`次に取り組むべき: ${nextRequirement.description}`);
    }

    return recommendations;
  }

  /**
   * 🔄 自動進捗追跡開始
   */
  private startAutoProgressTracking(): void {
    if (this.progressUpdateInterval) return;

    this.progressUpdateInterval = setInterval(
      () => {
        this.updateAllProgress();
        this.syncPageData();
      },
      5 * 60 * 1000
    ); // 5分ごと

    console.log('🔄 自動進捗追跡開始');
  }

  private updateAllProgress(): void {
    this.badges.forEach((badge, badgeId) => {
      const progress = this.calculateBadgeProgress(badge);
      this.badgeProgress.set(badgeId, progress);

      if (progress.progressPercentage >= 100 && !badge.isCompleted) {
        this.completeBadge(badgeId);
      }
    });
  }

  private completeBadge(badgeId: string): void {
    const badge = this.badges.get(badgeId);
    if (!badge) return;

    badge.isCompleted = true;
    badge.completedAt = new Date().toISOString();
    badge.progress = 100;

    toast({
      title: '🏆 バッジ完了！',
      description: `${badge.name} を獲得しました！`,
      variant: 'default',
    });

    console.log('🏆 バッジ完了:', badge.name);
  }

  private syncPageData(): void {
    this.pageData.forEach((data, pageName) => {
      data.lastUpdated = new Date().toISOString();

      const listener = this.syncListeners.get(pageName);
      if (listener) {
        listener(data);
      }
    });
  }

  /**
   * 📝 活動記録
   */
  public recordActivity(activityData: Omit<BadgeActivity, 'id' | 'timestamp'>): void {
    const activity: BadgeActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...activityData,
    };

    this.activities.push(activity);

    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }
  }

  /**
   * 📊 統計取得
   */
  public getBadgeStatistics(): BadgeStatistics {
    const allBadges = Array.from(this.badges.values());
    const completedBadges = allBadges.filter((b) => b.isCompleted);
    const inProgressBadges = allBadges.filter((b) => !b.isCompleted && b.progress > 0);
    const availableBadges = allBadges.filter((b) => !b.isCompleted && b.progress === 0);

    return {
      totalBadges: allBadges.length,
      completedBadges: completedBadges.length,
      inProgressBadges: inProgressBadges.length,
      availableBadges: availableBadges.length,
      completionRate: (completedBadges.length / allBadges.length) * 100,
      averageCompletionTime: 30,
      categoriesCompleted: {} as Record<BadgeCategory, number>,
      recentAchievements: completedBadges.slice(0, 5),
      topCategories: [],
      streakCount: 0,
      totalPoints: completedBadges.reduce((sum, b) => sum + (b.points || 0), 0),
      nextMilestone: null,
    };
  }

  // 外部API
  public registerPageSyncListener(pageName: string, listener: (data: PageSyncData) => void): void {
    this.syncListeners.set(pageName, listener);
  }

  public getPageSyncData(pageName: string): PageSyncData | undefined {
    return this.pageData.get(pageName);
  }

  public getAllBadges(): DevelopmentBadge[] {
    return Array.from(this.badges.values());
  }

  public getBadge(badgeId: string): DevelopmentBadge | undefined {
    return this.badges.get(badgeId);
  }

  public getBadgeProgress(badgeId: string): BadgeProgress | undefined {
    return this.badgeProgress.get(badgeId);
  }

  public getRecentActivities(limit: number = 20): BadgeActivity[] {
    return this.activities.slice(-limit).reverse();
  }

  public cleanup(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
    this.syncListeners.clear();
    console.log('🧹 包括的バッジサービス クリーンアップ完了');
  }

  /**
   * 📊 カテゴリメトリクス初期化
   */
  private initializeCategoryMetrics(): void {
    Object.entries(this.CATEGORY_CONFIG).forEach(([category, config]) => {
      this.categoryMetrics.set(category, {
        totalActivities: 0,
        progressContributions: 0,
        lastActivity: null,
        averageImpact: 0,
        trendDirection: 'stable',
        velocityScore: 0,
        difficultyAdjustment: 1.0,
        marketRelevance: this.calculateMarketRelevance(category),
        learningSources: [],
        milestoneAchievements: [],
      });
    });
  }

  /**
   * 📈 市場関連性計算
   */
  private calculateMarketRelevance(category: string): number {
    const highDemandCategories = ['ai_ml', 'cybersecurity', 'cicd', 'infrastructure'];
    const mediumDemandCategories = ['marketing', 'finance', 'hr', 'sustainability'];

    if (highDemandCategories.includes(category)) return 0.9;
    if (mediumDemandCategories.includes(category)) return 0.7;
    return 0.5;
  }

  /**
   * 🎯 アクティビティ記録（カテゴリ別最適化）
   */
  async recordActivity(
    activity: string,
    category: string,
    impact: number = 1,
    metadata?: any
  ): Promise<void> {
    const config = this.CATEGORY_CONFIG[category];
    if (!config) {
      console.warn(`Unknown category: ${category}`);
      return;
    }

    // カテゴリ固有の重み付け適用
    const adjustedImpact = impact * config.trackingWeight;

    const record: ActivityRecord = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity,
      category,
      impact: adjustedImpact,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        categoryConfig: config.name,
        skillAreas: config.skillAreas,
        autoTracked: this.isAutoTrackedActivity(activity, config.autoProgressTriggers),
      },
    };

    this.activityLog.push(record);
    await this.updateCategoryMetrics(category, record);
    await this.updateBadgeProgress(category, adjustedImpact);

    // カテゴリ間の相互作用を処理
    await this.handleCategoryInteractions(category, adjustedImpact);

    console.log(
      `📝 Activity recorded: ${activity} (${category}) - Impact: ${adjustedImpact.toFixed(2)}`
    );
  }

  /**
   * 🔗 カテゴリ間相互作用処理
   */
  private async handleCategoryInteractions(primaryCategory: string, impact: number): Promise<void> {
    const config = this.CATEGORY_CONFIG[primaryCategory];
    if (!config || !config.prerequisites) return;

    // 前提条件カテゴリにも影響を与える
    for (const prerequisite of config.prerequisites) {
      const spilloverImpact = impact * 0.3; // 30%の影響
      await this.updateBadgeProgress(prerequisite, spilloverImpact);
      console.log(`🔗 Spillover effect: ${prerequisite} +${spilloverImpact.toFixed(2)}`);
    }

    // 関連カテゴリの発見と相互強化
    const relatedCategories = this.findRelatedCategories(primaryCategory);
    for (const related of relatedCategories) {
      const synergyImpact = impact * 0.15; // 15%のシナジー効果
      await this.updateBadgeProgress(related, synergyImpact);
    }
  }

  /**
   * 🔍 関連カテゴリ発見
   */
  private findRelatedCategories(category: string): string[] {
    const synergies = {
      cicd: ['deployment', 'testing', 'monitoring'],
      ai_ml: ['analytics', 'data_science', 'automation'],
      marketing: ['analytics', 'content', 'social'],
      finance: ['business', 'legal', 'taxation'],
      philosophy: ['ethics', 'research', 'critical_thinking'],
      sustainability: ['social_contribution', 'economics', 'policy'],
    };

    return synergies[category] || [];
  }

  /**
   * 📊 カテゴリメトリクス更新
   */
  private async updateCategoryMetrics(category: string, record: ActivityRecord): Promise<void> {
    const metrics = this.categoryMetrics.get(category);
    if (!metrics) return;

    metrics.totalActivities++;
    metrics.progressContributions += record.impact;
    metrics.lastActivity = record.timestamp;

    // 平均影響度更新
    metrics.averageImpact = metrics.progressContributions / metrics.totalActivities;

    // 速度スコア計算
    metrics.velocityScore = this.calculateVelocityScore(category);

    // トレンド方向分析
    metrics.trendDirection = this.analyzeTrendDirection(category);

    this.categoryMetrics.set(category, metrics);
  }

  /**
   * ⚡ 速度スコア計算
   */
  private calculateVelocityScore(category: string): number {
    const recentActivities = this.activityLog.filter((a) => a.category === category).slice(-10); // 直近10件

    if (recentActivities.length === 0) return 0;

    const totalImpact = recentActivities.reduce((sum, a) => sum + a.impact, 0);
    const timeSpan = this.getTimeSpanHours(
      recentActivities[0].timestamp,
      recentActivities[recentActivities.length - 1].timestamp
    );

    return timeSpan > 0 ? totalImpact / timeSpan : 0;
  }

  /**
   * 📈 トレンド方向分析
   */
  private analyzeTrendDirection(category: string): 'accelerating' | 'stable' | 'decelerating' {
    const activities = this.activityLog.filter((a) => a.category === category).slice(-20); // 直近20件

    if (activities.length < 10) return 'stable';

    const firstHalf = activities.slice(0, 10);
    const secondHalf = activities.slice(10);

    const firstAvg = firstHalf.reduce((sum, a) => sum + a.impact, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, a) => sum + a.impact, 0) / secondHalf.length;

    const changeRate = (secondAvg - firstAvg) / firstAvg;

    if (changeRate > 0.2) return 'accelerating';
    if (changeRate < -0.2) return 'decelerating';
    return 'stable';
  }

  /**
   * 📊 カテゴリ別統計取得
   */
  getCategoryStatistics(): CategoryStatistics {
    const categories = Object.keys(this.CATEGORY_CONFIG).map((category) => {
      const metrics = this.categoryMetrics.get(category) || {
        totalActivities: 0,
        progressContributions: 0,
        lastActivity: null,
        averageImpact: 0,
        trendDirection: 'stable' as const,
        velocityScore: 0,
        difficultyAdjustment: 1.0,
        marketRelevance: 0.5,
        learningSources: [],
        milestoneAchievements: [],
      };

      return {
        category,
        name: this.CATEGORY_CONFIG[category].name,
        metrics,
        config: this.CATEGORY_CONFIG[category],
      };
    });

    return {
      categories,
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.metrics.totalActivities > 0).length,
      topPerformingCategory: categories.reduce((top, current) =>
        current.metrics.velocityScore > top.metrics.velocityScore ? current : top
      ),
      overallProgress: this.calculateOverallProgress(),
      crossCategoryInsights: this.generateCrossCategoryInsights(),
    };
  }

  /**
   * 🎯 全体進捗計算
   */
  private calculateOverallProgress(): number {
    const allBadges = this.getAllBadges();
    if (allBadges.length === 0) return 0;

    const totalProgress = allBadges.reduce((sum, badge) => sum + badge.progress, 0);
    return totalProgress / allBadges.length;
  }

  /**
   * 💡 カテゴリ横断的洞察生成
   */
  private generateCrossCategoryInsights(): string[] {
    const insights = [];
    const stats = this.categoryMetrics;

    // 最も活発なカテゴリ
    let mostActive = '';
    let maxActivities = 0;
    stats.forEach((metrics, category) => {
      if (metrics.totalActivities > maxActivities) {
        maxActivities = metrics.totalActivities;
        mostActive = category;
      }
    });

    if (mostActive) {
      insights.push(
        `最も活発: ${this.CATEGORY_CONFIG[mostActive]?.name || mostActive} (${maxActivities}件の活動)`
      );
    }

    // 成長傾向のカテゴリ
    const acceleratingCategories = Array.from(stats.entries())
      .filter(([_, metrics]) => metrics.trendDirection === 'accelerating')
      .map(([category, _]) => this.CATEGORY_CONFIG[category]?.name || category);

    if (acceleratingCategories.length > 0) {
      insights.push(`成長中: ${acceleratingCategories.join(', ')}`);
    }

    // 市場価値の高いカテゴリでの進捗
    const highValueProgress = Array.from(stats.entries())
      .filter(
        ([category, metrics]) =>
          this.CATEGORY_CONFIG[category] &&
          metrics.marketRelevance > 0.8 &&
          metrics.totalActivities > 5
      )
      .map(([category, _]) => this.CATEGORY_CONFIG[category]?.name || category);

    if (highValueProgress.length > 0) {
      insights.push(`高市場価値分野で進捗: ${highValueProgress.join(', ')}`);
    }

    return insights;
  }

  // ヘルパーメソッド
  private isAutoTrackedActivity(activity: string, triggers: string[]): boolean {
    return triggers.some((trigger) => activity.toLowerCase().includes(trigger.toLowerCase()));
  }

  private async updateBadgeProgress(category: string, impact: number): Promise<void> {
    // バッジ進捗更新のロジック（簡略化）
    console.log(`Updating badge progress for category: ${category}, impact: ${impact}`);
  }

  private getTimeSpanHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private startAutoTracking(): void {
    console.log('Auto tracking started');
  }
}

// 必要な型定義
interface ActivityRecord {
  id: string;
  activity: string;
  category: string;
  impact: number;
  timestamp: string;
  metadata?: any;
}

interface CategoryMetrics {
  totalActivities: number;
  progressContributions: number;
  lastActivity: string | null;
  averageImpact: number;
  trendDirection: 'accelerating' | 'stable' | 'decelerating';
  velocityScore: number;
  difficultyAdjustment: number;
  marketRelevance: number;
  learningSources: string[];
  milestoneAchievements: string[];
}

interface CategoryStatistics {
  categories: Array<{
    category: string;
    name: string;
    metrics: CategoryMetrics;
    config: any;
  }>;
  totalCategories: number;
  activeCategories: number;
  topPerformingCategory: any;
  overallProgress: number;
  crossCategoryInsights: string[];
}

// シングルトンインスタンスのエクスポート
export const comprehensiveBadgeService = ComprehensiveBadgeService.getInstance();
export default comprehensiveBadgeService;
