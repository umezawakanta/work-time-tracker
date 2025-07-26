/**
 * 🤝 ソーシャルサポートネットワークサービス
 * ADHD/ASDコミュニティとピアサポートの統合プラットフォーム
 */

import { EventEmitter } from 'events';

// ユーザープロファイル型定義
interface SupportUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  diagnostics: ('adhd' | 'asd' | 'both' | 'suspected' | 'supporter')[];
  experience: {
    diagnosedDate?: Date;
    supportExperience: number; // years
    currentChallenges: string[];
    successStrategies: string[];
    specialInterests?: string[]; // ASD特性
    medications?: string[];
    therapies?: string[];
  };
  preferences: {
    communicationStyle: 'direct' | 'gentle' | 'structured' | 'flexible';
    supportType: ('peer' | 'mentor' | 'professional' | 'family')[];
    availableHours: { day: string; start: string; end: string }[];
    timezone: string;
    language: string;
    triggerWarnings: string[];
    comfortZones: string[];
  };
  reputation: {
    helpfulnessScore: number; // 0-100
    reliabilityScore: number; // 0-100
    empathyScore: number; // 0-100
    totalInteractions: number;
    positiveReviews: number;
    endorsements: string[];
  };
  privacySettings: {
    showRealName: boolean;
    shareLocation: boolean;
    shareExperience: boolean;
    allowDirectMessages: boolean;
    groupVisibility: 'public' | 'community' | 'private';
  };
  lastActive: Date;
  joinedDate: Date;
}

// サポートグループ型定義
interface SupportGroup {
  id: string;
  name: string;
  description: string;
  type:
    | 'general'
    | 'adhd_focused'
    | 'asd_focused'
    | 'dual_diagnosis'
    | 'family'
    | 'professional'
    | 'age_specific'
    | 'topic_specific';
  category: 'support' | 'skill_building' | 'social' | 'advocacy' | 'research' | 'crisis_support';
  visibility: 'public' | 'invite_only' | 'private';
  memberCount: number;
  maxMembers: number;
  moderators: string[]; // user IDs
  guidelines: string[];
  topics: string[];
  schedule?: {
    recurring: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: number;
    time?: string;
    duration?: number; // minutes
    timezone: string;
  };
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// メッセージ・投稿型定義
interface CommunityPost {
  id: string;
  authorId: string;
  groupId?: string; // nullの場合は全体投稿
  type:
    | 'question'
    | 'experience_share'
    | 'tip'
    | 'celebration'
    | 'support_request'
    | 'resource'
    | 'discussion';
  title: string;
  content: string;
  tags: string[];
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    description?: string;
  }[];
  emotionalTone: 'positive' | 'neutral' | 'struggling' | 'crisis';
  sensitivityLevel: 'low' | 'medium' | 'high' | 'trigger_warning';
  triggerWarnings?: string[];
  reactions: {
    userId: string;
    type: 'helpful' | 'empathy' | 'celebration' | 'support' | 'insight';
    timestamp: Date;
  }[];
  replies: CommunityReply[];
  isPinned: boolean;
  isModerated: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  visibility: 'public' | 'community' | 'group' | 'supporters_only';
}

