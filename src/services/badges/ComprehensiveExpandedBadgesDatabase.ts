import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';

/**
 * 🏆 包括的拡張バッジデータベース
 * CI/CD、デプロイ、ホスティング、スケーリング、仮想化、インフラ、製品選定、設計、仕様、
 * PM、予実管理、要件定義、スキルマップ、アジャイル、DevOps、デザイン、テスト、運用、
 * 保守、監視、マーケティング、プロモーション、マネタイズ、EC、動画作成、ゲーム、起業、
 * 投資、資金調達、企画、法務、労務、人事、営業、税務、財務、会計、秘書、経営、社会貢献、
 * 教育、学習、資格試験、情報発信、政治、経済、哲学、宗教、歴史、文化、芸術、語学、文学、
 * 出版、編集に関する包括的バッジシステム
 */

// 🔧 仮想化・コンテナバッジ
export const virtualizationContainerBadges: DevelopmentBadge[] = [
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
      {
        type: 'orchestration_setup',
        target: 5,
        current: 0,
        description: 'Docker Composeを使用した複数サービス構成',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
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
      {
        type: 'microservice_architecture',
        target: 1,
        current: 0,
        description: 'マイクロサービスアーキテクチャの実装',
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
export const scalingPerformanceBadges: DevelopmentBadge[] = [
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
      {
        type: 'load_testing',
        target: 5,
        current: 0,
        description: '負荷テストの実施と最適化',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 120,
  },
  {
    id: 'auto-scaling-architect',
    name: 'Auto Scaling Architect',
    description: '自動スケーリングシステムの設計者',
    category: 'scaling',
    difficulty: 'platinum',
    icon: '🔄',
    requirements: [
      {
        type: 'cloud_deployment',
        target: 2,
        current: 0,
        description: 'クラウド環境での自動スケーリング実装',
        progress: 0,
      },
      {
        type: 'monitoring_setup',
        target: 3,
        current: 0,
        description: 'パフォーマンス監視とアラート設定',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 180,
    prerequisites: ['load-balancer-expert'],
  },
];

// 🎬 動画・マルチメディア制作バッジ
export const multimediaBadges: DevelopmentBadge[] = [
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
      {
        type: 'creative_impact',
        target: 1000,
        current: 0,
        description: '動画の総再生数1000回以上',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'streaming-platform-master',
    name: 'Streaming Platform Master',
    description: 'ライブストリーミング配信の専門家',
    category: 'multimedia',
    difficulty: 'gold',
    icon: '📡',
    requirements: [
      {
        type: 'multimedia_projects',
        target: 20,
        current: 0,
        description: 'ライブ配信システムの構築',
        progress: 0,
      },
      {
        type: 'user_engagement',
        target: 500,
        current: 0,
        description: 'ライブ配信の平均視聴者数500人以上',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 150,
    prerequisites: ['video-content-creator'],
  },
];

// 🎮 ゲーム開発バッジ
export const gameDevBadges: DevelopmentBadge[] = [
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
      {
        type: 'user_engagement',
        target: 100,
        current: 0,
        description: 'ゲームプレイヤー100人以上獲得',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 200,
  },
  {
    id: 'game-engine-expert',
    name: 'Game Engine Expert',
    description: 'ゲームエンジンの技術専門家',
    category: 'game_development',
    difficulty: 'platinum',
    icon: '⚙️',
    requirements: [
      {
        type: 'game_development_cycle',
        target: 3,
        current: 0,
        description: '3つ以上のゲームエンジンでの開発経験',
        progress: 0,
      },
      {
        type: 'technical_documentation',
        target: 5,
        current: 0,
        description: 'ゲーム開発技術文書の作成',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 250,
    prerequisites: ['indie-game-developer'],
  },
];

// 🛒 EC・オンライン販売バッジ
export const ecommerceBadges: DevelopmentBadge[] = [
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
      {
        type: 'conversion_optimization',
        target: 5,
        current: 0,
        description: 'コンバージョン率最適化施策の実施',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 120,
  },
  {
    id: 'marketplace-strategist',
    name: 'Marketplace Strategist',
    description: 'マーケットプレイス戦略の専門家',
    category: 'ecommerce',
    difficulty: 'gold',
    icon: '🎯',
    requirements: [
      {
        type: 'ecommerce_integration',
        target: 3,
        current: 0,
        description: '複数のECプラットフォーム連携',
        progress: 0,
      },
      {
        type: 'roi_improvement',
        target: 50,
        current: 0,
        description: 'ROI 50%以上の改善実現',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 180,
    prerequisites: ['online-store-builder'],
  },
];

// 🏛️ 文化・歴史研究バッジ
export const culturalHistoryBadges: DevelopmentBadge[] = [
  {
    id: 'digital-archivist',
    name: 'Digital Archivist',
    description: 'デジタル文化遺産の保存者',
    category: 'history',
    difficulty: 'silver',
    icon: '📜',
    requirements: [
      {
        type: 'historical_research',
        target: 10,
        current: 0,
        description: '歴史資料のデジタル化プロジェクト',
        progress: 0,
      },
      {
        type: 'archive_digitization',
        target: 100,
        current: 0,
        description: '100点以上の資料デジタル化',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'cultural-heritage-guardian',
    name: 'Cultural Heritage Guardian',
    description: '文化遺産の守護者',
    category: 'culture',
    difficulty: 'gold',
    icon: '🏛️',
    requirements: [
      {
        type: 'heritage_preservation',
        target: 3,
        current: 0,
        description: '文化遺産保存プロジェクトの指導',
        progress: 0,
      },
      {
        type: 'cultural_documentation',
        target: 5,
        current: 0,
        description: '文化的価値の文書化',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 150,
    prerequisites: ['digital-archivist'],
  },
];

// 🎨 デジタルアート・NFTバッジ
export const digitalArtBadges: DevelopmentBadge[] = [
  {
    id: 'digital-artist',
    name: 'Digital Artist',
    description: 'デジタルアートの創作者',
    category: 'digital_art',
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
      {
        type: 'creative_impact',
        target: 500,
        current: 0,
        description: 'アート作品の総閲覧数500以上',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'nft-creator',
    name: 'NFT Creator',
    description: 'NFTアートの先駆者',
    category: 'blockchain_web3',
    difficulty: 'gold',
    icon: '🖼️',
    requirements: [
      {
        type: 'blockchain_integration',
        target: 5,
        current: 0,
        description: 'NFTコレクションの作成とミント',
        progress: 0,
      },
      {
        type: 'creative_impact',
        target: 1000,
        current: 0,
        description: 'NFTアートの総取引額',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 200,
    prerequisites: ['digital-artist'],
  },
];

// 🌍 多言語・国際化バッジ
export const internationalizationBadges: DevelopmentBadge[] = [
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
      {
        type: 'cultural_adaptation',
        target: 3,
        current: 0,
        description: '文化的適応の実施',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 120,
  },
  {
    id: 'global-community-builder',
    name: 'Global Community Builder',
    description: 'グローバルコミュニティの構築者',
    category: 'community',
    difficulty: 'gold',
    icon: '🌏',
    requirements: [
      {
        type: 'global_community',
        target: 10,
        current: 0,
        description: '10か国以上のユーザーコミュニティ形成',
        progress: 0,
      },
      {
        type: 'cross_cultural_ux',
        target: 3,
        current: 0,
        description: '異文化対応UXの設計',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 180,
    prerequisites: ['localization-specialist'],
  },
];

// 📚 文学・出版バッジ
export const literaturePublishingBadges: DevelopmentBadge[] = [
  {
    id: 'platform-publisher',
    name: 'Platform Publisher',
    description: 'プラットフォーム出版の開拓者',
    category: 'digital_publishing',
    difficulty: 'silver',
    icon: '📖',
    requirements: [
      {
        type: 'digital_platform_launch',
        target: 1,
        current: 0,
        description: 'デジタル出版プラットフォームの立ち上げ',
        progress: 0,
      },
      {
        type: 'ebook_production',
        target: 10,
        current: 0,
        description: '10冊以上の電子書籍制作',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'literary-innovator',
    name: 'Literary Innovator',
    description: 'デジタル文学の革新者',
    category: 'digital_literature',
    difficulty: 'gold',
    icon: '✍️',
    requirements: [
      {
        type: 'interactive_story_development',
        target: 3,
        current: 0,
        description: 'インタラクティブ物語の制作',
        progress: 0,
      },
      {
        type: 'transmedia_project_launch',
        target: 1,
        current: 0,
        description: 'トランスメディア・プロジェクトの実現',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 150,
    prerequisites: ['platform-publisher'],
  },
];

// ✏️ 編集・コンテンツ管理バッジ
export const editingContentBadges: DevelopmentBadge[] = [
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'コンテンツ戦略の専門家',
    category: 'content_strategy_editing',
    difficulty: 'silver',
    icon: '📝',
    requirements: [
      {
        type: 'content_strategy_success',
        target: 5,
        current: 0,
        description: '5つのコンテンツ戦略の成功実施',
        progress: 0,
      },
      {
        type: 'editorial_workflow',
        target: 3,
        current: 0,
        description: '編集ワークフローの最適化',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'multimedia-editor',
    name: 'Multimedia Editor',
    description: 'マルチメディア編集の専門家',
    category: 'multimedia_editing',
    difficulty: 'gold',
    icon: '🎬',
    requirements: [
      {
        type: 'multimedia_content_creation',
        target: 20,
        current: 0,
        description: '20件以上のマルチメディアコンテンツ編集',
        progress: 0,
      },
      {
        type: 'collaborative_platform_adoption',
        target: 3,
        current: 0,
        description: '協働編集プラットフォームの導入',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 150,
    prerequisites: ['content-strategist'],
  },
];

// 📊 経済・市場分析バッジ
export const economicsAnalyticsBadges: DevelopmentBadge[] = [
  {
    id: 'market-analyst',
    name: 'Market Analyst',
    description: '市場分析の専門家',
    category: 'economic_analysis',
    difficulty: 'silver',
    icon: '📈',
    requirements: [
      {
        type: 'economic_forecast_accuracy',
        target: 80,
        current: 0,
        description: '80%以上の予測精度実現',
        progress: 0,
      },
      {
        type: 'market_analysis_precision',
        target: 10,
        current: 0,
        description: '10件の詳細市場分析レポート作成',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 120,
  },
  {
    id: 'economic-modeler',
    name: 'Economic Modeler',
    description: '経済モデリングの専門家',
    category: 'macroeconomics',
    difficulty: 'gold',
    icon: '🔬',
    requirements: [
      {
        type: 'economic_model_validation',
        target: 3,
        current: 0,
        description: '3つの経済モデルの検証',
        progress: 0,
      },
      {
        type: 'policy_impact_analysis',
        target: 5,
        current: 0,
        description: '政策影響分析の実施',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 180,
    prerequisites: ['market-analyst'],
  },
];

// 🤔 哲学・倫理バッジ
export const philosophyEthicsBadges: DevelopmentBadge[] = [
  {
    id: 'tech-ethicist',
    name: 'Tech Ethicist',
    description: 'テクノロジー倫理の専門家',
    category: 'ethics_of_ai',
    difficulty: 'gold',
    icon: '⚖️',
    requirements: [
      {
        type: 'ethical_framework_development',
        target: 1,
        current: 0,
        description: 'AI倫理フレームワークの開発',
        progress: 0,
      },
      {
        type: 'ai_ethics_committee',
        target: 3,
        current: 0,
        description: 'AI倫理委員会への参加',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 150,
  },
  {
    id: 'philosophical-consultant',
    name: 'Philosophical Consultant',
    description: '哲学的思考のコンサルタント',
    category: 'applied_ethics',
    difficulty: 'platinum',
    icon: '🧠',
    requirements: [
      {
        type: 'ethical_consultation',
        target: 10,
        current: 0,
        description: '10件の倫理コンサルティング実施',
        progress: 0,
      },
      {
        type: 'philosophy_publication',
        target: 3,
        current: 0,
        description: '哲学的論文の発表',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 200,
    prerequisites: ['tech-ethicist'],
  },
];

// 🙏 宗教・精神性バッジ
export const religionSpiritualityBadges: DevelopmentBadge[] = [
  {
    id: 'interfaith-mediator',
    name: 'Interfaith Mediator',
    description: '宗教間対話の仲介者',
    category: 'interfaith_dialogue',
    difficulty: 'gold',
    icon: '🕊️',
    requirements: [
      {
        type: 'interfaith_dialogue_facilitation',
        target: 5,
        current: 0,
        description: '5回の異宗教間対話ファシリテーション',
        progress: 0,
      },
      {
        type: 'diversity_celebration',
        target: 3,
        current: 0,
        description: '宗教的多様性イベントの開催',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 150,
  },
  {
    id: 'spiritual-workplace-advocate',
    name: 'Spiritual Workplace Advocate',
    description: '職場スピリチュアリティの推進者',
    category: 'spirituality_workplace',
    difficulty: 'silver',
    icon: '🌟',
    requirements: [
      {
        type: 'spiritual_program_development',
        target: 1,
        current: 0,
        description: '職場スピリチュアルプログラムの開発',
        progress: 0,
      },
      {
        type: 'employee_satisfaction_score',
        target: 85,
        current: 0,
        description: '従業員満足度85%以上の実現',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 120,
  },
];

// 📜 歴史・アーカイブバッジ
export const historyArchiveBadges: DevelopmentBadge[] = [
  {
    id: 'digital-historian',
    name: 'Digital Historian',
    description: 'デジタル歴史学の専門家',
    category: 'digital_humanities',
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
      {
        type: 'digital_archive_creation',
        target: 3,
        current: 0,
        description: 'デジタルアーカイブの構築',
        progress: 0,
      },
    ],
    isUnlocked: true,
    progress: 0,
    points: 100,
  },
  {
    id: 'oral-history-preservationist',
    name: 'Oral History Preservationist',
    description: '口承歴史の保存者',
    category: 'oral_history',
    difficulty: 'gold',
    icon: '🎙️',
    requirements: [
      {
        type: 'oral_history_collection',
        target: 50,
        current: 0,
        description: '50件のオーラルヒストリー収集',
        progress: 0,
      },
      {
        type: 'heritage_preservation',
        target: 5,
        current: 0,
        description: '無形文化遺産の保存活動',
        progress: 0,
      },
    ],
    isUnlocked: false,
    progress: 0,
    points: 150,
    prerequisites: ['digital-historian'],
  },
];

// 全バッジを統合
export const comprehensiveExpandedBadges: DevelopmentBadge[] = [
  ...virtualizationContainerBadges,
  ...scalingPerformanceBadges,
  ...multimediaBadges,
  ...gameDevBadges,
  ...ecommerceBadges,
  ...culturalHistoryBadges,
  ...digitalArtBadges,
  ...internationalizationBadges,
  ...literaturePublishingBadges,
  ...editingContentBadges,
  ...economicsAnalyticsBadges,
  ...philosophyEthicsBadges,
  ...religionSpiritualityBadges,
  ...historyArchiveBadges,
];

/**
 * 📊 拡張バッジ統計情報
 */
export const getExpandedBadgeStatistics = () => {
  const totalBadges = comprehensiveExpandedBadges.length;
  const unlockedBadges = comprehensiveExpandedBadges.filter((badge) => badge.isUnlocked).length;
  const completedBadges = comprehensiveExpandedBadges.filter((badge) => badge.isCompleted).length;

  const categorySummary = comprehensiveExpandedBadges.reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = { total: 0, unlocked: 0, completed: 0 };
      }
      acc[badge.category].total++;
      if (badge.isUnlocked) acc[badge.category].unlocked++;
      if (badge.isCompleted) acc[badge.category].completed++;
      return acc;
    },
    {} as Record<string, { total: number; unlocked: number; completed: number }>
  );

  return {
    totalBadges,
    unlockedBadges,
    completedBadges,
    completionRate: totalBadges > 0 ? (completedBadges / totalBadges) * 100 : 0,
    categorySummary,
    totalPoints: comprehensiveExpandedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0),
    difficultyBreakdown: {
      bronze: comprehensiveExpandedBadges.filter((b) => b.difficulty === 'bronze').length,
      silver: comprehensiveExpandedBadges.filter((b) => b.difficulty === 'silver').length,
      gold: comprehensiveExpandedBadges.filter((b) => b.difficulty === 'gold').length,
      platinum: comprehensiveExpandedBadges.filter((b) => b.difficulty === 'platinum').length,
      legendary: comprehensiveExpandedBadges.filter((b) => b.difficulty === 'legendary').length,
    },
  };
};

/**
 * 🎯 カテゴリ別バッジ取得
 */
export const getBadgesByExpandedCategory = (category: BadgeCategory): DevelopmentBadge[] => {
  return comprehensiveExpandedBadges.filter((badge) => badge.category === category);
};

/**
 * 🔍 バッジ検索
 */
export const searchExpandedBadges = (query: string): DevelopmentBadge[] => {
  const lowercaseQuery = query.toLowerCase();
  return comprehensiveExpandedBadges.filter(
    (badge) =>
      badge.name.toLowerCase().includes(lowercaseQuery) ||
      badge.description.toLowerCase().includes(lowercaseQuery) ||
      badge.category.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * 🏆 次に達成可能なバッジ
 */
export const getNextAchievableExpandedBadge = (): DevelopmentBadge | null => {
  const availableBadges = comprehensiveExpandedBadges.filter(
    (badge) => badge.isUnlocked && !badge.isCompleted
  );

  // 進捗が最も進んでいるバッジを返す
  return availableBadges.sort((a, b) => b.progress - a.progress)[0] || null;
};

/**
 * 📈 週次目標生成
 */
export const generateWeeklyExpandedGoals = (): {
  targetBadges: DevelopmentBadge[];
  focusAreas: string[];
  estimatedHours: number;
} => {
  const nextBadges = comprehensiveExpandedBadges
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
  };
};

export default comprehensiveExpandedBadges;
