/**
 * 🤖 AI強化ゲーミフィケーションサービス（進化版）
 * リアルタイムAI分析・予測・パーソナライゼーションによる次世代ゲーミフィケーション
 */

import { multiAIIntegrationService } from '../ai/MultiAIIntegrationService';
import { aiServiceManager } from '../ai/AIServiceManager';
import { unifiedAIService } from '../ai/UnifiedAIService';
import { aiAutomationService } from '../ai/AIAutomationService';
import { todoApi } from '../api/todoApi';
import { NewTodo, Todo } from '@/types/todo';

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

// 新しいインターフェース
export interface EmotionalState {
  mood: 'energetic' | 'focused' | 'stressed' | 'calm' | 'frustrated' | 'motivated';
  energy: number; // 0-100
  stress: number; // 0-100
  motivation: number; // 0-100
  satisfaction: number; // 0-100
  detectedAt: string;
  confidence: number;
}

export interface PredictiveAnalytics {
  burnoutRisk: number; // 0-100
  performanceTrend: 'improving' | 'stable' | 'declining';
  optimalWorkPattern: {
    bestTimes: string[];
    recommendedBreaks: number;
    idealTaskDuration: number;
  };
  nextLevelPrediction: {
    estimatedDays: number;
    confidence: number;
  };
  motivationalFactors: string[];
}

export interface SmartCoaching {
  personalizedTips: string[];
  workflowOptimization: string;
  motivationalStrategy: string;
  interventionTriggers: string[];
  adaptiveRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface AIGameplayOptimization {
  difficultyAdjustment: number; // -10 to +10
  rewardTiming: 'immediate' | 'delayed' | 'variable';
  challengeTypes: string[];
  engagementStrategy: string;
  personalityMatch: number; // 0-100
}

export interface AIGeneratedTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number; // 1-5
  estimatedMinutes: number;
  aiConfidence: number; // 0-1
  reasoningBehind: string;
  suggestedDeadline?: string;
  tags: string[];
  relatedGoals: string[];
  dependencies?: string[];
  aiProvider: string;
  generatedAt: string;
}

export interface TaskGenerationContext {
  currentTime: string;
  dayOfWeek: string;
  userBehaviorPattern: UserBehaviorPattern;
  recentCompletedTasks: string[];
  currentWorkload: number; // 1-10
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  availableTimeSlots: string[];
  userGoals: string[];
  preferences: {
    taskTypes: string[];
    difficultylevel: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
  };
}

export interface SmartTaskRecommendation {
  tasks: AIGeneratedTask[];
  totalEstimatedTime: number;
  difficultyBalance: string;
  reasoning: string;
  alternativeOptions: AIGeneratedTask[];
  optimizationTips: string[];
}

class AIGamificationService {
  private userBehavior: UserBehaviorPattern | null = null;
  private personalityProfile: AIPersonalityProfile | null = null;
  private emotionalState: EmotionalState | null = null;
  private predictiveAnalytics: PredictiveAnalytics | null = null;
  private smartCoaching: SmartCoaching | null = null;
  private cachedInsights: MotivationalInsight[] = [];
  private lastAnalysisTime: Date | null = null;
  private aiOptimization: AIGameplayOptimization | null = null;

  /**
   * 🧠 リアルタイムAI行動分析（進化版）
   */
  async analyzeUserBehavior(userId: string, historicalData: any[]): Promise<UserBehaviorPattern> {
    try {
      console.log('🧠 AI駆動ユーザー行動分析を実行中...', {
        userId,
        dataCount: historicalData.length,
      });

      // 複数AIで行動パターンを分析
      const analysisRequest = {
        prompt: `Work Time Trackerのユーザー行動データを分析し、詳細なパターンを抽出してください：

【ユーザーID】${userId}
【データ期間】${historicalData.length}日分

【分析データ】
${JSON.stringify(historicalData.slice(0, 10), null, 2)}

以下の観点で分析してください：
1. 生産性のピークタイムと低下タイム
2. タスク完了パターンと集中力の変化
3. 休憩の取り方と効果的なタイミング
4. モチベーション維持のための最適な報酬タイミング
5. ストレス兆候と予防策

JSON形式で構造化された分析結果を返してください。`,
        taskType: 'analysis' as const,
        priority: 'high' as const,
        useMultiple: true,
      };

      const aiResponse = await multiAIIntegrationService.processTask(analysisRequest);

      // AI分析結果をパース
      const behaviorPattern = this.parseAIBehaviorAnalysis(aiResponse.content, historicalData);

      this.userBehavior = behaviorPattern;

      // ローカルストレージに保存
      localStorage.setItem(`ai_behavior_${userId}`, JSON.stringify(behaviorPattern));

      return behaviorPattern;
    } catch (error) {
      console.error('AI行動分析エラー:', error);
      return this.generateMockBehaviorPattern(historicalData);
    }
  }

