/**
 * AIプロセッサーファクトリ
 * 各AIプロバイダー向けの処理クラスを提供するファクトリ
 */
import { ApiLogger } from './ApiLogger';
import { AIProcessor, AIProvider } from './AITypes';
import { OpenAIProcessor } from './processors/OpenAIProcessor';
import { AnthropicProcessor } from './processors/AnthropicProcessor';
import { GoogleAIProcessor } from './processors/GoogleAIProcessor';
import { HuggingFaceProcessor } from './processors/HuggingFaceProcessor';
import { AzureAIProcessor } from './processors/AzureAIProcessor';
import { LocalAIProcessor } from './processors/LocalAIProcessor';

/**
 * AIプロセッサーファクトリクラス
 */
export class AIProcessorFactory {
    private logger = new ApiLogger();
    private processors: Map<AIProvider, AIProcessor> = new Map();

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger.setContext('AIProcessorFactory');
        this.initializeProcessors();
    }

    /**
     * 各プロバイダーのプロセッサーを初期化
     */
    private initializeProcessors(): void {
        // デフォルトプロセッサーを登録
        this.processors.set('openai', new OpenAIProcessor());
        this.processors.set('anthropic', new AnthropicProcessor());
        this.processors.set('google', new GoogleAIProcessor());
        this.processors.set('huggingface', new HuggingFaceProcessor());
        this.processors.set('azure', new AzureAIProcessor());
        this.processors.set('local', new LocalAIProcessor());

        this.logger.debug('AIプロセッサーが初期化されました');
    }

    /**
     * 指定されたプロバイダーのプロセッサーを取得
     * @param provider AIプロバイダー
     */
    public getProcessor(provider: AIProvider): AIProcessor {
        const processor = this.processors.get(provider);

        if (!processor) {
            this.logger.error(`プロバイダー "${provider}" のプロセッサーが見つかりません`);
            throw new Error(`未対応のAIプロバイダー: ${provider}`);
        }

        return processor;
    }

    /**
     * カスタムプロセッサーを登録
     * @param provider AIプロバイダー
     * @param processor AIプロセッサー
     */
    public registerProcessor(provider: AIProvider, processor: AIProcessor): void {
        this.processors.set(provider, processor);
        this.logger.info(`プロバイダー "${provider}" のカスタムプロセッサーを登録しました`);
    }

    /**
     * 登録されているプロバイダーの一覧を取得
     */
    public getRegisteredProviders(): AIProvider[] {
        return Array.from(this.processors.keys());
    }
}