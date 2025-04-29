/**
 * API関連の型定義
 */

/**
 * リクエスト設定
 */
export interface RequestConfig {
    timeout?: number;
    retry?: number;
    retryDelay?: number;
    withCredentials?: boolean;
    cache?: boolean | 'force-cache' | 'no-cache' | 'only-if-cached' | 'reload';
    priority?: 'high' | 'normal' | 'low';
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
    signal?: AbortSignal;
    [key: string]: unknown;
  }
  
  /**
   * APIレスポンスの型
   */
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
    meta: ApiResponseMeta;
  }
  
  /**
   * APIレスポンスのメタデータ
   */
  export interface ApiResponseMeta {
    requestId?: string;
    timestamp: number;
    processingTime?: number;
    cache?: {
      hit: boolean;
      stale: boolean;
      age?: number;
    };
    errorCode?: string;
    [key: string]: unknown;
  }
  
  /**
   * HTTPリクエストメソッド
   */
  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';