interface CommunityReply {
  id: string;
  authorId: string;
  postId: string;
  content: string;
  parentReplyId?: string; // ネストした返信の場合
  reactions: {
    userId: string;
    type: 'helpful' | 'empathy' | 'support';
    timestamp: Date;
  }[];
  isModerated: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// サポートマッチング型定義
interface SupportMatch {
  id: string;
  requesterId: string;
  supporterId?: string;
  status: 'pending' | 'matched' | 'active' | 'completed' | 'cancelled';
  type: 'peer_support' | 'mentoring' | 'buddy_system' | 'crisis_support' | 'skill_sharing';
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  duration: 'one_time' | 'short_term' | 'long_term' | 'ongoing';
  topics: string[];
  preferredSupporter: {
    experience: string[];
    traits: string[];
    communicationStyle: string[];
    availability: string[];
  };
  matchedOn?: Date;
  completedOn?: Date;
  feedback?: {
    rating: number; // 1-5
    comment: string;
    wouldRecommend: boolean;
  };
  sessions: SupportSession[];
  createdAt: Date;
}

interface SupportSession {
  id: string;
  matchId: string;
  type: 'chat' | 'video' | 'voice' | 'in_person';
  scheduledStart: Date;
  actualStart?: Date;
  actualEnd?: Date;
  duration?: number; // minutes
  notes?: string;
  outcomes: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  feedback?: {
    helpfulness: number; // 1-5
    comfort: number; // 1-5
    followUpNeeded: boolean;
    topics_covered: string[];
  };
}

// 専門家連携型定義
interface ProfessionalProfile {
  id: string;
  name: string;
  credentials: string[];
  specializations: (
    | 'adhd'
    | 'asd'
    | 'anxiety'
    | 'depression'
    | 'executive_function'
    | 'social_skills'
    | 'family_therapy'
  )[];
  type:
    | 'therapist'
    | 'psychiatrist'
    | 'psychologist'
    | 'counselor'
    | 'coach'
    | 'educator'
    | 'occupational_therapist';
  experience: number; // years
  languages: string[];
  location: {
    type: 'in_person' | 'online' | 'both';
    city?: string;
    country: string;
    timezone: string;
  };
  availability: {
    consultationHours: { day: string; start: string; end: string }[];
    waitingTime: number; // days
    acceptingNewClients: boolean;
  };
  services: {
    name: string;
    description: string;
    duration: number; // minutes
    type: 'assessment' | 'therapy' | 'consultation' | 'group_session' | 'workshop';
    cost?: {
      amount: number;
      currency: string;
      covered_by_insurance: boolean;
    };
  }[];
  verificationStatus: 'pending' | 'verified' | 'certified';
  ratings: {
    overall: number; // 1-5
    communication: number;
    expertise: number;
    cultural_sensitivity: number;
    total_reviews: number;
  };
  bio: string;
  approach: string[];
  joinedDate: Date;
}

// リソース・知識ベース型定義
interface KnowledgeResource {
  id: string;
  title: string;
  description: string;
  type:
    | 'article'
    | 'video'
    | 'podcast'
    | 'book'
    | 'research'
    | 'tool'
    | 'app'
    | 'website'
    | 'course';
  category:
    | 'coping_strategies'
    | 'understanding_adhd'
    | 'understanding_asd'
    | 'relationships'
    | 'work'
    | 'education'
    | 'parenting'
    | 'self_care';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToConsume: number; // minutes
  adhdRelevance: number; // 0-100
  asdRelevance: number; // 0-100
  evidenceBased: boolean;
  author: {
    name: string;
    credentials?: string[];
    isVerified: boolean;
  };
  content?: string;
  externalUrl?: string;
  tags: string[];
  ratings: {
    helpfulness: number; // 1-5
    accuracy: number; // 1-5
    clarity: number; // 1-5
    total_ratings: number;
  };
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    helpful_count: number;
    timestamp: Date;
  }[];
  lastUpdated: Date;
  isModerated: boolean;
  reportCount: number;
}

// クライシスサポート型定義
interface CrisisSupport {
  id: string;
  userId: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  type:
    | 'emotional'
    | 'behavioral'
    | 'suicidal'
    | 'self_harm'
    | 'substance'
    | 'family_crisis'
    | 'work_crisis';
  description: string;
  location?: {
    country: string;
    region?: string;
    emergency_contacts_available: boolean;
  };
  supportProvided: {
    type: 'peer_support' | 'professional_referral' | 'crisis_hotline' | 'emergency_services';
    providerId?: string;
    timestamp: Date;
    outcome: 'resolved' | 'referred' | 'ongoing' | 'escalated';
    followUpNeeded: boolean;
  }[];
  status: 'active' | 'supported' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  followUps: {
    timestamp: Date;
    checkedBy: string;
    status: string;
    notes: string;
  }[];
}

export class SocialSupportNetworkService extends EventEmitter {
  private userProfiles: Map<string, SupportUserProfile> = new Map();
  private supportGroups: Map<string, SupportGroup> = new Map();
  private communityPosts: Map<string, CommunityPost> = new Map();
  private supportMatches: Map<string, SupportMatch> = new Map();
  private professionals: Map<string, ProfessionalProfile> = new Map();
  private knowledgeResources: Map<string, KnowledgeResource> = new Map();
  private crisisSupports: Map<string, CrisisSupport> = new Map();
  private activeSessions: Map<string, SupportSession> = new Map();

  constructor() {
    super();
    this.initializeSocialSupport();
  }

  /**
   * ソーシャルサポートシステムの初期化
   */
  private async initializeSocialSupport(): Promise<void> {
    console.log('🤝 ソーシャルサポートネットワークを初期化中...');

    this.initializeDefaultGroups();
    this.initializeKnowledgeBase();
    this.initializeModerationSystem();
    this.startCommunityMonitoring();

    console.log('✅ ソーシャルサポートネットワークが準備完了');
    this.emit('systemReady');
  }

