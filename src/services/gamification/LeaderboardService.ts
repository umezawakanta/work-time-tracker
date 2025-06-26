import { toast } from '@/components/ui/use-toast';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  rank: number;
  previousRank?: number;
  change: 'up' | 'down' | 'same' | 'new';
  tier: LeaderboardTier;
  badges: string[];
  achievements: string[];
  metadata: {
    level: number;
    totalPoints: number;
    streakCount: number;
    lastActivity: string;
    joinDate: string;
  };
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: LeaderboardType;
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  config: LeaderboardConfig;
  rewards: LeaderboardReward[];
  status: 'active' | 'ended' | 'upcoming';
  startDate: string;
  endDate: string;
  lastUpdated: string;
  totalParticipants: number;
}

export interface LeaderboardConfig {
  maxEntries: number;
  minScore: number;
  updateFrequency: number; // Minutes
  allowTies: boolean;
  showProgress: boolean;
  publicVisible: boolean;
  eligibilityRules: EligibilityRule[];
  scoringFormula: ScoringFormula;
}

export interface EligibilityRule {
  type: 'level' | 'achievement' | 'activity' | 'custom';
  condition: string;
  value: any;
  description: string;
}

export interface ScoringFormula {
  type: 'points' | 'weighted' | 'custom';
  factors: ScoringFactor[];
  description: string;
}

export interface ScoringFactor {
  metric: string;
  weight: number;
  description: string;
}

export interface LeaderboardReward {
  rank?: number;
  rankRange?: { min: number; max: number };
  tier?: LeaderboardTier;
  rewards: RewardItem[];
  title?: string;
  badge?: string;
  description: string;
}

export interface RewardItem {
  type: 'points' | 'badge' | 'title' | 'item' | 'feature';
  value: any;
  duration?: number; // Days, for temporary rewards
  description: string;
}

export interface SeasonalCompetition {
  id: string;
  name: string;
  description: string;
  theme: string;
  season: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  leaderboards: string[];
  specialRewards: SpecialReward[];
  participants: string[];
  milestones: CompetitionMilestone[];
  socialFeatures: SocialFeature[];
}

export interface SpecialReward {
  id: string;
  name: string;
  description: string;
  criteria: string;
  reward: RewardItem[];
  exclusive: boolean;
  claimedBy: string[];
}

export interface CompetitionMilestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  reward: RewardItem[];
  unlockedBy: string[];
}

export interface SocialFeature {
  type: 'team_challenge' | 'collaboration' | 'friendly_competition';
  name: string;
  description: string;
  participants: string[];
  status: 'active' | 'completed' | 'cancelled';
  config: any;
}

export interface UserRankingHistory {
  userId: string;
  history: RankingSnapshot[];
  personalBests: PersonalBest[];
  achievements: RankingAchievement[];
}

export interface RankingSnapshot {
  leaderboardId: string;
  rank: number;
  score: number;
  tier: LeaderboardTier;
  timestamp: string;
  totalParticipants: number;
}

export interface PersonalBest {
  leaderboardId: string;
  category: string;
  bestRank: number;
  bestScore: number;
  achievedAt: string;
}

export interface RankingAchievement {
  id: string;
  name: string;
  description: string;
  type: 'rank_based' | 'streak_based' | 'improvement_based';
  achievedAt: string;
  leaderboardId?: string;
}

export type LeaderboardType = 'global' | 'regional' | 'friends' | 'team' | 'seasonal' | 'event';

export type LeaderboardCategory =
  | 'overall'
  | 'productivity'
  | 'learning'
  | 'health'
  | 'social'
  | 'achievements'
  | 'streaks'
  | 'special';

export type LeaderboardPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'all_time'
  | 'custom';

export type LeaderboardTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export interface LeaderboardStats {
  totalLeaderboards: number;
  activeCompetitions: number;
  totalParticipants: number;
  averageParticipation: number;
  topPerformers: LeaderboardEntry[];
  trendingLeaderboards: Leaderboard[];
  recentAchievements: RankingAchievement[];
}

/**
 * 🎮 ゲーミフィケーション設計者: リーダーボードサービス
 * 包括的ランキングシステムとソーシャル競争機能
 */
