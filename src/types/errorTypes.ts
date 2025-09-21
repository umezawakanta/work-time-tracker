import type { ApiErrorInfo } from '../utils/apiErrorHandler';

// HTTPメソッドの定数配列
export const HTTP_METHODS = [
  "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE"
] as const;

// HTTPメソッドの正規表現（一度だけ作成）
// This regex is constructed once at module load time for performance.
// It matches any of the defined HTTP methods (case-insensitive) as a whole word.
export const HTTP_METHOD_REGEX = new RegExp(`\\b(${HTTP_METHODS.join("|")})\\b`, "i");

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
  } else if (statusMatch2[1]) {
    return parseInt(statusMatch2[1], 10);
  }
  return undefined;
}

// ブラウザエラーイベントの型定義
interface BrowserErrorEvent extends Error {
  filename?: string;
  lineno?: number;
  colno?: number;
  type?: string;
}

// Type guard to check if error has browser error properties
export function hasBrowserErrorProperties(error: unknown): error is BrowserErrorEvent {
  return (
    typeof error === "object" &&
    error !== null &&
    error instanceof Error &&
    (
      'filename' in error ||
      'lineno' in error ||
      'colno' in error ||
      'type' in error
    )
  );
}

// Type guard to check if error has an errorInfo property (object) with the expected structure.
// This validates the presence and type of required ApiErrorInfo properties.
export function hasApiErrorInfo(error: unknown): error is Error & { errorInfo: ApiErrorInfo } {
  if (
    typeof error === "object" &&
    error !== null &&
    "errorInfo" in error &&
    typeof (error as { errorInfo?: unknown }).errorInfo === "object" &&
    (error as { errorInfo?: unknown }).errorInfo !== null
  ) {
    const info = (error as { errorInfo: unknown }).errorInfo;
    
    // 安全にプロパティにアクセスするためのヘルパー関数
    const hasProperty = (obj: unknown, prop: string): boolean => {
      return typeof obj === "object" && obj !== null && prop in obj;
    };
    
    const getProperty = (obj: unknown, prop: string): unknown => {
      return hasProperty(obj, prop) ? (obj as Record<string, unknown>)[prop] : undefined;
    };
    
    return (
      // 必須プロパティのみチェック
      typeof getProperty(info, "message") === "string" &&
      typeof getProperty(info, "timestamp") === "string" &&
      typeof getProperty(info, "userAgent") === "string" &&
      // オプショナルプロパティ: 存在すれば型チェック
      (getProperty(info, "filename") === undefined || typeof getProperty(info, "filename") === "string") &&
      (getProperty(info, "lineno") === undefined || typeof getProperty(info, "lineno") === "number") &&
      (getProperty(info, "colno") === undefined || typeof getProperty(info, "colno") === "number") &&
      (getProperty(info, "type") === undefined || typeof getProperty(info, "type") === "string") &&
      (getProperty(info, "url") === undefined || typeof getProperty(info, "url") === "string") &&
      (getProperty(info, "stack") === undefined || typeof getProperty(info, "stack") === "string") &&
      (getProperty(info, "status") === undefined || typeof getProperty(info, "status") === "number") &&
      (getProperty(info, "statusText") === undefined || typeof getProperty(info, "statusText") === "string") &&
      (getProperty(info, "method") === undefined || typeof getProperty(info, "method") === "string")
    );
  }
  return false;
}

// ブラウザエラー情報の型定義
export interface BrowserErrorInfo {
  message: string;
  stack?: string;
  filename: string;
  lineno: number;
  colno: number;
  type: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

// APIエラー情報の型定義
export interface ApiErrorDetails {
  status?: number;
  statusText?: string;
  method?: string;
}

// 統合されたエラー情報の型定義
export interface ErrorInfo extends BrowserErrorInfo, ApiErrorDetails {}

// タイムスタンプを取得する関数
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Helper functions for default values
function getDefaultUserAgent(): string {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return navigator.userAgent;
  }
  return "";
}

function getDefaultUrl(): string {
  if (typeof window !== "undefined" && window.location && window.location.href) {
    return window.location.href;
  }
  return "";
}

// デフォルト値の定数
export const ERROR_DEFAULTS = {
  FILENAME: 'Unknown',
  LINENO: 0,
  COLNO: 0,
  TYPE: 'Unknown',
  USER_AGENT: getDefaultUserAgent(),
  URL: getDefaultUrl()
} as const;

