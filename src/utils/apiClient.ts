import { createApiError, isApiError, generateErrorTitle, generateErrorDetails, ApiErrorInfo } from './apiErrorHandler';

// エラー報告用のコールバック型
export type ErrorReportCallback = (errorInfo: ApiErrorInfo) => void;

// グローバルなエラー報告コールバック
let globalErrorReportCallback: ErrorReportCallback | null = null;

// エラー報告コールバックを設定
export const setErrorReportCallback = (callback: ErrorReportCallback) => {
  globalErrorReportCallback = callback;
};

// 認証ヘッダーを取得する関数
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// カスタムfetch関数
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // 認証ヘッダーを自動的に追加
    const authHeaders = getAuthHeaders();
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };
    
    console.log('apiFetch - Making request to:', url, 'with options:', mergedOptions);
    console.log('apiFetch - Auth headers:', authHeaders);
    console.log('apiFetch - Token exists:', !!(localStorage.getItem('access_token') || localStorage.getItem('authToken')));
    const response = await fetch(url, mergedOptions);
    console.log('apiFetch - Response status:', response.status, 'for URL:', url);
    
    // HTTPエラーステータスをチェック
    if (!response.ok) {
      console.log('apiFetch - HTTP error:', response.status, response.statusText);
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      const apiError = createApiError(error, response, { url, method: options.method || 'GET' });
      
      // 401 Unauthorizedの場合は特別な処理（エラー報告をスキップ）
      if (response.status === 401) {
        console.log('apiFetch - 401 Unauthorized, clearing tokens and skipping error report');
        console.log('apiFetch - URL:', url, 'Method:', options.method || 'GET');
        // 認証トークンをクリア
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('authToken');

        // ページリロードは行わず、認証状態の変更のみ行う
        // これにより無限ループを防ぐ
        console.log('apiFetch - Tokens cleared, authentication state will be updated by useAuth hook');
        console.log('apiFetch - Skipping error report for 401 error');
      } else {
        // 401以外のエラーの場合のみエラー報告コールバックを呼び出し
        console.log('apiFetch - Non-401 error, calling error report callback');
        if (globalErrorReportCallback) {
          console.log('apiFetch - Calling error report callback for error:', apiError);
          globalErrorReportCallback(apiError);
        } else {
          console.log('apiFetch - No error report callback set, skipping error report');
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
