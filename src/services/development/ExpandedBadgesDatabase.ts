import { DevelopmentBadge, BadgeCategory, BadgeRequirement } from '@/types/development-badges';

/**
 * 🏆 包括的バッジデータベース - 全分野対応
 */
export const EXPANDED_BADGES_DATABASE: DevelopmentBadge[] = [
  // 💻 開発・技術系バッジ
  {
    id: 'cicd-master',
    name: 'CI/CDマスター',
    description: '継続的インテグレーション・デプロイメントを完全自動化',
    category: 'automation',
    difficulty: 'platinum',
    icon: '🔄',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'GitHub Actions ワークフローの実装',
        progress: 85,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '自動テスト・デプロイパイプライン',
        progress: 90,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 87,
    isCompleted: false,
    points: 800,
    prerequisites: ['testing-automation'],
  },

  {
    id: 'deployment-engineer',
    name: 'デプロイメントエンジニア',
    description: '複数のプラットフォームへの効率的なデプロイメント',
    category: 'automation',
    difficulty: 'gold',
    icon: '🚀',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'Vercel/Netlify デプロイ設定',
        progress: 100,
        isCompleted: true,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'Docker コンテナ化',
        progress: 70,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 85,
    isCompleted: false,
    points: 600,
  },

  {
    id: 'infrastructure-architect',
    name: 'インフラストラクチャアーキテクト',
    description: 'スケーラブルなインフラ設計・構築',
    category: 'devops',
    difficulty: 'platinum',
    icon: '🏗️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'クラウドインフラ設計',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'Kubernetes オーケストレーション',
        progress: 40,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 50,
    isCompleted: false,
    points: 1000,
    prerequisites: ['deployment-engineer'],
  },

  {
    id: 'virtualization-specialist',
    name: '仮想化スペシャリスト',
    description: 'Docker・Kubernetes による仮想化技術の習得',
    category: 'devops',
    difficulty: 'gold',
    icon: '📦',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'Docker コンテナ作成・管理',
        progress: 75,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'Docker Compose オーケストレーション',
        progress: 65,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 70,
    isCompleted: false,
    points: 700,
  },

  {
    id: 'monitoring-specialist',
    name: '監視スペシャリスト',
    description: 'システム監視・ログ分析・アラート設定',
    category: 'devops',
    difficulty: 'gold',
    icon: '📊',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'パフォーマンス監視システム',
        progress: 80,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'エラー追跡・ログ分析',
        progress: 70,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 75,
    isCompleted: false,
    points: 650,
  },

  // 📈 ビジネス・経営系バッジ
  {
    id: 'product-manager',
    name: 'プロダクトマネージャー',
    description: '製品戦略・ロードマップ・要件定義の統括',
    category: 'business',
    difficulty: 'platinum',
    icon: '📋',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '製品要件定義書の作成',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ユーザーストーリー・仕様書',
        progress: 55,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 57,
    isCompleted: false,
    points: 900,
  },

  {
    id: 'requirements-analyst',
    name: '要件定義アナリスト',
    description: 'ステークホルダーニーズの分析・文書化',
    category: 'business',
    difficulty: 'gold',
    icon: '📝',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '要件分析・整理',
        progress: 70,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ユースケース・シナリオ作成',
        progress: 65,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 67,
    isCompleted: false,
    points: 600,
  },

  {
    id: 'skill-mapper',
    name: 'スキルマッパー',
    description: 'チーム・個人のスキル可視化・成長計画',
    category: 'skill_mapping',
    difficulty: 'gold',
    icon: '🗺️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'スキル評価システムの実装',
        progress: 100,
        isCompleted: true,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'スキルマップ可視化',
        progress: 100,
        isCompleted: true,
      },
    ],
    isUnlocked: true,
    progress: 100,
    isCompleted: true,
    completedAt: '2024-01-15T10:30:00Z',
    points: 700,
  },

  {
    id: 'agile-coach',
    name: 'アジャイルコーチ',
    description: 'スクラム・カンバン・アジャイル手法の指導',
    category: 'agile',
    difficulty: 'platinum',
    icon: '🔄',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'スクラム実装・運用',
        progress: 90,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'カンバンボード・ワークフロー',
        progress: 85,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 87,
    isCompleted: false,
    points: 950,
  },

  {
    id: 'startup-founder',
    name: 'スタートアップファウンダー',
    description: 'ビジネス立ち上げ・資金調達・事業成長',
    category: 'entrepreneurship',
    difficulty: 'legendary',
    icon: '🚀',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'ビジネスプラン・事業計画',
        progress: 45,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'MVP開発・市場検証',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '資金調達・投資家対応',
        progress: 30,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 45,
    isCompleted: false,
    points: 1500,
  },

  // 💰 財務・法務・経営系バッジ
  {
    id: 'financial-analyst',
    name: '財務アナリスト',
    description: '財務分析・予算管理・投資判断',
    category: 'finance',
    difficulty: 'gold',
    icon: '💰',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '財務諸表分析・KPI設定',
        progress: 40,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '予算計画・コスト管理',
        progress: 35,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 37,
    isCompleted: false,
    points: 750,
  },

  {
    id: 'legal-compliance-officer',
    name: '法務・コンプライアンス責任者',
    description: '法的リスク管理・契約書作成・規制対応',
    category: 'legal',
    difficulty: 'platinum',
    icon: '⚖️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '利用規約・プライバシーポリシー',
        progress: 80,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'GDPR・個人情報保護対応',
        progress: 70,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 75,
    isCompleted: false,
    points: 850,
  },

  {
    id: 'tax-accountant',
    name: '税務会計士',
    description: '税務処理・会計帳簿・財務報告',
    category: 'accounting',
    difficulty: 'gold',
    icon: '📊',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '会計システム・帳簿管理',
        progress: 25,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '税務申告・節税対策',
        progress: 20,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 22,
    isCompleted: false,
    points: 700,
  },

  // 👥 人事・労務・マネジメント系バッジ
  {
    id: 'hr-manager',
    name: '人事マネージャー',
    description: '採用・人材育成・組織運営',
    category: 'hr',
    difficulty: 'gold',
    icon: '👥',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '採用プロセス・面接システム',
        progress: 50,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '人材育成・評価制度',
        progress: 45,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 47,
    isCompleted: false,
    points: 750,
  },

  {
    id: 'labor-relations-specialist',
    name: '労務スペシャリスト',
    description: '労働法規・就業規則・労務管理',
    category: 'hr',
    difficulty: 'gold',
    icon: '📋',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '就業規則・労働契約',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '勤怠管理・労働時間管理',
        progress: 85,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 72,
    isCompleted: false,
    points: 650,
  },

  // 📈 マーケティング・営業系バッジ
  {
    id: 'marketing-strategist',
    name: 'マーケティングストラテジスト',
    description: 'マーケティング戦略・ブランディング・顧客獲得',
    category: 'marketing',
    difficulty: 'platinum',
    icon: '📈',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'マーケティング戦略・施策',
        progress: 55,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ブランディング・コンテンツ',
        progress: 60,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 57,
    isCompleted: false,
    points: 900,
  },

  {
    id: 'sales-expert',
    name: '営業エキスパート',
    description: '営業戦略・顧客開拓・売上最大化',
    category: 'sales',
    difficulty: 'gold',
    icon: '💼',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '営業プロセス・CRM',
        progress: 40,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '顧客分析・提案書作成',
        progress: 35,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 37,
    isCompleted: false,
    points: 700,
  },

  {
    id: 'monetization-architect',
    name: 'マネタイゼーションアーキテクト',
    description: '収益化戦略・価格設定・ビジネスモデル',
    category: 'monetization',
    difficulty: 'platinum',
    icon: '💎',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'サブスクリプション・決済',
        progress: 70,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '価格戦略・収益モデル',
        progress: 50,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 60,
    isCompleted: false,
    points: 950,
  },

  // 🎨 デザイン・創作系バッジ
  {
    id: 'ux-strategist',
    name: 'UX戦略家',
    description: 'ユーザー体験設計・デザインシステム構築',
    category: 'design',
    difficulty: 'gold',
    icon: '🎨',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'ユーザー調査・ペルソナ設計',
        progress: 100,
        isCompleted: true,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'デザインシステム・プロトタイプ',
        progress: 100,
        isCompleted: true,
      },
    ],
    isUnlocked: true,
    progress: 100,
    isCompleted: true,
    completedAt: '2024-01-10T14:20:00Z',
    points: 800,
  },

  {
    id: 'visual-designer',
    name: 'ビジュアルデザイナー',
    description: 'グラフィック・UI・ブランドデザイン',
    category: 'design',
    difficulty: 'silver',
    icon: '🖌️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'UI/UXデザイン・プロトタイプ',
        progress: 90,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ブランドガイドライン',
        progress: 75,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 82,
    isCompleted: false,
    points: 500,
  },

  // 🌍 言語・文化・情報発信系バッジ
  {
    id: 'polyglot-communicator',
    name: '多言語コミュニケーター',
    description: '多言語対応・国際化・異文化理解',
    category: 'multilingual_communication',
    difficulty: 'gold',
    icon: '🌍',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '多言語対応・i18n実装',
        progress: 95,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'RTL言語・文化適応',
        progress: 90,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 92,
    isCompleted: false,
    points: 750,
  },

  {
    id: 'content-creator',
    name: 'コンテンツクリエイター',
    description: '質の高いコンテンツ制作・情報発信',
    category: 'content',
    difficulty: 'silver',
    icon: '✍️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'テクニカルライティング',
        progress: 70,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ドキュメント・チュートリアル',
        progress: 65,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 67,
    isCompleted: false,
    points: 400,
  },

  {
    id: 'publisher-editor',
    name: '出版・編集者',
    description: '出版プロセス・編集・品質管理',
    category: 'publishing',
    difficulty: 'gold',
    icon: '📚',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '編集・校正・品質管理',
        progress: 45,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'デジタル出版・配信',
        progress: 35,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 40,
    isCompleted: false,
    points: 650,
  },

  // 🌱 社会貢献・持続可能性系バッジ
  {
    id: 'sustainability-advocate',
    name: '持続可能性アドボケート',
    description: 'サステナブル開発・環境配慮・社会貢献',
    category: 'sustainability',
    difficulty: 'gold',
    icon: '🌱',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'カーボンニュートラル・Green IT',
        progress: 80,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '社会貢献・CSR活動',
        progress: 60,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 70,
    isCompleted: false,
    points: 700,
  },

  // 📚 学術・研究・哲学系バッジ
  {
    id: 'philosopher-researcher',
    name: '哲学研究者',
    description: '哲学的思考・倫理的判断・人文学的洞察',
    category: 'philosophy',
    difficulty: 'platinum',
    icon: '🤔',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '倫理・哲学的フレームワーク',
        progress: 30,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '批判的思考・論理構築',
        progress: 40,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 35,
    isCompleted: false,
    points: 900,
  },

  {
    id: 'economic-analyst',
    name: '経済アナリスト',
    description: '経済分析・市場予測・投資戦略',
    category: 'economics',
    difficulty: 'gold',
    icon: '📊',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '市場分析・経済指標',
        progress: 25,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '投資戦略・リスク管理',
        progress: 30,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 27,
    isCompleted: false,
    points: 750,
  },

  {
    id: 'cultural-historian',
    name: '文化歴史学者',
    description: '歴史研究・文化分析・伝統保存',
    category: 'culture',
    difficulty: 'gold',
    icon: '🏛️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '歴史調査・文献研究',
        progress: 20,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '文化遺産・伝統技術',
        progress: 15,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 17,
    isCompleted: false,
    points: 700,
  },

  // 🎭 芸術・創作系バッジ
  {
    id: 'digital-artist',
    name: 'デジタルアーティスト',
    description: 'デジタル芸術・創作・表現',
    category: 'art',
    difficulty: 'silver',
    icon: '🎭',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'デジタルアート・イラスト',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '3D・アニメーション',
        progress: 40,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 50,
    isCompleted: false,
    points: 450,
  },

  {
    id: 'literary-writer',
    name: '文学作家',
    description: '創作・文学・ストーリーテリング',
    category: 'literature',
    difficulty: 'gold',
    icon: '📖',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '創作・ストーリー執筆',
        progress: 35,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '文学理論・批評',
        progress: 25,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 30,
    isCompleted: false,
    points: 600,
  },

  // 🏛️ 政治・社会系バッジ
  {
    id: 'policy-analyst',
    name: '政策アナリスト',
    description: '政策分析・社会問題・公共政策',
    category: 'politics',
    difficulty: 'platinum',
    icon: '🏛️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '政策研究・分析',
        progress: 20,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '社会課題・解決策',
        progress: 25,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 22,
    isCompleted: false,
    points: 850,
  },

  // 🔄 CI/CD・DevOps系バッジ
  {
    id: 'cicd-pipeline-master',
    name: 'CI/CDパイプラインマスター',
    description: '継続的インテグレーション・デプロイメントの専門家',
    category: 'devops',
    difficulty: 'gold',
    icon: '🔄',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'CI/CDパイプライン構築',
        progress: 60,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '自動テスト・デプロイ',
        progress: 55,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 57,
    isCompleted: false,
    points: 700,
  },

  {
    id: 'deployment-specialist',
    name: 'デプロイメントスペシャリスト',
    description: 'アプリケーションデプロイメントの専門家',
    category: 'deployment',
    difficulty: 'silver',
    icon: '🚀',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '複数環境デプロイ',
        progress: 70,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'ブルーグリーン・カナリアリリース',
        progress: 50,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 60,
    isCompleted: false,
    points: 450,
  },

  {
    id: 'cloud-hosting-expert',
    name: 'クラウドホスティングエキスパート',
    description: 'クラウドプラットフォームでのホスティング専門家',
    category: 'infrastructure',
    difficulty: 'gold',
    icon: '☁️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'マルチクラウド環境構築',
        progress: 40,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'スケーラブルアーキテクチャ',
        progress: 35,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 37,
    isCompleted: false,
    points: 650,
  },

  {
    id: 'virtualization-master',
    name: '仮想化マスター',
    description: '仮想化技術の専門家',
    category: 'infrastructure',
    difficulty: 'gold',
    icon: '📦',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'コンテナ技術・Docker/Kubernetes',
        progress: 45,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'オーケストレーション・リソース最適化',
        progress: 30,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 37,
    isCompleted: false,
    points: 650,
  },

  // 📈 ビジネス・経営系バッジ
  {
    id: 'startup-founder',
    name: 'スタートアップ創業者',
    description: '起業・新規事業立ち上げの専門家',
    category: 'entrepreneurship',
    difficulty: 'legendary',
    icon: '🌟',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '事業計画・MVP開発',
        progress: 25,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '資金調達・チーム構築',
        progress: 20,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 22,
    isCompleted: false,
    points: 1000,
  },

  {
    id: 'investment-analyst',
    name: '投資アナリスト',
    description: '投資判断・財務分析の専門家',
    category: 'finance',
    difficulty: 'gold',
    icon: '💰',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '財務諸表分析・投資評価',
        progress: 30,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'リスク管理・ポートフォリオ',
        progress: 25,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 27,
    isCompleted: false,
    points: 700,
  },

  {
    id: 'hr-manager',
    name: 'HR人事マネージャー',
    description: '人事制度・運用の専門家',
    category: 'hr',
    difficulty: 'gold',
    icon: '👥',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '人事制度設計・採用戦略',
        progress: 35,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '人材育成・労務管理',
        progress: 40,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 37,
    isCompleted: false,
    points: 650,
  },

  {
    id: 'marketing-strategist',
    name: 'マーケティング戦略家',
    description: 'マーケティング戦略立案・実行の専門家',
    category: 'marketing',
    difficulty: 'gold',
    icon: '📢',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'マーケット分析・ブランド戦略',
        progress: 45,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'デジタルマーケティング・ROI分析',
        progress: 40,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 42,
    isCompleted: false,
    points: 650,
  },

  {
    id: 'sales-expert',
    name: '営業エキスパート',
    description: '営業戦略・実行の専門家',
    category: 'sales',
    difficulty: 'silver',
    icon: '🤝',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '営業プロセス・CRM活用',
        progress: 50,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '提案・契約クロージング',
        progress: 45,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 47,
    isCompleted: false,
    points: 400,
  },

  {
    id: 'legal-compliance-officer',
    name: '法務コンプライアンス責任者',
    description: '法務・コンプライアンス管理の専門家',
    category: 'legal',
    difficulty: 'gold',
    icon: '⚖️',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '契約書・コンプライアンス体制',
        progress: 25,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'リーガルリスク・法的問題対応',
        progress: 30,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 27,
    isCompleted: false,
    points: 700,
  },

  {
    id: 'financial-analyst',
    name: '財務アナリスト',
    description: '財務分析・戦略立案の専門家',
    category: 'finance',
    difficulty: 'gold',
    icon: '📊',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '財務諸表・予算管理',
        progress: 35,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'キャッシュフロー・財務戦略',
        progress: 30,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 32,
    isCompleted: false,
    points: 650,
  },

  {
    id: 'tax-accountant',
    name: '税務会計士',
    description: '税務・会計業務の専門家',
    category: 'accounting',
    difficulty: 'gold',
    icon: '🧮',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: '税務申告・会計帳簿',
        progress: 20,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '節税対策・税務調査対応',
        progress: 25,
        isCompleted: false,
      },
    ],
    isUnlocked: false,
    progress: 22,
    isCompleted: false,
    points: 700,
  },

  // 🧠 AI・機械学習系バッジ
  {
    id: 'ai-integration-pioneer',
    name: 'AI統合パイオニア',
    description: 'AI・機械学習・自然言語処理の統合',
    category: 'ai_ml',
    difficulty: 'legendary',
    icon: '🤖',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'AI機能・自然言語処理',
        progress: 85,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '機械学習・予測分析',
        progress: 70,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'AIチャットボット・音声AI',
        progress: 60,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 72,
    isCompleted: false,
    points: 1200,
  },

  // 🔒 セキュリティ・プライバシー系バッジ
  {
    id: 'security-specialist',
    name: 'セキュリティスペシャリスト',
    description: 'サイバーセキュリティ・脆弱性対策・プライバシー保護',
    category: 'security',
    difficulty: 'platinum',
    icon: '🔒',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'セキュリティ監査・脆弱性対策',
        progress: 65,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: '暗号化・認証システム',
        progress: 70,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 67,
    isCompleted: false,
    points: 900,
  },

  // 🎮 ゲーミフィケーション・エンゲージメント系バッジ
  {
    id: 'gamification-designer',
    name: 'ゲーミフィケーションデザイナー',
    description: 'ゲーム要素・エンゲージメント・ユーザー体験',
    category: 'innovation',
    difficulty: 'gold',
    icon: '🎮',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'ポイント・バッジ・リーダーボード',
        progress: 100,
        isCompleted: true,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'プログレッション・報酬システム',
        progress: 100,
        isCompleted: true,
      },
    ],
    isUnlocked: true,
    progress: 100,
    isCompleted: true,
    completedAt: '2024-01-12T16:45:00Z',
    points: 750,
  },

  // 🏥 アクセシビリティ・ユニバーサルデザイン系バッジ
  {
    id: 'accessibility-champion',
    name: 'アクセシビリティチャンピオン',
    description: 'ユニバーサルデザイン・インクルーシブ設計',
    category: 'ui_ux',
    difficulty: 'gold',
    icon: '♿',
    requirements: [
      {
        type: 'feature_complete',
        target: 100,
        description: 'WCAG準拠・スクリーンリーダー対応',
        progress: 85,
        isCompleted: false,
      },
      {
        type: 'feature_complete',
        target: 100,
        description: 'キーボードナビゲーション・色覚対応',
        progress: 90,
        isCompleted: false,
      },
    ],
    isUnlocked: true,
    progress: 87,
    isCompleted: false,
    points: 700,
  },
];

