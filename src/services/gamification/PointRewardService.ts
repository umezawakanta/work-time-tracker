import { toast } from '@/components/ui/use-toast';

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'bonus' | 'penalty';
  source: string;
  description: string;
  category: PointCategory;
  timestamp: string;
  metadata?: Record<string, any>;
  multiplier?: number;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  spentPoints: number;
  earnedPoints: number;
  level: number;
  rank: string;
  streakCount: number;
  multiplier: number;
  achievements: string[];
  lastActivity: string;
}

export interface PointRule {
  id: string;
  name: string;
  description: string;
  action: string;
  points: number;
  category: PointCategory;
  conditions: PointCondition[];
  cooldown?: number; // Minutes
  maxDailyEarnings?: number;
  multiplierEligible: boolean;
  enabled: boolean;
}

export interface PointCondition {
  type: 'time_based' | 'completion_based' | 'streak_based' | 'quality_based';
  field: string;
  operator: '=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: any;
  description: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  cost: number;
  type: 'digital' | 'physical' | 'experience' | 'upgrade';
  availability: {
    stock: number;
    unlimited: boolean;
    startDate?: string;
    endDate?: string;
  };
  requirements?: {
    minLevel?: number;
    achievements?: string[];
    customConditions?: string[];
  };
  metadata: {
    image?: string;
    tags: string[];
    popularity: number;
    redemptionCount: number;
  };
  enabled: boolean;
}

export interface PointMultiplier {
  id: string;
  name: string;
  factor: number;
  conditions: MultiplierCondition[];
  duration: number; // Minutes
  stackable: boolean;
  priority: number;
  enabled: boolean;
}

export interface MultiplierCondition {
  type: 'time_range' | 'streak' | 'achievement' | 'special_event';
  value: any;
  description: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  requirements: ChallengeRequirement[];
  reward: number;
  bonusReward?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: PointCategory;
  expiresAt: string;
  completedBy: string[];
  featured: boolean;
}

export interface ChallengeRequirement {
  type: string;
  target: number;
  current: number;
  description: string;
}

export type PointCategory =
  | 'productivity'
  | 'learning'
  | 'health'
  | 'social'
  | 'achievement'
  | 'milestone'
  | 'bonus'
  | 'special';

export type RewardCategory =
  | 'themes'
  | 'features'
  | 'cosmetic'
  | 'functional'
  | 'social'
  | 'exclusive'
  | 'limited';

export interface PointStatistics {
  totalUsers: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  averagePointsPerUser: number;
  mostActiveUsers: UserPoints[];
  popularRewards: Reward[];
  dailyStats: {
    date: string;
    pointsEarned: number;
    pointsSpent: number;
    activeUsers: number;
  }[];
}

/**
 * 🎮 ゲーミフィケーション設計者: ポイント報酬サービス
 * 包括的ポイントシステムとユーザーエンゲージメント向上
 */
class PointRewardService {
  private static instance: PointRewardService | null = null;
  private userPoints: Map<string, UserPoints> = new Map();
  private transactions: PointTransaction[] = [];
  private pointRules: Map<string, PointRule> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private multipliers: Map<string, PointMultiplier> = new Map();
  private dailyChallenges: Map<string, DailyChallenge> = new Map();
  private activeMultipliers: Map<string, { multiplierId: string; expiresAt: Date }[]> = new Map();

  private constructor() {
    this.initializePointRules();
    this.initializeRewards();
    this.initializeMultipliers();
    this.initializeDailyChallenges();
    this.startDailyReset();
  }

  public static getInstance(): PointRewardService {
    if (!PointRewardService.instance) {
      PointRewardService.instance = new PointRewardService();
    }
    return PointRewardService.instance;
  }

