/**
 * APIプラグインシステム
 * APIクライアントの機能を拡張するためのプラグインインターフェースと実装
 */

import { ApiResponse, ExtendedRequestConfig } from './ApiClient';

/**
 * APIリクエスト情報
 */
export interface ApiRequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  config: RequestConfig;
}

/**
 * APIレスポンス情報
 */
export interface ApiResponseInfo<T> {
  response: ApiResponse<T>;
  requestInfo: ApiRequestInfo;
  startTime: number;
  endTime: number;
}

/**
 * プラグインのフック種類
 */
export enum PluginHook {
  PRE_REQUEST = 'preRequest',
  POST_REQUEST = 'postRequest',
  REQUEST_ERROR = 'requestError',
  REQUEST_RETRY = 'requestRetry',
}

/**
 * APIプラグインインターフェース
 */
export interface ApiPlugin {
  /**
   * プラグインの名前
   */
  name: string;

  /**
   * プラグインの優先度（高いほど先に実行される）
   */
  priority: number;

  /**
   * プラグインが処理するフック
   */
  hooks: PluginHook[];

  /**
   * リクエスト前の処理
   * @param requestInfo リクエスト情報
   * @returns 変更されたリクエスト情報（または元のリクエスト情報）
   */
  preRequest?: (requestInfo: ApiRequestInfo) => Promise<ApiRequestInfo> | ApiRequestInfo;

  /**
   * リクエスト後の処理
   * @param responseInfo レスポンス情報
   * @returns 変更されたレスポンス情報（または元のレスポンス情報）
   */
  postRequest?: <T>(
    responseInfo: ApiResponseInfo<T>
  ) => Promise<ApiResponseInfo<T>> | ApiResponseInfo<T>;

  /**
   * リクエストエラー時の処理
   * @param error エラー情報
   * @param requestInfo リクエスト情報
   * @returns 処理結果（trueを返すとエラーを処理済みとみなす）
   */
  requestError?: (error: Error, requestInfo: ApiRequestInfo) => Promise<boolean> | boolean;

  /**
   * リクエストリトライ時の処理
   * @param requestInfo リクエスト情報
   * @param retryCount リトライ回数
   * @returns 変更されたリクエスト情報（または元のリクエスト情報）
   */
  requestRetry?: (
    requestInfo: ApiRequestInfo,
    retryCount: number
  ) => Promise<ApiRequestInfo> | ApiRequestInfo;
}

/**
 * 基本的なAPIプラグイン実装
 */
export abstract class BaseApiPlugin implements ApiPlugin {
  public name: string;
  public priority: number;
  public hooks: PluginHook[];

  constructor(name: string, priority: number = 0, hooks: PluginHook[] = []) {
    this.name = name;
    this.priority = priority;
    this.hooks = hooks;
  }
}

/**
 * ロギングプラグイン
 * APIリクエストをログに記録する
 */
export class LoggingPlugin extends BaseApiPlugin {
  constructor(priority: number = 0) {
    super('LoggingPlugin', priority, [
      PluginHook.PRE_REQUEST,
      PluginHook.POST_REQUEST,
      PluginHook.REQUEST_ERROR,
    ]);
  }

  preRequest(requestInfo: ApiRequestInfo): ApiRequestInfo {
    console.log(`[API] ${requestInfo.method} ${requestInfo.url} - リクエスト開始`);
    return requestInfo;
  }

  postRequest<T>(responseInfo: ApiResponseInfo<T>): ApiResponseInfo<T> {
    const { response, requestInfo, startTime, endTime } = responseInfo;
    const duration = endTime - startTime;

    console.log(
      `[API] ${requestInfo.method} ${requestInfo.url} - レスポンス受信 (${duration}ms)`,
      response.success ? '成功' : `エラー: ${response.error}`
    );

    return responseInfo;
  }

  requestError(error: Error, requestInfo: ApiRequestInfo): boolean {
    console.error(
      `[API] ${requestInfo.method} ${requestInfo.url} - リクエストエラー:`,
      error.message
    );

    return false; // エラーは処理されていないのでfalseを返す
  }
}

