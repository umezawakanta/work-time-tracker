/**
 * メモリ使用量監視
 * キャッシュのメモリ使用量を監視
 */
import { ApiLogger } from '../logger/ApiLogger';
import { CacheEntry } from './types/CacheTypes';

/**
 * メモリ使用量情報
 */
export interface MemoryUsageInfo {
    totalBytes: number;
    byType: Record<string, number>;
    percentOfLimit: number;
    isNearLimit: boolean;
}

/**
 * メモリ使用量監視クラス
 */
export class MemoryUsageMonitor {
    private logger: ApiLogger;
    private maxMemoryBytes: number;
    private warningThreshold = 0.8; // 80%でワーニング

    /**
     * コンストラクタ
     */
    constructor(maxMemoryMB = 50) {
        this.logger = ApiLogger.getInstance();
        this.logger.setContext('MemoryUsageMonitor');

        // MBをバイトに変換
        this.maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    }

    /**
     * キャッシュのメモリ使用量を計算
     */
    public calculateUsage(cache: Map<string, CacheEntry>): MemoryUsageInfo {
        const typeUsage: Record<string, number> = {};
        let totalBytes = 0;

        // 各エントリのサイズを推定
        cache.forEach(entry => {
            // エントリに既にサイズが設定されている場合はそれを使用
            let entrySize = entry.size;

            // サイズが設定されていない場合は推定
            if (!entrySize) {
                entrySize = this.estimateSize(entry);
            }

            // タイプ別の使用量を集計
            typeUsage[entry.type] = (typeUsage[entry.type] || 0) + entrySize;
            totalBytes += entrySize;
        });

        const percentOfLimit = totalBytes / this.maxMemoryBytes;

        // 制限に近づいている場合は警告
        if (percentOfLimit > this.warningThreshold) {
            this.logger.warn(`メモリ使用量が制限に近づいています: ${Math.round(percentOfLimit * 100)}%`);
        }

        return {
            totalBytes,
            byType: typeUsage,
            percentOfLimit,
            isNearLimit: percentOfLimit > this.warningThreshold
        };
    }

    /**
     * オブジェクトのサイズを推定（バイト単位）
     */
    private estimateSize(obj: unknown): number {
        if (obj === null || obj === undefined) return 0;

        const type = typeof obj;

        // プリミティブ型
        if (type === 'boolean') return 4;
        if (type === 'number') return 8;
        if (type === 'string') return (obj as string).length * 2;

        // 配列やオブジェクト
        if (type === 'object') {
            if (Array.isArray(obj)) {
                // 配列
                return (obj as unknown[]).reduce((acc, item) => acc + this.estimateSize(item), 0);
            } else {
                // オブジェクト
                return Object.entries(obj as Record<string, unknown>)
                    .reduce((acc, [key, value]) => {
                        return acc + key.length * 2 + this.estimateSize(value);
                    }, 0);
            }
        }

        // その他
        return 8;
    }

    /**
     * メモリ上限を設定
     */
    public setMaxMemory(maxMemoryMB: number): void {
        this.maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    }
}