  /**
   * 🏆 ポイントルール初期化
   */
  private initializePointRules(): void {
    const defaultRules: PointRule[] = [
      {
        id: 'todo_complete',
        name: 'タスク完了',
        description: 'タスクを完了すると獲得',
        action: 'complete_todo',
        points: 10,
        category: 'productivity',
        conditions: [
          {
            type: 'completion_based',
            field: 'status',
            operator: '=',
            value: 'completed',
            description: 'タスクが完了状態',
          },
        ],
        cooldown: 0,
        maxDailyEarnings: 500,
        multiplierEligible: true,
        enabled: true,
      },
      {
        id: 'urgent_task_complete',
        name: '緊急タスク完了',
        description: '緊急度の高いタスクを完了',
        action: 'complete_urgent_todo',
        points: 25,
        category: 'productivity',
        conditions: [
          {
            type: 'completion_based',
            field: 'priority',
            operator: '=',
            value: 'urgent',
            description: '緊急度が高い',
          },
          {
            type: 'completion_based',
            field: 'status',
            operator: '=',
            value: 'completed',
            description: 'タスクが完了状態',
          },
        ],
        cooldown: 0,
        maxDailyEarnings: 1000,
        multiplierEligible: true,
        enabled: true,
      },
      {
        id: 'streak_bonus',
        name: '連続達成ボーナス',
        description: '連続でタスクを完了',
        action: 'streak_achievement',
        points: 50,
        category: 'bonus',
        conditions: [
          {
            type: 'streak_based',
            field: 'dailyStreak',
            operator: '>=',
            value: 7,
            description: '7日連続達成',
          },
        ],
        cooldown: 1440, // 24時間
        multiplierEligible: false,
        enabled: true,
      },
      {
        id: 'pomodoro_complete',
        name: 'ポモドーロ完了',
        description: 'ポモドーロタイマーを完了',
        action: 'complete_pomodoro',
        points: 15,
        category: 'productivity',
        conditions: [
          {
            type: 'time_based',
            field: 'duration',
            operator: '>=',
            value: 25,
            description: '25分以上集中',
          },
        ],
        cooldown: 0,
        maxDailyEarnings: 600,
        multiplierEligible: true,
        enabled: true,
      },
      {
        id: 'early_riser',
        name: '早起きボーナス',
        description: '朝7時前にアクティビティ開始',
        action: 'early_activity',
        points: 20,
        category: 'health',
        conditions: [
          {
            type: 'time_based',
            field: 'hour',
            operator: '<',
            value: 7,
            description: '朝7時前の活動',
          },
        ],
        cooldown: 1440,
        multiplierEligible: true,
        enabled: true,
      },
      {
        id: 'milestone_achievement',
        name: 'マイルストーン達成',
        description: '重要なマイルストーンを達成',
        action: 'achieve_milestone',
        points: 100,
        category: 'milestone',
        conditions: [],
        cooldown: 0,
        multiplierEligible: false,
        enabled: true,
      },
      {
        id: 'learning_complete',
        name: '学習完了',
        description: '学習セッションを完了',
        action: 'complete_learning',
        points: 30,
        category: 'learning',
        conditions: [
          {
            type: 'time_based',
            field: 'duration',
            operator: '>=',
            value: 30,
            description: '30分以上の学習',
          },
        ],
        cooldown: 0,
        maxDailyEarnings: 300,
        multiplierEligible: true,
        enabled: true,
      },
    ];

    defaultRules.forEach((rule) => {
      this.pointRules.set(rule.id, rule);
    });

    console.log('🏆 ポイントルールを初期化しました', this.pointRules.size, 'ルール');
  }

