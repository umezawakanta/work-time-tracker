/**
 * 一括リクエストマネージャー
 * 複数APIリクエストの効率的な実行を担当
 */
import { 
    ApiResponse, 
    RequestData, 
    ExtendedRequestConfig, 
    SubscriptionPlan 
  } from './ApiTypes';
  import Logger from './Logger';
  import { FeatureManager } from './FeatureManager';
  import { ApiMetricsCollector } from './ApiMetricsCollector';
  
  /**
   * 一括リクエスト項目
   */
  export interface BatchRequestItem {
    method: string;
    endpoint: string;
    data?: RequestData;
    config?: ExtendedRequestConfig;
    serviceName?: string;
  }
  
  /**
   * 一括リクエスト実行モード
   */
  export enum BatchExecutionMode {
    PARALLEL = 'parallel', // 並列実行（デフォルト）
    SEQUENTIAL = 'sequential', // 順次実行
    THROTTLED = 'throttled' // スロットル付き並列実行
  }
  
  /**
   * 一括リクエスト設定
   */
  export interface BatchRequestConfig {
    mode?: BatchExecutionMode;
    throttleLimit?: number; // スロットル時の同時実行数
    throttleDelayMs?: number; // スロットル時のリクエスト間隔
    abortOnError?: boolean; // エラー時に残りのリクエストを中止するか
    timeout?: number; // タイムアウト（ミリ秒）
  }
  
  /**
   * 一括リクエストマネージャークラス
   */
  export class BatchRequestManager {
    private apiManager: any; // ApiManagerとの循環参照を避けるためany型を使用
    private featureManager: FeatureManager;
    private metricsCollector: ApiMetricsCollector;
    private logger: Logger;
    
    /**
     * コンストラクタ
     * @param apiManager APIマネージャーインスタンス
     */
    constructor(apiManager: any) {
      this.apiManager = apiManager;
      this.featureManager = FeatureManager.getInstance();
      this.metricsCollector = ApiMetricsCollector.getInstance();
      this.logger = Logger.getInstance();
    }
    
    /**
     * 一括リクエストの実行
     */
    public async executeBatch<T>(
      requests: BatchRequestItem[],
      config: BatchRequestConfig = {}
    ): Promise<Array<ApiResponse<T>>> {
      // 設定のデフォルト値
      const finalConfig: Required<BatchRequestConfig> = {
        mode: config.mode || BatchExecutionMode.PARALLEL,
        throttleLimit: config.throttleLimit || 5,
        throttleDelayMs: config.throttleDelayMs || 200,
        abortOnError: config.abortOnError || false,
        timeout: config.timeout || 30000
      };
      
      // 一括リクエスト機能が利用可能かチェック
      const batchFeature = this.featureManager.checkFeatureLimit('api.batchRequest');
      
      if (!batchFeature.allowed) {
        const userPlan = this.featureManager.getUserPlan();
        
        this.logger.warn('一括リクエスト機能が利用できません', {
          plan: userPlan,
          requestCount: requests.length
        });
        
        return requests.map(() => this.createFeatureLimitError<T>(userPlan));
      }
      
      // リクエスト数が上限を超えていないかチェック
      const maxBatchSize = batchFeature.limit || Infinity;
      if (requests.length > maxBatchSize) {
        this.logger.warn(`一括リクエスト数が上限を超えています: ${requests.length}/${maxBatchSize}`, {
          plan: this.featureManager.getUserPlan()
        });
        
        return requests.map(() => this.createBatchSizeLimitError<T>(maxBatchSize, requests.length));
      }
      
      // 使用回数をインクリメント
      this.featureManager.incrementFeatureUsage('api.batchRequest');
      
      // メトリクスを記録
      this.metricsCollector.incrementCounter('batch_requests');
      this.metricsCollector.recordValue('batch_request_size', requests.length);
      
      // 実行モードに応じてリクエストを処理
      try {
        let results: Array<ApiResponse<T>>;
        
        switch (finalConfig.mode) {
          case BatchExecutionMode.SEQUENTIAL:
            results = await this.executeSequentially<T>(requests, finalConfig);
            break;
          case BatchExecutionMode.THROTTLED:
            results = await this.executeThrottled<T>(requests, finalConfig);
            break;
          case BatchExecutionMode.PARALLEL:
          default:
            results = await this.executeParallel<T>(requests, finalConfig);
            break;
        }
        
        return results;
      } catch (error) {
        this.logger.error('一括リクエスト実行中にエラーが発生しました', { error });
        
        // エラーレスポンスを生成
        const errorResponse: ApiResponse<T> = {
          success: false,
          error: { code: 'ERROR', message: error instanceof Error ? error.message : '一括リクエスト実行中にエラーが発生しました' },
          meta: {
            timestamp: Date.now()
          }
        };
        
        return new Array(requests.length).fill(errorResponse);
      }
    }
    
    /**
     * 並列実行
     */
    private async executeParallel<T>(
      requests: BatchRequestItem[],
      config: Required<BatchRequestConfig>
    ): Promise<Array<ApiResponse<T>>> {
      // タイムアウト処理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`一括リクエストがタイムアウトしました (${config.timeout}ms)`));
        }, config.timeout);
      });
      
      // すべてのリクエストを並列実行
      const requestPromises = requests.map(req =>
        this.apiManager.request<T>(
          req.serviceName || 'default',
          req.method,
          req.endpoint,
          req.data,
          req.config
        )
      );
      
      // Promise.raceを使ってタイムアウト処理を追加
      return Promise.race([
        Promise.all(requestPromises),
        timeoutPromise
      ]);
    }
    
    /**
     * 順次実行
     */
    private async executeSequentially<T>(
      requests: BatchRequestItem[],
      config: Required<BatchRequestConfig>
    ): Promise<Array<ApiResponse<T>>> {
      const results: Array<ApiResponse<T>> = [];
      const startTime = Date.now();
      
      for (const req of requests) {
        // タイムアウトチェック
        if (Date.now() - startTime > config.timeout) {
          throw new Error(`一括リクエストがタイムアウトしました (${config.timeout}ms)`);
        }
        
        const response = await this.apiManager.request<T>(
          req.serviceName || 'default',
          req.method,
          req.endpoint,
          req.data,
          req.config
        );
        
        results.push(response);
        
        // エラー時に中止する設定の場合
        if (config.abortOnError && !response.success) {
          // 残りのリクエストに対してエラーレスポンスを生成
          const remainingCount = requests.length - results.length;
          if (remainingCount > 0) {
            const errorResponse: ApiResponse<T> = {
              success: false,
              error: { code: 'ERROR', message: '先行リクエストのエラーにより中止されました' },
              meta: {
                timestamp: Date.now(),
                errorHandled: true
              }
            };
            
            results.push(...new Array(remainingCount).fill(errorResponse));
          }
          
          break;
        }
      }
      
      return results;
    }
    
    /**
     * スロットル付き並列実行
     */
    private async executeThrottled<T>(
      requests: BatchRequestItem[],
      config: Required<BatchRequestConfig>
    ): Promise<Array<ApiResponse<T>>> {
      const results: Array<ApiResponse<T>> = new Array(requests.length);
      const startTime = Date.now();
      
      // 同時実行数を制限するためのセマフォのような処理
      const executeWithThrottle = async (index: number): Promise<void> => {
        // タイムアウトチェック
        if (Date.now() - startTime > config.timeout) {
          throw new Error(`一括リクエストがタイムアウトしました (${config.timeout}ms)`);
        }
        
        const req = requests[index];
        const response = await this.apiManager.request<T>(
          req.serviceName || 'default',
          req.method,
          req.endpoint,
          req.data,
          req.config
        );
        
        results[index] = response;
      };
      
      // リクエストをチャンクに分割
      const chunks: Array<number[]> = [];
      for (let i = 0; i < requests.length; i += config.throttleLimit) {
        chunks.push(Array.from(
          { length: Math.min(config.throttleLimit, requests.length - i) },
          (_, j) => i + j
        ));
      }
      
      // チャンクごとに並列実行
      for (const chunk of chunks) {
        // チャンク内のリクエストを並列実行
        await Promise.all(chunk.map(index => executeWithThrottle(index)));
        
        // エラー時に中止する設定の場合
        if (config.abortOnError && results.some(r => r && !r.success)) {
          // 未実行のリクエストに対してエラーレスポンスを生成
          const errorResponse: ApiResponse<T> = {
            success: false,
            error: { code: 'ERROR', message: '先行リクエストのエラーにより中止されました' },
            meta: {
              timestamp: Date.now(),
              errorHandled: true
            }
          };
          
          for (let i = 0; i < results.length; i++) {
            if (results[i] === undefined) {
              results[i] = errorResponse;
            }
          }
          
          break;
        }
        
        // チャンク間の遅延
        if (config.throttleDelayMs > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.throttleDelayMs));
        }
      }
      
      return results;
    }
    
    /**
     * 機能制限エラーレスポンスの作成
     */
    private createFeatureLimitError<T>(plan: SubscriptionPlan): ApiResponse<T> {
      return {
        success: false,
        error: { code: 'ERROR', message: '一括リクエスト機能はこのサブスクリプションプランでは利用できません' },
        meta: {
          timestamp: Date.now(),
          featureLimit: {
            allowed: false,
            plan
          }
        }
      };
    }
    
    /**
     * バッチサイズ制限エラーレスポンスの作成
     */
    private createBatchSizeLimitError<T>(limit: number, received: number): ApiResponse<T> {
      return {
        success: false,
        error: { code: 'ERROR', message: `一括リクエスト数が上限を超えています (${limit})` },
        meta: {
          timestamp: Date.now(),
          featureLimit: {
            allowed: false,
            limit,
            received
          }
        }
      };
    }
  }