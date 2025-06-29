/**
 * 🤖 ライフサポートチャットAIサービス
 * Gemini、Claude、ChatGPTを使用して動的なライフサポートアドバイスを生成
 */

export interface LifeSupportContext {
  userStatus?: {
    level?: number;
    totalAssets?: number;
    savingsRate?: number;
    questCompleted?: boolean;
    streakDays?: number;
  };
  lifeStatus?: {
    bankBalance?: number;
    hasJob?: boolean;
    hasHome?: boolean;
    healthStatus?: 'good' | 'fair' | 'poor' | 'unknown';
    hasHealthInsurance?: boolean;
    anxietyLevel?: 'low' | 'medium' | 'high';
    depressionLevel?: 'low' | 'medium' | 'high';
    socialSupport?: 'strong' | 'moderate' | 'weak' | 'none';
  };
  conversationHistory?: string[];
  urgencyLevel?: 'normal' | 'urgent' | 'emergency';
}

export interface AIResponse {
  message: string;
  character: 'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester';
  type: 'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical';
  actions?: Array<{
    label: string;
    actionType: string;
  }>;
  confidence: number;
  source: 'gemini' | 'claude' | 'openai' | 'fallback';
}

class LifeSupportChatService {
  private static instance: LifeSupportChatService | null = null;
  private geminiApiKey: string | null = null;
  private claudeApiKey: string | null = null;
  private openaiApiKey: string | null = null;

  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;

