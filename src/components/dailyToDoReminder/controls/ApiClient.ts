/**
 * APIクライアント
 * バックエンドAPIとの通信を担当するクラス
 */
import { ApiResponse, RequestConfig, ApiResponseMeta } from './ApiTypes';
import Logger from './Logger';
import ApiRequestQueue from './ApiRequestQueue';
import NetworkMonitor from './NetworkMonitor';
import ApiClientConfig from './ApiClientConfig';
import ApiError from './ApiError';

class ApiClient {
  private static instance: ApiClient;
  private config: ApiClientConfig;
  private requestQueue: ApiRequestQueue;
  private networkMonitor: NetworkMonitor;
  private pendingRequests: Map<string, Promise<ApiResponse<unknown>>>;
  private logger: Logger;
  
  private constructor() {
    this.config = new ApiClientConfig();
    this.requestQueue = new ApiRequestQueue();
    this.networkMonitor = new NetworkMonitor();
    this.pendingRequests = new Map();
    this.logger = Logger.getInstance();
    
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
   * リクエストキーの生成（重複リクエスト防止用）
   */
  private generateRequestKey(
    method: string,
    endpoint: string,
    data?: unknown
  ): string {
    // data引数の型を修正し、JSON.stringify時に安全に処理
    let dataString = '';
    
    if (data !== undefined && data !== null) {
      try {
        if (typeof data === 'object') {
          dataString = JSON.stringify(data);
        } else {
          dataString = String(data);
        }
      } catch (error) {
        this.logger.warn(
          'リクエストデータのキャッシュ用文字列化に失敗しました',
          { method, endpoint, error }
        );
        dataString = 'unstringifiable-data';
      }
    }
    
    return `${method}-${endpoint}-${dataString}`;
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
    const startTime = Date.now();
    
    // リクエストキャンセル用コントローラー
    const controller = config.signal 
      ? undefined 
      : new AbortController();
    
    // タイムアウト設定
    const timeoutMs = config.timeout || this.config.requestTimeoutMs;
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }
    
    // ヘッダーのマージ
    const headers = {
      ...this.config.getHeaders(),
      ...options.headers
    };
    
    // リトライ処理を含む実際のリクエスト関数
    const executeRequest = async (retryCount = 0): Promise<ApiResponse<T>> => {
      try {
        // オフライン時はキューに追加
        if (!this.networkMonitor.isOnline()) {
          this.logger.warn('オフライン状態でリクエストが実行されました。キューに追加します。', {
            method,
            endpoint
          });
          
          return new Promise((resolve, reject) => {
            this.requestQueue.enqueue({
              execute: () => executeRequest().then(resolve).catch(reject),
              priority: config.priority || 'normal'
            });
          });
        }
        
        const signal = config.signal || (controller ? controller.signal : undefined);
        
        const fetchOptions: RequestInit = {
          ...options,
          headers,
          signal,
          credentials: config.withCredentials ? 'include' : 'same-origin',
          cache: config.cache as RequestCache
        };
        
        const response = await fetch(url, fetchOptions);
        
        // レスポンスのパース
        let data: unknown;
        const contentType = response.headers.get('Content-Type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }
        }
        
        // 処理時間の計算
        const processingTime = Date.now() - startTime;
        
        // レスポンスメタデータの作成
        const meta: ApiResponseMeta = {
          requestId: response.headers.get('X-Request-ID') || undefined,
          timestamp: startTime,
          processingTime
        };
        
        // キャッシュ情報を追加
        const cacheControl = response.headers.get('Cache-Control') || '';
        const age = response.headers.get('Age');
        
        if (cacheControl || age) {
          meta.cache = {
            hit: !!response.headers.get('X-Cache')?.includes('HIT'),
            stale: cacheControl.includes('must-revalidate') && !!age,
            age: age ? parseInt(age, 10) : undefined
          };
        }
        
        // エラーレスポンスの処理
        if (!response.ok) {
          const errorMessage = 
            typeof data === 'object' && data !== null && 'message' in data 
              ? String(data.message) 
              : `Error: ${response.status}`;
          
          // 再試行が必要なステータスコードの場合（5xx系など）
          if (
            response.status >= 500 && 
            retryCount < (config.retry || this.config.maxRetries)
          ) {
            this.logger.warn(
              `サーバーエラーのためリクエストを再試行します: ${errorMessage}`,
              { statusCode: response.status, retryCount }
            );
            
            return await this.retryRequest<T>(executeRequest, retryCount, config);
          }
          
          return {
            success: false,
            error: errorMessage,
            statusCode: response.status,
            meta
          };
        }
        
        // 成功レスポンスの処理
        return { 
          success: true, 
          data: data as T,
          statusCode: response.status,
          meta
        };
      } catch (error) {
        // API専用のエラークラスに変換
        const apiError = error instanceof Error 
          ? new ApiError(error.message, { cause: error }) 
          : new ApiError('不明なエラーが発生しました');
        
        // AbortErrorの場合（タイムアウトなど）
        if (error instanceof DOMException && error.name === 'AbortError') {
          this.logger.error(`APIリクエストタイムアウト [${endpoint}]`);
          
          if (retryCount < (config.retry || this.config.maxRetries)) {
            return await this.retryRequest<T>(executeRequest, retryCount, config);
          }
          
          apiError.code = 'TIMEOUT';
          apiError.message = 'リクエストがタイムアウトしました。インターネット接続を確認してください。';
        }
        
        // ネットワークエラー
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          apiError.code = 'NETWORK_ERROR';
          apiError.message = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        }
        
        return {
          success: false,
          error: apiError.message,
          statusCode: apiError.statusCode,
          meta: {
            timestamp: startTime,
            processingTime: Date.now() - startTime,
            errorCode: apiError.code
          }
        };
      }
    };
    
    try {
      // GETリクエストの場合、pendingRequestsに追加
      const requestKey = this.generateRequestKey(method, endpoint, options.body);
      
      if (method === 'GET' && config.cache !== 'no-cache') {
        const pendingRequest = this.pendingRequests.get(requestKey);
        
        if (pendingRequest) {
          return pendingRequest as Promise<ApiResponse<T>>;
        }
        
        const requestPromise = executeRequest();
        this.pendingRequests.set(requestKey, requestPromise);
        
        // リクエスト完了後にpendingRequestsから削除
        requestPromise.finally(() => {
          this.pendingRequests.delete(requestKey);
        });
        
        return requestPromise;
      }
      
      return await executeRequest();
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * リクエストの再試行
   */
  private async retryRequest<T>(
    executeRequest: (retryCount: number) => Promise<ApiResponse<T>>,
    currentRetry: number,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // 指数バックオフでリトライ間隔を計算
    const retryDelay = config.retryDelay || this.config.retryDelay;
    const delay = retryDelay * Math.pow(2, currentRetry);
    
    // リトライ前に待機
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // リクエストを再実行
    return executeRequest(currentRetry + 1);
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
}

export default ApiClient;