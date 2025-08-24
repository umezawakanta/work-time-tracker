/**
 * 🏆 包括的バッジカテゴリ定義
 * 全分野のバッジカテゴリとその詳細を定義
 */

export interface ComprehensiveBadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentCategory?: string;
  subcategories?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  requiredSkills: string[];
  estimatedHours: number;
  prerequisites?: string[];
}

export const COMPREHENSIVE_BADGE_CATEGORIES: ComprehensiveBadgeCategory[] = [
  // 🔧 技術基盤・インフラ
  {
    id: 'cicd-deployment',
    name: 'CI/CD・デプロイメント',
    description: '継続的インテグレーション・継続的デプロイメント',
    icon: '🚀',
    difficulty: 'advanced',
    requiredSkills: ['Docker', 'Jenkins', 'GitHub Actions', 'DevOps'],
    estimatedHours: 120,
  },
  {
    id: 'hosting-infrastructure',
    name: 'ホスティング・インフラ',
    description: 'クラウドホスティング・インフラ管理',
    icon: '☁️',
    difficulty: 'advanced',
    requiredSkills: ['AWS', 'Azure', 'GCP', 'サーバー管理'],
    estimatedHours: 150,
  },
  {
    id: 'scaling-performance',
    name: 'スケーリング・パフォーマンス',
    description: 'システムスケーリング・パフォーマンス最適化',
    icon: '📈',
    difficulty: 'expert',
    requiredSkills: ['負荷分散', 'キャッシング', 'DB最適化'],
    estimatedHours: 200,
  },
  {
    id: 'virtualization-container',
    name: '仮想化・コンテナ',
    description: '仮想化技術・コンテナオーケストレーション',
    icon: '🔧',
    difficulty: 'advanced',
    requiredSkills: ['Docker', 'Kubernetes', 'VM管理'],
    estimatedHours: 100,
  },

  // 📋 プロジェクト管理・企画
  {
    id: 'product-management',
    name: 'プロダクトマネジメント',
    description: 'プロダクト戦略・ロードマップ管理',
    icon: '📊',
    difficulty: 'advanced',
    requiredSkills: ['戦略立案', 'ロードマップ', 'KPI管理'],
    estimatedHours: 120,
  },
  {
    id: 'requirement-analysis',
    name: '要件定義・分析',
    description: 'システム要件定義・業務分析',
    icon: '📝',
    difficulty: 'intermediate',
    requiredSkills: ['要件分析', 'ヒアリング', 'ドキュメント作成'],
    estimatedHours: 80,
  },
  {
    id: 'skill-mapping',
    name: 'スキルマップ・人材管理',
    description: 'チームスキル管理・育成計画',
    icon: '🗺️',
    difficulty: 'intermediate',
    requiredSkills: ['人材評価', '育成計画', 'スキル分析'],
    estimatedHours: 60,
  },
  {
    id: 'agile-scrum',
    name: 'アジャイル・スクラム',
    description: 'アジャイル開発・スクラム実践',
    icon: '🔄',
    difficulty: 'intermediate',
    requiredSkills: ['スクラム', 'カンバン', 'スプリント管理'],
    estimatedHours: 90,
  },

  // 🎨 デザイン・UX
  {
    id: 'ui-ux-design',
    name: 'UI・UXデザイン',
    description: 'ユーザーインターフェース・エクスペリエンス設計',
    icon: '🎨',
    difficulty: 'intermediate',
    requiredSkills: ['デザイン思考', 'プロトタイピング', 'ユーザビリティテスト'],
    estimatedHours: 100,
  },
  {
    id: 'system-design',
    name: 'システム設計・アーキテクチャ',
    description: 'システムアーキテクチャ・技術設計',
    icon: '🏗️',
    difficulty: 'expert',
    requiredSkills: ['アーキテクチャ設計', '技術選定', 'スケーラビリティ'],
    estimatedHours: 180,
  },

  // 🧪 品質・テスト
  {
    id: 'testing-qa',
    name: 'テスト・品質保証',
    description: 'ソフトウェアテスト・品質管理',
    icon: '🧪',
    difficulty: 'intermediate',
    requiredSkills: ['自動テスト', 'テスト設計', '品質管理'],
    estimatedHours: 90,
  },
  {
    id: 'monitoring-operations',
    name: '監視・運用',
    description: 'システム監視・運用管理',
    icon: '📊',
    difficulty: 'advanced',
    requiredSkills: ['監視設定', 'ログ分析', 'インシデント対応'],
    estimatedHours: 110,
  },

  // 📈 マーケティング・ビジネス
  {
    id: 'marketing-promotion',
    name: 'マーケティング・プロモーション',
    description: 'デジタルマーケティング・プロモーション戦略',
    icon: '📢',
    difficulty: 'intermediate',
    requiredSkills: ['SEO', 'SNSマーケティング', 'コンテンツマーケティング'],
    estimatedHours: 80,
  },
  {
    id: 'monetization-business',
    name: 'マネタイズ・ビジネス戦略',
    description: '収益化戦略・ビジネスモデル設計',
    icon: '💰',
    difficulty: 'advanced',
    requiredSkills: ['ビジネスモデル', '収益分析', '価格戦略'],
    estimatedHours: 120,
  },
  {
    id: 'ecommerce-sales',
    name: 'EC・オンライン販売',
    description: 'Eコマース・オンライン販売システム',
    icon: '🛒',
    difficulty: 'intermediate',
    requiredSkills: ['ECサイト構築', '決済システム', '在庫管理'],
    estimatedHours: 100,
  },

  // 🎮 コンテンツ・エンターテイメント
  {
    id: 'social-media',
    name: 'SNS・ソーシャルメディア',
    description: 'ソーシャルメディア戦略・コミュニティ管理',
    icon: '📱',
    difficulty: 'beginner',
    requiredSkills: ['SNS運用', 'コミュニティ管理', 'エンゲージメント分析'],
    estimatedHours: 50,
  },
  {
    id: 'video-content',
    name: '動画制作・コンテンツ',
    description: '動画制作・マルチメディアコンテンツ',
    icon: '🎬',
    difficulty: 'intermediate',
    requiredSkills: ['動画編集', 'ストーリーボード', 'コンテンツ企画'],
    estimatedHours: 90,
  },
  {
    id: 'game-development',
    name: 'ゲーム開発',
    description: 'ゲーム設計・開発・運営',
    icon: '🎮',
    difficulty: 'advanced',
    requiredSkills: ['ゲーム設計', 'Unity/Unreal', 'ゲームバランス'],
    estimatedHours: 200,
  },

  // 🤖 AI・先端技術
  {
    id: 'artificial-intelligence',
    name: 'AI・機械学習',
    description: '人工知能・機械学習・データサイエンス',
    icon: '🤖',
    difficulty: 'expert',
    requiredSkills: ['機械学習', 'Python', 'データ分析', 'モデル構築'],
    estimatedHours: 250,
  },

  // 💼 起業・投資
  {
    id: 'entrepreneurship',
    name: '起業・スタートアップ',
    description: '起業・スタートアップ運営',
    icon: '🚀',
    difficulty: 'expert',
    requiredSkills: ['事業計画', 'ピッチ', 'チームビルディング'],
    estimatedHours: 300,
  },
  {
    id: 'investment-finance',
    name: '投資・資金調達',
    description: '投資戦略・資金調達・財務管理',
    icon: '💹',
    difficulty: 'advanced',
    requiredSkills: ['投資分析', '財務モデリング', '資金調達'],
    estimatedHours: 150,
  },

  // ⚖️ 法務・コンプライアンス
  {
    id: 'legal-affairs',
    name: '法務・コンプライアンス',
    description: '法的事務・コンプライアンス管理',
    icon: '⚖️',
    difficulty: 'advanced',
    requiredSkills: ['契約書作成', '法的リスク管理', 'コンプライアンス'],
    estimatedHours: 120,
  },
  {
    id: 'labor-hr',
    name: '労務・人事',
    description: '労務管理・人事制度設計',
    icon: '👥',
    difficulty: 'intermediate',
    requiredSkills: ['労務管理', '人事制度', '採用・育成'],
    estimatedHours: 100,
  },

  // 💼 営業・財務
  {
    id: 'sales-business',
    name: '営業・ビジネス開発',
    description: '営業戦略・ビジネス開発',
    icon: '🤝',
    difficulty: 'intermediate',
    requiredSkills: ['営業戦略', '提案スキル', '顧客管理'],
    estimatedHours: 80,
  },
  {
    id: 'tax-accounting',
    name: '税務・会計',
    description: '税務処理・会計管理',
    icon: '📊',
    difficulty: 'advanced',
    requiredSkills: ['税務知識', '会計処理', '財務分析'],
    estimatedHours: 130,
  },
  {
    id: 'executive-management',
    name: '秘書・経営サポート',
    description: '経営サポート・秘書業務',
    icon: '📋',
    difficulty: 'intermediate',
    requiredSkills: ['スケジュール管理', '文書作成', '会議運営'],
    estimatedHours: 70,
  },

  // 🌱 社会・教育
  {
    id: 'social-contribution',
    name: '社会貢献・CSR',
    description: '社会貢献活動・CSR推進',
    icon: '🌱',
    difficulty: 'intermediate',
    requiredSkills: ['CSR企画', '社会課題分析', 'ステークホルダー管理'],
    estimatedHours: 90,
  },
  {
    id: 'education-training',
    name: '教育・研修',
    description: '教育プログラム設計・研修運営',
    icon: '📚',
    difficulty: 'intermediate',
    requiredSkills: ['カリキュラム設計', '研修運営', '学習効果測定'],
    estimatedHours: 100,
  },
  {
    id: 'certification-learning',
    name: '資格取得・学習',
    description: '資格試験対策・継続学習',
    icon: '🎓',
    difficulty: 'beginner',
    requiredSkills: ['学習計画', '試験対策', '知識体系化'],
    estimatedHours: 60,
  },

  // 📢 情報発信・コミュニケーション
  {
    id: 'content-publishing',
    name: '情報発信・パブリッシング',
    description: 'コンテンツ発信・パブリッシング',
    icon: '📢',
    difficulty: 'beginner',
    requiredSkills: ['コンテンツ企画', 'ライティング', 'メディア運営'],
    estimatedHours: 50,
  },

  // 🏛️ 政治・経済・社会
  {
    id: 'political-analysis',
    name: '政治・政策分析',
    description: '政治動向・政策分析',
    icon: '🏛️',
    difficulty: 'advanced',
    requiredSkills: ['政策分析', '政治情勢理解', '公共政策'],
    estimatedHours: 120,
  },
  {
    id: 'economic-analysis',
    name: '経済・市場分析',
    description: '経済動向・市場分析',
    icon: '📈',
    difficulty: 'advanced',
    requiredSkills: ['経済分析', '市場調査', 'データ解釈'],
    estimatedHours: 110,
  },

  // 🤔 哲学・思想・文化
  {
    id: 'philosophy-ethics',
    name: '哲学・倫理学',
    description: '哲学的思考・倫理的判断',
    icon: '🤔',
    difficulty: 'advanced',
    requiredSkills: ['哲学的思考', '倫理的判断', '論理的分析'],
    estimatedHours: 150,
  },
  {
    id: 'religion-spirituality',
    name: '宗教・精神性',
    description: '宗教研究・精神的探求',
    icon: '🙏',
    difficulty: 'advanced',
    requiredSkills: ['宗教学', '比較宗教', '精神的洞察'],
    estimatedHours: 140,
  },
  {
    id: 'history-culture',
    name: '歴史・文化研究',
    description: '歴史研究・文化分析',
    icon: '📜',
    difficulty: 'intermediate',
    requiredSkills: ['歴史研究', '文化分析', 'アーカイブ管理'],
    estimatedHours: 100,
  },

  // 🎨 芸術・表現
  {
    id: 'arts-creativity',
    name: '芸術・創造性',
    description: '芸術創作・創造的表現',
    icon: '🎨',
    difficulty: 'intermediate',
    requiredSkills: ['芸術創作', '美的感覚', '表現技法'],
    estimatedHours: 120,
  },

  // 🌐 言語・文学
  {
    id: 'language-linguistics',
    name: '語学・言語学',
    description: '言語習得・言語研究',
    icon: '🌐',
    difficulty: 'intermediate',
    requiredSkills: ['多言語習得', '言語分析', '翻訳・通訳'],
    estimatedHours: 200,
  },
  {
    id: 'literature-writing',
    name: '文学・創作',
    description: '文学創作・創作活動',
    icon: '✍️',
    difficulty: 'intermediate',
    requiredSkills: ['創作技法', '文学理論', '批評分析'],
    estimatedHours: 150,
  },
  {
    id: 'publishing-editing',
    name: '出版・編集',
    description: '出版業務・編集作業',
    icon: '📖',
    difficulty: 'intermediate',
    requiredSkills: ['編集技術', '出版流通', 'コンテンツ管理'],
    estimatedHours: 90,
  },
];

