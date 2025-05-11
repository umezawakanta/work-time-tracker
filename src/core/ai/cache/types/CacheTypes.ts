/**
 * キャッシュ関連の型定義
 */
import { AIEnhancementType } from '../../types/AITypes';

/**
 * キャッシュステータス情報
 */
export interface CacheStatus {
    enabled: boolean;
    size: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
}

/**
 * キャッシュエントリインターフェース
 */
export interface CacheEntry {
    key: string;
    data: unknown;
    type: AIEnhancementType;
    timestamp: number;
    expiresAt: number | null;
    metadata?: Record<string, unknown>;
}

/**
 * キャッシュ統計情報
 */
export interface CacheStats {
    hitCount: number;
    missCount: number;
    lastCleanup: number;
    created: number;
    updated?: number;
    cacheHits?: Record<string, number>; // 型ごとのヒット回数
}

/**
 * キャッシュ設定インターフェース
 */
export interface CacheConfig {
    enabled: boolean;
    maxSize: number;
    defaultTTL: number; // ミリ秒
    cleanupInterval: number; // ミリ秒
    useDistributedCache?: boolean;
    distributedCacheUrl?: string;
    compressionEnabled?: boolean;
    compressionThreshold?: number; // バイト
    encryptionEnabled?: boolean;
    version?: string;
}

/**
 * 圧縮設定
 */
export interface CompressionOptions {
    enabled: boolean;
    threshold: number; // バイト単位
    level?: number; // 圧縮レベル（1-9）
}

/**
 * キャッシュクラスター設定
 */
export interface CacheClusterConfig {
    enabled: boolean;
    syncInterval: number; // ミリ秒
    endpoints: string[];
    authToken?: string;
    ttl: number; // ミリ秒
}

/**
 * キャッシュバージョンコントロール
 */
export interface CacheVersionControl {
    cacheVersion: string;
    compatibleVersions: string[];
    migrationStrategy?: 'clear' | 'migrate' | 'ignore';
}