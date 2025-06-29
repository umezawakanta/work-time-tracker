/**
 * 🏆 包括的バッジシステム拡張版
 * 全分野を網羅する統合バッジ管理システム
 */

import { calculateBadgeConfidence } from '../utils/badgeConfidenceCalculator';

export interface ComprehensiveBadgeExtended {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  points: number;
  requirements: BadgeRequirement[];
  isUnlocked: boolean;
  progress: number;
  predictedCompletionDate?: string;
  actualCompletionDate?: string;
  nextMilestone?: string;
  prerequisites?: string[];
  rewards: string[];
  estimatedHours: number;
  relatedPages: string[];
  syncData: BadgeSyncData;
  weeklyPlan?: WeeklyBadgePlan;
}

export interface BadgeRequirement {
  type: string;
  target: number | string;
  current: number | string;
  description: string;
  progress?: number;
  isCompleted?: boolean;
  relatedAction?: string;
  pageIntegration?: string;
}

export interface BadgeSyncData {
  lastUpdated: Date;
  pageActivities: Record<string, number>;
  crossPageProgress: Record<string, number>;
  integrationScore: number;
  synchronizedFeatures: string[];
}

export interface WeeklyBadgePlan {
  targetWeek: number;
  startDate: string;
  endDate: string;
  estimatedCompletionDate: string;
  confidence: number;
  dependencies: string[];
  focusAreas: string[];
}

/**
 * 🔧 技術・開発系バッジ (15個)
 */
