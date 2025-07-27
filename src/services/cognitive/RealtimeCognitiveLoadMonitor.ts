/**
 * 🧠 リアルタイム認知負荷監視システム
 * ユーザー操作監視・認知負荷リアルタイム計算・適応的UI調整・ADHD/ASD特化
 */

import { EventEmitter } from 'eventemitter3';

// 認知負荷レベル
export type CognitiveLoadLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'critical';

// ユーザー操作データ
export interface UserInteractionData {
  timestamp: Date;
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'blur' | 'keypress' | 'resize' | 'navigation';
  element: string;
  duration?: number; // アクション継続時間（ms）
  coordinates?: { x: number; y: number };
  scrollPosition?: { x: number; y: number };
  keystroke?: string;
  hesitationTime?: number; // 躊躇時間（ms）
  errorCount?: number; // エラー回数
}

// 認知負荷メトリクス
export interface CognitiveLoadMetrics {
  timestamp: Date;
  userId: string;

  // 基本メトリクス
  overall: number; // 1-10の総合認知負荷
  level: CognitiveLoadLevel;

  // 詳細メトリクス
  attention: {
    focusStability: number; // 0-1
    taskSwitching: number; // 0-1
    distractionResistance: number; // 0-1
  };

  processing: {
    speed: number; // 0-1
    accuracy: number; // 0-1
    efficiency: number; // 0-1
  };

  workingMemory: {
    capacity: number; // 0-1
    updateSpeed: number; // 0-1
    interference: number; // 0-1
  };

  executive: {
    planning: number; // 0-1
    monitoring: number; // 0-1
    switching: number; // 0-1
    inhibition: number; // 0-1
  };

  // ADHD/ASD特性
  adhdFactors: {
    hyperactivity: number; // 0-1
    impulsivity: number; // 0-1
    inattention: number; // 0-1
    sensoryOverload: number; // 0-1
  };

  // 環境要因
  environmental: {
    uiComplexity: number; // 0-1
    informationDensity: number; // 0-1
    interactionDemand: number; // 0-1
    timePresure: number; // 0-1
  };
}

// UI適応設定
export interface UIAdaptationConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';

  adaptations: {
    layout: {
      simplifyWhenOverloaded: boolean;
      hideNonEssentialElements: boolean;
      increaseWhitespace: boolean;
      reduceAnimations: boolean;
    };

    colors: {
      reduceSaturation: boolean;
      increaseContrast: boolean;
      useCalmingColors: boolean;
    };

    interactions: {
      increaseTouchTargets: boolean;
      addConfirmations: boolean;
      reduceOptions: boolean;
      enableFocusMode: boolean;
    };

    content: {
      simplifyLanguage: boolean;
      addVisualCues: boolean;
      breakIntoSteps: boolean;
      highlightImportant: boolean;
    };
  };
}

// アラート設定
export interface CognitiveLoadAlert {
  id: string;
  timestamp: Date;
  level: CognitiveLoadLevel;
  message: string;
  recommendations: string[];
  autoActions: string[];
  acknowledged: boolean;
}

class RealtimeCognitiveLoadMonitor extends EventEmitter {
  private static instance: RealtimeCognitiveLoadMonitor | null = null;
  private isMonitoring: boolean = false;
  private interactions: UserInteractionData[] = [];
  private currentMetrics: CognitiveLoadMetrics | null = null;
  private adaptationConfig!: UIAdaptationConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private userId: string = 'demo-user';

  // パフォーマンス追跡
  private performanceBaseline: {
    averageClickTime: number;
    averageScrollSpeed: number;
    averageHesitation: number;
    errorRate: number;
  } | null = null;

  private constructor() {
    super();
    this.initializeAdaptationConfig();
    this.setupEventListeners();
    console.log('🧠 Realtime Cognitive Load Monitor initialized');
  }

  static getInstance(): RealtimeCognitiveLoadMonitor {
    if (!RealtimeCognitiveLoadMonitor.instance) {
      RealtimeCognitiveLoadMonitor.instance = new RealtimeCognitiveLoadMonitor();
    }
    return RealtimeCognitiveLoadMonitor.instance;
  }

