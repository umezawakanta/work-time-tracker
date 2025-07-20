/**
 * 🤖 AI強化ゲーミフィケーションサービス
 * 個人最適化されたゲーム体験とモチベーション管理
 */

export interface UserBehaviorPattern {
  preferredTaskTypes: string[];
  activeTimeRanges: string[];
  completionPatterns: {
    weekday: number;
    weekend: number;
    morning: number;
    afternoon: number;
    evening: number;
  };
  motivationTriggers: string[];
  burnoutSignals: string[];
  optimalChallengeLevel: number;
}

export interface AIPersonalityProfile {
  motivationStyle: 'achievement' | 'social' | 'mastery' | 'purpose';
  competitiveness: number; // 1-10
  riskTolerance: number; // 1-10
  preferredFeedbackType: 'immediate' | 'delayed' | 'milestone';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  stressTolerance: number; // 1-10
}

export interface SmartChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number; // 1-10
  estimatedTime: number; // minutes
  xpReward: number;
  personalizedReason: string;
  aiConfidence: number; // 0-1
  dependencies: string[];
  adaptiveHints: string[];
  successPrediction: number; // 0-1
}

export interface MotivationalInsight {
  type: 'encouragement' | 'strategy' | 'warning' | 'celebration';
  message: string;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  personalizedElements: string[];
  supportingData: any;
}

export interface AIReward {
  id: string;
  title: string;
  description: string;
  type: 'visual' | 'functional' | 'social' | 'content';
  personalizedValue: number; // 1-10
  cost: number;
  rarityLevel: 'common' | 'rare' | 'epic' | 'legendary';
  unlockConditions: string[];
  aiRecommendationScore: number;
}

class AIGamificationService {
  private userBehavior: UserBehaviorPattern | null = null;
  private personalityProfile: AIPersonalityProfile | null = null;
  private cachedInsights: MotivationalInsight[] = [];
  private lastAnalysisTime: Date | null = null;

  /**
   * 🧠 ユーザー行動パターン分析（モック版）
   */
  async analyzeUserBehavior(userId: string, historicalData: any[]): Promise<UserBehaviorPattern> {
    try {
      // TODO: 将来的にAI APIと連携
      console.log('📊 ユーザー行動パターンを分析中...', {
        userId,
        dataCount: historicalData.length,
      });

      // モック分析結果を生成
      const pattern = this.generateMockBehaviorPattern(historicalData);
      this.userBehavior = pattern;

      // ローカルストレージに保存
      localStorage.setItem(`user_behavior_${userId}`, JSON.stringify(pattern));

      return pattern;
    } catch (error) {
      console.error('行動分析エラー:', error);
      return this.getDefaultBehaviorPattern();
    }
  }

  /**
   * 👤 AIパーソナリティプロファイル生成（モック版）
   */
  async generatePersonalityProfile(
    userId: string,
    interactionData: any[]
  ): Promise<AIPersonalityProfile> {
    try {
      console.log('🧬 パーソナリティプロファイルを生成中...', {
        userId,
        interactions: interactionData.length,
      });

      // モックプロファイルを生成
      const profile = this.generateMockPersonalityProfile(interactionData);
      this.personalityProfile = profile;

      localStorage.setItem(`personality_profile_${userId}`, JSON.stringify(profile));

      return profile;
    } catch (error) {
      console.error('プロファイル生成エラー:', error);
      return this.getDefaultPersonalityProfile();
    }
  }

  /**
   * 🎯 スマートチャレンジ生成（モック版）
   */
  async generateSmartChallenges(userId: string, count: number = 3): Promise<SmartChallenge[]> {
    if (!this.userBehavior || !this.personalityProfile) {
      await this.loadUserProfiles(userId);
    }

    try {
      console.log('🎮 スマートチャレンジを生成中...', { userId, count });

      // モックチャレンジを生成
      const challenges = this.generateMockChallenges(count);

      return challenges;
    } catch (error) {
      console.error('スマートチャレンジ生成エラー:', error);
      return this.getFallbackChallenges();
    }
  }

