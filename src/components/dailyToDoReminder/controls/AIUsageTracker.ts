/**
 * AI使用統計トラッカー
 * AIモデルの使用状況と消費を追跡するクラス
 */
import { ApiLogger } from './ApiLogger';
import { AIModel, AIUsageStats } from './AITypes';

/**
 * AIトークン使用量記録用ストレージキー
 */
const STORAGE_KEY = 'ai_usage_stats';

/**
 * AIモデル使用統計トラッカー
 */
export class AIUsageTracker {
    private logger = new ApiLogger();
    private usageStats: AIUsageStats = {
        requests: 0,
        tokens: {
            input: 0,
            output: 0,
            total: 0
        },
        processingTime: 0,
        lastUsage: 0,
        costEstimate: 0,
        modelsUsed: {}
    };
    private autoSaveInterval: number | null = null;

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger.setContext('AIUsageTracker');
    }

    /**
     * 初期化
     */
    public initialize(): void {
        // 使用統計の読み込み
        this.loadUsageStats();

        // 自動保存の設定
        if (typeof window !== 'undefined') {
            this.autoSaveInterval = window.setInterval(() => {
                this.saveUsageStats();
            }, 60000); // 1分ごとに保存
        }

        this.logger.info('AI使用統計トラッカーが初期化されました');
    }

    /**
     * クリーンアップ
     */
    public cleanup(): void {
        // 自動保存を停止
        if (this.autoSaveInterval !== null && typeof window !== 'undefined') {
            window.clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        // 最後に保存
        this.saveUsageStats();
    }

    /**
     * 使用統計の読み込み
     */
    private loadUsageStats(): void {
        if (typeof window === 'undefined') return;

        try {
            const storedStats = localStorage.getItem(STORAGE_KEY);
            if (storedStats) {
                this.usageStats = JSON.parse(storedStats);
                this.logger.debug('AI使用統計を読み込みました');
            }
        } catch (error) {
            this.logger.warn('AI使用統計の読み込みに失敗しました', error);
        }
    }

    /**
     * 使用統計の保存
     */
    public saveUsageStats(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usageStats));
            this.logger.debug('AI使用統計を保存しました');
        } catch (error) {
            this.logger.warn('AI使用統計の保存に失敗しました', error);
        }
    }

    /**
     * 使用統計を追跡
     * @param inputTokens 入力トークン数
     * @param outputTokens 出力トークン数
     * @param duration 処理時間（ミリ秒）
     * @param model 使用したモデル（オプション）
     */
    public trackUsage(
        inputTokens: number,
        outputTokens: number,
        duration: number,
        model?: AIModel
    ): void {
        // 基本的な統計情報の更新
        this.usageStats.requests++;
        this.usageStats.tokens.input += inputTokens;
        this.usageStats.tokens.output += outputTokens;
        this.usageStats.tokens.total += (inputTokens + outputTokens);
        this.usageStats.processingTime += duration;
        this.usageStats.lastUsage = Date.now();

        // モデル情報があればモデル別統計を更新
        if (model) {
            const cost = (inputTokens * model.tokenCost.input) + (outputTokens * model.tokenCost.output);
            this.usageStats.costEstimate += cost;

            // モデル別使用量の記録
            const modelId = model.id;
            if (!this.usageStats.modelsUsed[modelId]) {
                this.usageStats.modelsUsed[modelId] = {
                    requests: 0,
                    tokens: 0,
                    cost: 0
                };
            }

            this.usageStats.modelsUsed[modelId].requests++;
            this.usageStats.modelsUsed[modelId].tokens += (inputTokens + outputTokens);
            this.usageStats.modelsUsed[modelId].cost += cost;
        }

        // 自動保存を定期的に行っているので、ここでは保存しない
        // 頻度が高い場合にパフォーマンス影響を避けるため
    }

    /**
     * 使用統計サマリーの取得
     */
    public getUsageSummary(): Record<string, unknown> {
        // 使用頻度の高いモデルをソート
        const topModels = Object.entries(this.usageStats.modelsUsed)
            .sort(([, a], [, b]) => b.requests - a.requests)
            .slice(0, 5)
            .map(([id, stats]) => ({
                id,
                requests: stats.requests,
                tokens: stats.tokens,
                estimatedCost: stats.cost.toFixed(4)
            }));

        return {
            totalRequests: this.usageStats.requests,
            totalTokens: this.usageStats.tokens.total,
            recentActivity: this.usageStats.lastUsage ? new Date(this.usageStats.lastUsage).toISOString() : null,
            costEstimate: this.usageStats.costEstimate.toFixed(4),
            averageProcessingTime: this.usageStats.requests > 0
                ? (this.usageStats.processingTime / this.usageStats.requests).toFixed(2)
                : '0',
            topModels
        };
    }

    /**
     * 特定のモデルの使用統計を取得
     * @param modelId モデルID
     */
    public getModelUsage(modelId: string): Record<string, unknown> | null {
        const modelStats = this.usageStats.modelsUsed[modelId];
        if (!modelStats) return null;

        return {
            requests: modelStats.requests,
            tokens: modelStats.tokens,
            estimatedCost: modelStats.cost.toFixed(4),
            averageCostPerRequest: modelStats.requests > 0
                ? (modelStats.cost / modelStats.requests).toFixed(6)
                : '0',
            averageTokensPerRequest: modelStats.requests > 0
                ? Math.round(modelStats.tokens / modelStats.requests)
                : 0
        };
    }

    /**
     * 日付範囲での使用統計を取得
     * @param startDate 開始日
     * @param endDate 終了日
     */
    public getUsageByDateRange(startDate: Date, endDate: Date): Record<string, unknown> {
        // 注: 実際の実装では日付ごとの使用統計を保存する必要がある
        // このサンプルコードでは全体の統計から概算値を返す簡易実装

        // 現在の統計情報に基づいて日数に応じた比率で推定
        const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const estimationFactor = totalDays / 30; // 30日あたりの割合として計算

        return {
            period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
            estimatedRequests: Math.round(this.usageStats.requests * estimationFactor),
            estimatedTokens: Math.round(this.usageStats.tokens.total * estimationFactor),
            estimatedCost: (this.usageStats.costEstimate * estimationFactor).toFixed(4),
            note: '注: これは概算値です。正確な使用統計を取得するには、詳細なログ記録が必要です。'
        };
    }

    /**
     * 使用統計のリセット
     */
    public resetStats(): void {
        this.usageStats = {
            requests: 0,
            tokens: {
                input: 0,
                output: 0,
                total: 0
            },
            processingTime: 0,
            lastUsage: 0,
            costEstimate: 0,
            modelsUsed: {}
        };

        this.saveUsageStats();
        this.logger.info('AI使用統計をリセットしました');
    }

    /**
     * 詳細な使用統計データのエクスポート
     */
    public exportDetailedStats(): Record<string, unknown> {
        return {
            ...this.usageStats,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
}