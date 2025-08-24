/**
 * AI機能マネージャー
 * APIクライアントのAI機能を中央管理するコアクラス
 */
import { ApiLogger } from './logger/ApiLogger';
import { AIModelRegistry } from './models/AIModelRegistry';
import { AIUsageTracker } from './tracking/AIUsageTracker';
import { AIProcessorFactory } from './processors/AIProcessorFactory';
import { AICacheManager } from './cache/AICacheManager';
import { AISecurityManager } from './security/AISecurityManager';
import { AIConfigLoader } from './config/AIConfigLoader';
import {
  AIEnhancementType,
  AIFeatureOptions,
  AIEnhancementResult,
  AIProvider,
  AIProviderConfig,
  AIModel,
  AIFeatureStatus,
} from './types/AITypes';
import { generateUniqueId } from './utils/IdGenerator';

/**
 * AI機能マネージャークラス
 * シングルトンパターンでAI機能全体を統括
 */
export class AIFeatureManager {
  private static instance: AIFeatureManager | null = null;
  private logger = ApiLogger.getInstance();
  private initialized = false;
  private modelRegistry: AIModelRegistry;
  private usageTracker: AIUsageTracker;
  private processorFactory: AIProcessorFactory;
  private cacheManager: AICacheManager;
  private securityManager: AISecurityManager;
  private configLoader: AIConfigLoader;
  private defaultModel = 'gpt-4-turbo';
  private providerConfigs: Record<AIProvider, AIProviderConfig> = {
    openai: {},
    anthropic: {},
    google: {},
    huggingface: {},
    azure: {},
    stability: {},
    cohere: {},
    local: {},
  };

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): AIFeatureManager {
    if (!AIFeatureManager.instance) {
      AIFeatureManager.instance = new AIFeatureManager();
    }
    return AIFeatureManager.instance;
  }

  /**
   * コンストラクタ
   */
  private constructor() {
    this.logger.setContext('AIFeatureManager');
    this.modelRegistry = new AIModelRegistry();
    this.usageTracker = new AIUsageTracker();
    this.processorFactory = new AIProcessorFactory();
    this.cacheManager = new AICacheManager();
    this.securityManager = new AISecurityManager();
    this.configLoader = new AIConfigLoader(this.logger);
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.info('AI機能マネージャーの初期化を開始します');

    // 各コンポーネントを初期化
    this.initializeComponents();

    // プロバイダー設定の読み込み
    this.loadProviderConfigs();

    // デフォルトモデルの設定
    this.setupDefaultModel();

    this.initialized = true;
    this.logger.info('AI機能マネージャーが初期化されました');
  }

  /**
   * コンポーネントの初期化
   */
  private initializeComponents(): void {
    this.modelRegistry.initialize();
    this.usageTracker.initialize();
    this.cacheManager.initialize();
    this.securityManager.initialize();
  }

  /**
   * プロバイダー設定の読み込み
   */
  private loadProviderConfigs(): void {
    this.providerConfigs = this.configLoader.loadAllProviderConfigs();
  }

  /**
   * デフォルトモデルの設定
   */
  private setupDefaultModel(): void {
    // 環境変数からデフォルトモデルを設定
    if (typeof process !== 'undefined' && process.env) {
      const envDefaultModel = process.env.NEXT_PUBLIC_AI_DEFAULT_MODEL;
      if (envDefaultModel && this.modelRegistry.hasModel(envDefaultModel)) {
        this.defaultModel = envDefaultModel;
        this.logger.info(`デフォルトモデルを "${envDefaultModel}" に設定しました`);
      } else if (envDefaultModel) {
        this.logger.warn(
          `指定されたデフォルトモデル "${envDefaultModel}" が見つかりません。代わりに "${this.defaultModel}" を使用します。`
        );
      }
    }
  }

  /**
   * AIの状態を取得
   */
  public getStatus(): AIFeatureStatus {
    if (!this.initialized) {
      this.initialize();
    }

    // プロバイダーの利用可能状態を確認
    const providers = Object.entries(this.providerConfigs).reduce(
      (acc, [provider, config]) => {
        const provKey = provider as AIProvider;
        acc[provKey] = {
          available: !!config.apiKey,
          hasCustomEndpoint: !!config.baseUrl && provider !== 'openai' && provider !== 'anthropic',
        };
        return acc;
      },
      {} as Record<AIProvider, { available: boolean; hasCustomEndpoint: boolean }>
    );

    const usage = this.usageTracker.getUsageSummary();
    const cacheStatus = this.cacheManager.getStatus();
    const securityStatus = this.securityManager.getStatus();

    return {
      initialized: this.initialized,
      availableModels: this.modelRegistry.getModelSummaries(),
      defaultModel: this.defaultModel,
      providers,
      usage: {
        totalCalls: usage.totalCalls,
        totalTokens: usage.totalTokens,
        totalEstimatedCost: usage.totalEstimatedCost,
        averageResponseTime: usage.averageResponseTime,
        byProvider: usage.byProvider,
        byModel: usage.byModel,
      },
      cache: {
        enabled: cacheStatus.enabled,
        size: cacheStatus.size,
        hitRate: cacheStatus.hitRate,
      },
      security: {
        enabled: securityStatus.enabled,
        filtersActive: securityStatus.filtersActive,
        moderationEnabled: securityStatus.moderationEnabled,
      },
    };
  }

  /**
   * クエリをAIで強化
   */
  public async enhanceQuery(
    data: unknown,
    options: AIFeatureOptions
  ): Promise<AIEnhancementResult> {
    if (!this.initialized) {
      this.initialize();
    }

    const startTime = performance.now();
    const requestId = generateUniqueId();
    const enhancementType = options.enhancementType || 'query-optimization';

    this.logger.debug(`AI強化リクエスト(${enhancementType})開始: ${requestId}`);

    try {
      return await this.processEnhancementRequest(
        data,
        options,
        enhancementType,
        requestId,
        startTime
      );
    } catch (error) {
      return this.handleEnhancementError(
        error,
        data,
        enhancementType,
        options,
        requestId,
        startTime
      );
    }
  }

  /**
   * 強化リクエストの処理
   */
  private async processEnhancementRequest(
    data: unknown,
    options: AIFeatureOptions,
    enhancementType: AIEnhancementType,
    requestId: string,
    startTime: number
  ): Promise<AIEnhancementResult> {
    // セキュリティチェック
    await this.securityManager.validateRequest(data, options);

    // キャッシュチェック
    if (options.cache !== false) {
      const cachedResult = await this.cacheManager.get(data, enhancementType, options);
      if (cachedResult) {
        this.logger.debug(`キャッシュヒット: ${requestId}`);
        return {
          ...(cachedResult as AIEnhancementResult),
          cached: true,
        };
      }
    }

    // AIモデルの準備と処理
    const result = await this.processWithAI(data, options);

    // 処理時間の計算
    const duration = performance.now() - startTime;

    // 結果をキャッシュ（キャッシュが有効であれば）
    if (options.cache !== false) {
      await this.cacheManager.set(data, result.data, enhancementType, options);
    }

    // 使用統計を更新
    this.usageTracker.trackUsage(
      result.inputTokens,
      result.outputTokens,
      duration,
      this.modelRegistry.getModel(result.modelId)
    );

    // 結果の構築
    return {
      data: result.data,
      type: enhancementType,
      modelUsed: result.modelId,
      tokens: {
        input: result.inputTokens,
        output: result.outputTokens,
        total: result.inputTokens + result.outputTokens,
      },
      duration,
      timestamp: Date.now(),
    };
  }

  /**
   * 強化処理エラーのハンドリング
   */
  private handleEnhancementError(
    error: unknown,
    data: unknown,
    enhancementType: AIEnhancementType,
    options: AIFeatureOptions,
    requestId: string,
    startTime: number
  ): AIEnhancementResult {
    // エラーをログに記録
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`AI処理エラー(${requestId}): ${errorMessage}`);

    // 処理時間の計算
    const duration = performance.now() - startTime;

    // エラーレスポンスを返す
    return {
      data,
      type: enhancementType,
      modelUsed: options.model || this.defaultModel,
      tokens: { input: 0, output: 0, total: 0 },
      duration,
      timestamp: Date.now(),
      error: errorMessage,
    };
  }

  /**
   * AIで実際に処理を行うメソッド
   */
  private async processWithAI(
    data: unknown,
    options: AIFeatureOptions
  ): Promise<{
    data: unknown;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const modelId = options.model || this.defaultModel;
    const model = this.modelRegistry.getModel(modelId);

    if (!model) {
      throw new Error(`AIモデル "${modelId}" が見つかりません`);
    }

    const enhancementType = options.enhancementType || 'query-optimization';

    // モデルとタイプの互換性チェック
    const compatibleModel = this.validateModelCapabilities(model, enhancementType, options);

    // プロバイダー設定の取得
    const providerConfig = this.providerConfigs[compatibleModel.provider];

    // APIキーのチェック
    if (!providerConfig.apiKey && compatibleModel.provider !== 'local') {
      throw new Error(`${compatibleModel.provider} のAPIキーが設定されていません`);
    }

    // プロセッサーの取得と処理実行
    const processor = this.processorFactory.getProcessor(compatibleModel.provider);
    const result = await processor.process(
      data,
      compatibleModel,
      enhancementType,
      options,
      providerConfig
    );

    return {
      data: result.data,
      modelId: compatibleModel.id,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  }

  /**
   * モデルの機能チェックと調整
   */
  private validateModelCapabilities(
    model: AIModel,
    enhancementType: AIEnhancementType,
    options: AIFeatureOptions
  ): AIModel {
    // モデルがこの強化タイプをサポートしているか確認
    if (!model.capabilities.includes(enhancementType)) {
      this.logger.warn(
        `モデル "${model.id}" は "${enhancementType}" をサポートしていません。代替モデルを探します。`
      );

      // フォールバックモデルが指定されている場合はそれを使用
      if (options.fallbackModel) {
        const fallbackModel = this.modelRegistry.getModel(options.fallbackModel);
        if (fallbackModel && fallbackModel.capabilities.includes(enhancementType)) {
          this.logger.info(`フォールバックモデル "${options.fallbackModel}" を使用します`);
          return fallbackModel;
        }
      }

      // 互換性のある最適なモデルを自動選択
      const alternativeModel = this.modelRegistry.findBestModelForType(enhancementType);
      if (alternativeModel && alternativeModel.id !== model.id) {
        this.logger.info(
          `強化タイプ "${enhancementType}" に最適なモデル "${alternativeModel.id}" を自動選択しました`
        );
        return alternativeModel;
      }
    }

    return model;
  }

  /**
   * 特定のプロバイダー設定を更新
   */
  public updateProviderConfig(provider: AIProvider, config: Partial<AIProviderConfig>): void {
    if (!this.initialized) {
      this.initialize();
    }

    this.configLoader.updateProviderConfig(provider, config);
    this.providerConfigs = this.configLoader.getProviderConfigs();
  }

  /**
   * デフォルトモデルを変更
   */
  public setDefaultModel(modelId: string): boolean {
    if (!this.modelRegistry.hasModel(modelId)) {
      this.logger.warn(`モデル "${modelId}" が見つかりません。デフォルトモデルは変更されません。`);
      return false;
    }

    this.defaultModel = modelId;
    this.logger.info(`デフォルトモデルを "${modelId}" に変更しました`);
    return true;
  }
}

// エクスポート
export type { AIFeatureOptions, AIEnhancementType, AIEnhancementResult };
export default AIFeatureManager.getInstance();
