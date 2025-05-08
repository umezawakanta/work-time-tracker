/**
 * AI機能マネージャー
 * APIクライアントのAI機能を中央管理するコアクラス
 */
import { ApiLogger } from './ApiLogger';
import { AIModel, AIProvider, AIProviderConfig } from './AITypes';
import { AIModelRegistry } from './AIModelRegistry';
import { AIUsageTracker } from './AIUsageTracker';
import { AIProcessorFactory } from './AIProcessorFactory';
import {
    AIEnhancementType,
    AIFeatureOptions,
    AIEnhancementResult
} from './AITypes';

/**
 * AI機能マネージャークラス
 * シングルトンパターンでAI機能全体を統括
 */
export class AIFeatureManager {
    private static instance: AIFeatureManager | null = null;
    private logger = new ApiLogger();
    private initialized = false;
    private modelRegistry: AIModelRegistry;
    private usageTracker: AIUsageTracker;
    private processorFactory: AIProcessorFactory;
    private defaultModel = 'gpt-4-turbo';
    private providerConfigs: Record<AIProvider, AIProviderConfig> = {
        openai: {},
        anthropic: {},
        google: {},
        huggingface: {},
        azure: {},
        local: {}
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
    }

    /**
     * 初期化
     */
    public initialize(): void {
        if (this.initialized) return;

        // 各コンポーネントを初期化
        this.modelRegistry.initialize();
        this.usageTracker.initialize();

        // プロバイダー設定の読み込み
        this.loadProviderConfigs();

        // デフォルトモデルの設定
        this.setupDefaultModel();

        this.initialized = true;
        this.logger.info('AI機能マネージャーが初期化されました');
    }

    /**
     * デフォルトモデルの設定
     */
    private setupDefaultModel(): void {
        // 環境変数からデフォルトモデルを設定
        const envDefaultModel = process.env.NEXT_PUBLIC_AI_DEFAULT_MODEL;
        if (envDefaultModel) {
            // 指定されたモデルが存在するか確認
            const modelExists = this.modelRegistry.hasModel(envDefaultModel);

            if (modelExists) {
                this.defaultModel = envDefaultModel;
            } else {
                this.logger.warn(`指定されたデフォルトモデル "${envDefaultModel}" が見つかりません。代わりに "${this.defaultModel}" を使用します。`);
            }
        }
    }

    /**
     * プロバイダー設定の読み込み
     */
    private loadProviderConfigs(): void {
        // 環境変数からAPIキーを読み込む
        if (typeof process !== 'undefined' && process.env) {
            // OpenAI
            if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
                this.providerConfigs.openai.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
                this.providerConfigs.openai.baseUrl = process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1';
                this.providerConfigs.openai.organization = process.env.NEXT_PUBLIC_OPENAI_ORG_ID;
            }

            // Anthropic
            if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
                this.providerConfigs.anthropic.apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
                this.providerConfigs.anthropic.baseUrl = process.env.NEXT_PUBLIC_ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
            }

            // Google
            if (process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
                this.providerConfigs.google.apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
                this.providerConfigs.google.baseUrl = process.env.NEXT_PUBLIC_GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com';
            }

            // HuggingFace
            if (process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
                this.providerConfigs.huggingface.apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
                this.providerConfigs.huggingface.baseUrl = process.env.NEXT_PUBLIC_HUGGINGFACE_BASE_URL || 'https://api-inference.huggingface.co/models';
            }

            // Azure
            if (process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY) {
                this.providerConfigs.azure.apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
                this.providerConfigs.azure.baseUrl = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
                this.providerConfigs.azure.options = {
                    deployment: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT,
                    apiVersion: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2023-05-15'
                };
            }
        }
    }

    /**
     * AIの状態を取得
     */
    public getStatus(): Record<string, unknown> {
        // プロバイダーの利用可能状態を確認
        const providers = Object.entries(this.providerConfigs).reduce((acc, [provider, config]) => {
            acc[provider] = {
                available: !!config.apiKey,
                hasCustomEndpoint: !!config.baseUrl && provider !== 'openai' && provider !== 'anthropic'
            };
            return acc;
        }, {} as Record<string, unknown>);

        return {
            initialized: this.initialized,
            availableModels: this.modelRegistry.getModelSummaries(),
            defaultModel: this.defaultModel,
            providers,
            usage: this.usageTracker.getUsageSummary()
        };
    }

    /**
     * クエリをAIで強化
     * @param data 元のクエリデータ
     * @param options AI機能オプション
     */
    public async enhanceQuery(
        data: unknown,
        options: AIFeatureOptions
    ): Promise<AIEnhancementResult> {
        const startTime = performance.now();

        // 使用するモデルを決定
        const modelId = options.model || this.defaultModel;
        const model = this.modelRegistry.getModel(modelId);

        if (!model) {
            throw new Error(`AIモデル "${modelId}" が見つかりません`);
        }

        // 強化タイプの決定
        const enhancementType = options.enhancementType || 'query-optimization';

        // モデルがこの強化タイプをサポートしているか確認
        if (!model.capabilities.includes(enhancementType)) {
            this.logger.warn(`モデル "${model.id}" は "${enhancementType}" をサポートしていません。基本的な処理のみを行います。`);
        }

        // プロバイダー設定の取得
        const providerConfig = this.providerConfigs[model.provider];

        // APIキーが設定されているか確認
        if (!providerConfig.apiKey && model.provider !== 'local') {
            throw new Error(`${model.provider} のAPIキーが設定されていません`);
        }

        // プロセッサーの取得
        const processor = this.processorFactory.getProcessor(model.provider);

        // 処理の実行
        let result: { data: unknown; inputTokens: number; outputTokens: number };

        try {
            // プロセッサーでデータを処理
            result = await processor.process(
                data,
                model,
                enhancementType,
                options,
                providerConfig
            );
        } catch (processingError) {
            // エラーをログに記録
            this.logger.error(`AI処理中にエラーが発生しました: ${processingError instanceof Error ? processingError.message : String(processingError)}`);

            // エラー時は元のデータをそのまま返す
            result = {
                data,
                inputTokens: 0,
                outputTokens: 0
            };
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // 使用統計を更新
        this.usageTracker.trackUsage(result.inputTokens, result.outputTokens, duration, model);

        // 結果を返す
        return {
            data: result.data,
            type: enhancementType,
            modelUsed: model.id,
            tokens: {
                input: result.inputTokens,
                output: result.outputTokens,
                total: result.inputTokens + result.outputTokens
            },
            duration,
            timestamp: Date.now()
        };
    }

    /**
     * 特定のプロバイダー設定を更新
     */
    public updateProviderConfig(
        provider: AIProvider,
        config: Partial<AIProviderConfig>
    ): void {
        this.providerConfigs[provider] = {
            ...this.providerConfigs[provider],
            ...config
        };

        this.logger.info(`${provider} プロバイダー設定を更新しました`);
    }
}

// エクスポート
export type { AIFeatureOptions, AIEnhancementType, AIEnhancementResult };
export default AIFeatureManager.getInstance();