  /**
   * デフォルトサポートグループの作成
   */
  private initializeDefaultGroups(): void {
    const defaultGroups: SupportGroup[] = [
      {
        id: 'adhd_support_general',
        name: 'ADHD総合サポートグループ',
        description: 'ADHD当事者・家族・支援者のための総合的なサポートコミュニティ',
        type: 'adhd_focused',
        category: 'support',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 500,
        moderators: ['moderator_1'],
        guidelines: [
          'お互いを尊重し、批判的でない環境を維持しましょう',
          '個人的な医療アドバイスは避け、専門家への相談を推奨しましょう',
          'プライバシーを尊重し、他の人の情報を外部に持ち出さないでください',
          'トリガーとなる可能性のある内容には適切な警告をつけてください',
        ],
        topics: ['症状管理', '薬物療法', '日常生活スキル', '職場対応', '学校サポート', '人間関係'],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
      {
        id: 'asd_support_general',
        name: 'ASD総合サポートグループ',
        description: '自閉スペクトラム症当事者・家族のための包括的サポート',
        type: 'asd_focused',
        category: 'support',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 500,
        moderators: ['moderator_2'],
        guidelines: [
          'ニューロダイバーシティを尊重し、多様性を受け入れましょう',
          'コミュニケーションスタイルの違いを理解しましょう',
          'センサリーな配慮を忘れずに',
          '「治療」ではなく「サポート」の視点を大切にしましょう',
        ],
        topics: [
          '感覚処理',
          'コミュニケーション',
          '社会スキル',
          '特別な関心',
          '移行支援',
          '自己理解',
        ],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
      {
        id: 'dual_diagnosis_support',
        name: 'ADHD+ASD併存サポート',
        description: 'ADHD・ASD両方の特性を持つ方のための特別サポートグループ',
        type: 'dual_diagnosis',
        category: 'support',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 200,
        moderators: ['moderator_3'],
        guidelines: [
          '複雑な特性の組み合わせを理解し合いましょう',
          '個別性を重視し、一般化を避けましょう',
          '相互サポートと情報共有を重視しましょう',
        ],
        topics: ['併存の影響', '診断プロセス', '特性の相互作用', '個別支援戦略'],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
      {
        id: 'workplace_support',
        name: '職場サポートグループ',
        description: '働く大人のADHD/ASD当事者のためのキャリア・職場支援',
        type: 'topic_specific',
        category: 'skill_building',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 300,
        moderators: ['moderator_4'],
        guidelines: [
          '職場での合理的配慮について情報共有しましょう',
          '成功事例と課題を共有し合いましょう',
          '機密情報の取り扱いに注意しましょう',
        ],
        topics: ['合理的配慮', 'キャリア開発', 'ストレス管理', 'チームワーク', '面接対策'],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
      {
        id: 'family_support',
        name: '家族・支援者グループ',
        description: 'ADHD/ASD当事者の家族・友人・支援者のためのサポート',
        type: 'family',
        category: 'support',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 400,
        moderators: ['moderator_5'],
        guidelines: [
          '当事者の視点を尊重しましょう',
          '支援する側のケアも大切にしましょう',
          '当事者抜きの決定を避けましょう',
        ],
        topics: ['理解と受容', '効果的な支援方法', '境界線の設定', 'セルフケア'],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
      {
        id: 'crisis_support_24_7',
        name: '24時間クライシスサポート',
        description: '緊急時・危機的状況での即座サポート（専門スタッフ常駐）',
        type: 'general',
        category: 'crisis_support',
        visibility: 'public',
        memberCount: 0,
        maxMembers: 1000,
        moderators: ['crisis_specialist_1', 'crisis_specialist_2'],
        guidelines: [
          '緊急時は躊躇なく専門機関に連絡しましょう',
          'ピアサポートと専門支援を適切に使い分けましょう',
          '危機的状況では安全第一を心がけましょう',
        ],
        topics: ['危機介入', '安全計画', '緊急連絡先', 'セルフケア戦略'],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      },
    ];

    defaultGroups.forEach((group) => {
      this.supportGroups.set(group.id, group);
    });
  }

  /**
   * 知識ベースの初期化
   */
  private initializeKnowledgeBase(): void {
    const defaultResources: KnowledgeResource[] = [
      {
        id: 'adhd_basics_guide',
        title: 'ADHD基本理解ガイド',
        description: 'ADHD の基本的な特性、症状、診断プロセスについての包括的ガイド',
        type: 'article',
        category: 'understanding_adhd',
        difficulty: 'beginner',
        timeToConsume: 30,
        adhdRelevance: 100,
        asdRelevance: 20,
        evidenceBased: true,
        author: {
          name: 'ADHD研究会',
          credentials: ['臨床心理士', '精神科医'],
          isVerified: true,
        },
        content: 'ADHDの特性、診断基準、日常生活への影響について詳しく解説...',
        tags: ['ADHD', '基本知識', '診断', '特性理解'],
        ratings: {
          helpfulness: 4.8,
          accuracy: 4.9,
          clarity: 4.7,
          total_ratings: 247,
        },
        reviews: [],
        lastUpdated: new Date(),
        isModerated: true,
        reportCount: 0,
      },
      {
        id: 'asd_social_skills_toolkit',
        title: 'ASD社会スキル実践ツールキット',
        description: '日常的な社会的相互作用を改善するための具体的戦略とツール',
        type: 'tool',
        category: 'understanding_asd',
        difficulty: 'intermediate',
        timeToConsume: 60,
        adhdRelevance: 40,
        asdRelevance: 95,
        evidenceBased: true,
        author: {
          name: '自閉症支援センター',
          credentials: ['応用行動分析士', '特別支援教育専門家'],
          isVerified: true,
        },
        content: 'ソーシャルスキルの段階的習得方法、実践例、フィードバックシステム...',
        tags: ['ASD', '社会スキル', '実践ツール', 'コミュニケーション'],
        ratings: {
          helpfulness: 4.9,
          accuracy: 4.8,
          clarity: 4.6,
          total_ratings: 156,
        },
        reviews: [],
        lastUpdated: new Date(),
        isModerated: true,
        reportCount: 0,
      },
      {
        id: 'executive_function_strategies',
        title: '実行機能改善のための21の戦略',
        description: 'ADHD/ASDに共通する実行機能の課題を改善するための証拠に基づく戦略',
        type: 'article',
        category: 'coping_strategies',
        difficulty: 'intermediate',
        timeToConsume: 45,
        adhdRelevance: 90,
        asdRelevance: 85,
        evidenceBased: true,
        author: {
          name: '認知行動療法研究所',
          credentials: ['臨床心理士', '認知行動療法士'],
          isVerified: true,
        },
        content: 'プランニング、優先順位設定、時間管理、作業記憶サポート戦略...',
        tags: ['実行機能', '認知戦略', 'ADHD', 'ASD', '日常生活'],
        ratings: {
          helpfulness: 4.9,
          accuracy: 4.8,
          clarity: 4.8,
          total_ratings: 324,
        },
        reviews: [],
        lastUpdated: new Date(),
        isModerated: true,
        reportCount: 0,
      },
      {
        id: 'sensory_processing_guide',
        title: '感覚処理の理解と対応ガイド',
        description: '感覚過敏・感覚鈍麻への理解と日常的な対処法',
        type: 'article',
        category: 'understanding_asd',
        difficulty: 'beginner',
        timeToConsume: 25,
        adhdRelevance: 60,
        asdRelevance: 95,
        evidenceBased: true,
        author: {
          name: '感覚統合療法協会',
          credentials: ['作業療法士', '感覚統合認定セラピスト'],
          isVerified: true,
        },
        content: '感覚処理の基本、個人差、環境調整、セルフケア方法...',
        tags: ['感覚処理', '感覚過敏', '環境調整', 'ASD', 'ADHD'],
        ratings: {
          helpfulness: 4.7,
          accuracy: 4.9,
          clarity: 4.5,
          total_ratings: 198,
        },
        reviews: [],
        lastUpdated: new Date(),
        isModerated: true,
        reportCount: 0,
      },
      {
        id: 'workplace_accommodation_handbook',
        title: '職場での合理的配慮ハンドブック',
        description: '職場でのADHD/ASD特性に対する合理的配慮の要求と実施ガイド',
        type: 'book',
        category: 'work',
        difficulty: 'advanced',
        timeToConsume: 120,
        adhdRelevance: 85,
        asdRelevance: 85,
        evidenceBased: true,
        author: {
          name: '障害者雇用促進機構',
          credentials: ['社会保険労務士', '産業カウンセラー'],
          isVerified: true,
        },
        content: '法的根拠、要求方法、具体的配慮例、企業との交渉術...',
        tags: ['職場', '合理的配慮', '雇用', '法的権利', 'キャリア'],
        ratings: {
          helpfulness: 4.8,
          accuracy: 5.0,
          clarity: 4.6,
          total_ratings: 142,
        },
        reviews: [],
        lastUpdated: new Date(),
        isModerated: true,
        reportCount: 0,
      },
    ];

    defaultResources.forEach((resource) => {
      this.knowledgeResources.set(resource.id, resource);
    });
  }

  /**
   * モデレーションシステムの初期化
   */
  private initializeModerationSystem(): void {
    // 不適切コンテンツ検出、自動警告システムの設定
    console.log('🛡️ モデレーションシステムを初期化');
  }

  /**
   * コミュニティ監視の開始
   */
  private startCommunityMonitoring(): void {
    // 24時間監視、クライシス検出、自動エスカレーションの設定
    setInterval(() => {
      this.monitorCommunityHealth();
      this.checkCrisisSituations();
    }, 60000); // 1分間隔

    console.log('👁️ コミュニティ監視システムが開始されました');
  }

  /**
   * コミュニティヘルスの監視
   */
  private async monitorCommunityHealth(): Promise<void> {
    // アクティビティレベル、ネガティブ投稿の増加、モデレーション必要性の監視
    for (const [groupId, group] of this.supportGroups) {
      const recentActivity = this.getRecentGroupActivity(groupId, 24); // 24時間

      if (recentActivity.negativePostRatio > 0.3) {
        this.emit('communityAlertHigh', {
          groupId,
          reason: 'high_negative_content',
          severity: 'medium',
        });
      }

      if (recentActivity.reportCount > 5) {
        this.emit('moderationRequired', {
          groupId,
          reason: 'multiple_reports',
          urgency: 'high',
        });
      }
    }
  }

  /**
   * クライシス状況のチェック
   */
  private async checkCrisisSituations(): Promise<void> {
    const activeCrises = Array.from(this.crisisSupports.values()).filter(
      (crisis) => crisis.status === 'active'
    );

    for (const crisis of activeCrises) {
      const timeSinceCreated = Date.now() - crisis.createdAt.getTime();

      // 30分以内に対応されていない重要なクライシス
      if (crisis.severity === 'critical' && timeSinceCreated > 30 * 60 * 1000) {
        if (crisis.supportProvided.length === 0) {
          await this.escalateCrisis(crisis.id);
        }
      }

      // 2時間以内に対応されていない一般クライシス
      if (crisis.severity === 'severe' && timeSinceCreated > 2 * 60 * 60 * 1000) {
        if (crisis.supportProvided.length === 0) {
          await this.escalateCrisis(crisis.id);
        }
      }
    }
  }

  /**
   * グループ活動分析
   */
  private getRecentGroupActivity(groupId: string, hours: number): any {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
    const posts = Array.from(this.communityPosts.values()).filter(
      (post) => post.groupId === groupId && post.createdAt >= timeThreshold
    );

    const negativePostCount = posts.filter(
      (post) => post.emotionalTone === 'struggling' || post.emotionalTone === 'crisis'
    ).length;

    const reportCount = posts.reduce((sum, post) => sum + post.reportCount, 0);

    return {
      totalPosts: posts.length,
      negativePostCount,
      negativePostRatio: posts.length > 0 ? negativePostCount / posts.length : 0,
      reportCount,
      avgSentiment: this.calculateSentiment(posts),
    };
  }

  /**
   * 感情分析
   */
  private calculateSentiment(posts: CommunityPost[]): number {
    if (posts.length === 0) return 0;

    const sentimentScore = posts.reduce((sum, post) => {
      switch (post.emotionalTone) {
        case 'positive':
          return sum + 1;
        case 'neutral':
          return sum + 0;
        case 'struggling':
          return sum - 0.5;
        case 'crisis':
          return sum - 1;
        default:
          return sum;
      }
    }, 0);

    return sentimentScore / posts.length;
  }

  /**
   * クライシスエスカレーション
   */
  private async escalateCrisis(crisisId: string): Promise<void> {
    const crisis = this.crisisSupports.get(crisisId);
    if (!crisis) return;

    // 専門家アラート送信
    this.emit('crisisEscalation', {
      crisisId,
      severity: crisis.severity,
      type: crisis.type,
      userId: crisis.userId,
      timeSinceCreated: Date.now() - crisis.createdAt.getTime(),
    });

    // 自動的に利用可能な専門家にアサイン
    await this.assignCrisisSpecialist(crisisId);
  }

  /**
   * クライシス専門家の自動アサイン
   */
  private async assignCrisisSpecialist(crisisId: string): Promise<void> {
    const crisis = this.crisisSupports.get(crisisId);
    if (!crisis) return;

    const availableSpecialists = Array.from(this.professionals.values())
      .filter(
        (prof) =>
          prof.specializations.includes('crisis_intervention') &&
          prof.availability.acceptingNewClients
      )
      .sort((a, b) => b.ratings.overall - a.ratings.overall); // 評価順

    if (availableSpecialists.length > 0) {
      const specialist = availableSpecialists[0];

      crisis.supportProvided.push({
        type: 'professional_referral',
        providerId: specialist.id,
        timestamp: new Date(),
        outcome: 'ongoing',
        followUpNeeded: true,
      });

      this.emit('crisisAssigned', {
        crisisId,
        specialistId: specialist.id,
        assignedAt: new Date(),
      });
    }
  }

  // Public API Methods

  /**
   * ユーザープロファイルの作成・更新
   */
  public async createUserProfile(
    profileData: Partial<SupportUserProfile> & { id: string }
  ): Promise<void> {
    const profile: SupportUserProfile = {
      username: '',
      displayName: '',
      diagnostics: [],
      experience: {
        supportExperience: 0,
        currentChallenges: [],
        successStrategies: [],
      },
      preferences: {
        communicationStyle: 'flexible',
        supportType: ['peer'],
        availableHours: [],
        timezone: 'Asia/Tokyo',
        language: 'ja',
        triggerWarnings: [],
        comfortZones: [],
      },
      reputation: {
        helpfulnessScore: 50,
        reliabilityScore: 50,
        empathyScore: 50,
        totalInteractions: 0,
        positiveReviews: 0,
        endorsements: [],
      },
      privacySettings: {
        showRealName: false,
        shareLocation: false,
        shareExperience: true,
        allowDirectMessages: true,
        groupVisibility: 'community',
      },
      lastActive: new Date(),
      joinedDate: new Date(),
      ...profileData,
    };

    this.userProfiles.set(profile.id, profile);
    this.emit('userJoined', { userId: profile.id, profile });
  }

  /**
   * サポートグループへの参加
   */
  public async joinSupportGroup(userId: string, groupId: string): Promise<boolean> {
    const group = this.supportGroups.get(groupId);
    if (!group) return false;

    if (group.memberCount >= group.maxMembers) return false;

    group.memberCount++;
    group.lastActivity = new Date();

    this.emit('userJoinedGroup', { userId, groupId, timestamp: new Date() });
    return true;
  }

  /**
   * コミュニティ投稿の作成
   */
  public async createCommunityPost(
    authorId: string,
    postData: Omit<
      CommunityPost,
      'id' | 'authorId' | 'reactions' | 'replies' | 'reportCount' | 'createdAt' | 'updatedAt'
    >
  ): Promise<string> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const post: CommunityPost = {
      id: postId,
      authorId,
      reactions: [],
      replies: [],
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...postData,
    };

    // 自動モデレーション
    if (this.requiresModeration(post)) {
      post.isModerated = true;
      this.emit('postRequiresModeration', { postId, reasons: this.getModerationReasons(post) });
    }

    // クライシス検出
    if (this.detectsCrisis(post)) {
      await this.handleCrisisPost(post);
    }

    this.communityPosts.set(postId, post);
    this.emit('postCreated', { postId, authorId, groupId: post.groupId });

    return postId;
  }

  /**
   * サポートマッチの要求
   */
  public async requestSupportMatch(
    requesterId: string,
    matchData: Omit<SupportMatch, 'id' | 'requesterId' | 'status' | 'sessions' | 'createdAt'>
  ): Promise<string> {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match: SupportMatch = {
      id: matchId,
      requesterId,
      status: 'pending',
      sessions: [],
      createdAt: new Date(),
      ...matchData,
    };

    this.supportMatches.set(matchId, match);

    // 自動マッチング試行
    await this.attemptAutoMatching(matchId);

    this.emit('matchRequested', { matchId, requesterId, urgency: match.urgency });
    return matchId;
  }

  /**
   * 知識リソースの検索
   */
  public searchKnowledgeResources(
    query: string,
    filters?: {
      category?: string;
      type?: string;
      difficulty?: string;
      adhdRelevance?: number;
      asdRelevance?: number;
    }
  ): KnowledgeResource[] {
    let resources = Array.from(this.knowledgeResources.values());

    // フィルタリング
    if (filters) {
      if (filters.category) {
        resources = resources.filter((r) => r.category === filters.category);
      }
      if (filters.type) {
        resources = resources.filter((r) => r.type === filters.type);
      }
      if (filters.difficulty) {
        resources = resources.filter((r) => r.difficulty === filters.difficulty);
      }
      if (filters.adhdRelevance) {
        resources = resources.filter((r) => r.adhdRelevance >= filters.adhdRelevance!);
      }
      if (filters.asdRelevance) {
        resources = resources.filter((r) => r.asdRelevance >= filters.asdRelevance!);
      }
    }

    // テキスト検索
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      resources = resources.filter((resource) =>
        searchTerms.some(
          (term) =>
            resource.title.toLowerCase().includes(term) ||
            resource.description.toLowerCase().includes(term) ||
            resource.tags.some((tag) => tag.toLowerCase().includes(term))
        )
      );
    }

    // 関連度でソート
    return resources.sort((a, b) => {
      const aScore = a.ratings.helpfulness * a.ratings.total_ratings;
      const bScore = b.ratings.helpfulness * b.ratings.total_ratings;
      return bScore - aScore;
    });
  }

  /**
   * クライシスサポートの報告
   */
  public async reportCrisis(
    userId: string,
    crisisData: Omit<
      CrisisSupport,
      'id' | 'userId' | 'supportProvided' | 'status' | 'createdAt' | 'followUps'
    >
  ): Promise<string> {
    const crisisId = `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const crisis: CrisisSupport = {
      id: crisisId,
      userId,
      supportProvided: [],
      status: 'active',
      createdAt: new Date(),
      followUps: [],
      ...crisisData,
    };

    this.crisisSupports.set(crisisId, crisis);

    // 即座のサポート提供
    if (crisis.severity === 'critical' || crisis.severity === 'severe') {
      await this.provideCrisisSupport(crisisId);
    }

    this.emit('crisisReported', { crisisId, severity: crisis.severity, type: crisis.type });
    return crisisId;
  }

  /**
   * 自動マッチング試行
   */
  private async attemptAutoMatching(matchId: string): Promise<void> {
    const match = this.supportMatches.get(matchId);
    if (!match) return;

    const requesterProfile = this.userProfiles.get(match.requesterId);
    if (!requesterProfile) return;

    // 利用可能なサポーターを検索
    const availableSupporters = Array.from(this.userProfiles.values())
      .filter(
        (profile) =>
          profile.id !== match.requesterId &&
          profile.preferences.supportType.includes('peer') &&
          this.isCompatible(requesterProfile, profile, match.preferredSupporter) &&
          this.isAvailable(profile)
      )
      .sort((a, b) => b.reputation.helpfulnessScore - a.reputation.helpfulnessScore);

    if (availableSupporters.length > 0) {
      const supporter = availableSupporters[0];
      match.supporterId = supporter.id;
      match.status = 'matched';
      match.matchedOn = new Date();

      this.emit('matchFound', {
        matchId,
        requesterId: match.requesterId,
        supporterId: supporter.id,
      });
    }
  }

  /**
   * 互換性チェック
   */
  private isCompatible(
    requester: SupportUserProfile,
    supporter: SupportUserProfile,
    preferences: SupportMatch['preferredSupporter']
  ): boolean {
    // 経験レベルチェック
    if (preferences.experience.length > 0) {
      const hasRelevantExperience = preferences.experience.some((exp) =>
        supporter.experience.successStrategies.some((strategy) =>
          strategy.toLowerCase().includes(exp.toLowerCase())
        )
      );
      if (!hasRelevantExperience) return false;
    }

    // コミュニケーションスタイルチェック
    if (preferences.communicationStyle.length > 0) {
      if (!preferences.communicationStyle.includes(supporter.preferences.communicationStyle)) {
        return false;
      }
    }

    // 言語チェック
    if (requester.preferences.language !== supporter.preferences.language) {
      return false;
    }

    return true;
  }

  /**
   * 利用可能性チェック
   */
  private isAvailable(profile: SupportUserProfile): boolean {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    return profile.preferences.availableHours.some(
      (slot) =>
        slot.day.toLowerCase() === currentDay &&
        slot.start <= currentTime &&
        slot.end >= currentTime
    );
  }

  /**
   * モデレーション要否判定
   */
  private requiresModeration(post: CommunityPost): boolean {
    // 機械学習ベースの内容分析（簡略版）
    const sensitiveKeywords = ['自傷', '自殺', '薬物', '違法', '攻撃'];
    const lowercaseContent = post.content.toLowerCase();

    return (
      sensitiveKeywords.some((keyword) => lowercaseContent.includes(keyword)) ||
      post.sensitivityLevel === 'high' ||
      post.sensitivityLevel === 'trigger_warning'
    );
  }

  /**
   * モデレーション理由取得
   */
  private getModerationReasons(post: CommunityPost): string[] {
    const reasons: string[] = [];

    if (post.sensitivityLevel === 'high') reasons.push('高感度コンテンツ');
    if (post.sensitivityLevel === 'trigger_warning') reasons.push('トリガー警告必要');
    if (post.content.includes('自傷')) reasons.push('自傷関連内容');
    if (post.content.includes('自殺')) reasons.push('自殺関連内容');

    return reasons;
  }

  /**
   * クライシス検出
   */
  private detectsCrisis(post: CommunityPost): boolean {
    return (
      post.emotionalTone === 'crisis' ||
      (post.type === 'support_request' && post.sensitivityLevel === 'trigger_warning')
    );
  }

  /**
   * クライシス投稿処理
   */
  private async handleCrisisPost(post: CommunityPost): Promise<void> {
    // 自動的にクライシスサポートを作成
    await this.reportCrisis(post.authorId, {
      severity: 'moderate',
      type: 'emotional',
      description: `コミュニティ投稿から検出: ${post.title}`,
      location: {
        country: 'JP',
        emergency_contacts_available: false,
      },
    });
  }

  /**
   * クライシスサポート提供
   */
  private async provideCrisisSupport(crisisId: string): Promise<void> {
    const crisis = this.crisisSupports.get(crisisId);
    if (!crisis) return;

    // 即座のピアサポート
    const availablePeerSupporters = Array.from(this.userProfiles.values()).filter(
      (profile) =>
        profile.preferences.supportType.includes('peer') &&
        profile.experience.supportExperience > 2 &&
        profile.reputation.empathyScore > 80
    );

    if (availablePeerSupporters.length > 0) {
      const supporter = availablePeerSupporters[0];

      crisis.supportProvided.push({
        type: 'peer_support',
        providerId: supporter.id,
        timestamp: new Date(),
        outcome: 'ongoing',
        followUpNeeded: true,
      });

      this.emit('crisisSupported', { crisisId, supporterId: supporter.id });
    }

    // 専門家への即座アサイン（重要度が高い場合）
    if (crisis.severity === 'critical') {
      await this.assignCrisisSpecialist(crisisId);
    }
  }

  /**
   * データ取得メソッド
   */
  public getSupportGroups(): SupportGroup[] {
    return Array.from(this.supportGroups.values());
  }

  public getUserProfile(userId: string): SupportUserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public getCommunityPosts(groupId?: string): CommunityPost[] {
    const posts = Array.from(this.communityPosts.values());
    return groupId ? posts.filter((p) => p.groupId === groupId) : posts;
  }

  public getSupportMatches(userId: string): SupportMatch[] {
    return Array.from(this.supportMatches.values()).filter(
      (match) => match.requesterId === userId || match.supporterId === userId
    );
  }

  public getProfessionals(specialization?: string): ProfessionalProfile[] {
    const professionals = Array.from(this.professionals.values());
    return specialization
      ? professionals.filter((p) => p.specializations.includes(specialization as any))
      : professionals;
  }

  /**
   * 統計データ取得
   */
  public getCommunityStatistics(): any {
    const totalUsers = this.userProfiles.size;
    const totalGroups = this.supportGroups.size;
    const totalPosts = this.communityPosts.size;
    const activeMatches = Array.from(this.supportMatches.values()).filter(
      (m) => m.status === 'active'
    ).length;
    const activeCrises = Array.from(this.crisisSupports.values()).filter(
      (c) => c.status === 'active'
    ).length;

    return {
      totalUsers,
      totalGroups,
      totalPosts,
      activeMatches,
      activeCrises,
      avgUserReputation:
        totalUsers > 0
          ? Array.from(this.userProfiles.values()).reduce(
              (sum, u) => sum + u.reputation.helpfulnessScore,
              0
            ) / totalUsers
          : 0,
      communityHealth: this.calculateCommunityHealth(),
    };
  }

  /**
   * コミュニティヘルス計算
   */
  private calculateCommunityHealth(): number {
    const recentPosts = Array.from(this.communityPosts.values()).filter(
      (p) => p.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentPosts.length === 0) return 50; // 中立

    const avgSentiment = this.calculateSentiment(recentPosts);
    const reportRate = recentPosts.reduce((sum, p) => sum + p.reportCount, 0) / recentPosts.length;

    // 0-100スケールで健康度を計算
    const sentimentScore = (avgSentiment + 1) * 50; // -1〜1を0〜100に変換
    const reportScore = Math.max(0, 100 - reportRate * 50); // 報告が少ないほど高得点

    return (sentimentScore + reportScore) / 2;
  }

  /**
   * サービス停止
   */
  public stop(): void {
    console.log('🤝 ソーシャルサポートネットワークサービスを停止しました');
  }
}

export default SocialSupportNetworkService;
