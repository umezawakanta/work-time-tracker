import { BaseAIProcessor } from './BaseAIProcessor';
export class CohereProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'Cohere' };
  }
}
