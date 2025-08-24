// src/services/ai/AdvancedAIService.ts
import { Todo, NewTodo, TodoAnalysisSummary } from '@/types/todo';
import AIHistoryService from './AIHistoryService';
import { ENV } from '@/utils/env';
import {
  AIProvider,
  ProviderName,
  OpenAIChatCompletionResponse,
  AnthropicMessageResponse,
} from '@/types/ai';

// 空実装のプロバイダー（将来の拡張用）
export class PlaceholderAIProvider implements AIProvider {
  name: ProviderName;
  model: string;
  apiKey: string;

  constructor(name: ProviderName, model = 'auto', apiKey = '') {
    this.name = name;
    this.model = model;
    this.apiKey = apiKey;
  }
}

export interface AIAnalysisResult {
  taskSuggestions: Array<{
    task: string;
    type: 'input' | 'output';
    priority: number;
    estimatedDuration: number;
    reason: string;
  }>;
  productivityInsights: string[];
  focusAreas: string[];
  timeOptimizations: Array<{
    timeSlot: string;
    recommendation: string;
  }>;
  weeklyGoals: string[];
}

export interface TaskBreakdown {
  mainTask: string;
  subtasks: Array<{
    task: string;
    estimatedDuration: number;
    dependencies: string[];
  }>;
  totalDuration: number;
  complexity: 'low' | 'medium' | 'high';
}

class AdvancedAIService {
  private providers: Map<string, AIProvider>;
  private currentProvider: AIProvider | null = null;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // OpenAI 設定 (Vite env)
    const openaiKey = ENV.OPENAI_API_KEY();
    if (openaiKey) {
      this.providers.set('openai', {
        name: 'openai',
        model: 'gpt-4-turbo-preview',
        apiKey: openaiKey,
      });
    }

    // Anthropic 設定 (Vite env)
    const anthropicKey = ENV.ANTHROPIC_API_KEY();
    if (anthropicKey) {
      this.providers.set('anthropic', {
        name: 'anthropic',
        model: 'claude-3-opus-20240229',
        apiKey: anthropicKey,
      });
    }

