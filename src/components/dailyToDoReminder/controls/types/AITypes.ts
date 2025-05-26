export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  version?: string;
  multimodal?: boolean;
  requiresSubscription?: boolean;
  priority?: number;
}

export interface AIModelSummary {
  modelId: string;
  displayName: string;
  description: string;
}