import { TodoItem } from '@/types';
import { getEnv, isDev } from '@/utils/env';

/**
 * Anthropic Claude API Service
 * Provides comprehensive AI features using Claude models
 */

// 環境変数取得のヘルパー（getEnvのラッパー）
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return getEnv(key) || defaultValue;
};

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
  // Use local API server in development, relative path in production
  private baseUrl = isDev()
    ? 'http://localhost:3001/api/ai/anthropic' // Local API server (same as other APIs)
    : '/api/ai/anthropic'; // Vercel Functions in production
  private conversationHistory: Map<string, AnthropicMessage[]> = new Map();

  /**
   * JSONコメントを除去してパースする
   */
  private cleanAndParseJson(jsonString: string): any {
    try {
      // JSONコメントを除去（//で始まる行と/* */形式のコメント）
      let cleanJson = jsonString
        .replace(/\/\*[\s\S]*?\*\//g, '') // /* */ 形式のコメントを除去
        .replace(/\/\/.*$/gm, ''); // // 形式のコメントを除去

      // 不正な配列要素（プレースホルダーテキスト）を除去
      // 例: [完了済みタスクのID...] のような不正な要素を削除
      cleanJson = cleanJson.replace(/,?\s*\[[^\]]*?\.\.\.[^\]]*?\]/g, '');

      // 配列の末尾のカンマを除去
      cleanJson = cleanJson.replace(/,(\s*[\]}])/g, '$1');

      // 連続するカンマを単一のカンマに置換
      cleanJson = cleanJson.replace(/,+/g, ',');

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Failed to parse JSON:', error, 'Original:', jsonString);

      // パースエラーの場合、基本的な構造を返す
      return {
        sortedTaskIds: [],
        reasoning: 'JSONパースエラーのため、デフォルトの順序を使用します。',
        recommendations: [],
      };
    }
  }

  constructor() {
    this.config = {
      apiKey:
        getEnvVar('VITE_ANTHROPIC_API_KEY', '') ||
        // Backward-compat: some envs use VITE_CLAUDE_API_KEY
        getEnvVar('VITE_CLAUDE_API_KEY', ''),
      model: getEnvVar('VITE_ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
      maxTokens: parseInt(getEnvVar('VITE_ANTHROPIC_MAX_TOKENS', '8192')),
      temperature: 0.7,
      topP: 0.95,
    };

    // Note: Client does not require exposing the API key when using the proxy endpoint.
    // Avoid noisy warnings that confuse users who have keys configured on the server.
    // In development, show a gentle info once if neither key is present.
    if (!this.config.apiKey && isDev()) {
      console.info(
        'Anthropic client key not found (VITE_ANTHROPIC_API_KEY or VITE_CLAUDE_API_KEY). Using proxy auth.'
      );
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

      // Parse the JSON response (コメントを除去してからパース)
      const result = this.cleanAndParseJson(content);

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
      const result = this.cleanAndParseJson(content);

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
      const result = this.cleanAndParseJson(content);

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
      const result = this.cleanAndParseJson(content);

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

  /**
   * タスクの最適な実行順序を決定
   */
  async optimizeTaskOrder(tasks: TodoItem[]): Promise<{
    sortedTasks: TodoItem[];
    reasoning: string;
    recommendations: string[];
  }> {
    if (!tasks || tasks.length === 0) {
      return {
        sortedTasks: [],
        reasoning: 'タスクがありません。',
        recommendations: [],
      };
    }

    // タスク数が多すぎる場合は、未完了タスクを優先して制限
    const MAX_TASKS_FOR_ANALYSIS = 30;
    let tasksToAnalyze = tasks;

    if (tasks.length > MAX_TASKS_FOR_ANALYSIS) {
      // 未完了タスクと完了済みタスクを分ける
      const incompleteTasks = tasks.filter((t) => !t.completed);
      const completedTasks = tasks.filter((t) => t.completed);

      // 未完了タスクを優先度でソート
      incompleteTasks.sort((a, b) => b.priority - a.priority);

      // 最大数まで取得（未完了を優先）
      tasksToAnalyze = [
        ...incompleteTasks.slice(0, MAX_TASKS_FOR_ANALYSIS),
        ...completedTasks.slice(0, Math.max(0, MAX_TASKS_FOR_ANALYSIS - incompleteTasks.length)),
      ];

      console.log(
        `⚠️ タスク数が多いため、${tasksToAnalyze.length}件に制限して分析します（全${tasks.length}件中）`
      );
    }

    const systemPrompt = `あなたは生産性の専門家です。タスクリストを分析し、最も効率的な実行順序を決定してください。

以下の要因を考慮してください：
1. 優先度（1-5、5が最高）
2. 締切日時
3. タスクの種類（input/output）
4. 完了状態
5. 依存関係（推測）
6. 認知負荷
7. タスクのバッチング（似たタスクをグループ化）

重要な注意事項：
- sortedTaskIdsには実際のタスクIDのみを含めてください
- プレースホルダーや省略記号（...）は使用しないでください
- すべてのタスクIDを具体的にリストアップしてください
- タスク数が多い場合でも、すべてのIDを含めてください

レスポンスは以下の厳密なJSON形式で返してください（コメントは含めないでください）：
{
  "sortedTaskIds": ["task_id_1", "task_id_2", ...],
  "reasoning": "並び替えの理由",
  "recommendations": ["推奨事項1", "推奨事項2", ...]
}`;

    const tasksInfo = tasksToAnalyze.map((t) => ({
      id: t._id,
      task: t.task,
      priority: t.priority,
      completed: t.completed,
      deadline: t.deadline,
      type: t.type,
      category: t.category,
    }));

    const message = `以下のタスクリストを最適な実行順序に並び替えてください：
    
${JSON.stringify(tasksInfo, null, 2)}

未完了のタスクを優先し、完了済みのタスクは最後に配置してください。`;

    try {
      const response = await this.makeRequest([
        {
          role: 'user',
          content: `${systemPrompt}\n\n${message}`,
        },
      ]);

      const content = response.content[0]?.text || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        // JSONコメントを除去してパース
        const result = this.cleanAndParseJson(jsonMatch[0]);

        // IDに基づいてタスクを並び替え
        const sortedTasks: TodoItem[] = [];
        const allTaskMap = new Map(tasks.map((t) => [t._id, t])); // すべてのタスクのマップ
        const analyzedTaskIds = new Set(tasksToAnalyze.map((t) => t._id)); // 分析されたタスクのID

        // 分析結果に基づいて並び替え
        for (const id of result.sortedTaskIds || []) {
          const task = allTaskMap.get(id);
          if (task) {
            sortedTasks.push(task);
            allTaskMap.delete(id);
          }
        }

        // 分析されなかったタスクを追加（元の順序を維持）
        tasks.forEach((task) => {
          if (!analyzedTaskIds.has(task._id) && allTaskMap.has(task._id)) {
            sortedTasks.push(task);
            allTaskMap.delete(task._id);
          }
        });

        // まだ含まれていないタスクがあれば最後に追加
        allTaskMap.forEach((task) => sortedTasks.push(task));

        return {
          sortedTasks,
          reasoning: result.reasoning || '優先度と締切に基づいて並び替えました。',
          recommendations: result.recommendations || [],
        };
      }
    } catch (error) {
      console.error('Failed to optimize task order:', error);
    }

    // エラー時は元の順序を維持（未完了を先に、完了済みを後に）
    const incompleteTasks = tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        // 優先度で降順ソート
        if (a.priority !== b.priority) return b.priority - a.priority;
        // 締切でソート
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
      });

    const completedTasks = tasks.filter((t) => t.completed);

    return {
      sortedTasks: [...incompleteTasks, ...completedTasks],
      reasoning: 'デフォルトの優先度と締切に基づいて並び替えました。',
      recommendations: ['高優先度のタスクから始めましょう', '締切の近いタスクに注意してください'],
    };
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();

// Export for use in other services
export default anthropicService;
