/**
 * 🤖 統合AIサービス
 * ChatGPT、Claude、Gemini、Manus、NotebookLM、Notion、AI Studio、SuperWhisper、Soraを統合
 */

import {
  calculateAICost,
  calculateConfidence,
  estimateProcessingTime,
} from '../../config/aiPricing';

export interface AIProvider {
  name: string;
  capabilities: string[];
  pricing: 'free' | 'low' | 'medium' | 'high';
  speed: 'slow' | 'medium' | 'fast' | 'realtime';
  reliability: number; // 0-100
}

export interface UnifiedAIRequest {
  prompt: string;
  context?: string;
  taskType: 'code' | 'analysis' | 'creative' | 'transcription' | 'video' | 'notes' | 'planning';
  preferredProvider?: string;
  fallbackEnabled?: boolean;
  qualityLevel?: 'fast' | 'balanced' | 'high';
}

export interface UnifiedAIResponse {
  content: string;
  provider: string;
  model: string;
  confidence: number;
  processingTime: number;
  tokens?: number;
  cost?: number;
  metadata?: Record<string, any>;
}

class UnifiedAIService {
  private static instance: UnifiedAIService | null = null;
  private providers: Map<string, AIProvider> = new Map();
  private apiKeys: Map<string, string> = new Map();
  private usageStats: Map<string, { requests: number; errors: number; totalCost: number }> =
    new Map();

  constructor() {
    this.initializeProviders();
  }

