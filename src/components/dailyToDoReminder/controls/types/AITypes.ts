export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
}

export interface AIModelSummary {
  modelId: string;
  displayName: string;
  description: string;
}