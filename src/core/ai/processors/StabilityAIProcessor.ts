import { BaseAIProcessor } from './BaseAIProcessor';
export class StabilityAIProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'StabilityAI' };
  }
}
