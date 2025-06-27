import { toast } from '@/components/ui/use-toast';

export interface BadgeEstimate {
  badgeId: string;
  badgeName: string;
  category: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  currentProgress: number; // 0-100%
  estimatedHours: number; // 総推定時間
  remainingHours: number; // 残り時間
  estimatedCompletionDate: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[]; // 前提バッジ
  isUnlocked: boolean;
  isCompleted: boolean;
  confidenceLevel: number; // 0-100% 予測の信頼度
}

export interface WorkSchedule {
  weeklyHours: number; // 週間作業時間
  dailyHours: number; // 日間作業時間
  workDays: number[]; // 作業曜日 (0=日曜日)
  breakDays: string[]; // 休日
  intensiveMode: boolean; // 集中モード
}

export interface CompletionTimeline {
  totalBadges: number;
  completedBadges: number;
  remainingBadges: number;
  totalEstimatedHours: number;
  totalRemainingHours: number;
  overallCompletionDate: string;
  currentVelocity: number; // バッジ/週
  milestones: TimelineMilestone[];
  weeklyPlan: WeeklyPlan[];
}

export interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  badgesCompleted: string[];
  cumulativeProgress: number;
  category: string;
}

export interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  plannedHours: number;
  targetBadges: string[];
  estimatedCompletions: number;
  categoryFocus: string;
}

/**
 * 🎯 バッジ完了予測サービス - 作業時間・達成予定日の算出
 */
class BadgeCompletionEstimator {
  private static instance: BadgeCompletionEstimator | null = null;
  private badgeEstimates: Map<string, BadgeEstimate> = new Map();
  private workSchedule: WorkSchedule;
  private velocityHistory: number[] = []; // 過去の完了速度

  private constructor() {
    this.workSchedule = this.initializeWorkSchedule();
    this.initializeBadgeEstimates();
    this.calculateVelocityHistory();
    console.log('🎯 Badge Completion Estimator initialized');
  }

  public static getInstance(): BadgeCompletionEstimator {
    if (!BadgeCompletionEstimator.instance) {
      BadgeCompletionEstimator.instance = new BadgeCompletionEstimator();
    }
    return BadgeCompletionEstimator.instance;
  }

  /**
   * 📋 作業スケジュール初期化
   */
  private initializeWorkSchedule(): WorkSchedule {
    return {
      weeklyHours: 20, // 週20時間 (平日4時間/日)
      dailyHours: 4, // 日4時間
      workDays: [1, 2, 3, 4, 5], // 月-金
      breakDays: [], // 祝日等
      intensiveMode: false,
    };
  }

