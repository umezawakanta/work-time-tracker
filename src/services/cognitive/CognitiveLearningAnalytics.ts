/**
 * 🧠 認知学習データ分析システム
 * タスク完了パターン分析・認知負荷推定・最適化推奨・ADHD/ASD特性学習
 */

import { EventEmitter } from 'eventemitter3';

// 学習データの基本構造
export interface LearningDataPoint {
  id: string;
  timestamp: Date;
  userId: string;

  // タスク情報
  task: {
    id: string;
    type: 'cognitive' | 'routine' | 'creative' | 'analytical' | 'social';
    complexity: number; // 1-10
    duration: number; // 実際の所要時間（分）
    estimatedDuration: number; // 予想所要時間（分）
    completed: boolean;
    interruptions: number;
    retryCount: number;
  };

  // 認知状態
  cognitiveState: {
    energyLevel: number; // 1-10
    focusLevel: number; // 1-10
    stressLevel: number; // 1-10
    motivationLevel: number; // 1-10
    confidenceLevel: number; // 1-10
  };

  // 環境要因
  environment: {
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    noiseLevel: number; // 1-10
    distractions: string[];
    location: 'home' | 'office' | 'public' | 'other';
  };

  // パフォーマンス指標
  performance: {
    accuracy: number; // 0-1
    efficiency: number; // 0-1 (計画時間/実際時間)
    satisfaction: number; // 1-10
    cognitiveLoad: number; // 1-10
  };

  // ADHD/ASD特性関連
  adhdFactors: {
    hyperactivity: number; // 1-10
    inattention: number; // 1-10
    impulsivity: number; // 1-10
    sensoryOverload: number; // 1-10
    executiveFunction: number; // 1-10
  };
}

// 学習パターン
export interface LearningPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // 0-1
  confidence: number; // 0-1

  // パターンの特徴
  characteristics: {
    optimalTimeOfDay: number[];
    preferredTaskTypes: string[];
    averageDuration: number;
    optimalEnergyLevel: number;
    triggerFactors: string[];
    inhibitingFactors: string[];
  };

  // ADHD/ASD関連
  adhdRelevance: {
    hyperactivityImpact: number; // -1 to 1
    attentionImpact: number; // -1 to 1
    impulsivityImpact: number; // -1 to 1
    sensoryImpact: number; // -1 to 1
  };
}

// 認知負荷予測
export interface CognitiveLoadPrediction {
  taskId: string;
  predictedLoad: number; // 1-10
  confidence: number; // 0-1
  factors: {
    taskComplexity: number;
    currentEnergyLevel: number;
    environmentalFactors: number;
    personalHistory: number;
    adhdFactors: number;
  };
  recommendations: string[];
}

// 最適化推奨
export interface OptimizationRecommendation {
  id: string;
  type: 'timing' | 'environment' | 'task-modification' | 'break-schedule' | 'energy-management';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  implementation: string;
  expectedImprovement: {
    efficiency: number; // %改善
    satisfaction: number; // %改善
    cognitiveLoad: number; // %軽減
  };
  adhdSpecific: boolean;
  personalizedReason: string;
}

// 認知プロファイル
export interface CognitiveProfile {
  userId: string;
  lastUpdated: Date;

  // 基本特性
  traits: {
    adhdType: 'inattentive' | 'hyperactive' | 'combined' | 'none';
    asdLevel: 'none' | 'mild' | 'moderate' | 'high';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    processingSpeed: 'slow' | 'average' | 'fast';
  };

  // パフォーマンスパターン
  patterns: {
    peakPerformanceHours: number[];
    lowEnergyHours: number[];
    optimalTaskDuration: number;
    maxFocusTime: number;
    requiredBreakInterval: number;
  };

  // 最適化要因
  optimizationFactors: {
    environmentalSensitivity: number; // 1-10
    routineImportance: number; // 1-10
    noveltyPreference: number; // 1-10
    socialPreference: number; // 1-10
    structureNeed: number; // 1-10
  };
}