  /**
   * 💡 リアルタイムモチベーション分析（モック版）
   */
  async analyzeMotivationalState(
    userId: string,
    recentActivity: any[]
  ): Promise<MotivationalInsight[]> {
    try {
      console.log('💪 モチベーション状態を分析中...', {
        userId,
        activityCount: recentActivity.length,
      });

      // モックインサイトを生成
      const insights = this.generateMockMotivationalInsights(recentActivity);
      this.cachedInsights = insights;
      this.lastAnalysisTime = new Date();

      return insights;
    } catch (error) {
      console.error('モチベーション分析エラー:', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * 🎁 パーソナライズドリワード生成（モック版）
   */
  async generatePersonalizedRewards(userId: string): Promise<AIReward[]> {
    if (!this.personalityProfile) {
      await this.loadUserProfiles(userId);
    }

    try {
      console.log('🎁 パーソナライズドリワードを生成中...', { userId });

      // モックリワードを生成
      const rewards = this.generateMockRewards();

      return rewards;
    } catch (error) {
      console.error('パーソナライズドリワード生成エラー:', error);
      return this.getDefaultRewards();
    }
  }

  /**
   * 🔄 適応的難易度調整（モック版）
   */
  async adjustDifficultyDynamically(
    userId: string,
    taskId: string,
    performanceData: any
  ): Promise<number> {
    try {
      console.log('⚖️ 難易度を動的調整中...', { userId, taskId });

      // 簡単な調整ロジック
      const successRate = performanceData.successRate || 0.5;
      let newDifficulty = 5; // デフォルト

      if (successRate > 0.9) {
        newDifficulty = Math.min(10, performanceData.currentDifficulty + 1);
      } else if (successRate < 0.7) {
        newDifficulty = Math.max(1, performanceData.currentDifficulty - 1);
      } else {
        newDifficulty = performanceData.currentDifficulty || 5;
      }

      return newDifficulty;
    } catch (error) {
      console.error('難易度調整エラー:', error);
      return 5; // デフォルト中間値
    }
  }

  /**
   * 📊 AI分析ダッシュボードデータ
   */
  async getAIDashboardData(userId: string): Promise<any> {
    const [behaviorPattern, personalityProfile, motivationalInsights] = await Promise.all([
      this.userBehavior || this.loadUserProfiles(userId).then(() => this.userBehavior),
      this.personalityProfile,
      this.cachedInsights.length > 0 ? this.cachedInsights : this.getDefaultInsights(),
    ]);

    return {
      behaviorPattern,
      personalityProfile,
      motivationalInsights,
      aiRecommendations: this.generateMockRecommendations(),
      predictiveAnalytics: this.generateMockPredictiveAnalytics(),
    };
  }

  // ==================== モック生成メソッド ====================

  private generateMockBehaviorPattern(historicalData: any[]): UserBehaviorPattern {
    // 実際のデータがある場合は簡単な分析を行う
    const taskTypes = historicalData.map((d) => d.category || d.type).filter(Boolean);
    const mostCommonType = this.getMostCommon(taskTypes) || 'learning';

    return {
      preferredTaskTypes: [mostCommonType, 'health', 'work'],
      activeTimeRanges: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
      completionPatterns: {
        weekday: Math.random() * 20 + 70, // 70-90%
        weekend: Math.random() * 20 + 50, // 50-70%
        morning: Math.random() * 20 + 75, // 75-95%
        afternoon: Math.random() * 20 + 65, // 65-85%
        evening: Math.random() * 20 + 60, // 60-80%
      },
      motivationTriggers: ['achievement', 'progress_visualization', 'social_recognition'],
      burnoutSignals: ['decreased_completion_rate', 'longer_task_duration'],
      optimalChallengeLevel: Math.floor(Math.random() * 3) + 5, // 5-7
    };
  }

  private generateMockPersonalityProfile(interactionData: any[]): AIPersonalityProfile {
    return {
      motivationStyle: ['achievement', 'social', 'mastery', 'purpose'][
        Math.floor(Math.random() * 4)
      ] as any,
      competitiveness: Math.floor(Math.random() * 6) + 5, // 5-10
      riskTolerance: Math.floor(Math.random() * 6) + 3, // 3-8
      preferredFeedbackType: ['immediate', 'delayed', 'milestone'][
        Math.floor(Math.random() * 3)
      ] as any,
      learningStyle: ['visual', 'auditory', 'kinesthetic', 'mixed'][
        Math.floor(Math.random() * 4)
      ] as any,
      stressTolerance: Math.floor(Math.random() * 5) + 6, // 6-10
    };
  }

  private generateMockChallenges(count: number): SmartChallenge[] {
    const templates = [
      {
        title: '朝の生産性ブースト',
        description: '朝一番に最も重要なタスクを完了する',
        category: 'productivity',
        personalizedReason: 'あなたの朝の集中力を活用しましょう',
      },
      {
        title: 'スキルアップチャレンジ',
        description: '新しい技術や知識を30分学習する',
        category: 'learning',
        personalizedReason: '継続的な学習があなたの成長を加速します',
      },
      {
        title: 'ヘルシーハビット',
        description: '健康に良い習慣を1つ実践する',
        category: 'health',
        personalizedReason: '体調管理が長期的な生産性の鍵です',
      },
    ];

    return Array.from({ length: count }, (_, index) => {
      const template = templates[index % templates.length];
      return {
        ...template,
        id: `ai_challenge_${Date.now()}_${index}`,
        difficulty: Math.floor(Math.random() * 4) + 4, // 4-7
        estimatedTime: Math.floor(Math.random() * 40) + 20, // 20-60分
        xpReward: Math.floor(Math.random() * 30) + 30, // 30-60 XP
        aiConfidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        dependencies: [],
        adaptiveHints: ['小さなステップに分ける', 'タイマーを設定する', '達成後に自分を褒める'],
        successPrediction: Math.random() * 0.3 + 0.6, // 0.6-0.9
      };
    });
  }

  private generateMockMotivationalInsights(recentActivity: any[]): MotivationalInsight[] {
    const insights = [
      {
        type: 'encouragement' as const,
        message: '最近の活動ペースが素晴らしいです！この調子で継続しましょう。',
        actionable: false,
        urgency: 'low' as const,
        personalizedElements: ['progress_recognition'],
        supportingData: {},
      },
      {
        type: 'strategy' as const,
        message: '朝の時間帯にタスクを集中させると、さらに効率が向上する可能性があります。',
        actionable: true,
        urgency: 'medium' as const,
        personalizedElements: ['time_optimization'],
        supportingData: {},
      },
    ];

    return insights.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateMockRewards(): AIReward[] {
    return [
      {
        id: `ai_reward_${Date.now()}_1`,
        title: 'カスタムテーマ',
        description: 'お気に入りの色でダッシュボードをカスタマイズ',
        type: 'visual',
        personalizedValue: 8,
        cost: 100,
        rarityLevel: 'common',
        unlockConditions: ['level_5'],
        aiRecommendationScore: 0.85,
      },
      {
        id: `ai_reward_${Date.now()}_2`,
        title: 'プレミアム分析',
        description: '詳細な進捗分析レポートへのアクセス',
        type: 'functional',
        personalizedValue: 9,
        cost: 200,
        rarityLevel: 'rare',
        unlockConditions: ['level_10'],
        aiRecommendationScore: 0.92,
      },
    ];
  }

  private generateMockRecommendations(): string[] {
    return [
      '朝の時間帯にタスクを集中させると効率が向上します',
      '週末は新しいスキル学習に時間を投資しましょう',
      '小さな成功を積み重ねてモチベーションを維持しましょう',
    ];
  }

  private generateMockPredictiveAnalytics(): any {
    return {
      weeklyActivityPrediction: Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 30) + 60
      ),
      motivationRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      optimalTaskTiming: ['09:00', '14:00', '19:00'],
      achievableGoals: ['習慣継続', '新スキル学習', 'プロジェクト完了'],
    };
  }

  // ==================== ヘルパーメソッド ====================

  private async loadUserProfiles(userId: string): Promise<void> {
    const savedBehavior = localStorage.getItem(`user_behavior_${userId}`);
    const savedProfile = localStorage.getItem(`personality_profile_${userId}`);

    if (savedBehavior) {
      this.userBehavior = JSON.parse(savedBehavior);
    } else {
      this.userBehavior = this.getDefaultBehaviorPattern();
    }

    if (savedProfile) {
      this.personalityProfile = JSON.parse(savedProfile);
    } else {
      this.personalityProfile = this.getDefaultPersonalityProfile();
    }
  }

  private getMostCommon(arr: string[]): string | null {
    if (arr.length === 0) return null;
    const counts = arr.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
  }

  private getDefaultBehaviorPattern(): UserBehaviorPattern {
    return {
      preferredTaskTypes: ['learning', 'health', 'work'],
      activeTimeRanges: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
      completionPatterns: {
        weekday: 75,
        weekend: 60,
        morning: 80,
        afternoon: 70,
        evening: 65,
      },
      motivationTriggers: ['achievement', 'progress_visualization', 'social_recognition'],
      burnoutSignals: ['decreased_completion_rate', 'longer_task_duration'],
      optimalChallengeLevel: 6,
    };
  }

  private getDefaultPersonalityProfile(): AIPersonalityProfile {
    return {
      motivationStyle: 'achievement',
      competitiveness: 6,
      riskTolerance: 5,
      preferredFeedbackType: 'immediate',
      learningStyle: 'mixed',
      stressTolerance: 7,
    };
  }

  private getFallbackChallenges(): SmartChallenge[] {
    return [
      {
        id: 'fallback_1',
        title: '朝の生産性ブースト',
        description: '朝一番に最も重要なタスクを完了する',
        category: 'productivity',
        difficulty: 5,
        estimatedTime: 30,
        xpReward: 50,
        personalizedReason: 'あなたの朝の集中力を活用しましょう',
        aiConfidence: 0.8,
        dependencies: [],
        adaptiveHints: ['小さなタスクから始める', 'タイマーを設定する'],
        successPrediction: 0.75,
      },
    ];
  }

  private getDefaultInsights(): MotivationalInsight[] {
    return [
      {
        type: 'encouragement',
        message: '今日も素晴らしいペースで進んでいます！',
        actionable: false,
        urgency: 'low',
        personalizedElements: ['progress_recognition'],
        supportingData: {},
      },
    ];
  }

  private getDefaultRewards(): AIReward[] {
    return [
      {
        id: 'default_1',
        title: 'カスタムテーマ',
        description: 'お気に入りの色でダッシュボードをカスタマイズ',
        type: 'visual',
        personalizedValue: 7,
        cost: 100,
        rarityLevel: 'common',
        unlockConditions: ['level_5'],
        aiRecommendationScore: 0.8,
      },
    ];
  }
}

export const aiGamificationService = new AIGamificationService();
