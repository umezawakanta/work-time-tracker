/**
 * パフォーマンストラッカー
 * APIリクエストのパフォーマンスを計測・分析するためのユーティリティ
 */
import { ApiLogger } from './ApiLogger';

// ローカルストレージのキー
const STORAGE_KEY = 'api_performance_metrics';

/**
 * 計測中のリクエスト情報
 */
interface TrackingInfo {
  startTime: number;
  endpoint?: string;
  method?: string;
}

/**
 * リクエスト結果情報
 */
interface TrackingResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * エンドポイント別メトリクス
 */
interface EndpointMetrics {
  totalCalls: number;
  successCalls: number;
  failureCalls: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
  lastCallTime: number;
}

/**
 * パフォーマンスメトリクス
 */
interface PerformanceMetrics {
  totalCalls: number;
  successCalls: number;
  failureCalls: number;
  averageTime: number;
  endpoints: Record<string, EndpointMetrics>;
  timeRanges: {
    fast: number; // 300ms以下
    medium: number; // 300ms〜1000ms
    slow: number; // 1000ms〜3000ms
    verySlow: number; // 3000ms以上
  };
  lastUpdated: number;
  sessionStartTime: number;
}

/**
 * パフォーマンストラッカークラス
 */
export class PerformanceTracker {
  private metrics: PerformanceMetrics;
  private activeTrackings: Map<string, TrackingInfo> = new Map();
  private logger = new ApiLogger();
  private initialized = false;

  /**
   * コンストラクタ
   */
  constructor() {
    // メトリクス初期化
    this.metrics = this.createInitialMetrics();
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    // 保存されたメトリクスを読み込み
    this.loadMetrics();

    // 新しいセッションとして記録
    this.metrics.sessionStartTime = Date.now();

    this.initialized = true;
    this.logger.debug('Performance tracker initialized');
  }

  /**
   * メトリクスの初期化
   */
  private createInitialMetrics(): PerformanceMetrics {
    return {
      totalCalls: 0,
      successCalls: 0,
      failureCalls: 0,
      averageTime: 0,
      endpoints: {},
      timeRanges: {
        fast: 0,
        medium: 0,
        slow: 0,
        verySlow: 0,
      },
      lastUpdated: Date.now(),
      sessionStartTime: Date.now(),
    };
  }

  /**
   * 計測開始
   * @param endpoint エンドポイント
   * @param method HTTPメソッド
   * @returns トラッキングID
   */
  public startTracking(endpoint?: string, method?: string): string {
    const trackingId = this.generateTrackingId();

    this.activeTrackings.set(trackingId, {
      startTime: performance.now(),
      endpoint,
      method,
    });

    return trackingId;
  }

  /**
   * 計測終了
   * @param trackingId トラッキングID
   * @param result リクエスト結果
   * @returns 処理時間（ミリ秒）
   */
  public stopTracking(trackingId: string, result: TrackingResult): number {
    const tracking = this.activeTrackings.get(trackingId);

    if (!tracking) {
      this.logger.warn(`Tracking not found for ID: ${trackingId}`);
      return 0;
    }

    // 処理時間の計算
    const endTime = performance.now();
    const executionTime = endTime - tracking.startTime;

    // メトリクスの更新
    this.updateMetrics(tracking, executionTime, result);

    // 追跡を終了
    this.activeTrackings.delete(trackingId);

    return executionTime;
  }