  /**
   * 🎁 報酬カタログ初期化
   */
  private initializeRewards(): void {
    const defaultRewards: Reward[] = [
      {
        id: 'dark_theme',
        name: 'ダークテーマ',
        description: '目に優しいダークテーマを解除',
        category: 'themes',
        cost: 100,
        type: 'digital',
        availability: {
          stock: -1,
          unlimited: true,
        },
        requirements: {
          minLevel: 2,
        },
        metadata: {
          image: '/themes/dark.png',
          tags: ['テーマ', '人気'],
          popularity: 85,
          redemptionCount: 245,
        },
        enabled: true,
      },
      {
        id: 'advanced_analytics',
        name: '高度アナリティクス',
        description: '詳細な分析レポートとインサイト',
        category: 'features',
        cost: 250,
        type: 'digital',
        availability: {
          stock: -1,
          unlimited: true,
        },
        requirements: {
          minLevel: 5,
          achievements: ['productivity-master'],
        },
        metadata: {
          image: '/features/analytics.png',
          tags: ['機能', 'プレミアム'],
          popularity: 72,
          redemptionCount: 89,
        },
        enabled: true,
      },
      {
        id: 'custom_avatar',
        name: 'カスタムアバター',
        description: 'プロフィールのアバターをカスタマイズ',
        category: 'cosmetic',
        cost: 150,
        type: 'digital',
        availability: {
          stock: -1,
          unlimited: true,
        },
        requirements: {
          minLevel: 3,
        },
        metadata: {
          image: '/avatars/custom.png',
          tags: ['カスタマイズ', '個性'],
          popularity: 68,
          redemptionCount: 156,
        },
        enabled: true,
      },
      {
        id: 'priority_support',
        name: '優先サポート',
        description: '24時間以内の優先カスタマーサポート',
        category: 'functional',
        cost: 500,
        type: 'experience',
        availability: {
          stock: 50,
          unlimited: false,
        },
        requirements: {
          minLevel: 10,
        },
        metadata: {
          image: '/services/support.png',
          tags: ['サポート', '限定'],
          popularity: 45,
          redemptionCount: 23,
        },
        enabled: true,
      },
      {
        id: 'exclusive_badge',
        name: '限定バッジ',
        description: '月間トップユーザー限定バッジ',
        category: 'exclusive',
        cost: 1000,
        type: 'digital',
        availability: {
          stock: 10,
          unlimited: false,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        requirements: {
          minLevel: 15,
          achievements: ['top-performer'],
        },
        metadata: {
          image: '/badges/exclusive.png',
          tags: ['限定', 'プレスティージ'],
          popularity: 95,
          redemptionCount: 3,
        },
        enabled: true,
      },
      {
        id: 'productivity_boost',
        name: '生産性ブースト',
        description: '24時間ポイント2倍獲得',
        category: 'functional',
        cost: 200,
        type: 'upgrade',
        availability: {
          stock: -1,
          unlimited: true,
        },
        requirements: {
          minLevel: 5,
        },
        metadata: {
          image: '/boosts/productivity.png',
          tags: ['ブースト', '期間限定'],
          popularity: 88,
          redemptionCount: 134,
        },
        enabled: true,
      },
    ];

    defaultRewards.forEach((reward) => {
      this.rewards.set(reward.id, reward);
    });

    console.log('🎁 報酬カタログを初期化しました', this.rewards.size, '報酬');
  }

  /**
   * ⚡ マルチプライヤー初期化
   */
  private initializeMultipliers(): void {
    const defaultMultipliers: PointMultiplier[] = [
      {
        id: 'weekend_boost',
        name: '週末ブースト',
        factor: 1.5,
        conditions: [
          {
            type: 'time_range',
            value: { days: [0, 6] }, // 日曜日と土曜日
            description: '週末期間',
          },
        ],
        duration: 2880, // 48時間
        stackable: false,
        priority: 1,
        enabled: true,
      },
      {
        id: 'streak_multiplier',
        name: 'ストリークマルチプライヤー',
        factor: 2.0,
        conditions: [
          {
            type: 'streak',
            value: 30,
            description: '30日連続ストリーク',
          },
        ],
        duration: 1440, // 24時間
        stackable: true,
        priority: 2,
        enabled: true,
      },
      {
        id: 'achievement_boost',
        name: '実績ブースト',
        factor: 1.25,
        conditions: [
          {
            type: 'achievement',
            value: ['productivity-master', 'efficiency-expert'],
            description: '特定の実績を持つ',
          },
        ],
        duration: 720, // 12時間
        stackable: true,
        priority: 3,
        enabled: true,
      },
      {
        id: 'special_event',
        name: 'スペシャルイベント',
        factor: 3.0,
        conditions: [
          {
            type: 'special_event',
            value: 'launch_celebration',
            description: 'ローンチ記念イベント',
          },
        ],
        duration: 10080, // 7日間
        stackable: false,
        priority: 10,
        enabled: false, // イベント時のみ有効化
      },
    ];

    defaultMultipliers.forEach((multiplier) => {
      this.multipliers.set(multiplier.id, multiplier);
    });

    console.log('⚡ マルチプライヤーを初期化しました', this.multipliers.size, 'マルチプライヤー');
  }

  /**
   * 🎯 デイリーチャレンジ初期化
   */
  private initializeDailyChallenges(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const challenges: DailyChallenge[] = [
      {
        id: `daily_${today.toISOString().split('T')[0]}_1`,
        title: 'タスクマスター',
        description: '今日中に5つのタスクを完了しよう',
        requirements: [
          {
            type: 'todo_completion',
            target: 5,
            current: 0,
            description: 'タスク完了数',
          },
        ],
        reward: 100,
        bonusReward: 50,
        difficulty: 'easy',
        category: 'productivity',
        expiresAt: tomorrow.toISOString(),
        completedBy: [],
        featured: true,
      },
      {
        id: `daily_${today.toISOString().split('T')[0]}_2`,
        title: 'ポモドーロチャンピオン',
        description: 'ポモドーロタイマーを4回完了しよう',
        requirements: [
          {
            type: 'pomodoro_completion',
            target: 4,
            current: 0,
            description: 'ポモドーロ完了回数',
          },
        ],
        reward: 150,
        bonusReward: 75,
        difficulty: 'medium',
        category: 'productivity',
        expiresAt: tomorrow.toISOString(),
        completedBy: [],
        featured: false,
      },
      {
        id: `daily_${today.toISOString().split('T')[0]}_3`,
        title: '早起き鳥',
        description: '朝6時前にアプリを開こう',
        requirements: [
          {
            type: 'early_access',
            target: 1,
            current: 0,
            description: '早朝アクセス',
          },
        ],
        reward: 80,
        difficulty: 'medium',
        category: 'health',
        expiresAt: tomorrow.toISOString(),
        completedBy: [],
        featured: false,
      },
    ];

    challenges.forEach((challenge) => {
      this.dailyChallenges.set(challenge.id, challenge);
    });

    console.log('🎯 デイリーチャレンジを初期化しました', this.dailyChallenges.size, 'チャレンジ');
  }

  /**
   * 🌅 デイリーリセット開始
   */
  private startDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // 最初のリセットをスケジュール
    setTimeout(() => {
      this.performDailyReset();

      // その後は24時間ごとにリセット
      setInterval(
        () => {
          this.performDailyReset();
        },
        24 * 60 * 60 * 1000
      );
    }, msUntilMidnight);

    console.log('🌅 デイリーリセットをスケジュールしました');
  }