/**
 * キャッシュプラグイン
 * API応答をローカルストレージにキャッシュする
 */
export class CachePlugin extends BaseApiPlugin {
  private storage: Storage | null;
  private prefix: string;
  private defaultTTL: number;

  constructor(
    prefix: string = 'api_cache_',
    defaultTTL: number = 5 * 60 * 1000, // 5分
    priority: number = 10
  ) {
    super('CachePlugin', priority, [PluginHook.PRE_REQUEST, PluginHook.POST_REQUEST]);

    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    this.storage = typeof localStorage !== 'undefined' ? localStorage : null;

    // 起動時に期限切れのキャッシュをクリーンアップ
    this.cleanExpiredCache();
  }

  preRequest(requestInfo: ApiRequestInfo): ApiRequestInfo {
    // GETリクエスト以外はキャッシュしない
    if (requestInfo.method !== 'GET') return requestInfo;

    // キャッシュが無効の場合はスキップ
    if (!this.storage || !requestInfo.config.cacheTTL) return requestInfo;

    // キャッシュキーの生成
    const cacheKey = this.getCacheKey(requestInfo);

    // キャッシュからデータを取得
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      // リクエストをスキップするためのフラグを追加
      return {
        ...requestInfo,
        config: {
          ...requestInfo.config,
          _cacheHit: true,
          _cachedResponse: cachedData,
        },
      };
    }

    return requestInfo;
  }

  postRequest<T>(responseInfo: ApiResponseInfo<T>): ApiResponseInfo<T> {
    const { response, requestInfo } = responseInfo;

    // GETリクエスト以外はキャッシュしない
    if (requestInfo.method !== 'GET') return responseInfo;

    // 成功したレスポンスのみキャッシュする
    if (!response.success) return responseInfo;

    // キャッシュが無効の場合はスキップ
    if (!this.storage || !requestInfo.config.cacheTTL) return responseInfo;

    // キャッシュキーの生成
    const cacheKey = this.getCacheKey(requestInfo);

    // キャッシュに保存
    this.saveToCache(cacheKey, response, requestInfo.config.cacheTTL || this.defaultTTL);

    return responseInfo;
  }

  /**
   * キャッシュキーの生成
   */
  private getCacheKey(requestInfo: ApiRequestInfo): string {
    const { method, url } = requestInfo;
    return `${this.prefix}${method}_${url}`;
  }

  /**
   * キャッシュからデータを取得
   */
  private getFromCache<T>(key: string): ApiResponse<T> | null {
    if (!this.storage) return null;

    try {
      const cachedItem = this.storage.getItem(key);
      if (!cachedItem) return null;

      const { data, expires } = JSON.parse(cachedItem);

      // 期限切れのチェック
      if (expires < Date.now()) {
        this.storage.removeItem(key);
        return null;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.warn(`キャッシュの読み取りに失敗しました: ${key}`, error);
      return null;
    }
  }

  /**
   * キャッシュにデータを保存
   */
  private saveToCache<T>(key: string, data: ApiResponse<T>, ttl: number): void {
    if (!this.storage) return;

    try {
      const cacheItem = {
        data,
        expires: Date.now() + ttl,
      };

      this.storage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`キャッシュの保存に失敗しました: ${key}`, error);
    }
  }

  /**
   * 期限切れのキャッシュをクリーンアップ
   */
  private cleanExpiredCache(): void {
    if (!this.storage) return;

    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);

      if (key && key.startsWith(this.prefix)) {
        try {
          const cachedItem = this.storage.getItem(key);
          if (cachedItem) {
            const { expires } = JSON.parse(cachedItem);

            if (expires < now) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // パースエラーの場合は削除対象に
          keysToRemove.push(key);
        }
      }
    }

    // 期限切れのキャッシュを削除
    keysToRemove.forEach((key) => {
      this.storage?.removeItem(key);
    });
  }
}
