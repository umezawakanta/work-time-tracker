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
