import { createApiError, isApiError, generateErrorTitle, generateErrorDetails, ApiErrorInfo } from './apiErrorHandler';

// エラー報告用のコールバック型
export type ErrorReportCallback = (errorInfo: ApiErrorInfo) => void;

// グローバルなエラー報告コールバック
let globalErrorReportCallback: ErrorReportCallback | null = null;

// エラー報告コールバックを設定
export const setErrorReportCallback = (callback: ErrorReportCallback) => {
  globalErrorReportCallback = callback;
};

// カスタムfetch関数
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // HTTPエラーステータスをチェック
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      const apiError = createApiError(error, response, { url, method: options.method || 'GET' });
      
      // エラー報告コールバックが設定されている場合は呼び出し
      if (globalErrorReportCallback) {
        globalErrorReportCallback(apiError);
      }
      
      // 401 Unauthorizedの場合は特別な処理（エラー報告後に実行）
      if (response.status === 401) {
        // 認証トークンをクリア
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // 少し遅延してからページをリロードしてログイン画面に遷移
        // これにより障害報告画面が表示される時間を確保
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload();
          }, 2000); // 2秒後にリロード
        }
      }
      
      throw apiError;
    }
    
    return response;
  } catch (error) {
    // ネットワークエラーやその他のエラー
    if (error instanceof Error && !isApiError(error)) {
      const apiError = createApiError(error, undefined, { url, method: options.method || 'GET' });
      
      // エラー報告コールバックが設定されている場合は呼び出し
      if (globalErrorReportCallback) {
        globalErrorReportCallback(apiError);
      }
      
      throw apiError;
    }
    
    // 既にApiErrorInfoの場合はそのまま再スロー
    throw error;
  }
};

// エラー報告用のヘルパー関数
export const reportApiError = (errorInfo: ApiErrorInfo, errorReportCallback: ErrorReportCallback) => {
  const errorReport = {
    title: generateErrorTitle(errorInfo),
    content: `APIエラーが発生しました。\n\n詳細:\n${errorInfo.message}`,
    errorDetails: generateErrorDetails(errorInfo),
    userAgent: errorInfo.userAgent,
    timestamp: errorInfo.timestamp
  };
  
  errorReportCallback(errorReport);
};
