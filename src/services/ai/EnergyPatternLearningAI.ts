import { EventEmitter } from 'events';

// 行動データポイント型
interface BehaviorDataPoint {
  timestamp: Date;
  hour: number;
  dayOfWeek: number;

  // 主観的データ
  reportedEnergyLevel: number; // 1-10
  reportedFocusLevel: number; // 1-10
  reportedMoodLevel: number; // 1-10
  reportedStressLevel: number; // 1-10

  // 客観的データ
  taskCompletionRate: number; // 0-1
  avgTaskDuration: number; // minutes
  breakFrequency: number; // breaks per hour
  interactionResponseTime: number; // milliseconds

  // 環境データ
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temperature: number; // celsius
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  location: 'home' | 'office' | 'cafe' | 'other';
  socialContext: 'alone' | 'with-family' | 'with-colleagues' | 'in-meeting';

  // 生活データ
  sleepQuality: number; // 1-10
  sleepDuration: number; // hours
  exerciseToday: boolean;
  caffeineIntake: number; // cups
  mealTiming: number; // hours since last meal

  // ADHDイベント
  distractionCount: number;
  hyperfocusEpisode: boolean;
  impulsiveActions: number;
  sensoryOverload: boolean;

  // メタデータ
  dataQuality: number; // 0-1 (confidence in this data point)
  userVerified: boolean;
}

// 学習モデル型
interface EnergyPredictionModel {
  id: string;
  version: number;
  lastTrained: Date;
  trainingDataSize: number;
  accuracy: number; // 0-1

  // モデルパラメータ
  timeWeights: { [hour: number]: number };
  dayWeights: { [day: number]: number };
  weatherWeights: { [weather: string]: number };
  environmentWeights: { [factor: string]: number };
  personalFactors: { [factor: string]: number };

  // ADHD特化パラメータ
  adhdPatterns: {
    hyperfocusPredictors: { [factor: string]: number };
    distractionTriggers: { [factor: string]: number };
    optimalConditions: { [factor: string]: number };
    crashPatterns: { [factor: string]: number };
  };

  // 時系列パターン
  sequentialPatterns: {
    energyTransitions: { [state: string]: { [nextState: string]: number } };
    cyclicalPatterns: { [period: string]: number[] };
    trendPatterns: { [trend: string]: number };
  };
}

// 予測結果型
interface EnergyPrediction {
  timestamp: Date;
  hour: number;
  predictedEnergy: number; // 1-10
  confidence: number; // 0-1

  // 詳細予測
  predictions: {
    focus: number;
    creativity: number;
    socialEnergy: number;
    executiveFunction: number;
    stressLevel: number;
  };

  // 推奨事項
  recommendations: {
    taskTypes: string[];
    breakNeeded: boolean;
    environmentAdjustments: string[];
    preventiveMeasures: string[];
  };

  // 不確実性分析
  uncertaintyFactors: string[];
  dataGaps: string[];
  alternativeScenarios: {
    scenario: string;
    probability: number;
    predictedEnergy: number;
  }[];
}

// 学習設定型
interface LearningConfig {
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  learningRate: number; // 0-1
  forgetRate: number; // 0-1 (how quickly old patterns fade)
  dataRetention: number; // days

  // フィードバック設定
  userFeedbackWeight: number; // 0-1
  objectiveDataWeight: number; // 0-1
  contextSensitivity: number; // 0-1

  // ADHD特化設定
  hyperfocusDetection: boolean;
  crashPrevention: boolean;
  adaptiveScheduling: boolean;
  environmentOptimization: boolean;
}

class EnergyPatternLearningAI extends EventEmitter {
  private model: EnergyPredictionModel;
  private trainingData: BehaviorDataPoint[] = [];
  private config: LearningConfig;
  private isTraining: boolean = false;
  private lastUpdate: Date = new Date();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    this.config = {
      updateFrequency: 'hourly',
      learningRate: 0.1,
      forgetRate: 0.01,
      dataRetention: 90,
      userFeedbackWeight: 0.7,
      objectiveDataWeight: 0.3,
      contextSensitivity: 0.8,
      hyperfocusDetection: true,
      crashPrevention: true,
      adaptiveScheduling: true,
      environmentOptimization: true,
    };