/**
 * 🏆 バッジカテゴリマッピング
 * ページとバッジカテゴリの関連付け
 */
export const PAGE_CATEGORY_MAPPING: Record<string, string[]> = {
  home: ['product-management', 'executive-management'],
  'integrated-dashboard': ['monitoring-operations', 'system-design'],
  'todo-management': ['product-management', 'agile-scrum'],
  'automation-rules': ['cicd-deployment', 'monitoring-operations'],
  'attendance-management': ['labor-hr', 'executive-management'],
  reports: ['monitoring-operations', 'tax-accounting'],
  diary: ['content-publishing', 'literature-writing'],
  'impulse-tracker': ['philosophy-ethics', 'education-training'],
  'abstinence-management': ['philosophy-ethics', 'education-training'],
  'adhd-support': ['education-training', 'social-contribution'],
  blog: ['content-publishing', 'marketing-promotion'],
  bookshelf: ['literature-writing', 'education-training'],
  'asset-calendar': ['investment-finance', 'tax-accounting'],
  'asset-liability-report': ['tax-accounting', 'investment-finance'],
  subscription: ['monetization-business', 'ecommerce-sales'],
  'billing-history': ['tax-accounting', 'monetization-business'],
  'development-badges': ['system-design', 'testing-qa'],
  'badge-prediction': ['artificial-intelligence', 'monitoring-operations'],
  'badge-showcase': ['marketing-promotion', 'content-publishing'],
  'quality-dashboard': ['testing-qa', 'monitoring-operations'],
  'error-monitoring': ['monitoring-operations', 'testing-qa'],
  'performance-monitoring': ['scaling-performance', 'monitoring-operations'],
  'cross-browser-testing': ['testing-qa', 'ui-ux-design'],
  'performance-optimization': ['scaling-performance', 'system-design'],
  'database-backup': ['monitoring-operations', 'system-design'],
  'system-monitoring': ['monitoring-operations', 'scaling-performance'],
  'wbs-creation': ['product-management', 'agile-scrum'],
  'ai-wbs-generation': ['artificial-intelligence', 'product-management'],
  'data-visualization': ['artificial-intelligence', 'ui-ux-design'],
  gamification: ['game-development', 'ui-ux-design'],
  'improvement-planning': ['product-management', 'agile-scrum'],
  'system-design': ['system-design', 'virtualization-container'],
  'pwa-features': ['system-design', 'ui-ux-design'],
  neurodiverse: ['social-contribution', 'education-training'],
  'guitar-practice': ['arts-creativity', 'education-training'],
  shop: ['ecommerce-sales', 'marketing-promotion'],
  'product-list': ['ecommerce-sales', 'ui-ux-design'],
  twitter: ['social-media', 'marketing-promotion'],
  'political-trends': ['political-analysis', 'economic-analysis'],
  'election-candidates': ['political-analysis', 'social-contribution'],
  'candidate-registration': ['political-analysis', 'legal-affairs'],
  calendar: ['executive-management', 'product-management'],
  'admin-dashboard': ['monitoring-operations', 'system-design'],
  'api-testing': ['testing-qa', 'system-design'],
  profile: ['executive-management', 'content-publishing'],
  settings: ['system-design', 'executive-management'],
  'achievements-badges': ['gamification', 'marketing-promotion'],
};

