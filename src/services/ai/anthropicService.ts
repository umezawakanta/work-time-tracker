import { TodoItem } from '@/types';

/**
 * Anthropic Claude API Service
 * Provides comprehensive AI features using Claude models
 */

// Types and Interfaces
export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: string[];
  insights: string[];
  actionItems: string[];
  confidence: number;
}

export interface CodeGenerationRequest {
  description: string;
  language: string;
  framework?: string;
  requirements?: string[];
}

export interface CodeGenerationResult {
  code: string;
  explanation: string;
  dependencies?: string[];
  setupInstructions?: string;
}

export interface AIConversationContext {
  messages: AnthropicMessage[];
  taskContext?: TodoItem[];
  userPreferences?: Record<string, any>;
}

// Error classes
export class AnthropicError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AnthropicError';
  }
}

class AnthropicService {
  private config: AnthropicConfig;
  // Use the same origin for API calls (works in both dev and production)
  private baseUrl = '/api/ai/anthropic';
  private conversationHistory: Map<string, AnthropicMessage[]> = new Map();

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(import.meta.env.VITE_ANTHROPIC_MAX_TOKENS || '8192'),
      temperature: 0.7,
      topP: 0.95,
    };

    if (!this.config.apiKey) {
      console.warn('Anthropic API key not configured. AI features will be limited.');
    }
  }

  /**
   * Check if the service is properly configured
   * Since we're using a proxy, we always return true
   * The proxy will handle API key validation
   */
  isConfigured(): boolean {
    // The proxy handles API key configuration
    // So we always return true for client-side checks
    return true;
  }

  /**
   * Update API configuration
   */
  updateConfig(config: Partial<AnthropicConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Make a request to the Anthropic API via our proxy
   */
  private async makeRequest(messages: AnthropicMessage[]): Promise<AnthropicResponse> {
    // For the proxy, we don't need to check API key on client side
    // The proxy will handle it using server-side environment variables

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          messages,
          system: this.getSystemPrompt(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          throw new AnthropicError(
            'Rate limit exceeded. Please try again later.',
            'RATE_LIMIT',
            429,
            true
          );
        } else if (response.status === 401) {
          throw new AnthropicError('Invalid API key', 'INVALID_API_KEY', 401);
        } else if (response.status === 400) {
          throw new AnthropicError(errorData.error?.message || 'Bad request', 'BAD_REQUEST', 400);
        } else {
          throw new AnthropicError(
            `API request failed: ${response.statusText}`,
            'API_ERROR',
            response.status,
            response.status >= 500
          );
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AnthropicError) {
        throw error;
      }

      throw new AnthropicError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        undefined,
        true
      );
    }
  }

  /**
   * Get the system prompt for the AI
   */
  private getSystemPrompt(): string {
    return `You are an advanced AI assistant integrated into a Work Time Tracker application. 
    Your role is to help users manage their tasks, improve productivity, and provide intelligent insights.
    
    Key capabilities:
    - Task analysis and prioritization
    - Time estimation and planning
    - Code generation for development tasks
    - Workflow optimization suggestions
    - Natural language task processing
    
    Always be helpful, concise, and provide actionable advice. When analyzing tasks, consider:
    - User's work patterns and preferences
    - Task complexity and dependencies
    - Realistic time estimates
    - Productivity best practices
    
    Respond in the same language as the user's input (Japanese or English).`;
  }

  /**
   * Analyze tasks using AI
   */
  async analyzeTasks(tasks: TodoItem[]): Promise<AIAnalysisResult> {
    const prompt = `Analyze the following tasks and provide insights:
    
Tasks:
${tasks.map((t, i) => `${i + 1}. ${t.task} (Priority: ${t.priority}, Type: ${t.type})`).join('\n')}

Please provide:
1. A summary of the task list
2. Top 3-5 suggestions for optimization
3. Key insights about work patterns
4. Specific action items to improve productivity

Format the response as JSON with keys: summary, suggestions (array), insights (array), actionItems (array), confidence (0-1).`;

    const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

    try {
      const response = await this.makeRequest(messages);
      const content = response.content[0]?.text || '{}';

      // Parse the JSON response
      const result = JSON.parse(content);

      return {
        summary: result.summary || 'タスク分析を完了しました。',
        suggestions: result.suggestions || [],
        insights: result.insights || [],
        actionItems: result.actionItems || [],
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      console.error('Task analysis failed:', error);

      // Return a fallback response
      return {
        summary: 'タスク分析中にエラーが発生しました。',
        suggestions: ['タスクの優先度を見直してください'],
        insights: ['分析を完了できませんでした'],
        actionItems: ['後で再試行してください'],
        confidence: 0.3,
      };
    }
  }

  /**
   * Generate code based on description
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    const prompt = `Generate ${request.language} code for the following:

Description: ${request.description}
${request.framework ? `Framework: ${request.framework}` : ''}
${request.requirements?.length ? `Requirements:\n${request.requirements.map((r) => `- ${r}`).join('\n')}` : ''}

Please provide:
1. Complete, production-ready code
2. Brief explanation of the implementation
3. List of dependencies (if any)
4. Setup instructions (if needed)

Format the response with clear sections for: code, explanation, dependencies, and setupInstructions.`;

    const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

    try {
      const response = await this.makeRequest(messages);
      const content = response.content[0]?.text || '';

      // Parse the response (simplified parsing)
      const codeMatch = content.match(/```[\s\S]*?```/);
      const code = codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '') : '';

      return {
        code: code || '// Code generation failed',
        explanation:
          content.split('Explanation:')[1]?.split('\n\n')[0] || 'コード生成が完了しました。',
        dependencies: this.extractListFromText(content, 'Dependencies:'),
        setupInstructions: content.split('Setup:')[1]?.trim() || undefined,
      };
    } catch (error) {
      console.error('Code generation failed:', error);

      return {
        code: '// Error: Failed to generate code',
        explanation: 'コード生成中にエラーが発生しました。',
      };
    }
  }

  /**
   * Natural language task processing
   */
  async processNaturalLanguageTask(
    input: string,
    context?: TodoItem[]
  ): Promise<{
    intent: string;
    entities: Record<string, any>;
    suggestedTasks: Partial<TodoItem>[];
    response: string;
  }> {
    const prompt = `Process this natural language task input:
"${input}"

${context ? `Current tasks context:\n${context.map((t) => `- ${t.task}`).join('\n')}` : ''}

Analyze the input and provide:
1. Intent (what the user wants to do)
2. Entities (extracted information like dates, priorities, etc.)
3. Suggested task(s) to create
4. A helpful response message

Format as JSON with keys: intent, entities (object), suggestedTasks (array of task objects), response.`;

    const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

    try {
      const response = await this.makeRequest(messages);
      const content = response.content[0]?.text || '{}';
      const result = JSON.parse(content);

      return {
        intent: result.intent || 'create_task',
        entities: result.entities || {},
        suggestedTasks: result.suggestedTasks || [
          {
            task: input,
            priority: 3,
            type: 'input' as const,
          },
        ],
        response: result.response || 'タスクを理解しました。',
      };
    } catch (error) {
      console.error('Natural language processing failed:', error);

      return {
        intent: 'create_task',
        entities: {},
        suggestedTasks: [
          {
            task: input,
            priority: 3,
            type: 'input' as const,
          },
        ],
        response: '入力を処理しました。',
      };
    }
  }

  /**
   * Start or continue a conversation
   */
  async chat(
    message: string,
    conversationId: string = 'default',
    context?: TodoItem[]
  ): Promise<string> {
    // Get or create conversation history
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, []);
    }

    const history = this.conversationHistory.get(conversationId)!;

    // Add context if provided
    let contextMessage = '';
    if (context && context.length > 0) {
      contextMessage = `\n\nCurrent tasks context:\n${context.map((t) => `- ${t.task} (Priority: ${t.priority})`).join('\n')}`;
    }

    // Add user message to history
    history.push({ role: 'user', content: message + contextMessage });

    // Keep conversation history manageable (last 10 messages)
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    try {
      const response = await this.makeRequest(history);
      const assistantMessage =
        response.content[0]?.text || 'すみません、応答を生成できませんでした。';

      // Add assistant response to history
      history.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (error) {
      console.error('Chat failed:', error);

      if (error instanceof AnthropicError) {
        if (error.code === 'NOT_CONFIGURED') {
          return 'AIサービスが設定されていません。設定画面でAPIキーを入力してください。';
        } else if (error.code === 'RATE_LIMIT') {
          return 'レート制限に達しました。しばらくお待ちください。';
        }
      }

      return 'エラーが発生しました。後でもう一度お試しください。';
    }
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string = 'default'): void {
    this.conversationHistory.delete(conversationId);
  }

  /**
   * Get workflow optimization suggestions
   */
  async getWorkflowOptimization(
    tasks: TodoItem[],
    workPatterns?: any
  ): Promise<{
    optimizations: string[];
    automationOpportunities: string[];
    timeWasters: string[];
    focusAreas: string[];
  }> {
    const prompt = `Analyze this workflow and provide optimization suggestions:

Tasks:
${tasks.map((t) => `- ${t.task} (Priority: ${t.priority}, Completed: ${t.completed})`).join('\n')}

${workPatterns ? `Work Patterns:\n${JSON.stringify(workPatterns, null, 2)}` : ''}

Provide:
1. Workflow optimizations
2. Automation opportunities
3. Time-wasting activities to eliminate
4. Key focus areas

Format as JSON with keys: optimizations, automationOpportunities, timeWasters, focusAreas (all arrays).`;

    const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

    try {
      const response = await this.makeRequest(messages);
      const content = response.content[0]?.text || '{}';
      const result = JSON.parse(content);

      return {
        optimizations: result.optimizations || [],
        automationOpportunities: result.automationOpportunities || [],
        timeWasters: result.timeWasters || [],
        focusAreas: result.focusAreas || [],
      };
    } catch (error) {
      console.error('Workflow optimization failed:', error);

      return {
        optimizations: ['タスクの優先順位を定期的に見直す'],
        automationOpportunities: ['繰り返しタスクの自動化を検討'],
        timeWasters: ['不要な会議を削減'],
        focusAreas: ['重要度の高いタスクに集中'],
      };
    }
  }

  /**
   * Generate smart task templates
   */
  async generateTaskTemplate(
    category: string,
    description?: string
  ): Promise<{
    template: {
      name: string;
      tasks: Array<{
        title: string;
        description: string;
        estimatedMinutes: number;
        priority: number;
      }>;
    };
    customizationTips: string[];
  }> {
    const prompt = `Create a task template for: ${category}
${description ? `Description: ${description}` : ''}

Provide a comprehensive template with:
1. Template name
2. List of tasks with title, description, estimated time, and priority
3. Customization tips

Format as JSON with structure: { template: { name, tasks: [] }, customizationTips: [] }`;

    const messages: AnthropicMessage[] = [{ role: 'user', content: prompt }];

    try {
      const response = await this.makeRequest(messages);
      const content = response.content[0]?.text || '{}';
      const result = JSON.parse(content);

      return result;
    } catch (error) {
      console.error('Template generation failed:', error);

      return {
        template: {
          name: `${category} テンプレート`,
          tasks: [
            {
              title: `${category} - 計画`,
              description: '詳細な計画を立てる',
              estimatedMinutes: 30,
              priority: 1,
            },
            {
              title: `${category} - 実行`,
              description: 'メインタスクを実行',
              estimatedMinutes: 120,
              priority: 2,
            },
            {
              title: `${category} - レビュー`,
              description: '結果を確認・改善',
              estimatedMinutes: 30,
              priority: 3,
            },
          ],
        },
        customizationTips: ['必要に応じてタスクを追加・削除してください'],
      };
    }
  }

  /**
   * Helper method to extract lists from text
   */
  private extractListFromText(text: string, marker: string): string[] {
    const section = text.split(marker)[1]?.split('\n\n')[0];
    if (!section) return [];

    return section
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  }

  /**
   * Get available models
   */
  getAvailableModels(): Array<{ id: string; name: string; description: string }> {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: '最新の高性能モデル。複雑なタスクに最適。',
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: '最も高性能なモデル。高度な推論が必要なタスクに。',
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'バランスの取れたモデル。一般的なタスクに適しています。',
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: '高速で効率的。シンプルなタスクに最適。',
      },
    ];
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const messages: AnthropicMessage[] = [
        { role: 'user', content: 'Hello, testing connection.' },
      ];

      await this.makeRequest(messages);

      return {
        success: true,
        message: 'API接続に成功しました！',
      };
    } catch (error) {
      if (error instanceof AnthropicError) {
        return {
          success: false,
          message: `接続エラー: ${error.message}`,
        };
      }

      return {
        success: false,
        message: '接続テストに失敗しました。',
      };
    }
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();

// Export for use in other services
export default anthropicService;