  /**
   * メトリクスの更新
   * @param tracking 計測情報
   * @param executionTime 実行時間
   * @param result リクエスト結果
   */
  private updateMetrics(
    tracking: TrackingInfo,
    executionTime: number,
    result: TrackingResult
  ): void {
    // 総呼び出し数の更新
    this.metrics.totalCalls++;

    // 成功/失敗の更新
    if (result.success) {
      this.metrics.successCalls++;
    } else {
      this.metrics.failureCalls++;
    }

    // 平均時間の更新
    const totalTime = this.metrics.averageTime * (this.metrics.totalCalls - 1) + executionTime;
    this.metrics.averageTime = totalTime / this.metrics.totalCalls;

    // 時間範囲の更新
    if (executionTime <= 300) {
      this.metrics.timeRanges.fast++;
    } else if (executionTime <= 1000) {
      this.metrics.timeRanges.medium++;
    } else if (executionTime <= 3000) {
      this.metrics.timeRanges.slow++;
    } else {
      this.metrics.timeRanges.verySlow++;
    }

    // エンドポイント別メトリクスの更新
    if (tracking.endpoint) {
      const endpointKey = tracking.method
        ? `${tracking.method.toUpperCase()}:${tracking.endpoint}`
        : tracking.endpoint;

      // エンドポイントのメトリクスがなければ初期化
      if (!this.metrics.endpoints[endpointKey]) {
        this.metrics.endpoints[endpointKey] = {
          totalCalls: 0,
          successCalls: 0,
          failureCalls: 0,
          totalTime: 0,
          minTime: executionTime,
          maxTime: executionTime,
          lastCallTime: Date.now(),
        };
      }

      const endpointMetrics = this.metrics.endpoints[endpointKey];

      // 呼び出し数を更新
      endpointMetrics.totalCalls++;
      if (result.success) {
        endpointMetrics.successCalls++;
      } else {
        endpointMetrics.failureCalls++;
      }

      // 総時間の更新
      endpointMetrics.totalTime += executionTime;

      // 最小値/最大値の更新
      endpointMetrics.minTime = Math.min(endpointMetrics.minTime, executionTime);
      endpointMetrics.maxTime = Math.max(endpointMetrics.maxTime, executionTime);

      // 最終呼び出し時間の更新
      endpointMetrics.lastCallTime = Date.now();
    }

    // 最終更新時間
    this.metrics.lastUpdated = Date.now();

    // パフォーマンスの問題がある場合はログに記録
    if (executionTime > 3000) {
      this.logger.warn(
        `Slow request detected: ${tracking.endpoint} took ${executionTime.toFixed(2)}ms`
      );
    }

    // 定期的にメトリクスをストレージに保存
    if (this.metrics.totalCalls % 10 === 0) {
      this.saveMetrics();
    }
  }

  /**
   * 現在のメトリクスを取得
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * エンドポイント別のメトリクスを取得
   * @param endpoint エンドポイント
   * @param method HTTPメソッド
   */
  public getEndpointMetrics(endpoint: string, method?: string): EndpointMetrics | null {
    const endpointKey = method ? `${method.toUpperCase()}:${endpoint}` : endpoint;

    return this.metrics.endpoints[endpointKey] || null;
  }

  /**
   * 最も遅いエンドポイントを取得
   * @param limit 取得数
   */
  public getSlowestEndpoints(limit = 5): Array<{
    endpoint: string;
    averageTime: number;
    callCount: number;
  }> {
    return Object.entries(this.metrics.endpoints)
      .map(([endpoint, metrics]) => ({
        endpoint,
        averageTime: metrics.totalTime / metrics.totalCalls,
        callCount: metrics.totalCalls,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit);
  }

  /**
   * メトリクスをリセット
   */
  public resetMetrics(): void {
    this.metrics = this.createInitialMetrics();
    this.saveMetrics();
    this.logger.info('Performance metrics reset');
  }

  /**
   * メトリクスを保存
   */
  public saveMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      // メトリクスをJSON文字列に変換してローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      this.logger.error('Failed to save performance metrics', error);
    }
  }

  /**
   * メトリクスを読み込み
   */
  private loadMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (storedData) {
        // 保存されたメトリクスを読み込む
        const storedMetrics = JSON.parse(storedData) as PerformanceMetrics;

        // 90日以上前のデータは使用しない
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

        if (storedMetrics.lastUpdated && storedMetrics.lastUpdated > ninetyDaysAgo) {
          this.metrics = storedMetrics;
          this.logger.debug('Loaded performance metrics from storage');
        } else {
          // 古いデータは使用せずにリセット
          this.resetMetrics();
          this.logger.debug('Discarded old performance metrics');
        }
      }
    } catch (error) {
      this.logger.error('Failed to load performance metrics', error);
      // エラー時はメトリクスをリセット
      this.resetMetrics();
    }
  }

  /**
   * ユニークなトラッキングIDを生成
   */
  private generateTrackingId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
