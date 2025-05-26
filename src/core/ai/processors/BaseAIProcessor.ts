export abstract class BaseAIProcessor {
  abstract process(input: any): Promise<any>;
}