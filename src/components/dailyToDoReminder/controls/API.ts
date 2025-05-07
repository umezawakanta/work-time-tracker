/**
 * API
 * シンプルなAPI使用のためのファサード
 */
import ApiClient from './ApiClient';
import ApiClientHttpMethods from './ApiClientHttpMethods';
import { ApiErrorResponse, ApiResponse, RequestConfig } from './ApiTypes';
import { ApiClientConfig } from './ApiClientConfig';
import NetworkMonitor from './NetworkMonitor';
import SubscriptionService from './SubscriptionService';
import { EventSourceManager } from './EventSourceManager';
import { OfflineRequestManager } from './OfflineRequestManager';
import { ApiLogger } from './ApiLogger';

// 型定義のインポート
import type { BatchRequestItem } from './BatchTypes';
import type { SubscriptionInfo, SubscriptionPlan } from './SubscriptionTypes';

/**
 * APIクラス
 * アプリケーション全体で使用するシンプルなAPIファサード
 */
class API {
  private static apiClient = ApiClient.getInstance();
  private static httpMethods = new ApiClientHttpMethods(API.apiClient);
  private static networkMonitor = new NetworkMonitor();
  private static subscriptionService = new SubscriptionService();
  private static eventSourceManager = new EventSourceManager();
  private static offlineManager = new OfflineRequestManager();
  private static logger = new ApiLogger();
  private static initialized = false;

  /**
   * API初期化
   */
  public static initialize(): void {
    if (API.initialized) return;
    
    // ネットワーク監視を開始
    API.networkMonitor.startMonitoring();
    
    // オフラインリクエスト管理を初期化
    API.offlineManager.initialize();
    
    // ページ離脱時の処理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', API.cleanup);
    }
    
    // ネットワーク状態の変化を監視
    API.networkMonitor.onStatusChange((isOnline) => {
      if (isOnline) {
        // オンラインに戻ったら保留中のリクエストを処理
        API.offlineManager.processPendingRequests();
      }
    });
    
    API.initialized = true;
    API.logger.info('API initialized successfully');
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
    return API.executeRequest(() => 
      API.httpMethods.get<T>(endpoint, params, config)
    );
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
    return API.executeRequest(() => 
      API.httpMethods.post<T>(endpoint, data, config)
    );
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
    return API.executeRequest(() => 
      API.httpMethods.put<T>(endpoint, data, config)
    );
  }

  /**
   * DELETEリクエスト
   */
  public static async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => 
      API.httpMethods.delete<T>(endpoint, config)
    );
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
    return API.executeRequest(() => 
      API.httpMethods.patch<T>(endpoint, data, config)
    );
  }

  /**
   * ファイルアップロード
   */
  public static async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName = 'file',
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => 
      API.httpMethods.uploadFile<T>(
        endpoint,
        file,
        fieldName,
        additionalData,
        config
      )
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
  public static updateConfig(config: Partial<typeof ApiClientConfig>): void {
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
    return API.executeRequest(() => 
      API.post<T>(
        'graphql',
        { query, variables },
        config
      )
    );
  }

  /**
   * リクエストを実行し、オフライン時は適切に処理
   */
  private static async executeRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    // オンライン状態をチェック
    if (!API.isOnline()) {
      // オフラインの場合、設定に基づいて処理
      return API.offlineManager.handleOfflineRequest(requestFn);
    }

    try {
      return await requestFn();
    } catch (error) {
      API.logger.error('Request execution failed', error);
      throw error;
    }
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
    return API.eventSourceManager.createEventSource(
      endpoint, 
      params, 
      withCredentials
    );
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
      pendingRequests: API.offlineManager.getPendingCount(),
      activeEventSources: API.eventSourceManager.getActiveCount(),
      subscriptionStatus: API.subscriptionService.getStatus(),
      lastSyncTime: API.offlineManager.getLastSyncTime()
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
   * リソースのクリーンアップ
   */
  private static cleanup = (): void => {
    API.eventSourceManager.closeAll();
    API.networkMonitor.stopMonitoring();
    API.offlineManager.saveState();
    API.logger.info('API resources cleaned up');
  };

  /**
   * 認証トークンの取得
   */
  public static getAuthToken(): string | null {
    try {
      const authHeader = API.apiClient.getConfig().getHeaders().Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    } catch (error) {
      API.logger.warn('Failed to get auth token', error);
    }
    
    return null;
  }
}

// サブコンポーネントのメソッドをAPIに追加
import { batchMethods } from './ApiBatchMethods';
import { resourceMethods } from './ApiResourceMethods';
import { subscriptionMethods } from './ApiSubscriptionMethods';

// バッチ関連メソッド
API.batch = batchMethods.batch;

// リソース関連メソッド
API.getResource = resourceMethods.getResource;
API.createResource = resourceMethods.createResource;
API.updateResource = resourceMethods.updateResource;
API.deleteResource = resourceMethods.deleteResource;

// サブスクリプション関連メソッド
API.getSubscriptionInfo = subscriptionMethods.getSubscriptionInfo;
API.upgradeSubscription = subscriptionMethods.upgradeSubscription;
API.downgradeSubscription = subscriptionMethods.downgradeSubscription;

// 自動初期化
if (typeof window !== 'undefined') {
  // ブラウザ環境の場合は自動的に初期化
  API.initialize();
}

export default API;

// 型定義のエクスポート
export type { BatchRequestItem, SubscriptionInfo, SubscriptionPlan };