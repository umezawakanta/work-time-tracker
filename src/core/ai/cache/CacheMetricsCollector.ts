/**
 * キャッシュメトリクス収集
 * キャッシュのパフォーマンスメトリクスを収集・分析
 */
import { ApiLogger } from '../logger/ApiLogger';
import { CacheStats, CacheAnalytics } from './types/CacheTypes';
import { AIEnhancementType } from '../types/AITypes';

/**
 * キャッシュメトリクス収集クラス
 */
export class CacheMetricsCollector {
  private logger: ApiLogger;
  private metricsEnabled = false;
  private detailedMetrics = false;
  private metricsEndpoint?: string;
  private lastReportTime = 0;
  private reportInterval = 60 * 60 * 1000; // 1時間ごと

  // 各タイプのAPI呼び出し推定コスト（$）
  private costEstimates: Record<string, number> = {
    'query-optimization': 0.002,
    'content-generation': 0.009,
    'text-summarization': 0.005,
    'sentiment-analysis': 0.003,
    'entity-extraction': 0.004,
    translation: 0.005,
    'chat-completion': 0.008,
    'image-generation': 0.02,
    default: 0.005,
  };

  // 各タイプのAPI呼び出し推定時間（ミリ秒）
  private timeEstimates: Record<string, number> = {
    'query-optimization': 800,
    'content-generation': 2500,
    'text-summarization': 1500,
    'sentiment-analysis': 700,
    'entity-extraction': 900,
    translation: 1200,
    'chat-completion': 1800,
    'image-generation': 4000,
    default: 1000,
  };

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger = ApiLogger.getInstance();
    this.logger.setContext('CacheMetricsCollector');

    // 環境変数から設定を読み込む
    if (typeof process !== 'undefined' && process.env) {
      this.metricsEnabled = process.env.NEXT_PUBLIC_CACHE_METRICS_ENABLED === 'true';
      this.detailedMetrics = process.env.NEXT_PUBLIC_DETAILED_METRICS === 'true';
      this.metricsEndpoint = process.env.NEXT_PUBLIC_METRICS_ENDPOINT;
    }
  }

  /**
   * メトリクスを有効化
   */
  public enableMetrics(enabled: boolean, detailed = false, endpoint?: string): void {
    this.metricsEnabled = enabled;
    this.detailedMetrics = detailed;
    this.metricsEndpoint = endpoint;
  }

  /**
   * キャッシュ分析を実行
   */
  public analyzeCache(
    stats: CacheStats,
    byType: Record<string, { hits: number; misses: number }>
  ): CacheAnalytics {
    const totalHits = stats.hitCount;
    const totalRequests = stats.hitCount + stats.missCount;
    const efficiency = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    // 節約時間の計算
    let timeSaved = 0;
    let costSaved = 0;

    // タイプ別の分析
    const hotEntries: Array<{
      type: AIEnhancementType;
      accessCount: number;
      hitRate: number;
    }> = [];

    Object.entries(byType).forEach(([type, typeStats]) => {
      const typedType = type as AIEnhancementType;
      const timePerRequest = this.timeEstimates[type] || this.timeEstimates.default;
      const costPerRequest = this.costEstimates[type] || this.costEstimates.default;

      // 節約時間と節約コストを計算
      timeSaved += typeStats.hits * timePerRequest;
      costSaved += typeStats.hits * costPerRequest;

      // ヒット率が高いエントリを記録
      const typeHitRate = typeStats.hits / (typeStats.hits + typeStats.misses);
      if (typeStats.hits > 0 && typeHitRate > 0.5) {
        hotEntries.push({
          type: typedType,
          accessCount: typeStats.hits + typeStats.misses,
          hitRate: typeHitRate,
        });
      }
    });

    // ホットエントリを降順でソート
    hotEntries.sort((a, b) => b.hitRate - a.hitRate);

    // 推奨事項の生成
    const recommendations: string[] = [];

    if (efficiency < 30) {
      recommendations.push('キャッシュのヒット率が低いです。TTLの延長を検討してください。');
    }

    if (efficiency > 90 && Object.keys(byType).length <= 2) {
      recommendations.push(
        '特定のタイプに偏ったキャッシュ利用が見られます。他のタイプでもキャッシュを活用しましょう。'
      );
    }

    if (totalRequests > 1000 && totalHits < 100) {
      recommendations.push('キャッシュサイズの拡大を検討してください。');
    }

    // 分析結果を返す
    return {
      efficiency,
      savings: {
        time: timeSaved,
        cost: costSaved,
        apiCalls: totalHits,
      },
      recommendations,
      hotEntries,
    };
  }

  /**
   * メトリクスを記録
   */
  public async recordMetrics(
    stats: CacheStats,
    byType: Record<string, { hits: number; misses: number }>
  ): Promise<void> {
    if (!this.metricsEnabled) {
      return;
    }

    const now = Date.now();

    // 報告間隔内なら処理しない
    if (now - this.lastReportTime < this.reportInterval) {
      return;
    }

    this.lastReportTime = now;

    try {
      // メトリクスを分析
      const analytics = this.analyzeCache(stats, byType);

      // メトリクスが有効でエンドポイントが設定されている場合は送信
      if (this.metricsEndpoint) {
        // データを送信
        await fetch(this.metricsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: now,
            stats: {
              hitCount: stats.hitCount,
              missCount: stats.missCount,
              hitRate: stats.hitCount / (stats.hitCount + stats.missCount || 1),
              types: Object.keys(byType).length,
            },
            analytics: {
              efficiency: analytics.efficiency,
              timeSaved: analytics.savings.time,
              costSaved: analytics.savings.cost,
              apiCallsSaved: analytics.savings.apiCalls,
            },
            detailed: this.detailedMetrics
              ? {
                  byType,
                  hotEntries: analytics.hotEntries,
                }
              : undefined,
          }),
        });

        this.logger.debug('キャッシュメトリクスを送信しました');
      }
    } catch (error) {
      this.logger.error('メトリクスの記録に失敗しました', error);
    }
  }
}
