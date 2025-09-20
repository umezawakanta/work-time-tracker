// APIエラーハンドリング用のユーティリティ関数

export interface ApiErrorInfo {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  timestamp: string;
  userAgent: string;
}

export const createApiError = (
  error: Error,
  response?: Response,
  requestInfo?: { url: string; method: string }
): ApiErrorInfo => {
  return {
    message: error.message,
    status: response?.status,
    statusText: response?.statusText,
    url: requestInfo?.url,
    method: requestInfo?.method,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
};

export const isApiError = (error: any): error is ApiErrorInfo => {
  return error && typeof error === 'object' && 'message' in error && 'timestamp' in error;
};

// エラー報告用のタイトルを生成
export const generateErrorTitle = (errorInfo: ApiErrorInfo): string => {
  if (errorInfo.status) {
    return `APIエラー ${errorInfo.status}: ${errorInfo.statusText || 'Unknown Error'}`;
  }
  return `APIエラー: ${errorInfo.message}`;
};

// エラー報告用の詳細情報を生成
export const generateErrorDetails = (errorInfo: ApiErrorInfo): string => {
  let details = `エラーメッセージ: ${errorInfo.message}\n`;
  
  if (errorInfo.status) {
    details += `HTTPステータス: ${errorInfo.status}\n`;
  }
  
  if (errorInfo.statusText) {
    details += `ステータステキスト: ${errorInfo.statusText}\n`;
  }
  
  if (errorInfo.url) {
    details += `URL: ${errorInfo.url}\n`;
  }
  
  if (errorInfo.method) {
    details += `メソッド: ${errorInfo.method}\n`;
  }
  
  details += `発生時刻: ${errorInfo.timestamp}\n`;
  details += `ユーザーエージェント: ${errorInfo.userAgent}`;
  
  return details;
};
