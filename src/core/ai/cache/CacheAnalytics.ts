/**
 * キャッシュ分析
 * キャッシュのパフォーマンスと効率性を分析するためのユーティリティ
 */
import { ApiLogger } from '../logger/ApiLogger';
import { CacheStatus, CacheStats } from './types/CacheTypes';
import { AIEnhancementType } from '../types/AITypes';

/**
 * キャッシュ分析結果インターフェース
 */
export interface CacheAnalyticsResult {
    hitRate: number;
    savings: {
        requestsSaved: number;
        estimatedTimeSaved: number; // ミリ秒
        estimatedCostSaved: number; // USD
    };
    distribution: Record<AIEnhancementType, number>;
    performance: {
        averageLatency: number; // ミリ秒
        p95Latency: number; // ミリ秒
        p99Latency: number; // ミリ秒
    };
    recommendations: string[];
}

/**
 * パフォーマンス記録エントリ
 */
interface PerformanceEntry {
    timestamp: number;
    latency: number; // ミリ秒
    type: AIEnhancementType;
    hit: boolean;
}

/**
 * キャッシュ分析クラス
 */
export class CacheAnalytics {
    private logger: ApiLogger;
    private performanceEntries: PerformanceEntry[] = [];
    private maxEntries = 1000;

    // 平均レスポンス時間の推定（ミリ秒）
    private estimatedResponseTimes: Record<AIEnhancementType, number> = {
        'query-optimization': 500,
        'content-generation': 2000,
        'text-summarization': 1500,
        'sentiment-analysis': 800,
        'entity-extraction': 700,
        'translation': 1200,
        'text-classification': 600,
        'code-generation': 2500,
        'code-explanation': 1800,
        'data-analysis': 3000,
        'image-generation': 5000,
        'image-editing': 4500,
        'image-captioning': 1000,
        'audio-transcription': 4000,
        'chat-completion': 1500,
        'question-answering': 1200,
        'vector-embedding': 300,
        'custom': 1000
    };

