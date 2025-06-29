/**
 * AIプロセッサーファクトリー
 * 各プロバイダー向けのプロセッサーを作成・管理
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIProvider, AIProcessor } from '../types/AITypes';
import { BaseAIProcessor } from './BaseAIProcessor';

// プロセッサーのインポート
// 実際の実装では、これらのクラスを別ファイルで実装する必要があります
import { OpenAIProcessor } from './OpenAIProcessor';
import { AnthropicProcessor } from './AnthropicProcessor';
import { GoogleAIProcessor } from './GoogleAIProcessor';
import { HuggingFaceProcessor } from './HuggingFaceProcessor';
import { AzureAIProcessor } from './AzureAIProcessor';
import { StabilityAIProcessor } from './StabilityAIProcessor';
import { CohereProcessor } from './CohereProcessor';
import { LocalAIProcessor } from './LocalAIProcessor';

/**
 * AIプロセッサーファクトリークラス
 */
export class AIProcessorFactory {
  private logger = ApiLogger.getInstance();
  private processors: Map<AIProvider, AIProcessor> = new Map();

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger.setContext('AIProcessorFactory');

    // 各プロバイダーのプロセッサーを登録
    this.registerDefaultProcessors();
  }

  /**
   * デフォルトプロセッサーを登録
   */
  private registerDefaultProcessors(): void {
    this.registerProcessor('openai', new OpenAIProcessor());
    this.registerProcessor('anthropic', new AnthropicProcessor());
    this.registerProcessor('google', new GoogleAIProcessor());
    this.registerProcessor('huggingface', new HuggingFaceProcessor());
    this.registerProcessor('azure', new AzureAIProcessor());
    this.registerProcessor('stability', new StabilityAIProcessor());
    this.registerProcessor('cohere', new CohereProcessor());
    this.registerProcessor('local', new LocalAIProcessor());
  }

  /**
   * プロセッサーを登録
   */
  public registerProcessor(provider: AIProvider, processor: AIProcessor): void {
    this.processors.set(provider, processor);
    this.logger.debug(`${provider}プロバイダーのプロセッサーを登録しました`);
  }

  /**
   * プロセッサーを取得
   */
  public getProcessor(provider: AIProvider): AIProcessor {
    const processor = this.processors.get(provider);
    if (!processor) {
      throw new Error(`${provider}プロバイダーのプロセッサーが見つかりません`);
    }

    return processor;
  }

  /**
   * すべてのプロセッサーを取得
   */
  public getAllProcessors(): Map<AIProvider, AIProcessor> {
    return new Map(this.processors);
  }

  /**
   * プロセッサーの存在をチェック
   */
  public hasProcessor(provider: AIProvider): boolean {
    return this.processors.has(provider);
  }
}