class CognitiveLearningAnalytics extends EventEmitter {
  private static instance: CognitiveLearningAnalytics | null = null;
  private learningData: LearningDataPoint[] = [];
  private patterns: LearningPattern[] = [];
  private profiles: Map<string, CognitiveProfile> = new Map();
  private isAnalyzing: boolean = false;

  private constructor() {
    super();
    this.initializeAnalytics();
    console.log('🧠 Cognitive Learning Analytics initialized');
  }

  static getInstance(): CognitiveLearningAnalytics {
    if (!CognitiveLearningAnalytics.instance) {
      CognitiveLearningAnalytics.instance = new CognitiveLearningAnalytics();
    }
    return CognitiveLearningAnalytics.instance;
  }

  /**
   * 分析システムの初期化
   */
  private initializeAnalytics(): void {
    // サンプルデータの生成（実際の実装では永続化されたデータを読み込み）
    this.generateSampleData();

    // 定期的なパターン分析の開始
    this.startPeriodicAnalysis();
  }

  /**
   * サンプルデータの生成
   */
  private generateSampleData(): void {
    const now = new Date();
    const sampleUserId = 'demo-user';

    // 過去30日分のサンプル学習データを生成
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const energyLevel = Math.floor(Math.random() * 10) + 1;
      const taskComplexity = Math.floor(Math.random() * 10) + 1;

      const sampleData: LearningDataPoint = {
        id: `learning-${i}`,
        timestamp,
        userId: sampleUserId,

        task: {
          id: `task-${i}`,
          type: ['cognitive', 'routine', 'creative', 'analytical', 'social'][
            Math.floor(Math.random() * 5)
          ] as any,
          complexity: taskComplexity,
          duration: 15 + Math.random() * 120, // 15-135分
          estimatedDuration: 20 + Math.random() * 100,
          completed: Math.random() > 0.2, // 80%完了率
          interruptions: Math.floor(Math.random() * 5),
          retryCount: Math.floor(Math.random() * 3),
        },

        cognitiveState: {
          energyLevel,
          focusLevel: Math.max(1, energyLevel + Math.random() * 4 - 2),
          stressLevel: Math.floor(Math.random() * 10) + 1,
          motivationLevel: Math.floor(Math.random() * 10) + 1,
          confidenceLevel: Math.floor(Math.random() * 10) + 1,
        },

        environment: {
          timeOfDay: timestamp.getHours(),
          dayOfWeek: timestamp.getDay(),
          noiseLevel: Math.floor(Math.random() * 10) + 1,
          distractions: ['phone', 'email', 'people', 'noise'].filter(() => Math.random() > 0.7),
          location: ['home', 'office', 'public', 'other'][Math.floor(Math.random() * 4)] as any,
        },

        performance: {
          accuracy: 0.6 + Math.random() * 0.4,
          efficiency: Math.max(0.3, (20 + Math.random() * 100) / (15 + Math.random() * 120)),
          satisfaction: Math.floor(Math.random() * 10) + 1,
          cognitiveLoad: Math.max(1, taskComplexity + Math.random() * 4 - 2),
        },

        adhdFactors: {
          hyperactivity: Math.floor(Math.random() * 10) + 1,
          inattention: Math.floor(Math.random() * 10) + 1,
          impulsivity: Math.floor(Math.random() * 10) + 1,
          sensoryOverload: Math.floor(Math.random() * 10) + 1,
          executiveFunction: Math.floor(Math.random() * 10) + 1,
        },
      };

      this.learningData.push(sampleData);
    }