class LeaderboardService {
  private static instance: LeaderboardService | null = null;
  private leaderboards: Map<string, Leaderboard> = new Map();
  private userRankings: Map<string, UserRankingHistory> = new Map();
  private seasonalCompetitions: Map<string, SeasonalCompetition> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private socialConnections: Map<string, string[]> = new Map(); // userId -> friendIds

  private constructor() {
    this.initializeDefaultLeaderboards();
    this.initializeSeasonalCompetitions();
    this.startLeaderboardUpdates();
  }

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * 🏆 デフォルトリーダーボード初期化
   */
  private initializeDefaultLeaderboards(): void {
    const defaultLeaderboards: Leaderboard[] = [
      {
        id: 'global_overall',
        name: 'グローバルランキング',
        description: '全体の総合ポイントランキング',
        type: 'global',
        category: 'overall',
        period: 'all_time',
        entries: [],
        config: {
          maxEntries: 1000,
          minScore: 0,
          updateFrequency: 60, // 1時間
          allowTies: true,
          showProgress: true,
          publicVisible: true,
          eligibilityRules: [],
          scoringFormula: {
            type: 'points',
            factors: [
              {
                metric: 'totalPoints',
                weight: 1.0,
                description: '総ポイント',
              },
            ],
            description: '総獲得ポイント',
          },
        },
        rewards: [
          {
            rank: 1,
            rewards: [
              {
                type: 'badge',
                value: 'global_champion',
                description: 'グローバルチャンピオンバッジ',
              },
              {
                type: 'points',
                value: 1000,
                description: 'ボーナスポイント',
              },
            ],
            title: 'グローバルチャンピオン',
            description: '世界第1位の栄誉',
          },
          {
            rankRange: { min: 2, max: 10 },
            tier: 'master',
            rewards: [
              {
                type: 'badge',
                value: 'top_performer',
                description: 'トップパフォーマーバッジ',
              },
              {
                type: 'points',
                value: 500,
                description: 'ボーナスポイント',
              },
            ],
            description: 'トップ10の優秀者',
          },
        ],
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        totalParticipants: 0,
      },
      {
        id: 'weekly_productivity',
        name: '週間生産性ランキング',
        description: '今週の生産性ポイントランキング',
        type: 'global',
        category: 'productivity',
        period: 'weekly',
        entries: [],
        config: {
          maxEntries: 100,
          minScore: 10,
          updateFrequency: 15, // 15分
          allowTies: true,
          showProgress: true,
          publicVisible: true,
          eligibilityRules: [
            {
              type: 'activity',
              condition: 'min_activities',
              value: 5,
              description: '週間最低5回のアクティビティ',
            },
          ],
          scoringFormula: {
            type: 'weighted',
            factors: [
              {
                metric: 'productivityPoints',
                weight: 0.7,
                description: '生産性ポイント',
              },
              {
                metric: 'streakBonus',
                weight: 0.3,
                description: 'ストリークボーナス',
              },
            ],
            description: '生産性重視の加重スコア',
          },
        },
        rewards: [
          {
            rank: 1,
            rewards: [
              {
                type: 'badge',
                value: 'weekly_productivity_champion',
                description: '週間生産性チャンピオン',
              },
              {
                type: 'points',
                value: 200,
                description: 'ボーナスポイント',
              },
            ],
            title: '週間MVPプロダクティブ',
            description: '今週最も生産的なユーザー',
          },
        ],
        status: 'active',
        startDate: this.getWeekStart().toISOString(),
        endDate: this.getWeekEnd().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalParticipants: 0,
      },
      {
        id: 'friends_competition',
        name: 'フレンドランキング',
        description: '友達との競争ランキング',
        type: 'friends',
        category: 'overall',
        period: 'monthly',
        entries: [],
        config: {
          maxEntries: 50,
          minScore: 0,
          updateFrequency: 30, // 30分
          allowTies: true,
          showProgress: true,
          publicVisible: false,
          eligibilityRules: [
            {
              type: 'custom',
              condition: 'is_friend',
              value: true,
              description: 'フレンド登録済み',
            },
          ],
          scoringFormula: {
            type: 'points',
            factors: [
              {
                metric: 'monthlyPoints',
                weight: 1.0,
                description: '月間ポイント',
              },
            ],
            description: '月間獲得ポイント',
          },
        },
        rewards: [
          {
            rank: 1,
            rewards: [
              {
                type: 'title',
                value: 'Friend Champion',
                duration: 30,
                description: 'フレンドチャンピオンタイトル',
              },
            ],
            description: 'フレンド内トップ',
          },
        ],
        status: 'active',
        startDate: this.getMonthStart().toISOString(),
        endDate: this.getMonthEnd().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalParticipants: 0,
      },
      {
        id: 'streak_masters',
        name: 'ストリークマスターズ',
        description: '連続達成記録のランキング',
        type: 'global',
        category: 'streaks',
        period: 'all_time',
        entries: [],
        config: {
          maxEntries: 200,
          minScore: 7,
          updateFrequency: 120, // 2時間
          allowTies: true,
          showProgress: true,
          publicVisible: true,
          eligibilityRules: [
            {
              type: 'level',
              condition: 'min_level',
              value: 3,
              description: 'レベル3以上',
            },
          ],
          scoringFormula: {
            type: 'custom',
            factors: [
              {
                metric: 'maxStreak',
                weight: 0.6,
                description: '最長ストリーク',
              },
              {
                metric: 'currentStreak',
                weight: 0.4,
                description: '現在のストリーク',
              },
            ],
            description: 'ストリーク重視スコア',
          },
        },
        rewards: [
          {
            rank: 1,
            rewards: [
              {
                type: 'badge',
                value: 'streak_legend',
                description: 'ストリークレジェンド',
              },
              {
                type: 'feature',
                value: 'streak_protection',
                description: 'ストリーク保護機能',
              },
            ],
            title: 'ストリークレジェンド',
            description: '継続の達人',
          },
        ],
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        totalParticipants: 0,
      },
    ];

    defaultLeaderboards.forEach((leaderboard) => {
      this.leaderboards.set(leaderboard.id, leaderboard);
    });

    console.log('🏆 デフォルトリーダーボードを初期化しました', this.leaderboards.size, 'ボード');
  }

