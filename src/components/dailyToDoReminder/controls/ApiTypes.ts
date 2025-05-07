/**
 * API関連の型定義
 */

/**
 * キャッシュポリシーの列挙型
 */
export enum CachePolicy {
    Default = 'default',
    NoCache = 'no-cache',
    NoStore = 'no-store',
    ForceCache = 'force-cache',
    OnlyIfCached = 'only-if-cached',
    Reload = 'reload'
  }
  
  /**
   * APIリクエスト設定
   */
  export interface RequestConfig {
    timeout?: number;
    retry?: number;
    retryDelay?: number;
    withCredentials?: boolean;
    cachePolicy?: CachePolicy;
    cacheMaxAge?: number;
    priority?: 'high' | 'normal' | 'low';
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
  
  /**
   * APIレスポンスのメタデータ
   */
  export interface ApiResponseMeta {
    timestamp: number;
    processingTime?: number;
    requestId?: string;
    errorCode?: string;
    endpoint?: string;
    batchFailed?: boolean;
    cache?: {
      hit: boolean;
      stale: boolean;
      age?: number;
    };
  }
  
  /**
   * API成功レスポンス
   */
  export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    statusCode?: number;
    meta: ApiResponseMeta;
  }
  
  /**
   * APIエラーレスポンス
   */
  export interface ApiErrorResponse {
    success: false;
    error: string;
    statusCode?: number;
    meta: ApiResponseMeta;
  }
  
  /**
   * APIレスポンス（成功またはエラー）
   */
  export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;