// エラー情報を構築するユーティリティ関数
export const buildErrorInfo = (
  error: Error,
  apiErrorInfo?: ApiErrorInfo,
  extractedInfo?: {
    url?: string;
    status?: number;
    method?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    type?: string;
  }
): ErrorInfo => {
  // Try to extract fields from error object if present (for browser ErrorEvent, etc.)
  const filename = hasBrowserErrorProperties(error)
    ? error.filename ?? extractedInfo?.filename ?? ERROR_DEFAULTS.FILENAME
    : extractedInfo?.filename ?? ERROR_DEFAULTS.FILENAME;
  const lineno = hasBrowserErrorProperties(error)
    ? error.lineno ?? extractedInfo?.lineno ?? ERROR_DEFAULTS.LINENO
    : extractedInfo?.lineno ?? ERROR_DEFAULTS.LINENO;
  const colno = hasBrowserErrorProperties(error)
    ? error.colno ?? extractedInfo?.colno ?? ERROR_DEFAULTS.COLNO
    : extractedInfo?.colno ?? ERROR_DEFAULTS.COLNO;
  const type = hasBrowserErrorProperties(error)
    ? error.type ?? extractedInfo?.type ?? ERROR_DEFAULTS.TYPE
    : extractedInfo?.type ?? ERROR_DEFAULTS.TYPE;
  return {
    message: error.message,
    stack: error.stack,
    filename: apiErrorInfo?.filename ?? filename,
    lineno: apiErrorInfo?.lineno ?? lineno,
    colno: apiErrorInfo?.colno ?? colno,
    type: apiErrorInfo?.type ?? type,
    timestamp: apiErrorInfo?.timestamp || getTimestamp(),
    userAgent: apiErrorInfo?.userAgent || ERROR_DEFAULTS.USER_AGENT,
    url: apiErrorInfo?.url || extractedInfo?.url || ERROR_DEFAULTS.URL,
    status: apiErrorInfo?.status ?? extractedInfo?.status,
    statusText: apiErrorInfo?.statusText,
    method: apiErrorInfo?.method ?? extractedInfo?.method
  };
};

// ApiErrorInfoかどうかをチェックする型ガード
export function isApiErrorInfo(error: unknown): error is ApiErrorInfo {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "timestamp" in error &&
    "userAgent" in error
  );
}

// エラー情報を抽出・構築するメイン関数
export const getErrorInfo = (error: Error | ApiErrorInfo | null): ErrorInfo | undefined => {
  if (!error) return undefined;

  // ApiErrorInfoの場合は直接変換
  if (isApiErrorInfo(error)) {
    return {
      message: error.message,
      stack: undefined,
      filename: ERROR_DEFAULTS.FILENAME,
      lineno: ERROR_DEFAULTS.LINENO,
      colno: ERROR_DEFAULTS.COLNO,
      type: ERROR_DEFAULTS.TYPE,
      timestamp: error.timestamp,
      userAgent: error.userAgent,
      url: error.url || ERROR_DEFAULTS.URL,
      status: error.status,
      statusText: error.statusText,
      method: error.method
    };
  }

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
  
  // HTTPメソッド抽出用のヘルパー関数
  function parseMethod(match1: RegExpMatchArray | null, match2: RegExpMatchArray | null): string | undefined {
    if (match1 && match1[1]) return match1[1];
    if (match2 && match2[1]) return match2[1];
    return undefined;
  }

  // 抽出された情報をまとめる
  const extractedInfo = {
    url: urlMatch?.[1] || urlMatch2?.[0],
    status: parseStatus(statusMatch, statusMatch2),
    method: parseMethod(methodMatch, methodMatch2)
  };
  
  return buildErrorInfo(error, apiErrorInfo, extractedInfo);
};

// エラー情報をフォーマットするユーティリティ関数
export const formatErrorInfo = (errorInfo: Partial<ErrorInfo>): {
  statusInfo: string;
  methodInfo: string;
  stackInfo: string;
} => {
  const statusInfo = errorInfo.status
    ? `ステータス: ${errorInfo.status}${errorInfo.statusText ? ` ${errorInfo.statusText}` : ''}`
    : '';
  const methodInfo = errorInfo.method ? `メソッド: ${errorInfo.method}` : '';
  const stackInfo = errorInfo.stack ? `スタックトレース:\n${errorInfo.stack}` : '';
  
  return { statusInfo, methodInfo, stackInfo };
};

// エラーメッセージ構築用のユーティリティ関数
export const createErrorMessage = (
  errorType: 'XMLHttpRequest' | 'API',
  status: number,
  statusText: string
): string => {
  return `${errorType} Error: ${status} ${statusText}`;
};

// エラー情報オブジェクト構築用のユーティリティ関数
export const createErrorInfo = (
  errorType: 'XMLHttpRequest' | 'API',
  status: number,
  statusText: string,
  url: string,
  method: string
): ApiErrorInfo => {
  return {
    message: createErrorMessage(errorType, status, statusText),
    url,
    status,
    statusText,
    method,
    timestamp: getTimestamp(),
    userAgent: getDefaultUserAgent()
  };
};
