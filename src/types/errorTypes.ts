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
  TYPE: 'Unknown'
} as const;
