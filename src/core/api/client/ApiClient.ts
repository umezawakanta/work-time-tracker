/**
 * APIクライアント
 * HTTPリクエストの基本機能を提供する
 */
import { ApiLogger } from '../tracking/ApiLogger';
import { ApiClientConfig } from './ApiClientConfig';
import { ApiResponse, RequestConfig } from './ApiTypes';

/**
 * APIクライアントクラス
 */
export class ApiClient {
  private static instance: ApiClient | null = null;
  private logger = new ApiLogger();
  private config: typeof ApiClientConfig = { ...ApiClientConfig };
  private authToken: string | null = null;

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * コンストラクタ
   */
  private constructor() {
    this.logger.setContext('ApiClient');

    // トークンを保存領域から読み込む
    this.loadTokenFromStorage();
  }

  /**
   * 保存されたトークンを読み込む
   */
  private loadTokenFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedToken = localStorage.getItem('api_auth_token');
        if (savedToken) {
          this.authToken = savedToken;
          this.logger.debug('認証トークンを読み込みました');
        }
      }
    } catch (error) {
      this.logger.error('トークンの読み込みに失敗しました', error);
    }
  }

  /**
   * 認証トークンを更新
   */
  public updateAuthToken(token: string | null): void {
    this.authToken = token;

    try {
      if (typeof localStorage !== 'undefined') {
        if (token) {
          localStorage.setItem('api_auth_token', token);
        } else {
          localStorage.removeItem('api_auth_token');
        }
      }
    } catch (error) {
      this.logger.error('トークンの保存に失敗しました', error);
    }
  }

  /**
   * 設定を更新
   */
  public updateConfig(config: Partial<typeof ApiClientConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    if (config.baseURL) {
      this.logger.info(`APIベースURLを更新しました: ${config.baseURL}`);
    }
  }

  /**
   * 現在の設定を取得
   */
  public getConfig(): typeof ApiClientConfig {
    return { ...this.config };
  }

  /**
   * リクエストを実行
   */
  public async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();

    // エンドポイントのURL構築
    const url = this.buildUrl(endpoint);

    // リクエスト設定の構築
    const requestConfig = this.buildRequestConfig(method, data, config);

    // リクエスト情報をログ
    this.logger.debug(`${method} ${endpoint} リクエスト開始`);

    try {
      // fetchリクエストを実行
      const response = await fetch(url, requestConfig);

      // レスポンスを処理
      return await this.handleResponse<T>(response, startTime);
    } catch (error) {
      // ネットワークエラーなどの例外を処理
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`${method} ${endpoint} リクエスト失敗: ${errorMessage}`, error);

      // エラーハンドリングをスキップする場合はエラーを再スロー
      if (config?.skipErrorHandling) {
        throw error;
      }

      const duration = performance.now() - startTime;

      // エラーレスポンスを返す
      return {
        success: false,
        data: null,
        status: 0,
        error: {
          code: 'NETWORK_ERROR',
          message: errorMessage,
          statusCode: 0,
        },
        duration,
        url,
        method,
      };
    }
  }

  /**
   * URLを構築
   */
  private buildUrl(endpoint: string): string {
    // エンドポイントが完全なURLの場合はそのまま使用
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // ベースURLがない場合はエンドポイントをそのまま使用
    if (!this.config.baseURL) {
      return endpoint;
    }

    // ベースURLとエンドポイントを結合
    const baseURL = this.config.baseURL.endsWith('/')
      ? this.config.baseURL.slice(0, -1)
      : this.config.baseURL;

    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${baseURL}${formattedEndpoint}`;
  }

  /**
   * リクエスト設定を構築
   */
  private buildRequestConfig(method: string, data?: unknown, config?: RequestConfig): RequestInit {
    // デフォルトヘッダー
    const headers: Record<string, string> = {
      ...this.config.headers,
      Accept: 'application/json',
    };

    // コンテンツタイプを設定（FormDataの場合は設定しない）
    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // 認証トークンがある場合はヘッダーに追加
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // カスタムヘッダーを追加
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    // リクエスト設定を構築
    const requestConfig: RequestInit = {
      method,
      headers,
      credentials: this.config.withCredentials ? 'include' : 'same-origin',
      ...config,
    };

    // リクエストボディを設定
    if (data !== undefined && method !== 'GET' && method !== 'HEAD') {
      requestConfig.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    // タイムアウトが指定されている場合はAbortControllerを設定
    if (this.config.timeout && !config?.signal) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      requestConfig.signal = controller.signal;
    }

    return requestConfig;
  }

  /**
   * レスポンスを処理
   */
  private async handleResponse<T>(response: Response, startTime: number): Promise<ApiResponse<T>> {
    const duration = performance.now() - startTime;

    // レスポンスのステータスとURLをログ
    this.logger.debug(`${response.status} ${response.url} (${duration.toFixed(2)}ms)`);

    let data: T | null = null;
    let parseFailed = false;

    // レスポンスボディを解析
    try {
      // Content-Typeをチェック
      const contentType = response.headers.get('Content-Type');

      if (contentType && contentType.includes('application/json')) {
        // JSONレスポンスを解析
        const text = await response.text();
        if (text) {
          data = JSON.parse(text) as T;
        }
      } else if (response.status !== 204) {
        // No Content以外
        // テキストレスポンスをそのまま返す
        data = (await response.text()) as unknown as T;
      }
    } catch (error) {
      this.logger.error('レスポンスの解析に失敗しました', error);
      parseFailed = true;
    }

    // エラーレスポンスを作成
    if (!response.ok) {
      const errorResponse: ApiResponse<T> = {
        success: false,
        data,
        status: response.status,
        error: {
          code: `HTTP_ERROR_${response.status}`,
          message: response.statusText || `HTTP Error ${response.status}`,
          statusCode: response.status,
        },
        duration,
        url: response.url,
        method: response.type,
      };

      // パースに失敗した場合はエラー情報を追加
      if (parseFailed && errorResponse.error) {
        errorResponse.error.code = 'PARSE_ERROR';
        errorResponse.error.message = 'レスポンスの解析に失敗しました';
      }

      return errorResponse;
    }

    // 成功レスポンスを作成
    return {
      success: true,
      data,
      status: response.status,
      duration,
      url: response.url,
      method: response.type,
    };
  }
}

export default ApiClient;
