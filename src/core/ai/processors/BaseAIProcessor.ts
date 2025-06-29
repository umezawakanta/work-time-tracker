import { ApiLogger } from '@/core/api/tracking/ApiLogger';

export abstract class BaseAIProcessor {
  protected logger: ApiLogger;

  constructor() {
    this.logger = ApiLogger.getInstance();
  }

  abstract process(input: any): Promise<any>;

  protected buildSystemPrompt(enhancementType: string, options: any): string {
    return `System prompt for ${enhancementType}`;
  }

  protected buildUserPrompt(data: any, enhancementType: string, options: any): string {
    return `User prompt for ${enhancementType}`;
  }

  protected estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