  /**
   * 💭 感情状態リアルタイム分析
   */
  async analyzeEmotionalState(
    userId: string,
    recentActivity: any[],
    textInput?: string
  ): Promise<EmotionalState> {
    try {
      console.log('💭 AI感情分析を実行中...');

      const emotionRequest = {
        prompt: `ユーザーの感情状態を分析してください：

【最近の活動】
${JSON.stringify(recentActivity, null, 2)}

${
  textInput
    ? `【ユーザーの入力テキスト】
"${textInput}"`
    : ''
}

以下の要素を0-100の数値で評価し、総合的な感情状態を判定してください：
- energy（エネルギーレベル）
- stress（ストレスレベル）
- motivation（モチベーション）
- satisfaction（満足度）

また、最適なmood（energetic/focused/stressed/calm/frustrated/motivated）を判定してください。

JSON形式で返してください：
{
  "mood": "...",
  "energy": 数値,
  "stress": 数値,
  "motivation": 数値,
  "satisfaction": 数値,
  "confidence": 数値
}`,
        taskType: 'analysis' as const,
        priority: 'high' as const,
      };

      const aiResponse = await unifiedAIService.processRequest(emotionRequest);

      const emotionalState = this.parseEmotionalAnalysis(aiResponse.content);
      this.emotionalState = emotionalState;

      return emotionalState;
    } catch (error) {
      console.error('感情分析エラー:', error);
      return this.generateMockEmotionalState();
    }
  }

  /**
   * 🔮 予測的ゲーミフィケーション分析
   */
  async generatePredictiveAnalytics(userId: string): Promise<PredictiveAnalytics> {
    try {
      console.log('🔮 予測分析を実行中...');

      const predictionRequest = {
        prompt: `Work Time Trackerユーザーの予測分析を実行してください：

【ユーザー行動パターン】
${JSON.stringify(this.userBehavior, null, 2)}

【現在の感情状態】
${JSON.stringify(this.emotionalState, null, 2)}

以下を予測してください：
1. burnoutRisk: バーンアウトリスク（0-100）
2. performanceTrend: パフォーマンス傾向（improving/stable/declining）
3. optimalWorkPattern: 最適な作業パターン
4. nextLevelPrediction: 次レベル到達予測
5. motivationalFactors: 効果的なモチベーション要因

科学的根拠に基づいた予測を行い、JSON形式で返してください。`,
        taskType: 'analysis' as const,
        priority: 'high' as const,
      };

      const aiResponse = await aiServiceManager.processRequest(predictionRequest);

      const predictiveAnalytics = this.parsePredictiveAnalysis(aiResponse.content);
      this.predictiveAnalytics = predictiveAnalytics;

      return predictiveAnalytics;
    } catch (error) {
      console.error('予測分析エラー:', error);
      return this.generateMockPredictiveAnalytics();
    }
  }