/**
 * 🎯 バッジ取得優先度マッピング
 */
export const BADGE_PRIORITY_MATRIX = {
  critical: ['system-design', 'monitoring-operations', 'testing-qa'],
  high: ['product-management', 'cicd-deployment', 'artificial-intelligence'],
  medium: ['ui-ux-design', 'marketing-promotion', 'agile-scrum'],
  low: ['content-publishing', 'social-media', 'arts-creativity'],
} as const;

/**
 * 🏆 包括的バッジカテゴリシステム
 * 全分野を網羅する包括的なバッジ管理システム
 */

export interface ComprehensiveBadge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  subcategory?: string;
  difficulty: BadgeDifficulty;
  icon: string;
  points: number;
  requirements: BadgeRequirement[];
  isUnlocked: boolean;
  progress: number;
  nextMilestone?: string;
  prerequisites?: string[];
  rewards: string[];
  estimatedHours: number;
  relatedPages: string[];
  syncData: BadgeSyncData;
}

export interface BadgeRequirement {
  type: RequirementType;
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

export type BadgeCategory =
  // 技術・開発系
  | 'cybersecurity'
  | 'development'
  | 'infrastructure'
  | 'devops'
  | 'ci-cd'
  | 'deployment'
  | 'hosting'
  | 'scaling'
  | 'virtualization'
  | 'testing'
  | 'monitoring'
  | 'maintenance'
  | 'performance'
  | 'quality'
  | 'design-system'
  | 'architecture'

