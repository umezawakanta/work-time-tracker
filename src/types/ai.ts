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

// =============================================================================
// AI Task Management Interfaces
// =============================================================================

export interface TaskSuggestion {
  id: string;
  taskId: string;
  type: 'priority' | 'optimization' | 'scheduling' | 'breakdown' | 'priority_adjustment';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  effort: string;
  aiGenerated: boolean;
  suggestedAction?: string | SuggestedAction;
  reasoning?: string;
  estimatedTimeImpact?: number;
  metadata?: {
    currentPriority?: number;
    suggestedPriority?: number;
    reason?: string;
  };
}

export interface SuggestedAction {
  action: string;
  targetTaskId?: string;
  newValues?: Record<string, unknown>;
}

export interface TaskPrediction {
  taskId: string;
  estimatedDuration: number; // 分単位
  estimatedMinutes?: number; // エイリアス
  confidence: number;
  difficulty: 'easy' | 'medium' | 'hard';
  optimalTimeSlots: string[];
  dependencies: string[];
  prerequisites: string[];
  factors: string[];
  aiGenerated: boolean;
}

export interface TaskRecommendation {
  id: string;
  title: string;
  type: string;
  description: string;
  priority: number;
  confidence?: number;
  aiGenerated?: boolean;
  metadata?: Record<string, any>;
}

// =============================================================================
// AI Analysis Interfaces
// =============================================================================

export interface TaskAnalysis {
  taskId: string;
  complexity: 'low' | 'medium' | 'high';
  priority: number;
  estimatedDuration: number;
  clarity: 'clear' | 'vague' | 'abstract';
  actionability: number; // 0-100
  suggestions: TaskSuggestion[];
  predictions: TaskPrediction[];
  recommendations: TaskRecommendation[];
}

export interface AIAnalysisResult {
  analysisId: string;
  timestamp: string;
  totalTasks: number;
  analysisScore: number;
  taskAnalyses: TaskAnalysis[];
  overallRecommendations: string[];
  productivity: {
    currentScore: number;
    potentialScore: number;
    improvementAreas: string[];
  };
}