/**
 * 📊 バッジカテゴリ統計
 */
export const getBadgesByCategory = (category: BadgeCategory): DevelopmentBadge[] => {
  return EXPANDED_BADGES_DATABASE.filter((badge) => badge.category === category);
};

/**
 * 🏆 完了済みバッジ取得
 */
export const getCompletedBadges = (): DevelopmentBadge[] => {
  return EXPANDED_BADGES_DATABASE.filter((badge) => badge.isCompleted);
};

/**
 * 📈 進行中バッジ取得
 */
export const getInProgressBadges = (): DevelopmentBadge[] => {
  return EXPANDED_BADGES_DATABASE.filter((badge) => !badge.isCompleted && badge.progress > 0);
};

/**
 * 🔓 利用可能バッジ取得
 */
export const getAvailableBadges = (): DevelopmentBadge[] => {
  return EXPANDED_BADGES_DATABASE.filter((badge) => badge.isUnlocked && !badge.isCompleted);
};

/**
 * 🎯 次に取得すべきバッジ提案
 */
export const getRecommendedNextBadges = (limit: number = 5): DevelopmentBadge[] => {
  return EXPANDED_BADGES_DATABASE.filter((badge) => badge.isUnlocked && !badge.isCompleted)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
};

/**
 * 📊 全体統計取得
 */
export interface BadgeStatsSummary {
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  availableBadges: number;
  totalPoints: number;
  completionRate: number;
  categoryBreakdown: Record<BadgeCategory, number>;
}

export const getBadgeStatsSummary = (): BadgeStatsSummary => {
  const total = EXPANDED_BADGES_DATABASE.length;
  const completed = getCompletedBadges();
  const inProgress = getInProgressBadges();
  const available = getAvailableBadges();

  const totalPoints = completed.reduce((sum, badge) => sum + (badge.points || 0), 0);
  const completionRate = (completed.length / total) * 100;

  const categoryBreakdown: Record<string, number> = {};
  EXPANDED_BADGES_DATABASE.forEach((badge) => {
    if (badge.isCompleted) {
      categoryBreakdown[badge.category] = (categoryBreakdown[badge.category] || 0) + 1;
    }
  });

  return {
    totalBadges: total,
    completedBadges: completed.length,
    inProgressBadges: inProgress.length,
    availableBadges: available.length,
    totalPoints,
    completionRate,
    categoryBreakdown: categoryBreakdown as Record<BadgeCategory, number>,
  };
};
