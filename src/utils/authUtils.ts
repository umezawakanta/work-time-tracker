// 認証関連のユーティリティ関数

/**
 * アクセストークンを取得し、認証が必要な場合の処理を行う
 * @param setMessage エラーメッセージを設定する関数
 * @returns アクセストークン、認証が必要な場合はnull
 */
export const getAuthToken = (setMessage: (message: string) => void): string | null => {
  const token = localStorage.getItem('access_token');
  console.log('getAuthToken - Token found:', !!token);
  if (!token) {
    console.log('getAuthToken - No token found, setting message');
    setMessage('ログインが必要です');
    return null;
  }
  return token;
};

/**
 * 認証が必要なAPIリクエスト用のヘッダーを生成
 * @param token アクセストークン
 * @returns 認証ヘッダーを含むオブジェクト
 */
export const createAuthHeaders = (token?: string): Record<string, string> => {
  const authToken = token || localStorage.getItem('access_token');
  console.log('createAuthHeaders - Using token:', authToken ? authToken.substring(0, 20) + '...' : 'null');
  
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
};

/**
 * 認証が必要なAPIリクエストを実行するためのヘルパー関数
 * @param setMessage エラーメッセージを設定する関数
 * @param apiCall API呼び出し関数
 * @returns API呼び出しの結果、認証エラーの場合はnull
 */
export const executeAuthenticatedRequest = async <T>(
  setMessage: (message: string) => void,
  apiCall: (token: string) => Promise<T>
): Promise<T | null> => {
  const token = getAuthToken(setMessage);
  if (!token) {
    return null;
  }
  
  try {
    return await apiCall(token);
  } catch (error) {
    console.error('認証済みリクエストでエラーが発生しました:', error);
    throw error;
  }
};