  // プロジェクト管理・ビジネス系
  | 'project-management'
  | 'product-management'
  | 'requirements'
  | 'agile'
  | 'scrum'
  | 'skill-mapping'
  | 'specification'
  | 'planning'
  | 'estimation'
  | 'budgeting'

  // デザイン・UX系
  | 'design'
  | 'ux-ui'
  | 'visual-design'
  | 'interaction-design'
  | 'user-research'
  | 'prototyping'
  | 'accessibility'
  | 'branding'

  // ビジネス・マーケティング系
  | 'marketing'
  | 'promotion'
  | 'monetization'
  | 'ecommerce'
  | 'social-media'
  | 'content-creation'
  | 'video-production'
  | 'gaming'
  | 'ai-ml'

  // 起業・投資系
  | 'entrepreneurship'
  | 'investment'
  | 'fundraising'
  | 'business-planning'
  | 'strategy'
  | 'innovation'
  | 'growth-hacking'

  // 法務・人事・財務系
  | 'legal'
  | 'hr'
  | 'labor-relations'
  | 'sales'
  | 'taxation'
  | 'finance'
  | 'accounting'
  | 'secretary'
  | 'management'
  | 'leadership'

  // 社会・教育系
  | 'social-contribution'
  | 'education'
  | 'learning'
  | 'certification'
  | 'information-sharing'
  | 'community-building'
  | 'mentoring'

