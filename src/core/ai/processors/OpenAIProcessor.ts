import { BaseAIProcessor } from './BaseAIProcessor';
export class OpenAIProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'OpenAI' };
  }
}
