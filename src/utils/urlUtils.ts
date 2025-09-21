// URL構築用のユーティリティ関数

/**
 * クエリパラメータを安全にエンコードしてURLを構築する
 * @param baseUrl ベースURL
 * @param params クエリパラメータのオブジェクト
 * @returns エンコードされたクエリパラメータ付きURL
 */
export const buildUrlWithParams = (baseUrl: string, params: Record<string, string | number | undefined | null>): string => {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
};

/**
 * APIエンドポイント用のURLを構築する
 * @param endpoint APIエンドポイント（例: '/api/work-records/salary'）
 * @param params クエリパラメータのオブジェクト
 * @returns エンコードされたクエリパラメータ付きAPI URL
 */
export const buildApiUrl = (endpoint: string, params: Record<string, string | number | undefined | null> = {}): string => {
  return buildUrlWithParams(endpoint, params);
};

/**
 * ユーザーIDを検証してからURLパラメータに追加する
 * @param userId ユーザーID
 * @param paramName パラメータ名（デフォルト: 'userId'）
 * @returns 検証済みのユーザーIDパラメータオブジェクト
 */
export const createUserIdParam = (userId: string | undefined | null, paramName: string = 'userId'): Record<string, string> => {
  if (!userId || typeof userId !== 'string') {
    console.warn('User ID is required but not provided, returning empty object');
    return {};
  }
  return { [paramName]: userId };
};

/**
 * IDパラメータを検証してからURLパラメータに追加する
 * @param id ID
 * @param paramName パラメータ名（デフォルト: 'id'）
 * @returns 検証済みのIDパラメータオブジェクト
 */
export const createIdParam = (id: string | undefined | null, paramName: string = 'id'): Record<string, string> => {
  if (!id || typeof id !== 'string') {
    throw new Error('ID is required but not provided');
  }
  return { [paramName]: id };
};
