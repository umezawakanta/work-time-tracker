/**
 * API
 * シンプルなAPI使用のためのファサード
 */
import ApiClient from './ApiClient';
import ApiClientHttpMethods from './ApiClientHttpMethods';
import { ApiResponse, RequestConfig } from './ApiTypes';
import ApiClientConfig from './ApiClientConfig';
import { NetworkMonitor } from './NetworkMonitor';

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

  /**
   * GETリクエスト
   */
  public static async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
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
    return API.httpMethods.put<T>(endpoint, data, config);
  }

  /**
   * DELETEリクエスト
   */
  public static async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
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
    return API.post<T>(
      'graphql',
      { query, variables },
      config
    );
  }

  /**
   * 一括リクエストの実行
   * 複数のAPIリクエストを一度に処理する
   */
  public static async batch<T>(
    requests: BatchRequestItem[],
    config?: RequestConfig
  ): Promise<ApiResponse<T>[]> {
    // バッチエンドポイントを使用
    const batchResponse = await API.post<{
      results: ApiResponse<T>[]
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
   * デバッグ情報の取得
   */
  public static getDebugInfo(): Record<string, unknown> {
    return {
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      apiBaseUrl: API.apiClient.getConfig().baseUrl,
      apiVersion: API.apiClient.getConfig().apiVersion,
      isOnline: API.networkMonitor.isOnline(),
      pendingRequests: API.getPendingRequestsCount(),
      configSettings: API.apiClient.getConfig()
    };
  }

  /**
   * 接続状態のチェック
   */
  public static isOnline(): boolean {
    return API.networkMonitor.isOnline();
  }

  /**
   * 保留中のリクエスト数を取得
   */
  private static getPendingRequestsCount(): number {
    // 実際には内部実装でカウントを取得する
    return 0;
  }

  /**
   * リクエストのキャンセル
   */
  public static cancelRequest(requestId: string): boolean {
    // 実際の実装ではリクエストをキャンセルする
    return true;
  }

  /**
   * SSEストリーミング接続を確立
   */
  public static createEventSource(
    endpoint: string,
    params?: Record<string, string>
  ): EventSource {
    const url = new URL(API.apiClient.getConfig().buildUrl(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return new EventSource(url.toString());
  }
}

export default API;