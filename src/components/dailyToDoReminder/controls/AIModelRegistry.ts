/**
 * AIモデルレジストリ
 * 利用可能なAIモデルを管理するクラス
 */
import { ApiLogger } from './ApiLogger';
import { AIModel, AIModelSummary } from './AITypes';

/**
 * AIモデルレジストリクラス
 */
export class AIModelRegistry {
    private logger = new ApiLogger();
    private models: AIModel[] = [];

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
        // 基本モデルの登録
        this.registerDefaultModels();
        this.logger.info(`${this.models.length}個のAIモデルが登録されました`);
    }

    /**
     * デフォルトのAIモデルを登録
     */
    private registerDefaultModels(): void {
        this.models = [
            // OpenAIモデル
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                version: '0613',
                contextWindow: 128000,
                maxTokens: 4096,
                provider: 'openai',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization',
                    'anomaly-detection',
                    'semantic-search',
                    'trend-analysis',
                    'smart-chunking',
                    'entity-extraction',
                    'summarization',
                    'sentiment-analysis',
                    'translation',
                    'code-generation'
                ],
                tokenCost: {
                    input: 0.00001,
                    output: 0.00003
                },
                priority: 10,
                multimodal: true
            },
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
                version: '2024-05',
                contextWindow: 128000,
                maxTokens: 4096,
                provider: 'openai',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization',
                    'anomaly-detection',
                    'semantic-search',
                    'trend-analysis',
                    'smart-chunking',
                    'entity-extraction',
                    'summarization',
                    'sentiment-analysis',
                    'translation',
                    'code-generation'
                ],
                tokenCost: {
                    input: 0.00001,
                    output: 0.00003
                },
                priority: 12,
                multimodal: true
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                version: '0613',
                contextWindow: 16385,
                maxTokens: 4096,
                provider: 'openai',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization',
                    'semantic-search',
                    'summarization',
                    'sentiment-analysis',
                    'translation',
                    'code-generation'
                ],
                tokenCost: {
                    input: 0.000001,
                    output: 0.000002
                },
                priority: 6
            },

            // Anthropicモデル
            {
                id: 'claude-3-opus',
                name: 'Claude 3 Opus',
                version: '1.0',
                contextWindow: 200000,
                maxTokens: 4096,
                provider: 'anthropic',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization',
                    'anomaly-detection',
                    'semantic-search',
                    'trend-analysis',
                    'smart-chunking',
                    'entity-extraction',
                    'summarization'
                ],
                tokenCost: {
                    input: 0.00001,
                    output: 0.00003
                },
                priority: 11,
                multimodal: true
            },
            {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                version: '1.0',
                contextWindow: 200000,
                maxTokens: 4096,
                provider: 'anthropic',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization',
                    'semantic-search',
                    'summarization'
                ],
                tokenCost: {
                    input: 0.000003,
                    output: 0.000015
                },
                priority: 9,
                multimodal: true
            },
            {
                id: 'claude-3-haiku',
                name: 'Claude 3 Haiku',
                version: '1.0',
                contextWindow: 200000,
                maxTokens: 4096,
                provider: 'anthropic',
                capabilities: [
                    'query-optimization',
                    'data-enrichment',
                    'content-generation',
                    'personalization'
                ],
                tokenCost: {
                    input: 0.000008,
                    output: 0.000024
                },
                priority: 8,
                multimodal: true
            },

            // Googleモデル
            {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                version: '1.0',
                contextWindow: 32000,
                maxTokens: 2048,
                provider: 'google',
                capabilities: [
                    'query-optimization',
                    'content-generation',
                    'trend-analysis',
                    'sentiment-analysis',
                    'translation'
                ],
                tokenCost: {
                    input: 0.000005,
                    output: 0.000015
                },
                priority: 7,
                multimodal: false
            },
            {
                id: 'gemini-pro-vision',
                name: 'Gemini Pro Vision',
                version: '1.0',
                contextWindow: 32000,
                maxTokens: 2048,
                provider: 'google',
                capabilities: [
                    'content-generation',
                    'entity-extraction'
                ],
                tokenCost: {
                    input: 0.000006,
                    output: 0.000018
                },
                priority: 7,
                multimodal: true
            },

            // ローカルモデル
            {
                id: 'local-embedding',
                name: 'Local Embedding Model',
                version: '1.0',
                contextWindow: 8192,
                maxTokens: 0,
                provider: 'local',
                capabilities: [
                    'semantic-search'
                ],
                tokenCost: {
                    input: 0,
                    output: 0
                },
                priority: 5
            }
        ];

        // カスタムモデルの読み込み（環境変数など）
        this.loadCustomModels();
    }

    /**
     * カスタムモデルの読み込み
     */
    private loadCustomModels(): void {
        // カスタムモデル設定があれば読み込む
        if (typeof process !== 'undefined' && process.env) {
            try {
                const customModelsJson = process.env.NEXT_PUBLIC_CUSTOM_AI_MODELS;
                if (customModelsJson) {
                    const customModels = JSON.parse(customModelsJson) as AIModel[];
                    customModels.forEach(model => {
                        // 既存モデルのオーバーライドまたは追加
                        const existingIndex = this.models.findIndex(m => m.id === model.id);
                        if (existingIndex >= 0) {
                            this.models[existingIndex] = { ...this.models[existingIndex], ...model };
                            this.logger.info(`カスタムモデル設定でモデル ${model.id} を更新しました`);
                        } else {
                            this.models.push(model);
                            this.logger.info(`カスタムモデル ${model.id} を追加しました`);
                        }
                    });
                }
            } catch (error) {
                this.logger.error('カスタムモデル設定の読み込みに失敗しました', error);
            }
        }
    }

    /**
     * 指定されたIDのモデルを取得
     * @param modelId モデルID
     */
    public getModel(modelId: string): AIModel | undefined {
        return this.models.find(model => model.id === modelId);
    }

    /**
     * モデルの存在チェック
     * @param modelId モデルID
     */
    public hasModel(modelId: string): boolean {
        return this.models.some(model => model.id === modelId);
    }

    /**
     * プロバイダーに基づいてモデルを取得
     * @param provider AIプロバイダー
     */
    public getModelsByProvider(provider: string): AIModel[] {
        return this.models.filter(model => model.provider === provider);
    }

    /**
     * 指定された強化タイプをサポートするモデルを取得
     * @param enhancementType 強化タイプ
     */
    public getModelsByCapability(enhancementType: string): AIModel[] {
        return this.models.filter(model =>
            model.capabilities.includes(enhancementType as any)
        );
    }

    /**
     * 優先度が最も高いモデルを取得
     * @param enhancementType 強化タイプ（オプション）
     */
    public getHighestPriorityModel(enhancementType?: string): AIModel | undefined {
        let candidates = this.models;

        // 特定の強化タイプをサポートするモデルに限定
        if (enhancementType) {
            candidates = this.getModelsByCapability(enhancementType);
        }

        // 優先度順にソート
        return candidates.sort((a, b) => b.priority - a.priority)[0];
    }

    /**
     * 外部表示用のモデル要約情報を取得
     */
    public getModelSummaries(): AIModelSummary[] {
        return this.models.map(model => ({
            id: model.id,
            name: model.name,
            provider: model.provider,
            capabilities: model.capabilities,
            multimodal: model.multimodal,
            requiresSubscription: model.requiresSubscription
        }));
    }

    /**
     * 新しいモデルを登録
     * @param model AIモデル情報
     */
    public registerModel(model: AIModel): void {
        // 既存モデルのチェック
        const existingIndex = this.models.findIndex(m => m.id === model.id);

        if (existingIndex >= 0) {
            // 既存のモデルを更新
            this.models[existingIndex] = model;
            this.logger.info(`モデル ${model.id} を更新しました`);
        } else {
            // 新しいモデルを追加
            this.models.push(model);
            this.logger.info(`新しいモデル ${model.id} を登録しました`);
        }
    }

    /**
     * モデルの登録を解除
     * @param modelId モデルID
     */
    public unregisterModel(modelId: string): boolean {
        const initialLength = this.models.length;
        this.models = this.models.filter(model => model.id !== modelId);

        const removed = initialLength > this.models.length;
        if (removed) {
            this.logger.info(`モデル ${modelId} の登録を解除しました`);
        }

        return removed;
    }

    /**
     * すべてのモデルを取得
     */
    public getAllModels(): AIModel[] {
        return [...this.models];
    }
}