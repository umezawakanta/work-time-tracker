/**
 * AIモデルレジストリ
 * 利用可能なAIモデルを管理
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIModel, AIEnhancementType, AIModelSummary, AIProvider } from '../types/AITypes';

/**
 * AIモデルレジストリクラス
 */
export class AIModelRegistry {
  private logger = ApiLogger.getInstance();
  private models = new Map<string, AIModel>();
  private initialized = false;

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger.setContext('AIModelRegistry');
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.info('AIモデルレジストリを初期化しています');

    // デフォルトモデルを登録
    this.registerDefaultModels();

    // カスタムモデルをロード
    this.loadCustomModels();

    this.initialized = true;
    this.logger.info(
      `モデルレジストリを初期化しました: ${this.models.size}モデルが登録されています`
    );
  }

  /**
   * デフォルトモデルを登録
   */
  private registerDefaultModels(): void {
    // OpenAIモデル
    this.registerModel({
      id: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      provider: 'openai',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'data-analysis',
        'question-answering',
      ],
      maxTokens: 4096,
      contextWindow: 128000,
      inputCostPer1kTokens: 0.01,
      outputCostPer1kTokens: 0.03,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    this.registerModel({
      id: 'gpt-4',
      displayName: 'GPT-4',
      provider: 'openai',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'data-analysis',
        'question-answering',
      ],
      maxTokens: 8192,
      contextWindow: 8192,
      inputCostPer1kTokens: 0.03,
      outputCostPer1kTokens: 0.06,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    this.registerModel({
      id: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      provider: 'openai',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'question-answering',
      ],
      maxTokens: 4096,
      contextWindow: 16385,
      inputCostPer1kTokens: 0.0015,
      outputCostPer1kTokens: 0.002,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    // Anthropicモデル
    this.registerModel({
      id: 'claude-3-opus',
      displayName: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'data-analysis',
        'question-answering',
      ],
      maxTokens: 4096,
      contextWindow: 200000,
      inputCostPer1kTokens: 0.015,
      outputCostPer1kTokens: 0.075,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    this.registerModel({
      id: 'claude-3-sonnet',
      displayName: 'Claude 3 Sonnet',
      provider: 'anthropic',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'question-answering',
      ],
      maxTokens: 4096,
      contextWindow: 200000,
      inputCostPer1kTokens: 0.003,
      outputCostPer1kTokens: 0.015,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    this.registerModel({
      id: 'claude-3-haiku',
      displayName: 'Claude 3 Haiku',
      provider: 'anthropic',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'question-answering',
      ],
      maxTokens: 4096,
      contextWindow: 200000,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.00125,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    // Google Geminiモデル
    this.registerModel({
      id: 'gemini-pro',
      displayName: 'Gemini Pro',
      provider: 'google',
      capabilities: [
        'chat-completion',
        'query-optimization',
        'content-generation',
        'text-summarization',
        'sentiment-analysis',
        'entity-extraction',
        'translation',
        'text-classification',
        'code-generation',
        'code-explanation',
        'question-answering',
      ],
      maxTokens: 8192,
      contextWindow: 32768,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.0005,
      supportsStreaming: true,
      defaultTemperature: 0.7,
      supportedLanguages: ['*'],
      metadata: {},
    });

    // 画像生成モデル
    this.registerModel({
      id: 'dall-e-3',
      displayName: 'DALL-E 3',
      provider: 'openai',
      capabilities: ['image-generation'],
      maxTokens: 0,
      contextWindow: 0,
      inputCostPer1kTokens: 0,
      outputCostPer1kTokens: 0,
      supportsStreaming: false,
      defaultTemperature: 0,
      supportedLanguages: ['*'],
      metadata: {
        costPerImage: {
          '1024x1024': 0.04,
          '1792x1024': 0.08,
          '1024x1792': 0.08,
        },
      },
    });

    // 埋め込みモデル
    this.registerModel({
      id: 'text-embedding-ada-002',
      displayName: 'Text Embedding Ada 002',
      provider: 'openai',
      capabilities: ['vector-embedding'],
      maxTokens: 8191,
      contextWindow: 8191,
      inputCostPer1kTokens: 0.0001,
      outputCostPer1kTokens: 0,
      supportsStreaming: false,
      defaultTemperature: 0,
      supportedLanguages: ['*'],
      metadata: {
        dimensions: 1536,
      },
    });
  }

  /**
   * カスタムモデルをロード
   */
  private loadCustomModels(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const customModelsJson = localStorage.getItem('ai-custom-models');
        if (customModelsJson) {
          const customModels = JSON.parse(customModelsJson) as AIModel[];
          customModels.forEach((model) => {
            this.registerModel(model);
          });
          this.logger.info(`${customModels.length}件のカスタムモデルを読み込みました`);
        }
      }
    } catch (error) {
      this.logger.error('カスタムモデルの読み込みに失敗しました', error);
    }
  }

  /**
   * カスタムモデルを保存
   */
  private saveCustomModels(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const customModels = Array.from(this.models.values()).filter(
          (model) => model.metadata.custom === true
        );

        if (customModels.length > 0) {
          localStorage.setItem('ai-custom-models', JSON.stringify(customModels));
          this.logger.debug(`${customModels.length}件のカスタムモデルを保存しました`);
        }
      }
    } catch (error) {
      this.logger.error('カスタムモデルの保存に失敗しました', error);
    }
  }

  /**
   * モデルを登録
   */
  public registerModel(model: AIModel): void {
    this.models.set(model.id, model);
    this.logger.debug(`モデル "${model.id}" を登録しました`);

    // カスタムモデルの場合は保存
    if (model.metadata.custom === true) {
      this.saveCustomModels();
    }
  }

  /**
   * モデルを取得
   */
  public getModel(modelId: string): AIModel {
    if (!this.initialized) {
      this.initialize();
    }

    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`モデル "${modelId}" が見つかりません`);
    }

    return model;
  }

  /**
   * モデルの存在をチェック
   */
  public hasModel(modelId: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    return this.models.has(modelId);
  }

  /**
   * すべてのモデルを取得
   */
  public getAllModels(): AIModel[] {
    if (!this.initialized) {
      this.initialize();
    }

    return Array.from(this.models.values());
  }

  /**
   * モデルサマリーを取得
   */
  public getModelSummaries(): AIModelSummary[] {
    if (!this.initialized) {
      this.initialize();
    }

    return Array.from(this.models.values()).map((model) => ({
      id: model.id,
      displayName: model.displayName,
      provider: model.provider,
      capabilities: model.capabilities,
      maxTokens: model.maxTokens,
      contextWindow: model.contextWindow,
      supportsStreaming: model.supportsStreaming,
    }));
  }

  /**
   * プロバイダー別にモデルを取得
   */
  public getModelsByProvider(provider: AIProvider): AIModel[] {
    if (!this.initialized) {
      this.initialize();
    }

    return Array.from(this.models.values()).filter((model) => model.provider === provider);
  }

  /**
   * 特定の強化タイプに対応したモデルを取得
   */
  public getModelsByCapability(capability: AIEnhancementType): AIModel[] {
    if (!this.initialized) {
      this.initialize();
    }

    return Array.from(this.models.values()).filter((model) =>
      model.capabilities.includes(capability)
    );
  }

  /**
   * 特定の強化タイプに最適なモデルを検索
   */
  public findBestModelForType(enhancementType: AIEnhancementType): AIModel | null {
    if (!this.initialized) {
      this.initialize();
    }

    // 該当する強化タイプに対応したモデルをフィルタリング
    const compatibleModels = this.getModelsByCapability(enhancementType);

    if (compatibleModels.length === 0) {
      return null;
    }

    // モデルをソート（コンテキストウィンドウサイズの大きい順）
    compatibleModels.sort((a, b) => b.contextWindow - a.contextWindow);

    return compatibleModels[0];
  }

  /**
   * モデルを削除
   */
  public removeModel(modelId: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    // カスタムモデルのみ削除可能
    const model = this.models.get(modelId);
    if (!model || model.metadata.custom !== true) {
      return false;
    }

    const result = this.models.delete(modelId);

    // 削除に成功した場合は保存
    if (result) {
      this.saveCustomModels();
    }

    return result;
  }
}