  /**
   * 🎪 シーズナル競技初期化
   */
  private initializeSeasonalCompetitions(): void {
    const currentSeason: SeasonalCompetition = {
      id: 'spring_2024',
      name: 'スプリングチャレンジ2024',
      description: '春の大型イベント - 新しい始まりの季節',
      theme: 'renewal',
      season: 1,
      startDate: new Date('2024-03-20').toISOString(),
      endDate: new Date('2024-06-21').toISOString(),
      status: 'active',
      leaderboards: ['global_overall', 'weekly_productivity'],
      specialRewards: [
        {
          id: 'spring_bloomer',
          name: 'スプリングブルーマー',
          description: '春シーズン中に最も成長したユーザー',
          criteria: 'max_level_gain',
          reward: [
            {
              type: 'badge',
              value: 'spring_bloomer_2024',
              description: 'スプリングブルーマー2024バッジ',
            },
            {
              type: 'points',
              value: 2000,
              description: 'スペシャルボーナスポイント',
            },
          ],
          exclusive: true,
          claimedBy: [],
        },
      ],
      participants: [],
      milestones: [
        {
          id: 'spring_milestone_1',
          name: 'コミュニティゴール: 100万ポイント',
          description: '全参加者で合計100万ポイント獲得',
          target: 1000000,
          current: 0,
          reward: [
            {
              type: 'feature',
              value: 'special_theme',
              description: '限定スプリングテーマ解除',
            },
          ],
          unlockedBy: [],
        },
      ],
      socialFeatures: [
        {
          type: 'team_challenge',
          name: 'チーム対抗戦',
          description: '5人チームでの協力チャレンジ',
          participants: [],
          status: 'active',
          config: {
            teamSize: 5,
            duration: 7, // 7日間
            objective: 'collective_points',
            target: 5000,
          },
        },
      ],
    };

    this.seasonalCompetitions.set(currentSeason.id, currentSeason);

    console.log('🎪 シーズナル競技を初期化しました');
  }

  /**
   * 🔄 リーダーボード更新開始
   */
  private startLeaderboardUpdates(): void {
    this.leaderboards.forEach((leaderboard, id) => {
      if (leaderboard.status === 'active') {
        const interval = setInterval(
          () => {
            this.updateLeaderboard(id);
          },
          leaderboard.config.updateFrequency * 60 * 1000
        );

        this.updateIntervals.set(id, interval);
      }
    });

    console.log('🔄 リーダーボード自動更新を開始しました');
  }

