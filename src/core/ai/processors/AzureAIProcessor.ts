import { BaseAIProcessor } from './BaseAIProcessor';
export class AzureAIProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'AzureAI' };
  }
}