  /**
   * UI適応設定の初期化
   */
  private initializeAdaptationConfig(): void {
    this.adaptationConfig = {
      enabled: true,
      sensitivity: 'medium',

      adaptations: {
        layout: {
          simplifyWhenOverloaded: true,
          hideNonEssentialElements: true,
          increaseWhitespace: true,
          reduceAnimations: true,
        },

        colors: {
          reduceSaturation: true,
          increaseContrast: true,
          useCalmingColors: true,
        },

        interactions: {
          increaseTouchTargets: true,
          addConfirmations: true,
          reduceOptions: true,
          enableFocusMode: true,
        },

        content: {
          simplifyLanguage: true,
          addVisualCues: true,
          breakIntoSteps: true,
          highlightImportant: true,
        },
      },
    };
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // クリックイベント
    document.addEventListener('click', (event) => {
      this.recordInteraction({
        timestamp: new Date(),
        type: 'click',
        element: this.getElementDescription(event.target as Element),
        coordinates: { x: event.clientX, y: event.clientY },
        hesitationTime: this.calculateHesitationTime(),
      });
    });

    // スクロールイベント
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          timestamp: new Date(),
          type: 'scroll',
          element: 'window',
          scrollPosition: { x: window.scrollX, y: window.scrollY },
        });
      }, 150);
    });

    // フォーカスイベント
    document.addEventListener('focusin', (event) => {
      this.recordInteraction({
        timestamp: new Date(),
        type: 'focus',
        element: this.getElementDescription(event.target as Element),
      });
    });

    document.addEventListener('focusout', (event) => {
      this.recordInteraction({
        timestamp: new Date(),
        type: 'blur',
        element: this.getElementDescription(event.target as Element),
      });
    });

    // キー入力イベント
    let keystrokeCount = 0;
    let lastKeystroke = Date.now();

    document.addEventListener('keydown', (event) => {
      const now = Date.now();
      const timeSinceLastKey = now - lastKeystroke;

      keystrokeCount++;
      lastKeystroke = now;

      this.recordInteraction({
        timestamp: new Date(),
        type: 'keypress',
        element: this.getElementDescription(event.target as Element),
        keystroke: event.key,
        hesitationTime: timeSinceLastKey > 2000 ? timeSinceLastKey : 0,
      });
    });

    // ウィンドウリサイズ
    window.addEventListener('resize', () => {
      this.recordInteraction({
        timestamp: new Date(),
        type: 'resize',
        element: 'window',
      });
    });

    // ページナビゲーション
    window.addEventListener('beforeunload', () => {
      this.recordInteraction({
        timestamp: new Date(),
        type: 'navigation',
        element: 'window',
      });
    });
  }

  /**
   * 監視開始
   */
  public startMonitoring(userId?: string): void {
    if (this.isMonitoring) return;

    if (userId) this.userId = userId;
    this.isMonitoring = true;

    // 3秒ごとに認知負荷を計算
    this.monitoringInterval = setInterval(() => {
      this.calculateCognitiveLoad();
    }, 3000);

    console.log('🧠 Cognitive load monitoring started for user:', this.userId);
    this.emit('monitoringStarted', { userId: this.userId });
  }

  /**
   * 監視停止
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🧠 Cognitive load monitoring stopped');
    this.emit('monitoringStopped');
  }

  /**
   * ユーザー操作の記録
   */
  private recordInteraction(interaction: UserInteractionData): void {
    if (!this.isMonitoring) return;

    this.interactions.push(interaction);

    // 最新100件のみ保持
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100);
    }

    this.emit('interactionRecorded', interaction);
  }

  /**
   * 認知負荷の計算
   */
  private calculateCognitiveLoad(): void {
    const recentInteractions = this.getRecentInteractions(30000); // 30秒間

    if (recentInteractions.length === 0) {
      return;
    }

    // 各指標の計算
    const attention = this.calculateAttentionMetrics(recentInteractions);
    const processing = this.calculateProcessingMetrics(recentInteractions);
    const workingMemory = this.calculateWorkingMemoryMetrics(recentInteractions);
    const executive = this.calculateExecutiveMetrics(recentInteractions);
    const adhdFactors = this.calculateADHDFactors(recentInteractions);
    const environmental = this.calculateEnvironmentalFactors();

    // 総合認知負荷の計算
    const overallLoad = this.calculateOverallLoad({
      attention,
      processing,
      workingMemory,
      executive,
      adhdFactors,
      environmental,
    });

    const metrics: CognitiveLoadMetrics = {
      timestamp: new Date(),
      userId: this.userId,
      overall: overallLoad,
      level: this.getLoadLevel(overallLoad),
      attention,
      processing,
      workingMemory,
      executive,
      adhdFactors,
      environmental,
    };

    this.currentMetrics = metrics;
    this.emit('cognitiveLoadCalculated', metrics);

    // アラートチェック
    this.checkAlerts(metrics);

    // UI適応の実行
    if (this.adaptationConfig.enabled) {
      this.adaptUI(metrics);
    }

    console.log('🧠 Cognitive load calculated:', {
      overall: overallLoad.toFixed(2),
      level: this.getLoadLevel(overallLoad),
      attention: attention.focusStability.toFixed(2),
    });
  }

  /**
   * 注意力メトリクスの計算
   */
  private calculateAttentionMetrics(interactions: UserInteractionData[]) {
    const focusEvents = interactions.filter((i) => i.type === 'focus' || i.type === 'blur');
    const clickEvents = interactions.filter((i) => i.type === 'click');

    // フォーカス安定性
    const focusStability = Math.max(0, 1 - focusEvents.length / 20);

    // タスク切り替え頻度
    const taskSwitching = Math.min(1, clickEvents.length / 30);

    // 注意散漫抵抗
    const hesitationTotal = interactions
      .filter((i) => i.hesitationTime)
      .reduce((sum, i) => sum + (i.hesitationTime || 0), 0);
    const distractionResistance = Math.max(0, 1 - hesitationTotal / 10000);

    return {
      focusStability,
      taskSwitching,
      distractionResistance,
    };
  }

  /**
   * 処理速度メトリクスの計算
   */
  private calculateProcessingMetrics(interactions: UserInteractionData[]) {
    const clickEvents = interactions.filter((i) => i.type === 'click');
    const keyEvents = interactions.filter((i) => i.type === 'keypress');

    // 処理速度（クリック間隔から推定）
    let avgClickInterval = 2000;
    if (clickEvents.length > 1) {
      const intervals = [];
      for (let i = 1; i < clickEvents.length; i++) {
        intervals.push(clickEvents[i].timestamp.getTime() - clickEvents[i - 1].timestamp.getTime());
      }
      avgClickInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    const speed = Math.max(0, 1 - avgClickInterval / 5000);

    // 精度（エラー率から推定）
    const errorEvents = interactions.filter((i) => (i.errorCount || 0) > 0);
    const accuracy = Math.max(0, 1 - errorEvents.length / interactions.length);

    // 効率性
    const efficiency = (speed + accuracy) / 2;

    return {
      speed,
      accuracy,
      efficiency,
    };
  }

  /**
   * ワーキングメモリメトリクスの計算
   */
  private calculateWorkingMemoryMetrics(interactions: UserInteractionData[]) {
    // 複雑な計算を簡略化
    const scrollEvents = interactions.filter((i) => i.type === 'scroll');
    const navigationEvents = interactions.filter((i) => i.type === 'navigation');

    // 容量（スクロール頻度から推定）
    const capacity = Math.max(0, 1 - scrollEvents.length / 20);

    // 更新速度
    const updateSpeed = Math.min(1, interactions.length / 50);

    // 干渉（ナビゲーション頻度から推定）
    const interference = Math.min(1, navigationEvents.length / 5);

    return {
      capacity,
      updateSpeed,
      interference,
    };
  }

  /**
   * 実行機能メトリクスの計算
   */
  private calculateExecutiveMetrics(interactions: UserInteractionData[]) {
    // 簡略化された実行機能評価
    const hesitationTotal = interactions
      .filter((i) => i.hesitationTime)
      .reduce((sum, i) => sum + (i.hesitationTime || 0), 0);

    const planning = Math.max(0, 1 - hesitationTotal / 15000);
    const monitoring = Math.min(1, interactions.filter((i) => i.type === 'focus').length / 10);
    const switching = Math.max(0, 1 - interactions.filter((i) => i.type === 'blur').length / 15);
    const inhibition = Math.max(0, 1 - interactions.filter((i) => i.type === 'click').length / 40);

    return {
      planning,
      monitoring,
      switching,
      inhibition,
    };
  }

  /**
   * ADHD要因の計算
   */
  private calculateADHDFactors(interactions: UserInteractionData[]) {
    const clickCount = interactions.filter((i) => i.type === 'click').length;
    const scrollCount = interactions.filter((i) => i.type === 'scroll').length;
    const hesitationCount = interactions.filter((i) => (i.hesitationTime || 0) > 1000).length;

    // 多動性（クリック頻度から）
    const hyperactivity = Math.min(1, clickCount / 30);

    // 衝動性（短時間での多数クリックから）
    const impulsivity = Math.min(1, clickCount / 20);

    // 不注意（躊躇時間から）
    const inattention = Math.min(1, hesitationCount / 10);

    // 感覚過負荷（過度のスクロールから）
    const sensoryOverload = Math.min(1, scrollCount / 25);

    return {
      hyperactivity,
      impulsivity,
      inattention,
      sensoryOverload,
    };
  }

  /**
   * 環境要因の計算
   */
  private calculateEnvironmentalFactors() {
    // UI複雑性（ページ内の要素数から推定）
    const elementCount = document.querySelectorAll('*').length;
    const uiComplexity = Math.min(1, elementCount / 1000);

    // 情報密度
    const textLength = document.body.textContent?.length || 0;
    const informationDensity = Math.min(1, textLength / 10000);

    // インタラクション要求
    const interactiveElements = document.querySelectorAll(
      'button, input, select, textarea, a'
    ).length;
    const interactionDemand = Math.min(1, interactiveElements / 50);

    // 時間圧力（固定値、実際の実装では動的に計算）
    const timePresure = 0.3;

    return {
      uiComplexity,
      informationDensity,
      interactionDemand,
      timePresure,
    };
  }

  /**
   * 総合認知負荷の計算
   */
  private calculateOverallLoad(metrics: any): number {
    const weights = {
      attention: 0.25,
      processing: 0.2,
      workingMemory: 0.2,
      executive: 0.15,
      adhd: 0.15,
      environmental: 0.05,
    };

    const attentionLoad =
      1 - (metrics.attention.focusStability + metrics.attention.distractionResistance) / 2;
    const processingLoad = 1 - metrics.processing.efficiency;
    const memoryLoad =
      1 - (metrics.workingMemory.capacity + (1 - metrics.workingMemory.interference)) / 2;
    const executiveLoad = 1 - (metrics.executive.planning + metrics.executive.monitoring) / 2;
    const adhdLoad =
      (metrics.adhdFactors.hyperactivity +
        metrics.adhdFactors.inattention +
        metrics.adhdFactors.sensoryOverload) /
      3;
    const environmentalLoad =
      (metrics.environmental.uiComplexity +
        metrics.environmental.informationDensity +
        metrics.environmental.interactionDemand) /
      3;

    const overallLoad =
      attentionLoad * weights.attention +
      processingLoad * weights.processing +
      memoryLoad * weights.workingMemory +
      executiveLoad * weights.executive +
      adhdLoad * weights.adhd +
      environmentalLoad * weights.environmental;

    return Math.min(10, Math.max(1, overallLoad * 10));
  }

  /**
   * 認知負荷レベルの判定
   */
  private getLoadLevel(load: number): CognitiveLoadLevel {
    if (load <= 2) return 'minimal';
    if (load <= 4) return 'low';
    if (load <= 6) return 'moderate';
    if (load <= 8) return 'high';
    return 'critical';
  }

  /**
   * アラートチェック
   */
  private checkAlerts(metrics: CognitiveLoadMetrics): void {
    if (metrics.level === 'critical' || metrics.level === 'high') {
      const alert: CognitiveLoadAlert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        level: metrics.level,
        message: `認知負荷が${metrics.level}レベルに達しています（${metrics.overall.toFixed(1)}/10）`,
        recommendations: this.generateRecommendations(metrics),
        autoActions: this.generateAutoActions(metrics),
        acknowledged: false,
      };

      this.emit('cognitiveLoadAlert', alert);
    }
  }

  /**
   * 推奨事項の生成
   */
  private generateRecommendations(metrics: CognitiveLoadMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.attention.focusStability < 0.5) {
      recommendations.push('一度に一つのタスクに集中することを推奨します');
    }

    if (metrics.adhdFactors.sensoryOverload > 0.7) {
      recommendations.push('画面上の情報量を減らすことを推奨します');
    }

    if (metrics.processing.speed < 0.4) {
      recommendations.push('作業ペースを落とすことを推奨します');
    }

    if (metrics.executive.planning < 0.5) {
      recommendations.push('タスクを小さなステップに分割することを推奨します');
    }

    return recommendations;
  }

  /**
   * 自動アクションの生成
   */
  private generateAutoActions(metrics: CognitiveLoadMetrics): string[] {
    const actions: string[] = [];

    if (metrics.level === 'critical') {
      actions.push('UI簡略化モード有効化');
      actions.push('非必須要素の非表示');
      actions.push('アニメーション減少');
    }

    if (metrics.adhdFactors.sensoryOverload > 0.8) {
      actions.push('カラーコントラスト調整');
      actions.push('視覚的ノイズ削減');
    }

    return actions;
  }

  /**
   * UI適応の実行
   */
  private adaptUI(metrics: CognitiveLoadMetrics): void {
    if (metrics.level === 'high' || metrics.level === 'critical') {
      this.emit('uiAdaptationRequired', {
        level: metrics.level,
        adaptations: this.adaptationConfig.adaptations,
        metrics,
      });
    }
  }

  /**
   * ヘルパーメソッド
   */
  private getRecentInteractions(timeWindow: number): UserInteractionData[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.interactions.filter((i) => i.timestamp >= cutoff);
  }

  private getElementDescription(element: Element): string {
    if (!element) return 'unknown';
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ')[0]}` : '';
    return `${tag}${id}${className}`.slice(0, 50);
  }

  private calculateHesitationTime(): number {
    // 簡略化: 前回のクリックからの時間を計算
    const lastClick = this.interactions.filter((i) => i.type === 'click').slice(-1)[0];

    if (!lastClick) return 0;
    return Date.now() - lastClick.timestamp.getTime();
  }

  /**
   * 公開メソッド
   */
  public getCurrentMetrics(): CognitiveLoadMetrics | null {
    return this.currentMetrics;
  }

  public getAdaptationConfig(): UIAdaptationConfig {
    return { ...this.adaptationConfig };
  }

  public updateAdaptationConfig(config: Partial<UIAdaptationConfig>): void {
    this.adaptationConfig = { ...this.adaptationConfig, ...config };
    this.emit('adaptationConfigUpdated', this.adaptationConfig);
  }

  public getDashboardData() {
    return {
      isMonitoring: this.isMonitoring,
      currentMetrics: this.currentMetrics,
      recentInteractions: this.getRecentInteractions(60000), // 最新1分間
      adaptationConfig: this.adaptationConfig,
      performanceBaseline: this.performanceBaseline,
    };
  }
}

export const realtimeCognitiveLoadMonitor = RealtimeCognitiveLoadMonitor.getInstance();
export default realtimeCognitiveLoadMonitor;
