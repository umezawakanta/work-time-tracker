/**
 * APIメトリクスコレクター
 * APIリクエストのパフォーマンスと利用状況を収集・分析するクラス
 */
import { HttpMethod } from './ApiTypes';

/**
 * メトリクスデータ型
 */
interface MetricsData {
  timestamp: number;
  value: number;
}

/**
 * APIメトリクスコレクタークラス
 */
export class ApiMetricsCollector {
  private static instance: ApiMetricsCollector | null = null;
  private counters: Map<string, number>;
  private durations: Map<string, number[]>;
  private timeSeriesData: Map<string, MetricsData[]>;
  private readonly MAX_SAMPLES = 1000;
  private readonly MAX_TIME_SERIES = 10000;
  private readonly RETENTION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7日間
  private lastCleanup: number;

  constructor() {
    this.counters = new Map();
    this.durations = new Map();
    this.timeSeriesData = new Map();
    this.lastCleanup = Date.now();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): ApiMetricsCollector {
    if (!ApiMetricsCollector.instance) {
      ApiMetricsCollector.instance = new ApiMetricsCollector();
    }
    return ApiMetricsCollector.instance;
  }

  /**
   * カウンターを増加
   */
  public incrementCounter(key: string, value = 1): void {
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);
    
    // 時系列データも記録
    this.recordTimeSeriesData(`counter:${key}`, value);
    
    this.checkAndCleanup();
  }

  /**
   * カウンターを取得
   */
  public getCounter(key: string): number {
    return this.counters.get(key) || 0;
  }

  /**
   * すべてのカウンターを取得
   */
  public getAllCounters(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  /**
   * リクエスト実行時間を記録
   */
  public recordRequestDuration(
    service: string,
    method: HttpMethod | string,
    endpoint: string,
    durationMs: number
  ): void {
    const key = `${service}:${method}:${endpoint}`;
    const durations = this.durations.get(key) || [];
    
    // 配列のサイズ制限を適用
    if (durations.length >= this.MAX_SAMPLES) {
      durations.shift(); // 最も古いサンプルを削除
    }
    
    durations.push(durationMs);
    this.durations.set(key, durations);
    
    // 時系列データも記録
    this.recordTimeSeriesData(`duration:${key}`, durationMs);
    
    this.checkAndCleanup();
  }

  /**
   * サービスの平均応答時間を取得
   */
  public getAverageResponseTime(service: string): number {
    let totalDuration = 0;
    let sampleCount = 0;
    
    // 指定サービスに関連するすべてのエンドポイントを集計
    for (const [key, durations] of this.durations.entries()) {
      if (key.startsWith(`${service}:`)) {
        for (const duration of durations) {
          totalDuration += duration;
          sampleCount++;
        }
      }
    }
    
    return sampleCount > 0 ? Math.round(totalDuration / sampleCount) : 0;
  }

  /**
   * エンドポイントの平均応答時間を取得
   */
  public getEndpointAverageResponseTime(
    service: string,
    method: HttpMethod | string,
    endpoint: string
  ): number {
    const key = `${service}:${method}:${endpoint}`;
    const durations = this.durations.get(key) || [];
    
    if (durations.length === 0) {
      return 0;
    }
    
    const sum = durations.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / durations.length);
  }

  /**
   * 時系列データを記録
   */
  private recordTimeSeriesData(key: string, value: number): void {
    const currentData = this.timeSeriesData.get(key) || [];
    currentData.push({
      timestamp: Date.now(),
      value
    });
    
    // 配列のサイズ制限を適用
    if (currentData.length > this.MAX_TIME_SERIES) {
      currentData.shift();
    }
    
    this.timeSeriesData.set(key, currentData);
  }

  /**
   * 時系列データを取得
   */
  public getTimeSeriesData(
    key: string,
    startTime?: number,
    endTime?: number
  ): MetricsData[] {
    const data = this.timeSeriesData.get(key) || [];
    
    if (!startTime && !endTime) {
      return [...data];
    }
    
    const now = Date.now();
    const filteredData = data.filter((item) => {
      const isAfterStart = !startTime || item.timestamp >= startTime;
      const isBeforeEnd = !endTime || item.timestamp <= (endTime || now);
      return isAfterStart && isBeforeEnd;
    });
    
    return filteredData;
  }

  /**
   * すべてのメトリクスをエクスポート
   */
  public exportMetrics(): Record<string, unknown> {
    return {
      timestamp: Date.now(),
      counters: Object.fromEntries(this.counters),
      averageDurations: this.calculateAverageDurations(),
      samplesCount: this.calculateSamplesCounts()
    };
  }

  /**
   * すべてのエンドポイントの平均応答時間を計算
   */
  private calculateAverageDurations(): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const [key, durations] of this.durations.entries()) {
      if (durations.length > 0) {
        const sum = durations.reduce((acc, val) => acc + val, 0);
        result[key] = Math.round(sum / durations.length);
      }
    }
    
    return result;
  }

  /**
   * サンプル数を計算
   */
  private calculateSamplesCounts(): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const [key, durations] of this.durations.entries()) {
      result[key] = durations.length;
    }
    
    return result;
  }

  /**
   * 定期的なクリーンアップを実行
   */
  private checkAndCleanup(): void {
    const now = Date.now();
    
    // 設定間隔ごとにクリーンアップを実行
    if (now - this.lastCleanup > this.RETENTION_PERIOD_MS / 7) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * 古いメトリクスデータをクリーンアップ
   */
  private cleanup(): void {
    const cutoffTime = Date.now() - this.RETENTION_PERIOD_MS;
    
    // 時系列データのクリーンアップ
    for (const [key, dataArray] of this.timeSeriesData.entries()) {
      const newData = dataArray.filter(item => item.timestamp >= cutoffTime);
      
      if (newData.length === 0) {
        // データが空になった場合はキーを削除
        this.timeSeriesData.delete(key);
      } else if (newData.length < dataArray.length) {
        // 一部のデータが削除された場合は更新
        this.timeSeriesData.set(key, newData);
      }
    }
  }

  /**
   * すべてのメトリクスをリセット
   */
  public resetAllMetrics(): void {
    this.counters.clear();
    this.durations.clear();
    this.timeSeriesData.clear();
  }
}