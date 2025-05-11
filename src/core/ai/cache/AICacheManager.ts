/**
 * AIキャッシュマネージャー
 * AI処理結果をキャッシュして効率化するコンポーネント
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIEnhancementType, AIFeatureOptions } from '../types/AITypes';
import { CacheStatus, CacheEntry, CacheStats, CacheConfig } from './types/CacheTypes';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { CacheStorage } from './CacheStorage';

/**
 * AIキャッシュマネージャークラス
 */
export class AICacheManager {
    private logger: ApiLogger;
    private initialized = false;
    private config: CacheConfig;
    private cache = new Map<string, CacheEntry>();
    private stats: CacheStats;
    private storage: CacheStorage;

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger = ApiLogger.getInstance();
        this.storage = new CacheStorage(this.logger);

        // デフォルト設定
        this.config = {
            enabled: true,
            maxSize: 100,
            defaultTTL: 24 * 60 * 60 * 1000, // 24時間（ミリ秒）
            cleanupInterval: 10 * 60 * 1000  // 10分ごとに古いキャッシュをクリーンアップ
        };

        // デフォルト統計
        this.stats = {
            hitCount: 0,
            missCount: 0,
            lastCleanup: Date.now()
        };
    }

    /**
     * 初期化メソッド
     */
    public initialize(): void {
        if (this.initialized) return;

        this.logger.setContext('AICacheManager');
        this.logger.info('AIキャッシュマネージャーを初期化しています');

        // 環境変数から設定を読み込む
        this.loadConfig();

        // 保存されたキャッシュを読み込む
        this.loadCachedData();

        // 複数タブ間の同期を設定
        this.setupCrossTabSync();

        this.initialized = true;
        this.logger.info('AIキャッシュマネージャーが初期化されました');
    }

    /**
     * 設定の読み込み
     */
    private loadConfig(): void {
        if (typeof process !== 'undefined' && process.env) {
            const env = process.env;

            // キャッシュの有効/無効
            if (env.NEXT_PUBLIC_AI_CACHE_ENABLED === 'false') {
                this.config.enabled = false;
                this.logger.info('AIキャッシュが無効化されています');
            }

            // 最大キャッシュサイズ
            if (env.NEXT_PUBLIC_AI_CACHE_MAX_SIZE) {
                const maxSize = parseInt(env.NEXT_PUBLIC_AI_CACHE_MAX_SIZE, 10);
                if (!isNaN(maxSize) && maxSize > 0) {
                    this.config.maxSize = maxSize;
                }
            }

            // デフォルトTTL
            if (env.NEXT_PUBLIC_AI_CACHE_DEFAULT_TTL) {
                const ttl = parseInt(env.NEXT_PUBLIC_AI_CACHE_DEFAULT_TTL, 10);
                if (!isNaN(ttl) && ttl > 0) {
                    this.config.defaultTTL = ttl * 1000; // 秒からミリ秒に変換
                }
            }
        }
    }

    /**
     * 保存されたキャッシュデータの読み込み
     */
    private loadCachedData(): void {
        const loadedData = this.storage.loadData();
        this.cache = loadedData.cache;
        this.stats = loadedData.stats;

        // 期限切れのエントリを削除
        this.cleanupExpiredEntries();

        this.logger.debug(`${this.cache.size}件のキャッシュエントリを読み込みました`);
    }

    /**
     * 複数タブ間でキャッシュを同期
     */
    private setupCrossTabSync(): void {
        this.storage.syncCacheAcrossTabs();

        if (typeof window !== 'undefined') {
            window.addEventListener('ai-cache-updated', () => {
                this.loadCachedData();
            });
        }
    }

    /**
     * キャッシュからデータを取得
     */
    public async get(
        data: unknown,
        type: AIEnhancementType,
        options: AIFeatureOptions
    ): Promise<unknown | null> {
        if (!this.initialized) {
            this.initialize();
        }

        // キャッシュが無効な場合はnullを返す
        if (!this.config.enabled) {
            return null;
        }

        // キャッシュキーを生成
        const cacheKey = CacheKeyGenerator.generateKey(data, type, options);

        // キャッシュからエントリを取得
        const entry = this.cache.get(cacheKey);

        // エントリがない場合はnullを返す
        if (!entry) {
            this.stats.missCount++;
            return null;
        }

        // 期限切れの場合はエントリを削除してnullを返す
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.cache.delete(cacheKey);
            this.stats.missCount++;
            this.storage.saveData(this.cache, this.stats);
            return null;
        }

        this.stats.hitCount++;
        this.logger.debug(`キャッシュヒット: ${type} - ${cacheKey.substring(0, 20)}...`);

        // 定期的にクリーンアップを実行
        this.scheduleCleanup();

        return entry.data;
    }

    /**
     * データをキャッシュに保存
     */
    public async set(
        data: unknown,
        result: unknown,
        type: AIEnhancementType,
        options: AIFeatureOptions
    ): Promise<void> {
        if (!this.initialized) {
            this.initialize();
        }

        // キャッシュが無効な場合は何もしない
        if (!this.config.enabled) {
            return;
        }

        // キャッシュキーを生成
        const cacheKey = CacheKeyGenerator.generateKey(data, type, options);

        // TTLを計算
        const ttl = options.cacheTTL !== undefined ? options.cacheTTL * 1000 : this.config.defaultTTL;
        const expiresAt = ttl > 0 ? Date.now() + ttl : null;

        // キャッシュエントリを作成
        const entry: CacheEntry = {
            key: cacheKey,
            data: result,
            type,
            timestamp: Date.now(),
            expiresAt
        };

        // キャッシュが最大サイズに達している場合は古いエントリを削除
        if (this.cache.size >= this.config.maxSize) {
            this.removeOldestEntry();
        }

        // キャッシュにエントリを追加
        this.cache.set(cacheKey, entry);

        this.logger.debug(`キャッシュ保存: ${type} - ${cacheKey.substring(0, 20)}...`);

        // 定期的にデータを保存
        this.storage.saveData(this.cache, this.stats);

        // 定期的にクリーンアップを実行
        this.scheduleCleanup();
    }

    /**
     * 最も古いエントリを削除
     */
    private removeOldestEntry(): void {
        if (this.cache.size === 0) {
            return;
        }

        let oldestKey: string | null = null;
        let oldestTime = Date.now();

        // 最も古いエントリを検索
        this.cache.forEach((entry, key) => {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        });

        // 最も古いエントリを削除
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.logger.debug(`最も古いキャッシュエントリを削除しました: ${oldestKey.substring(0, 20)}...`);
        }
    }

    /**
     * 期限切れのエントリをクリーンアップ
     */
    private cleanupExpiredEntries(): void {
        const now = Date.now();
        let removedCount = 0;

        // 期限切れのエントリを削除
        this.cache.forEach((entry, key) => {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.cache.delete(key);
                removedCount++;
            }
        });

        if (removedCount > 0) {
            this.logger.debug(`${removedCount}件の期限切れキャッシュエントリを削除しました`);
        }

        this.stats.lastCleanup = now;
    }

    /**
     * クリーンアップのスケジュール
     */
    private scheduleCleanup(): void {
        const now = Date.now();

        // 前回のクリーンアップから一定時間経過している場合にのみ実行
        if (now - this.stats.lastCleanup > this.config.cleanupInterval) {
            this.cleanupExpiredEntries();
            this.storage.saveData(this.cache, this.stats);
        }
    }

    /**
     * キャッシュを完全にクリア
     */
    public clearCache(): void {
        this.cache.clear();
        this.stats.hitCount = 0;
        this.stats.missCount = 0;
        this.storage.saveData(this.cache, this.stats);
        this.logger.info('キャッシュをクリアしました');
    }

    /**
     * 特定のキャッシュを削除
     */
    public removeFromCache(
        data: unknown,
        type: AIEnhancementType,
        options: AIFeatureOptions
    ): boolean {
        if (!this.initialized) {
            this.initialize();
        }

        const cacheKey = CacheKeyGenerator.generateKey(data, type, options);
        const removed = this.cache.delete(cacheKey);

        if (removed) {
            this.storage.saveData(this.cache, this.stats);
            this.logger.debug(`キャッシュエントリを削除しました: ${cacheKey.substring(0, 20)}...`);
        }

        return removed;
    }

    /**
     * キャッシュの有効/無効を設定
     */
    public setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
        this.logger.info(`キャッシュが${enabled ? '有効' : '無効'}になりました`);
    }

    /**
     * ステータス情報の取得
     */
    public getStatus(): CacheStatus {
        if (!this.initialized) {
            this.initialize();
        }

        let oldestEntry: number | null = null;
        let newestEntry: number | null = null;

        if (this.cache.size > 0) {
            oldestEntry = Date.now();
            newestEntry = 0;

            this.cache.forEach(entry => {
                if (entry.timestamp < oldestEntry!) {
                    oldestEntry = entry.timestamp;
                }
                if (entry.timestamp > newestEntry!) {
                    newestEntry = entry.timestamp;
                }
            });
        }

        const total = this.stats.hitCount + this.stats.missCount;
        const hitRate = total > 0 ? this.stats.hitCount / total : 0;

        return {
            enabled: this.config.enabled,
            size: this.cache.size,
            hitRate,
            oldestEntry,
            newestEntry
        };
    }
}