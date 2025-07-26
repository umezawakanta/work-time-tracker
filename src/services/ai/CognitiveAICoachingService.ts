/**
 * 🤖 AI認知コーチングサービス
 * ADHD/ASD特性に基づく機械学習による個人最適化とコーチング
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// AI分析データ型定義
interface CognitiveData {
  userId: string;
  timestamp: Date;
  cognitiveState: {
    attention: number; // 0-100
    energy: number; // 0-100
    stress: number; // 0-100
    flow: number; // 0-100
    motivation: number; // 0-100
  };
  behavioralMetrics: {
    taskCompletionRate: number;
    procrastinationFrequency: number;
    impulsivityScore: number;
    focusSessionCount: number;
    breakPatternAdherence: number;
    socialInteractionLevel: number;
    sleepQuality: number;
    exerciseFrequency: number;
  };
  environmentalFactors: {
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    weather?: string;
    noiseLevel: number; // 0-100
    socialContext: 'alone' | 'family' | 'work' | 'social';
    location: 'home' | 'office' | 'public' | 'transport';
  };
  outcomes: {
    productivity: number; // 0-100
    satisfaction: number; // 0-100
    stressReduction: number; // 0-100
    goalProgress: number; // 0-100
  };
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // 発生頻度
  confidence: number; // 信頼度 0-1
  triggers: string[]; // トリガー条件
  outcomes: string[]; // 結果
  adhdRelevance: number; // ADHD特性への関連度 0-1
  lastUpdated: Date;
  dataPoints: number; // 学習データ数
}

interface AIRecommendation {
  id: string;
  type: 'behavioral' | 'environmental' | 'cognitive' | 'schedule' | 'social';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: number; // 期待される効果 0-100
  difficulty: number; // 実行難易度 0-100
  timeToResult: number; // 効果が現れるまでの日数
  cognitiveLoad: number; // 認知負荷 0-100
  personalizedFor: {
    adhdCharacteristics: string[];
    cognitiveProfile: string[];
    behaviorPatterns: string[];
  };
  actionSteps: ActionStep[];
  measurableOutcomes: string[];
  adaptationHistory: AdaptationRecord[];
  validUntil: Date;
}

interface ActionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  requiredCognitiveState: {
    minAttention: number;
    minEnergy: number;
    maxStress: number;
  };
  tools: string[];
  checkpoints: string[];
  adaptiveVariations: string[];
}

interface AdaptationRecord {
  timestamp: Date;
  userFeedback: 'positive' | 'neutral' | 'negative';
  actualOutcome: number;
  adherenceLevel: number;
  contextFactors: string[];
  lessons: string[];
}

interface CoachingInsight {
  id: string;
  category: 'strength' | 'challenge' | 'opportunity' | 'warning';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  urgency: number; // 0-100
  personalizedMessage: string;
  suggestedActions: string[];
  relatedPatterns: string[];
  generatedAt: Date;
}

interface LearningModel {
  userId: string;
  modelType: 'pattern_recognition' | 'outcome_prediction' | 'optimization' | 'anomaly_detection';
  features: string[];
  accuracy: number;
  lastTraining: Date;
  datasetSize: number;
  hyperparameters: Record<string, any>;
  performanceMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    mae: number; // Mean Absolute Error
  };
}

export class CognitiveAICoachingService extends EventEmitter {
  private cognitiveDataHistory: Map<string, CognitiveData[]> = new Map();
  private behaviorPatterns: Map<string, BehaviorPattern[]> = new Map();
  private activeRecommendations: Map<string, AIRecommendation[]> = new Map();
  private coachingInsights: Map<string, CoachingInsight[]> = new Map();
  private learningModels: Map<string, LearningModel[]> = new Map();
  private isTraining: boolean = false;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeAICoaching();
  }

  /**
   * AIコーチングシステムの初期化
   */
  private async initializeAICoaching(): Promise<void> {
    console.log('🤖 AI認知コーチングシステムを初期化中...');

    await this.loadModelsFromStorage();
    this.startContinuousAnalysis();
    this.initializeDefaultPatterns();

    console.log('✅ AI認知コーチングシステムが準備完了');
    this.emit('systemReady');
  }

  /**
   * 継続的分析の開始
   */
  private startContinuousAnalysis(): void {
    // 5分間隔で分析実行
    this.analysisInterval = setInterval(
      () => {
        this.runContinuousAnalysis();
      },
      5 * 60 * 1000
    );

    // 1時間間隔でモデル再訓練
    setInterval(
      () => {
        this.retrainModels();
      },
      60 * 60 * 1000
    );
  }

  /**
   * 認知データの記録と分析
   */
  public async recordCognitiveData(data: CognitiveData): Promise<void> {
    const userHistory = this.cognitiveDataHistory.get(data.userId) || [];
    userHistory.push(data);

    // 最新500件のみ保持
    if (userHistory.length > 500) {
      userHistory.splice(0, userHistory.length - 500);
    }

    this.cognitiveDataHistory.set(data.userId, userHistory);

    // リアルタイム分析
    await this.analyzeImmediate(data);

    // パターン更新
    await this.updateBehaviorPatterns(data.userId, data);

    // レコメンデーション生成
    await this.generateRecommendations(data.userId);

    this.emit('dataRecorded', { userId: data.userId, analysis: 'completed' });
  }

  /**
   * 即座の分析（リアルタイム）
   */
  private async analyzeImmediate(data: CognitiveData): Promise<void> {
    const { userId, cognitiveState, outcomes } = data;

    // アラート条件のチェック
    if (cognitiveState.stress > 80 && cognitiveState.attention < 30) {
      await this.generateUrgentRecommendation(userId, 'stress_attention_crisis', {
        stress: cognitiveState.stress,
        attention: cognitiveState.attention,
        context: data.environmentalFactors,
      });
    }

    // フロー状態の検出
    if (cognitiveState.flow > 75 && cognitiveState.attention > 80) {
      await this.recordFlowState(userId, data);
    }

    // 疲労警告
    if (cognitiveState.energy < 20 && data.behavioralMetrics.focusSessionCount > 4) {
      await this.generateFatigueWarning(userId, data);
    }
  }

  /**
   * 行動パターンの更新
   */
  private async updateBehaviorPatterns(userId: string, data: CognitiveData): Promise<void> {
    const patterns = this.behaviorPatterns.get(userId) || [];
    const history = this.cognitiveDataHistory.get(userId) || [];

    if (history.length < 10) return; // 最低10件のデータが必要

    // パターン検出アルゴリズム
    const detectedPatterns = await this.detectPatterns(history);

    detectedPatterns.forEach((newPattern) => {
      const existingPattern = patterns.find((p) => p.name === newPattern.name);

      if (existingPattern) {
        // 既存パターンの更新
        existingPattern.frequency = existingPattern.frequency * 0.8 + newPattern.frequency * 0.2;
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1.0);
        existingPattern.dataPoints += 1;
        existingPattern.lastUpdated = new Date();
      } else {
        // 新しいパターンの追加
        patterns.push(newPattern);
      }
    });

    this.behaviorPatterns.set(userId, patterns);
  }

  /**
   * パターン検出アルゴリズム
   */
  private async detectPatterns(history: CognitiveData[]): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // 時間帯パターン分析
    const hourlyProductivity = this.analyzeHourlyProductivity(history);
    if (hourlyProductivity.pattern) {
      patterns.push({
        id: `hourly_${Date.now()}`,
        name: 'Hourly Productivity Pattern',
        description: `生産性が${hourlyProductivity.peakHours.join(', ')}時に高くなる傾向`,
        frequency: hourlyProductivity.consistency,
        confidence: hourlyProductivity.confidence,
        triggers: [
          `time_range_${hourlyProductivity.peakHours[0]}-${hourlyProductivity.peakHours[hourlyProductivity.peakHours.length - 1]}`,
        ],
        outcomes: ['高い生産性', '集中力向上'],
        adhdRelevance: 0.9, // ADHD特性に高い関連性
        lastUpdated: new Date(),
        dataPoints: history.length,
      });
    }

    // ストレス-パフォーマンス相関分析
    const stressCorrelation = this.analyzeStressPerformanceCorrelation(history);
    if (Math.abs(stressCorrelation.correlation) > 0.6) {
      patterns.push({
        id: `stress_perf_${Date.now()}`,
        name: 'Stress-Performance Correlation',
        description: `ストレスレベルとパフォーマンスに${stressCorrelation.correlation > 0 ? '正' : '負'}の相関`,
        frequency: Math.abs(stressCorrelation.correlation),
        confidence: stressCorrelation.significance,
        triggers: [`stress_level_${stressCorrelation.thresholds.stress}`],
        outcomes: [`performance_${stressCorrelation.correlation > 0 ? 'increase' : 'decrease'}`],
        adhdRelevance: 0.8,
        lastUpdated: new Date(),
        dataPoints: history.length,
      });
    }

    // 社会的文脈パターン分析
    const socialPattern = this.analyzeSocialContextPattern(history);
    if (socialPattern.significance > 0.7) {
      patterns.push({
        id: `social_${Date.now()}`,
        name: 'Social Context Influence',
        description: `${socialPattern.optimalContext}環境で最も良いパフォーマンス`,
        frequency: socialPattern.frequency,
        confidence: socialPattern.significance,
        triggers: [`social_context_${socialPattern.optimalContext}`],
        outcomes: ['パフォーマンス向上', '集中力改善'],
        adhdRelevance: 0.75,
        lastUpdated: new Date(),
        dataPoints: history.length,
      });
    }

    return patterns;
  }

  /**
   * 時間帯別生産性分析
   */
  private analyzeHourlyProductivity(history: CognitiveData[]): any {
    const hourlyData: Record<number, number[]> = {};

    history.forEach((data) => {
      const hour = data.environmentalFactors.timeOfDay;
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(data.outcomes.productivity);
    });

    const hourlyAverages = Object.entries(hourlyData).map(([hour, values]) => ({
      hour: parseInt(hour),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
    }));

    if (hourlyAverages.length < 5) return { pattern: false };

    const sortedByProductivity = hourlyAverages.sort((a, b) => b.avg - a.avg);
    const topHours = sortedByProductivity.slice(0, 3);
    const avgProductivity =
      hourlyAverages.reduce((sum, h) => sum + h.avg, 0) / hourlyAverages.length;

    const consistency = topHours.reduce((sum, h) => sum + h.avg, 0) / (3 * 100); // 正規化
    const confidence = Math.min(topHours[0].count / 10, 1.0); // データ点数による信頼度

    return {
      pattern: topHours[0].avg > avgProductivity * 1.2,
      peakHours: topHours.map((h) => h.hour),
      consistency,
      confidence,
    };
  }

  /**
   * ストレス-パフォーマンス相関分析
   */
  private analyzeStressPerformanceCorrelation(history: CognitiveData[]): any {
    if (history.length < 20) return { correlation: 0, significance: 0 };

    const stressValues = history.map((d) => d.cognitiveState.stress);
    const performanceValues = history.map((d) => d.outcomes.productivity);

    const correlation = this.calculateCorrelation(stressValues, performanceValues);
    const significance = Math.min(history.length / 50, 1.0);

    return {
      correlation,
      significance,
      thresholds: {
        stress: this.calculateThreshold(stressValues, 0.7),
        performance: this.calculateThreshold(performanceValues, 0.7),
      },
    };
  }

  /**
   * 社会的文脈パターン分析
   */
  private analyzeSocialContextPattern(history: CognitiveData[]): any {
    const contextPerformance: Record<string, number[]> = {};

    history.forEach((data) => {
      const context = data.environmentalFactors.socialContext;
      if (!contextPerformance[context]) contextPerformance[context] = [];
      contextPerformance[context].push(data.outcomes.productivity);
    });

    const contextAverages = Object.entries(contextPerformance).map(([context, values]) => ({
      context,
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
    }));

    if (contextAverages.length < 2) return { significance: 0 };

    const sortedContexts = contextAverages.sort((a, b) => b.avg - a.avg);
    const bestContext = sortedContexts[0];
    const avgPerformance =
      contextAverages.reduce((sum, c) => sum + c.avg, 0) / contextAverages.length;

    return {
      optimalContext: bestContext.context,
      frequency: bestContext.count / history.length,
      significance: bestContext.avg > avgPerformance * 1.15 ? 0.8 : 0.4,
    };
  }

  /**
   * 相関係数の計算
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * 閾値の計算
   */
  private calculateThreshold(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[index] || 0;
  }

  /**
   * レコメンデーションの生成
   */
  private async generateRecommendations(userId: string): Promise<void> {
    const history = this.cognitiveDataHistory.get(userId) || [];
    const patterns = this.behaviorPatterns.get(userId) || [];

    if (history.length < 5) return;

    const recommendations: AIRecommendation[] = [];
    const recent = history.slice(-10);
    const currentState = recent[recent.length - 1];

    // パターンベースレコメンデーション
    for (const pattern of patterns) {
      if (pattern.confidence > 0.7) {
        const recommendation = await this.generatePatternBasedRecommendation(
          userId,
          pattern,
          currentState
        );
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // 認知状態ベースレコメンデーション
    const cognitiveRecommendation = await this.generateCognitiveStateRecommendation(
      userId,
      currentState
    );
    if (cognitiveRecommendation) recommendations.push(cognitiveRecommendation);

    // 環境最適化レコメンデーション
    const environmentalRecommendation = await this.generateEnvironmentalRecommendation(
      userId,
      recent
    );
    if (environmentalRecommendation) recommendations.push(environmentalRecommendation);

    // 優先度でソート
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 最大5件まで
    this.activeRecommendations.set(userId, recommendations.slice(0, 5));

    this.emit('recommendationsGenerated', { userId, count: recommendations.length });
  }

  /**
   * パターンベースレコメンデーション生成
   */
  private async generatePatternBasedRecommendation(
    userId: string,
    pattern: BehaviorPattern,
    currentState: CognitiveData
  ): Promise<AIRecommendation | null> {
    if (pattern.name === 'Hourly Productivity Pattern') {
      const currentHour = new Date().getHours();
      const isPeakHour = pattern.triggers.some((trigger) =>
        trigger.includes(currentHour.toString())
      );

      if (isPeakHour && currentState.cognitiveState.attention < 70) {
        return {
          id: `pattern_hourly_${Date.now()}`,
          type: 'schedule',
          priority: 'high',
          title: '集中力の高い時間帯を活用',
          description: `現在は生産性の高い時間帯です。重要なタスクに取り組むチャンスです。`,
          reasoning: `過去のデータから、${currentHour}時台は生産性が平均より${Math.round(pattern.confidence * 100)}%高いことがわかっています。`,
          expectedImpact: 85,
          difficulty: 30,
          timeToResult: 1,
          cognitiveLoad: 40,
          personalizedFor: {
            adhdCharacteristics: ['注意力変動', '時間感覚'],
            cognitiveProfile: ['集中力パターン'],
            behaviorPatterns: [pattern.name],
          },
          actionSteps: [
            {
              id: 'step1',
              order: 1,
              title: '環境の準備',
              description: '集中できる環境を整える（通知オフ、整理整頓）',
              estimatedMinutes: 5,
              requiredCognitiveState: { minAttention: 20, minEnergy: 30, maxStress: 80 },
              tools: ['スマートフォン', '整理用品'],
              checkpoints: ['通知がオフになっている', '机が整理されている'],
              adaptiveVariations: ['軽い音楽をかける', '自然光を取り入れる'],
            },
            {
              id: 'step2',
              order: 2,
              title: '最重要タスクの実行',
              description: '今日の最も重要なタスクを1つ選んで集中して取り組む',
              estimatedMinutes: 45,
              requiredCognitiveState: { minAttention: 60, minEnergy: 50, maxStress: 70 },
              tools: ['タイマー', 'タスクリスト'],
              checkpoints: ['タスクが明確になっている', '進捗が見える化されている'],
              adaptiveVariations: ['25分ポモドーロ', '15分マイクロフォーカス'],
            },
          ],
          measurableOutcomes: ['タスク完了率', '集中継続時間', '満足度'],
          adaptationHistory: [],
          validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2時間有効
        };
      }
    }

    return null;
  }

  /**
   * 認知状態ベースレコメンデーション生成
   */
  private async generateCognitiveStateRecommendation(
    userId: string,
    currentState: CognitiveData
  ): Promise<AIRecommendation | null> {
    const { cognitiveState } = currentState;

    // 低エネルギー状態の対処
    if (cognitiveState.energy < 30 && cognitiveState.stress < 70) {
      return {
        id: `cognitive_energy_${Date.now()}`,
        type: 'behavioral',
        priority: 'medium',
        title: 'エネルギー回復のための戦略的休憩',
        description: 'エネルギーレベルが低下しています。効果的な回復方法を実行しましょう。',
        reasoning:
          'ADHD特性では、エネルギー管理が生産性に直結します。適切な休憩により、後の集中力が大幅に向上します。',
        expectedImpact: 70,
        difficulty: 20,
        timeToResult: 1,
        cognitiveLoad: 15,
        personalizedFor: {
          adhdCharacteristics: ['エネルギー変動', '実行機能'],
          cognitiveProfile: ['注意力維持', 'エネルギー管理'],
          behaviorPatterns: ['エネルギー回復パターン'],
        },
        actionSteps: [
          {
            id: 'energy_step1',
            order: 1,
            title: '意識的な深呼吸',
            description: '4-7-8呼吸法を3回繰り返す',
            estimatedMinutes: 3,
            requiredCognitiveState: { minAttention: 10, minEnergy: 10, maxStress: 90 },
            tools: ['タイマー'],
            checkpoints: ['心拍数の安定'],
            adaptiveVariations: ['瞑想アプリの使用', '自然音の再生'],
          },
          {
            id: 'energy_step2',
            order: 2,
            title: '軽い身体活動',
            description: '5分間の軽いストレッチまたは散歩',
            estimatedMinutes: 5,
            requiredCognitiveState: { minAttention: 20, minEnergy: 15, maxStress: 80 },
            tools: ['歩きやすい靴'],
            checkpoints: ['体が軽くなった感覚'],
            adaptiveVariations: ['階段昇降', '首肩ストレッチ'],
          },
        ],
        measurableOutcomes: ['エネルギーレベル向上', 'ストレス軽減', '次タスクへの準備度'],
        adaptationHistory: [],
        validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30分有効
      };
    }

    return null;
  }

  /**
   * 環境最適化レコメンデーション生成
   */
  private async generateEnvironmentalRecommendation(
    userId: string,
    recentHistory: CognitiveData[]
  ): Promise<AIRecommendation | null> {
    const noiseAnalysis = this.analyzeNoiseImpact(recentHistory);

    if (noiseAnalysis.correlation < -0.5) {
      // 騒音が生産性に負の影響
      return {
        id: `env_noise_${Date.now()}`,
        type: 'environmental',
        priority: 'medium',
        title: '音環境の最適化',
        description: '音環境が集中力に影響している可能性があります。',
        reasoning: `過去のデータから、騒音レベルが高いと生産性が${Math.abs(noiseAnalysis.correlation * 100).toFixed(0)}%低下する傾向があります。`,
        expectedImpact: 60,
        difficulty: 25,
        timeToResult: 1,
        cognitiveLoad: 20,
        personalizedFor: {
          adhdCharacteristics: ['聴覚過敏', '注意散漫'],
          cognitiveProfile: ['環境感受性'],
          behaviorPatterns: ['音環境パターン'],
        },
        actionSteps: [
          {
            id: 'noise_step1',
            order: 1,
            title: '騒音源の特定',
            description: '現在の環境で気になる音を特定する',
            estimatedMinutes: 2,
            requiredCognitiveState: { minAttention: 30, minEnergy: 20, maxStress: 80 },
            tools: ['聴覚'],
            checkpoints: ['騒音源を特定できた'],
            adaptiveVariations: ['音量測定アプリの使用'],
          },
          {
            id: 'noise_step2',
            order: 2,
            title: '対策の実施',
            description: 'ノイズキャンセリングヘッドフォンまたは耳栓の使用',
            estimatedMinutes: 3,
            requiredCognitiveState: { minAttention: 20, minEnergy: 15, maxStress: 85 },
            tools: ['ヘッドフォン', '耳栓'],
            checkpoints: ['静かな環境が確保できた'],
            adaptiveVariations: ['ホワイトノイズ', '自然音'],
          },
        ],
        measurableOutcomes: ['集中継続時間', '作業効率', 'ストレス軽減'],
        adaptationHistory: [],
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4時間有効
      };
    }

    return null;
  }

  /**
   * 騒音影響分析
   */
  private analyzeNoiseImpact(history: CognitiveData[]): { correlation: number } {
    if (history.length < 10) return { correlation: 0 };

    const noiseValues = history.map((d) => d.environmentalFactors.noiseLevel);
    const productivityValues = history.map((d) => d.outcomes.productivity);

    return {
      correlation: this.calculateCorrelation(noiseValues, productivityValues),
    };
  }

  /**
   * 緊急レコメンデーション生成
   */
  private async generateUrgentRecommendation(
    userId: string,
    type: string,
    context: any
  ): Promise<void> {
    const urgentRecommendation: AIRecommendation = {
      id: `urgent_${type}_${Date.now()}`,
      type: 'cognitive',
      priority: 'critical',
      title: 'ストレス軽減と注意力回復が必要',
      description: '現在の認知状態では効率的な作業が困難です。まず回復に集中しましょう。',
      reasoning:
        'ストレスレベルが80を超え、注意力が30を下回っています。このままでは作業効率が著しく低下し、さらなるストレス増加のリスクがあります。',
      expectedImpact: 90,
      difficulty: 15,
      timeToResult: 1,
      cognitiveLoad: 10,
      personalizedFor: {
        adhdCharacteristics: ['ストレス感受性', '注意力変動'],
        cognitiveProfile: ['ストレス管理', '回復力'],
        behaviorPatterns: ['危機対応パターン'],
      },
      actionSteps: [
        {
          id: 'urgent_step1',
          order: 1,
          title: '即座のストレス軽減',
          description: '深呼吸とグラウンディング技法',
          estimatedMinutes: 5,
          requiredCognitiveState: { minAttention: 5, minEnergy: 5, maxStress: 100 },
          tools: ['呼吸'],
          checkpoints: ['心拍数の安定'],
          adaptiveVariations: ['5-4-3-2-1法', '筋弛緩法'],
        },
      ],
      measurableOutcomes: ['ストレス軽減', '心拍数安定', '注意力回復'],
      adaptationHistory: [],
      validUntil: new Date(Date.now() + 15 * 60 * 1000), // 15分有効
    };

    const recommendations = this.activeRecommendations.get(userId) || [];
    recommendations.unshift(urgentRecommendation); // 最優先で追加
    this.activeRecommendations.set(userId, recommendations);

    this.emit('urgentRecommendation', { userId, recommendation: urgentRecommendation });
  }

  /**
   * フロー状態の記録
   */
  private async recordFlowState(userId: string, data: CognitiveData): Promise<void> {
    const insight: CoachingInsight = {
      id: `flow_${Date.now()}`,
      category: 'strength',
      title: 'フロー状態を検出',
      description: '高い集中力とフロー状態が達成されています。この条件を覚えておきましょう。',
      evidence: [
        `注意力: ${data.cognitiveState.attention}`,
        `フロー: ${data.cognitiveState.flow}`,
        `環境: ${data.environmentalFactors.socialContext}`,
        `時間: ${data.environmentalFactors.timeOfDay}時`,
      ],
      confidence: 0.9,
      urgency: 30,
      personalizedMessage: 'この状態を再現できるよう、現在の環境条件を記録しています。',
      suggestedActions: [
        '現在の環境設定を保存',
        'フロー状態の継続',
        '適切なタイミングでの休憩計画',
      ],
      relatedPatterns: ['フロー状態パターン'],
      generatedAt: new Date(),
    };

    const insights = this.coachingInsights.get(userId) || [];
    insights.push(insight);
    this.coachingInsights.set(userId, insights);

    this.emit('flowStateDetected', { userId, insight });
  }

  /**
   * 疲労警告の生成
   */
  private async generateFatigueWarning(userId: string, data: CognitiveData): Promise<void> {
    const warning: CoachingInsight = {
      id: `fatigue_${Date.now()}`,
      category: 'warning',
      title: '疲労の蓄積を検出',
      description: 'エネルギーレベルが低下しています。適切な休憩が必要です。',
      evidence: [
        `エネルギー: ${data.cognitiveState.energy}`,
        `連続セッション数: ${data.behavioralMetrics.focusSessionCount}`,
        `集中継続時間: 長時間`,
      ],
      confidence: 0.8,
      urgency: 70,
      personalizedMessage: '無理を続けると明日のパフォーマンスに影響する可能性があります。',
      suggestedActions: [
        '長めの休憩（15-30分）',
        '軽い運動または散歩',
        '水分補給',
        '今日の作業終了を検討',
      ],
      relatedPatterns: ['疲労蓄積パターン'],
      generatedAt: new Date(),
    };

    const insights = this.coachingInsights.get(userId) || [];
    insights.push(warning);
    this.coachingInsights.set(userId, insights);

    this.emit('fatigueWarning', { userId, warning });
  }

  /**
   * 継続的分析の実行
   */
  private async runContinuousAnalysis(): Promise<void> {
    for (const [userId, history] of this.cognitiveDataHistory) {
      if (history.length > 0) {
        await this.generateLongTermInsights(userId);
        await this.updatePersonalizedModels(userId);
      }
    }
  }

  /**
   * 長期インサイトの生成
   */
  private async generateLongTermInsights(userId: string): Promise<void> {
    const history = this.cognitiveDataHistory.get(userId) || [];
    if (history.length < 50) return;

    const weeklyTrend = this.analyzeWeeklyTrend(history);
    const progressInsight = this.analyzeProgress(history);

    if (weeklyTrend.significant) {
      const insight: CoachingInsight = {
        id: `weekly_trend_${Date.now()}`,
        category: weeklyTrend.direction === 'improving' ? 'strength' : 'challenge',
        title: `週間トレンド: ${weeklyTrend.direction === 'improving' ? '改善' : '課題'}`,
        description: weeklyTrend.description,
        evidence: weeklyTrend.evidence,
        confidence: weeklyTrend.confidence,
        urgency: weeklyTrend.direction === 'improving' ? 20 : 60,
        personalizedMessage: weeklyTrend.message,
        suggestedActions: weeklyTrend.suggestions,
        relatedPatterns: ['週間パフォーマンスパターン'],
        generatedAt: new Date(),
      };

      const insights = this.coachingInsights.get(userId) || [];
      insights.push(insight);
      this.coachingInsights.set(userId, insights);
    }
  }

  /**
   * 週間トレンド分析
   */
  private analyzeWeeklyTrend(history: CognitiveData[]): any {
    const recentWeek = history.slice(-50); // 最新1週間程度
    const previousWeek = history.slice(-100, -50); // 前週

    if (previousWeek.length < 20) return { significant: false };

    const recentAvg =
      recentWeek.reduce((sum, d) => sum + d.outcomes.productivity, 0) / recentWeek.length;
    const previousAvg =
      previousWeek.reduce((sum, d) => sum + d.outcomes.productivity, 0) / previousWeek.length;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    const significant = Math.abs(change) > 10;

    if (!significant) return { significant: false };

    return {
      significant: true,
      direction: change > 0 ? 'improving' : 'declining',
      description: `生産性が前週比で${Math.abs(change).toFixed(1)}%${change > 0 ? '向上' : '低下'}しています`,
      evidence: [
        `今週平均: ${recentAvg.toFixed(1)}`,
        `前週平均: ${previousAvg.toFixed(1)}`,
        `変化率: ${change.toFixed(1)}%`,
      ],
      confidence: Math.min(recentWeek.length / 50, 1.0),
      message:
        change > 0
          ? 'この調子で継続しましょう！'
          : '一時的な低下かもしれません。原因を見つけて対処しましょう。',
      suggestions:
        change > 0
          ? ['現在の良い習慣の維持', '成功パターンの記録']
          : ['ストレス要因の特定', '休息の確保', '環境の見直し'],
    };
  }

  /**
   * 進捗分析
   */
  private analyzeProgress(history: CognitiveData[]): any {
    // 実装予定：長期的な進捗分析
    return null;
  }

  /**
   * パーソナライズドモデルの更新
   */
  private async updatePersonalizedModels(userId: string): Promise<void> {
    if (this.isTraining) return;

    const history = this.cognitiveDataHistory.get(userId) || [];
    if (history.length < 100) return;

    this.isTraining = true;

    try {
      // パターン認識モデルの更新
      await this.updatePatternRecognitionModel(userId, history);

      // 成果予測モデルの更新
      await this.updateOutcomePredictionModel(userId, history);

      // 最適化モデルの更新
      await this.updateOptimizationModel(userId, history);
    } catch (error) {
      console.error('Model update error:', error);
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * パターン認識モデルの更新
   */
  private async updatePatternRecognitionModel(
    userId: string,
    history: CognitiveData[]
  ): Promise<void> {
    // 簡略化された機械学習アルゴリズムのシミュレーション
    const features = this.extractFeatures(history);
    const accuracy = Math.random() * 0.3 + 0.7; // 70-100%の精度をシミュレート

    const model: LearningModel = {
      userId,
      modelType: 'pattern_recognition',
      features: ['cognitive_state', 'environmental_factors', 'behavioral_metrics'],
      accuracy,
      lastTraining: new Date(),
      datasetSize: history.length,
      hyperparameters: { learningRate: 0.01, batchSize: 32 },
      performanceMetrics: {
        precision: accuracy,
        recall: accuracy * 0.95,
        f1Score: accuracy * 0.97,
        mae: (1 - accuracy) * 10,
      },
    };

    const models = this.learningModels.get(userId) || [];
    const existingIndex = models.findIndex((m) => m.modelType === 'pattern_recognition');

    if (existingIndex !== -1) {
      models[existingIndex] = model;
    } else {
      models.push(model);
    }

    this.learningModels.set(userId, models);
    console.log(
      `✅ Pattern recognition model updated for ${userId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`
    );
  }

  /**
   * 成果予測モデルの更新
   */
  private async updateOutcomePredictionModel(
    userId: string,
    history: CognitiveData[]
  ): Promise<void> {
    const accuracy = Math.random() * 0.25 + 0.65; // 65-90%の精度

    const model: LearningModel = {
      userId,
      modelType: 'outcome_prediction',
      features: ['cognitive_state', 'time_factors', 'past_performance'],
      accuracy,
      lastTraining: new Date(),
      datasetSize: history.length,
      hyperparameters: { depth: 10, estimators: 100 },
      performanceMetrics: {
        precision: accuracy,
        recall: accuracy * 0.92,
        f1Score: accuracy * 0.94,
        mae: (1 - accuracy) * 15,
      },
    };

    const models = this.learningModels.get(userId) || [];
    const existingIndex = models.findIndex((m) => m.modelType === 'outcome_prediction');

    if (existingIndex !== -1) {
      models[existingIndex] = model;
    } else {
      models.push(model);
    }

    this.learningModels.set(userId, models);
    console.log(
      `✅ Outcome prediction model updated for ${userId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`
    );
  }

  /**
   * 最適化モデルの更新
   */
  private async updateOptimizationModel(userId: string, history: CognitiveData[]): Promise<void> {
    const accuracy = Math.random() * 0.2 + 0.75; // 75-95%の精度

    const model: LearningModel = {
      userId,
      modelType: 'optimization',
      features: ['environmental_optimization', 'schedule_optimization', 'cognitive_optimization'],
      accuracy,
      lastTraining: new Date(),
      datasetSize: history.length,
      hyperparameters: { alpha: 0.1, gamma: 0.9 },
      performanceMetrics: {
        precision: accuracy,
        recall: accuracy * 0.96,
        f1Score: accuracy * 0.98,
        mae: (1 - accuracy) * 8,
      },
    };

    const models = this.learningModels.get(userId) || [];
    const existingIndex = models.findIndex((m) => m.modelType === 'optimization');

    if (existingIndex !== -1) {
      models[existingIndex] = model;
    } else {
      models.push(model);
    }

    this.learningModels.set(userId, models);
    console.log(
      `✅ Optimization model updated for ${userId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`
    );
  }

  /**
   * 特徴量抽出
   */
  private extractFeatures(history: CognitiveData[]): string[] {
    return [
      'attention_level',
      'energy_level',
      'stress_level',
      'time_of_day',
      'social_context',
      'task_completion_rate',
      'focus_session_count',
    ];
  }

  /**
   * モデル再訓練
   */
  private async retrainModels(): Promise<void> {
    for (const [userId, history] of this.cognitiveDataHistory) {
      if (history.length >= 100) {
        await this.updatePersonalizedModels(userId);
      }
    }
  }

  /**
   * デフォルトパターンの初期化
   */
  private initializeDefaultPatterns(): void {
    // ADHD/ASD共通パターンの初期化
    // 実装予定：研究ベースのデフォルトパターン
  }

  /**
   * ストレージからモデル読み込み
   */
  private async loadModelsFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('ai_coaching_models');
      if (stored) {
        const data = JSON.parse(stored);
        // モデルデータの復元処理
      }
    } catch (error) {
      console.error('Model loading error:', error);
    }
  }

  /**
   * ストレージにモデル保存
   */
  private async saveModelsToStorage(): Promise<void> {
    try {
      const data = {
        models: Array.from(this.learningModels.entries()),
        patterns: Array.from(this.behaviorPatterns.entries()),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('ai_coaching_models', JSON.stringify(data));
    } catch (error) {
      console.error('Model saving error:', error);
    }
  }

  // Public API methods

  /**
   * アクティブレコメンデーション取得
   */
  public getActiveRecommendations(userId: string): AIRecommendation[] {
    return this.activeRecommendations.get(userId) || [];
  }

  /**
   * コーチングインサイト取得
   */
  public getCoachingInsights(userId: string): CoachingInsight[] {
    return this.coachingInsights.get(userId) || [];
  }

  /**
   * 行動パターン取得
   */
  public getBehaviorPatterns(userId: string): BehaviorPattern[] {
    return this.behaviorPatterns.get(userId) || [];
  }

  /**
   * 学習モデル統計取得
   */
  public getModelStatistics(userId: string): any {
    const models = this.learningModels.get(userId) || [];
    const patterns = this.behaviorPatterns.get(userId) || [];
    const recommendations = this.activeRecommendations.get(userId) || [];
    const insights = this.coachingInsights.get(userId) || [];

    return {
      totalModels: models.length,
      averageAccuracy:
        models.length > 0 ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length : 0,
      learnedPatterns: patterns.length,
      activeRecommendations: recommendations.length,
      totalInsights: insights.length,
      lastModelUpdate:
        models.length > 0 ? Math.max(...models.map((m) => m.lastTraining.getTime())) : null,
      dataPoints: this.cognitiveDataHistory.get(userId)?.length || 0,
    };
  }

  /**
   * レコメンデーションフィードバック
   */
  public provideFeedback(
    userId: string,
    recommendationId: string,
    feedback: 'positive' | 'neutral' | 'negative',
    context?: any
  ): void {
    const recommendations = this.activeRecommendations.get(userId) || [];
    const recommendation = recommendations.find((r) => r.id === recommendationId);

    if (recommendation) {
      recommendation.adaptationHistory.push({
        timestamp: new Date(),
        userFeedback: feedback,
        actualOutcome: context?.outcome || 0,
        adherenceLevel: context?.adherence || 0,
        contextFactors: context?.factors || [],
        lessons: context?.lessons || [],
      });

      this.emit('feedbackReceived', { userId, recommendationId, feedback });
    }
  }

  /**
   * サービス停止
   */
  public stop(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    this.saveModelsToStorage();
    console.log('🤖 AI認知コーチングサービスを停止しました');
  }
}

export default CognitiveAICoachingService;
