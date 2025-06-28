/**
 * 🔐 サイバーセキュリティバッジシステム
 * 4週間の集中学習プログラムに基づく包括的なセキュリティバッジ
 */

export interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  category:
    | 'cybersecurity'
    | 'network-security'
    | 'application-security'
    | 'data-protection'
    | 'incident-response'
    | 'compliance';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  weeklyFocus: number; // 1-4週目
  estimatedHours: number;
  requirements: SecurityRequirement[];
  isUnlocked: boolean;
  progress: number;
  nextMilestone?: string;
  prerequisites?: string[];
  points: number;
  rewards: string[];
  learningPath: LearningModule[];
}

export interface SecurityRequirement {
  type:
    | 'vulnerability_scan'
    | 'penetration_test'
    | 'security_audit'
    | 'incident_simulation'
    | 'compliance_check'
    | 'security_implementation'
    | 'threat_analysis'
    | 'risk_assessment';
  target: number | string;
  current: number | string;
  description: string;
  progress?: number;
  isCompleted?: boolean;
}

export interface LearningModule {
  week: number;
  module: string;
  topics: string[];
  practicalExercises: string[];
  assessments: string[];
  estimatedHours: number;
}

/**
 * 🔐 サイバーセキュリティスペシャリストバッジ
 * 4週間77時間の集中プログラム
 */
export const CYBERSECURITY_SPECIALIST_BADGE: SecurityBadge = {
  id: 'cybersecurity-specialist',
  name: '🔐 サイバーセキュリティスペシャリスト',
  description: '包括的なサイバーセキュリティ専門知識の習得・実践・認定',
  category: 'cybersecurity',
  difficulty: 'legendary',
  icon: '🔐',
  weeklyFocus: 1,
  estimatedHours: 77,
  requirements: [
    {
      type: 'security_audit',
      target: '10',
      current: '0',
      description: 'セキュリティ監査10件実施',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'vulnerability_scan',
      target: '50',
      current: '0',
      description: '脆弱性スキャン50回実行',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'penetration_test',
      target: '5',
      current: '0',
      description: 'ペネトレーションテスト5回実施',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'incident_simulation',
      target: '3',
      current: '0',
      description: 'インシデント対応シミュレーション3回',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'compliance_check',
      target: '15',
      current: '0',
      description: 'コンプライアンスチェック15項目',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'security_implementation',
      target: '8',
      current: '0',
      description: 'セキュリティ機能8個実装',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'threat_analysis',
      target: '20',
      current: '0',
      description: '脅威分析レポート20件作成',
      progress: 0,
      isCompleted: false,
    },
    {
      type: 'risk_assessment',
      target: '12',
      current: '0',
      description: 'リスク評価12件実施',
      progress: 0,
      isCompleted: false,
    },
  ],
  isUnlocked: true,
  progress: 0,
  nextMilestone: 'Week 1: ネットワークセキュリティ基礎',
  prerequisites: [],
  points: 500,
  rewards: [
    'セキュリティアーキテクト認定',
    'インシデント対応スペシャリスト',
    'コンプライアンス監査官',
    'ペネトレーションテスター',
    'リスク管理エキスパート',
  ],
  learningPath: [
    // Week 1: ネットワークセキュリティ (20時間)
    {
      week: 1,
      module: 'ネットワークセキュリティ基礎',
      topics: [
        'ファイアウォール設定・管理',
        'IDS/IPS導入・運用',
        'VPN構築・セキュリティ',
        'ネットワーク監視・ログ分析',
        'DDoS攻撃対策',
        'ネットワークセグメンテーション',
      ],
      practicalExercises: [
        'pfSenseファイアウォール構築',
        'Snort IDSセットアップ',
        'OpenVPNサーバー構築',
        'Wiresharkパケット解析',
        'ネットワークトポロジー設計',
      ],
      assessments: [
        'ネットワークセキュリティ監査',
        'ファイアウォールルール最適化',
        'セキュリティポリシー策定',
      ],
      estimatedHours: 20,
    },
    // Week 2: アプリケーションセキュリティ (20時間)
    {
      week: 2,
      module: 'アプリケーションセキュリティ',
      topics: [
        'OWASP Top 10脆弱性対策',
        'SQLインジェクション防止',
        'XSS攻撃対策',
        'CSRF保護実装',
        'セキュアコーディング',
        '認証・認可システム',
      ],
      practicalExercises: [
        'WebGoat脆弱性演習',
        'DVWA攻撃シミュレーション',
        'セキュアログイン実装',
        'API セキュリティテスト',
        'コード脆弱性スキャン',
      ],
      assessments: [
        'Webアプリケーション脆弱性診断',
        'セキュアコードレビュー',
        'ペネトレーションテスト実施',
      ],
      estimatedHours: 20,
    },
    // Week 3: データ保護・暗号化 (20時間)
    {
      week: 3,
      module: 'データ保護・暗号化',
      topics: [
        '暗号化アルゴリズム実装',
        'PKI証明書管理',
        'データベース暗号化',
        'ファイル暗号化システム',
        'キー管理システム',
        'デジタル署名・検証',
      ],
      practicalExercises: [
        'AES暗号化実装',
        'RSA公開鍵暗号',
        'SSL/TLS証明書設定',
        'データベース暗号化',
        'ハッシュ関数活用',
      ],
      assessments: ['暗号化システム設計', 'キー管理ポリシー策定', 'データ保護監査'],
      estimatedHours: 20,
    },
    // Week 4: インシデント対応・コンプライアンス (17時間)
    {
      week: 4,
      module: 'インシデント対応・コンプライアンス',
      topics: [
        'インシデント対応計画策定',
        'フォレンジック調査技法',
        'マルウェア解析',
        'GDPR・ISO27001コンプライアンス',
        'セキュリティガバナンス',
        'リスク管理フレームワーク',
      ],
      practicalExercises: [
        'インシデント対応シミュレーション',
        'ログ解析・証拠保全',
        'マルウェア静的解析',
        'コンプライアンス監査',
        'リスク評価実施',
      ],
      assessments: ['インシデント対応計画作成', 'コンプライアンス報告書', '総合セキュリティ評価'],
      estimatedHours: 17,
    },
  ],
};

