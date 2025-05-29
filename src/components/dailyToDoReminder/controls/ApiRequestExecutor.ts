/**
 * APIリクエスト実行担当クラス
 * リクエストの実際の実行とエラーハンドリングを担当
 */
import { ApiResponse, RequestConfig, ApiResponseMeta } from './ApiTypes';
import ApiClientConfig from './ApiClientConfig';
import ApiError from './ApiError';
import Logger from './Logger';
import ApiMetricsCollector from './ApiMetricsCollector';

interface QueuedRequest {
  execute: () => Promise<unknown>;
  priority: 'high' | 'normal' | 'low';
}

class ApiRequestExecutor {
  private config: ApiClientConfig;
  private logger: Logger;
  private metrics: ApiMetricsCollector;

  constructor(config: ApiClientConfig, logger: Logger, metrics: ApiMetricsCollector) {
    this.config = config;
    this.logger = logger;
    this.metrics = metrics;
  }

  /**
   * リクエストキーの生成（重複リクエスト防止・キャッシュ用）
   */
  public generateRequestKey(method: string, endpoint: string, data?: unknown): string {
    let dataString = '';

    if (data !== undefined && data !== null) {
      try {
        if (typeof data === 'object') {
          dataString = JSON.stringify(data);
        } else {
          dataString = String(data);
        }
      } catch (error) {
        this.logger.warn('リクエストデータのキャッシュ用文字列化に失敗しました', {
          method,
          endpoint,
          error,
        });
        dataString = 'unstringifiable-data';
      }
    }

    return `${method}-${endpoint}-${dataString}`;
  }

  /**
   * API リクエストの実行
   */
  public async execute<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig,
    isOnline: boolean,
    queueCallback: (request: QueuedRequest) => void
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // メトリクスの記録開始
    this.metrics.startRequest(url, method);

    // リクエストキャンセル用コントローラー
    const controller = config.signal ? undefined : new AbortController();

    // タイムアウト設定
    const timeoutMs = config.timeout || this.config.requestTimeoutMs;
    let timeoutId: NodeJS.Timeout | undefined;

    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    // ヘッダーのマージ
    const headers = {
      ...this.config.getHeaders(),
      ...options.headers,
      'X-Request-ID': requestId,
    };

    // リトライ処理を含む実際のリクエスト関数
    const executeRequest = async (retryCount = 0): Promise<ApiResponse<T>> => {
      try {
        // オフライン時はキューに追加
        if (!isOnline) {
          this.logger.warn('オフライン状態でリクエストが実行されました。キューに追加します。', {
            method,
            url,
          });

          return new Promise((resolve, reject) => {
            queueCallback({
              execute: () => executeRequest().then(resolve).catch(reject),
              priority: config.priority || 'normal',
            });
          });
        }

        const signal = config.signal || (controller ? controller.signal : undefined);

        const fetchOptions: RequestInit = {
          ...options,
          headers,
          signal,
          credentials: config.withCredentials ? 'include' : 'same-origin',
          cache: config.cache as RequestCache,
        };

        const response = await fetch(url, fetchOptions);

        // レスポンスのパース
        const data = await this.parseResponse(response);

        // 処理時間の計算
        const processingTime = Date.now() - startTime;

        // メトリクス記録
        this.metrics.endRequest(url, method, response.status, processingTime);

        // レスポンスメタデータの作成
        const meta = this.createResponseMeta(response, startTime, processingTime);

        // エラーレスポンスの処理
        if (!response.ok) {
          const errorMessage =
            typeof data === 'object' && data !== null && 'message' in data
              ? String(data.message)
              : `Error: ${response.status}`;

          // 再試行が必要なステータスコードの場合（5xx系など）
          if (response.status >= 500 && retryCount < (config.retry || this.config.maxRetries)) {
            this.logger.warn(`サーバーエラーのためリクエストを再試行します: ${errorMessage}`, {
              statusCode: response.status,
              retryCount,
            });

            return await this.retryRequest<T>(executeRequest, retryCount, config);
          }

          return {
            success: false,
            error: errorMessage,
            statusCode: response.status,
            meta,
          };
        }

        // 成功レスポンスの処理
        return {
          success: true,
          data: data as T,
          statusCode: response.status,
          meta,
        };
      } catch (error) {
        // APIエラーへの変換とエラー処理
        return this.handleRequestError<T>(error, url, startTime);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    return executeRequest();
  }

  /**
   * リクエストIDの生成
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * レスポンスのパース
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    }
  }

  /**
   * レスポンスメタデータの作成
   */
  private createResponseMeta(
    response: Response,
    startTime: number,
    processingTime: number
  ): ApiResponseMeta {
    const meta: ApiResponseMeta = {
      requestId: response.headers.get('X-Request-ID') || undefined,
      timestamp: startTime,
      processingTime,
    };

    // キャッシュ情報を追加
    const cacheControl = response.headers.get('Cache-Control') || '';
    const age = response.headers.get('Age');

    if (cacheControl || age) {
      meta.cache = {
        hit: !!response.headers.get('X-Cache')?.includes('HIT'),
        stale: cacheControl.includes('must-revalidate') && !!age,
        age: age ? parseInt(age, 10) : undefined,
      };
    }

    return meta;
  }

  /**
   * リクエストエラーの処理
   */
  private handleRequestError<T>(error: unknown, url: string, startTime: number): ApiResponse<T> {
    const processingTime = Date.now() - startTime;
    this.metrics.recordError(url, String(error));

    // エラーオブジェクトの作成
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = new ApiError(error.message, {
        cause: error,
        endpoint: url,
      });

      // AbortErrorの場合（タイムアウトなど）
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logger.error(`APIリクエストタイムアウト [${url}]`);

        // 注意: codeプロパティはread-onlyなので、コンストラクタで設定する必要がある
        apiError = new ApiError(
          'リクエストがタイムアウトしました。インターネット接続を確認してください。',
          {
            cause: error,
            code: 'TIMEOUT',
            endpoint: url,
          }
        );
      }

      // ネットワークエラー
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        apiError = new ApiError(
          'ネットワークエラーが発生しました。インターネット接続を確認してください。',
          {
            cause: error,
            code: 'NETWORK_ERROR',
            endpoint: url,
          }
        );
      }
    } else {
      apiError = new ApiError('不明なエラーが発生しました', {
        endpoint: url,
      });
    }

    return {
      success: false,
      error: apiError.message,
      statusCode: apiError.statusCode,
      meta: {
        timestamp: startTime,
        processingTime,
        errorCode: apiError.code,
        requestId: apiError.requestId,
      },
    };
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
    await new Promise((resolve) => setTimeout(resolve, delay));

    // リクエストを再実行
    return executeRequest(currentRetry + 1);
  }
}

export default ApiRequestExecutor;
