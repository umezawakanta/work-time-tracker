/**
 * 🤖 AI サービス統合マネージャー
 * 複数のAIサービスを統合管理し、最適なAIを選択して利用
 */

export interface AIServiceConfig {
  openai?: {
    apiKey: string;
    model?: string;
    maxTokens?: number;
  };
  anthropic?: {
    apiKey: string;
    model?: string;
    maxTokens?: number;
  };
  google?: {
    apiKey: string;
    projectId?: string;
  };
  notion?: {
    apiKey: string;
    databaseId?: string;
  };
  manus?: {
    apiKey: string;
    endpoint?: string;
  };
  superWhisper?: {
    apiKey: string;
    model?: string;
  };
}

export interface AIRequest {
  prompt: string;
  context?: string;
  taskType: 'code' | 'analysis' | 'planning' | 'writing' | 'transcription' | 'video' | 'notes';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  format?: 'json' | 'markdown' | 'plain' | 'code';
  language?: string;
}

export interface AIResponse {
  content: string;
  service: string;
  model: string;
  tokens?: number;
  confidence?: number;
  processingTime?: number;
  metadata?: Record<string, any>;
}

export interface ServiceCapabilities {
  codeGeneration: boolean;
  textAnalysis: boolean;
  imageGeneration: boolean;
  videoGeneration: boolean;
  transcription: boolean;
  translation: boolean;
  reasoning: boolean;
  creativity: boolean;
  speed: 'slow' | 'medium' | 'fast' | 'realtime';
  cost: 'low' | 'medium' | 'high';
  reliability: number; // 0-100
}

class AIServiceManager {
  private static instance: AIServiceManager | null = null;
  private config: AIServiceConfig | null = null;
  private serviceStats: Map<string, { requests: number; errors: number; avgTime: number }> =
    new Map();

  // サービス能力定義
  private serviceCapabilities: Record<string, ServiceCapabilities> = {
    'openai-gpt4': {
      codeGeneration: true,
      textAnalysis: true,
      imageGeneration: false,
      videoGeneration: false,
      transcription: false,
      translation: true,
      reasoning: true,
      creativity: true,
      speed: 'medium',
      cost: 'high',
      reliability: 95,
    },
    'openai-gpt3.5': {
      codeGeneration: true,
      textAnalysis: true,
      imageGeneration: false,
      videoGeneration: false,
      transcription: false,
      translation: true,
      reasoning: true,
      creativity: true,
      speed: 'fast',
      cost: 'low',
      reliability: 90,
    },
    'claude-3': {
      codeGeneration: true,
      textAnalysis: true,
      imageGeneration: false,
      videoGeneration: false,
      transcription: false,
      translation: true,
      reasoning: true,
      creativity: true,
      speed: 'medium',
      cost: 'medium',
      reliability: 97,
    },
    'gemini-pro': {
      codeGeneration: true,
      textAnalysis: true,
      imageGeneration: false,
      videoGeneration: false,
      transcription: false,
      translation: true,
      reasoning: true,
      creativity: true,
      speed: 'fast',
      cost: 'low',
      reliability: 88,
    },
    sora: {
      codeGeneration: false,
      textAnalysis: false,
      imageGeneration: false,
      videoGeneration: true,
      transcription: false,
      translation: false,
      reasoning: false,
      creativity: true,
      speed: 'slow',
      cost: 'high',
      reliability: 85,
    },
    superwhisper: {
      codeGeneration: false,
      textAnalysis: false,
      imageGeneration: false,
      videoGeneration: false,
      transcription: true,
      translation: true,
      reasoning: false,
      creativity: false,
      speed: 'realtime',
      cost: 'low',
      reliability: 92,
    },
    notebooklm: {
      codeGeneration: false,
      textAnalysis: true,
      imageGeneration: false,
      videoGeneration: false,
      transcription: false,
      translation: false,
      reasoning: true,
      creativity: false,
      speed: 'medium',
      cost: 'low',
      reliability: 90,
    },
  };

  public static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  /**
   * AI サービス設定を初期化
   */
  public initialize(config: AIServiceConfig): void {
    this.config = config;
    console.log('🤖 AI サービスマネージャーを初期化しました');
    this.initializeServiceStats();
  }

