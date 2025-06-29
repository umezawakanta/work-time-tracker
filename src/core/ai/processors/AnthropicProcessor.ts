import { BaseAIProcessor } from './BaseAIProcessor';

export class AnthropicProcessor extends BaseAIProcessor {
  constructor() {
    super();
    this.logger.setContext('AnthropicProcessor');
  }

  async process(input: any): Promise<any> {
    try {
      this.logger.debug('Anthropic処理開始');

      // 簡略化された実装
      const result = {
        processed: true,
        processor: 'Anthropic',
        data: input,
      };

      this.logger.debug('Anthropic処理完了');
      return result;
    } catch (error) {
      this.logger.error('Anthropic処理エラー', error);
      throw error;
    }
  }
}