  /**
   * 🎯 AIスマートコーチング
   */
  async generateSmartCoaching(userId: string): Promise<SmartCoaching> {
    try {
      console.log('🎯 AIスマートコーチングを生成中...');

      const coachingRequest = {
        prompt: `パーソナライズドコーチングアドバイスを生成してください：

【ユーザー分析】
行動パターン: ${JSON.stringify(this.userBehavior?.preferredTaskTypes)}
感情状態: ${this.emotionalState?.mood} (motivation: ${this.emotionalState?.motivation})
予測分析: バーンアウトリスク ${this.predictiveAnalytics?.burnoutRisk}%

【コーチング要求】
1. personalizedTips: 個人に最適化された具体的なアドバイス
2. workflowOptimization: ワークフロー改善提案
3. motivationalStrategy: モチベーション維持戦略
4. interventionTriggers: 介入が必要なタイミング
5. adaptiveRecommendations: 短期・中期・長期の推奨事項

実用的で実行可能なアドバイスをJSON形式で提供してください。`,
        taskType: 'planning' as const,
        priority: 'high' as const,
      };

      const aiResponse = await multiAIIntegrationService.getMultiAIConsensus(coachingRequest);

      const smartCoaching = this.parseCoachingAdvice(aiResponse.consensus);
      this.smartCoaching = smartCoaching;

      return smartCoaching;
    } catch (error) {
      console.error('スマートコーチング生成エラー:', error);
      return this.generateMockSmartCoaching();
    }
  }

  /**
   * ⚙️ ゲームプレイAI最適化
   */
  async optimizeGameplay(userId: string): Promise<AIGameplayOptimization> {
    try {
      console.log('⚙️ ゲームプレイAI最適化を実行中...');

      const optimizationRequest = {
        prompt: `ゲーミフィケーション要素をユーザーに最適化してください：

【現在の分析データ】
パーソナリティ: ${JSON.stringify(this.personalityProfile)}
感情状態: ${JSON.stringify(this.emotionalState)}
行動パターン: ${JSON.stringify(this.userBehavior?.preferredTaskTypes)}

【最適化項目】
1. difficultyAdjustment: 難易度調整（-10〜+10）
2. rewardTiming: 報酬タイミング最適化
3. challengeTypes: 最適なチャレンジタイプ
4. engagementStrategy: エンゲージメント戦略
5. personalityMatch: パーソナリティ適合度

心理学とゲーミフィケーション理論に基づいた最適化案をJSON形式で提案してください。`,
        taskType: 'planning' as const,
        priority: 'normal' as const,
      };

      const aiResponse = await unifiedAIService.processRequest(optimizationRequest);

      const optimization = this.parseOptimizationSuggestions(aiResponse.content);
      this.aiOptimization = optimization;

      return optimization;
    } catch (error) {
      console.error('ゲームプレイ最適化エラー:', error);
      return this.generateMockOptimization();
    }
  }

  /**
   * 🚀 統合AI分析パイプライン
   */
  async runFullAIAnalysis(
    userId: string,
    fullContext: any
  ): Promise<{
    behavior: UserBehaviorPattern;
    emotion: EmotionalState;
    prediction: PredictiveAnalytics;
    coaching: SmartCoaching;
    optimization: AIGameplayOptimization;
  }> {
    try {
      console.log('🚀 フルAI分析パイプラインを実行中...');

      // 並列でAI分析を実行
      const [behavior, emotion, prediction, coaching, optimization] = await Promise.all([
        this.analyzeUserBehavior(userId, fullContext.historicalData),
        this.analyzeEmotionalState(userId, fullContext.recentActivity, fullContext.textInput),
        this.generatePredictiveAnalytics(userId),
        this.generateSmartCoaching(userId),
        this.optimizeGameplay(userId),
      ]);

      // 統合レポートをAIで生成
      await this.generateIntegratedReport(userId, {
        behavior,
        emotion,
        prediction,
        coaching,
        optimization,
      });

      return { behavior, emotion, prediction, coaching, optimization };
    } catch (error) {
      console.error('統合AI分析エラー:', error);
      throw error;
    }
  }