    // デフォルトプロバイダー設定
    this.currentProvider = this.providers.get('openai') || this.providers.get('anthropic') || null;
  }

  async analyzeProductivity(
    todos: Todo[],
    summary: TodoAnalysisSummary
  ): Promise<AIAnalysisResult> {
    if (!this.currentProvider) {
      return this.generateLocalAnalysis(todos, summary);
    }

    try {
      const prompt = this.buildProductivityPrompt(todos, summary);
      const response = await this.callAIProvider(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.generateLocalAnalysis(todos, summary);
    }
  }

  async breakdownTask(taskDescription: string): Promise<TaskBreakdown> {
    if (!this.currentProvider) {
      return this.generateLocalTaskBreakdown(taskDescription);
    }

    try {
      const prompt = this.buildTaskBreakdownPrompt(taskDescription);
      const response = await this.callAIProvider(prompt);
      return this.parseTaskBreakdownResponse(response);
    } catch (error) {
      console.error('Task breakdown failed:', error);
      return this.generateLocalTaskBreakdown(taskDescription);
    }
  }

  async suggestNextTasks(completedTodos: Todo[], currentGoals: string[]): Promise<NewTodo[]> {
    if (!this.currentProvider) {
      return this.generateLocalTaskSuggestions(completedTodos, currentGoals);
    }

    try {
      const prompt = this.buildTaskSuggestionPrompt(completedTodos, currentGoals);
      const response = await this.callAIProvider(prompt);
      return this.parseTaskSuggestions(response);
    } catch (error) {
      console.error('Task suggestion failed:', error);
      return this.generateLocalTaskSuggestions(completedTodos, currentGoals);
    }
  }

  private async callAIProvider(prompt: string): Promise<string> {
    if (!this.currentProvider) {
      throw new Error('No AI provider configured');
    }

    if (this.currentProvider.name === 'openai') {
      return this.callOpenAI(prompt);
    } else if (this.currentProvider.name === 'anthropic') {
      return this.callAnthropic(prompt);
    }

    throw new Error('Unknown AI provider');
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const startedAt = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.currentProvider!.apiKey}`,
      },
      body: JSON.stringify({
        model: this.currentProvider!.model,
        messages: [
          {
            role: 'system',
            content: 'You are a productivity expert helping users optimize their task management.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }
    const data: OpenAIChatCompletionResponse = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    try {
      await AIHistoryService.saveInteraction({
        provider: 'openai',
        model: this.currentProvider!.model,
        request: { prompt },
        response: { text, raw: data as unknown },
        createdAt: startedAt,
        durationMs: Date.now() - startedAt,
        context: { feature: 'AdvancedAIService.callOpenAI' },
      });
    } catch (e) {
      // Logging must not break user flow
      console.debug('AI history save (openai) skipped:', (e as Error).message);
    }
    return text;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const startedAt = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.currentProvider!.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.currentProvider!.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed: ${response.status}`);
    }
    const data: AnthropicMessageResponse = await response.json();
    const text = data?.content?.[0]?.text ?? '';
    try {
      await AIHistoryService.saveInteraction({
        provider: 'anthropic',
        model: this.currentProvider!.model,
        request: { prompt },
        response: { text, raw: data as unknown },
        createdAt: startedAt,
        durationMs: Date.now() - startedAt,
        context: { feature: 'AdvancedAIService.callAnthropic' },
      });
    } catch (e) {
      console.debug('AI history save (anthropic) skipped:', (e as Error).message);
    }
    return text;
  }

  private buildProductivityPrompt(todos: Todo[], summary: TodoAnalysisSummary): string {
    const recentTasks = todos
      .slice(0, 5)
      .map((t) => `- ${t.task} (${t.type})`)
      .join('\n');

    return `
タスク管理データの分析:
- 完了タスク数: ${summary.totalCompleted}
- 平均完了時間: ${summary.averageCompletionTime}分
- インプット/アウトプット比率: ${summary.inputOutputRatio}
- 最も生産的な時間帯: ${summary.mostProductiveTime}
- 期限内完了率: ${summary.deadlineMeetRate}%

最近のタスク:
${recentTasks}

以下の形式でJSONレスポンスを生成してください:
{
  "taskSuggestions": [...],
  "productivityInsights": [...],
  "focusAreas": [...],
  "timeOptimizations": [...],
  "weeklyGoals": [...]
}
`;
  }

  private buildTaskBreakdownPrompt(taskDescription: string): string {
    return `
タスク: "${taskDescription}"

このタスクを実行可能なサブタスクに分解し、以下の形式でJSONレスポンスを生成してください:
{
  "mainTask": "...",
  "subtasks": [...],
  "totalDuration": 数値,
  "complexity": "low|medium|high"
}
`;
  }

  private buildTaskSuggestionPrompt(completedTodos: Todo[], currentGoals: string[]): string {
    const recentTasks = completedTodos
      .slice(0, 10)
      .map((t) => t.task)
      .join(', ');
    const goals = currentGoals.join(', ');

    return `
最近完了したタスク: ${recentTasks}
現在の目標: ${goals}

次に取り組むべきタスクを5つ提案してください。JSONフォーマットで返してください。
`;
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      return JSON.parse(response);
    } catch {
      return this.generateLocalAnalysis([], {} as TodoAnalysisSummary);
    }
  }

  private parseTaskBreakdownResponse(response: string): TaskBreakdown {
    try {
      return JSON.parse(response);
    } catch {
      return this.generateLocalTaskBreakdown('');
    }
  }

  private parseTaskSuggestions(response: string): NewTodo[] {
    try {
      const data = JSON.parse(response);
      return data.suggestions || [];
    } catch {
      return [];
    }
  }

  private generateLocalAnalysis(todos: Todo[], summary: TodoAnalysisSummary): AIAnalysisResult {
    // ローカル分析では基本的な推奨事項を生成
    const hasHighPriorityTasks = todos.some((t) => t.priority >= 4);
    const inputCount = todos.filter((t) => t.type === 'input').length;
    const outputCount = todos.filter((t) => t.type === 'output').length;

    const insights: string[] = [];

    if (summary.completionRate > 80) {
      insights.push('優れた完了率を維持しています');
    }

    if (inputCount > outputCount * 2) {
      insights.push('インプット過多の傾向があります。アウトプットを増やしましょう');
    }

    return {
      taskSuggestions: [
        {
          task: hasHighPriorityTasks ? '優先度の高いタスクを確認' : '週次レビューを実施',
          type: 'output',
          priority: 4,
          estimatedDuration: 30,
          reason: '定期的な振り返りで生産性向上',
        },
      ],
      productivityInsights: insights,
      focusAreas: ['優先度の高いタスクへの集中', '定期的な休憩の確保'],
      timeOptimizations: [
        {
          timeSlot: '14:00-15:00',
          recommendation: '集中力が下がる時間帯。軽いタスクや休憩を推奨',
        },
      ],
      weeklyGoals: ['重要タスクを3つ完了する', '新しいスキルを1つ習得する'],
    };
  }

  private generateLocalTaskBreakdown(taskDescription: string): TaskBreakdown {
    const complexity =
      taskDescription.length > 50 ? 'high' : taskDescription.length > 20 ? 'medium' : 'low';

    return {
      mainTask: taskDescription,
      subtasks: [
        {
          task: '計画立案',
          estimatedDuration: 15,
          dependencies: [],
        },
        {
          task: '実行',
          estimatedDuration: complexity === 'high' ? 120 : 60,
          dependencies: ['計画立案'],
        },
        {
          task: 'レビュー',
          estimatedDuration: 15,
          dependencies: ['実行'],
        },
      ],
      totalDuration: complexity === 'high' ? 150 : 90,
      complexity,
    };
  }

  private generateLocalTaskSuggestions(completedTodos: Todo[], currentGoals: string[]): NewTodo[] {
    const suggestions: NewTodo[] = [];

    // 完了タスクの傾向を分析
    const recentTypes = completedTodos.slice(0, 5).map((t) => t.type);
    const needsMoreOutput = recentTypes.filter((t) => t === 'input').length > 3;

    if (needsMoreOutput) {
      suggestions.push({
        task: '学んだことをブログ記事にまとめる',
        type: 'output',
        priority: 4,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // 目標に基づく提案
    if (currentGoals.length > 0) {
      suggestions.push({
        task: `${currentGoals[0]}に向けた次のステップを計画`,
        type: 'output',
        priority: 5,
      });
    }

    // デフォルトの提案
    suggestions.push(
      {
        task: '週次計画の見直し',
        type: 'output',
        priority: 4,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        task: '新しいスキルの学習時間を確保',
        type: 'input',
        priority: 3,
      }
    );

    return suggestions.slice(0, 5);
  }

  switchProvider(providerName: string): boolean {
    const provider = this.providers.get(providerName);
    if (provider) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  getCurrentProvider(): AIProvider | null {
    return this.currentProvider;
  }

  getAvailableProviders(): ProviderName[] {
    return Array.from(this.providers.keys()) as ProviderName[];
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.currentProvider) {
      throw new Error('AIプロバイダーが設定されていません');
    }

    try {
      if (this.currentProvider.name === 'openai') {
        return await this.callOpenAI(prompt);
      } else if (this.currentProvider.name === 'anthropic') {
        return await this.callAnthropic(prompt);
      } else {
        throw new Error(`サポートされていないプロバイダー: ${this.currentProvider.name}`);
      }
    } catch (error) {
      console.error('AI応答生成エラー:', error);
      throw error;
    }
  }
}

export default new AdvancedAIService();