  /**
   * 🔄 デイリーリセット実行
   */
  private performDailyReset(): void {
    // 新しいデイリーチャレンジを生成
    this.initializeDailyChallenges();

    // 期限切れのマルチプライヤーを削除
    const now = new Date();
    this.activeMultipliers.forEach((multipliers, userId) => {
      this.activeMultipliers.set(
        userId,
        multipliers.filter((m) => m.expiresAt > now)
      );
    });

    console.log('🔄 デイリーリセット完了');

    toast({
      title: '新しい1日の始まり！',
      description: '新しいデイリーチャレンジが利用可能です',
      variant: 'default',
    });
  }

  /**
   * 💰 ポイント獲得
   */
  async earnPoints(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<PointTransaction | null> {
    const rule = Array.from(this.pointRules.values()).find((r) => r.action === action && r.enabled);
    if (!rule) {
      console.warn(`No point rule found for action: ${action}`);
      return null;
    }

    // 条件チェック
    if (!this.checkConditions(rule.conditions, metadata || {})) {
      return null;
    }

    // ユーザーポイント取得または作成
    let userPoints = this.userPoints.get(userId);
    if (!userPoints) {
      userPoints = this.createUserPoints(userId);
      this.userPoints.set(userId, userPoints);
    }

    // クールダウンチェック
    if (rule.cooldown && rule.cooldown > 0) {
      const lastTransaction = this.transactions
        .filter((t) => t.userId === userId && t.source === rule.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (lastTransaction) {
        const timeSinceLastTransaction = Date.now() - new Date(lastTransaction.timestamp).getTime();
        if (timeSinceLastTransaction < rule.cooldown * 60 * 1000) {
          return null;
        }
      }
    }

    // 日次上限チェック
    if (rule.maxDailyEarnings) {
      const today = new Date().toISOString().split('T')[0];
      const todayEarnings = this.transactions
        .filter(
          (t) =>
            t.userId === userId &&
            t.source === rule.id &&
            t.timestamp.startsWith(today) &&
            t.type === 'earn'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      if (todayEarnings >= rule.maxDailyEarnings) {
        return null;
      }
    }

    // マルチプライヤー計算
    let finalPoints = rule.points;
    let appliedMultiplier = 1;

    if (rule.multiplierEligible) {
      appliedMultiplier = this.calculateMultiplier(userId);
      finalPoints = Math.round(rule.points * appliedMultiplier);
    }

    // トランザクション作成
    const transaction: PointTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: finalPoints,
      type: 'earn',
      source: rule.id,
      description: rule.description,
      category: rule.category,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        ruleId: rule.id,
        basePoints: rule.points,
        multiplier: appliedMultiplier,
      },
      multiplier: appliedMultiplier,
    };

    // ポイント更新
    userPoints.totalPoints += finalPoints;
    userPoints.availablePoints += finalPoints;
    userPoints.earnedPoints += finalPoints;
    userPoints.lastActivity = transaction.timestamp;

    // レベル計算
    const newLevel = this.calculateLevel(userPoints.totalPoints);
    if (newLevel > userPoints.level) {
      userPoints.level = newLevel;

      toast({
        title: 'レベルアップ！',
        description: `レベル ${newLevel} に到達しました！`,
        variant: 'default',
      });
    }

    // ランク更新
    userPoints.rank = this.calculateRank(userPoints);

    // トランザクション記録
    this.transactions.push(transaction);

    // デイリーチャレンジ進捗更新
    this.updateDailyChallengeProgress(userId, action, metadata);

    console.log(`💰 ${userId} が ${finalPoints} ポイント獲得: ${rule.description}`);

    toast({
      title: 'ポイント獲得！',
      description: `${finalPoints} ポイント獲得しました${appliedMultiplier > 1 ? ` (${appliedMultiplier}x)` : ''}`,
      variant: 'default',
    });

    return transaction;
  }

  /**
   * 🛒 ポイント消費（報酬購入）
   */
  async spendPoints(userId: string, rewardId: string): Promise<PointTransaction | null> {
    const reward = this.rewards.get(rewardId);
    if (!reward || !reward.enabled) {
      throw new Error('Reward not found or disabled');
    }

    const userPoints = this.userPoints.get(userId);
    if (!userPoints) {
      throw new Error('User not found');
    }

    // ポイント残高チェック
    if (userPoints.availablePoints < reward.cost) {
      throw new Error('Insufficient points');
    }

    // 要件チェック
    if (reward.requirements) {
      if (reward.requirements.minLevel && userPoints.level < reward.requirements.minLevel) {
        throw new Error('Level requirement not met');
      }

      if (reward.requirements.achievements) {
        const hasRequiredAchievements = reward.requirements.achievements.every((achievement) =>
          userPoints.achievements.includes(achievement)
        );
        if (!hasRequiredAchievements) {
          throw new Error('Achievement requirements not met');
        }
      }
    }

    // 在庫チェック
    if (!reward.availability.unlimited && reward.availability.stock <= 0) {
      throw new Error('Reward out of stock');
    }

    // 期間チェック
    const now = new Date();
    if (reward.availability.startDate && now < new Date(reward.availability.startDate)) {
      throw new Error('Reward not yet available');
    }
    if (reward.availability.endDate && now > new Date(reward.availability.endDate)) {
      throw new Error('Reward expired');
    }

    // トランザクション作成
    const transaction: PointTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: -reward.cost,
      type: 'spend',
      source: rewardId,
      description: `購入: ${reward.name}`,
      category: 'productivity', // 支出は生産性カテゴリ
      timestamp: new Date().toISOString(),
      metadata: {
        rewardId,
        rewardName: reward.name,
        rewardType: reward.type,
      },
    };

    // ポイント更新
    userPoints.availablePoints -= reward.cost;
    userPoints.spentPoints += reward.cost;
    userPoints.lastActivity = transaction.timestamp;

    // 在庫更新
    if (!reward.availability.unlimited) {
      reward.availability.stock--;
    }

    // 人気度更新
    reward.metadata.redemptionCount++;
    reward.metadata.popularity = Math.min(100, reward.metadata.popularity + 1);

    // トランザクション記録
    this.transactions.push(transaction);

    console.log(`🛒 ${userId} が ${reward.name} を購入: ${reward.cost} ポイント`);

    toast({
      title: '報酬獲得！',
      description: `${reward.name}を獲得しました！`,
      variant: 'default',
    });

    return transaction;
  }

