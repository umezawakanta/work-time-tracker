export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  multimodal: boolean;
  requiresSubscription: boolean;
  tokenCost?: {
    input: number;
    output: number;
  };
}

export interface AIModelSummary {
  modelId: string;
  displayName: string;
  description: string;
  id?: string;
  name?: string;
  provider?: string;
  capabilities?: string[];
  multimodal?: boolean;
  requiresSubscription?: boolean;
}

export type AIProvider =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'grok'
  | 'azure'
  | 'google'
  | 'local'
  | 'cohere'
  | 'huggingface'
  | 'stabilityai';

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIFeatureOptions {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}
