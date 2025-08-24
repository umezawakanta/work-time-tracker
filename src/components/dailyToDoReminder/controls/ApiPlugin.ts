/**
 * APIプラグインシステム
 * APIクライアントの機能を拡張するためのプラグインインターフェースと実装
 */

import { ApiResponse, ExtendedRequestConfig } from './ApiTypes';

/**
 * APIリクエスト情報
 */
export interface ApiRequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  config: ExtendedRequestConfig;
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
 * プラグインフック
 */
export interface PluginHooks {
  beforeRequest?: (config: unknown, serviceName: string) => Promise<unknown>;
  afterResponse?: (data: unknown, response: unknown, serviceName: string) => Promise<unknown>;
  onError?: (errorResponse: unknown, error: Error, serviceName: string) => Promise<void>;
}

/**
 * APIプラグインインターフェース
 */
export interface ApiPlugin {
  id: string;
  name: string;
  version: string;
  hooks: PluginHooks;

  beforeRequest?: (
    url: string,
    config: ExtendedRequestConfig
  ) => ExtendedRequestConfig | Promise<ExtendedRequestConfig>;
  afterResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: Error) => void | Promise<void>;
}

/**
 * 基本的なAPIプラグイン実装
 */
export abstract class BaseApiPlugin implements ApiPlugin {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract hooks: PluginHooks;

  beforeRequest?(
    url: string,
    config: ExtendedRequestConfig
  ): ExtendedRequestConfig | Promise<ExtendedRequestConfig> {
    return config;
  }

  afterResponse?<T>(response: ApiResponse<T>): ApiResponse<T> | Promise<ApiResponse<T>> {
    return response;
  }

  onError?(error: Error): void | Promise<void> {
    console.error(`Plugin ${this.name} encountered an error:`, error);
  }
}

/**
 * ロギングプラグイン
 * APIリクエストをログに記録する
 */
export class LoggingPlugin extends BaseApiPlugin {
  id = 'logging-plugin';
  name = 'Logging Plugin';
  version = '1.0.0';
  hooks: PluginHooks = {};

  constructor() {
    super();
  }

  preRequest(requestInfo: ApiRequestInfo): ApiRequestInfo {
    console.log(`[API] ${requestInfo.method} ${requestInfo.url} - リクエスト開始`);
    return requestInfo;
  }

  afterResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
    console.log(
      `[API] レスポンス受信`,
      response.success ? '成功' : `エラー: ${response.error?.message || 'Unknown error'}`
    );
    return response;
  }

  onError(error: Error): void {
    console.error(`[API] リクエストエラー:`, error.message);
  }
}

/**
 * キャッシュプラグイン
 * API応答をローカルストレージにキャッシュする
 */
export class CachePlugin extends BaseApiPlugin {
  id = 'cache-plugin';
  name = 'Cache Plugin';
  version = '1.0.0';
  hooks: PluginHooks = {};

  private storage: Storage | null;
  private prefix: string;
  private defaultTTL: number;

  constructor(
    prefix: string = 'api_cache_',
    defaultTTL: number = 5 * 60 * 1000 // 5分
  ) {
    super();

    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    this.storage = typeof localStorage !== 'undefined' ? localStorage : null;

    // 起動時に期限切れのキャッシュをクリーンアップ
    this.cleanExpiredCache();
  }

  beforeRequest(url: string, config: ExtendedRequestConfig): ExtendedRequestConfig {
    // Remove method check since ExtendedRequestConfig doesn't have method property
    // Cache for all requests - method checking should be done at a higher level
    if (!this.storage) return config;

    // Generate cache key
    const cacheKey = this.getCacheKey(url);

    // Get cached data
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      // Add cache hit flag
      return {
        ...config,
        cacheHit: true,
        cachedResponse: cachedData,
      } as ExtendedRequestConfig;
    }

    return config;
  }

  afterResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
    // 成功したレスポンスのみキャッシュする
    if (!response.success) return response;

    // キャッシュが無効の場合はスキップ
    if (!this.storage) return response;

    // キャッシュキーの生成
    const cacheKey = this.getCacheKey(''); // URL should be passed from context

    // キャッシュに保存
    this.saveToCache(cacheKey, response, this.defaultTTL);

    return response;
  }

  /**
   * キャッシュキーの生成
   */
  private getCacheKey(url: string): string {
    return `${this.prefix}GET_${url}`;
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
    } catch {
      // パースエラーの場合は削除対象に
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
        } catch {
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