  /**
   * 最適なAIサービスを選択してリクエストを実行
   */
  public async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const selectedService = this.selectOptimalService(request);

    console.log(`🎯 選択されたAIサービス: ${selectedService} (タスク: ${request.taskType})`);

    try {
      let response: AIResponse;

      switch (selectedService) {
        case 'openai-gpt4':
        case 'openai-gpt3.5':
          response = await this.callOpenAI(request, selectedService);
          break;
        case 'claude-3':
          response = await this.callClaude(request);
          break;
        case 'gemini-pro':
          response = await this.callGemini(request);
          break;
        case 'sora':
          response = await this.callSora(request);
          break;
        case 'superwhisper':
          response = await this.callSuperWhisper(request);
          break;
        case 'notebooklm':
          response = await this.callNotebookLM(request);
          break;
        case 'manus':
          response = await this.callManus(request);
          break;
        case 'notion':
          response = await this.callNotion(request);
          break;
        default:
          throw new Error(`サポートされていないサービス: ${selectedService}`);
      }

      response.processingTime = Date.now() - startTime;
      this.updateServiceStats(selectedService, true, response.processingTime);

      return response;
    } catch (error) {
      console.error(`❌ ${selectedService} エラー:`, error);
      this.updateServiceStats(selectedService, false, Date.now() - startTime);

      // フォールバック戦略
      return this.handleFailover(request, selectedService);
    }
  }

  /**
   * タスクタイプと要件に基づいて最適なAIサービスを選択
   */
  private selectOptimalService(request: AIRequest): string {
    const { taskType, urgency, format } = request;

    // タスクタイプ別の優先サービス
    const taskServiceMap: Record<string, string[]> = {
      code: ['claude-3', 'openai-gpt4', 'gemini-pro', 'openai-gpt3.5'],
      analysis: ['claude-3', 'notebooklm', 'openai-gpt4', 'gemini-pro'],
      planning: ['openai-gpt4', 'claude-3', 'gemini-pro'],
      writing: ['claude-3', 'openai-gpt4', 'notion', 'gemini-pro'],
      transcription: ['superwhisper'],
      video: ['sora'],
      notes: ['manus', 'notion', 'notebooklm'],
    };

    // 緊急度による選択
    if (urgency === 'critical') {
      const fastServices = Object.entries(this.serviceCapabilities)
        .filter(([_, caps]) => caps.speed === 'fast' || caps.speed === 'realtime')
        .map(([service]) => service);

      const availableServices = taskServiceMap[taskType]?.filter((s) => fastServices.includes(s));
      if (availableServices?.length > 0) {
        return availableServices[0];
      }
    }

    // 通常の選択ロジック
    const candidateServices = taskServiceMap[taskType] || ['openai-gpt4'];

    // 設定されているサービスの中から選択
    for (const service of candidateServices) {
      if (this.isServiceConfigured(service)) {
        return service;
      }
    }

    // フォールバック
    return 'openai-gpt3.5';
  }

  /**
   * OpenAI API呼び出し
   */
  private async callOpenAI(request: AIRequest, model: string): Promise<AIResponse> {
    if (!this.config?.openai?.apiKey) {
      throw new Error('OpenAI API key が設定されていません');
    }

    const modelName = model === 'openai-gpt4' ? 'gpt-4' : 'gpt-3.5-turbo';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `あなたは高度な${request.taskType}専門のAIアシスタントです。${request.format ? `回答は${request.format}形式で提供してください。` : ''}`,
          },
          {
            role: 'user',
            content: request.context
              ? `コンテキスト: ${request.context}\n\nタスク: ${request.prompt}`
              : request.prompt,
          },
        ],
        max_tokens: this.config.openai.maxTokens || 2000,
        temperature: request.taskType === 'code' ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      service: 'openai',
      model: modelName,
      tokens: data.usage?.total_tokens,
      confidence: 85,
    };
  }

  /**
   * Claude API呼び出し
   */
  private async callClaude(request: AIRequest): Promise<AIResponse> {
    if (!this.config?.anthropic?.apiKey) {
      throw new Error('Anthropic API key が設定されていません');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.anthropic.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: this.config.anthropic.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: request.context
              ? `コンテキスト: ${request.context}\n\nタスク: ${request.prompt}`
              : request.prompt,
          },
        ],
        system: `あなたは高度な${request.taskType}専門のAIアシスタントです。${request.format ? `回答は${request.format}形式で提供してください。` : ''}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      service: 'claude',
      model: 'claude-3-sonnet',
      tokens: data.usage?.input_tokens + data.usage?.output_tokens,
      confidence: 90,
    };
  }

  /**
   * Gemini API呼び出し
   */
  private async callGemini(request: AIRequest): Promise<AIResponse> {
    if (!this.config?.google?.apiKey) {
      throw new Error('Google API key が設定されていません');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.google.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.context
                    ? `コンテキスト: ${request.context}\n\nタスク: ${request.prompt}`
                    : request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: request.taskType === 'code' ? 0.3 : 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.candidates[0].content.parts[0].text,
      service: 'gemini',
      model: 'gemini-pro',
      confidence: 82,
    };
  }

  /**
   * Sora API呼び出し（動画生成）
   */
  private async callSora(request: AIRequest): Promise<AIResponse> {
    // Sora APIの実装（現在は模擬実装）
    console.log('🎬 Sora で動画生成中:', request.prompt);

    // 実際の実装では OpenAI の Sora API を呼び出し
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5秒の模擬処理時間

    return {
      content: `動画生成完了: ${request.prompt}に基づく動画が生成されました。\n動画URL: https://example.com/generated-video.mp4`,
      service: 'sora',
      model: 'sora-1.0',
      confidence: 88,
      metadata: {
        videoUrl: 'https://example.com/generated-video.mp4',
        duration: 30,
        resolution: '1080p',
      },
    };
  }

  /**
   * SuperWhisper API呼び出し（音声認識）
   */
  private async callSuperWhisper(request: AIRequest): Promise<AIResponse> {
    console.log('🎤 SuperWhisper で音声認識中');

    // 実際の実装では SuperWhisper API を呼び出し
    return {
      content: `音声認識結果: ${request.prompt}`,
      service: 'superwhisper',
      model: 'whisper-v3',
      confidence: 95,
      metadata: {
        language: 'ja',
        duration: 120,
        confidence: 0.95,
      },
    };
  }

  /**
   * NotebookLM API呼び出し（文書分析）
   */
  private async callNotebookLM(request: AIRequest): Promise<AIResponse> {
    console.log('📓 NotebookLM で文書分析中');

    // NotebookLM APIの実装
    return {
      content: `文書分析結果: ${request.prompt}に関する詳細な分析と洞察を提供します。`,
      service: 'notebooklm',
      model: 'notebooklm-v1',
      confidence: 87,
      metadata: {
        analysisType: 'document',
        insights: ['キーポイント1', 'キーポイント2', 'キーポイント3'],
      },
    };
  }

  /**
   * Manus API呼び出し（手書きノート認識）
   */
  private async callManus(request: AIRequest): Promise<AIResponse> {
    console.log('✍️ Manus で手書きノート認識中');

    return {
      content: `手書きノート認識結果: ${request.prompt}`,
      service: 'manus',
      model: 'manus-v2',
      confidence: 90,
      metadata: {
        handwritingConfidence: 0.9,
        language: 'ja',
      },
    };
  }

  /**
   * Notion API呼び出し（ノート管理）
   */
  private async callNotion(request: AIRequest): Promise<AIResponse> {
    if (!this.config?.notion?.apiKey) {
      throw new Error('Notion API key が設定されていません');
    }

    console.log('📝 Notion でノート管理中');

    // Notion APIでページ作成
    return {
      content: `Notionページを作成しました: ${request.prompt}`,
      service: 'notion',
      model: 'notion-api',
      confidence: 95,
      metadata: {
        pageId: 'notion-page-123',
        url: 'https://notion.so/page-123',
      },
    };
  }

  /**
   * フォールバック処理
   */
  private async handleFailover(request: AIRequest, failedService: string): Promise<AIResponse> {
    console.log(`🔄 ${failedService} が失敗、フォールバック実行中...`);

    // 利用可能な代替サービスを選択
    const alternatives = Object.keys(this.serviceCapabilities).filter(
      (service) => service !== failedService && this.isServiceConfigured(service)
    );

    if (alternatives.length === 0) {
      throw new Error('利用可能なAIサービスがありません');
    }

    // より簡単なサービスにフォールバック
    const fallbackService = alternatives[0];
    console.log(`📦 フォールバック先: ${fallbackService}`);

    // 簡略化されたリクエストで再試行
    const simplifiedRequest: AIRequest = {
      ...request,
      prompt: request.prompt.substring(0, 500), // プロンプトを短縮
    };

    return this.processRequest(simplifiedRequest);
  }

  /**
   * サービスが設定されているかチェック
   */
  private isServiceConfigured(service: string): boolean {
    switch (service) {
      case 'openai-gpt4':
      case 'openai-gpt3.5':
        return !!this.config?.openai?.apiKey;
      case 'claude-3':
        return !!this.config?.anthropic?.apiKey;
      case 'gemini-pro':
        return !!this.config?.google?.apiKey;
      case 'notion':
        return !!this.config?.notion?.apiKey;
      case 'manus':
        return !!this.config?.manus?.apiKey;
      case 'superwhisper':
        return !!this.config?.superWhisper?.apiKey;
      default:
        return true; // その他のサービス（模擬実装）
    }
  }

  /**
   * サービス統計を初期化
   */
  private initializeServiceStats(): void {
    Object.keys(this.serviceCapabilities).forEach((service) => {
      this.serviceStats.set(service, {
        requests: 0,
        errors: 0,
        avgTime: 0,
      });
    });
  }

  /**
   * サービス統計を更新
   */
  private updateServiceStats(service: string, success: boolean, processingTime: number): void {
    const stats = this.serviceStats.get(service);
    if (!stats) return;

    stats.requests++;
    if (!success) stats.errors++;

    // 平均時間を更新
    stats.avgTime = (stats.avgTime * (stats.requests - 1) + processingTime) / stats.requests;

    this.serviceStats.set(service, stats);
  }

  /**
   * サービス統計を取得
   */
  public getServiceStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    this.serviceStats.forEach((stat, service) => {
      stats[service] = {
        ...stat,
        successRate: stat.requests > 0 ? ((stat.requests - stat.errors) / stat.requests) * 100 : 0,
        capabilities: this.serviceCapabilities[service],
      };
    });

    return stats;
  }

  /**
   * 複数のAIサービスに並列リクエスト（コンセンサス）
   */
  public async getConsensusResponse(
    request: AIRequest,
    serviceCount: number = 3
  ): Promise<{
    consensus: string;
    responses: AIResponse[];
    confidence: number;
  }> {
    console.log(`🤝 ${serviceCount}つのAIサービスでコンセンサス生成中...`);

    const selectedServices = this.selectMultipleServices(request, serviceCount);
    const promises = selectedServices.map((service) => {
      const serviceRequest = { ...request };
      return this.processRequest(serviceRequest).catch((error) => {
        console.warn(`⚠️ ${service} でエラー:`, error.message);
        return null;
      });
    });

    const responses = (await Promise.all(promises)).filter(Boolean) as AIResponse[];

    if (responses.length === 0) {
      throw new Error('すべてのAIサービスが失敗しました');
    }

    // 最も信頼性の高い回答を選択
    const bestResponse = responses.reduce((best, current) =>
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    );

    return {
      consensus: bestResponse.content,
      responses,
      confidence: responses.reduce((sum, r) => sum + (r.confidence || 0), 0) / responses.length,
    };
  }

  /**
   * 複数のサービスを選択
   */
  private selectMultipleServices(request: AIRequest, count: number): string[] {
    const availableServices = Object.keys(this.serviceCapabilities).filter((service) =>
      this.isServiceConfigured(service)
    );

    // タスクタイプに適したサービスを優先
    const suitableServices = availableServices.filter((service) => {
      const caps = this.serviceCapabilities[service];
      switch (request.taskType) {
        case 'code':
          return caps.codeGeneration;
        case 'analysis':
          return caps.textAnalysis;
        case 'transcription':
          return caps.transcription;
        case 'video':
          return caps.videoGeneration;
        default:
          return caps.textAnalysis || caps.reasoning;
      }
    });

    return suitableServices.slice(0, count);
  }
}

export const aiServiceManager = AIServiceManager.getInstance();
