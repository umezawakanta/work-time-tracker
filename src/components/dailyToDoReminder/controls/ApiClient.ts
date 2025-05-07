/**
 * APIクライアント
 * バックエンドAPIとの通信を担当する高性能なクラス
 */
import { ApiResponse, RequestConfig, CachePolicy } from './ApiTypes';
import Logger from './Logger';
import ApiRequestQueue from './ApiRequestQueue';
import NetworkMonitor from './NetworkMonitor';
import ApiClientConfig from './ApiClientConfig';
import ApiError from './ApiError';
import ApiRequestExecutor from './ApiRequestExecutor';
import ApiCache from './ApiCache';
import ApiMetricsCollector from './ApiMetricsCollector';

class ApiClient {
  private static instance: ApiClient;
  private config: ApiClientConfig;
  private requestQueue: ApiRequestQueue;
  private networkMonitor: NetworkMonitor;
  private cache: ApiCache;
  private metrics: ApiMetricsCollector;
  private logger: Logger;
  private requestExecutor: ApiRequestExecutor;
  
  private constructor() {
    this.config = new ApiClientConfig();
    this.requestQueue = new ApiRequestQueue();
    this.networkMonitor = new NetworkMonitor();
    this.cache = new ApiCache();
    this.metrics = new ApiMetricsCollector();
    this.logger = Logger.getInstance();
    this.requestExecutor = new ApiRequestExecutor(
      this.config,
      this.logger,
      this.metrics
    );
    
    // ネットワーク状態の監視を開始
    this.networkMonitor.startMonitoring();
    
    // イベントリスナーの設定
    this.setupEventListeners();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // ネットワーク状態の変化を監視
    this.networkMonitor.onNetworkStatusChange((isOnline) => {
      if (isOnline) {
        this.logger.info('ネットワーク接続が回復しました。保留中のリクエストを再開します。');
        this.requestQueue.processQueue();
      } else {
        this.logger.warn('ネットワーク接続が切断されました。リクエストは保留されます。');
      }
    });
  }

  /**
   * 認証トークンの更新
   */
  public updateAuthToken(token: string | null): void {
    this.config.updateAuthToken(token);
  }

  /**
   * APIリクエストの実行
   */
  public async fetch<T>(
    endpoint: string, 
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const url = this.config.buildUrl(endpoint);
    
    // GETリクエストの場合、キャッシュをチェック
    if (method === 'GET' && config.cachePolicy !== CachePolicy.NoCache) {
      const cacheKey = this.requestExecutor.generateRequestKey(method, endpoint, options.body);
      const cachedResponse = this.cache.get<T>(cacheKey);
      
      if (cachedResponse) {
        this.metrics.recordCacheHit(endpoint);
        return cachedResponse;
      }
      
      // キャッシュミスの記録
      this.metrics.recordCacheMiss(endpoint);
      
      try {
        const response = await this.requestExecutor.execute<T>(
          url, 
          options, 
          config, 
          this.networkMonitor.isOnline(),
          (req) => this.requestQueue.enqueue(req)
        );
        
        // 成功した場合のみキャッシュに保存
        if (response.success && config.cachePolicy !== CachePolicy.NoStore) {
          this.cache.set(cacheKey, response, config.cacheMaxAge);
        }
        
        return response;
      } catch (error) {
        // エラーをログに記録
        this.logger.error('APIリクエスト実行中にエラーが発生しました', { endpoint, error });
        
        // エラーレスポンスの生成
        return this.createErrorResponse<T>(error, endpoint);
      }
    } else {
      // 非GET（POST/PUT/DELETEなど）またはキャッシュなしの場合
      return this.requestExecutor.execute<T>(
        url, 
        options, 
        config, 
        this.networkMonitor.isOnline(),
        (req) => this.requestQueue.enqueue(req)
      );
    }
  }

  /**
   * エラーレスポンスの生成
   */
  private createErrorResponse<T>(error: unknown, endpoint: string): ApiResponse<T> {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
      statusCode: error instanceof ApiError ? error.statusCode : undefined,
      meta: {
        timestamp: Date.now(),
        errorCode: error instanceof ApiError ? error.code : 'UNKNOWN_ERROR',
        endpoint
      }
    };
  }

  /**
   * 設定の取得
   */
  public getConfig(): ApiClientConfig {
    return this.config;
  }

  /**
   * 設定の更新
   */
  public updateConfig(configUpdates: Partial<ApiClientConfig>): void {
    this.config.update(configUpdates);
  }
  
  /**
   * メトリクスの取得
   */
  public getMetrics(): Record<string, unknown> {
    return this.metrics.getMetrics();
  }
  
  /**
   * キャッシュのクリア
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * GraphQLクエリの実行
   */
  public async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(
      this.config.graphqlEndpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      },
      config
    );
  }

  /**
   * 複数のリクエストを並列実行
   */
  public async batchFetch<T>(
    requests: Array<{
      endpoint: string;
      options?: RequestInit;
      config?: RequestConfig;
    }>
  ): Promise<ApiResponse<T>[]> {
    return Promise.all(
      requests.map(request => 
        this.fetch<T>(
          request.endpoint,
          request.options || {},
          request.config || {}
        )
      )
    );
  }
}

export default ApiClient;