  /**
   * 🔢 マルチプライヤー計算
   */
  private calculateMultiplier(userId: string): number {
    const userMultipliers = this.activeMultipliers.get(userId) || [];
    const now = new Date();

    // 期限切れマルチプライヤーを削除
    const validMultipliers = userMultipliers.filter((m) => m.expiresAt > now);
    this.activeMultipliers.set(userId, validMultipliers);

    // 基本マルチプライヤー
    let totalMultiplier = 1;

    // アクティブマルチプライヤーを適用
    validMultipliers.forEach((userMultiplier) => {
      const multiplier = this.multipliers.get(userMultiplier.multiplierId);
      if (multiplier && multiplier.enabled) {
        if (multiplier.stackable) {
          totalMultiplier *= multiplier.factor;
        } else {
          totalMultiplier = Math.max(totalMultiplier, multiplier.factor);
        }
      }
    });

    // 自動適用条件をチェック
    Array.from(this.multipliers.values()).forEach((multiplier) => {
      if (multiplier.enabled && !validMultipliers.some((um) => um.multiplierId === multiplier.id)) {
        if (this.checkMultiplierConditions(multiplier.conditions, userId)) {
          this.activateMultiplier(userId, multiplier.id);
          if (multiplier.stackable) {
            totalMultiplier *= multiplier.factor;
          } else {
            totalMultiplier = Math.max(totalMultiplier, multiplier.factor);
          }
        }
      }
    });

    return Math.round(totalMultiplier * 100) / 100; // 小数点以下2桁で丸める
  }