  /**
   * 📊 リーダーボード更新
   */
  async updateLeaderboard(leaderboardId: string): Promise<void> {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard || leaderboard.status !== 'active') {
      return;
    }

    try {
      // ユーザーデータを取得してスコア計算
      const entries = await this.calculateLeaderboardEntries(leaderboard);

      // ランキング計算とティア設定
      const rankedEntries = this.calculateRankings(entries, leaderboard.config);

      // 前回ランキングとの比較
      const entriesWithChanges = this.calculateRankingChanges(rankedEntries, leaderboard.entries);

      // リーダーボード更新
      leaderboard.entries = entriesWithChanges;
      leaderboard.lastUpdated = new Date().toISOString();
      leaderboard.totalParticipants = entriesWithChanges.length;

      // ユーザーランキング履歴更新
      entriesWithChanges.forEach((entry) => {
        this.updateUserRankingHistory(entry, leaderboard);
      });

      // 新記録やランクアップ通知
      this.checkForAchievements(entriesWithChanges, leaderboard);

      console.log(
        `📊 リーダーボード更新完了: ${leaderboard.name} (${entriesWithChanges.length}エントリー)`
      );
    } catch (error) {
      console.error(`リーダーボード更新エラー: ${leaderboardId}`, error);
    }
  }

  /**
   * 🧮 リーダーボードエントリー計算
   */
  private async calculateLeaderboardEntries(leaderboard: Leaderboard): Promise<LeaderboardEntry[]> {
    // 実際の実装では、PointRewardServiceやユーザーサービスからデータを取得
    // ここではサンプルデータを生成
    const sampleUsers = this.generateSampleUsers(50);

    const entries: LeaderboardEntry[] = [];

    for (const user of sampleUsers) {
      // 資格チェック
      if (!this.checkEligibility(user, leaderboard.config.eligibilityRules)) {
        continue;
      }

      // スコア計算
      const score = this.calculateScore(user, leaderboard.config.scoringFormula);

      if (score < leaderboard.config.minScore) {
        continue;
      }

      const entry: LeaderboardEntry = {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        score,
        rank: 0, // 後で計算
        tier: 'bronze', // 後で計算
        change: 'same',
        badges: user.badges,
        achievements: user.achievements,
        metadata: {
          level: user.level,
          totalPoints: user.totalPoints,
          streakCount: user.streakCount,
          lastActivity: user.lastActivity,
          joinDate: user.joinDate,
        },
      };

      entries.push(entry);
    }

    return entries;
  }

  /**
   * 🏆 ランキング計算
   */
  private calculateRankings(
    entries: LeaderboardEntry[],
    config: LeaderboardConfig
  ): LeaderboardEntry[] {
    // スコア順でソート
    const sorted = entries.sort((a, b) => b.score - a.score);

    // ランク付与
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].score !== sorted[i - 1].score) {
        currentRank = i + 1;
      } else if (i > 0 && !config.allowTies) {
        currentRank = i + 1;
      }

      sorted[i].rank = currentRank;
      sorted[i].tier = this.calculateTier(currentRank, sorted.length);
    }

    return sorted.slice(0, config.maxEntries);
  }

  /**
   * 🔄 ランキング変動計算
   */
  private calculateRankingChanges(
    newEntries: LeaderboardEntry[],
    oldEntries: LeaderboardEntry[]
  ): LeaderboardEntry[] {
    const oldRankMap = new Map<string, number>();
    oldEntries.forEach((entry) => {
      oldRankMap.set(entry.userId, entry.rank);
    });

    return newEntries.map((entry) => {
      const oldRank = oldRankMap.get(entry.userId);

      if (oldRank === undefined) {
        entry.change = 'new';
      } else {
        entry.previousRank = oldRank;
        if (entry.rank < oldRank) {
          entry.change = 'up';
        } else if (entry.rank > oldRank) {
          entry.change = 'down';
        } else {
          entry.change = 'same';
        }
      }

      return entry;
    });
  }

  /**
   * 👤 ユーザーランキング履歴更新
   */
  private updateUserRankingHistory(entry: LeaderboardEntry, leaderboard: Leaderboard): void {
    let history = this.userRankings.get(entry.userId);
    if (!history) {
      history = {
        userId: entry.userId,
        history: [],
        personalBests: [],
        achievements: [],
      };
      this.userRankings.set(entry.userId, history);
    }

    // 履歴追加
    const snapshot: RankingSnapshot = {
      leaderboardId: leaderboard.id,
      rank: entry.rank,
      score: entry.score,
      tier: entry.tier,
      timestamp: new Date().toISOString(),
      totalParticipants: leaderboard.totalParticipants,
    };

    history.history.push(snapshot);

    // 履歴は最新100件まで保持
    if (history.history.length > 100) {
      history.history = history.history.slice(-100);
    }

    // パーソナルベスト更新チェック
    this.updatePersonalBests(history, leaderboard, entry);
  }

  /**
   * 🎯 実績チェック
   */
  private checkForAchievements(entries: LeaderboardEntry[], leaderboard: Leaderboard): void {
    entries.forEach((entry) => {
      // ランクアップ通知
      if (entry.change === 'up' && entry.previousRank && entry.previousRank - entry.rank >= 5) {
        toast({
          title: '大幅ランクアップ！',
          description: `${leaderboard.name}で${entry.previousRank - entry.rank}位上昇しました！`,
          variant: 'default',
        });
      }

      // トップ10入り
      if (entry.rank <= 10 && (!entry.previousRank || entry.previousRank > 10)) {
        toast({
          title: 'トップ10入り！',
          description: `${leaderboard.name}でトップ10に入りました！`,
          variant: 'default',
        });
      }

      // 1位獲得
      if (entry.rank === 1 && entry.previousRank !== 1) {
        toast({
          title: '🎉 1位獲得！',
          description: `${leaderboard.name}で第1位を獲得しました！`,
          variant: 'default',
        });
      }
    });
  }

  /**
   * 🏅 ティア計算
   */
  private calculateTier(rank: number, totalParticipants: number): LeaderboardTier {
    const percentile = rank / totalParticipants;

    if (percentile <= 0.01) return 'grandmaster';
    if (percentile <= 0.05) return 'master';
    if (percentile <= 0.15) return 'diamond';
    if (percentile <= 0.3) return 'platinum';
    if (percentile <= 0.5) return 'gold';
    if (percentile <= 0.75) return 'silver';
    return 'bronze';
  }

  /**
   * ✅ 資格チェック
   */
  private checkEligibility(user: any, rules: EligibilityRule[]): boolean {
    return rules.every((rule) => {
      switch (rule.type) {
        case 'level':
          return user.level >= rule.value;
        case 'achievement':
          return user.achievements.includes(rule.value);
        case 'activity':
          return user.weeklyActivities >= rule.value;
        case 'custom':
          // カスタムロジック（フレンド等）
          return true;
        default:
          return true;
      }
    });
  }

  /**
   * 🧮 スコア計算
   */
  private calculateScore(user: any, formula: ScoringFormula): number {
    switch (formula.type) {
      case 'points':
        return user.totalPoints || 0;
      case 'weighted':
        return formula.factors.reduce((score, factor) => {
          const value = user[factor.metric] || 0;
          return score + value * factor.weight;
        }, 0);
      case 'custom':
        // カスタムフォーミュラ（ストリーク等）
        return formula.factors.reduce((score, factor) => {
          let value = user[factor.metric] || 0;
          if (factor.metric === 'maxStreak') {
            value = Math.min(value, 365); // 最大365日
          }
          return score + value * factor.weight;
        }, 0);
      default:
        return 0;
    }
  }

  /**
   * 👥 サンプルユーザー生成
   */
  private generateSampleUsers(count: number): any[] {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: `user_${i + 1}`,
        username: `user${i + 1}`,
        displayName: `ユーザー${i + 1}`,
        avatar: `/avatars/user${i + 1}.png`,
        level: Math.floor(Math.random() * 50) + 1,
        totalPoints: Math.floor(Math.random() * 10000) + 100,
        weeklyActivities: Math.floor(Math.random() * 20) + 5,
        streakCount: Math.floor(Math.random() * 100),
        maxStreak: Math.floor(Math.random() * 150),
        currentStreak: Math.floor(Math.random() * 50),
        badges: [`badge_${Math.floor(Math.random() * 10)}`],
        achievements: [`achievement_${Math.floor(Math.random() * 20)}`],
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    return users;
  }

  /**
   * 🏆 パーソナルベスト更新
   */
  private updatePersonalBests(
    history: UserRankingHistory,
    leaderboard: Leaderboard,
    entry: LeaderboardEntry
  ): void {
    let personalBest = history.personalBests.find((pb) => pb.leaderboardId === leaderboard.id);

    if (!personalBest) {
      personalBest = {
        leaderboardId: leaderboard.id,
        category: leaderboard.category,
        bestRank: entry.rank,
        bestScore: entry.score,
        achievedAt: new Date().toISOString(),
      };
      history.personalBests.push(personalBest);
    } else {
      let updated = false;

      if (entry.rank < personalBest.bestRank) {
        personalBest.bestRank = entry.rank;
        updated = true;
      }

      if (entry.score > personalBest.bestScore) {
        personalBest.bestScore = entry.score;
        updated = true;
      }

      if (updated) {
        personalBest.achievedAt = new Date().toISOString();

        toast({
          title: 'パーソナルベスト更新！',
          description: `${leaderboard.name}で新記録を達成しました！`,
          variant: 'default',
        });
      }
    }
  }

  /**
   * 📅 日付ヘルパーメソッド
   */
  private getWeekStart(): Date {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getWeekEnd(): Date {
    const start = this.getWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getMonthEnd(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * 👫 フレンド関連機能
   */
  addFriend(userId: string, friendId: string): void {
    const friends = this.socialConnections.get(userId) || [];
    if (!friends.includes(friendId)) {
      friends.push(friendId);
      this.socialConnections.set(userId, friends);

      // 相互フレンド追加
      const friendsFriends = this.socialConnections.get(friendId) || [];
      if (!friendsFriends.includes(userId)) {
        friendsFriends.push(userId);
        this.socialConnections.set(friendId, friendsFriends);
      }
    }
  }

  getFriends(userId: string): string[] {
    return this.socialConnections.get(userId) || [];
  }

  // ゲッター
  getLeaderboard(leaderboardId: string): Leaderboard | undefined {
    return this.leaderboards.get(leaderboardId);
  }

  getAllLeaderboards(): Leaderboard[] {
    return Array.from(this.leaderboards.values());
  }

  getActiveLeaderboards(): Leaderboard[] {
    return Array.from(this.leaderboards.values()).filter((lb) => lb.status === 'active');
  }

  getUserRankingHistory(userId: string): UserRankingHistory | undefined {
    return this.userRankings.get(userId);
  }

  getSeasonalCompetition(competitionId: string): SeasonalCompetition | undefined {
    return this.seasonalCompetitions.get(competitionId);
  }

  getCurrentSeasonalCompetitions(): SeasonalCompetition[] {
    return Array.from(this.seasonalCompetitions.values()).filter(
      (comp) => comp.status === 'active'
    );
  }

  getUserPosition(userId: string, leaderboardId: string): LeaderboardEntry | undefined {
    const leaderboard = this.leaderboards.get(leaderboardId);
    return leaderboard?.entries.find((entry) => entry.userId === userId);
  }

  getLeaderboardStats(): LeaderboardStats {
    const allLeaderboards = Array.from(this.leaderboards.values());
    const activeCompetitions = this.getCurrentSeasonalCompetitions();

    return {
      totalLeaderboards: allLeaderboards.length,
      activeCompetitions: activeCompetitions.length,
      totalParticipants: allLeaderboards.reduce((sum, lb) => sum + lb.totalParticipants, 0),
      averageParticipation:
        allLeaderboards.length > 0
          ? allLeaderboards.reduce((sum, lb) => sum + lb.totalParticipants, 0) /
            allLeaderboards.length
          : 0,
      topPerformers: this.getTopPerformers(),
      trendingLeaderboards: this.getTrendingLeaderboards(),
      recentAchievements: this.getRecentAchievements(),
    };
  }

  private getTopPerformers(): LeaderboardEntry[] {
    const globalLeaderboard = this.leaderboards.get('global_overall');
    return globalLeaderboard?.entries.slice(0, 10) || [];
  }

  private getTrendingLeaderboards(): Leaderboard[] {
    return Array.from(this.leaderboards.values())
      .filter((lb) => lb.status === 'active')
      .sort((a, b) => b.totalParticipants - a.totalParticipants)
      .slice(0, 5);
  }

  private getRecentAchievements(): RankingAchievement[] {
    // 実装時は実際の達成履歴から取得
    return [];
  }
}

export const leaderboardService = LeaderboardService.getInstance();