  /**
   * 📊 統合レポート生成
   */
  private async generateIntegratedReport(userId: string, analysisResults: any): Promise<string> {
    try {
      const reportRequest = {
        prompt: `包括的なユーザー分析レポートを生成してください：

【分析結果】
${JSON.stringify(analysisResults, null, 2)}

【レポート要求】
1. 現状の総合評価
2. 主要な改善ポイント
3. 具体的な行動提案
4. 長期的な成長戦略
5. 注意すべきリスク要因

専門的かつ理解しやすい日本語でレポートを作成してください。`,
        taskType: 'analysis' as const,
        priority: 'normal' as const,
      };

      const aiResponse = await multiAIIntegrationService.processTask(reportRequest);

      // レポートを保存
      localStorage.setItem(
        `ai_report_${userId}`,
        JSON.stringify({
          content: aiResponse.content,
          generatedAt: new Date().toISOString(),
          analysisResults,
        })
      );

      return aiResponse.content;
    } catch (error) {
      console.error('統合レポート生成エラー:', error);
      return '統合レポートの生成中にエラーが発生しました。';
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

  /**
   * 📊 AI分析結果パーサー
   */
  private parseAIBehaviorAnalysis(aiContent: string, historicalData: any[]): UserBehaviorPattern {
    try {
      // JSONレスポンスを試行
      const parsed = JSON.parse(aiContent);
      return {
        preferredTaskTypes: parsed.preferredTaskTypes || ['development', 'planning'],
        activeTimeRanges: parsed.activeTimeRanges || ['09:00-11:00', '14:00-16:00'],
        completionPatterns: parsed.completionPatterns || {
          weekday: 75,
          weekend: 60,
          morning: 80,
          afternoon: 70,
          evening: 65,
        },
        motivationTriggers: parsed.motivationTriggers || [
          'achievement_badges',
          'progress_visualization',
        ],
        burnoutSignals: parsed.burnoutSignals || [
          'decreased_task_completion',
          'irregular_break_patterns',
        ],
        optimalChallengeLevel: parsed.optimalChallengeLevel || 6,
      };
    } catch (error) {
      console.warn('AI分析結果のパースに失敗、フォールバック使用:', error);
      return this.generateMockBehaviorPattern(historicalData);
    }
  }

  private parseEmotionalAnalysis(aiContent: string): EmotionalState {
    try {
      const parsed = JSON.parse(aiContent);
      return {
        mood: parsed.mood || 'focused',
        energy: parsed.energy || 75,
        stress: parsed.stress || 30,
        motivation: parsed.motivation || 80,
        satisfaction: parsed.satisfaction || 70,
        detectedAt: new Date().toISOString(),
        confidence: parsed.confidence || 0.8,
      };
    } catch (error) {
      return this.generateMockEmotionalState();
    }
  }

  private parsePredictiveAnalysis(aiContent: string): PredictiveAnalytics {
    try {
      const parsed = JSON.parse(aiContent);
      return {
        burnoutRisk: parsed.burnoutRisk || 25,
        performanceTrend: parsed.performanceTrend || 'stable',
        optimalWorkPattern: parsed.optimalWorkPattern || {
          bestTimes: ['09:00-11:00', '14:00-16:00'],
          recommendedBreaks: 3,
          idealTaskDuration: 90,
        },
        nextLevelPrediction: parsed.nextLevelPrediction || {
          estimatedDays: 12,
          confidence: 0.75,
        },
        motivationalFactors: parsed.motivationalFactors || [
          '進捗の可視化',
          '達成バッジの獲得',
          'チーム内競争',
        ],
      };
    } catch (error) {
      return this.generateMockPredictiveAnalytics();
    }
  }

  private parseCoachingAdvice(aiContent: string): SmartCoaching {
    try {
      const parsed = JSON.parse(aiContent);
      return {
        personalizedTips: parsed.personalizedTips || [
          '朝の30分を計画立てに使うと効率が向上します',
          '集中力が低下する午後は軽めのタスクを設定しましょう',
        ],
        workflowOptimization:
          parsed.workflowOptimization || 'ポモドーロテクニックと短い休憩を組み合わせることを推奨',
        motivationalStrategy: parsed.motivationalStrategy || '小さな達成を積み重ねる戦略が効果的',
        interventionTriggers: parsed.interventionTriggers || [
          'ストレスレベル70%超過時',
          '3日連続でタスク未完了時',
        ],
        adaptiveRecommendations: parsed.adaptiveRecommendations || {
          immediate: ['15分休憩を取る', '深呼吸エクササイズ'],
          shortTerm: ['作業環境の整理', 'タスクの優先順位見直し'],
          longTerm: ['スキルアップ計画', 'ワークライフバランス改善'],
        },
      };
    } catch (error) {
      return this.generateMockSmartCoaching();
    }
  }

  private parseOptimizationSuggestions(aiContent: string): AIGameplayOptimization {
    try {
      const parsed = JSON.parse(aiContent);
      return {
        difficultyAdjustment: parsed.difficultyAdjustment || 2,
        rewardTiming: parsed.rewardTiming || 'immediate',
        challengeTypes: parsed.challengeTypes || ['skill_building', 'time_management'],
        engagementStrategy:
          parsed.engagementStrategy || 'progressive_challenge_with_social_recognition',
        personalityMatch: parsed.personalityMatch || 85,
      };
    } catch (error) {
      return this.generateMockOptimization();
    }
  }

  // Mock generators for fallback
  private generateMockEmotionalState(): EmotionalState {
    return {
      mood: 'focused',
      energy: 75,
      stress: 30,
      motivation: 80,
      satisfaction: 70,
      detectedAt: new Date().toISOString(),
      confidence: 0.8,
    };
  }

  private generateMockPredictiveAnalytics(): PredictiveAnalytics {
    return {
      burnoutRisk: 25,
      performanceTrend: 'stable',
      optimalWorkPattern: {
        bestTimes: ['09:00-11:00', '14:00-16:00'],
        recommendedBreaks: 3,
        idealTaskDuration: 90,
      },
      nextLevelPrediction: {
        estimatedDays: 12,
        confidence: 0.75,
      },
      motivationalFactors: ['進捗の可視化', '達成バッジの獲得', 'チーム内競争'],
    };
  }

  private generateMockSmartCoaching(): SmartCoaching {
    return {
      personalizedTips: [
        '朝の30分を計画立てに使うと効率が向上します',
        '集中力が低下する午後は軽めのタスクを設定しましょう',
      ],
      workflowOptimization: 'ポモドーロテクニックと短い休憩を組み合わせることを推奨',
      motivationalStrategy: '小さな達成を積み重ねる戦略が効果的',
      interventionTriggers: ['ストレスレベル70%超過時', '3日連続でタスク未完了時'],
      adaptiveRecommendations: {
        immediate: ['15分休憩を取る', '深呼吸エクササイズ'],
        shortTerm: ['作業環境の整理', 'タスクの優先順位見直し'],
        longTerm: ['スキルアップ計画', 'ワークライフバランス改善'],
      },
    };
  }

  private generateMockOptimization(): AIGameplayOptimization {
    return {
      difficultyAdjustment: 2,
      rewardTiming: 'immediate',
      challengeTypes: ['skill_building', 'time_management'],
      engagementStrategy: 'progressive_challenge_with_social_recognition',
      personalityMatch: 85,
    };
  }

  /**
   * 🤖 AIによるスマートタスク生成
   * ユーザーの状況を分析し、最適なタスクを自動生成
   */
  async generateSmartTasks(context: TaskGenerationContext): Promise<SmartTaskRecommendation> {
    try {
      const aiPrompt = this.buildTaskGenerationPrompt(context);

      // マルチAIサービスを使用してタスクを生成
      const response = await multiAIIntegrationService.processTask({
        prompt: aiPrompt,
        taskType: 'planning' as const,
        priority: 'high' as const,
        context: JSON.stringify({
          userBehavior: context.userBehaviorPattern,
          currentState: {
            workload: context.currentWorkload,
            stress: context.stressLevel,
            energy: context.energyLevel,
          },
        }),
      });

      return this.parseTaskGenerationResponse(response.content, context);
    } catch (error) {
      console.error('AI task generation failed:', error);
      return this.generateFallbackTasks(context);
    }
  }

  /**
   * タスク生成用のAIプロンプトを構築
   */
  private buildTaskGenerationPrompt(context: TaskGenerationContext): string {
    return `
ユーザーの状況を分析して、最適なタスクを提案してください。

現在の状況:
- 時刻: ${context.currentTime}
- 曜日: ${context.dayOfWeek}
- 現在の作業負荷: ${context.currentWorkload}/10
- ストレスレベル: ${context.stressLevel}/10
- エネルギーレベル: ${context.energyLevel}/10
- 利用可能時間: ${context.availableTimeSlots.join(', ')}

ユーザーの行動パターン:
- 好みのタスクタイプ: ${context.userBehaviorPattern.preferredTaskTypes.join(', ')}
- アクティブ時間帯: ${context.userBehaviorPattern.activeTimeRanges.join(', ')}
- モチベーション要因: ${context.userBehaviorPattern.motivationTriggers.join(', ')}

最近完了したタスク:
${context.recentCompletedTasks.slice(0, 5).join(', ')}

ユーザーの目標:
${context.userGoals.join(', ')}

以下の形式のJSONで3-5個のタスクを提案してください:
{
  "tasks": [
    {
      "title": "タスクのタイトル",
      "description": "詳細な説明",
      "category": "カテゴリ",
      "priority": 1-5の数値,
      "estimatedMinutes": 予想所要時間（分）,
      "aiConfidence": 0-1の信頼度,
      "reasoningBehind": "このタスクを提案する理由",
      "suggestedDeadline": "YYYY-MM-DD形式の推奨期限",
      "tags": ["タグ1", "タグ2"],
      "relatedGoals": ["関連する目標"]
    }
  ],
  "totalEstimatedTime": 合計予想時間,
  "difficultyBalance": "難易度バランスの説明",
  "reasoning": "全体的な提案理由",
  "optimizationTips": ["最適化のヒント1", "ヒント2"]
}

ユーザーの現在のエネルギーレベルとストレス状況を考慮し、実行可能で効果的なタスクを提案してください。
    `.trim();
  }

  /**
   * AIレスポンスをパース
   */
  private parseTaskGenerationResponse(
    response: string,
    context: TaskGenerationContext
  ): SmartTaskRecommendation {
    try {
      const parsed = JSON.parse(response);

      const tasks: AIGeneratedTask[] = parsed.tasks.map((task: any, index: number) => ({
        id: `ai-generated-${Date.now()}-${index}`,
        title: task.title || `AI提案タスク ${index + 1}`,
        description: task.description || '',
        category: task.category || 'general',
        priority: Math.min(Math.max(task.priority || 3, 1), 5),
        estimatedMinutes: task.estimatedMinutes || 30,
        aiConfidence: Math.min(Math.max(task.aiConfidence || 0.7, 0), 1),
        reasoningBehind: task.reasoningBehind || 'AI分析による提案',
        suggestedDeadline: task.suggestedDeadline,
        tags: Array.isArray(task.tags) ? task.tags : ['AI提案'],
        relatedGoals: Array.isArray(task.relatedGoals) ? task.relatedGoals : [],
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        aiProvider: 'multi-ai',
        generatedAt: new Date().toISOString(),
      }));

      return {
        tasks,
        totalEstimatedTime:
          parsed.totalEstimatedTime || tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
        difficultyBalance: parsed.difficultyBalance || 'バランス良く調整済み',
        reasoning: parsed.reasoning || 'ユーザーの現在状況に最適化されたタスク群',
        alternativeOptions: tasks.slice(0, 2), // 代替オプションとして最初の2つを使用
        optimizationTips: Array.isArray(parsed.optimizationTips)
          ? parsed.optimizationTips
          : [
              '短い休憩を挟みながら実行することを推奨',
              'エネルギーレベルに応じてタスクの順序を調整',
            ],
      };
    } catch (error) {
      console.error('Failed to parse AI task generation response:', error);
      return this.generateFallbackTasks(context);
    }
  }

  /**
   * AIが利用できない場合のフォールバックタスク生成
   */
  private generateFallbackTasks(context: TaskGenerationContext): SmartTaskRecommendation {
    const fallbackTasks: AIGeneratedTask[] = [
      {
        id: `fallback-${Date.now()}-1`,
        title: '今日の優先タスクの整理',
        description: '重要なタスクを3つ選んで優先順位を決める',
        category: 'productivity',
        priority: 4,
        estimatedMinutes: 15,
        aiConfidence: 0.8,
        reasoningBehind: 'タスク整理は生産性向上の基本',
        suggestedDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['整理', '計画'],
        relatedGoals: context.userGoals.slice(0, 2),
        aiProvider: 'fallback',
        generatedAt: new Date().toISOString(),
      },
      {
        id: `fallback-${Date.now()}-2`,
        title: '5分間の瞑想・リラックス',
        description: 'ストレス軽減と集中力向上のための短時間瞑想',
        category: 'wellness',
        priority: 3,
        estimatedMinutes: 5,
        aiConfidence: 0.9,
        reasoningBehind: 'ストレスレベルが高めなため、リラックスを推奨',
        tags: ['ウェルネス', 'リラックス'],
        relatedGoals: ['健康維持'],
        aiProvider: 'fallback',
        generatedAt: new Date().toISOString(),
      },
    ];

    return {
      tasks: fallbackTasks,
      totalEstimatedTime: 20,
      difficultyBalance: '軽めのタスクで調整',
      reasoning: 'フォールバックとして基本的なタスクを提案',
      alternativeOptions: [],
      optimizationTips: [
        '小さなタスクから始めて勢いをつけましょう',
        '完了したタスクを祝うことでモチベーションを維持',
      ],
    };
  }

  /**
   * AIが生成したタスクを実際のTodoシステムに追加
   */
  async addAIGeneratedTasksToTodo(tasks: AIGeneratedTask[]): Promise<Todo[]> {
    const addedTodos: Todo[] = [];

    for (const task of tasks) {
      try {
        const newTodo: NewTodo = {
          task: task.title,
          type: 'input' as const,
          priority: task.priority,
          deadline: task.suggestedDeadline,
          note: `${task.description}\n\n[AI生成] ${task.reasoningBehind}\n信頼度: ${Math.round(task.aiConfidence * 100)}%`,
          tags: [...task.tags, 'AI生成', task.aiProvider],
        };

        const response = await todoApi.create(
          newTodo.task,
          newTodo.priority || 3,
          false, // isPrioritized
          newTodo.type,
          newTodo.deadline
        );

        if (response.data && response.data.todo) {
          // TodoItemからTodoへの型変換
          const todoItem = response.data.todo;
          const todo: Todo = {
            id: todoItem._id,
            _id: todoItem._id,
            task: todoItem.task,
            type: (todoItem.type as 'input' | 'output') || 'input',
            completed: todoItem.completed,
            priority: todoItem.priority,
            isPrioritized: todoItem.isPrioritized,
            createdAt: todoItem.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedDate: todoItem.completedDate,
            deadline: todoItem.deadline,
            note: todoItem.note,
            tags: todoItem.tags,
          };
          addedTodos.push(todo);
        }
      } catch (error) {
        console.error(`Failed to add AI generated task: ${task.title}`, error);
      }
    }

    return addedTodos;
  }

  /**
   * ユーザーの現在のコンテキストを自動収集
   */
  async getCurrentTaskGenerationContext(): Promise<TaskGenerationContext> {
    const now = new Date();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];

    // ユーザーの行動パターンを生成（デフォルト値を使用）
    const behaviorPattern: UserBehaviorPattern = {
      preferredTaskTypes: ['productivity', 'learning', 'wellness'],
      activeTimeRanges: ['09:00-12:00', '14:00-17:00'],
      completionPatterns: {
        weekday: 7,
        weekend: 3,
        morning: 5,
        afternoon: 4,
        evening: 2,
      },
      motivationTriggers: ['達成感', 'ゲーミフィケーション', '可視化'],
      burnoutSignals: ['連続失敗', '長時間作業', 'ストレス増加'],
      optimalChallengeLevel: 6,
    };

    return {
      currentTime: now.toLocaleTimeString('ja-JP'),
      dayOfWeek,
      userBehaviorPattern: behaviorPattern,
      recentCompletedTasks: [], // 実際の実装では過去の完了タスクを取得
      currentWorkload: 5, // 実際の実装では現在のアクティブタスク数を分析
      stressLevel: 4, // 実際の実装では感情状態分析から取得
      energyLevel: 6, // 実際の実装では時間帯や活動パターンから推定
      availableTimeSlots: ['30分', '60分'], // 実際の実装ではカレンダー分析
      userGoals: ['生産性向上', '健康維持', 'スキルアップ'], // 実際の実装では設定から取得
      preferences: {
        taskTypes: ['productivity', 'learning', 'wellness'],
        difficultylevel: 'medium',
        focusAreas: ['仕事効率化', '自己成長'],
      },
    };
  }
}

export const aiGamificationService = new AIGamificationService();
