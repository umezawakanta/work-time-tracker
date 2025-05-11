/**
 * AI設定読み込み機能
 * 各AI-Providerの設定を環境変数から読み込む
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIProvider, AIProviderConfig } from '../types/AITypes';

/**
 * AI設定読み込みクラス
 */
export class AIConfigLoader {
    private logger: ApiLogger;
    private providerConfigs: Record<AIProvider, AIProviderConfig>;

    /**
     * コンストラクタ
     */
    constructor(logger: ApiLogger) {
        this.logger = logger;
        this.providerConfigs = {
            openai: {},
            anthropic: {},
            google: {},
            huggingface: {},
            azure: {},
            stability: {},
            cohere: {},
            local: {}
        };
    }

    /**
     * すべてのプロバイダー設定を読み込む
     */
    public loadAllProviderConfigs(): Record<AIProvider, AIProviderConfig> {
        // 環境変数からAPIキーを読み込む
        if (typeof process !== 'undefined' && process.env) {
            this.loadEnvironmentConfigs();
        } else {
            this.logger.warn('環境変数が利用できません');
        }

        // プロバイダー設定の検証
        this.validateProviderConfigs();

        return this.providerConfigs;
    }

    /**
     * 環境変数からプロバイダー設定を読み込む
     */
    private loadEnvironmentConfigs(): void {
        const env = process.env;

        if (!env) {
            this.logger.warn('環境変数が利用できません');
            return;
        }

        // 各プロバイダー設定を読み込み
        this.loadOpenAIConfig(env);
        this.loadAnthropicConfig(env);
        this.loadGoogleConfig(env);
        this.loadHuggingFaceConfig(env);
        this.loadAzureConfig(env);
        this.loadStabilityConfig(env);
        this.loadCohereConfig(env);
    }

    /**
     * OpenAI設定の読み込み
     */
    private loadOpenAIConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_OPENAI_API_KEY) {
            this.providerConfigs.openai = {
                apiKey: env.NEXT_PUBLIC_OPENAI_API_KEY,
                baseUrl: env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
                organization: env.NEXT_PUBLIC_OPENAI_ORG_ID,
                options: {}
            };
        }
    }

    /**
     * Anthropic設定の読み込み
     */
    private loadAnthropicConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
            this.providerConfigs.anthropic = {
                apiKey: env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
                baseUrl: env.NEXT_PUBLIC_ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
                options: {
                    version: env.NEXT_PUBLIC_ANTHROPIC_VERSION || '2023-06-01'
                }
            };
        }
    }

    /**
     * Google設定の読み込み
     */
    private loadGoogleConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
            this.providerConfigs.google = {
                apiKey: env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
                baseUrl: env.NEXT_PUBLIC_GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com',
                options: {
                    version: 'v1beta'
                }
            };
        }
    }

    /**
     * HuggingFace設定の読み込み
     */
    private loadHuggingFaceConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
            this.providerConfigs.huggingface = {
                apiKey: env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
                baseUrl: env.NEXT_PUBLIC_HUGGINGFACE_BASE_URL || 'https://api-inference.huggingface.co/models',
                options: {}
            };
        }
    }

    /**
     * Azure設定の読み込み
     */
    private loadAzureConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY) {
            this.providerConfigs.azure = {
                apiKey: env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY,
                baseUrl: env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
                options: {
                    deployment: env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT,
                    apiVersion: env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2023-05-15'
                }
            };
        }
    }

    /**
     * Stability設定の読み込み
     */
    private loadStabilityConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_STABILITY_API_KEY) {
            this.providerConfigs.stability = {
                apiKey: env.NEXT_PUBLIC_STABILITY_API_KEY,
                baseUrl: env.NEXT_PUBLIC_STABILITY_BASE_URL || 'https://api.stability.ai',
                options: {
                    version: 'v1'
                }
            };
        }
    }

    /**
     * Cohere設定の読み込み
     */
    private loadCohereConfig(env: NodeJS.ProcessEnv): void {
        if (env.NEXT_PUBLIC_COHERE_API_KEY) {
            this.providerConfigs.cohere = {
                apiKey: env.NEXT_PUBLIC_COHERE_API_KEY,
                baseUrl: env.NEXT_PUBLIC_COHERE_BASE_URL || 'https://api.cohere.ai',
                options: {
                    version: 'v1'
                }
            };
        }
    }

    /**
     * プロバイダー設定の検証
     */
    private validateProviderConfigs(): void {
        Object.entries(this.providerConfigs).forEach(([provider, config]) => {
            // APIキーが設定されているかチェック
            if (config.apiKey) {
                this.logger.debug(`${provider}プロバイダーが利用可能です`);
            } else {
                this.logger.debug(`${provider}プロバイダーは設定されていません`);
            }
        });
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

    /**
     * すべてのプロバイダー設定を取得
     */
    public getProviderConfigs(): Record<AIProvider, AIProviderConfig> {
        return this.providerConfigs;
    }
}