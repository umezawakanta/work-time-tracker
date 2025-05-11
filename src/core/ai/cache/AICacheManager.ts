/**
 * AIキャッシュマネージャー
 * AI処理結果をキャッシュして効率化するコンポーネント
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIEnhancementType, AIFeatureOptions } from '../types/AITypes';
import {
    CacheStatus, CacheEntry, CacheStats, CacheConfig,
    CachePriority, SubscriptionPlan
} from './types/CacheTypes';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { CacheStorage } from './CacheStorage';
import { CachePriorityQueue } from './CachePriorityQueue';
import { MemoryUsageMonitor } from './MemoryUsageMonitor';
import { CacheMetricsCollector } from './CacheMetricsCollector';

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
    private priorityQueue?: CachePriorityQueue;
    private memoryMonitor?: MemoryUsageMonitor;
    private metricsCollector: CacheMetricsCollector;
    private typeStats: Record<string, { hits: number; misses: number }> = {};
    private userId?: string;

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger = ApiLogger.getInstance();
        this.storage = new CacheStorage(this.logger);
        this.metricsCollector = new CacheMetricsCollector();

        // デフォルト設定
        this.config = {
            enabled: true,
            maxSize: 100,
            defaultTTL: 24 * 60 * 60 * 1000, // 24時間（ミリ秒）
            cleanupInterval: 10 * 60 * 1000,  // 10分（ミリ秒）
            priorityBased: false,
            adaptiveTTL: false
        };

        // デフォルト統計
        this.stats = {
            hitCount: 0,
            missCount: 0,
            lastCleanup: Date.now(),
            created: Date.now() // ESLintエラー修正: created プロパティを追加
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

        // 拡張機能の初期化
        this.initializeExtensions();

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

            // 優先度ベースのキャッシュ
            if (env.NEXT_PUBLIC_PRIORITY_CACHE === 'true') {
                this.config.priorityBased = true;
            }

            // 適応型TTL
            if (env.NEXT_PUBLIC_ADAPTIVE_TTL === 'true') {
                this.config.adaptiveTTL = true;
            }

            // メモリ上限
            if (env.NEXT_PUBLIC_CACHE_MAX_MEMORY_MB) {
                const maxMemory = parseInt(env.NEXT_PUBLIC_CACHE_MAX_MEMORY_MB, 10);
                if (!isNaN(maxMemory) && maxMemory > 0) {
                    this.config.maxMemoryMB = maxMemory;
                }
            }
        }
    }

    /**
     * 拡張機能の初期化
     */
    private initializeExtensions(): void {
        // 優先度ベースのキャッシュが有効な場合
        if (this.config.priorityBased) {
            this.priorityQueue = new CachePriorityQueue();
        }

        // メモリ監視が有効な場合
        if (this.config.maxMemoryMB) {
            this.memoryMonitor = new MemoryUsageMonitor(this.config.maxMemoryMB);
        }
    }

    /**
     * 保存されたキャッシュデータの読み込み
     */
    private loadCachedData(): void {
        const loadedData = this.storage.loadData();
        this.cache = loadedData.cache;
        this.stats = loadedData.stats;

        // タイプ別統計の初期化
        this.initializeTypeStats();

        // 期限切れのエントリを削除
        this.cleanupExpiredEntries();

        // 優先度キューを再構築
        this.rebuildPriorityQueue();

        this.logger.debug(`${this.cache.size}件のキャッシュエントリを読み込みました`);
    }

    /**
     * タイプ別統計の初期化
     */
    private initializeTypeStats(): void {
        this.typeStats = {};

        // 既存のキャッシュエントリからタイプ別統計を初期化
        this.cache.forEach(entry => {
            if (!this.typeStats[entry.type]) {
                this.typeStats[entry.type] = { hits: 0, misses: 0 };
            }
        });
    }

    /**
     * 優先度キューを再構築
     */
    private rebuildPriorityQueue(): void {
        if (!this.priorityQueue || this.cache.size === 0) {
            return;
        }

        // キューをクリア
        this.priorityQueue.clear();

        // すべてのエントリをキューに追加
        this.cache.forEach((entry, key) => {
            this.priorityQueue?.add(key, entry);
        });
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
     * ユーザーIDを設定
     */
    public setUserId(userId: string): void {
        this.userId = userId;
    }

    /**
     * サブスクリプションプランを取得
     */
    private getSubscriptionPlan(): SubscriptionPlan {
        // 実際の実装ではサブスクリプションサービスからプランを取得
        if (!this.userId) {
            return SubscriptionPlan.FREE;
        }

        // ユーザーIDからプランを推測（デモ用）
        if (this.userId.includes('premium')) {
            return SubscriptionPlan.PREMIUM;
        } else if (this.userId.includes('enterprise')) {
            return SubscriptionPlan.ENTERPRISE;
        } else if (this.userId.includes('basic')) {
            return SubscriptionPlan.BASIC;
        }

        return SubscriptionPlan.FREE;
    }

    /**
     * プランに基づくキャッシュ制限を取得
     */
    private getPlanLimits(): {
        maxSize: number;
        maxTTL: number;
    } {
        const plan = this.getSubscriptionPlan();

        switch (plan) {
            case SubscriptionPlan.ENTERPRISE:
                return { maxSize: 10000, maxTTL: 30 * 24 * 60 * 60 * 1000 }; // 30日
            case SubscriptionPlan.PREMIUM:
                return { maxSize: 1000, maxTTL: 7 * 24 * 60 * 60 * 1000 }; // 7日
            case SubscriptionPlan.BASIC:
                return { maxSize: 200, maxTTL: 3 * 24 * 60 * 60 * 1000 }; // 3日
            default:
                return { maxSize: 100, maxTTL: 24 * 60 * 60 * 1000 }; // 1日
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
        const cacheKey = this.userId ?
            CacheKeyGenerator.generateScopedKey(data, type, options, this.userId) :
            CacheKeyGenerator.generateKey(data, type, options);

        // キャッシュからエントリを取得
        const entry = this.cache.get(cacheKey);

        // エントリがない場合はnullを返す
        if (!entry) {
            this.stats.missCount++;
            this.incrementTypeStat(type, 'misses');
            return null;
        }

        // 期限切れの場合はエントリを削除してnullを返す
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.cache.delete(cacheKey);
            this.stats.missCount++;
            this.incrementTypeStat(type, 'misses');
            this.storage.saveData(this.cache, this.stats);
            return null;
        }

        // ヒットカウントを更新
        this.stats.hitCount++;
        this.incrementTypeStat(type, 'hits');

        // エントリの更新（アクセス統計）
        const updatedEntry: CacheEntry = {
            ...entry,
            lastAccessed: Date.now(),
            accessCount: (entry.accessCount || 0) + 1
        };

        // アダプティブTTLが有効で、アクセス回数が閾値を超えた場合はTTLを延長
        if (this.config.adaptiveTTL &&
            updatedEntry.accessCount &&
            updatedEntry.accessCount > 5 &&
            updatedEntry.expiresAt) {
            // アクセス頻度が高いほどTTLを延長
            const planLimits = this.getPlanLimits();
            const extendedTTL = Math.min(
                updatedEntry.expiresAt + (24 * 60 * 60 * 1000), // 1日延長
                entry.timestamp + planLimits.maxTTL // プラン上限
            );

            updatedEntry.expiresAt = extendedTTL;
        }

        // エントリを更新
        this.cache.set(cacheKey, updatedEntry);

        // 優先度キューも更新
        if (this.priorityQueue) {
            this.priorityQueue.update(cacheKey, current => ({
                ...current,
                ...updatedEntry
            }));
        }

        // ログ出力（安全なキー表現）
        const safeKey = CacheKeyGenerator.getSafeKeyForLogging(cacheKey);
        this.logger.debug(`キャッシュヒット: ${type} - ${safeKey}`);

        // 定期的にクリーンアップを実行
        this.scheduleCleanup();

        return entry.data;
    }

    /**
     * タイプ別統計を更新
     */
    private incrementTypeStat(
        type: AIEnhancementType,
        stat: 'hits' | 'misses'
    ): void {
        if (!this.typeStats[type]) {
            this.typeStats[type] = { hits: 0, misses: 0 };
        }

        this.typeStats[type][stat]++;
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

        // プラン制限を取得
        const planLimits = this.getPlanLimits();

        // 制限チェック
        if (this.cache.size >= planLimits.maxSize) {
            // 優先度ベースならば古いエントリを削除
            if (this.priorityQueue) {
                this.removeLowestPriorityEntry();
            } else {
                // 制限に達している場合は古いエントリを削除
                this.removeOldestEntry();
            }
        }

        // メモリ使用量のチェック
        if (this.memoryMonitor) {
            const usage = this.memoryMonitor.calculateUsage(this.cache);

            // メモリ制限に近い場合は古いエントリを削除
            if (usage.isNearLimit) {
                // 複数のエントリを削除してスペースを確保
                for (let i = 0; i < 5; i++) {
                    if (this.priorityQueue) {
                        this.removeLowestPriorityEntry();
                    } else {
                        this.removeOldestEntry();
                    }
                }
            }
        }

        // キャッシュキーを生成
        const cacheKey = this.userId ?
            CacheKeyGenerator.generateScopedKey(data, type, options, this.userId) :
            CacheKeyGenerator.generateKey(data, type, options);

        // TTLを計算（プラン上限を超えないようにする）
        const ttl = Math.min(
            options.cacheTTL !== undefined ? options.cacheTTL * 1000 : this.config.defaultTTL,
            planLimits.maxTTL
        );

        const expiresAt = ttl > 0 ? Date.now() + ttl : null;

        // 優先度を計算
        const priority = this.calculatePriority(type, options);

        // キャッシュエントリを作成
        const entry: CacheEntry = {
            key: cacheKey,
            data: result,
            type,
            timestamp: Date.now(),
            expiresAt,
            priority,
            accessCount: 1,
            lastAccessed: Date.now(),
            userId: this.userId
        };

        // キャッシュにエントリを追加
        this.cache.set(cacheKey, entry);

        // 優先度キューに追加
        if (this.priorityQueue) {
            this.priorityQueue.add(cacheKey, entry);
        }

        // タイプ別統計を初期化
        if (!this.typeStats[type]) {
            this.typeStats[type] = { hits: 0, misses: 0 };
        }

        // ログ出力（安全なキー表現）
        const safeKey = CacheKeyGenerator.getSafeKeyForLogging(cacheKey);
        this.logger.debug(`キャッシュ保存: ${type} - ${safeKey}`);

        // 定期的にデータを保存
        this.storage.saveData(this.cache, this.stats);

        // 定期的にクリーンアップを実行
        this.scheduleCleanup();

        // メトリクス収集
        void this.metricsCollector.recordMetrics(this.stats, this.typeStats);
    }

    /**
     * エントリの優先度を計算
     */
    private calculatePriority(
        type: AIEnhancementType,
        options: AIFeatureOptions
    ): number {
        // デフォルトはノーマル優先度
        let priority = CachePriority.NORMAL;

        // タイプに基づく優先度調整
        switch (type) {
            case 'content-generation':
            case 'image-generation':
            case 'code-generation':
                // 生成は時間がかかるので高優先度
                priority = CachePriority.HIGH;
                break;
            case 'query-optimization':
            case 'translation':
                // 基本的な処理は低優先度
                priority = CachePriority.LOW;
                break;
        }

        // オプションから優先度を上書き
        if (options.cachePriority !== undefined) {
            priority = Number(options.cachePriority);
        }

        return priority;
    }

    /**
     * 優先度の最も低いエントリを削除
     */
    private removeLowestPriorityEntry(): void {
        if (!this.priorityQueue) {
            this.removeOldestEntry();
            return;
        }

        const lowest = this.priorityQueue.popLeast();
        if (lowest) {
            this.cache.delete(lowest.key);

            const safeKey = CacheKeyGenerator.getSafeKeyForLogging(lowest.key);
            this.logger.debug(`最も優先度の低いキャッシュエントリを削除: ${safeKey}`);
        }
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

            const safeKey = CacheKeyGenerator.getSafeKeyForLogging(oldestKey);
            this.logger.debug(`最も古いキャッシュエントリを削除: ${safeKey}`);
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

            // 優先度キューを再構築
            if (this.priorityQueue) {
                this.rebuildPriorityQueue();
            }
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
        this.stats.updated = Date.now();
        this.typeStats = {};

        // 優先度キューをクリア
        if (this.priorityQueue) {
            this.priorityQueue.clear();
        }

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

        const cacheKey = this.userId ?
            CacheKeyGenerator.generateScopedKey(data, type, options, this.userId) :
            CacheKeyGenerator.generateKey(data, type, options);

        const removed = this.cache.delete(cacheKey);

        if (removed) {
            this.storage.saveData(this.cache, this.stats);

            const safeKey = CacheKeyGenerator.getSafeKeyForLogging(cacheKey);
            this.logger.debug(`キャッシュエントリを削除: ${safeKey}`);

            // 優先度キューの再構築
            if (this.priorityQueue) {
                this.rebuildPriorityQueue();
            }
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

        // メモリ使用状況
        let memoryUsage;
        if (this.memoryMonitor) {
            const usage = this.memoryMonitor.calculateUsage(this.cache);
            memoryUsage = {
                bytes: usage.totalBytes,
                percentage: usage.percentOfLimit * 100
            };
        }

        // 効率性情報
        const analytics = this.metricsCollector.analyzeCache(this.stats, this.typeStats);
        const efficiency = {
            savingsPercentage: analytics.efficiency,
            costSaved: analytics.savings.cost
        };

        return {
            enabled: this.config.enabled,
            size: this.cache.size,
            hitRate,
            oldestEntry,
            newestEntry,
            memoryUsage,
            efficiency
        };
    }
}