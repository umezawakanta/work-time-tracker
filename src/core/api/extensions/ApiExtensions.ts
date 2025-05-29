/**
 * API拡張機能
 * APIクラスに追加機能を提供するユーティリティ
 */
import type { ApiResponse, RequestConfig } from '../client/ApiTypes';
import type { BatchRequestItem } from '../batch/BatchTypes';

/**
 * バッチリクエスト結果
 */
interface BatchRequestResult<T> {
  results: Array<ApiResponse<T>>;
  successCount: number;
  failureCount: number;
  allSucceeded: boolean;
}

/**
 * キャッシュストレージ
 */
interface CacheStorage {
  set(key: string, value: unknown, ttl?: number): void;
  get<T>(key: string): T | null;
  has(key: string): boolean;
  remove(key: string): void;
  clear(): void;
}

/**
 * APIに機能を拡張するためのユーティリティ
 */
export function applyExtensionMethods(apiClass: any): void {
  // バッチリクエスト処理
  apiClass.batch = async function <T>(
    requests: BatchRequestItem[],
    config?: RequestConfig
  ): Promise<BatchRequestResult<T>> {
    apiClass.ensureInitialized();

    const results: Array<ApiResponse<T>> = [];
    let successCount = 0;
    let failureCount = 0;

    // バッチ処理情報をログ
    apiClass.logger.info(`バッチリクエスト処理を開始: ${requests.length}件`);

    // 各リクエストを逐次処理
    for (const request of requests) {
      let response: ApiResponse<T>;

      try {
        // リクエストタイプに基づいてAPIメソッドを呼び出す
        switch (request.method.toUpperCase()) {
          case 'GET':
            response = await apiClass.get(request.endpoint, request.params, {
              ...config,
              ...request.config,
            });
            break;
          case 'POST':
            response = await apiClass.post(request.endpoint, request.data, {
              ...config,
              ...request.config,
            });
            break;
          case 'PUT':
            response = await apiClass.put(request.endpoint, request.data, {
              ...config,
              ...request.config,
            });
            break;
          case 'DELETE':
            response = await apiClass.delete(request.endpoint, { ...config, ...request.config });
            break;
          case 'PATCH':
            response = await apiClass.patch(request.endpoint, request.data, {
              ...config,
              ...request.config,
            });
            break;
          default:
            response = {
              success: false,
              data: null,
              status: 400,
              error: {
                code: 'INVALID_METHOD',
                message: `サポートされていないHTTPメソッド: ${request.method}`,
                statusCode: 400,
              },
            };
        }

        // 成功・失敗をカウント
        if (response.success) {
          successCount++;
        } else {
          failureCount++;
        }

        // IDが指定されている場合はレスポンスに追加
        if (request.id) {
          response.requestId = request.id;
        }
      } catch (error) {
        // エラーハンドリング
        response = {
          success: false,
          data: null,
          status: 500,
          error: {
            code: 'REQUEST_FAILED',
            message: error instanceof Error ? error.message : String(error),
            statusCode: 500,
          },
          requestId: request.id,
        };
        failureCount++;
      }

      results.push(response);
    }

    // バッチ処理結果をログ
    apiClass.logger.info(`バッチリクエスト完了: 成功=${successCount}, 失敗=${failureCount}`);

    return {
      results,
      successCount,
      failureCount,
      allSucceeded: failureCount === 0,
    };
  };

  // キャッシュストレージ
  const cacheStorage: CacheStorage = {
    set(key: string, value: unknown, ttl?: number): void {
      try {
        const item = {
          value,
          expiry: ttl ? Date.now() + ttl * 1000 : null,
        };
        localStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
      } catch (error) {
        apiClass.logger.error('キャッシュの保存に失敗しました', error);
      }
    },

    get<T>(key: string): T | null {
      try {
        const item = localStorage.getItem(`api_cache_${key}`);
        if (!item) return null;

        const parsedItem = JSON.parse(item) as { value: T; expiry: number | null };

        // 有効期限切れの場合はnullを返す
        if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
          localStorage.removeItem(`api_cache_${key}`);
          return null;
        }

        return parsedItem.value;
      } catch (error) {
        apiClass.logger.error('キャッシュの読み込みに失敗しました', error);
        return null;
      }
    },

    has(key: string): boolean {
      return localStorage.getItem(`api_cache_${key}`) !== null;
    },

    remove(key: string): void {
      localStorage.removeItem(`api_cache_${key}`);
    },

    clear(): void {
      // api_cache_プレフィックスを持つキーのみをクリア
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      });
    },
  };

  // キャッシュ機能を追加
  apiClass.cache = cacheStorage;

  // キャッシュ付きGETリクエスト
  apiClass.getCached = async function <T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: {
      ttl?: number;
      config?: RequestConfig;
      forceRefresh?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    const ttl = options?.ttl || 300; // デフォルト5分
    const cacheKey = `${endpoint}_${JSON.stringify(params || {})}`;

    // 強制更新が要求されていない場合はキャッシュをチェック
    if (!options?.forceRefresh) {
      const cachedResponse = (apiClass.cache as any).get(cacheKey);
      if (cachedResponse) {
        // キャッシュ情報を追加
        cachedResponse.fromCache = true;
        return cachedResponse;
      }
    }

    // キャッシュが無い場合またはフォースリフレッシュの場合は新しいリクエストを行う
    const response = await apiClass.get(endpoint, params, options?.config);

    // 成功した場合のみキャッシュに保存
    if (response.success) {
      apiClass.cache.set(cacheKey, response, ttl);
    }

    return response;
  };

  // ポーリングリクエスト
  apiClass.poll = function <T>(
    endpointFn: () => string,
    options: {
      interval?: number;
      maxAttempts?: number;
      shouldContinue?: (response: ApiResponse<T>) => boolean;
      params?: Record<string, string>;
      config?: RequestConfig;
      onProgress?: (response: ApiResponse<T>, attempt: number) => void;
    }
  ): { promise: Promise<ApiResponse<T>>; cancel: () => void } {
    const interval = options.interval || 5000; // デフォルト5秒
    const maxAttempts = options.maxAttempts || 12; // デフォルト1分間

    let attempts = 0;
    let timeoutId: number | null = null;
    let isCancelled = false;

    // キャンセル関数
    const cancel = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      isCancelled = true;
    };

    // ポーリング関数
    const pollPromise = new Promise<ApiResponse<T>>((resolve, reject) => {
      const executePoll = async () => {
        if (isCancelled) {
          return;
        }

        attempts++;

        try {
          // エンドポイントが関数の場合は実行
          const endpoint = typeof endpointFn === 'function' ? endpointFn() : endpointFn;

          // リクエストを実行
          const response = await apiClass.get(endpoint, options.params, options.config);

          // 進捗コールバックがあれば呼び出す
          if (options.onProgress) {
            options.onProgress(response, attempts);
          }

          // 継続条件を満たすかチェック
          const shouldContinue = options.shouldContinue
            ? options.shouldContinue(response)
            : !response.success;

          if (!shouldContinue) {
            // 条件を満たした場合は成功として解決
            resolve(response);
            return;
          }

          // 最大試行回数に達した場合
          if (attempts >= maxAttempts) {
            const timeoutResponse: ApiResponse<T> = {
              success: false,
              data: null,
              status: 408,
              error: {
                code: 'POLLING_TIMEOUT',
                message: `最大試行回数(${maxAttempts})に達しました`,
                statusCode: 408,
              },
            };
            resolve(timeoutResponse);
            return;
          }

          // 次のポーリングをスケジュール
          timeoutId = window.setTimeout(executePoll, interval);
        } catch (error) {
          // エラーが発生した場合
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            // 次のポーリングをスケジュール
            timeoutId = window.setTimeout(executePoll, interval);
          }
        }
      };

      // 最初のポーリングを実行
      executePoll();
    });

    return {
      promise: pollPromise as Promise<ApiResponse<T>>,
      cancel,
    };
  };

  // ヘルスチェック
  apiClass.healthCheck = async function (
    endpoint = '/health',
    timeout = 5000
  ): Promise<{
    online: boolean;
    services: Record<string, boolean>;
    latency: number;
  }> {
    apiClass.ensureInitialized();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const startTime = performance.now();

    try {
      const response = await apiClass.get(endpoint, undefined, {
        signal: controller.signal,
        skipErrorHandling: true,
      });

      const latency = performance.now() - startTime;

      if (response.success) {
        // サービス状態をレスポンスから取得
        const services =
          ((response.data as Record<string, unknown>)?.services as Record<string, boolean>) || {};

        return {
          online: true,
          services,
          latency,
        };
      }

      return {
        online: false,
        services: {},
        latency,
      };
    } catch (_error) {
      return {
        online: false,
        services: {},
        latency: performance.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // WebSocketサポート
  apiClass.createWebSocket = function (
    endpoint: string,
    options?: {
      protocols?: string | string[];
      onOpen?: (event: Event) => void;
      onMessage?: (event: MessageEvent) => void;
      onError?: (event: Event) => void;
      onClose?: (event: CloseEvent) => void;
      reconnect?: boolean;
      maxReconnectAttempts?: number;
      reconnectInterval?: number;
    }
  ): WebSocket {
    apiClass.ensureInitialized();

    // URLにベースURLを付加
    const baseUrl = apiClass.apiClient.getConfig().baseURL || '';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = endpoint.startsWith('ws')
      ? endpoint
      : `${wsProtocol}//${baseUrl.replace(/^https?:\/\//, '')}${endpoint}`;

    // WebSocketを作成
    const socket = new WebSocket(wsUrl, options?.protocols);

    // イベントハンドラを設定
    if (options?.onOpen) {
      socket.addEventListener('open', options.onOpen);
    }

    if (options?.onMessage) {
      socket.addEventListener('message', options.onMessage);
    }

    if (options?.onError) {
      socket.addEventListener('error', options.onError);
    }

    // 再接続オプションが有効な場合
    if (options?.reconnect) {
      let reconnectAttempts = 0;
      const maxReconnectAttempts = options.maxReconnectAttempts || 5;
      const reconnectInterval = options.reconnectInterval || 3000;

      // 元のonCloseを保存
      const originalOnClose = options.onClose;

      // 再接続ロジックを含むクローズハンドラ
      const handleClose = (event: CloseEvent) => {
        if (originalOnClose) {
          originalOnClose(event);
        }

        // 正常なクローズの場合は再接続しない
        if (event.code === 1000 || event.code === 1001) {
          return;
        }

        // 最大再接続回数に達していない場合は再接続
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;

          apiClass.logger.info(
            `WebSocketが切断されました。${reconnectInterval}ms後に再接続を試みます (${reconnectAttempts}/${maxReconnectAttempts})`
          );

          setTimeout(() => {
            // 新しいWebSocketを作成
            const newSocket = apiClass.createWebSocket(endpoint, options);

            // 元のソケットのプロパティを新しいソケットに移行
            Object.assign(socket, newSocket);
          }, reconnectInterval);
        } else {
          apiClass.logger.warn(
            `WebSocketの再接続に${maxReconnectAttempts}回失敗しました。再接続を中止します。`
          );
        }
      };

      socket.addEventListener('close', handleClose);
    } else if (options?.onClose) {
      socket.addEventListener('close', options.onClose);
    }

    return socket;
  };

  // 認証情報の更新
  apiClass.setCredentials = function (username: string, password: string): void {
    const credentials = btoa(`${username}:${password}`);
    apiClass.apiClient.updateConfig({
      headers: {
        ...apiClass.apiClient.getConfig().headers,
        Authorization: `Basic ${credentials}`,
      },
    });

    apiClass.logger.info('Basic認証情報が更新されました');
  };

  // リトライ付きリクエスト
  apiClass.withRetry = async function <T>(
    requestFn: () => Promise<ApiResponse<T>>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      retryCondition?: (response: ApiResponse<T>, attempt: number) => boolean;
      onRetry?: (response: ApiResponse<T>, attempt: number) => void;
    }
  ): Promise<ApiResponse<T>> {
    const maxRetries = options?.maxRetries || 3;
    const retryDelay = options?.retryDelay || 1000;

    // リトライ条件のデフォルトは失敗した場合
    const shouldRetry =
      options?.retryCondition || ((response: ApiResponse<T>) => !response.success);

    let attempt = 0;
    let lastResponse: ApiResponse<T>;

    while (attempt <= maxRetries) {
      try {
        const response = await requestFn();
        lastResponse = response;

        // リトライが必要ない場合は結果を返す
        if (!shouldRetry(response, attempt)) {
          return response;
        }

        // 最大リトライ回数に達した場合も結果を返す
        if (attempt >= maxRetries) {
          return response;
        }

        // リトライコールバックがあれば呼び出す
        if (options?.onRetry) {
          options.onRetry(response, attempt + 1);
        }

        // ログにリトライを記録
        apiClass.logger.info(`リクエストをリトライします (${attempt + 1}/${maxRetries})`);

        // 次のリトライまで待機
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } catch (error) {
        // エラーが発生した場合
        if (attempt >= maxRetries) {
          throw error;
        }

        // リトライコールバックがあれば呼び出す
        if (options?.onRetry) {
          options.onRetry(
            {
              success: false,
              data: null,
              status: 0,
              error: {
                code: 'REQUEST_FAILED',
                message: error instanceof Error ? error.message : String(error),
                statusCode: 0,
              },
            } as ApiResponse<T>,
            attempt + 1
          );
        }

        // ログにエラーとリトライを記録
        apiClass.logger.warn(
          `リクエストエラー: ${error instanceof Error ? error.message : String(error)}。リトライします (${attempt + 1}/${maxRetries})`
        );

        // 次のリトライまで待機
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      attempt++;
    }

    // 最大リトライ回数に達した場合は最後のレスポンスを返す
    return lastResponse!;
  };
}
