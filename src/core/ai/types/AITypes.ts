/**
 * AI関連の型定義
 */

/**
 * AI強化タイプ
 */
export type AIEnhancementType =
  | 'query-optimization' // クエリの最適化
  | 'content-generation' // コンテンツ生成
  | 'text-summarization' // テキスト要約
  | 'sentiment-analysis' // 感情分析
  | 'entity-extraction' // エンティティ抽出
  | 'translation' // 翻訳
  | 'text-classification' // テキスト分類
  | 'code-generation' // コード生成
  | 'code-explanation' // コード説明
  | 'data-analysis' // データ分析
  | 'image-generation' // 画像生成
  | 'image-editing' // 画像編集
  | 'image-captioning' // 画像キャプション
  | 'audio-transcription' // 音声書き起こし
  | 'chat-completion' // チャット補完
  | 'question-answering' // 質問応答
  | 'vector-embedding' // ベクトル埋め込み
  | 'custom'; // カスタム

/**
 * AIプロバイダー
 */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'huggingface'
  | 'azure'
  | 'stability'
  | 'cohere'
  | 'local';

/**
 * AIプロバイダー設定
 */
export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  options?: Record<string, unknown>;
}

/**
 * AIモデル定義
 */
export interface AIModel {
  id: string;
  displayName: string;
  provider: AIProvider;
  capabilities: AIEnhancementType[];
  maxTokens: number;
  contextWindow: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  supportsStreaming: boolean;
  defaultTemperature: number;
  supportedLanguages: string[];
  metadata: Record<string, unknown>;
}

/**
 * AIモデルサマリー
 */
export interface AIModelSummary {
  id: string;
  displayName: string;
  provider: AIProvider;
  capabilities: AIEnhancementType[];
  maxTokens: number;
  contextWindow: number;
  supportsStreaming: boolean;
}

/**
 * AI機能オプション
 */
export interface AIFeatureOptions {
  model?: string;
  fallbackModel?: string;
  enhancementType?: AIEnhancementType;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  prompt?: string;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  stream?: boolean;
  onToken?: (token: string) => void;
  filters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  includeTokenUsage?: boolean;
  additionalInstructions?: string;
  required?: boolean;
  requestConfig?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * AI強化結果
 */
export interface AIEnhancementResult {
  data: unknown;
  type: AIEnhancementType;
  modelUsed: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  duration: number;
  timestamp: number;
  cached?: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * AI処理結果
 */
export interface AIProcessingResult {
  data: unknown;
  inputTokens: number;
  outputTokens: number;
  metadata?: Record<string, unknown>;
}

/**
 * AIプロバイダー使用状況
 */
export interface AIProviderUsage {
  totalCalls: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  averageResponseTime: number;
}

/**
 * AI使用状況サマリー
 */
export interface AIUsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCost: number;
  averageResponseTime: number;
  byProvider: Record<string, AIProviderUsage>;
  byModel: Record<string, AIProviderUsage>;
}

/**
 * AIキャッシュステータス
 */
export interface AICacheStatus {
  enabled: boolean;
  size: number;
  hitRate: number;
}

/**
 * AIセキュリティステータス
 */
export interface AISecurityStatus {
  enabled: boolean;
  filtersActive: boolean;
  moderationEnabled: boolean;
}

/**
 * AI機能ステータス
 */
export interface AIFeatureStatus {
  initialized: boolean;
  availableModels: AIModelSummary[];
  defaultModel: string;
  providers: Record<
    AIProvider,
    {
      available: boolean;
      hasCustomEndpoint: boolean;
    }
  >;
  usage: {
    totalCalls: number;
    totalTokens: number;
    totalEstimatedCost: number;
    averageResponseTime: number;
    byProvider: Record<string, AIProviderUsage>;
    byModel: Record<string, AIProviderUsage>;
  };
  cache: AICacheStatus;
  security: AISecurityStatus;
}

/**
 * AIプロセッサーインターフェース
 */
export interface AIProcessor {
  process(
    data: unknown,
    model: AIModel,
    enhancementType: AIEnhancementType,
    options: AIFeatureOptions,
    providerConfig: AIProviderConfig
  ): Promise<AIProcessingResult>;
}

/**
 * サブスクリプションプラン
 */
export interface AISubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxRequests: number;
    maxTokens: number;
    modelsAllowed: string[];
  };
}

/**
 * サブスクリプション情報
 */
export interface AISubscriptionInfo {
  active: boolean;
  plan: AISubscriptionPlan | null;
  expiration: number | null;
  usageThisMonth: {
    requests: number;
    tokens: number;
  };
  features: Record<string, boolean>;
}
