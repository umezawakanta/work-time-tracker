/**
 * API
 * シンプルなAPI使用のためのファサード
 */
import ApiClient from './ApiClient';
import ApiClientHttpMethods from './ApiClientHttpMethods';
import { ApiResponse, RequestConfig } from './ApiTypes';
import ApiClientConfig from './ApiClientConfig';
import NetworkMonitor from './NetworkMonitor';
import SubscriptionService, { SubscriptionInfo, SubscriptionPlan } from './SubscriptionService';

/**
 * バッチリクエストのアイテム定義
 */
export interface BatchRequestItem {
  method: string;
  endpoint: string;
  data?: Record<string, unknown> | unknown[] | null;
}

/**
 * APIクラス
 * アプリケーション全体で使用するシンプルなAPIファサード
 */
class API {
  private static apiClient = ApiClient.getInstance();
  private static httpMethods = new ApiClientHttpMethods(API.apiClient);
  private static networkMonitor = new NetworkMonitor();
  private static subscriptionService = new SubscriptionService();
  private static activeEventSources: Set<EventSource> = new Set();
  private static initialized = false;

  /**
   * API初期化
   */
  public static initialize(): void {
    if (API.initialized) return;
    
    // ネットワーク監視を開始
    API.networkMonitor.startMonitoring();
    
    // ページ離脱時の処理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', API.cleanup);
    }
    
    API.initialized = true;
  }

  /**
   * GETリクエスト
   */
  public static async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.get<T>(endpoint, params, config);
  }

  /**
   * POSTリクエスト
   */
  public static async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.post<T>(endpoint, data, config);
  }

  /**
   * PUTリクエスト
   */
  public static async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.put<T>(endpoint, data, config);
  }

  /**
   * DELETEリクエスト
   */
  public static async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.delete<T>(endpoint, config);
  }

  /**
   * PATCHリクエスト
   */
  public static async patch<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.patch<T>(endpoint, data, config);
  }

  /**
   * ファイルアップロード
   */
  public static async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName?: string,
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.httpMethods.uploadFile<T>(
      endpoint,
      file,
      fieldName,
      additionalData,
      config
    );
  }

  /**
   * 認証トークンの更新
   */
  public static updateAuthToken(token: string | null): void {
    API.apiClient.updateAuthToken(token);
  }

  /**
   * クライアント設定の更新
   */
  public static updateConfig(config: Partial<ApiClientConfig>): void {
    API.apiClient.updateConfig(config);
  }

  /**
   * GraphQLクエリの実行
   */
  public static async graphql<T>(
    query: string,
    variables?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.post<T>(
      'graphql',
      { query, variables },
      config
    );
  }

  /**
   * 一括リクエストの実行
   */
  public static async batch<T>(
    requests: BatchRequestItem[],
    config?: RequestConfig
  ): Promise<ApiResponse<T>[]> {
    API.ensureInitialized();
    
    // バッチエンドポイントを使用
    const batchResponse = await API.post<{
      results: ApiResponse<T>[];
    }>(
      'batch',
      { requests },
      config
    );
    
    // レスポンスの変換
    if (!batchResponse.success || !batchResponse.data) {
      // バッチリクエスト自体が失敗した場合は、すべてのリクエストに同じエラーを設定
      return requests.map(() => ({
        success: false,
        error: batchResponse.error || 'バッチリクエストの処理に失敗しました',
        meta: {
          timestamp: Date.now(),
          batchFailed: true
        }
      }));
    }
    
    return batchResponse.data.results;
  }

  /**
   * リソースの取得（RESTful API）
   */
  public static async getResource<T>(
    resourceType: string,
    id?: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const endpoint = id ? `${resourceType}/${id}` : resourceType;
    return API.get<T>(endpoint, params, config);
  }

  /**
   * リソースの作成（RESTful API）
   */
  public static async createResource<T>(
    resourceType: string,
    data: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return API.post<T>(resourceType, data, config);
  }

  /**
   * リソースの更新（RESTful API）
   */
  public static async updateResource<T>(
    resourceType: string,
    id: string,
    data: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return API.put<T>(`${resourceType}/${id}`, data, config);
  }

  /**
   * リソースの削除（RESTful API）
   */
  public static async deleteResource<T>(
    resourceType: string,
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return API.delete<T>(`${resourceType}/${id}`, config);
  }

  /**
   * SSEストリーミング接続を確立
   */
  public static createEventSource(
    endpoint: string,
    params?: Record<string, string>,
    withCredentials = false
  ): EventSource {
    API.ensureInitialized();
    
    const url = new URL(API.apiClient.getConfig().buildUrl(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    // 認証トークンをURLに追加（代替手段として）
    const authToken = API.getAuthToken();
    if (authToken) {
      url.searchParams.append('auth_token', authToken);
    }
    
    const eventSource = new EventSource(url.toString(), { withCredentials });
    
    // イベントソースの接続を管理対象に登録
    API.activeEventSources.add(eventSource);
    
    // 接続終了時に管理対象から削除
    eventSource.addEventListener('close', () => {
      API.activeEventSources.delete(eventSource);
    });
    
    return eventSource;
  }

  /**
   * 接続状態のチェック
   */
  public static isOnline(): boolean {
    return API.networkMonitor.isOnline();
  }

  /**
   * デバッグ情報の取得
   */
  public static getDebugInfo(): Record<string, unknown> {
    return {
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      apiBaseUrl: API.apiClient.getConfig().baseUrl,
      apiVersion: API.apiClient.getConfig().apiVersion,
      isOnline: API.networkMonitor.isOnline(),
      pendingRequests: API.getPendingRequestsCount(),
      activeEventSources: API.activeEventSources.size,
      subscriptionStatus: API.subscriptionService.getStatus()
    };
  }

  /**
   * 初期化状態の確認
   */
  private static ensureInitialized(): void {
    if (!API.initialized) {
      API.initialize();
    }
  }

  /**
   * 保留中のリクエスト数を取得
   */
  private static getPendingRequestsCount(): number {
    // 保留中のリクエスト数は現在のイベントソース数で代用
    return API.activeEventSources.size;
  }

  /**
   * リソースのクリーンアップ
   */
  private static cleanup = (): void => {
    // すべてのイベントソース接続を閉じる
    API.activeEventSources.forEach((eventSource) => {
      try {
        eventSource.close();
      } catch {
        // エラーは無視
      }
    });
    
    API.activeEventSources.clear();
    
    // ネットワーク監視を停止
    API.networkMonitor.stopMonitoring();
  };

  /**
   * 認証トークンの取得
   */
  private static getAuthToken(): string | null {
    try {
      const authHeader = API.apiClient.getConfig().getHeaders().Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    } catch {
      // エラーは無視
    }
    
    return null;
  }

  /**
   * サブスクリプション情報を取得
   */
  public static async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    return API.subscriptionService.getSubscriptionInfo();
  }

  /**
   * サブスクリプションのアップグレード
   */
  public static async upgradeSubscription(
    plan: SubscriptionPlan,
    paymentMethod?: string
  ): Promise<ApiResponse<SubscriptionInfo>> {
    return API.subscriptionService.upgrade(plan, paymentMethod);
  }

  /**
   * サブスクリプションのダウングレード
   */
  public static async downgradeSubscription(
    reason?: string
  ): Promise<ApiResponse<SubscriptionInfo>> {
    return API.subscriptionService.downgrade(reason);
  }
}

// 自動初期化
if (typeof window !== 'undefined') {
  // ブラウザ環境の場合は自動的に初期化
  API.initialize();
}

export default API;