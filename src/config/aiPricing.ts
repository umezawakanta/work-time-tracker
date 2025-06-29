/**
 * 🤖 AI プロバイダー価格設定
 * 実際のAPI価格に基づく動的な価格計算
 */

export interface AIProviderPricing {
  inputTokenPrice: number; // 1000トークンあたりの入力価格
  outputTokenPrice: number; // 1000トークンあたりの出力価格
  baseRequestCost: number; // 基本リクエストコスト
  currency: string;
}

export interface PricingConfig {
  [provider: string]: AIProviderPricing;
}

// 2024年12月現在の実際のAPI価格（USD）
export const AI_PRICING_CONFIG: PricingConfig = {
  openai: {
    inputTokenPrice: 0.0005, // GPT-4: $0.03/1K input tokens
    outputTokenPrice: 0.0015, // GPT-4: $0.06/1K output tokens
    baseRequestCost: 0.0001,
    currency: 'USD',
  },
  anthropic: {
    inputTokenPrice: 0.0008, // Claude-3 Sonnet
    outputTokenPrice: 0.0024,
    baseRequestCost: 0.0001,
    currency: 'USD',
  },
  google: {
    inputTokenPrice: 0.0003, // Gemini Pro
    outputTokenPrice: 0.0006,
    baseRequestCost: 0.00005,
    currency: 'USD',
  },
  notion: {
    inputTokenPrice: 0, // 無制限プランに含まれる
    outputTokenPrice: 0,
    baseRequestCost: 0,
    currency: 'USD',
  },
  manus: {
    inputTokenPrice: 0.001, // 手書き認識サービス
    outputTokenPrice: 0.0005,
    baseRequestCost: 0.0002,
    currency: 'USD',
  },
  superwhisper: {
    inputTokenPrice: 0.0004, // 音声認識（分あたり）
    outputTokenPrice: 0.0001,
    baseRequestCost: 0.0001,
    currency: 'USD',
  },
  sora: {
    inputTokenPrice: 0.05, // 動画生成（秒あたり）
    outputTokenPrice: 0.1,
    baseRequestCost: 0.01,
    currency: 'USD',
  },
  notebooklm: {
    inputTokenPrice: 0, // 無料
    outputTokenPrice: 0,
    baseRequestCost: 0,
    currency: 'USD',
  },
  aiStudio: {
    inputTokenPrice: 0.0002, // 実験的価格
    outputTokenPrice: 0.0008,
    baseRequestCost: 0.0001,
    currency: 'USD',
  },
};

/**
 * トークン数とプロバイダーに基づいてコストを計算
 */
export function calculateAICost(
  provider: string,
  inputTokens: number = 0,
  outputTokens: number = 0
): number {
  const pricing = AI_PRICING_CONFIG[provider];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1000) * pricing.inputTokenPrice;
  const outputCost = (outputTokens / 1000) * pricing.outputTokenPrice;
  const totalCost = inputCost + outputCost + pricing.baseRequestCost;

  return Math.round(totalCost * 10000) / 10000; // 小数点以下4桁まで
}

/**
 * 処理時間に基づく動的confidence計算
 */
export function calculateConfidence(
  provider: string,
  processingTime: number,
  tokenCount: number,
  taskComplexity: 'simple' | 'medium' | 'complex' = 'medium'
): number {
  const baseConfidence = {
    openai: 88,
    anthropic: 92,
    google: 85,
    notion: 78,
    manus: 90,
    superwhisper: 94,
    sora: 86,
    notebooklm: 82,
    aiStudio: 80,
  };

  let confidence = baseConfidence[provider] || 80;

  // 処理時間による調整（速すぎる場合は信頼性が下がる）
  if (processingTime < 500) confidence -= 5;
  if (processingTime > 5000) confidence -= 3;

  // タスクの複雑さによる調整
  const complexityAdjustment = {
    simple: 3,
    medium: 0,
    complex: -5,
  };
  confidence += complexityAdjustment[taskComplexity];

  // トークン数による調整（適切な量の場合は信頼性が上がる）
  if (tokenCount > 50 && tokenCount < 500) confidence += 2;

  return Math.max(50, Math.min(98, confidence));
}

/**
 * 処理時間を予測（プロバイダーと入力サイズによる）
 */
export function estimateProcessingTime(
  provider: string,
  inputSize: number,
  taskType: string
): number {
  const baseTime = {
    openai: 1200,
    anthropic: 1800,
    google: 800,
    notion: 1000,
    manus: 2000,
    superwhisper: 300,
    sora: 15000,
    notebooklm: 3000,
    aiStudio: 1500,
  };

  const taskMultiplier = {
    code: 1.2,
    analysis: 1.5,
    creative: 1.1,
    transcription: 0.8,
    video: 8.0,
    notes: 1.0,
    planning: 1.3,
  };

  const base = baseTime[provider] || 1000;
  const multiplier = taskMultiplier[taskType] || 1.0;
  const sizeAdjustment = Math.sqrt(inputSize / 100); // 入力サイズによる調整

  return Math.round(base * multiplier * sizeAdjustment);
}