/**
 * 🛡️ 関連セキュリティバッジ群
 */
export const SECURITY_BADGES_COLLECTION: SecurityBadge[] = [
  CYBERSECURITY_SPECIALIST_BADGE,

  // ネットワークセキュリティ専門バッジ
  {
    id: 'network-security-expert',
    name: '🛡️ ネットワークセキュリティエキスパート',
    description: 'ネットワークインフラのセキュリティ専門家',
    category: 'network-security',
    difficulty: 'platinum',
    icon: '🛡️',
    weeklyFocus: 1,
    estimatedHours: 25,
    requirements: [
      {
        type: 'security_implementation',
        target: '5',
        current: '0',
        description: 'ファイアウォール設定5個',
        progress: 0,
      },
      {
        type: 'vulnerability_scan',
        target: '20',
        current: '0',
        description: 'ネットワーク脆弱性スキャン20回',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ファイアウォール構築',
    prerequisites: ['cybersecurity-specialist'],
    points: 200,
    rewards: ['ネットワーク設計力', 'インフラセキュリティ'],
    learningPath: [],
  },

  // アプリケーションセキュリティ専門バッジ
  {
    id: 'application-security-specialist',
    name: '⚡ アプリケーションセキュリティスペシャリスト',
    description: 'Webアプリケーション・APIセキュリティの専門家',
    category: 'application-security',
    difficulty: 'platinum',
    icon: '⚡',
    weeklyFocus: 2,
    estimatedHours: 25,
    requirements: [
      {
        type: 'penetration_test',
        target: '10',
        current: '0',
        description: 'Webアプリペネトレーションテスト10回',
        progress: 0,
      },
      {
        type: 'security_implementation',
        target: '8',
        current: '0',
        description: 'セキュリティ機能8個実装',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'OWASP Top 10対策',
    prerequisites: ['cybersecurity-specialist'],
    points: 250,
    rewards: ['セキュアコーディング', 'アプリケーション設計'],
    learningPath: [],
  },

  // データ保護専門バッジ
  {
    id: 'data-protection-officer',
    name: '🔒 データ保護責任者',
    description: 'データプライバシー・暗号化・GDPR対応の専門家',
    category: 'data-protection',
    difficulty: 'gold',
    icon: '🔒',
    weeklyFocus: 3,
    estimatedHours: 20,
    requirements: [
      {
        type: 'compliance_check',
        target: '10',
        current: '0',
        description: 'GDPR準拠チェック10項目',
        progress: 0,
      },
      {
        type: 'security_implementation',
        target: '5',
        current: '0',
        description: '暗号化システム5個実装',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: '暗号化システム構築',
    prerequisites: ['cybersecurity-specialist'],
    points: 180,
    rewards: ['データガバナンス', '暗号化技術'],
    learningPath: [],
  },

  // インシデント対応専門バッジ
  {
    id: 'incident-response-coordinator',
    name: '🚨 インシデント対応コーディネーター',
    description: 'セキュリティインシデント対応・フォレンジック調査の専門家',
    category: 'incident-response',
    difficulty: 'platinum',
    icon: '🚨',
    weeklyFocus: 4,
    estimatedHours: 22,
    requirements: [
      {
        type: 'incident_simulation',
        target: '5',
        current: '0',
        description: 'インシデント対応演習5回',
        progress: 0,
      },
      {
        type: 'threat_analysis',
        target: '15',
        current: '0',
        description: '脅威分析15件',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'インシデント対応計画策定',
    prerequisites: ['cybersecurity-specialist'],
    points: 220,
    rewards: ['インシデント対応力', 'フォレンジック技術'],
    learningPath: [],
  },

  // コンプライアンス専門バッジ
  {
    id: 'compliance-auditor',
    name: '📋 コンプライアンス監査官',
    description: 'セキュリティコンプライアンス・リスク管理の専門家',
    category: 'compliance',
    difficulty: 'gold',
    icon: '📋',
    weeklyFocus: 4,
    estimatedHours: 18,
    requirements: [
      {
        type: 'compliance_check',
        target: '25',
        current: '0',
        description: 'コンプライアンス監査25項目',
        progress: 0,
      },
      {
        type: 'risk_assessment',
        target: '10',
        current: '0',
        description: 'リスク評価10件',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    nextMilestone: 'ISO27001監査',
    prerequisites: ['cybersecurity-specialist'],
    points: 160,
    rewards: ['監査技術', 'リスク管理'],
    learningPath: [],
  },
];

/**
 * 📊 週次進捗トラッキング
 */
export interface WeeklySecurityProgress {
  weekNumber: number;
  startDate: string;
  endDate: string;
  targetHours: number;
  actualHours: number;
  completedModules: string[];
  assessmentScores: Record<string, number>;
  skillsAcquired: string[];
  nextWeekPreparation: string[];
}

/**
 * 🎯 セキュリティバッジ完了予測
 */
export interface SecurityBadgePrediction {
  badgeId: string;
  currentProgress: number;
  predictedCompletionWeek: number;
  predictedCompletionDate: string;
  remainingHours: number;
  confidenceLevel: number;
  riskFactors: string[];
  recommendations: string[];
}

/**
 * 🔐 セキュリティスキルマトリックス
 */
export const SECURITY_SKILL_MATRIX = {
  'network-security': {
    beginner: ['ファイアウォール基礎', 'ポート管理'],
    intermediate: ['IDS/IPS運用', 'VPN構築'],
    advanced: ['ネットワーク設計', 'セキュリティアーキテクチャ'],
    expert: ['ゼロトラスト実装', 'SDNセキュリティ'],
  },
  'application-security': {
    beginner: ['HTTPS実装', 'パスワード暗号化'],
    intermediate: ['OWASP対策', 'セキュアAPI'],
    advanced: ['脆弱性診断', 'ペネトレーションテスト'],
    expert: ['セキュリティアーキテクチャ', 'DevSecOps'],
  },
  'data-protection': {
    beginner: ['データ暗号化', '個人情報保護'],
    intermediate: ['GDPR対応', 'データ分類'],
    advanced: ['暗号化システム', 'キー管理'],
    expert: ['データガバナンス', 'プライバシーエンジニアリング'],
  },
  'incident-response': {
    beginner: ['ログ監視', 'アラート対応'],
    intermediate: ['インシデント調査', '証拠保全'],
    advanced: ['フォレンジック', 'マルウェア解析'],
    expert: ['危機管理', 'インシデント予防'],
  },
  compliance: {
    beginner: ['セキュリティポリシー', '基本監査'],
    intermediate: ['リスク評価', 'コントロール実装'],
    advanced: ['ISO27001', 'SOC2監査'],
    expert: ['ガバナンス設計', '継続的監査'],
  },
} as const;