  /**
   * ⚡ マルチプライヤー有効化
   */
  activateMultiplier(userId: string, multiplierId: string): void {
    const multiplier = this.multipliers.get(multiplierId);
    if (!multiplier || !multiplier.enabled) {
      return;
    }

    const expiresAt = new Date(Date.now() + multiplier.duration * 60 * 1000);
    const userMultipliers = this.activeMultipliers.get(userId) || [];

    userMultipliers.push({
      multiplierId,
      expiresAt,
    });

    this.activeMultipliers.set(userId, userMultipliers);

    toast({
      title: 'ブースト有効化！',
      description: `${multiplier.name} (${multiplier.factor}x) が有効になりました`,
      variant: 'default',
    });
  }

  /**
   * 📊 条件チェック
   */
  private checkConditions(conditions: PointCondition[], metadata: Record<string, any>): boolean {
    return conditions.every((condition) => {
      const value = metadata[condition.field];

      switch (condition.operator) {
        case '=':
          return value === condition.value;
        case '>':
          return Number(value) > Number(condition.value);
        case '<':
          return Number(value) < Number(condition.value);
        case '>=':
          return Number(value) >= Number(condition.value);
        case '<=':
          return Number(value) <= Number(condition.value);
        case 'contains':
          return Array.isArray(value)
            ? value.includes(condition.value)
            : String(value).includes(String(condition.value));
        default:
          return false;
      }
    });
  }

  /**
   * 🎯 マルチプライヤー条件チェック
   */
  private checkMultiplierConditions(conditions: MultiplierCondition[], userId: string): boolean {
    const userPoints = this.userPoints.get(userId);
    const now = new Date();

    return conditions.every((condition) => {
      switch (condition.type) {
        case 'time_range':
          const days = condition.value.days;
          return days.includes(now.getDay());
        case 'streak':
          return userPoints && userPoints.streakCount >= condition.value;
        case 'achievement':
          return (
            userPoints &&
            condition.value.some((achievement: string) =>
              userPoints.achievements.includes(achievement)
            )
          );
        case 'special_event':
          // イベント条件は別途管理
          return false;
        default:
          return false;
      }
    });
  }

  /**
   * 🆕 ユーザーポイント作成
   */
  private createUserPoints(userId: string): UserPoints {
    return {
      userId,
      totalPoints: 0,
      availablePoints: 0,
      spentPoints: 0,
      earnedPoints: 0,
      level: 1,
      rank: 'Beginner',
      streakCount: 0,
      multiplier: 1,
      achievements: [],
      lastActivity: new Date().toISOString(),
    };
  }

