import { BaseAIProcessor } from './BaseAIProcessor';
export class LocalAIProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'LocalAI' };
  }
}