    console.log('🧠 Sample learning data generated:', this.learningData.length, 'data points');
  }

  /**
   * 定期的なパターン分析の開始
   */
  private startPeriodicAnalysis(): void {
    // 1時間ごとにパターンを再分析
    setInterval(
      () => {
        this.analyzePatterns();
      },
      60 * 60 * 1000
    );

    // 初回分析
    setTimeout(() => {
      this.analyzePatterns();
    }, 2000);
  }

  /**
   * 学習データの追加
   */
  public addLearningData(data: LearningDataPoint): void {
    this.learningData.push(data);

    // 最新1000件のみ保持
    if (this.learningData.length > 1000) {
      this.learningData = this.learningData.slice(-1000);
    }

    this.emit('dataAdded', data);

    // リアルタイム分析
    this.analyzeRecentPattern(data);
  }

  /**
   * パターン分析の実行
   */
  public async analyzePatterns(): Promise<void> {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;

    try {
      // 時間帯別パフォーマンス分析
      const timePatterns = this.analyzeTimePatterns();

      // タスクタイプ別分析
      const taskTypePatterns = this.analyzeTaskTypePatterns();

      // ADHD特性関連分析
      const adhdPatterns = this.analyzeADHDPatterns();

      // 環境要因分析
      const environmentPatterns = this.analyzeEnvironmentPatterns();

      this.patterns = [
        ...timePatterns,
        ...taskTypePatterns,
        ...adhdPatterns,
        ...environmentPatterns,
      ];

      this.emit('patternsAnalyzed', this.patterns);

      console.log('🧠 Pattern analysis completed:', this.patterns.length, 'patterns found');
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * 時間帯別パフォーマンス分析
   */
  private analyzeTimePatterns(): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // 時間帯別の効率分析
    const hourlyData: { [hour: number]: LearningDataPoint[] } = {};

    this.learningData.forEach((data) => {
      const hour = data.environment.timeOfDay;
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(data);
    });

    // 各時間帯の平均効率を計算
    Object.entries(hourlyData).forEach(([hourStr, dataPoints]) => {
      const hour = parseInt(hourStr);
      if (dataPoints.length < 5) return; // 最低5件のデータが必要

      const avgEfficiency =
        dataPoints.reduce((sum, d) => sum + d.performance.efficiency, 0) / dataPoints.length;
      const avgSatisfaction =
        dataPoints.reduce((sum, d) => sum + d.performance.satisfaction, 0) / dataPoints.length;
      const avgCognitiveLoad =
        dataPoints.reduce((sum, d) => sum + d.performance.cognitiveLoad, 0) / dataPoints.length;

      if (avgEfficiency > 0.7) {
        // 効率が70%以上の時間帯
        patterns.push({
          id: `time-pattern-${hour}`,
          name: `${hour}時台の高効率パターン`,
          description: `${hour}時台は平均効率${(avgEfficiency * 100).toFixed(1)}%の高パフォーマンス時間帯`,
          frequency: dataPoints.length / this.learningData.length,
          confidence: Math.min(0.9, dataPoints.length / 20),

          characteristics: {
            optimalTimeOfDay: [hour],
            preferredTaskTypes: this.getTopTaskTypes(dataPoints),
            averageDuration:
              dataPoints.reduce((sum, d) => sum + d.task.duration, 0) / dataPoints.length,
            optimalEnergyLevel:
              dataPoints.reduce((sum, d) => sum + d.cognitiveState.energyLevel, 0) /
              dataPoints.length,
            triggerFactors: ['optimal-time', 'high-energy'],
            inhibitingFactors: ['low-energy', 'distractions'],
          },

          adhdRelevance: {
            hyperactivityImpact: 0,
            attentionImpact: avgEfficiency > 0.8 ? 0.5 : 0.2,
            impulsivityImpact: 0,
            sensoryImpact: avgCognitiveLoad < 5 ? 0.3 : -0.1,
          },
        });
      }
    });

    return patterns;
  }

  /**
   * タスクタイプ別分析
   */
  private analyzeTaskTypePatterns(): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    const taskTypeData: { [type: string]: LearningDataPoint[] } = {};

    this.learningData.forEach((data) => {
      const type = data.task.type;
      if (!taskTypeData[type]) {
        taskTypeData[type] = [];
      }
      taskTypeData[type].push(data);
    });

    Object.entries(taskTypeData).forEach(([type, dataPoints]) => {
      if (dataPoints.length < 10) return;

      const avgAccuracy =
        dataPoints.reduce((sum, d) => sum + d.performance.accuracy, 0) / dataPoints.length;
      const avgSatisfaction =
        dataPoints.reduce((sum, d) => sum + d.performance.satisfaction, 0) / dataPoints.length;
      const completionRate = dataPoints.filter((d) => d.task.completed).length / dataPoints.length;

      if (completionRate > 0.8 && avgAccuracy > 0.7) {
        patterns.push({
          id: `task-type-${type}`,
          name: `${type}タスクの得意パターン`,
          description: `${type}タスクで高い完了率${(completionRate * 100).toFixed(1)}%と精度${(avgAccuracy * 100).toFixed(1)}%を達成`,
          frequency: dataPoints.length / this.learningData.length,
          confidence: Math.min(0.9, dataPoints.length / 30),

          characteristics: {
            optimalTimeOfDay: this.getOptimalHours(dataPoints),
            preferredTaskTypes: [type],
            averageDuration:
              dataPoints.reduce((sum, d) => sum + d.task.duration, 0) / dataPoints.length,
            optimalEnergyLevel:
              dataPoints.reduce((sum, d) => sum + d.cognitiveState.energyLevel, 0) /
              dataPoints.length,
            triggerFactors: ['task-type-match', 'skill-confidence'],
            inhibitingFactors: ['task-mismatch', 'low-motivation'],
          },

          adhdRelevance: {
            hyperactivityImpact: type === 'routine' ? -0.3 : 0.1,
            attentionImpact: type === 'creative' ? 0.4 : type === 'analytical' ? -0.2 : 0,
            impulsivityImpact: type === 'creative' ? 0.3 : -0.1,
            sensoryImpact: type === 'social' ? -0.2 : 0.1,
          },
        });
      }
    });

    return patterns;
  }

  /**
   * ADHD特性関連分析
   */
  private analyzeADHDPatterns(): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // 注意力レベル別分析
    const highAttentionData = this.learningData.filter(
      (d) => d.adhdFactors.inattention <= 3 && d.cognitiveState.focusLevel >= 7
    );

    if (highAttentionData.length >= 10) {
      const avgPerformance =
        highAttentionData.reduce((sum, d) => sum + d.performance.efficiency, 0) /
        highAttentionData.length;

      patterns.push({
        id: 'adhd-high-attention',
        name: '高集中力状態パターン',
        description: `低注意散漫・高集中状態で${(avgPerformance * 100).toFixed(1)}%の効率を達成`,
        frequency: highAttentionData.length / this.learningData.length,
        confidence: Math.min(0.9, highAttentionData.length / 25),

        characteristics: {
          optimalTimeOfDay: this.getOptimalHours(highAttentionData),
          preferredTaskTypes: this.getTopTaskTypes(highAttentionData),
          averageDuration:
            highAttentionData.reduce((sum, d) => sum + d.task.duration, 0) /
            highAttentionData.length,
          optimalEnergyLevel:
            highAttentionData.reduce((sum, d) => sum + d.cognitiveState.energyLevel, 0) /
            highAttentionData.length,
          triggerFactors: ['low-distraction', 'high-energy', 'clear-structure'],
          inhibitingFactors: ['noise', 'interruptions', 'complex-instructions'],
        },

        adhdRelevance: {
          hyperactivityImpact: 0.1,
          attentionImpact: 0.8,
          impulsivityImpact: -0.3,
          sensoryImpact: 0.4,
        },
      });
    }

    return patterns;
  }

  /**
   * 環境要因分析
   */
  private analyzeEnvironmentPatterns(): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // 静かな環境での分析
    const quietEnvironmentData = this.learningData.filter(
      (d) => d.environment.noiseLevel <= 3 && d.environment.distractions.length === 0
    );

    if (quietEnvironmentData.length >= 10) {
      const avgEfficiency =
        quietEnvironmentData.reduce((sum, d) => sum + d.performance.efficiency, 0) /
        quietEnvironmentData.length;
      const avgSatisfaction =
        quietEnvironmentData.reduce((sum, d) => sum + d.performance.satisfaction, 0) /
        quietEnvironmentData.length;

      patterns.push({
        id: 'quiet-environment',
        name: '静かな環境での高効率パターン',
        description: `静かな環境で効率${(avgEfficiency * 100).toFixed(1)}%、満足度${avgSatisfaction.toFixed(1)}/10を達成`,
        frequency: quietEnvironmentData.length / this.learningData.length,
        confidence: Math.min(0.9, quietEnvironmentData.length / 20),

        characteristics: {
          optimalTimeOfDay: this.getOptimalHours(quietEnvironmentData),
          preferredTaskTypes: this.getTopTaskTypes(quietEnvironmentData),
          averageDuration:
            quietEnvironmentData.reduce((sum, d) => sum + d.task.duration, 0) /
            quietEnvironmentData.length,
          optimalEnergyLevel:
            quietEnvironmentData.reduce((sum, d) => sum + d.cognitiveState.energyLevel, 0) /
            quietEnvironmentData.length,
          triggerFactors: ['quiet-environment', 'minimal-distractions'],
          inhibitingFactors: ['noise', 'interruptions', 'chaos'],
        },

        adhdRelevance: {
          hyperactivityImpact: -0.1,
          attentionImpact: 0.6,
          impulsivityImpact: -0.2,
          sensoryImpact: 0.7,
        },
      });
    }

    return patterns;
  }

  /**
   * 認知負荷予測
   */
  public predictCognitiveLoad(
    taskComplexity: number,
    currentState: any,
    environment: any,
    userId: string
  ): CognitiveLoadPrediction {
    const userProfile = this.profiles.get(userId);
    const relevantData = this.learningData.filter((d) => d.userId === userId);

    // 基本認知負荷計算
    let baseLoad = taskComplexity;

    // エネルギーレベルによる調整
    const energyFactor = Math.max(0.5, (10 - currentState.energyLevel) / 10);
    baseLoad *= energyFactor;

    // 環境要因による調整
    const noiseFactor = 1 + (environment.noiseLevel - 5) / 20;
    const distractionFactor = 1 + environment.distractions.length * 0.1;
    baseLoad *= noiseFactor * distractionFactor;

    // 時間帯による調整
    const timeOptimal = userProfile
      ? userProfile.patterns.peakPerformanceHours.includes(environment.timeOfDay)
      : [9, 10, 11, 14, 15, 16].includes(environment.timeOfDay);

    if (timeOptimal) {
      baseLoad *= 0.8;
    } else {
      baseLoad *= 1.2;
    }

    // ADHD要因による調整
    if (currentState.adhdFactors) {
      const adhdImpact =
        (currentState.adhdFactors.inattention +
          currentState.adhdFactors.sensoryOverload +
          (10 - currentState.adhdFactors.executiveFunction)) /
        30;
      baseLoad *= 1 + adhdImpact * 0.5;
    }

    const finalLoad = Math.min(10, Math.max(1, baseLoad));

    // 推奨事項の生成
    const recommendations: string[] = [];

    if (finalLoad > 7) {
      recommendations.push('タスクを小さな部分に分割することを推奨');
      recommendations.push('静かな環境での作業を推奨');
      recommendations.push('十分な休憩を取ってから開始することを推奨');
    }

    if (currentState.energyLevel < 5) {
      recommendations.push('エネルギー回復後の実行を推奨');
    }

    if (environment.distractions.length > 2) {
      recommendations.push('気を散らす要因を除去することを推奨');
    }

    return {
      taskId: `task-${Date.now()}`,
      predictedLoad: finalLoad,
      confidence: Math.min(0.9, relevantData.length / 50),
      factors: {
        taskComplexity: taskComplexity / 10,
        currentEnergyLevel: (10 - currentState.energyLevel) / 10,
        environmentalFactors: noiseFactor * distractionFactor - 1,
        personalHistory: userProfile ? 0.8 : 0.3,
        adhdFactors: currentState.adhdFactors
          ? (currentState.adhdFactors.inattention + currentState.adhdFactors.sensoryOverload) / 20
          : 0,
      },
      recommendations,
    };
  }

  /**
   * 最適化推奨の生成
   */
  public generateOptimizationRecommendations(userId: string): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const userPatterns = this.patterns;
    const userData = this.learningData.filter((d) => d.userId === userId);

    if (userData.length < 10) {
      return [
        {
          id: 'insufficient-data',
          type: 'timing',
          priority: 'low',
          title: 'データ収集継続',
          description: 'より正確な推奨のため、さらなるデータ収集が必要です',
          impact: 'データが蓄積されることで、個人化された推奨が可能になります',
          implementation: '日常的なタスク実行時にデータを記録し続けてください',
          expectedImprovement: { efficiency: 0, satisfaction: 0, cognitiveLoad: 0 },
          adhdSpecific: false,
          personalizedReason: 'データが不足しているため、一般的な推奨のみ提供可能',
        },
      ];
    }

    // 時間帯最適化推奨
    const timePattern = userPatterns.find((p) => p.id.includes('time-pattern'));
    if (timePattern) {
      recommendations.push({
        id: 'timing-optimization',
        type: 'timing',
        priority: 'high',
        title: '最適時間帯の活用',
        description: `${timePattern.characteristics.optimalTimeOfDay[0]}時台での重要タスク実行`,
        impact: `効率を${(timePattern.confidence * 30 + 10).toFixed(0)}%向上`,
        implementation: '重要で集中力を要するタスクをピーク時間帯にスケジュール',
        expectedImprovement: {
          efficiency: timePattern.confidence * 30 + 10,
          satisfaction: timePattern.confidence * 20 + 5,
          cognitiveLoad: -(timePattern.confidence * 15) - 5,
        },
        adhdSpecific: true,
        personalizedReason: 'あなたの学習データから特定されたピークパフォーマンス時間帯です',
      });
    }

    // 環境最適化推奨
    const environmentPattern = userPatterns.find((p) => p.id === 'quiet-environment');
    if (environmentPattern) {
      recommendations.push({
        id: 'environment-optimization',
        type: 'environment',
        priority: 'high',
        title: '静かな環境の確保',
        description: 'ノイズレベル3以下、気を散らす要因のない環境での作業',
        impact: `認知負荷を${(environmentPattern.adhdRelevance.sensoryImpact * 20).toFixed(0)}%軽減`,
        implementation: 'ノイズキャンセリングヘッドフォン使用、通知オフ、整理された作業スペース',
        expectedImprovement: {
          efficiency: 15,
          satisfaction: 20,
          cognitiveLoad: -25,
        },
        adhdSpecific: true,
        personalizedReason: 'ADHD特性による感覚過敏への配慮として特に重要です',
      });
    }

    // タスク修正推奨
    const lowPerformanceTasks = userData.filter((d) => d.performance.efficiency < 0.5);
    if (lowPerformanceTasks.length > userData.length * 0.3) {
      recommendations.push({
        id: 'task-modification',
        type: 'task-modification',
        priority: 'medium',
        title: 'タスク分割と構造化',
        description: '大きなタスクを25分間の小さな単位に分割',
        impact: '完了率を40%向上、ストレスを30%軽減',
        implementation: 'ポモドーロテクニック活用、チェックリスト作成、進捗可視化',
        expectedImprovement: {
          efficiency: 40,
          satisfaction: 25,
          cognitiveLoad: -30,
        },
        adhdSpecific: true,
        personalizedReason: '実行機能の特性に配慮したタスク管理手法です',
      });
    }

    // エネルギー管理推奨
    const lowEnergyData = userData.filter((d) => d.cognitiveState.energyLevel <= 4);
    if (lowEnergyData.length > userData.length * 0.4) {
      recommendations.push({
        id: 'energy-management',
        type: 'energy-management',
        priority: 'high',
        title: 'エネルギー管理の改善',
        description: '規則的な休憩とエネルギー回復活動の実践',
        impact: 'エネルギーレベルを平均2ポイント向上',
        implementation: '90分作業 + 15分休憩サイクル、軽い運動、瞑想、水分補給',
        expectedImprovement: {
          efficiency: 30,
          satisfaction: 35,
          cognitiveLoad: -20,
        },
        adhdSpecific: true,
        personalizedReason: 'ADHD特性による疲労しやすさへの対策です',
      });
    }

    return recommendations;
  }

  /**
   * 最近のパターン分析
   */
  private analyzeRecentPattern(data: LearningDataPoint): void {
    // リアルタイム適応ロジック
    const recentData = this.learningData.slice(-10);

    // 急激なパフォーマンス変化の検出
    if (recentData.length >= 5) {
      const recentAvgEfficiency =
        recentData.reduce((sum, d) => sum + d.performance.efficiency, 0) / recentData.length;
      const overallAvgEfficiency =
        this.learningData.reduce((sum, d) => sum + d.performance.efficiency, 0) /
        this.learningData.length;

      if (recentAvgEfficiency < overallAvgEfficiency * 0.7) {
        this.emit('performanceAlert', {
          type: 'efficiency-drop',
          message: '最近のパフォーマンス低下が検出されました',
          recommendation: 'エネルギー管理や環境調整の見直しを推奨します',
        });
      }
    }
  }

  /**
   * ヘルパーメソッド: トップタスクタイプの取得
   */
  private getTopTaskTypes(data: LearningDataPoint[]): string[] {
    const taskTypeCounts: { [type: string]: number } = {};

    data.forEach((d) => {
      taskTypeCounts[d.task.type] = (taskTypeCounts[d.task.type] || 0) + 1;
    });

    return Object.entries(taskTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  /**
   * ヘルパーメソッド: 最適時間の取得
   */
  private getOptimalHours(data: LearningDataPoint[]): number[] {
    const hourlyEfficiency: { [hour: number]: number[] } = {};

    data.forEach((d) => {
      const hour = d.environment.timeOfDay;
      if (!hourlyEfficiency[hour]) {
        hourlyEfficiency[hour] = [];
      }
      hourlyEfficiency[hour].push(d.performance.efficiency);
    });

    return Object.entries(hourlyEfficiency)
      .map(([hourStr, efficiencies]) => ({
        hour: parseInt(hourStr),
        avgEfficiency: efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length,
      }))
      .filter(({ avgEfficiency }) => avgEfficiency > 0.7)
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency)
      .slice(0, 4)
      .map(({ hour }) => hour);
  }

  /**
   * ダッシュボードデータの取得
   */
  public getDashboardData(userId: string) {
    const userData = this.learningData.filter((d) => d.userId === userId);
    const userPatterns = this.patterns;
    const recommendations = this.generateOptimizationRecommendations(userId);

    return {
      totalDataPoints: userData.length,
      patterns: userPatterns,
      recommendations,
      recentPerformance: userData.slice(-10),
      cognitiveProfile: this.profiles.get(userId),
      isAnalyzing: this.isAnalyzing,
    };
  }
}

export const cognitiveLearningAnalytics = CognitiveLearningAnalytics.getInstance();
export default cognitiveLearningAnalytics;
