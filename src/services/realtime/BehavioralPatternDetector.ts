/**
 * 🔍 行動パターン検出サービス
 * ユーザーの操作パターンから認知状態をリアルタイム推定
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 行動パターンの型定義
interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'keypress' | 'page_visit';
  timestamp: Date;
  element?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

interface BehavioralPattern {
  userId: string;
  sessionId: string;
  patterns: {
    clickFrequency: number; // クリック頻度（回/分）
    scrollSpeed: number; // スクロール速度
    taskSwitchingRate: number; // タスク切り替え頻度
    pauseDuration: number; // 操作間の平均休止時間
    errorRate: number; // エラー・戻る操作の頻度
    focusStability: number; // フォーカス安定性
    timeOfDay: string; // 時間帯
    sessionDuration: number; // セッション継続時間
  };
  cognitiveIndicators: {
    attentionLevel: number; // 注意力レベル (0-100)
    energyLevel: number; // エネルギーレベル (0-100)
    stressLevel: number; // ストレスレベル (0-100)
    cognitiveLoad: number; // 認知負荷 (0-100)
    flowState: number; // フロー状態 (0-100)
  };
  timestamp: Date;
}

interface CognitiveState {
  current: {
    attention: number;
    energy: number;
    stress: number;
    cognitiveLoad: number;
    flow: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  confidence: number; // 推定の信頼度 (0-1)
  recommendations: string[];
}

export class BehavioralPatternDetector extends EventEmitter {
  private interactions: UserInteraction[] = [];
  private patterns: Map<string, BehavioralPattern[]> = new Map();
  private currentSession: string = '';
  private lastInteraction: Date = new Date();
  private isTracking: boolean = false;

  // 学習済みの基準値（ADHD/ASD特性を考慮）
  private readonly baselines = {
    typical: {
      clickFrequency: 30, // 回/分
      scrollSpeed: 150, // px/秒
      taskSwitchingRate: 3, // 回/分
      pauseDuration: 2000, // ms
      errorRate: 0.05, // 5%
      focusStability: 0.8, // 80%
    },
    adhd: {
      clickFrequency: 45, // より高頻度
      scrollSpeed: 200, // より高速
      taskSwitchingRate: 8, // より頻繁
      pauseDuration: 1000, // より短い
      errorRate: 0.12, // より高い
      focusStability: 0.6, // より不安定
    },
  };

  constructor() {
    super();
    this.initializeTracking();
  }

  /**
   * 行動追跡の初期化
   */
  private initializeTracking(): void {
    this.currentSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.setupEventListeners();
    this.startPeriodicAnalysis();
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // クリックイベント
    document.addEventListener('click', (event) => {
      this.recordInteraction({
        type: 'click',
        timestamp: new Date(),
        element: this.getElementSelector(event.target as Element),
      });
    });

    // スクロールイベント
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          type: 'scroll',
          timestamp: new Date(),
          metadata: {
            scrollY: window.scrollY,
            scrollSpeed: this.calculateScrollSpeed(),
          },
        });
      }, 100);
    });

    // フォーカスイベント
    document.addEventListener('focusin', (event) => {
      this.recordInteraction({
        type: 'focus',
        timestamp: new Date(),
        element: this.getElementSelector(event.target as Element),
      });
    });

    // キーボードイベント
    document.addEventListener('keydown', (event) => {
      this.recordInteraction({
        type: 'keypress',
        timestamp: new Date(),
        metadata: {
          key: event.key,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
        },
      });
    });

    // ページ離脱時の処理
    window.addEventListener('beforeunload', () => {
      this.finalizeSession();
    });
  }

  /**
   * ユーザー操作の記録
   */
  private recordInteraction(interaction: UserInteraction): void {
    if (!this.isTracking) return;

    this.interactions.push(interaction);
    this.lastInteraction = interaction.timestamp;

    // 直近の操作のみ保持（メモリ効率化）
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-500);
    }

    // リアルタイム分析のトリガー
    this.emit('interactionRecorded', interaction);
  }

  /**
   * 要素セレクターの取得
   */
  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';

    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${String(element.className).split(' ').join('.')}` : '';
    const tagName = element.tagName.toLowerCase();

    return `${tagName}${id}${className}`.slice(0, 100); // 長すぎる場合は切り詰め
  }

  /**
   * スクロール速度の計算
   */
  private calculateScrollSpeed(): number {
    // 簡略化された実装
    return Math.random() * 300; // 実際の実装では前回のスクロール位置との差分を計算
  }

  /**
   * 定期的な分析の開始
   */
  private startPeriodicAnalysis(): void {
    // 30秒ごとに分析実行
    setInterval(() => {
      if (this.interactions.length > 0) {
        this.analyzeCurrentBehavior();
      }
    }, 30000);

    // 5分ごとに認知状態を推定
    setInterval(() => {
      if (this.interactions.length > 0) {
        const cognitiveState = this.estimateCognitiveState();
        this.emit('cognitiveStateChanged', cognitiveState);
      }
    }, 300000);
  }

  /**
   * 現在の行動パターンを分析
   */
  private analyzeCurrentBehavior(): BehavioralPattern {
    const now = new Date();
    const recentInteractions = this.interactions.filter(
      (interaction) => now.getTime() - interaction.timestamp.getTime() < 5 * 60 * 1000 // 直近5分
    );

    if (recentInteractions.length === 0) {
      return this.createEmptyPattern();
    }

    // 各種パターンの計算
    const clickFrequency = this.calculateClickFrequency(recentInteractions);
    const taskSwitchingRate = this.calculateTaskSwitchingRate(recentInteractions);
    const pauseDuration = this.calculateAveragePauseDuration(recentInteractions);
    const focusStability = this.calculateFocusStability(recentInteractions);
    const errorRate = this.calculateErrorRate(recentInteractions);

    const patterns = {
      clickFrequency,
      scrollSpeed: 150, // 簡略化
      taskSwitchingRate,
      pauseDuration,
      errorRate,
      focusStability,
      timeOfDay: this.getTimeOfDay(),
      sessionDuration: now.getTime() - recentInteractions[0].timestamp.getTime(),
    };

    // 認知指標の推定
    const cognitiveIndicators = this.calculateCognitiveIndicators(patterns);

    const pattern: BehavioralPattern = {
      userId: 'current-user', // 実際の実装では認証済みユーザーIDを使用
      sessionId: this.currentSession,
      patterns,
      cognitiveIndicators,
      timestamp: now,
    };

    // パターンを保存
    this.saveBehavioralPattern(pattern);

    return pattern;
  }

  /**
   * クリック頻度の計算
   */
  private calculateClickFrequency(interactions: UserInteraction[]): number {
    const clicks = interactions.filter((i) => i.type === 'click');
    const duration = this.getInteractionDuration(interactions);
    return duration > 0 ? (clicks.length / duration) * 60000 : 0; // 回/分
  }

  /**
   * タスク切り替え頻度の計算
   */
  private calculateTaskSwitchingRate(interactions: UserInteraction[]): number {
    let switches = 0;
    let lastElement = '';

    for (const interaction of interactions) {
      if (interaction.element && interaction.element !== lastElement) {
        if (lastElement && this.isDifferentTask(lastElement, interaction.element)) {
          switches++;
        }
        lastElement = interaction.element;
      }
    }

    const duration = this.getInteractionDuration(interactions);
    return duration > 0 ? (switches / duration) * 60000 : 0; // 回/分
  }

  /**
   * 平均休止時間の計算
   */
  private calculateAveragePauseDuration(interactions: UserInteraction[]): number {
    if (interactions.length < 2) return 0;

    let totalPause = 0;
    for (let i = 1; i < interactions.length; i++) {
      const pause = interactions[i].timestamp.getTime() - interactions[i - 1].timestamp.getTime();
      totalPause += pause;
    }

    return totalPause / (interactions.length - 1);
  }

  /**
   * フォーカス安定性の計算
   */
  private calculateFocusStability(interactions: UserInteraction[]): number {
    const focusEvents = interactions.filter((i) => i.type === 'focus');
    if (focusEvents.length < 2) return 1.0;

    let stableTime = 0;
    for (let i = 1; i < focusEvents.length; i++) {
      const duration = focusEvents[i].timestamp.getTime() - focusEvents[i - 1].timestamp.getTime();
      if (duration > 3000) {
        // 3秒以上は安定とみなす
        stableTime += duration;
      }
    }

    const totalTime = this.getInteractionDuration(focusEvents);
    return totalTime > 0 ? stableTime / totalTime : 1.0;
  }

  /**
   * エラー率の計算
   */
  private calculateErrorRate(interactions: UserInteraction[]): number {
    // 簡略化: 連続する同じ要素への操作をエラーとみなす
    let errors = 0;
    let lastElement = '';
    let sameElementCount = 0;

    for (const interaction of interactions) {
      if (interaction.element === lastElement) {
        sameElementCount++;
        if (sameElementCount > 2) {
          errors++;
        }
      } else {
        sameElementCount = 1;
        lastElement = interaction.element || '';
      }
    }

    return interactions.length > 0 ? errors / interactions.length : 0;
  }

  /**
   * 認知指標の計算
   */
  private calculateCognitiveIndicators(patterns: BehavioralPattern['patterns']) {
    const baseline = this.baselines.adhd; // ADHD特性を基準とする

    // 注意力レベル（フォーカス安定性とタスク切り替え頻度から推定）
    const attentionLevel = Math.max(
      0,
      Math.min(
        100,
        patterns.focusStability * 100 -
          (patterns.taskSwitchingRate / baseline.taskSwitchingRate) * 30
      )
    );

    // エネルギーレベル（クリック頻度と操作間隔から推定）
    const energyLevel = Math.max(
      0,
      Math.min(
        100,
        (patterns.clickFrequency / baseline.clickFrequency) * 70 +
          (baseline.pauseDuration / patterns.pauseDuration) * 30
      )
    );

    // ストレスレベル（エラー率とタスク切り替え頻度から推定）
    const stressLevel = Math.max(
      0,
      Math.min(
        100,
        (patterns.errorRate / baseline.errorRate) * 50 +
          (patterns.taskSwitchingRate / baseline.taskSwitchingRate) * 50
      )
    );

    // 認知負荷（複数の指標から総合的に推定）
    const cognitiveLoad = Math.max(
      0,
      Math.min(
        100,
        (patterns.taskSwitchingRate / baseline.taskSwitchingRate) * 40 +
          (patterns.errorRate / baseline.errorRate) * 30 +
          (1 - patterns.focusStability) * 30
      )
    );

    // フロー状態（高い注意力と適度なエネルギーから推定）
    const flowState = Math.max(
      0,
      Math.min(100, attentionLevel * 0.6 + energyLevel * 0.4 - stressLevel * 0.3)
    );

    return {
      attentionLevel: Math.round(attentionLevel),
      energyLevel: Math.round(energyLevel),
      stressLevel: Math.round(stressLevel),
      cognitiveLoad: Math.round(cognitiveLoad),
      flowState: Math.round(flowState),
    };
  }

  /**
   * 認知状態の推定
   */
  private estimateCognitiveState(): CognitiveState {
    const currentPattern = this.analyzeCurrentBehavior();
    const historicalPatterns = this.getRecentPatterns();

    // トレンド分析
    const trend = this.analyzeTrend(historicalPatterns);
    const confidence = this.calculateConfidence(historicalPatterns);

    // 推奨事項の生成
    const recommendations = this.generateRecommendations(currentPattern);

    return {
      current: {
        attention: currentPattern.cognitiveIndicators.attentionLevel,
        energy: currentPattern.cognitiveIndicators.energyLevel,
        stress: currentPattern.cognitiveIndicators.stressLevel,
        cognitiveLoad: currentPattern.cognitiveIndicators.cognitiveLoad,
        flow: currentPattern.cognitiveIndicators.flowState,
      },
      trend,
      confidence,
      recommendations,
    };
  }

  /**
   * 推奨事項の生成
   */
  private generateRecommendations(pattern: BehavioralPattern): string[] {
    const recommendations: string[] = [];
    const indicators = pattern.cognitiveIndicators;

    if (indicators.attentionLevel < 50) {
      recommendations.push('💡 注意力が低下しています。短い休憩を取ることをお勧めします');
    }

    if (indicators.energyLevel < 40) {
      recommendations.push('⚡ エネルギーが不足しています。軽い運動や深呼吸をしてみましょう');
    }

    if (indicators.stressLevel > 70) {
      recommendations.push('😌 ストレスレベルが高めです。リラックスできる音楽を聞いてみませんか？');
    }

    if (indicators.cognitiveLoad > 80) {
      recommendations.push('🧠 認知負荷が高すぎます。タスクを分割して取り組みましょう');
    }

    if (indicators.flowState > 80) {
      recommendations.push('🎯 集中状態が良好です！この調子で続けましょう');
    }

    if (pattern.patterns.taskSwitchingRate > this.baselines.adhd.taskSwitchingRate * 1.5) {
      recommendations.push('🎯 タスクの切り替えが頻繁です。一つのことに集中してみませんか？');
    }

    return recommendations;
  }

  // ヘルパーメソッド
  private createEmptyPattern(): BehavioralPattern {
    return {
      userId: 'current-user',
      sessionId: this.currentSession,
      patterns: {
        clickFrequency: 0,
        scrollSpeed: 0,
        taskSwitchingRate: 0,
        pauseDuration: 0,
        errorRate: 0,
        focusStability: 1,
        timeOfDay: this.getTimeOfDay(),
        sessionDuration: 0,
      },
      cognitiveIndicators: {
        attentionLevel: 50,
        energyLevel: 50,
        stressLevel: 30,
        cognitiveLoad: 40,
        flowState: 50,
      },
      timestamp: new Date(),
    };
  }

  private getInteractionDuration(interactions: UserInteraction[]): number {
    if (interactions.length < 2) return 0;
    return (
      interactions[interactions.length - 1].timestamp.getTime() -
      interactions[0].timestamp.getTime()
    );
  }

  private isDifferentTask(element1: string, element2: string): boolean {
    // 簡略化: 異なる要素タイプは異なるタスクとみなす
    const type1 = element1.split('.')[0];
    const type2 = element2.split('.')[0];
    return type1 !== type2;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private saveBehavioralPattern(pattern: BehavioralPattern): void {
    const userPatterns = this.patterns.get(pattern.userId) || [];
    userPatterns.push(pattern);

    // 直近100パターンのみ保持
    if (userPatterns.length > 100) {
      userPatterns.splice(0, userPatterns.length - 100);
    }

    this.patterns.set(pattern.userId, userPatterns);
  }

  private getRecentPatterns(): BehavioralPattern[] {
    const userPatterns = this.patterns.get('current-user') || [];
    return userPatterns.slice(-10); // 直近10パターン
  }

  private analyzeTrend(patterns: BehavioralPattern[]): 'improving' | 'stable' | 'declining' {
    if (patterns.length < 3) return 'stable';

    const recent = patterns.slice(-3);
    const avgRecent =
      recent.reduce((sum, p) => sum + p.cognitiveIndicators.attentionLevel, 0) / recent.length;
    const avgOlder =
      patterns.slice(-6, -3).reduce((sum, p) => sum + p.cognitiveIndicators.attentionLevel, 0) / 3;

    if (avgRecent > avgOlder + 10) return 'improving';
    if (avgRecent < avgOlder - 10) return 'declining';
    return 'stable';
  }

  private calculateConfidence(patterns: BehavioralPattern[]): number {
    // パターン数が多いほど信頼度が高い
    const patternCount = patterns.length;
    const sessionDuration = Date.now() - new Date(this.currentSession.split('-')[1]).getTime();

    let confidence = Math.min(1, patternCount / 10); // 10パターンで最大信頼度
    confidence *= Math.min(1, sessionDuration / (30 * 60 * 1000)); // 30分で最大信頼度

    return Math.round(confidence * 100) / 100;
  }

  private finalizeSession(): void {
    this.isTracking = false;
    this.emit('sessionFinalized', {
      sessionId: this.currentSession,
      duration: Date.now() - new Date(this.currentSession.split('-')[1]).getTime(),
      totalInteractions: this.interactions.length,
    });
  }

  // 公開メソッド
  public startTracking(): void {
    this.isTracking = true;
    console.log('🔍 行動パターン追跡を開始しました');
  }

  public stopTracking(): void {
    this.isTracking = false;
    console.log('⏹️ 行動パターン追跡を停止しました');
  }

  public getCurrentCognitiveState(): CognitiveState {
    return this.estimateCognitiveState();
  }

  public getBehavioralSummary(): any {
    const patterns = this.getRecentPatterns();
    if (patterns.length === 0) return null;

    const latest = patterns[patterns.length - 1];
    return {
      current: latest,
      summary: {
        avgAttention:
          patterns.reduce((sum, p) => sum + p.cognitiveIndicators.attentionLevel, 0) /
          patterns.length,
        avgEnergy:
          patterns.reduce((sum, p) => sum + p.cognitiveIndicators.energyLevel, 0) / patterns.length,
        avgStress:
          patterns.reduce((sum, p) => sum + p.cognitiveIndicators.stressLevel, 0) / patterns.length,
        sessionCount: patterns.length,
      },
    };
  }
}

export default BehavioralPatternDetector;