  /**
   * 📈 レベル計算
   */
  private calculateLevel(totalPoints: number): number {
    // レベル計算式: level = floor(sqrt(totalPoints / 100)) + 1
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  /**
   * 🏆 ランク計算
   */
  private calculateRank(userPoints: UserPoints): string {
    if (userPoints.level >= 50) return 'Grandmaster';
    if (userPoints.level >= 40) return 'Master';
    if (userPoints.level >= 30) return 'Expert';
    if (userPoints.level >= 20) return 'Advanced';
    if (userPoints.level >= 10) return 'Intermediate';
    if (userPoints.level >= 5) return 'Novice';
    return 'Beginner';
  }

  /**
   * 🎯 デイリーチャレンジ進捗更新
   */
  private updateDailyChallengeProgress(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    Array.from(this.dailyChallenges.values()).forEach((challenge) => {
      if (challenge.completedBy.includes(userId)) {
        return; // 既に完了済み
      }

      let updated = false;
      challenge.requirements.forEach((req) => {
        if (this.matchesChallengeRequirement(req, action, metadata)) {
          req.current = Math.min(req.current + 1, req.target);
          updated = true;
        }
      });

      if (updated) {
        // チャレンジ完了チェック
        const isCompleted = challenge.requirements.every((req) => req.current >= req.target);
        if (isCompleted) {
          challenge.completedBy.push(userId);

          // チャレンジ報酬付与
          this.earnPoints(userId, 'challenge_complete', {
            challengeId: challenge.id,
            challengeName: challenge.title,
            points: challenge.reward,
          });

          toast({
            title: 'チャレンジ完了！',
            description: `${challenge.title}を達成しました！`,
            variant: 'default',
          });
        }
      }
    });
  }

  /**
   * 🎯 チャレンジ要求マッチング
   */
  private matchesChallengeRequirement(
    requirement: ChallengeRequirement,
    action: string,
    metadata?: Record<string, any>
  ): boolean {
    switch (requirement.type) {
      case 'todo_completion':
        return action === 'complete_todo';
      case 'pomodoro_completion':
        return action === 'complete_pomodoro';
      case 'early_access':
        return action === 'early_activity';
      default:
        return false;
    }
  }

  // ゲッター
  getUserPoints(userId: string): UserPoints | undefined {
    return this.userPoints.get(userId);
  }

  getUserTransactions(userId: string, limit: number = 50): PointTransaction[] {
    return this.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getAllRewards(): Reward[] {
    return Array.from(this.rewards.values()).filter((r) => r.enabled);
  }

  getAvailableRewards(userId: string): Reward[] {
    const userPoints = this.userPoints.get(userId);
    if (!userPoints) return [];

    return this.getAllRewards().filter((reward) => {
      // 在庫チェック
      if (!reward.availability.unlimited && reward.availability.stock <= 0) {
        return false;
      }

      // 期間チェック
      const now = new Date();
      if (reward.availability.startDate && now < new Date(reward.availability.startDate)) {
        return false;
      }
      if (reward.availability.endDate && now > new Date(reward.availability.endDate)) {
        return false;
      }

      // 要件チェック
      if (reward.requirements) {
        if (reward.requirements.minLevel && userPoints.level < reward.requirements.minLevel) {
          return false;
        }

        if (reward.requirements.achievements) {
          const hasRequiredAchievements = reward.requirements.achievements.every((achievement) =>
            userPoints.achievements.includes(achievement)
          );
          if (!hasRequiredAchievements) {
            return false;
          }
        }
      }

      return true;
    });
  }

  getDailyChallenges(): DailyChallenge[] {
    return Array.from(this.dailyChallenges.values());
  }

  getActiveMultipliers(userId: string): PointMultiplier[] {
    const userMultipliers = this.activeMultipliers.get(userId) || [];
    const now = new Date();

    return userMultipliers
      .filter((um) => um.expiresAt > now)
      .map((um) => this.multipliers.get(um.multiplierId))
      .filter((m) => m && m.enabled) as PointMultiplier[];
  }

  getStatistics(): PointStatistics {
    const allUsers = Array.from(this.userPoints.values());
    const totalPointsEarned = allUsers.reduce((sum, user) => sum + user.earnedPoints, 0);
    const totalPointsSpent = allUsers.reduce((sum, user) => sum + user.spentPoints, 0);

    return {
      totalUsers: allUsers.length,
      totalPointsEarned,
      totalPointsSpent,
      averagePointsPerUser: allUsers.length > 0 ? totalPointsEarned / allUsers.length : 0,
      mostActiveUsers: allUsers.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10),
      popularRewards: Array.from(this.rewards.values())
        .sort((a, b) => b.metadata.redemptionCount - a.metadata.redemptionCount)
        .slice(0, 10),
      dailyStats: [], // 実装時は過去30日のデータ
    };
  }
}

export const pointRewardService = PointRewardService.getInstance();