  // 政治・経済・学術系
  | 'politics'
  | 'economics'
  | 'philosophy'
  | 'religion'
  | 'history'
  | 'culture'
  | 'arts'
  | 'language'
  | 'literature'
  | 'publishing'
  | 'editing'
  | 'research'
  | 'analysis';

export type BadgeDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export type RequirementType =
  | 'time_spent'
  | 'tasks_completed'
  | 'pages_visited'
  | 'features_used'
  | 'projects_created'
  | 'assessments_passed'
  | 'skills_demonstrated'
  | 'content_created'
  | 'collaborations'
  | 'improvements_made'
  | 'problems_solved'
  | 'goals_achieved'
  | 'certifications_earned'
  | 'contributions_made'
  | 'innovations_implemented'
  | 'data_analyzed'
  | 'reports_generated'
  | 'presentations_given'
  | 'trainings_completed';

/**
 * 🎯 技術・開発系バッジ群
 */
export const TECHNICAL_BADGES: ComprehensiveBadge[] = [
  // CI/CD・DevOps
  {
    id: 'cicd-specialist',
    name: '🔄 CI/CDスペシャリスト',
    description: '継続的インテグレーション・デプロイメントの専門家',
    category: 'ci-cd',
    difficulty: 'platinum',
    icon: '🔄',
    points: 400,
    requirements: [
      {
        type: 'projects_created',
        target: '10',
        current: '0',
        description: 'CI/CDパイプライン10個構築',
        relatedAction: 'create_pipeline',
        pageIntegration: 'quality-dashboard',
      },
      {
        type: 'time_spent',
        target: '40',
        current: '0',
        description: 'CI/CD学習40時間',
        relatedAction: 'study_cicd',
      },
    ],
    isUnlocked: true,
    progress: 0,
    nextMilestone: 'GitHub Actions設定',
    prerequisites: [],
    rewards: ['自動化エキスパート', 'デプロイ効率化'],
    estimatedHours: 40,
    relatedPages: ['quality-dashboard', 'github-integration', 'deployment'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'deployment-master',
    name: '🚀 デプロイメントマスター',
    description: 'アプリケーション展開とリリース管理の専門家',
    category: 'deployment',
    difficulty: 'gold',
    icon: '🚀',
    points: 350,
    requirements: [
      {
        type: 'projects_created',
        target: '15',
        current: '0',
        description: 'アプリケーション15個デプロイ',
        pageIntegration: 'deployment-dashboard',
      },
      {
        type: 'skills_demonstrated',
        target: '8',
        current: '0',
        description: 'デプロイ戦略8種習得',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ブルーグリーンデプロイ',
    prerequisites: ['cicd-specialist'],
    rewards: ['リリース管理', 'ゼロダウンタイム'],
    estimatedHours: 35,
    relatedPages: ['deployment-dashboard', 'monitoring', 'performance'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'hosting-architect',
    name: '🏗️ ホスティングアーキテクト',
    description: 'クラウドインフラとホスティング環境設計の専門家',
    category: 'hosting',
    difficulty: 'platinum',
    icon: '🏗️',
    points: 450,
    requirements: [
      {
        type: 'projects_created',
        target: '12',
        current: '0',
        description: 'ホスティング環境12個構築',
        pageIntegration: 'infrastructure-dashboard',
      },
      {
        type: 'assessments_passed',
        target: '5',
        current: '0',
        description: 'クラウドアーキテクチャ評価5件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'AWS/Azure設計',
    prerequisites: ['deployment-master'],
    rewards: ['クラウド設計力', 'コスト最適化'],
    estimatedHours: 50,
    relatedPages: ['infrastructure', 'monitoring', 'performance'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'scaling-expert',
    name: '📈 スケーリングエキスパート',
    description: 'システムスケーラビリティとパフォーマンス最適化の専門家',
    category: 'scaling',
    difficulty: 'legendary',
    icon: '📈',
    points: 500,
    requirements: [
      {
        type: 'problems_solved',
        target: '20',
        current: '0',
        description: 'スケーラビリティ問題20件解決',
        pageIntegration: 'performance-optimization',
      },
      {
        type: 'improvements_made',
        target: '10',
        current: '0',
        description: 'パフォーマンス改善10件実施',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '負荷分散設計',
    prerequisites: ['hosting-architect'],
    rewards: ['高可用性設計', 'パフォーマンス監視'],
    estimatedHours: 60,
    relatedPages: ['performance-optimization', 'monitoring', 'analytics'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'virtualization-master',
    name: '💻 仮想化マスター',
    description: 'コンテナ化と仮想化技術の専門家',
    category: 'virtualization',
    difficulty: 'gold',
    icon: '💻',
    points: 380,
    requirements: [
      {
        type: 'projects_created',
        target: '15',
        current: '0',
        description: 'コンテナアプリ15個作成',
        pageIntegration: 'infrastructure',
      },
      {
        type: 'skills_demonstrated',
        target: '6',
        current: '0',
        description: '仮想化技術6種習得',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'Docker/Kubernetes',
    prerequisites: ['cicd-specialist'],
    rewards: ['コンテナ化', 'オーケストレーション'],
    estimatedHours: 45,
    relatedPages: ['infrastructure', 'deployment', 'monitoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'infrastructure-engineer',
    name: '🏭 インフラエンジニア',
    description: 'ITインフラストラクチャ全般の専門家',
    category: 'infrastructure',
    difficulty: 'platinum',
    icon: '🏭',
    points: 420,
    requirements: [
      {
        type: 'projects_created',
        target: '8',
        current: '0',
        description: 'インフラ環境8個構築',
        pageIntegration: 'system-monitoring',
      },
      {
        type: 'time_spent',
        target: '50',
        current: '0',
        description: 'インフラ運用50時間',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ネットワーク設計',
    prerequisites: ['hosting-architect'],
    rewards: ['システム設計', '運用管理'],
    estimatedHours: 55,
    relatedPages: ['system-monitoring', 'database-backup', 'performance'],
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
 * 🎯 プロジェクト管理・ビジネス系バッジ群
 */
export const BUSINESS_BADGES: ComprehensiveBadge[] = [
  {
    id: 'product-manager',
    name: '📋 プロダクトマネージャー',
    description: '製品企画・管理・戦略立案の専門家',
    category: 'product-management',
    difficulty: 'platinum',
    icon: '📋',
    points: 450,
    requirements: [
      {
        type: 'projects_created',
        target: '10',
        current: '0',
        description: 'プロダクト企画10件',
        pageIntegration: 'wbs-creation',
      },
      {
        type: 'data_analyzed',
        target: '20',
        current: '0',
        description: 'マーケット分析20件',
        pageIntegration: 'analytics',
      },
    ],
    isUnlocked: true,
    progress: 0,
    nextMilestone: 'ロードマップ作成',
    prerequisites: [],
    rewards: ['戦略策定', 'チームリーダーシップ'],
    estimatedHours: 60,
    relatedPages: ['wbs-creation', 'analytics', 'planning'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'requirements-analyst',
    name: '📊 要件定義スペシャリスト',
    description: 'システム要件分析と仕様策定の専門家',
    category: 'requirements',
    difficulty: 'gold',
    icon: '📊',
    points: 350,
    requirements: [
      {
        type: 'content_created',
        target: '15',
        current: '0',
        description: '要件定義書15件作成',
        pageIntegration: 'system-design',
      },
      {
        type: 'assessments_passed',
        target: '8',
        current: '0',
        description: '要件レビュー8件完了',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ユーザーストーリー',
    prerequisites: ['product-manager'],
    rewards: ['分析力', '仕様策定'],
    estimatedHours: 40,
    relatedPages: ['system-design', 'wbs-creation', 'planning'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'skill-mapping-expert',
    name: '🗺️ スキルマップエキスパート',
    description: 'チームスキル分析と育成計画の専門家',
    category: 'skill-mapping',
    difficulty: 'gold',
    icon: '🗺️',
    points: 320,
    requirements: [
      {
        type: 'data_analyzed',
        target: '25',
        current: '0',
        description: 'スキル分析25件',
        pageIntegration: 'team-management',
      },
      {
        type: 'content_created',
        target: '10',
        current: '0',
        description: '育成計画10件作成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'スキルアセスメント',
    prerequisites: ['product-manager'],
    rewards: ['人材育成', 'チーム最適化'],
    estimatedHours: 35,
    relatedPages: ['team-management', 'development-badges', 'analytics'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'agile-coach',
    name: '🏃 アジャイルコーチ',
    description: 'アジャイル開発手法とチーム支援の専門家',
    category: 'agile',
    difficulty: 'platinum',
    icon: '🏃',
    points: 400,
    requirements: [
      {
        type: 'trainings_completed',
        target: '12',
        current: '0',
        description: 'アジャイル研修12回実施',
        pageIntegration: 'scrum-dashboard',
      },
      {
        type: 'improvements_made',
        target: '15',
        current: '0',
        description: 'プロセス改善15件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'スクラムマスター',
    prerequisites: ['requirements-analyst'],
    rewards: ['チームファシリテーション', 'プロセス改善'],
    estimatedHours: 50,
    relatedPages: ['scrum-dashboard', 'team-management', 'planning'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'devops-evangelist',
    name: '⚙️ DevOpsエバンジェリスト',
    description: 'DevOps文化と実践の推進者',
    category: 'devops',
    difficulty: 'legendary',
    icon: '⚙️',
    points: 500,
    requirements: [
      {
        type: 'collaborations',
        target: '20',
        current: '0',
        description: 'Dev-Ops連携20件',
        pageIntegration: 'cross-browser-testing',
      },
      {
        type: 'innovations_implemented',
        target: '10',
        current: '0',
        description: 'DevOps革新10件導入',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'カルチャー変革',
    prerequisites: ['agile-coach', 'cicd-specialist'],
    rewards: ['組織変革', 'エンジニアリング文化'],
    estimatedHours: 70,
    relatedPages: ['cross-browser-testing', 'quality-dashboard', 'team-management'],
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
 * 🎯 マーケティング・ビジネス系バッジ群
 */
export const MARKETING_BADGES: ComprehensiveBadge[] = [
  {
    id: 'marketing-strategist',
    name: '📈 マーケティングストラテジスト',
    description: 'デジタルマーケティング戦略の専門家',
    category: 'marketing',
    difficulty: 'gold',
    icon: '📈',
    points: 380,
    requirements: [
      {
        type: 'content_created',
        target: '30',
        current: '0',
        description: 'マーケティング施策30件',
        pageIntegration: 'social-media',
      },
      {
        type: 'data_analyzed',
        target: '25',
        current: '0',
        description: 'マーケット分析25件',
      },
    ],
    isUnlocked: true,
    progress: 0,
    nextMilestone: 'キャンペーン設計',
    prerequisites: [],
    rewards: ['顧客獲得', 'ブランド構築'],
    estimatedHours: 45,
    relatedPages: ['social-media', 'analytics', 'ecommerce'],
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
    description: '電子商取引プラットフォーム運営の専門家',
    category: 'ecommerce',
    difficulty: 'platinum',
    icon: '🛒',
    points: 420,
    requirements: [
      {
        type: 'projects_created',
        target: '8',
        current: '0',
        description: 'ECサイト8個構築',
        pageIntegration: 'ecommerce-shop',
      },
      {
        type: 'goals_achieved',
        target: '15',
        current: '0',
        description: '売上目標15件達成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'オンラインストア',
    prerequisites: ['marketing-strategist'],
    rewards: ['売上拡大', 'カスタマーエクスペリエンス'],
    estimatedHours: 50,
    relatedPages: ['ecommerce-shop', 'payment', 'subscription'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'video-creator',
    name: '🎬 動画クリエイター',
    description: '映像コンテンツ制作とプロデュースの専門家',
    category: 'video-production',
    difficulty: 'gold',
    icon: '🎬',
    points: 350,
    requirements: [
      {
        type: 'content_created',
        target: '50',
        current: '0',
        description: '動画コンテンツ50本制作',
        pageIntegration: 'content-creation',
      },
      {
        type: 'skills_demonstrated',
        target: '8',
        current: '0',
        description: '動画編集技術8種習得',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '動画編集マスター',
    prerequisites: ['marketing-strategist'],
    rewards: ['コンテンツ制作', 'ストーリーテリング'],
    estimatedHours: 60,
    relatedPages: ['content-creation', 'social-media', 'branding'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'game-developer',
    name: '🎮 ゲーム開発者',
    description: 'ゲーム企画・開発・運営の専門家',
    category: 'gaming',
    difficulty: 'legendary',
    icon: '🎮',
    points: 480,
    requirements: [
      {
        type: 'projects_created',
        target: '5',
        current: '0',
        description: 'ゲーム5作品開発',
        pageIntegration: 'gamification',
      },
      {
        type: 'innovations_implemented',
        target: '8',
        current: '0',
        description: 'ゲーム機能8個実装',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ゲームデザイン',
    prerequisites: ['video-creator'],
    rewards: ['ゲーム設計', 'ユーザーエンゲージメント'],
    estimatedHours: 80,
    relatedPages: ['gamification', 'user-engagement', 'analytics'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'ai-ml-specialist',
    name: '🤖 AI・ML スペシャリスト',
    description: '人工知能・機械学習の実装と活用の専門家',
    category: 'ai-ml',
    difficulty: 'legendary',
    icon: '🤖',
    points: 550,
    requirements: [
      {
        type: 'projects_created',
        target: '10',
        current: '0',
        description: 'AI/MLプロジェクト10件',
        pageIntegration: 'ai-dashboard',
      },
      {
        type: 'data_analyzed',
        target: '100',
        current: '0',
        description: 'データセット100件分析',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '機械学習モデル',
    prerequisites: ['game-developer'],
    rewards: ['AI技術', 'データサイエンス'],
    estimatedHours: 100,
    relatedPages: ['ai-dashboard', 'data-visualization', 'analytics'],
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
 * 🎯 教育・社会貢献系バッジ群
 */
export const SOCIAL_BADGES: ComprehensiveBadge[] = [
  {
    id: 'education-specialist',
    name: '📚 教育スペシャリスト',
    description: '学習コンテンツ開発と教育システム設計の専門家',
    category: 'education',
    difficulty: 'gold',
    icon: '📚',
    points: 380,
    requirements: [
      {
        type: 'content_created',
        target: '25',
        current: '0',
        description: '教育コンテンツ25件作成',
        pageIntegration: 'learning-management',
      },
      {
        type: 'trainings_completed',
        target: '15',
        current: '0',
        description: '研修プログラム15件実施',
      },
    ],
    isUnlocked: true,
    progress: 0,
    nextMilestone: 'カリキュラム設計',
    prerequisites: [],
    rewards: ['教育設計', '学習促進'],
    estimatedHours: 50,
    relatedPages: ['learning-management', 'content-creation', 'mentoring'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'social-contributor',
    name: '🌍 社会貢献者',
    description: 'コミュニティ活動と社会課題解決の専門家',
    category: 'social-contribution',
    difficulty: 'platinum',
    icon: '🌍',
    points: 450,
    requirements: [
      {
        type: 'contributions_made',
        target: '20',
        current: '0',
        description: '社会貢献活動20件',
        pageIntegration: 'community-platform',
      },
      {
        type: 'collaborations',
        target: '15',
        current: '0',
        description: 'コミュニティ連携15件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'コミュニティリーダー',
    prerequisites: ['education-specialist'],
    rewards: ['社会影響力', 'リーダーシップ'],
    estimatedHours: 60,
    relatedPages: ['community-platform', 'social-media', 'networking'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'information-influencer',
    name: '📢 情報発信者',
    description: 'コンテンツ発信とオーディエンス構築の専門家',
    category: 'information-sharing',
    difficulty: 'gold',
    icon: '📢',
    points: 320,
    requirements: [
      {
        type: 'content_created',
        target: '100',
        current: '0',
        description: '情報発信100件',
        pageIntegration: 'blog-management',
      },
      {
        type: 'goals_achieved',
        target: '10',
        current: '0',
        description: 'フォロワー目標10件達成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ブランド確立',
    prerequisites: ['education-specialist'],
    rewards: ['影響力', 'コンテンツ戦略'],
    estimatedHours: 40,
    relatedPages: ['blog-management', 'social-media', 'content-creation'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'certification-hunter',
    name: '🏆 資格取得エキスパート',
    description: '専門資格取得と継続学習の専門家',
    category: 'certification',
    difficulty: 'silver',
    icon: '🏆',
    points: 280,
    requirements: [
      {
        type: 'certifications_earned',
        target: '10',
        current: '0',
        description: '専門資格10件取得',
        pageIntegration: 'certification-tracking',
      },
      {
        type: 'time_spent',
        target: '200',
        current: '0',
        description: '資格学習200時間',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '業界資格取得',
    prerequisites: ['information-influencer'],
    rewards: ['専門性', '継続学習'],
    estimatedHours: 200,
    relatedPages: ['certification-tracking', 'learning-management', 'skill-assessment'],
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
 * 🎯 財務・経営系バッジ群
 */
export const FINANCIAL_BADGES: ComprehensiveBadge[] = [
  {
    id: 'financial-analyst',
    name: '💰 財務アナリスト',
    description: '財務分析と投資戦略の専門家',
    category: 'finance',
    difficulty: 'platinum',
    icon: '💰',
    points: 420,
    requirements: [
      {
        type: 'data_analyzed',
        target: '50',
        current: '0',
        description: '財務データ50件分析',
        pageIntegration: 'financial-dashboard',
      },
      {
        type: 'reports_generated',
        target: '20',
        current: '0',
        description: '財務レポート20件作成',
      },
    ],
    isUnlocked: true,
    progress: 0,
    nextMilestone: '投資ポートフォリオ',
    prerequisites: [],
    rewards: ['財務戦略', '投資判断'],
    estimatedHours: 55,
    relatedPages: ['financial-dashboard', 'investment-tracking', 'budget-management'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'entrepreneur',
    name: '🚀 起業家',
    description: '事業創出と成長戦略の専門家',
    category: 'entrepreneurship',
    difficulty: 'legendary',
    icon: '🚀',
    points: 500,
    requirements: [
      {
        type: 'projects_created',
        target: '3',
        current: '0',
        description: '事業プロジェクト3件',
        pageIntegration: 'business-planning',
      },
      {
        type: 'goals_achieved',
        target: '10',
        current: '0',
        description: '事業目標10件達成',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ビジネスプラン',
    prerequisites: ['financial-analyst'],
    rewards: ['事業創出', '成長戦略'],
    estimatedHours: 100,
    relatedPages: ['business-planning', 'investment-tracking', 'market-analysis'],
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
    description: '経営サポートと組織運営の専門家',
    category: 'secretary',
    difficulty: 'gold',
    icon: '📋',
    points: 350,
    requirements: [
      {
        type: 'tasks_completed',
        target: '500',
        current: '0',
        description: '秘書業務500件完了',
        pageIntegration: 'executive-support',
      },
      {
        type: 'collaborations',
        target: '25',
        current: '0',
        description: '部門間連携25件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '組織運営',
    prerequisites: ['financial-analyst'],
    rewards: ['組織効率化', '経営サポート'],
    estimatedHours: 45,
    relatedPages: ['executive-support', 'schedule-management', 'communication'],
    syncData: {
      lastUpdated: new Date(),
      pageActivities: {},
      crossPageProgress: {},
      integrationScore: 0,
      synchronizedFeatures: [],
    },
  },

  {
    id: 'business-leader',
    name: '👔 ビジネスリーダー',
    description: '経営戦略と組織マネジメントの専門家',
    category: 'management',
    difficulty: 'legendary',
    icon: '👔',
    points: 550,
    requirements: [
      {
        type: 'innovations_implemented',
        target: '15',
        current: '0',
        description: '経営革新15件実装',
        pageIntegration: 'strategic-management',
      },
      {
        type: 'collaborations',
        target: '30',
        current: '0',
        description: 'ステークホルダー連携30件',
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '戦略的リーダーシップ',
    prerequisites: ['entrepreneur', 'executive-secretary'],
    rewards: ['戦略立案', 'チーム統率'],
    estimatedHours: 80,
    relatedPages: ['strategic-management', 'team-leadership', 'performance-monitoring'],
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
 * 📈 バッジ間の関係性マップ
 */
export const BADGE_RELATIONSHIPS = {
  'cicd-specialist': ['deployment-master', 'virtualization-master'],
  'deployment-master': ['hosting-architect'],
  'hosting-architect': ['scaling-expert', 'infrastructure-engineer'],
  'product-manager': ['requirements-analyst', 'skill-mapping-expert'],
  'requirements-analyst': ['agile-coach'],
  'agile-coach': ['devops-evangelist'],
  'marketing-strategist': ['ecommerce-specialist', 'video-creator'],
  'video-creator': ['game-developer'],
  'game-developer': ['ai-ml-specialist'],
  'education-specialist': ['social-contributor', 'information-influencer'],
  'information-influencer': ['certification-hunter'],
  'financial-analyst': ['entrepreneur', 'executive-secretary'],
  entrepreneur: ['business-leader'],
  'executive-secretary': ['business-leader'],
} as const;

/**
 * 🔄 全バッジコレクション
 */
export const ALL_COMPREHENSIVE_BADGES: ComprehensiveBadge[] = [
  ...TECHNICAL_BADGES,
  ...BUSINESS_BADGES,
  ...MARKETING_BADGES,
  ...SOCIAL_BADGES,
  ...FINANCIAL_BADGES,
];

/**
 * 📊 バッジ統計情報
 */
export const BADGE_STATISTICS = {
  totalBadges: ALL_COMPREHENSIVE_BADGES.length,
  categoryCounts: {
    technical: TECHNICAL_BADGES.length,
    business: BUSINESS_BADGES.length,
    marketing: MARKETING_BADGES.length,
    social: SOCIAL_BADGES.length,
    financial: FINANCIAL_BADGES.length,
  },
  difficultyDistribution: {
    bronze: 0,
    silver: 1,
    gold: 12,
    platinum: 10,
    legendary: 6,
  },
  totalPoints: ALL_COMPREHENSIVE_BADGES.reduce((sum, badge) => sum + badge.points, 0),
  totalEstimatedHours: ALL_COMPREHENSIVE_BADGES.reduce(
    (sum, badge) => sum + badge.estimatedHours,
    0
  ),
} as const;
