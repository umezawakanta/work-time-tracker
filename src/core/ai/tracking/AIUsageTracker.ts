/**
 * AI使用状況追跡システム
 * AI機能の使用量とコストを追跡するコンポーネント
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIModel } from '../types/AITypes';

/**
 * 使用状況の記録エントリインターフェース
 */
interface UsageRecord {
  timestamp: number;
  modelId: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  duration: number;
}

/**
 * プロバイダーごとの使用状況サマリインターフェース
 */
interface ProviderUsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  averageResponseTime: number;
}

/**
 * 使用状況サマリインターフェース
 */
interface UsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCost: number;
  averageResponseTime: number;
  byProvider: Record<string, ProviderUsageSummary>;
  byModel: Record<string, ProviderUsageSummary>;
  recentUsage: UsageRecord[];
}

/**
 * AI使用状況追跡クラス
 */
export class AIUsageTracker {
  private logger = ApiLogger.getInstance();
  private usageRecords: UsageRecord[] = [];
  private initialized = false;
  private maxStoredRecords = 1000;
  private tokenCostRates: Record<string, { input: number; output: number }> = {};

  /**
   * 初期化メソッド
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.setContext('AIUsageTracker');
    this.logger.info('AI使用状況トラッカーを初期化しています');

    // デフォルトのトークン料金レートを設定
    this.setupDefaultTokenRates();

    // 永続化されたデータがあれば読み込む
    this.loadPersistedData();

    this.initialized = true;
    this.logger.info('AI使用状況トラッカーが初期化されました');
  }

  /**
   * デフォルトのトークン料金レートを設定
   */
  private setupDefaultTokenRates(): void {
    // 各モデルのデフォルト料金レート（USD/1Kトークン）
    this.tokenCostRates = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-2': { input: 0.008, output: 0.024 },
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'gemini-ultra': { input: 0.00175, output: 0.00575 },
      'mistral-large': { input: 0.008, output: 0.024 },
      'mistral-medium': { input: 0.002, output: 0.006 },
      'mistral-small': { input: 0.0002, output: 0.0006 },
      'llama-3-70b': { input: 0.0007, output: 0.0014 },
      'llama-3-8b': { input: 0.0002, output: 0.0004 },
      // その他のモデルを必要に応じて追加
    };
  }

  /**
   * 永続化されたデータを読み込む
   */
  private loadPersistedData(): void {
    try {
      // ローカルストレージから使用状況データを読み込む
      if (typeof localStorage !== 'undefined') {
        const savedData = localStorage.getItem('ai-usage-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData) as { records: UsageRecord[] };
          this.usageRecords = parsedData.records;
          this.logger.debug(`${this.usageRecords.length}件の使用履歴を読み込みました`);
        }
      }
    } catch (error) {
      this.logger.error('使用状況データの読み込みに失敗しました', error);
    }
  }

  /**
   * 使用状況データを永続化する
   */
  private persistData(): void {
    try {
      // ローカルストレージに使用状況データを保存する
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'ai-usage-data',
          JSON.stringify({
            records: this.usageRecords.slice(-this.maxStoredRecords), // 最大件数までに制限
          })
        );
      }
    } catch (error) {
      this.logger.error('使用状況データの保存に失敗しました', error);
    }
  }

  /**
   * 使用状況を記録
   */
  public trackUsage(
    inputTokens: number,
    outputTokens: number,
    duration: number,
    model: AIModel
  ): void {
    if (!this.initialized) {
      this.initialize();
    }

    // トークン料金レートを取得
    const costRates = this.tokenCostRates[model.id] || { input: 0.0001, output: 0.0002 };

    // 総トークン数計算
    const totalTokens = inputTokens + outputTokens;

    // コスト計算（1Kトークンあたりの料金）
    const inputCost = (inputTokens / 1000) * costRates.input;
    const outputCost = (outputTokens / 1000) * costRates.output;
    const estimatedCost = inputCost + outputCost;

    // 使用記録を作成
    const record: UsageRecord = {
      timestamp: Date.now(),
      modelId: model.id,
      provider: model.provider,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      duration,
    };

    // 記録を追加
    this.usageRecords.push(record);

    // 最大記録数を超えた場合、古いものから削除
    if (this.usageRecords.length > this.maxStoredRecords) {
      this.usageRecords.shift();
    }

    // データを永続化
    this.persistData();

    this.logger.debug(
      `使用状況を記録しました: ${model.id}, ${totalTokens}トークン, $${estimatedCost.toFixed(6)}`
    );
  }

  /**
   * 使用状況サマリを取得
   */
  public getUsageSummary(): UsageSummary {
    if (!this.initialized) {
      this.initialize();
    }

    // 集計用の初期値
    const summary: UsageSummary = {
      totalCalls: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalEstimatedCost: 0,
      averageResponseTime: 0,
      byProvider: {},
      byModel: {},
      recentUsage: [],
    };

    // データがない場合は空のサマリを返す
    if (this.usageRecords.length === 0) {
      return summary;
    }

    let totalDuration = 0;

    // 各記録を処理
    this.usageRecords.forEach((record) => {
      summary.totalCalls += 1;
      summary.totalTokens += record.totalTokens;
      summary.totalInputTokens += record.inputTokens;
      summary.totalOutputTokens += record.outputTokens;
      summary.totalEstimatedCost += record.estimatedCost;
      totalDuration += record.duration;

      // プロバイダー別集計
      if (!summary.byProvider[record.provider]) {
        summary.byProvider[record.provider] = this.createEmptyProviderSummary();
      }
      this.updateProviderSummary(summary.byProvider[record.provider], record);

      // モデル別集計
      if (!summary.byModel[record.modelId]) {
        summary.byModel[record.modelId] = this.createEmptyProviderSummary();
      }
      this.updateProviderSummary(summary.byModel[record.modelId], record);
    });

    // 平均応答時間を計算
    summary.averageResponseTime = totalDuration / summary.totalCalls;

    // 最近の使用履歴（最新100件）
    summary.recentUsage = this.usageRecords.slice(-100);

    return summary;
  }

  /**
   * 空のプロバイダーサマリを作成
   */
  private createEmptyProviderSummary(): ProviderUsageSummary {
    return {
      totalCalls: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      estimatedCost: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * プロバイダーサマリを更新
   */
  private updateProviderSummary(summary: ProviderUsageSummary, record: UsageRecord): void {
    summary.totalCalls += 1;
    summary.totalTokens += record.totalTokens;
    summary.totalInputTokens += record.inputTokens;
    summary.totalOutputTokens += record.outputTokens;
    summary.estimatedCost += record.estimatedCost;

    // 応答時間の平均値を更新（移動平均）
    if (summary.averageResponseTime === 0) {
      summary.averageResponseTime = record.duration;
    } else {
      summary.averageResponseTime =
        (summary.averageResponseTime * (summary.totalCalls - 1) + record.duration) /
        summary.totalCalls;
    }
  }

  /**
   * 特定期間の使用状況を取得
   */
  public getUsageForPeriod(startTime: number, endTime: number): UsageRecord[] {
    if (!this.initialized) {
      this.initialize();
    }

    return this.usageRecords.filter(
      (record) => record.timestamp >= startTime && record.timestamp <= endTime
    );
  }

  /**
   * トークン料金レートを更新
   */
  public updateTokenCostRate(modelId: string, inputRate: number, outputRate: number): void {
    if (!this.initialized) {
      this.initialize();
    }

    this.tokenCostRates[modelId] = {
      input: inputRate,
      output: outputRate,
    };

    this.logger.info(`モデル ${modelId} のトークン料金レートを更新しました`);
  }

  /**
   * 使用記録をクリア
   */
  public clearUsageRecords(): void {
    this.usageRecords = [];
    this.persistData();
    this.logger.info('使用状況記録をクリアしました');
  }
}
