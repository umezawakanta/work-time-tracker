/**
 * メモリキャッシュ
 * 高速なインメモリキャッシュを提供
 */

/**
 * メモリキャッシュインターフェース
 * キャッシュの有効期限や最大サイズなどを管理
 */
export interface MemoryCacheOptions {
  maxSize?: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
}

/**
 * メモリキャッシュクラス
 * LRUアルゴリズムを使用した高速キャッシュ
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number; lastAccessed: number }>();
  private maxSize: number;
  private defaultTTL: number;
  private updateAgeOnGet: boolean;

  /**
   * コンストラクタ
   */
  constructor(options?: MemoryCacheOptions) {
    this.maxSize = options?.maxSize || 1000;
    this.defaultTTL = options?.ttl || 60 * 60 * 1000; // デフォルト1時間
    this.updateAgeOnGet = options?.updateAgeOnGet || true;
  }

  /**
   * キャッシュにアイテムを設定
   */
  public set(key: string, value: T, ttl?: number): void {
    // キャッシュが最大サイズに達している場合は最も古いアイテムを削除
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const now = Date.now();
    const expires = ttl ? now + ttl : now + this.defaultTTL;

    this.cache.set(key, {
      value,
      expires,
      lastAccessed: now,
    });
  }

  /**
   * キャッシュからアイテムを取得
   */
  public get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    const now = Date.now();

    // 期限切れチェック
    if (item.expires < now) {
      this.cache.delete(key);
      return undefined;
    }

    // アクセス時間を更新（LRU用）
    if (this.updateAgeOnGet) {
      item.lastAccessed = now;
    }

    return item.value;
  }

  /**
   * キャッシュからアイテムを削除
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * キャッシュを完全にクリア
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * キャッシュにキーが存在するかチェック
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    const now = Date.now();

    // 期限切れチェック
    if (item.expires < now) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * キャッシュサイズを取得
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * すべてのキーを取得
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * すべての値を取得
   */
  public values(): T[] {
    const now = Date.now();
    const result: T[] = [];

    this.cache.forEach((item, key) => {
      if (item.expires >= now) {
        result.push(item.value);
      } else {
        this.cache.delete(key);
      }
    });

    return result;
  }

  /**
   * 最も古いアイテムを削除（LRUアルゴリズム）
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    this.cache.forEach((item, key) => {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 期限切れのアイテムをクリーンアップ
   */
  public cleanup(): number {
    const now = Date.now();
    let count = 0;

    this.cache.forEach((item, key) => {
      if (item.expires < now) {
        this.cache.delete(key);
        count++;
      }
    });

    return count;
  }
}