    // 推定コスト（$USD/リクエスト）
    private estimatedCosts: Record<AIEnhancementType, number> = {
        'query-optimization': 0.002,
        'content-generation': 0.01,
        'text-summarization': 0.006,
        'sentiment-analysis': 0.003,
        'entity-extraction': 0.004,
        'translation': 0.005,
        'text-classification': 0.003,
        'code-generation': 0.015,
        'code-explanation': 0.008,
        'data-analysis': 0.012,
        'image-generation': 0.08,
        'image-editing': 0.06,
        'image-captioning': 0.005,
        'audio-transcription': 0.05,
        'chat-completion': 0.007,
        'question-answering': 0.006,
        'vector-embedding': 0.0002,
        'custom': 0.005
    };

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger = ApiLogger.getInstance();
        this.logger.setContext('CacheAnalytics');
    }

    /**
     * パフォーマンス記録を追加
     */
    public recordPerformance(
        type: AIEnhancementType,
        latency: number,
        hit: boolean
    ): void {
        this.performanceEntries.push({
            timestamp: Date.now(),
            latency,
            type,
            hit
        });

        // 最大エントリ数を超えた場合は古いものから削除
        if (this.performanceEntries.length > this.maxEntries) {
            this.performanceEntries.shift();
        }
    }

    /**
     * キャッシュ分析を実行
     */
    public analyzeCache(
        status: CacheStatus,
        stats: CacheStats
    ): CacheAnalyticsResult {
        // ヒット率の計算
        const hitRate = status.hitRate;

        // 分布の計算
        const distribution: Record<AIEnhancementType, number> = {};

        if (stats.cacheHits) {
            // 型別のヒット数を集計
            const totalHits = Object.values(stats.cacheHits).reduce((sum, count) => sum + count, 0);

            Object.entries(stats.cacheHits).forEach(([type, count]) => {
                distribution[type as AIEnhancementType] = totalHits > 0 ? count / totalHits : 0;
            });
        }

        // 節約の計算
        const requestsSaved = stats.hitCount;
        let estimatedTimeSaved = 0;
        let estimatedCostSaved = 0;

        // 各タイプごとの節約を計算
        if (stats.cacheHits) {
            Object.entries(stats.cacheHits).forEach(([type, count]) => {
                const typeKey = type as AIEnhancementType;
                estimatedTimeSaved += count * this.estimatedResponseTimes[typeKey];
                estimatedCostSaved += count * this.estimatedCosts[typeKey];
            });
        }

        // パフォーマンス指標の計算
        const latencies = this.performanceEntries.map(entry => entry.latency);
        latencies.sort((a, b) => a - b);

        const averageLatency = latencies.length > 0
            ? latencies.reduce((sum, val) => sum + val, 0) / latencies.length
            : 0;

        const p95Index = Math.floor(latencies.length * 0.95);
        const p99Index = Math.floor(latencies.length * 0.99);

        const p95Latency = latencies.length > 0 ? latencies[p95Index] || latencies[latencies.length - 1] : 0;
        const p99Latency = latencies.length > 0 ? latencies[p99Index] || latencies[latencies.length - 1] : 0;

        // 推奨事項の生成
        const recommendations: string[] = [];

        if (hitRate < 0.1) {
            recommendations.push('キャッシュヒット率が非常に低いです。TTLを延長することを検討してください。');
        }

        if (status.size < 10) {
            recommendations.push('キャッシュサイズが小さいです。最大サイズを増やして効果を高めることを検討してください。');
        }

        if (hitRate > 0.8 && Object.keys(distribution).length < 3) {
            recommendations.push('特定のタイプに偏ったキャッシュ利用が見られます。他のタイプでもキャッシュの活用を検討してください。');
        }

        // 分析結果を返す
        return {
            hitRate,
            savings: {
                requestsSaved,
                estimatedTimeSaved,
                estimatedCostSaved
            },
            distribution,
            performance: {
                averageLatency,
                p95Latency,
                p99Latency
            },
            recommendations
        };
    }

    /**
     * 日時範囲で絞り込んだ分析を実行
     */
    public analyzeTimeRange(
        startTime: number,
        endTime: number
    ): {
        entriesCount: number;
        hitRate: number;
        averageLatency: number;
        typeDistribution: Record<AIEnhancementType, number>;
    } {
        // 日時範囲で絞り込んだエントリを取得
        const entriesInRange = this.performanceEntries.filter(
            entry => entry.timestamp >= startTime && entry.timestamp <= endTime
        );

        if (entriesInRange.length === 0) {
            return {
                entriesCount: 0,
                hitRate: 0,
                averageLatency: 0,
                typeDistribution: {} as Record<AIEnhancementType, number>
            };
        }

        // ヒット率の計算
        const hits = entriesInRange.filter(entry => entry.hit).length;
        const hitRate = hits / entriesInRange.length;

        // 平均レイテンシーの計算
        const averageLatency = entriesInRange.reduce((sum, entry) => sum + entry.latency, 0) / entriesInRange.length;

        // タイプ分布の計算
        const typeCounts: Record<string, number> = {};
        entriesInRange.forEach(entry => {
            typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
        });

        const typeDistribution = Object.entries(typeCounts).reduce((dist, [type, count]) => {
            dist[type as AIEnhancementType] = count / entriesInRange.length;
            return dist;
        }, {} as Record<AIEnhancementType, number>);

        return {
            entriesCount: entriesInRange.length,
            hitRate,
            averageLatency,
            typeDistribution
        };
    }

    /**
     * パフォーマンスデータの保存
     */
    public savePerformanceData(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ai-cache-performance', JSON.stringify({
                    entries: this.performanceEntries,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            this.logger.error('パフォーマンスデータの保存に失敗しました', error);
        }
    }

    /**
     * パフォーマンスデータの読み込み
     */
    public loadPerformanceData(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                const savedData = localStorage.getItem('ai-cache-performance');
                if (savedData) {
                    const parsedData = JSON.parse(savedData) as { entries: PerformanceEntry[] };
                    this.performanceEntries = parsedData.entries;
                }
            }
        } catch (error) {
            this.logger.error('パフォーマンスデータの読み込みに失敗しました', error);
        }
    }
}