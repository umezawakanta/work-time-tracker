/**
 * 一括リクエストマネージャー
 * 複数APIリクエストの効率的な実行を担当
 */
import { ApiResponse, RequestData, ExtendedRequestConfig } from './ApiTypes';
import Logger from './Logger';
import { FeatureManager } from './FeatureManager';
import { ApiMetricsCollector } from './ApiMetricsCollector';
import { BatchRequestValidator } from './BatchRequestValidator';
import { BatchExecutionEngine } from './BatchExecutionEngine';
import { BatchRequestOptimizer } from './BatchRequestOptimizer';

/**
 * 一括リクエスト項目の型定義
 */
export interface BatchRequestItem {
  readonly id: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly endpoint: string;
  readonly data?: RequestData;
  readonly config?: ExtendedRequestConfig;
  readonly serviceName?: string;
  readonly priority?: number;
  readonly timeout?: number;
  readonly retryConfig?: BatchRetryConfig;
}

/**
 * 一括リクエスト実行モード
 */
export enum BatchExecutionMode {
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  THROTTLED = 'throttled',
  OPTIMIZED = 'optimized',
}

/**
 * 再試行設定
 */
export interface BatchRetryConfig {
  readonly maxRetries: number;
  readonly backoffMultiplier: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
}

/**
 * 一括リクエスト設定
 */
export interface BatchRequestConfig {
  readonly mode?: BatchExecutionMode;
  readonly throttleLimit?: number;
  readonly throttleDelayMs?: number;
  readonly abortOnError?: boolean;
  readonly timeout?: number;
  readonly enableOptimization?: boolean;
  readonly retryConfig?: BatchRetryConfig;
}

/**
 * API管理インターフェース
 */
interface ApiManagerInterface {
  request(
    serviceName: string,
    method: string,
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<unknown>>;
}

/**
 * バッチリクエスト結果
 */
export interface BatchRequestResult<T = unknown> {
  readonly requestId: string;
  readonly success: boolean;
  readonly data: ApiResponse<T>;
  readonly duration: number;
  readonly retryCount: number;
}

/**
 * エンタープライズ級一括リクエストマネージャー
 * 高性能・高可用性・高セキュリティを実現
 */
export class BatchRequestManager {
  private readonly apiManager: ApiManagerInterface;
  private readonly featureManager: FeatureManager;
  private readonly metricsCollector: ApiMetricsCollector;
  private readonly logger: Logger;
  private readonly validator: BatchRequestValidator;
  private readonly executionEngine: BatchExecutionEngine;
  private readonly optimizer: BatchRequestOptimizer;

  private static readonly DEFAULT_CONFIG: Required<BatchRequestConfig> = {
    mode: BatchExecutionMode.OPTIMIZED,
    throttleLimit: 10,
    throttleDelayMs: 100,
    abortOnError: false,
    timeout: 30000,
    enableOptimization: true,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
    },
  };

  constructor(apiManager: ApiManagerInterface) {
    this.apiManager = apiManager;
    this.featureManager = FeatureManager.getInstance();
    this.metricsCollector = ApiMetricsCollector.getInstance();
    this.logger = Logger.getInstance();
    this.validator = new BatchRequestValidator();
    this.executionEngine = new BatchExecutionEngine(apiManager, this.logger);
    this.optimizer = new BatchRequestOptimizer();
  }

  /**
   * 一括リクエストの実行
   */
  public async executeBatch<T>(
    requests: readonly BatchRequestItem[],
    config: BatchRequestConfig = {}
  ): Promise<readonly BatchRequestResult<T>[]> {
    const finalConfig = { ...BatchRequestManager.DEFAULT_CONFIG, ...config };
    const startTime = performance.now();

    try {
      // リクエスト検証
      this.validator.validateBatchRequest(requests, finalConfig);

      // 機能制限チェック
      await this.checkFeatureLimits(requests.length);

      // リクエスト最適化
      const optimizedRequests = finalConfig.enableOptimization
        ? this.optimizer.optimizeRequests(requests)
        : requests;

      // メトリクス記録開始
      // this.metricsCollector.startBatchOperation(optimizedRequests.length);

      // 実行
      const results = await this.executionEngine.execute<T>(optimizedRequests, finalConfig);

      // 実行時間計測
      const totalDuration = performance.now() - startTime;

      // メトリクス記録
      this.recordMetrics(results, totalDuration, finalConfig);

      return results;
    } catch (error) {
      this.logger.error('バッチリクエスト実行エラー', { error, requestCount: requests.length });
      throw error;
    }
  }

  /**
   * 機能制限チェック
   */
  private async checkFeatureLimits(requestCount: number): Promise<void> {
    const batchFeature = this.featureManager.checkFeatureLimit('api.batchRequest');

    if (!batchFeature.allowed) {
      throw new Error('バッチリクエスト機能が利用できません');
    }

    if (requestCount > (batchFeature.limit || Infinity)) {
      throw new Error(`リクエスト数が上限を超えています: ${requestCount}/${batchFeature.limit}`);
    }

    this.featureManager.incrementFeatureUsage('api.batchRequest');
  }

  /**
   * メトリクス記録
   */
  private recordMetrics<T>(
    results: readonly BatchRequestResult<T>[],
    duration: number,
    config: BatchRequestConfig
  ): void {
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.length - successCount;

    // this.metricsCollector.recordBatchMetrics({
    //   totalRequests: results.length,
    //   successCount,
    //   errorCount,
    //   totalDuration: duration,
    //   averageDuration: duration / results.length,
    //   mode: config.mode || BatchExecutionMode.OPTIMIZED,
    // });

    // 基本的なログ出力に置き換え
    this.logger.info('バッチリクエスト完了', {
      totalRequests: results.length,
      successCount,
      errorCount,
      duration,
    });
  }
}
