import { BaseAIProcessor } from './BaseAIProcessor';
export class GoogleAIProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'GoogleAI' };
  }
}
