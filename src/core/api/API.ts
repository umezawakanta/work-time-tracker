/**
 * API
 * シンプルなAPI使用のためのファサード
 */
import ApiClient from './client/ApiClient';
import ApiClientHttpMethods from './client/ApiClientHttpMethods';
import { ApiResponse, RequestConfig } from './client/ApiTypes';
import { ApiClientConfig } from './client/ApiClientConfig';
import NetworkMonitor from './network/NetworkMonitor';
import SubscriptionService from './subscription/SubscriptionService';
import { EventSourceManager } from './network/EventSourceManager';
import { OfflineRequestManager } from './network/OfflineRequestManager';
import { ApiLogger } from './tracking/ApiLogger';
import { PerformanceTracker } from './tracking/PerformanceTracker';
import { AIFeatureManager } from '../ai/AIFeatureManager';
import { AnalyticsManager } from './tracking/AnalyticsManager';
import { SecurityManager } from './security/SecurityManager';

// 型定義のインポート
import type { BatchRequestItem } from './batch/BatchTypes';
import type { SubscriptionInfo, SubscriptionPlan } from './subscription/SubscriptionTypes';
import type { AIFeatureOptions } from '../ai/types/AITypes';

/**
 * APIクラス
 * アプリケーション全体で使用するAPIファサード
 */
class API {
  private static apiClient = ApiClient.getInstance();
  private static httpMethods = new ApiClientHttpMethods(API.apiClient);
  private static networkMonitor = NetworkMonitor.getInstance();
  private static subscriptionService = SubscriptionService.getInstance();
  private static eventSourceManager = new EventSourceManager();
  private static offlineManager = new OfflineRequestManager();
  private static logger = ApiLogger.getInstance();
  private static performanceTracker = PerformanceTracker.getInstance();
  private static aiManager = AIFeatureManager.getInstance();
  private static analyticsManager = AnalyticsManager.getInstance();
  private static securityManager = SecurityManager.getInstance();
  private static initialized = false;

  /**
   * API初期化
   */
  public static initialize(): void {
    if (API.initialized) return;

    // ロガーを最初に初期化
    API.logger.setContext('APICore');
    API.logger.info('APIの初期化を開始します');

    // 各マネージャーを初期化
    API.initializeManagers();

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
    API.logger.info('APIが正常に初期化されました');
  }

  /**
   * 各マネージャーを初期化
   */
  private static initializeManagers(): void {
    // 初期化順序を制御
    API.securityManager.initialize();
    API.networkMonitor.startMonitoring();
    API.offlineManager.initialize();
    API.performanceTracker.initialize();
    API.aiManager.initialize();
    API.analyticsManager.initialize();
  }

  /**
   * HTTP GETリクエスト
   */
  public static async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => API.httpMethods.get<T>(endpoint, params, config));
  }

  /**
   * HTTP POSTリクエスト
   */
  public static async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => API.httpMethods.post<T>(endpoint, data, config));
  }

  /**
   * HTTP PUTリクエスト
   */
  public static async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => API.httpMethods.put<T>(endpoint, data, config));
  }

  /**
   * HTTP DELETEリクエスト
   */
  public static async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => API.httpMethods.delete<T>(endpoint, config));
  }

  /**
   * HTTP PATCHリクエスト
   */
  public static async patch<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();
    return API.executeRequest(() => API.httpMethods.patch<T>(endpoint, data, config));
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
      API.httpMethods.uploadFile<T>(endpoint, file, fieldName, additionalData, config)
    );
  }

  /**
   * リクエストを実行し、オフライン時は適切に処理
   */
  private static async executeRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    const trackingId = API.performanceTracker.startTracking();

    try {
      // セキュリティチェック
      const securityCheck = API.securityManager.checkRequestSecurity();
      if (!securityCheck.allowed) {
        return API.createErrorResponse('RATE_LIMIT_EXCEEDED', securityCheck.reason, 429);
      }

      // オンライン状態をチェック
      if (!API.isOnline()) {
        return API.offlineManager.handleOfflineRequest(requestFn);
      }

      const response = await requestFn();

      // 測定終了と分析記録
      API.performanceTracker.stopTracking(trackingId, {
        success: response.success,
        statusCode: response.status,
      });
      API.analyticsManager.trackRequest(response);

      return response;
    } catch (error) {
      API.performanceTracker.stopTracking(trackingId, {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      API.logger.error('リクエスト実行に失敗しました', error);
      throw error;
    }
  }

  /**
   * エラーレスポンスを作成
   */
  private static createErrorResponse<T>(
    code: string,
    message: string | undefined,
    statusCode: number
  ): ApiResponse<T> {
    return {
      success: false,
      data: null,
      status: statusCode,
      error: {
        code,
        message: message || 'エラーが発生しました',
        statusCode,
      },
    };
  }

  /**
   * 認証トークンの更新
   */
  public static updateAuthToken(token: string | null): void {
    const securityResult = API.securityManager.validateToken(token);
    if (!securityResult.valid && token !== null) {
      API.logger.warn(`無効なトークンが提供されました: ${securityResult.reason}`);
    }

    API.apiClient.updateAuthToken(token);
    API.analyticsManager.trackEvent('auth_token_updated');
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
    return API.executeRequest(() => API.post<T>('graphql', { query, variables }, config));
  }

  /**
   * AI支援クエリの実行
   */
  public static async aiEnhancedQuery<T>(
    endpoint: string,
    queryData: unknown,
    options: AIFeatureOptions
  ): Promise<ApiResponse<T>> {
    API.ensureInitialized();

    const hasAccess = await API.hasFeature('aiAssistant');
    if (!hasAccess && options.required) {
      return API.createErrorResponse(
        'AI_FEATURE_NOT_AVAILABLE',
        'AI機能はプレミアムサブスクリプションでのみ利用可能です',
        403
      );
    }

    const enhancedQuery = await API.aiManager.enhanceQuery(queryData, options);

    return API.post<T>(endpoint, enhancedQuery.data as Record<string, unknown>, {
      ...options.requestConfig,
      meta: {
        ...(options.requestConfig?.meta && typeof options.requestConfig.meta === 'object'
          ? options.requestConfig.meta
          : {}),
      },
    });
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
    return API.eventSourceManager.createEventSource(endpoint, params, withCredentials);
  }

  /**
   * 接続状態のチェック
   */
  public static isOnline(): boolean {
    return API.networkMonitor.isOnline();
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
    API.performanceTracker.saveMetrics();
    API.analyticsManager.saveData();
    API.logger.info('APIリソースがクリーンアップされました');
  };

  /**
   * 機能利用可能かをチェック
   */
  public static async hasFeature(featureKey: string): Promise<boolean> {
    const subscriptionInfo = await API.subscriptionService.getSubscriptionInfo();
    return !!(subscriptionInfo.features || {})[featureKey];
  }

  /**
   * デバッグ情報の取得
   */
  public static getDebugInfo(): Record<string, unknown> {
    return API.analyticsManager.getSystemInfo();
  }
}

// サブコンポーネントのメソッドをインポート
import { applyExtensionMethods } from './extensions/ApiExtensions';

// 拡張メソッドを適用
applyExtensionMethods(API);

// 初期化（ブラウザ環境のみ）
if (typeof window !== 'undefined') {
  API.initialize();
}

export default API;

// 型定義のエクスポート
export type { BatchRequestItem, SubscriptionInfo, SubscriptionPlan, AIFeatureOptions };
