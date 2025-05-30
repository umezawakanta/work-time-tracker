/**
 * ベースAPIクライアント
 * APIクライアントの基本機能を提供する抽象クラス
 */

import { ApiResponse, ExtendedRequestConfig, RequestData } from './ApiClient';

export abstract class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * APIリクエストを実行する抽象メソッド
   * @param endpoint APIエンドポイント
   * @param options リクエストオプション
   * @param config 追加設定
   */
  public abstract fetch<T>(
    endpoint: string,
    options?: RequestInit,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;

  /**
   * ネットワーク接続状態を確認
   * @returns 接続状態
   */
  public isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * 現在のネットワーク接続タイプを取得
   * @returns 接続タイプ（'wifi', 'cellular', 'unknown'）
   */
  public getConnectionType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    // Network Information API（一部のブラウザでサポート）
    if ('connection' in navigator) {
      const conn = (navigator as unknown as { connection?: { type?: string } }).connection;
      if (conn && conn.type) {
        return conn.type;
      }
    }

    return 'unknown';
  }

  /**
   * ユーザーエージェント情報を取得
   * @returns ユーザーエージェント情報
   */
  public getUserAgentInfo(): Record<string, string> {
    if (typeof navigator === 'undefined') {
      return { platform: 'unknown', browser: 'unknown' };
    }

    const ua = navigator.userAgent;
    const platform = navigator.platform || 'unknown';
    let browser = 'unknown';

    // ブラウザの種類を判定
    if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    }

    return {
      platform,
      browser,
      userAgent: ua,
    };
  }

  /**
   * URLクエリパラメータをオブジェクトに変換
   * @param url URL文字列
   * @returns パラメータオブジェクト
   */
  public parseQueryParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};

    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch {
      // URLが不正な場合はクエリ部分だけを解析
      const queryString = url.split('?')[1] || '';
      const searchParams = new URLSearchParams(queryString);

      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return params;
  }

  /**
   * オブジェクトをURLクエリパラメータに変換
   * @param params パラメータオブジェクト
   * @returns URLクエリ文字列（先頭の?なし）
   */
  public buildQueryString(
    params: Record<string, string | number | boolean | null | undefined>
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  /**
   * データのシリアライズ
   * @param data データオブジェクト
   * @returns JSONシリアライズされた文字列
   */
  protected serializeData(data: RequestData): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Failed to serialize data:', error);
      throw new Error('データのシリアライズに失敗しました');
    }
  }

  /**
   * URLの構築
   * @param baseUrl ベースURL
   * @param path パス
   * @param params クエリパラメータ
   * @returns 完全なURL
   */
  protected buildUrl(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): string {
    // 先頭と末尾のスラッシュを正規化
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    let url = `${normalizedBase}${normalizedPath}`;

    // クエリパラメータを追加
    if (params && Object.keys(params).length > 0) {
      const queryString = this.buildQueryString(params);
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }

    return url;
  }

  /**
   * レート制限情報を解析
   * @param headers レスポンスヘッダー
   * @returns レート制限情報
   */
  protected parseRateLimitHeaders(headers: Headers): Record<string, number | null> {
    return {
      limit: parseInt(headers.get('X-RateLimit-Limit') || '', 10) || null,
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '', 10) || null,
      reset: parseInt(headers.get('X-RateLimit-Reset') || '', 10) || null,
    };
  }

  abstract get<T>(
    url: string,
    params?: Record<string, string>,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;

  abstract post<T>(
    url: string,
    data?: RequestData,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;

  abstract put<T>(
    url: string,
    data?: RequestData,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;

  abstract delete<T>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>>;

  abstract patch<T>(
    url: string,
    data?: RequestData,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;
}
