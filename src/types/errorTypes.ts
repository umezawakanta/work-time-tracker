import type { ApiErrorInfo } from '../utils/apiErrorHandler';

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

// デフォルト値の定数
export const ERROR_DEFAULTS = {
  FILENAME: 'Unknown',
  LINENO: 0,
  COLNO: 0,
  TYPE: 'Unknown',
  get TIMESTAMP() {
    return new Date().toISOString();
  },
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
    timestamp: apiErrorInfo?.timestamp || ERROR_DEFAULTS.TIMESTAMP,
    userAgent: apiErrorInfo?.userAgent || ERROR_DEFAULTS.USER_AGENT,
    url: apiErrorInfo?.url || extractedInfo?.url || ERROR_DEFAULTS.URL,
    status: apiErrorInfo?.status || extractedInfo?.status,
    statusText: apiErrorInfo?.statusText,
    method: apiErrorInfo?.method || extractedInfo?.method
  };
};