    this.model = this.initializeModel();
    this.loadTrainingData();
    this.startLearningSchedule();
  }

  /**
   * 初期モデル生成
   */
  private initializeModel(): EnergyPredictionModel {
    return {
      id: `energy-model-${Date.now()}`,
      version: 1,
      lastTrained: new Date(),
      trainingDataSize: 0,
      accuracy: 0.5,

      // 時間帯の基本重み（ADHD典型パターン）
      timeWeights: {
        6: 0.6,
        7: 0.7,
        8: 0.8,
        9: 0.9,
        10: 0.95,
        11: 0.9,
        12: 0.7,
        13: 0.6,
        14: 0.4,
        15: 0.3,
        16: 0.4,
        17: 0.6,
        18: 0.7,
        19: 0.8,
        20: 0.9,
        21: 0.8,
        22: 0.6,
        23: 0.4,
        0: 0.2,
        1: 0.1,
        2: 0.1,
        3: 0.1,
        4: 0.1,
        5: 0.3,
      },

      // 曜日重み
      dayWeights: {
        0: 0.5, // 日曜
        1: 0.8, // 月曜
        2: 0.9, // 火曜
        3: 0.7, // 水曜
        4: 0.6, // 木曜
        5: 0.4, // 金曜
        6: 0.6, // 土曜
      },

      // 天気重み
      weatherWeights: {
        sunny: 0.8,
        cloudy: 0.6,
        rainy: 0.4,
        snowy: 0.3,
      },

      // 環境要因
      environmentWeights: {
        home: 0.7,
        office: 0.6,
        cafe: 0.5,
        other: 0.4,
      },

      // 個人要因（学習により調整）
      personalFactors: {
        sleepQuality: 0.3,
        exerciseImpact: 0.2,
        caffeineResponse: 0.1,
        socialDrain: 0.15,
        seasonalAffect: 0.1,
      },

      // ADHD特化パターン
      adhdPatterns: {
        hyperfocusPredictors: {
          interest: 0.4,
          novelty: 0.3,
          urgency: 0.2,
          isolation: 0.1,
        },
        distractionTriggers: {
          noise: 0.3,
          multitasking: 0.2,
          stress: 0.2,
          fatigue: 0.15,
          boredom: 0.15,
        },
        optimalConditions: {
          structure: 0.25,
          movement: 0.2,
          music: 0.15,
          temperature: 0.1,
          lighting: 0.1,
          space: 0.2,
        },
        crashPatterns: {
          prolongedFocus: 0.4,
          stimulantWearoff: 0.3,
          overwhelm: 0.2,
          underStimulation: 0.1,
        },
      },

      // 時系列パターン（初期値）
      sequentialPatterns: {
        energyTransitions: {},
        cyclicalPatterns: {},
        trendPatterns: {},
      },
    };
  }

  /**
   * 学習データ読み込み
   */
  private async loadTrainingData(): Promise<void> {
    try {
      const stored = localStorage.getItem('energy-learning-data');
      if (stored) {
        this.trainingData = JSON.parse(stored).map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp),
        }));

        console.log(`${this.trainingData.length}件の学習データを読み込みました`);
      }

      // 古いデータをクリーンアップ
      this.cleanupOldData();
    } catch (error) {
      console.error('学習データ読み込みエラー:', error);
    }
  }

  /**
   * データポイント追加
   */
  public addDataPoint(data: Partial<BehaviorDataPoint>): void {
    const now = new Date();

    const dataPoint: BehaviorDataPoint = {
      timestamp: now,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      reportedEnergyLevel: 5,
      reportedFocusLevel: 5,
      reportedMoodLevel: 5,
      reportedStressLevel: 5,
      taskCompletionRate: 0.7,
      avgTaskDuration: 30,
      breakFrequency: 0.5,
      interactionResponseTime: 500,
      weather: 'cloudy',
      temperature: 20,
      season: 'autumn',
      location: 'home',
      socialContext: 'alone',
      sleepQuality: 7,
      sleepDuration: 7.5,
      exerciseToday: false,
      caffeineIntake: 1,
      mealTiming: 2,
      distractionCount: 3,
      hyperfocusEpisode: false,
      impulsiveActions: 1,
      sensoryOverload: false,
      dataQuality: 0.8,
      userVerified: false,
      ...data,
    };

    this.trainingData.push(dataPoint);
    this.saveTrainingData();

    // リアルタイム学習
    if (this.config.updateFrequency === 'realtime') {
      this.updateModel();
    }

    this.emit('data-point-added', dataPoint);
    console.log('新しいデータポイントを追加:', dataPoint.timestamp);
  }

  /**
   * モデル更新（学習実行）
   */
  public async updateModel(): Promise<void> {
    if (this.isTraining || this.trainingData.length < 10) return;

    this.isTraining = true;

    try {
      console.log('🤖 エネルギーパターン学習開始...');

      // 基本統計学習
      await this.learnTimePatterns();
      await this.learnEnvironmentalFactors();
      await this.learnPersonalFactors();
      await this.learnADHDPatterns();
      await this.learnSequentialPatterns();

      // モデル精度評価
      this.evaluateModel();

      // モデル保存
      this.saveModel();

      this.lastUpdate = new Date();
      this.model.version++;
      this.model.lastTrained = new Date();
      this.model.trainingDataSize = this.trainingData.length;

      console.log(`✅ 学習完了 - 精度: ${(this.model.accuracy * 100).toFixed(1)}%`);
      this.emit('model-updated', {
        version: this.model.version,
        accuracy: this.model.accuracy,
        dataSize: this.trainingData.length,
      });
    } catch (error) {
      console.error('モデル学習エラー:', error);
      this.emit('learning-error', error);
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * 時間パターン学習
   */
  private async learnTimePatterns(): Promise<void> {
    const hourlyAverages: { [hour: number]: number[] } = {};
    const dailyAverages: { [day: number]: number[] } = {};

    // データを時間別・曜日別にグループ化
    for (const point of this.trainingData) {
      if (!hourlyAverages[point.hour]) hourlyAverages[point.hour] = [];
      if (!dailyAverages[point.dayOfWeek]) dailyAverages[point.dayOfWeek] = [];

      hourlyAverages[point.hour].push(point.reportedEnergyLevel);
      dailyAverages[point.dayOfWeek].push(point.reportedEnergyLevel);
    }

    // 平均を計算して重みを更新
    for (const hour in hourlyAverages) {
      const avg = hourlyAverages[hour].reduce((a, b) => a + b, 0) / hourlyAverages[hour].length;
      const normalizedWeight = avg / 10; // 0-1スケール

      // 学習率を適用
      this.model.timeWeights[parseInt(hour)] =
        this.model.timeWeights[parseInt(hour)] * (1 - this.config.learningRate) +
        normalizedWeight * this.config.learningRate;
    }

    for (const day in dailyAverages) {
      const avg = dailyAverages[day].reduce((a, b) => a + b, 0) / dailyAverages[day].length;
      const normalizedWeight = avg / 10;

      this.model.dayWeights[parseInt(day)] =
        this.model.dayWeights[parseInt(day)] * (1 - this.config.learningRate) +
        normalizedWeight * this.config.learningRate;
    }
  }

  /**
   * 環境要因学習
   */
  private async learnEnvironmentalFactors(): Promise<void> {
    const weatherImpact: { [weather: string]: number[] } = {};
    const locationImpact: { [location: string]: number[] } = {};

    for (const point of this.trainingData) {
      if (!weatherImpact[point.weather]) weatherImpact[point.weather] = [];
      if (!locationImpact[point.location]) locationImpact[point.location] = [];

      weatherImpact[point.weather].push(point.reportedEnergyLevel);
      locationImpact[point.location].push(point.reportedEnergyLevel);
    }

    // 環境要因の重み更新
    for (const weather in weatherImpact) {
      const avg = weatherImpact[weather].reduce((a, b) => a + b, 0) / weatherImpact[weather].length;
      const normalizedWeight = avg / 10;

      this.model.weatherWeights[weather] =
        (this.model.weatherWeights[weather] || 0.5) * (1 - this.config.learningRate) +
        normalizedWeight * this.config.learningRate;
    }

    for (const location in locationImpact) {
      const avg =
        locationImpact[location].reduce((a, b) => a + b, 0) / locationImpact[location].length;
      const normalizedWeight = avg / 10;

      this.model.environmentWeights[location] =
        (this.model.environmentWeights[location] || 0.5) * (1 - this.config.learningRate) +
        normalizedWeight * this.config.learningRate;
    }
  }

  /**
   * 個人要因学習
   */
  private async learnPersonalFactors(): Promise<void> {
    // 睡眠とエネルギーの相関
    const sleepCorrelation = this.calculateCorrelation(
      this.trainingData.map((p) => p.sleepQuality),
      this.trainingData.map((p) => p.reportedEnergyLevel)
    );

    // 運動とエネルギーの相関
    const exerciseImpact = this.calculateExerciseImpact();

    // カフェインとエネルギーの相関
    const caffeineCorrelation = this.calculateCorrelation(
      this.trainingData.map((p) => p.caffeineIntake),
      this.trainingData.map((p) => p.reportedEnergyLevel)
    );

    // 重み更新
    this.model.personalFactors.sleepQuality = Math.max(0, Math.min(1, sleepCorrelation));
    this.model.personalFactors.exerciseImpact = exerciseImpact;
    this.model.personalFactors.caffeineResponse = Math.max(0, Math.min(1, caffeineCorrelation));
  }

  /**
   * ADHD特化パターン学習
   */
  private async learnADHDPatterns(): Promise<void> {
    // ハイパーフォーカス予測因子
    const hyperfocusEpisodes = this.trainingData.filter((p) => p.hyperfocusEpisode);
    if (hyperfocusEpisodes.length > 0) {
      // ハイパーフォーカス時の条件分析
      const avgConditions = this.analyzeConditions(hyperfocusEpisodes);
      this.updateADHDPattern('hyperfocusPredictors', avgConditions);
    }

    // 注意散漫トリガー
    const highDistractionPoints = this.trainingData.filter((p) => p.distractionCount > 5);
    if (highDistractionPoints.length > 0) {
      const distractionTriggers = this.analyzeConditions(highDistractionPoints);
      this.updateADHDPattern('distractionTriggers', distractionTriggers);
    }

    // 最適条件
    const highEnergyPoints = this.trainingData.filter((p) => p.reportedEnergyLevel >= 8);
    if (highEnergyPoints.length > 0) {
      const optimalConditions = this.analyzeConditions(highEnergyPoints);
      this.updateADHDPattern('optimalConditions', optimalConditions);
    }
  }

  /**
   * 時系列パターン学習
   */
  private async learnSequentialPatterns(): Promise<void> {
    // エネルギー遷移パターン
    for (let i = 1; i < this.trainingData.length; i++) {
      const prev = this.trainingData[i - 1];
      const curr = this.trainingData[i];

      // 時間が連続している場合のみ
      if (curr.timestamp.getTime() - prev.timestamp.getTime() <= 2 * 60 * 60 * 1000) {
        const prevState = this.discretizeEnergyLevel(prev.reportedEnergyLevel);
        const currState = this.discretizeEnergyLevel(curr.reportedEnergyLevel);

        if (!this.model.sequentialPatterns.energyTransitions[prevState]) {
          this.model.sequentialPatterns.energyTransitions[prevState] = {};
        }

        const currentCount =
          this.model.sequentialPatterns.energyTransitions[prevState][currState] || 0;
        this.model.sequentialPatterns.energyTransitions[prevState][currState] = currentCount + 1;
      }
    }

    // 遷移確率に正規化
    for (const fromState in this.model.sequentialPatterns.energyTransitions) {
      const transitions = this.model.sequentialPatterns.energyTransitions[fromState];
      const total = Object.values(transitions).reduce((sum, count) => sum + count, 0);

      for (const toState in transitions) {
        transitions[toState] = transitions[toState] / total;
      }
    }
  }

  /**
   * エネルギー予測
   */
  public predictEnergy(timestamp: Date, context?: Partial<BehaviorDataPoint>): EnergyPrediction {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    // 基本予測（時間・曜日）
    let baseEnergyScore =
      (this.model.timeWeights[hour] || 0.5) * 0.4 + (this.model.dayWeights[dayOfWeek] || 0.5) * 0.2;

    // 環境要因を追加
    if (context) {
      if (context.weather && this.model.weatherWeights[context.weather]) {
        baseEnergyScore += this.model.weatherWeights[context.weather] * 0.1;
      }

      if (context.location && this.model.environmentWeights[context.location]) {
        baseEnergyScore += this.model.environmentWeights[context.location] * 0.1;
      }

      // 個人要因
      if (context.sleepQuality) {
        baseEnergyScore +=
          (context.sleepQuality / 10) * this.model.personalFactors.sleepQuality * 0.2;
      }
    }

    // 0-10スケールに変換
    const predictedEnergy = Math.max(1, Math.min(10, baseEnergyScore * 10));

    // 信頼度計算
    const confidence = this.calculatePredictionConfidence(timestamp, context);

    // 詳細予測
    const predictions = {
      focus: Math.max(1, Math.min(10, predictedEnergy + (Math.random() - 0.5) * 2)),
      creativity: Math.max(1, Math.min(10, predictedEnergy + (Math.random() - 0.5) * 3)),
      socialEnergy: Math.max(1, Math.min(10, predictedEnergy + (Math.random() - 0.5) * 2)),
      executiveFunction: Math.max(1, Math.min(10, predictedEnergy + (Math.random() - 0.5) * 2)),
      stressLevel: Math.max(1, Math.min(10, 10 - predictedEnergy + (Math.random() - 0.5) * 2)),
    };

    // 推奨事項生成
    const recommendations = this.generateRecommendations(predictedEnergy, predictions, context);

    return {
      timestamp,
      hour,
      predictedEnergy,
      confidence,
      predictions,
      recommendations,
      uncertaintyFactors: this.identifyUncertaintyFactors(context),
      dataGaps: this.identifyDataGaps(timestamp),
      alternativeScenarios: this.generateAlternativeScenarios(baseEnergyScore),
    };
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(
    energy: number,
    predictions: any,
    context?: Partial<BehaviorDataPoint>
  ): any {
    const recommendations = {
      taskTypes: [] as string[],
      breakNeeded: false,
      environmentAdjustments: [] as string[],
      preventiveMeasures: [] as string[],
    };

    // エネルギーレベルに基づく推奨
    if (energy >= 8) {
      recommendations.taskTypes.push('deep-work', 'creative', 'challenging');
    } else if (energy >= 6) {
      recommendations.taskTypes.push('routine', 'moderate', 'collaborative');
    } else if (energy >= 4) {
      recommendations.taskTypes.push('simple', 'administrative', 'review');
    } else {
      recommendations.taskTypes.push('rest', 'passive', 'self-care');
      recommendations.breakNeeded = true;
    }

    // ADHD特化推奨
    if (predictions.focus < 5) {
      recommendations.environmentAdjustments.push('reduce-distractions', 'quiet-space');
    }

    if (energy < 5) {
      recommendations.preventiveMeasures.push('movement-break', 'hydration', 'fresh-air');
    }

    return recommendations;
  }

  /**
   * ユーティリティメソッド
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateExerciseImpact(): number {
    const exerciseDays = this.trainingData.filter((p) => p.exerciseToday);
    const nonExerciseDays = this.trainingData.filter((p) => !p.exerciseToday);

    if (exerciseDays.length === 0 || nonExerciseDays.length === 0) return 0.2;

    const exerciseAvg =
      exerciseDays.reduce((sum, p) => sum + p.reportedEnergyLevel, 0) / exerciseDays.length;
    const nonExerciseAvg =
      nonExerciseDays.reduce((sum, p) => sum + p.reportedEnergyLevel, 0) / nonExerciseDays.length;

    return Math.max(0, Math.min(1, (exerciseAvg - nonExerciseAvg) / 10 + 0.5));
  }

  private analyzeConditions(dataPoints: BehaviorDataPoint[]): { [key: string]: number } {
    // 簡易的な条件分析
    return {
      structure: dataPoints.filter((p) => p.location === 'office').length / dataPoints.length,
      isolation: dataPoints.filter((p) => p.socialContext === 'alone').length / dataPoints.length,
      morningTime: dataPoints.filter((p) => p.hour >= 8 && p.hour <= 11).length / dataPoints.length,
    };
  }

  private updateADHDPattern(patternType: string, conditions: { [key: string]: number }): void {
    const pattern = (this.model.adhdPatterns as any)[patternType];
    for (const condition in conditions) {
      if (pattern[condition] !== undefined) {
        pattern[condition] =
          pattern[condition] * (1 - this.config.learningRate) +
          conditions[condition] * this.config.learningRate;
      }
    }
  }

  private discretizeEnergyLevel(energy: number): string {
    if (energy <= 3) return 'low';
    if (energy <= 6) return 'medium';
    return 'high';
  }

  private calculatePredictionConfidence(
    timestamp: Date,
    context?: Partial<BehaviorDataPoint>
  ): number {
    // 基本信頼度（データ量に基づく）
    const dataVolume = Math.min(1, this.trainingData.length / 100);

    // 時間的近接性（最近のデータほど信頼度高）
    const recentData = this.trainingData.filter(
      (p) => timestamp.getTime() - p.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000 // 1週間
    ).length;
    const recency = Math.min(1, recentData / 10);

    // 文脈情報の完全性
    const contextCompleteness = context ? Object.keys(context).length / 15 : 0.5;

    return dataVolume * 0.4 + recency * 0.4 + contextCompleteness * 0.2;
  }

  private identifyUncertaintyFactors(context?: Partial<BehaviorDataPoint>): string[] {
    const factors = [];

    if (!context?.weather) factors.push('天気情報不明');
    if (!context?.sleepQuality) factors.push('睡眠質情報不明');
    if (this.trainingData.length < 50) factors.push('学習データ不足');

    return factors;
  }

  private identifyDataGaps(timestamp: Date): string[] {
    const gaps = [];
    const hour = timestamp.getHours();

    const hourData = this.trainingData.filter((p) => p.hour === hour);
    if (hourData.length < 5) {
      gaps.push(`${hour}時のデータが不足`);
    }

    return gaps;
  }

  private generateAlternativeScenarios(baseScore: number): any[] {
    return [
      {
        scenario: '良好な睡眠',
        probability: 0.3,
        predictedEnergy: Math.min(10, baseScore * 10 + 2),
      },
      {
        scenario: '睡眠不足',
        probability: 0.2,
        predictedEnergy: Math.max(1, baseScore * 10 - 2),
      },
      {
        scenario: 'ストレス状況',
        probability: 0.15,
        predictedEnergy: Math.max(1, baseScore * 10 - 3),
      },
    ];
  }

  /**
   * モデル評価
   */
  private evaluateModel(): void {
    if (this.trainingData.length < 20) {
      this.model.accuracy = 0.5;
      return;
    }

    // 最新20%のデータでテスト
    const testSize = Math.floor(this.trainingData.length * 0.2);
    const testData = this.trainingData.slice(-testSize);

    let totalError = 0;
    for (const point of testData) {
      const prediction = this.predictEnergy(point.timestamp, point);
      const error = Math.abs(prediction.predictedEnergy - point.reportedEnergyLevel) / 10;
      totalError += error;
    }

    this.model.accuracy = Math.max(0, 1 - totalError / testSize);
  }

  /**
   * データ管理
   */
  private saveTrainingData(): void {
    try {
      localStorage.setItem('energy-learning-data', JSON.stringify(this.trainingData));
    } catch (error) {
      console.error('学習データ保存エラー:', error);
    }
  }

  private saveModel(): void {
    try {
      localStorage.setItem('energy-prediction-model', JSON.stringify(this.model));
    } catch (error) {
      console.error('モデル保存エラー:', error);
    }
  }

  private cleanupOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetention);

    this.trainingData = this.trainingData.filter((point) => point.timestamp >= cutoffDate);
  }

  private startLearningSchedule(): void {
    const intervalMap = {
      realtime: 0,
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
    };

    const interval = intervalMap[this.config.updateFrequency];
    if (interval > 0) {
      this.updateInterval = setInterval(() => {
        this.updateModel();
      }, interval);
    }
  }

  /**
   * パブリックメソッド
   */
  public getModelInfo(): any {
    return {
      version: this.model.version,
      lastTrained: this.model.lastTrained,
      accuracy: this.model.accuracy,
      dataSize: this.trainingData.length,
      isTraining: this.isTraining,
    };
  }

  public exportModel(): string {
    return JSON.stringify(
      {
        model: this.model,
        config: this.config,
        trainingDataSize: this.trainingData.length,
        exportDate: new Date(),
      },
      null,
      2
    );
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.removeAllListeners();
    console.log('🛑 エネルギーパターン学習AI停止');
  }
}

// シングルトンインスタンス
const energyPatternLearningAI = new EnergyPatternLearningAI();

export default energyPatternLearningAI;
export { EnergyPatternLearningAI };
export type { BehaviorDataPoint, EnergyPrediction, EnergyPredictionModel, LearningConfig };