  public static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService();
    }
    return UnifiedAIService.instance;
  }

  /**
   * プロバイダー情報を初期化
   */
  private initializeProviders(): void {
    this.providers.set('chatgpt', {
      name: 'ChatGPT',
      capabilities: ['code', 'analysis', 'creative', 'planning'],
      pricing: 'medium',
      speed: 'fast',
      reliability: 90,
    });

    this.providers.set('claude', {
      name: 'Claude',
      capabilities: ['code', 'analysis', 'creative', 'planning'],
      pricing: 'medium',
      speed: 'medium',
      reliability: 95,
    });

    this.providers.set('gemini', {
      name: 'Gemini',
      capabilities: ['code', 'analysis', 'creative', 'planning'],
      pricing: 'low',
      speed: 'fast',
      reliability: 85,
    });

    this.providers.set('manus', {
      name: 'Manus',
      capabilities: ['notes', 'transcription'],
      pricing: 'medium',
      speed: 'medium',
      reliability: 88,
    });

    this.providers.set('notebooklm', {
      name: 'NotebookLM',
      capabilities: ['analysis', 'notes'],
      pricing: 'free',
      speed: 'medium',
      reliability: 85,
    });

    this.providers.set('notion', {
      name: 'Notion AI',
      capabilities: ['creative', 'notes'],
      pricing: 'low',
      speed: 'medium',
      reliability: 80,
    });

    this.providers.set('superwhisper', {
      name: 'SuperWhisper',
      capabilities: ['transcription'],
      pricing: 'low',
      speed: 'realtime',
      reliability: 92,
    });

    this.providers.set('sora', {
      name: 'Sora',
      capabilities: ['video'],
      pricing: 'high',
      speed: 'slow',
      reliability: 88,
    });

    // 統計初期化
    this.providers.forEach((_, key) => {
      this.usageStats.set(key, { requests: 0, errors: 0, totalCost: 0 });
    });
  }

  /**
   * APIキーを設定
   */
  public setApiKey(provider: string, apiKey: string): void {
    this.apiKeys.set(provider, apiKey);
    console.log(`🔑 ${provider} API key を設定しました`);
  }

  /**
   * 統合AIリクエスト処理
   */
  public async processRequest(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const startTime = Date.now();

    try {
      // 最適なプロバイダーを選択
      const selectedProvider = request.preferredProvider || this.selectOptimalProvider(request);

      console.log(`🤖 選択されたAIプロバイダー: ${selectedProvider}`);

      // リクエスト実行
      const response = await this.executeRequest(selectedProvider, request);

      // 統計更新
      this.updateUsageStats(selectedProvider, true, response.cost || 0);

      return {
        ...response,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('❌ AI リクエストエラー:', error);

      // フォールバック処理
      if (request.fallbackEnabled !== false) {
        return this.handleFallback(request, startTime);
      }

      throw error;
    }
  }

  /**
   * 最適なプロバイダーを選択
   */
  private selectOptimalProvider(request: UnifiedAIRequest): string {
    const { taskType, qualityLevel = 'balanced' } = request;

    // タスクタイプ別の適用性をチェック
    const suitableProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.capabilities.includes(taskType))
      .filter(([key]) => this.apiKeys.has(key) || this.isPublicProvider(key));

    if (suitableProviders.length === 0) {
      throw new Error(`タスクタイプ '${taskType}' に対応するプロバイダーが見つかりません`);
    }

    // 品質レベルに基づく選択
    switch (qualityLevel) {
      case 'fast':
        return suitableProviders.sort(
          ([, a], [, b]) => this.getSpeedScore(b.speed) - this.getSpeedScore(a.speed)
        )[0][0];

      case 'high':
        return suitableProviders.sort(([, a], [, b]) => b.reliability - a.reliability)[0][0];

      case 'balanced':
      default:
        return suitableProviders.sort(([, a], [, b]) => {
          const scoreA = (a.reliability + this.getSpeedScore(a.speed) * 10) / 2;
          const scoreB = (b.reliability + this.getSpeedScore(b.speed) * 10) / 2;
          return scoreB - scoreA;
        })[0][0];
    }
  }

  /**
   * リクエスト実行
   */
  private async executeRequest(
    provider: string,
    request: UnifiedAIRequest
  ): Promise<UnifiedAIResponse> {
    switch (provider) {
      case 'chatgpt':
        return this.callChatGPT(request);
      case 'claude':
        return this.callClaude(request);
      case 'gemini':
        return this.callGemini(request);
      case 'manus':
        return this.callManus(request);
      case 'notebooklm':
        return this.callNotebookLM(request);
      case 'notion':
        return this.callNotion(request);
      case 'superwhisper':
        return this.callSuperWhisper(request);
      case 'sora':
        return this.callSora(request);
      default:
        throw new Error(`未対応のプロバイダー: ${provider}`);
    }
  }

  /**
   * ChatGPT API呼び出し
   */
  private async callChatGPT(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const apiKey = this.apiKeys.get('chatgpt');
    if (!apiKey) {
      throw new Error('ChatGPT API key が設定されていません');
    }

    console.log('🚀 ChatGPT でリクエスト処理中...');

    const startTime = Date.now();
    const inputTokens = Math.ceil(request.prompt.length / 4);
    const outputTokens = 150;
    const processingTime = estimateProcessingTime('openai', inputTokens, request.taskType);
    const cost = calculateAICost('openai', inputTokens, outputTokens);
    const confidence = calculateConfidence('openai', processingTime, inputTokens + outputTokens);

    // 実際の実装では OpenAI API を呼び出し
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    return {
      content: `ChatGPT応答: ${request.prompt}について詳細で実用的な回答を提供します。`,
      provider: 'ChatGPT',
      model: 'gpt-4',
      confidence,
      processingTime: Date.now() - startTime,
      tokens: inputTokens + outputTokens,
      cost,
    };
  }

  /**
   * Claude API呼び出し
   */
  private async callClaude(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const apiKey = this.apiKeys.get('claude');
    if (!apiKey) {
      throw new Error('Claude API key が設定されていません');
    }

    console.log('🧠 Claude でリクエスト処理中...');

    const startTime = Date.now();
    const inputTokens = Math.ceil(request.prompt.length / 4);
    const outputTokens = 180;
    const processingTime = estimateProcessingTime('anthropic', inputTokens, request.taskType);
    const cost = calculateAICost('anthropic', inputTokens, outputTokens);
    const confidence = calculateConfidence('anthropic', processingTime, inputTokens + outputTokens);

    await new Promise((resolve) => setTimeout(resolve, processingTime));

    return {
      content: `Claude応答: ${request.prompt}に対して論理的で包括的な分析結果をお伝えします。`,
      provider: 'Claude',
      model: 'claude-3-sonnet',
      confidence,
      processingTime: Date.now() - startTime,
      tokens: inputTokens + outputTokens,
      cost,
    };
  }

  /**
   * Gemini API呼び出し
   */
  private async callGemini(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const apiKey = this.apiKeys.get('gemini');
    if (!apiKey) {
      throw new Error('Gemini API key が設定されていません');
    }

    console.log('✨ Gemini でリクエスト処理中...');

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      content: `Gemini応答: ${request.prompt}について創造的で革新的な視点から回答いたします。`,
      provider: 'Gemini',
      model: 'gemini-pro',
      confidence: 85,
      processingTime: 0,
      tokens: 120,
      cost: 0.001,
    };
  }

  /**
   * Manus API呼び出し
   */
  private async callManus(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    console.log('✍️ Manus で手書き認識処理中...');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      content: `Manus認識結果: 手書きテキスト「${request.prompt}」を高精度で認識しました。`,
      provider: 'Manus',
      model: 'manus-v2',
      confidence: 92,
      processingTime: 0,
      metadata: {
        handwritingConfidence: 0.92,
        language: 'ja',
      },
    };
  }

  /**
   * NotebookLM API呼び出し
   */
  private async callNotebookLM(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    console.log('📚 NotebookLM で文書分析中...');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      content: `NotebookLM分析: ${request.prompt}に関する詳細な文書分析と洞察を提供します。`,
      provider: 'NotebookLM',
      model: 'notebooklm-v1',
      confidence: 88,
      processingTime: 0,
      cost: 0, // 無料
    };
  }

  /**
   * Notion AI API呼び出し
   */
  private async callNotion(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    console.log('📝 Notion AI で処理中...');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      content: `Notion AI応答: ${request.prompt}をもとに構造化されたコンテンツを作成しました。`,
      provider: 'Notion',
      model: 'notion-ai',
      confidence: 82,
      processingTime: 0,
      metadata: {
        pageId: 'notion-page-' + Date.now(),
        workspace: 'work-tracker',
      },
    };
  }

  /**
   * SuperWhisper API呼び出し
   */
  private async callSuperWhisper(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    console.log('🎤 SuperWhisper で音声認識中...');

    await new Promise((resolve) => setTimeout(resolve, 500)); // リアルタイム

    return {
      content: `音声認識結果: 「${request.prompt}」を正確に認識しました。`,
      provider: 'SuperWhisper',
      model: 'whisper-turbo',
      confidence: 96,
      processingTime: 0,
      metadata: {
        audioLength: 30,
        language: 'ja',
        speakerCount: 1,
      },
    };
  }

  /**
   * Sora API呼び出し
   */
  private async callSora(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    console.log('🎬 Sora で動画生成中...');

    const startTime = Date.now();
    const videoDuration = 30; // 30秒動画
    const inputComplexity = Math.ceil(request.prompt.length / 10); // プロンプト複雑度
    const processingTime = estimateProcessingTime('sora', inputComplexity, request.taskType);
    const cost = calculateAICost('sora', videoDuration, 0); // 動画長ベースのコスト
    const confidence = calculateConfidence('sora', processingTime, inputComplexity, 'complex');

    await new Promise((resolve) => setTimeout(resolve, processingTime));

    return {
      content: `動画生成完了: 「${request.prompt}」をテーマにした30秒の動画を作成しました。`,
      provider: 'Sora',
      model: 'sora-v1',
      confidence,
      processingTime: Date.now() - startTime,
      cost,
      metadata: {
        videoUrl: 'https://generated-videos.example.com/video-' + Date.now(),
        duration: videoDuration,
        resolution: '1080p',
        format: 'mp4',
        complexityScore: inputComplexity,
      },
    };
  }

  /**
   * フォールバック処理
   */
  private async handleFallback(
    request: UnifiedAIRequest,
    startTime: number
  ): Promise<UnifiedAIResponse> {
    console.log('🔄 フォールバック処理を実行中...');

    // より単純なリクエストで代替プロバイダーを試行
    const fallbackRequest: UnifiedAIRequest = {
      ...request,
      qualityLevel: 'fast',
      fallbackEnabled: false, // 無限ループを防ぐ
    };

    try {
      const response = await this.processRequest(fallbackRequest);
      return {
        ...response,
        processingTime: Date.now() - startTime,
        metadata: {
          ...response.metadata,
          isFallback: true,
        },
      };
    } catch (error) {
      // 最後の手段として基本的な応答を返す
      return {
        content: `申し訳ございません。現在AIサービスに接続できません。${request.prompt}については後ほど再試行してください。`,
        provider: 'fallback',
        model: 'basic',
        confidence: 50,
        processingTime: Date.now() - startTime,
        metadata: {
          isFallback: true,
          error: true,
        },
      };
    }
  }

  /**
   * 複数プロバイダーでコンセンサス取得
   */
  public async getConsensus(
    request: UnifiedAIRequest,
    providerCount: number = 3
  ): Promise<{
    consensus: string;
    responses: UnifiedAIResponse[];
    averageConfidence: number;
  }> {
    console.log(`🤝 ${providerCount}つのプロバイダーでコンセンサス取得中...`);

    const providers = this.selectMultipleProviders(request, providerCount);

    const promises = providers.map(async (provider) => {
      try {
        return await this.executeRequest(provider, request);
      } catch (error) {
        console.warn(`⚠️ ${provider} でエラー:`, error);
        return null;
      }
    });

    const responses = (await Promise.all(promises)).filter(Boolean) as UnifiedAIResponse[];

    if (responses.length === 0) {
      throw new Error('すべてのプロバイダーが失敗しました');
    }

    // 最も信頼性の高い応答を選択
    const bestResponse = responses.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    return {
      consensus: bestResponse.content,
      responses,
      averageConfidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
    };
  }

  /**
   * 使用統計を取得
   */
  public getUsageStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    this.usageStats.forEach((stat, provider) => {
      const providerInfo = this.providers.get(provider);
      stats[provider] = {
        ...stat,
        successRate: stat.requests > 0 ? ((stat.requests - stat.errors) / stat.requests) * 100 : 0,
        averageCost: stat.requests > 0 ? stat.totalCost / stat.requests : 0,
        capabilities: providerInfo?.capabilities || [],
        reliability: providerInfo?.reliability || 0,
      };
    });

    return stats;
  }

  // === ユーティリティメソッド ===

  private getSpeedScore(speed: string): number {
    switch (speed) {
      case 'realtime':
        return 10;
      case 'fast':
        return 8;
      case 'medium':
        return 5;
      case 'slow':
        return 2;
      default:
        return 1;
    }
  }

  private isPublicProvider(provider: string): boolean {
    return ['notebooklm'].includes(provider);
  }

  private selectMultipleProviders(request: UnifiedAIRequest, count: number): string[] {
    const { taskType } = request;

    const suitableProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.capabilities.includes(taskType))
      .filter(([key]) => this.apiKeys.has(key) || this.isPublicProvider(key))
      .map(([key]) => key);

    return suitableProviders.slice(0, count);
  }

  private updateUsageStats(provider: string, success: boolean, cost: number): void {
    const stats = this.usageStats.get(provider);
    if (!stats) return;

    stats.requests++;
    if (!success) stats.errors++;
    stats.totalCost += cost;

    this.usageStats.set(provider, stats);
  }
}

export const unifiedAIService = UnifiedAIService.getInstance();
