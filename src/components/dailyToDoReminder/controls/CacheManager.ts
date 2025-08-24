/**
 * キャッシュマネージャー
 * データのキャッシュを管理するクラス
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export enum CachePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export interface CacheOptions {
  /** キャッシュの有効期限（ミリ秒） */
  ttl?: number;
  /** キャッシュの優先度 */
  priority?: CachePriority;
  /** ローカルストレージにも保存するか */
  persistToStorage?: boolean;
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<any>>;
  private maxCacheSize: number;
  private defaultTTL: number;
  private storagePrefix: string;

  // デフォルトのTTL（有効期限）
  private readonly TTL = {
    [CachePriority.LOW]: 60 * 1000, // 1分
    [CachePriority.NORMAL]: 5 * 60 * 1000, // 5分
    [CachePriority.HIGH]: 30 * 60 * 1000, // 30分
  };

  private constructor() {
    this.memoryCache = new Map();
    this.maxCacheSize = 100; // デフォルトの最大キャッシュサイズ
    this.defaultTTL = this.TTL[CachePriority.NORMAL];
    this.storagePrefix = 'app_cache_';

    // ローカルストレージから永続化されたキャッシュを読み込む
    this.loadPersistedCache();

    // 定期的な期限切れキャッシュの削除
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanExpiredCache(), 60 * 1000); // 1分ごとに実行
    }
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * キャッシュの最大サイズを設定
   */
  public setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;

    // キャッシュサイズが超過している場合は古いものから削除
    if (this.memoryCache.size > this.maxCacheSize) {
      this.pruneCache();
    }
  }

  /**
   * キャッシュの取得
   */
  public get<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const entry = this.memoryCache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();

    // 期限切れの場合はキャッシュを削除
    if (entry.expiresAt < now) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * キャッシュの設定
   */
  public set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    const priority = options.priority || CachePriority.NORMAL;
    const ttl = options.ttl || this.TTL[priority];
    const now = Date.now();

    // キャッシュエントリの作成
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    // メモリキャッシュに保存
    this.memoryCache.set(cacheKey, entry);

    // ローカルストレージにも保存する場合
    if (options.persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${this.storagePrefix}${cacheKey}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to persist cache to localStorage:', error);
      }
    }

    // キャッシュサイズが超過している場合は古いものから削除
    if (this.memoryCache.size > this.maxCacheSize) {
      this.pruneCache();
    }
  }

  /**
   * キャッシュの削除
   */
  public delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.memoryCache.delete(cacheKey);

    // ローカルストレージからも削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.storagePrefix}${cacheKey}`);
    }
  }

  /**
   * キャッシュのクリア
   */
  public clear(): void {
    this.memoryCache.clear();

    // ローカルストレージからもクリア
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * ローカルストレージから永続化されたキャッシュを読み込む
   */
  private loadPersistedCache(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.storagePrefix)) {
          const cacheKey = key.slice(this.storagePrefix.length);
          const value = localStorage.getItem(key);

          if (value) {
            try {
              const entry = JSON.parse(value) as CacheEntry<any>;

              // 期限内のものだけをメモリキャッシュに追加
              if (entry.expiresAt > Date.now()) {
                this.memoryCache.set(cacheKey, entry);
              } else {
                // 期限切れのものはローカルストレージから削除
                localStorage.removeItem(key);
              }
            } catch (e) {
              // 不正なJSON形式の場合は削除
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  /**
   * 期限切れのキャッシュを削除
   */
  private cleanExpiredCache(): void {
    const now = Date.now();

    // メモリキャッシュの期限切れを削除
    this.memoryCache.forEach((entry, key) => {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    });

    // ローカルストレージの期限切れも削除
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.storagePrefix)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const entry = JSON.parse(value) as CacheEntry<any>;
              if (entry.expiresAt < now) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // 不正なJSON形式の場合は削除
            localStorage.removeItem(key);
          }
        }
      });
    }
  }

  /**
   * キャッシュサイズが超過した場合に古いものから削除
   */
  private pruneCache(): void {
    if (this.memoryCache.size <= this.maxCacheSize) return;

    // 古い順にソートしたエントリの配列を作成
    const entries = Array.from(this.memoryCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // 削除する数を計算（最大サイズの20%を削除）
    const deleteCount = Math.ceil(this.maxCacheSize * 0.2);

    // 古いものから削除
    for (let i = 0; i < deleteCount && i < entries.length; i++) {
      const [key] = entries[i];
      this.memoryCache.delete(key);

      // ローカルストレージからも削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${this.storagePrefix}${key}`);
      }
    }
  }

  /**
   * キャッシュキーの生成
   */
  private getCacheKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}

export default CacheManager;