export const TECHNICAL_DEVELOPMENT_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'cicd-master',
    name: '🔄 CI/CDマスター',
    description: '継続的インテグレーション・デプロイメントの専門家',
    category: 'devops',
    subcategory: 'cicd',
    difficulty: 'platinum',
    icon: '🔄',
    points: 400,
    requirements: [
      {
        type: 'pipeline_setup',
        target: '10',
        current: '0',
        description: 'CI/CDパイプライン10個構築',
        pageIntegration: 'development-badges',
      },
      {
        type: 'automation',
        target: '15',
        current: '0',
        description: '自動化スクリプト15個作成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-15',
    rewards: ['自動化エキスパート', 'DevOps実践者'],
    estimatedHours: 35,
    relatedPages: ['development-badges', 'automation-rules', 'quality-dashboard'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 7,
      startDate: '2025-08-09',
      endDate: '2025-08-15',
      estimatedCompletionDate: '2025-08-15',
      confidence: calculateBadgeConfidence({
        difficulty: 'platinum',
        estimatedHours: 35,
        dependencies: ['cybersecurity-specialist'],
        category: 'devops',
        targetWeek: 7,
      }),
      dependencies: ['cybersecurity-specialist'],
      focusAreas: ['パイプライン構築', '自動化実装'],
    },
  },

  {
    id: 'deployment-specialist',
    name: '🚀 デプロイメントスペシャリスト',
    description: 'アプリケーションデプロイメントの専門家',
    category: 'devops',
    subcategory: 'deployment',
    difficulty: 'gold',
    icon: '🚀',
    points: 350,
    requirements: [
      {
        type: 'deployment_success',
        target: '20',
        current: '0',
        description: '成功デプロイメント20回',
        pageIntegration: 'system-monitoring',
      },
      {
        type: 'rollback_strategy',
        target: '5',
        current: '0',
        description: 'ロールバック戦略5種実装',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-08',
    rewards: ['デプロイメント最適化', 'リリース管理'],
    estimatedHours: 28,
    relatedPages: ['system-monitoring', 'performance-optimization', 'error-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 6,
      startDate: '2025-08-02',
      endDate: '2025-08-08',
      estimatedCompletionDate: '2025-08-08',
      confidence: calculateBadgeConfidence({
        difficulty: 'gold',
        estimatedHours: 28,
        dependencies: [],
        category: 'devops',
        targetWeek: 6,
      }),
      dependencies: [],
      focusAreas: ['デプロイメント戦略', 'リリース管理'],
    },
  },

  {
    id: 'hosting-architect',
    name: '🏗️ ホスティングアーキテクト',
    description: 'クラウドホスティング・インフラ設計の専門家',
    category: 'infrastructure',
    subcategory: 'hosting',
    difficulty: 'platinum',
    icon: '🏗️',
    points: 450,
    requirements: [
      {
        type: 'cloud_deployment',
        target: '8',
        current: '0',
        description: 'クラウドデプロイメント8個',
        pageIntegration: 'database-backup',
      },
      {
        type: 'orchestration',
        target: '5',
        current: '0',
        description: 'オーケストレーション環境5個構築',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-22',
    rewards: ['クラウドアーキテクチャ', 'インフラ最適化'],
    estimatedHours: 40,
    relatedPages: ['database-backup', 'system-monitoring', 'performance-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 8,
      startDate: '2025-08-16',
      endDate: '2025-08-22',
      estimatedCompletionDate: '2025-08-22',
      confidence: calculateBadgeConfidence({
        difficulty: 'platinum',
        estimatedHours: 40,
        dependencies: ['deployment-specialist'],
        category: 'infrastructure',
        targetWeek: 8,
      }),
      dependencies: ['deployment-specialist'],
      focusAreas: ['クラウドアーキテクチャ', 'スケーラビリティ'],
    },
  },

  {
    id: 'scaling-expert',
    name: '📈 スケーリングエキスパート',
    description: 'システムスケーラビリティ・パフォーマンス最適化の専門家',
    category: 'performance',
    subcategory: 'scaling',
    difficulty: 'legendary',
    icon: '📈',
    points: 500,
    requirements: [
      {
        type: 'scalability',
        target: '10',
        current: '0',
        description: 'スケーラビリティ改善10件',
        pageIntegration: 'performance-optimization',
      },
      {
        type: 'load_testing',
        target: '15',
        current: '0',
        description: '負荷テスト15回実施',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-05',
    rewards: ['パフォーマンス最適化', 'スケーラビリティ設計'],
    estimatedHours: 45,
    relatedPages: ['performance-optimization', 'performance-monitoring', 'system-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 9,
      startDate: '2025-08-23',
      endDate: '2025-09-05',
      estimatedCompletionDate: '2025-09-05',
      confidence: 75,
      dependencies: ['hosting-architect', 'performance-optimization-master'],
      focusAreas: ['負荷分散', 'パフォーマンス監視'],
    },
  },

  {
    id: 'virtualization-master',
    name: '💻 仮想化マスター',
    description: 'コンテナ・仮想化技術の専門家',
    category: 'infrastructure',
    subcategory: 'virtualization',
    difficulty: 'gold',
    icon: '💻',
    points: 380,
    requirements: [
      {
        type: 'container_deployment',
        target: '12',
        current: '0',
        description: 'コンテナデプロイメント12個',
        pageIntegration: 'system-design',
      },
      {
        type: 'orchestration',
        target: '6',
        current: '0',
        description: 'オーケストレーション環境6個',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-29',
    rewards: ['Docker最適化', 'Kubernetes管理'],
    estimatedHours: 32,
    relatedPages: ['system-design', 'database-backup', 'system-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 8,
      startDate: '2025-08-16',
      endDate: '2025-08-29',
      estimatedCompletionDate: '2025-08-29',
      confidence: 80,
      dependencies: ['deployment-specialist'],
      focusAreas: ['コンテナ最適化', 'オーケストレーション'],
    },
  },

  {
    id: 'infrastructure-engineer',
    name: '🏭 インフラエンジニア',
    description: 'インフラストラクチャ全般の専門家',
    category: 'infrastructure',
    subcategory: 'engineering',
    difficulty: 'platinum',
    icon: '🏭',
    points: 420,
    requirements: [
      {
        type: 'monitoring_setup',
        target: '10',
        current: '0',
        description: '監視システム10個構築',
        pageIntegration: 'system-monitoring',
      },
      {
        type: 'alert_configuration',
        target: '20',
        current: '0',
        description: 'アラート設定20件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-12',
    rewards: ['インフラ自動化', 'システム監視'],
    estimatedHours: 38,
    relatedPages: ['system-monitoring', 'database-backup', 'error-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 10,
      startDate: '2025-09-06',
      endDate: '2025-09-12',
      estimatedCompletionDate: '2025-09-12',
      confidence: 83,
      dependencies: ['hosting-architect', 'virtualization-master'],
      focusAreas: ['インフラ監視', 'システム最適化'],
    },
  },
];

/**
 * 📈 マーケティング・ビジネス系バッジ (15個)
 */
export const MARKETING_BUSINESS_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'marketing-strategist',
    name: '📢 マーケティングストラテジスト',
    description: 'デジタルマーケティング戦略の専門家',
    category: 'marketing',
    subcategory: 'strategy',
    difficulty: 'gold',
    icon: '📢',
    points: 380,
    requirements: [
      {
        type: 'campaign_success',
        target: '8',
        current: '0',
        description: 'マーケティング戦略8件実行',
        pageIntegration: 'blog',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-01',
    rewards: ['マーケティング戦略', 'コンテンツ企画'],
    estimatedHours: 28,
    relatedPages: ['blog', 'twitter', 'shop'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'ecommerce-specialist',
    name: '🛒 ECスペシャリスト',
    description: 'Eコマース・オンライン販売の専門家',
    category: 'ecommerce',
    subcategory: 'platform',
    difficulty: 'platinum',
    icon: '🛒',
    points: 420,
    requirements: [
      {
        type: 'revenue_generation',
        target: '100000',
        current: '0',
        description: '売上10万円達成',
        pageIntegration: 'shop',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-22',
    rewards: ['EC運営', 'コンバージョン最適化'],
    estimatedHours: 35,
    relatedPages: ['shop', 'product-list', 'subscription'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },
];

/**
 * 💼 経営・管理系バッジ (20個)
 */
export const MANAGEMENT_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'legal-compliance-specialist',
    name: '⚖️ 法務コンプライアンススペシャリスト',
    description: '法務・コンプライアンス管理の専門家',
    category: 'legal',
    difficulty: 'platinum',
    icon: '⚖️',
    points: 450,
    requirements: [
      {
        type: 'compliance_audit',
        target: '5',
        current: '0',
        description: 'コンプライアンス監査5件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-05',
    rewards: ['法務知識', 'リスク管理'],
    estimatedHours: 40,
    relatedPages: ['admin-dashboard', 'reports'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'hr-strategic-partner',
    name: '👥 HR戦略パートナー',
    description: '人事戦略・組織開発の専門家',
    category: 'hr',
    difficulty: 'gold',
    icon: '👥',
    points: 400,
    requirements: [
      {
        type: 'team_development',
        target: '10',
        current: '0',
        description: 'チーム開発プログラム10件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-29',
    rewards: ['人事戦略', '組織開発'],
    estimatedHours: 32,
    relatedPages: ['skill-mapping', 'team-management'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'financial-analyst',
    name: '💰 財務アナリスト',
    description: '財務分析・会計管理の専門家',
    category: 'finance',
    difficulty: 'platinum',
    icon: '💰',
    points: 420,
    requirements: [
      {
        type: 'financial_analysis',
        target: '15',
        current: '0',
        description: '財務分析レポート15件',
        pageIntegration: 'asset-liability-report',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-12',
    rewards: ['財務分析', '投資戦略'],
    estimatedHours: 38,
    relatedPages: ['asset-liability-report', 'subscription', 'billing-history'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'sales-growth-hacker',
    name: '🚀 セールスグロースハッカー',
    description: '営業戦略・成長促進の専門家',
    category: 'sales',
    difficulty: 'gold',
    icon: '🚀',
    points: 380,
    requirements: [
      {
        type: 'sales_growth',
        target: '200',
        current: '0',
        description: '売上200%成長達成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-15',
    rewards: ['営業戦略', 'グロースハック'],
    estimatedHours: 30,
    relatedPages: ['shop', 'twitter', 'blog'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'executive-secretary',
    name: '📋 エグゼクティブ秘書',
    description: '経営サポート・秘書業務の専門家',
    category: 'administration',
    difficulty: 'silver',
    icon: '📋',
    points: 300,
    requirements: [
      {
        type: 'executive_support',
        target: '50',
        current: '0',
        description: '経営サポート業務50件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-07-30',
    rewards: ['秘書スキル', '経営サポート'],
    estimatedHours: 25,
    relatedPages: ['calendar', 'todo-management', 'reports'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },
];

/**
 * 🎓 教育・社会貢献系バッジ (15個)
 */
export const EDUCATION_SOCIAL_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'education-specialist',
    name: '🎓 教育スペシャリスト',
    description: '教育・学習支援の専門家',
    category: 'education',
    difficulty: 'gold',
    icon: '🎓',
    points: 380,
    requirements: [
      {
        type: 'learning_program',
        target: '10',
        current: '0',
        description: '学習プログラム10件開発',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-08',
    rewards: ['教育スキル', '学習支援'],
    estimatedHours: 32,
    relatedPages: ['blog', 'achievements-badges', 'skill-mapping'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'social-contribution-advocate',
    name: '🌍 社会貢献推進者',
    description: '社会問題解決・貢献活動の専門家',
    category: 'social',
    difficulty: 'platinum',
    icon: '🌍',
    points: 450,
    requirements: [
      {
        type: 'social_impact',
        target: '5',
        current: '0',
        description: '社会貢献プロジェクト5件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-01',
    rewards: ['社会貢献', 'プロジェクト管理'],
    estimatedHours: 40,
    relatedPages: ['blog', 'twitter', 'political-trends'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'certification-expert',
    name: '📜 資格取得エキスパート',
    description: '各種資格・認定取得の専門家',
    category: 'certification',
    difficulty: 'silver',
    icon: '📜',
    points: 320,
    requirements: [
      {
        type: 'certifications_earned',
        target: '8',
        current: '0',
        description: '資格・認定8個取得',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-25',
    rewards: ['資格取得', '専門知識'],
    estimatedHours: 28,
    relatedPages: ['achievements-badges', 'development-badges'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },
];

/**
 * 🎨 クリエイティブ・人文系バッジ (20個)
 */
export const CREATIVE_HUMANITIES_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'digital-artist-curator',
    name: '🎨 デジタルアーティスト・キュレーター',
    description: 'デジタルアート・文化キュレーションの専門家',
    category: 'art',
    difficulty: 'platinum',
    icon: '🎨',
    points: 450,
    requirements: [
      {
        type: 'art_curation',
        target: '20',
        current: '0',
        description: 'アート作品キュレーション20件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-08',
    rewards: ['アートスキル', 'キュレーション'],
    estimatedHours: 38,
    relatedPages: ['blog', 'twitter', 'shop'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'multilingual-localization-expert',
    name: '🌐 多言語ローカライゼーションエキスパート',
    description: '多言語対応・国際化の専門家',
    category: 'localization',
    difficulty: 'gold',
    icon: '🌐',
    points: 400,
    requirements: [
      {
        type: 'language_support',
        target: '5',
        current: '0',
        description: '5言語対応実装',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-20',
    rewards: ['多言語対応', '国際化'],
    estimatedHours: 35,
    relatedPages: ['internationalization', 'localization'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'digital-publishing-master',
    name: '📚 デジタル出版マスター',
    description: 'デジタル出版・編集の専門家',
    category: 'publishing',
    difficulty: 'gold',
    icon: '📚',
    points: 380,
    requirements: [
      {
        type: 'publications',
        target: '10',
        current: '0',
        description: 'デジタル出版物10件',
        pageIntegration: 'blog',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-30',
    rewards: ['出版スキル', '編集技術'],
    estimatedHours: 32,
    relatedPages: ['blog', 'bookshelf', 'twitter'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'philosophy-technology-bridge',
    name: '🤔 テクノロジー哲学者',
    description: '技術哲学・デジタル倫理の専門家',
    category: 'philosophy',
    difficulty: 'legendary',
    icon: '🤔',
    points: 500,
    requirements: [
      {
        type: 'philosophical_analysis',
        target: '15',
        current: '0',
        description: '技術哲学分析15件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-15',
    rewards: ['技術哲学', 'デジタル倫理'],
    estimatedHours: 45,
    relatedPages: ['blog', 'ai-ethics', 'development-badges'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'digital-spirituality-guide',
    name: '🧘 デジタルスピリチュアリティガイド',
    description: 'デジタル時代の精神性・宗教の専門家',
    category: 'spirituality',
    difficulty: 'platinum',
    icon: '🧘',
    points: 420,
    requirements: [
      {
        type: 'spiritual_guidance',
        target: '25',
        current: '0',
        description: 'スピリチュアルガイダンス25件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-10',
    rewards: ['精神性ガイド', 'デジタル瞑想'],
    estimatedHours: 38,
    relatedPages: ['adhd-support', 'impulse-tracker', 'abstinence-manager'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },
];

/**
 * 📋 プロジェクト管理・ビジネス系バッジ (10個)
 */
export const PROJECT_BUSINESS_BADGES: ComprehensiveBadgeExtended[] = [
  {
    id: 'product-manager',
    name: '📋 プロダクトマネージャー',
    description: 'プロダクト戦略・管理の専門家',
    category: 'management',
    subcategory: 'product',
    difficulty: 'platinum',
    icon: '📋',
    points: 450,
    requirements: [
      {
        type: 'project_completion',
        target: '8',
        current: '0',
        description: 'プロジェクト完了8件',
        pageIntegration: 'wbs-creation',
      },
      {
        type: 'team_satisfaction',
        target: '85',
        current: '0',
        description: 'チーム満足度85%以上',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-15',
    rewards: ['プロダクト戦略', 'チーム管理'],
    estimatedHours: 35,
    relatedPages: ['wbs-creation', 'ai-wbs-generation', 'improvement-planning'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 7,
      startDate: '2025-08-09',
      endDate: '2025-08-15',
      estimatedCompletionDate: '2025-08-15',
      confidence: 88,
      dependencies: [],
      focusAreas: ['プロダクト戦略', 'チーム管理'],
    },
  },

  {
    id: 'requirements-analyst',
    name: '📊 要件定義スペシャリスト',
    description: 'システム要件分析・定義の専門家',
    category: 'analysis',
    subcategory: 'requirements',
    difficulty: 'gold',
    icon: '📊',
    points: 350,
    requirements: [
      {
        type: 'sprint_velocity',
        target: '12',
        current: '0',
        description: 'スプリント速度12以上',
        pageIntegration: 'wbs-creation',
      },
      {
        type: 'retrospective_insights',
        target: '6',
        current: '0',
        description: 'レトロスペクティブ洞察6件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-01',
    rewards: ['要件分析', 'ステークホルダー管理'],
    estimatedHours: 28,
    relatedPages: ['wbs-creation', 'improvement-planning', 'ai-wbs-generation'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 5,
      startDate: '2025-07-26',
      endDate: '2025-08-01',
      estimatedCompletionDate: '2025-08-01',
      confidence: 85,
      dependencies: [],
      focusAreas: ['要件定義', 'ビジネス分析'],
    },
  },

  {
    id: 'skill-mapping-expert',
    name: '🗺️ スキルマップエキスパート',
    description: 'チームスキル評価・マッピングの専門家',
    category: 'management',
    subcategory: 'skills',
    difficulty: 'silver',
    icon: '🗺️',
    points: 320,
    requirements: [
      {
        type: 'skill_assessment',
        target: '15',
        current: '0',
        description: 'スキル評価15件',
        pageIntegration: 'development-badges',
      },
      {
        type: 'development_plan',
        target: '8',
        current: '0',
        description: '開発計画8件作成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-07-25',
    rewards: ['スキル分析', '人材育成計画'],
    estimatedHours: 25,
    relatedPages: ['development-badges', 'badge-showcase', 'achievements-badges'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 4,
      startDate: '2025-07-19',
      endDate: '2025-07-25',
      estimatedCompletionDate: '2025-07-25',
      confidence: 90,
      dependencies: [],
      focusAreas: ['スキル評価', 'チーム分析'],
    },
  },

  {
    id: 'agile-coach',
    name: '🔄 アジャイルコーチ',
    description: 'アジャイル開発・スクラム実践の専門家',
    category: 'methodology',
    subcategory: 'agile',
    difficulty: 'platinum',
    icon: '🔄',
    points: 400,
    requirements: [
      {
        type: 'strategy_development',
        target: '5',
        current: '0',
        description: 'アジャイル戦略5件開発',
        pageIntegration: 'improvement-planning',
      },
      {
        type: 'roi_improvement',
        target: '25',
        current: '0',
        description: 'ROI改善25%以上',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-08-22',
    rewards: ['アジャイル実践', 'チームコーチング'],
    estimatedHours: 32,
    relatedPages: ['improvement-planning', 'wbs-creation', 'quality-dashboard'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 8,
      startDate: '2025-08-16',
      endDate: '2025-08-22',
      estimatedCompletionDate: '2025-08-22',
      confidence: 80,
      dependencies: ['requirements-analyst', 'skill-mapping-expert'],
      focusAreas: ['アジャイル実践', 'プロセス改善'],
    },
  },

  {
    id: 'devops-evangelist',
    name: '🚀 DevOpsエバンジェリスト',
    description: 'DevOps文化・実践の推進者',
    category: 'devops',
    subcategory: 'culture',
    difficulty: 'legendary',
    icon: '🚀',
    points: 500,
    requirements: [
      {
        type: 'business_launch',
        target: '3',
        current: '0',
        description: 'DevOps変革プロジェクト3件',
        pageIntegration: 'automation-rules',
      },
      {
        type: 'revenue_generation',
        target: '500000',
        current: '0',
        description: '効率化による500万円のコスト削減',
      },
    ],
    isUnlocked: false,
    progress: 0,
    predictedCompletionDate: '2025-09-19',
    rewards: ['DevOps実践', '組織変革'],
    estimatedHours: 50,
    relatedPages: ['automation-rules', 'development-badges', 'system-monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
    weeklyPlan: {
      targetWeek: 11,
      startDate: '2025-09-13',
      endDate: '2025-09-19',
      estimatedCompletionDate: '2025-09-19',
      confidence: 75,
      dependencies: ['cicd-master', 'agile-coach'],
      focusAreas: ['DevOps文化', '組織変革'],
    },
  },
];

/**
 * 🌟 全バッジ統合コレクション
 */
export const ALL_COMPREHENSIVE_BADGES_EXTENDED: ComprehensiveBadgeExtended[] = [
  ...TECHNICAL_DEVELOPMENT_BADGES,
  ...PROJECT_BUSINESS_BADGES,
  ...MARKETING_BUSINESS_BADGES,
  ...MANAGEMENT_BADGES,
  ...EDUCATION_SOCIAL_BADGES,
  ...CREATIVE_HUMANITIES_BADGES,
];

/**
 * 📊 バッジ統計情報
 */
export const BADGE_STATISTICS = {
  totalBadges: ALL_COMPREHENSIVE_BADGES_EXTENDED.length,
  totalPoints: ALL_COMPREHENSIVE_BADGES_EXTENDED.reduce((sum, badge) => sum + badge.points, 0),
  totalHours: ALL_COMPREHENSIVE_BADGES_EXTENDED.reduce(
    (sum, badge) => sum + badge.estimatedHours,
    0
  ),
  categories: {
    technical: TECHNICAL_DEVELOPMENT_BADGES.length,
    business: PROJECT_BUSINESS_BADGES.length,
    marketing: MARKETING_BUSINESS_BADGES.length,
    management: MANAGEMENT_BADGES.length,
    education: EDUCATION_SOCIAL_BADGES.length,
    creative: CREATIVE_HUMANITIES_BADGES.length,
  },
  difficulty: {
    bronze: ALL_COMPREHENSIVE_BADGES_EXTENDED.filter((b) => b.difficulty === 'bronze').length,
    silver: ALL_COMPREHENSIVE_BADGES_EXTENDED.filter((b) => b.difficulty === 'silver').length,
    gold: ALL_COMPREHENSIVE_BADGES_EXTENDED.filter((b) => b.difficulty === 'gold').length,
    platinum: ALL_COMPREHENSIVE_BADGES_EXTENDED.filter((b) => b.difficulty === 'platinum').length,
    legendary: ALL_COMPREHENSIVE_BADGES_EXTENDED.filter((b) => b.difficulty === 'legendary').length,
  },
};

/**
 * 🎯 週次学習計画マッピング
 */
export const WEEKLY_BADGE_MAPPING = {
  week1: ['cybersecurity-specialist'],
  week2: ['cybersecurity-specialist'],
  week3: ['cybersecurity-specialist'],
  week4: ['cybersecurity-specialist', 'skill-mapping-expert'],
  week5: ['accessibility-champion', 'ux-research-specialist', 'requirements-analyst'],
  week6: ['operational-excellence', 'performance-optimization-master', 'deployment-specialist'],
  week7: ['full-stack-architect', 'data-science-expert', 'cicd-master', 'product-manager'],
  week8: [
    'ai-ethics-specialist',
    'blockchain-developer',
    'quantum-computing-researcher',
    'cloud-architect-master',
    'sustainable-tech-advocate',
    'hosting-architect',
    'virtualization-master',
    'agile-coach',
  ],
  week9: ['scaling-expert'],
  week10: ['infrastructure-engineer'],
  week11: ['devops-evangelist'],
  week12: ['全バッジ統合完了'],
} as const;
