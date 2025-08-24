import { BaseAIProcessor } from './BaseAIProcessor';
export class HuggingFaceProcessor extends BaseAIProcessor {
  async process(input: any): Promise<any> {
    return { processed: true, processor: 'HuggingFace' };
  }
}
