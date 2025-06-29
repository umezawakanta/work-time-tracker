/**
 * APIレスポンスキャッシュ
 * API呼び出しの結果をキャッシュして再利用
 */
import { ApiResponse } from './ApiTypes';

interface CacheEntry<T> {
  value: ApiResponse<T>;
  expires: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultMaxAge: number = 5 * 60 * 1000; // 5分

  constructor() {
    this.cache = new Map();

    // 定期的にキャッシュの期限切れをチェック（メモリリーク防止）
    setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  /**
   * キャッシュからデータを取得
   */
  public get<T>(key: string): ApiResponse<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // 期限切れの場合は削除してnullを返す
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * データをキャッシュに保存
   */
  public set<T>(key: string, value: ApiResponse<T>, maxAge?: number): void {
    const expires = Date.now() + (maxAge || this.defaultMaxAge);

    this.cache.set(key, {
      value,
      expires,
    });
  }

  /**
   * キャッシュからデータを削除
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * キャッシュをすべてクリア
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * 期限切れのエントリを削除
   */
  private cleanExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * キャッシュのサイズを取得
   */
  public size(): number {
    return this.cache.size;
  }
}

export default ApiCache;
