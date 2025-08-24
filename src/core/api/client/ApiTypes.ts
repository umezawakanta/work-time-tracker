/**
 * APIタイプ定義
 * API関連の型定義を集約
 */

/**
 * APIレスポンスインターフェース
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  status: number;
  error?: ApiError;
  duration?: number;
  url?: string;
  method?: string;
  requestId?: string;
  fromCache?: boolean;
}

/**
 * APIエラーインターフェース
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * リクエスト設定インターフェース
 */
export interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  skipErrorHandling?: boolean;
  mock?: boolean;
  mockData?: unknown;
  meta?: Record<string, unknown>;
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
  cache?: RequestCache;
  mode?: RequestMode;
  preserveHeaderCase?: boolean;
}

/**
 * ページネーションパラメータインターフェース
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * ページネーションメタデータインターフェース
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * ページネーションレスポンスインターフェース
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * ソートパラメータインターフェース
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * フィルターパラメータインターフェース
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | null;
}

/**
 * 検索パラメータインターフェース
 */
export interface SearchParams {
  query?: string;
  fields?: string[];
}

/**
 * リクエストヘッダーの型
 */
export type HeadersInit = Headers | Record<string, string> | [string, string][];

/**
 * リクエストオプションの型
 */
export type RequestOptions = RequestConfig;

/**
 * グラフQLレスポンスインターフェース
 */
export interface GraphQLResponse<T> {
  data: T | null;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}
