import type { ApiErrorInfo } from '../utils/apiErrorHandler';

// HTTPメソッドの定数配列
export const HTTP_METHODS = [
  "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"
] as const;

// HTTPメソッドの正規表現（一度だけ作成）
export const HTTP_METHOD_REGEX = new RegExp(`\\b(${HTTP_METHODS.join("|")})\\b`);

// エラー情報抽出用の正規表現パターン
export const ERROR_PATTERNS = {
  // URL: の後に続く文字列をマッチ
  URL_EXPLICIT: /URL: ([^\n\s]+)/,
  // APIエンドポイントのパスをマッチ
  URL_API: /\/api\/[^\s\n]+/,
  // ステータス: の後に続く数字をマッチ
  STATUS_EXPLICIT: /ステータス: (\d+)/,
  // 有効なHTTPステータスコード（100-599）をマッチ
  STATUS_CODE: /\b(1\d{2}|2\d{2}|3\d{2}|4\d{2}|5\d{2})\b/,
  // メソッド: の後に続く文字列をマッチ
  METHOD_EXPLICIT: /メソッド: ([^\n\s]+)/
} as const;

// Helper function to parse status from match results
export function parseStatus(statusMatch: RegExpMatchArray | null, statusMatch2: RegExpMatchArray | null): number | undefined {
  if (statusMatch?.[1]) {
    return parseInt(statusMatch[1], 10);
  } else if (statusMatch2?.[1]) {
    return parseInt(statusMatch2[1], 10);
  }
  return undefined;
}

// Type guard to check if error has an errorInfo property (object).
// This does not validate the full structure of the errorInfo, only its presence as an object.
export function hasApiErrorInfo(error: unknown): error is Error & { errorInfo: ApiErrorInfo } {
  return (
    typeof error === "object" &&
    error !== null &&
    "errorInfo" in error &&
    typeof (error as { errorInfo?: unknown }).errorInfo === "object" &&
    (error as { errorInfo?: unknown }).errorInfo !== null
  );
}

// エラー情報の型定義
export interface ErrorInfo {
  message: string;
  stack?: string;
  filename: string;
  lineno: number;
  colno: number;
  type: string;
  timestamp: string;
  userAgent: string;
  url: string;
  status?: number;
  statusText?: string;
  method?: string;
}

// タイムスタンプを取得する関数
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

// デフォルト値の定数
export const ERROR_DEFAULTS = {
  FILENAME: 'Unknown',
  LINENO: 0,
  COLNO: 0,
  TYPE: 'Unknown',
  USER_AGENT: typeof navigator !== "undefined" && navigator.userAgent
    ? navigator.userAgent
    : "",
  URL: typeof window !== "undefined" && window.location && window.location.href
    ? window.location.href
    : ""
} as const;

// エラー情報を構築するユーティリティ関数
export const buildErrorInfo = (
  error: Error,
  apiErrorInfo?: ApiErrorInfo,
  extractedInfo?: {
    url?: string;
    status?: number;
    method?: string;
  }
): ErrorInfo => {
  return {
    message: error.message,
    stack: error.stack,
    filename: ERROR_DEFAULTS.FILENAME,
    lineno: ERROR_DEFAULTS.LINENO,
    colno: ERROR_DEFAULTS.COLNO,
    type: ERROR_DEFAULTS.TYPE,
    timestamp: apiErrorInfo?.timestamp || getTimestamp(),
    userAgent: apiErrorInfo?.userAgent || ERROR_DEFAULTS.USER_AGENT,
    url: apiErrorInfo?.url || extractedInfo?.url || ERROR_DEFAULTS.URL,
    status: apiErrorInfo?.status || extractedInfo?.status,
    statusText: apiErrorInfo?.statusText,
    method: apiErrorInfo?.method || extractedInfo?.method
  };
};

// エラー情報を抽出・構築するメイン関数
export const getErrorInfo = (error: Error | null): ErrorInfo | undefined => {
  if (!error) return undefined;

  let apiErrorInfo: ApiErrorInfo | undefined;
  if (hasApiErrorInfo(error)) {
    apiErrorInfo = error.errorInfo;
  }
  
  // エラーメッセージから詳細情報を抽出する試行
  const errorMessage = error.message;
  const urlMatch = errorMessage.match(ERROR_PATTERNS.URL_EXPLICIT);
  const statusMatch = errorMessage.match(ERROR_PATTERNS.STATUS_EXPLICIT);
  const methodMatch = errorMessage.match(ERROR_PATTERNS.METHOD_EXPLICIT);
  
  // より柔軟なパターンマッチング
  const urlMatch2 = errorMessage.match(ERROR_PATTERNS.URL_API);
  const statusMatch2 = errorMessage.match(ERROR_PATTERNS.STATUS_CODE);
  // 事前作成されたHTTPメソッドの正規表現を使用
  const methodMatch2 = errorMessage.match(HTTP_METHOD_REGEX);
  
  // 抽出された情報をまとめる
  const extractedInfo = {
    url: urlMatch?.[1] || urlMatch2?.[0],
    status: parseStatus(statusMatch, statusMatch2),
    method: methodMatch?.[1] || methodMatch2?.[1]
  };
  
  return buildErrorInfo(error, apiErrorInfo, extractedInfo);
};