  /**
   * ⏱️ バッジ見積もり初期化
   */
  private initializeBadgeEstimates(): void {
    const badgeTimeEstimates: BadgeEstimate[] = [
      // 完了済みバッジ
      {
        badgeId: 'polyglot-developer',
        badgeName: '🗣️ ポリグロット開発者',
        category: 'linguistics',
        difficulty: 'platinum',
        currentProgress: 100,
        estimatedHours: 40,
        remainingHours: 0,
        estimatedCompletionDate: new Date().toISOString(),
        priority: 'high',
        dependencies: ['diversity-inclusion-advocate'],
        isUnlocked: true,
        isCompleted: true,
        confidenceLevel: 100,
      },
      {
        badgeId: 'environmental-champion',
        badgeName: '🌱 環境チャンピオン',
        category: 'social_contribution',
        difficulty: 'gold',
        currentProgress: 100,
        estimatedHours: 25,
        remainingHours: 0,
        estimatedCompletionDate: new Date().toISOString(),
        priority: 'high',
        dependencies: [],
        isUnlocked: true,
        isCompleted: true,
        confidenceLevel: 100,
      },

      // 進行中バッジ
      {
        badgeId: 'product-visionary',
        badgeName: '🔮 プロダクトビジョナリー',
        category: 'planning',
        difficulty: 'gold',
        currentProgress: 80,
        estimatedHours: 30,
        remainingHours: 6, // 20%残り
        estimatedCompletionDate: this.calculateCompletionDate(6),
        priority: 'high',
        dependencies: ['startup-founder'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 90,
      },
      {
        badgeId: 'accessibility-champion',
        badgeName: '♿ アクセシビリティチャンピオン',
        category: 'accessibility',
        difficulty: 'platinum',
        currentProgress: 85,
        estimatedHours: 45,
        remainingHours: 7, // 15%残り
        estimatedCompletionDate: this.calculateCompletionDate(7),
        priority: 'high',
        dependencies: ['diversity-inclusion-advocate'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 95,
      },
      {
        badgeId: 'digital-artist',
        badgeName: '🎨 デジタルアーティスト',
        category: 'art',
        difficulty: 'gold',
        currentProgress: 75,
        estimatedHours: 35,
        remainingHours: 9, // 25%残り
        estimatedCompletionDate: this.calculateCompletionDate(9),
        priority: 'medium',
        dependencies: ['ui-ux-master'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 85,
      },
      {
        badgeId: 'operational-excellence',
        badgeName: '⚙️ オペレーショナルエクセレンス',
        category: 'management',
        difficulty: 'platinum',
        currentProgress: 70,
        estimatedHours: 50,
        remainingHours: 15, // 30%残り
        estimatedCompletionDate: this.calculateCompletionDate(15),
        priority: 'high',
        dependencies: ['devops-culture-evangelist'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 80,
      },
      {
        badgeId: 'revenue-architect',
        badgeName: '💰 収益アーキテクト',
        category: 'monetization',
        difficulty: 'gold',
        currentProgress: 60,
        estimatedHours: 40,
        remainingHours: 16, // 40%残り
        estimatedCompletionDate: this.calculateCompletionDate(16),
        priority: 'medium',
        dependencies: ['product-market-fit-achiever'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 75,
      },

      // 未開始・計画中バッジ
      {
        badgeId: 'mobile-cross-platform-expert',
        badgeName: '📱 モバイルクロスプラットフォームエキスパート',
        category: 'mobile',
        difficulty: 'platinum',
        currentProgress: 30,
        estimatedHours: 60,
        remainingHours: 42, // 70%残り
        estimatedCompletionDate: this.calculateCompletionDate(42),
        priority: 'medium',
        dependencies: ['feature-complete-master'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 70,
      },
      {
        badgeId: 'ml-engineer',
        badgeName: '🤖 機械学習エンジニア',
        category: 'machine_learning',
        difficulty: 'legendary',
        currentProgress: 25,
        estimatedHours: 120,
        remainingHours: 90, // 75%残り
        estimatedCompletionDate: this.calculateCompletionDate(90),
        priority: 'low',
        dependencies: ['data-scientist'],
        isUnlocked: false,
        isCompleted: false,
        confidenceLevel: 60,
      },
      {
        badgeId: 'blockchain-developer',
        badgeName: '⛓️ ブロックチェーン開発者',
        category: 'blockchain',
        difficulty: 'legendary',
        currentProgress: 15,
        estimatedHours: 100,
        remainingHours: 85, // 85%残り
        estimatedCompletionDate: this.calculateCompletionDate(85),
        priority: 'low',
        dependencies: ['security-fortress-builder'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 50,
      },
      {
        badgeId: 'cloud-solutions-architect',
        badgeName: '☁️ クラウドソリューションアーキテクト',
        category: 'cloud',
        difficulty: 'platinum',
        currentProgress: 20,
        estimatedHours: 80,
        remainingHours: 64, // 80%残り
        estimatedCompletionDate: this.calculateCompletionDate(64),
        priority: 'medium',
        dependencies: ['infrastructure-automation-expert'],
        isUnlocked: false,
        isCompleted: false,
        confidenceLevel: 65,
      },
      {
        badgeId: 'cybersecurity-specialist',
        badgeName: '🔐 サイバーセキュリティスペシャリスト',
        category: 'cybersecurity',
        difficulty: 'legendary',
        currentProgress: 30,
        estimatedHours: 110,
        remainingHours: 77, // 70%残り
        estimatedCompletionDate: this.calculateCompletionDate(77),
        priority: 'high',
        dependencies: ['security-fortress-builder'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 75,
      },
      {
        badgeId: 'innovation-facilitator',
        badgeName: '💡 イノベーションファシリテーター',
        category: 'innovation',
        difficulty: 'legendary',
        currentProgress: 40,
        estimatedHours: 90,
        remainingHours: 54, // 60%残り
        estimatedCompletionDate: this.calculateCompletionDate(54),
        priority: 'medium',
        dependencies: ['innovation-catalyst'],
        isUnlocked: false,
        isCompleted: false,
        confidenceLevel: 70,
      },
      {
        badgeId: 'transformational-leader',
        badgeName: '👑 変革リーダー',
        category: 'leadership',
        difficulty: 'legendary',
        currentProgress: 50,
        estimatedHours: 85,
        remainingHours: 43, // 50%残り
        estimatedCompletionDate: this.calculateCompletionDate(43),
        priority: 'high',
        dependencies: ['strategic-leader'],
        isUnlocked: true,
        isCompleted: false,
        confidenceLevel: 80,
      },
      {
        badgeId: 'quantum-computing-pioneer',
        badgeName: '🔮 量子コンピューティングパイオニア',
        category: 'quantum_computing',
        difficulty: 'legendary',
        currentProgress: 5,
        estimatedHours: 200,
        remainingHours: 190, // 95%残り
        estimatedCompletionDate: this.calculateCompletionDate(190),
        priority: 'low',
        dependencies: ['ml-engineer'],
        isUnlocked: false,
        isCompleted: false,
        confidenceLevel: 30,
      },
    ];

    badgeTimeEstimates.forEach((estimate) => {
      this.badgeEstimates.set(estimate.badgeId, estimate);
    });

    console.log('⏱️ Badge estimates initialized:', badgeTimeEstimates.length);
  }

  /**
   * 📅 完了予定日計算
   */
  private calculateCompletionDate(remainingHours: number): string {
    const now = new Date();
    const workingDaysPerWeek = this.workSchedule.workDays.length;
    const hoursPerWeek = this.workSchedule.weeklyHours;

    // 週数計算
    const weeksNeeded = Math.ceil(remainingHours / hoursPerWeek);

    // 完了予定日計算（営業日のみ）
    const completionDate = new Date(now);
    completionDate.setDate(completionDate.getDate() + weeksNeeded * 7);

    return completionDate.toISOString();
  }

  /**
   * 📈 完了速度履歴計算
   */
  private calculateVelocityHistory(): void {
    // 過去4週間のバッジ完了データをシミュレーション
    this.velocityHistory = [
      2.5, // 4週間前: 2.5バッジ/週
      3.0, // 3週間前: 3.0バッジ/週
      2.8, // 2週間前: 2.8バッジ/週
      3.2, // 1週間前: 3.2バッジ/週
    ];
  }

  /**
   * 🎯 完了タイムライン取得
   */
  public getCompletionTimeline(): CompletionTimeline {
    const estimates = Array.from(this.badgeEstimates.values());

    const totalBadges = estimates.length;
    const completedBadges = estimates.filter((e) => e.isCompleted).length;
    const remainingBadges = totalBadges - completedBadges;

    const totalEstimatedHours = estimates.reduce((sum, e) => sum + e.estimatedHours, 0);
    const totalRemainingHours = estimates.reduce((sum, e) => sum + e.remainingHours, 0);

    // 現在の速度（直近4週平均）
    const currentVelocity =
      this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;

    // 全体完了予定日
    const weeksToComplete = Math.ceil(totalRemainingHours / this.workSchedule.weeklyHours);
    const overallCompletionDate = new Date();
    overallCompletionDate.setDate(overallCompletionDate.getDate() + weeksToComplete * 7);

    // マイルストーン生成
    const milestones = this.generateMilestones(estimates);

    // 週次計画生成
    const weeklyPlan = this.generateWeeklyPlan(estimates);

    return {
      totalBadges,
      completedBadges,
      remainingBadges,
      totalEstimatedHours,
      totalRemainingHours,
      overallCompletionDate: overallCompletionDate.toISOString(),
      currentVelocity,
      milestones,
      weeklyPlan,
    };
  }

  /**
   * 🎖️ マイルストーン生成
   */
  private generateMilestones(estimates: BadgeEstimate[]): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [];
    const inProgressBadges = estimates
      .filter((e) => !e.isCompleted && e.isUnlocked)
      .sort((a, b) => a.remainingHours - b.remainingHours);

    let cumulativeHours = 0;
    let cumulativeProgress = 0;
    const totalRemainingHours = estimates.reduce((sum, e) => sum + e.remainingHours, 0);

    // 短期マイルストーン（1-2週間以内）
    const shortTermBadges = inProgressBadges.filter((b) => b.remainingHours <= 10);
    if (shortTermBadges.length > 0) {
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + 7);

      cumulativeHours += shortTermBadges.reduce((sum, b) => sum + b.remainingHours, 0);
      cumulativeProgress = (cumulativeHours / totalRemainingHours) * 100;

      milestones.push({
        date: completionDate.toISOString(),
        title: '🎯 短期目標達成',
        description: `${shortTermBadges.length}個のバッジ完成`,
        badgesCompleted: shortTermBadges.map((b) => b.badgeName),
        cumulativeProgress,
        category: 'short_term',
      });
    }

    // 中期マイルストーン（1ヶ月以内）
    const mediumTermBadges = inProgressBadges.filter(
      (b) => b.remainingHours > 10 && b.remainingHours <= 40
    );
    if (mediumTermBadges.length > 0) {
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + 30);

      cumulativeHours += mediumTermBadges.reduce((sum, b) => sum + b.remainingHours, 0);
      cumulativeProgress = (cumulativeHours / totalRemainingHours) * 100;

      milestones.push({
        date: completionDate.toISOString(),
        title: '🚀 中期目標達成',
        description: `${mediumTermBadges.length}個の高難度バッジ完成`,
        badgesCompleted: mediumTermBadges.map((b) => b.badgeName),
        cumulativeProgress,
        category: 'medium_term',
      });
    }

    // 長期マイルストーン（3ヶ月以内）
    const longTermBadges = inProgressBadges.filter((b) => b.remainingHours > 40);
    if (longTermBadges.length > 0) {
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + 90);

      cumulativeHours += longTermBadges.reduce((sum, b) => sum + b.remainingHours, 0);
      cumulativeProgress = 100; // 全て完了

      milestones.push({
        date: completionDate.toISOString(),
        title: '🏆 究極目標達成',
        description: `${longTermBadges.length}個のレジェンダリーバッジ完成`,
        badgesCompleted: longTermBadges.map((b) => b.badgeName),
        cumulativeProgress,
        category: 'long_term',
      });
    }

    return milestones;
  }

  /**
   * 📅 週次計画生成
   */
  private generateWeeklyPlan(estimates: BadgeEstimate[]): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = [];
    const inProgressBadges = estimates
      .filter((e) => !e.isCompleted && e.isUnlocked)
      .sort((a, b) => {
        // 優先度とディフィカルティでソート
        const priorityScore = { high: 3, medium: 2, low: 1 };
        const difficultyScore = { bronze: 1, silver: 2, gold: 3, platinum: 4, legendary: 5 };

        const aScore = priorityScore[a.priority] + difficultyScore[a.difficulty];
        const bScore = priorityScore[b.priority] + difficultyScore[b.difficulty];

        return bScore - aScore;
      });

    const weeksToGenerate = 12; // 3ヶ月分
    let currentDate = new Date();

    for (let week = 0; week < weeksToGenerate; week++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // その週に対象となるバッジを選定
      const weeklyHours = this.workSchedule.weeklyHours;
      let remainingHours = weeklyHours;
      const targetBadges: string[] = [];
      let estimatedCompletions = 0;

      for (const badge of inProgressBadges) {
        if (remainingHours <= 0) break;

        if (badge.remainingHours <= remainingHours) {
          targetBadges.push(badge.badgeId);
          remainingHours -= badge.remainingHours;
          estimatedCompletions++;
          badge.remainingHours = 0; // マーク済み
        } else if (targetBadges.length === 0) {
          targetBadges.push(badge.badgeId);
          badge.remainingHours -= remainingHours;
          remainingHours = 0;
        }
      }

      // カテゴリフォーカス決定
      const categories = targetBadges.map(
        (id) => estimates.find((e) => e.badgeId === id)?.category || 'general'
      );
      const categoryFocus = categories[0] || 'general';

      weeklyPlans.push({
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        plannedHours: this.workSchedule.weeklyHours - remainingHours,
        targetBadges,
        estimatedCompletions,
        categoryFocus,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeklyPlans;
  }

  /**
   * 🔧 作業スケジュール更新
   */
  public updateWorkSchedule(schedule: Partial<WorkSchedule>): void {
    this.workSchedule = { ...this.workSchedule, ...schedule };

    // 全ての見積もりを再計算
    for (const estimate of this.badgeEstimates.values()) {
      if (!estimate.isCompleted) {
        estimate.estimatedCompletionDate = this.calculateCompletionDate(estimate.remainingHours);
      }
    }

    console.log('🔧 Work schedule updated', this.workSchedule);

    toast({
      title: '📅 作業スケジュール更新',
      description: `週${schedule.weeklyHours || this.workSchedule.weeklyHours}時間のペースで再計算しました`,
      variant: 'default',
    });
  }

  /**
   * 📊 バッジ別見積もり取得
   */
  public getBadgeEstimate(badgeId: string): BadgeEstimate | null {
    return this.badgeEstimates.get(badgeId) || null;
  }

  /**
   * 📈 優先度順バッジリスト取得
   */
  public getPrioritizedBadges(): BadgeEstimate[] {
    return Array.from(this.badgeEstimates.values())
      .filter((e) => !e.isCompleted)
      .sort((a, b) => {
        // 優先度 -> 残り時間の短い順
        const priorityScore = { high: 3, medium: 2, low: 1 };

        if (priorityScore[a.priority] !== priorityScore[b.priority]) {
          return priorityScore[b.priority] - priorityScore[a.priority];
        }

        return a.remainingHours - b.remainingHours;
      });
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    console.log('🧹 Badge Completion Estimator cleaned up');
  }
}

export const badgeCompletionEstimator = BadgeCompletionEstimator.getInstance();