    console.log('🤖 LifeSupportChatService initialized with APIs:', {
      gemini: !!this.geminiApiKey,
      claude: !!this.claudeApiKey,
      openai: !!this.openaiApiKey,
    });
  }

  public static getInstance(): LifeSupportChatService {
    if (!LifeSupportChatService.instance) {
      LifeSupportChatService.instance = new LifeSupportChatService();
    }
    return LifeSupportChatService.instance;
  }

  /**
   * メインのチャット応答生成
   */
  public async generateResponse(
    actionType: string,
    context: LifeSupportContext = {}
  ): Promise<AIResponse> {
    console.log(`🤖 Generating AI response for: ${actionType}`);

    try {
      // 緊急度に応じてAIプロバイダーを選択
      const preferredProvider = this.selectAIProvider(context.urgencyLevel);

      // プロンプトを生成
      const prompt = this.buildPrompt(actionType, context);

      // AI APIを呼び出し
      const response = await this.callAI(prompt, preferredProvider);

      // レスポンスを解析
      const parsedResponse = this.parseAIResponse(response, actionType);

      return parsedResponse;
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.generateFallbackResponse(actionType, context);
    }
  }

  /**
   * AIプロバイダーの選択
   */
  private selectAIProvider(urgencyLevel?: string): 'gemini' | 'claude' | 'openai' {
    // 緊急時はより信頼性の高いClaude/OpenAIを優先
    if (urgencyLevel === 'emergency') {
      if (this.claudeApiKey) return 'claude';
      if (this.openaiApiKey) return 'openai';
    }

    // 通常時はコスト効率の良いGeminiを優先
    if (this.geminiApiKey) return 'gemini';
    if (this.claudeApiKey) return 'claude';
    if (this.openaiApiKey) return 'openai';

    throw new Error('No AI API keys available');
  }

  /**
   * プロンプト構築
   */
  private buildPrompt(actionType: string, context: LifeSupportContext): string {
    const systemPrompt = `あなたは親切で優しいライフサポートAIです。
ユーザーの知能指数や社会適応能力に関係なく、誰でも理解できる言葉で丁寧にサポートしてください。

特に以下の点を重視してください：
- 具体的で実行可能なアドバイス
- 励ましと希望を与える言葉
- 緊急時は適切な連絡先の提供
- 段階的で簡単な手順の説明

キャラクター設定：
- king: 威厳がある王様（重要な決断時）
- sage: 優しい賢者（アドバイス・知識提供）
- merchant: 実用的な商人（お金・資産関連）
- guard: 頼れる衛兵（緊急時・安全関連）

回答は以下のJSON形式で返してください：
{
  "message": "ユーザーへのメッセージ（400文字以内）",
  "character": "king" | "sage" | "merchant" | "guard",
  "type": "advice" | "mission" | "celebration" | "warning",
  "actions": [{"label": "ボタンラベル", "actionType": "action-type"}],
  "confidence": 0.8
}`;

    const contextInfo = this.buildContextInfo(context);
    const actionPrompt = this.buildActionPrompt(actionType);

    return `${systemPrompt}

${contextInfo}

${actionPrompt}`;
  }

  /**
   * コンテキスト情報の構築
   */
  private buildContextInfo(context: LifeSupportContext): string {
    let contextInfo = '【ユーザーの状況】\n';

    if (context.userStatus) {
      const { level, totalAssets, savingsRate, streakDays } = context.userStatus;
      contextInfo += `- レベル: ${level || 1}\n`;
      contextInfo += `- 総資産: ${totalAssets ? this.formatAssets(totalAssets) : '不明'}\n`;
      contextInfo += `- 連続日数: ${streakDays || 0}日\n`;
    }

    if (context.lifeStatus) {
      const { bankBalance, hasJob, hasHome, healthStatus, anxietyLevel } = context.lifeStatus;
      contextInfo += `- 銀行残高: ${bankBalance !== undefined ? `${bankBalance.toLocaleString()}円` : '未確認'}\n`;
      contextInfo += `- 職業: ${hasJob ? 'あり' : hasJob === false ? 'なし' : '不明'}\n`;
      contextInfo += `- 住居: ${hasHome ? 'あり' : hasHome === false ? 'なし' : '不明'}\n`;
      contextInfo += `- 健康状態: ${healthStatus || '不明'}\n`;
      contextInfo += `- 不安レベル: ${anxietyLevel || '不明'}\n`;
    }

    return contextInfo;
  }

  /**
   * アクション別プロンプトの構築
   */
  private buildActionPrompt(actionType: string): string {
    const prompts: Record<string, string> = {
      'life-support': `
【リクエスト】総合的なライフサポートアドバイス
今何をすべきか迷っているユーザーに、基本的なことから始められる具体的なアドバイスを提供してください。
特に銀行残高の確認、基本的な生活スキル、メンタルヘルスケアについて触れてください。`,

      'daily-plan': `
【リクエスト】今日の行動プラン作成
ユーザーが今日何をすべきかを、朝・昼・夕・夜の時間帯別に具体的で実行可能な計画を提案してください。
各タスクに所要時間も含めてください。`,

      'emergency-help': `
【リクエスト】緊急時サポート情報
緊急時の対応方法を状況別（住居・お金・健康・メンタル）に整理して提供してください。
具体的な連絡先や手順を含めてください。`,

      'basic-needs': `
【リクエスト】基本的な生活ニーズ確認
住居・食事・お金・健康・基本スキルについて、現在の状況をチェックし、
不足している部分への対処法を提案してください。`,

      'mental-health': `
【リクエスト】メンタルヘルスサポート
心のケアに関するアドバイスを提供してください。
今すぐできること、対処法、専門的なサポートについて説明してください。`,

      'skill-building': `
【リクエスト】基本スキル習得アドバイス
料理、お金の管理、インターネットの使い方など、
生活に必要な基本スキルの習得方法を初心者向けに説明してください。`,

      advice: `
【リクエスト】一般的なライフアドバイス
ユーザーの現在の状況に基づいて、適切なアドバイスを提供してください。`,

      status: `
【リクエスト】現状確認
ユーザーの現在の状況を整理し、良い点と改善点を指摘してください。`,
    };

    return prompts[actionType] || prompts['advice'];
  }

  /**
   * AI API呼び出し
   */
  private async callAI(prompt: string, provider: 'gemini' | 'claude' | 'openai'): Promise<string> {
    switch (provider) {
      case 'gemini':
        return this.callGeminiAPI(prompt);
      case 'claude':
        return this.callClaudeAPI(prompt);
      case 'openai':
        return this.callOpenAIAPI(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Gemini API呼び出し
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not available');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Claude API呼び出し
   */
  private async callClaudeAPI(prompt: string): Promise<string> {
    if (!this.claudeApiKey) {
      throw new Error('Claude API key not available');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * OpenAI API呼び出し
   */
  private async callOpenAIAPI(prompt: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not available');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * AI応答の解析
   */
  private parseAIResponse(aiResponse: string, actionType: string): AIResponse {
    try {
      // JSON部分を抽出
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message,
          character: parsed.character || this.getDefaultCharacter(actionType),
          type: parsed.type || this.getDefaultType(actionType),
          actions: parsed.actions || [],
          confidence: parsed.confidence || 0.8,
          source: 'gemini', // 実際の使用されたプロバイダーを設定
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // JSON解析に失敗した場合は、テキストをそのまま使用
    return {
      message: aiResponse.slice(0, 400), // 長すぎる場合は切り詰め
      character: this.getDefaultCharacter(actionType),
      type: this.getDefaultType(actionType),
      actions: [],
      confidence: 0.6,
      source: 'fallback',
    };
  }

  /**
   * フォールバック応答の生成
   */
  private generateFallbackResponse(actionType: string, context: LifeSupportContext): AIResponse {
    const fallbackMessages: Record<string, string> = {
      'life-support': `🤗 こんにちは！あなたの人生をサポートする賢者です。

まずは基本的なことから確認してみましょう：
1. 💰 銀行口座の残高を確認する
2. 🏠 安全な住む場所があるか確認する
3. 🏥 健康保険に加入しているか確認する
4. 🍳 簡単な料理ができるか確認する

一つずつ、あなたのペースで進んでいきましょう！`,

      'daily-plan': `🌅 今日の行動プランをお手伝いします！

【朝】
- 顔を洗って歯を磨く（5分）
- 水を一杯飲む（1分）

【昼】
- 銀行口座の残高を確認する（15分）
- このサイトに記録する（5分）

【夜】
- 今日頑張ったことを思い出す（5分）
- 深呼吸を3回する（3分）

無理をしないで、できることから始めましょう！`,

      'emergency-help': `🚨 緊急時のサポート情報です！

【生命に危険】🚑 119番 / 🚓 110番
【住居なし】🏛️ 市役所で「生活保護相談」
【お金なし】🏛️ 市役所の福祉窓口
【心が辛い】📞 いのちの電話: 0570-783-556

あなたは一人じゃありません。必ず助けてくれる人がいます！`,
    };

    return {
      message: fallbackMessages[actionType] || fallbackMessages['life-support'],
      character: this.getDefaultCharacter(actionType),
      type: this.getDefaultType(actionType),
      actions: [
        { label: '詳しく教えて', actionType: 'advice' },
        { label: '今日の計画', actionType: 'daily-plan' },
      ],
      confidence: 0.5,
      source: 'fallback',
    };
  }

  /**
   * デフォルトキャラクター取得
   */
  private getDefaultCharacter(actionType: string): 'king' | 'sage' | 'merchant' | 'guard' {
    const characterMap: Record<string, 'king' | 'sage' | 'merchant' | 'guard'> = {
      'life-support': 'sage',
      'daily-plan': 'king',
      'emergency-help': 'guard',
      'basic-needs': 'sage',
      'mental-health': 'sage',
      'skill-building': 'merchant',
      advice: 'sage',
      status: 'guard',
    };

    return characterMap[actionType] || 'sage';
  }

  /**
   * デフォルトタイプ取得
   */
  private getDefaultType(actionType: string): 'advice' | 'mission' | 'celebration' | 'warning' {
    const typeMap: Record<string, 'advice' | 'mission' | 'celebration' | 'warning'> = {
      'life-support': 'advice',
      'daily-plan': 'mission',
      'emergency-help': 'warning',
      'basic-needs': 'advice',
      'mental-health': 'advice',
      'skill-building': 'advice',
      advice: 'advice',
      status: 'advice',
    };

    return typeMap[actionType] || 'advice';
  }

  /**
   * 資産フォーマット
   */
  private formatAssets(amount: number): string {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}億円`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万円`;
    return `${amount.toLocaleString()}円`;
  }
}

export const lifeSupportChatService = LifeSupportChatService.getInstance();
