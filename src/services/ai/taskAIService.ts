import { TodoItem } from '@/types';

// Rate limiting interface
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfter?: number;
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

class RateLimiter {
  private state: RateLimitState = { requests: [], lastReset: Date.now() };

  constructor(private config: RateLimitConfig) {}

  canMakeRequest(): boolean {
    const now = Date.now();

    // Reset window if expired
    if (now - this.state.lastReset > this.config.windowMs) {
      this.state = { requests: [], lastReset: now };
    }

    // Remove old requests outside window
    this.state.requests = this.state.requests.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    return this.state.requests.length < this.config.maxRequests;
  }

  recordRequest(): void {
    this.state.requests.push(Date.now());
  }

  getTimeUntilReset(): number {
    const now = Date.now();
    const windowEnd = this.state.lastReset + this.config.windowMs;
    return Math.max(0, windowEnd - now);
  }
}

// Error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class RateLimitError extends AIServiceError {
  constructor(retryAfter: number) {
    super(
      `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
      'RATE_LIMIT_EXCEEDED',
      true,
      retryAfter
    );
  }
}

export class QuotaExceededError extends AIServiceError {
  constructor() {
    super(
      'AI service quota exceeded. Please try again later.',
      'QUOTA_EXCEEDED',
      true,
      3600000 // 1 hour
    );
  }
}

export class NetworkError extends AIServiceError {
  constructor(originalError: Error) {
    super(
      `Network error: ${originalError.message}`,
      'NETWORK_ERROR',
      true,
      5000 // 5 seconds
    );
  }
}

export interface AITaskSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  originalTaskId: string;
  suggestedChanges: any;
}

export interface TaskTimeEstimate {
  taskId: string;
  estimatedMinutes: number;
  confidence: number;
  factors: string[];
}

export interface TaskGroup {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  category: string;
  priority: number;
}

export interface TaskBreakdown {
  id: string;
  originalTaskId: string;
  originalTaskTitle: string;
  reasoning: string;
  confidence: number;
  subtasks: SubTask[];
  estimatedTotalTime: number;
  difficulty: 'low' | 'medium' | 'high';
}

export interface SubTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  estimatedMinutes: number;
  dependencies: string[]; // 他のサブタスクのIDへの依存関係
  category: string;
  type: 'input' | 'output';
  tags: string[];
}

class TaskAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.anthropic.com/v1'; // または適切なAI API URL
  private rateLimiter: RateLimiter;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second base delay

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

    // Rate limiting: 10 requests per minute
    this.rateLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 60000, // 1 minute
    });
  }

  // Enhanced retry logic with exponential backoff
  private async withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Check rate limit
        if (!this.rateLimiter.canMakeRequest()) {
          const timeUntilReset = this.rateLimiter.getTimeUntilReset();
          throw new RateLimitError(timeUntilReset);
        }

        // Record the request
        this.rateLimiter.recordRequest();

        // Execute operation
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry for non-retryable errors
        if (error instanceof AIServiceError && !error.retryable) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.retryAttempts) {
          break;
        }

        // Calculate exponential backoff delay
        const delay = this.retryDelay * Math.pow(2, attempt - 1);

        console.warn(
          `AI operation "${context}" failed (attempt ${attempt}/${this.retryAttempts}). Retrying in ${delay}ms...`,
          error
        );

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    if (lastError instanceof AIServiceError) {
      throw lastError;
    }

    throw new AIServiceError(
      `AI operation "${context}" failed after ${this.retryAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
      'MAX_RETRIES_EXCEEDED',
      false
    );
  }

  // Enhanced API call with proper error handling
  private async callAI(prompt: string, context: string = 'AI request'): Promise<string> {
    if (!this.apiKey) {
      console.warn('No AI API key configured, using mock response');
      return this.getMockResponse(prompt);
    }

    return await this.withRetry(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('retry-after') || '60') * 1000;
            throw new RateLimitError(retryAfter);
          } else if (response.status === 402) {
            throw new QuotaExceededError();
          } else if (response.status >= 500) {
            throw new NetworkError(new Error(`Server error: ${response.status}`));
          } else {
            throw new AIServiceError(
              `API request failed: ${response.status} ${response.statusText}`,
              'API_ERROR',
              false
            );
          }
        }

        const data = await response.json();
        return data.content[0]?.text || '';
      } catch (error) {
        if (error instanceof AIServiceError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError(error);
        }

        throw new AIServiceError(
          `Unexpected error during AI request: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'UNEXPECTED_ERROR',
          true
        );
      }
    }, context);
  }

  // Mock response for testing/fallback
  private getMockResponse(prompt: string): string {
    if (prompt.includes('priority')) {
      return 'Mock priority suggestions based on task complexity and deadlines.';
    } else if (prompt.includes('time')) {
      return 'Mock time estimates based on task type and historical data.';
    } else if (prompt.includes('group')) {
      return 'Mock task grouping suggestions based on similarity and context.';
    }
    return 'Mock AI response for enhanced user experience.';
  }

  // Enhanced task priority suggestion with error handling
  async suggestTaskPriority(tasks: TodoItem[]): Promise<AITaskSuggestion[]> {
    try {
      const prompt = this.createPriorityPrompt(tasks);
      const response = await this.callAI(prompt, 'Priority Suggestion');
      return this.parsePrioritySuggestions(response, tasks);
    } catch (error) {
      console.error('Priority suggestion failed:', error);

      if (error instanceof AIServiceError) {
        // Use fallback for retryable errors
        if (error.retryable) {
          return this.mockPrioritySuggestions(tasks);
        }
        throw error;
      }

      return this.mockPrioritySuggestions(tasks);
    }
  }

  // Enhanced time estimation with error handling
  async estimateTaskDuration(tasks: TodoItem[]): Promise<TaskTimeEstimate[]> {
    try {
      const prompt = this.createTimeEstimatePrompt(tasks);
      const response = await this.callAI(prompt, 'Time Estimation');
      return this.parseTimeEstimates(response, tasks);
    } catch (error) {
      console.error('Time estimation failed:', error);

      if (error instanceof AIServiceError) {
        if (error.retryable) {
          return this.mockTimeEstimates(tasks);
        }
        throw error;
      }

      return this.mockTimeEstimates(tasks);
    }
  }

  // Enhanced task grouping with error handling
  async groupSimilarTasks(tasks: TodoItem[]): Promise<TaskGroup[]> {
    try {
      const prompt = this.createGroupingPrompt(tasks);
      const response = await this.callAI(prompt, 'Task Grouping');
      return this.parseTaskGroups(response, tasks);
    } catch (error) {
      console.error('Task grouping failed:', error);

      if (error instanceof AIServiceError) {
        if (error.retryable) {
          return this.mockTaskGroups(tasks);
        }
        throw error;
      }

      return this.mockTaskGroups(tasks);
    }
  }

  // Enhanced task breakdown with error handling
  async breakdownLargeTask(task: TodoItem): Promise<TaskBreakdown | null> {
    try {
      const prompt = this.createBreakdownPrompt(task);
      const response = await this.callAI(prompt, 'Task Breakdown');
      return this.parseTaskBreakdown(response, task);
    } catch (error) {
      console.error('Task breakdown failed:', error);

      if (error instanceof AIServiceError) {
        if (error.retryable) {
          return this.mockTaskBreakdown(task);
        }
        throw error;
      }

      return this.mockTaskBreakdown(task);
    }
  }

  // Enhanced comprehensive analysis with error handling
  async analyzeTasksComprehensively(todos: any[]): Promise<{
    prioritySuggestions: AITaskSuggestion[];
    timeEstimates: TaskTimeEstimate[];
    taskGroups: TaskGroup[];
    recommendations: string[];
  }> {
    try {
      // Execute in parallel with individual error handling
      const results = await Promise.allSettled([
        this.suggestTaskPriority(todos),
        this.estimateTaskDuration(todos),
        this.groupSimilarTasks(todos),
      ]);

      const prioritySuggestions = results[0].status === 'fulfilled' ? results[0].value : [];
      const timeEstimates = results[1].status === 'fulfilled' ? results[1].value : [];
      const taskGroups = results[2].status === 'fulfilled' ? results[2].value : [];

      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['Priority Suggestion', 'Time Estimation', 'Task Grouping'];
          console.warn(`${operations[index]} failed:`, result.reason);
        }
      });

      const recommendations = this.generateRecommendations(
        todos,
        prioritySuggestions,
        timeEstimates,
        taskGroups
      );

      return {
        prioritySuggestions,
        timeEstimates,
        taskGroups,
        recommendations,
      };
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);

      // Return minimal viable result
      return {
        prioritySuggestions: [],
        timeEstimates: [],
        taskGroups: [],
        recommendations: ['AI分析が一時的に利用できません。後でもう一度お試しください。'],
      };
    }
  }

  // Existing mock and helper methods remain the same...
  private mockPrioritySuggestions(tasks: TodoItem[]): AITaskSuggestion[] {
    return tasks.slice(0, 3).map((task, index) => ({
      id: `mock-priority-${index}`,
      type: 'priority',
      title: `${task.task}の優先度調整`,
      description: `このタスクの優先度を${task.priority > 3 ? '上げる' : '下げる'}ことを推奨します。`,
      confidence: 0.7 + Math.random() * 0.2,
      originalTaskId: task._id,
      suggestedChanges: {
        priority:
          task.priority > 3 ? Math.max(1, task.priority - 1) : Math.min(5, task.priority + 1),
      },
    }));
  }

  private mockTimeEstimates(tasks: TodoItem[]): TaskTimeEstimate[] {
    return tasks.map((task) => ({
      taskId: task._id,
      estimatedMinutes: 30 + Math.floor(Math.random() * 120),
      confidence: 0.6 + Math.random() * 0.3,
      factors: ['タスクの複雑さ', '過去の類似タスク', '優先度レベル'],
    }));
  }

  private mockTaskGroups(tasks: TodoItem[]): TaskGroup[] {
    const groups = [];
    const groupSize = Math.min(3, Math.ceil(tasks.length / 3));

    for (let i = 0; i < tasks.length; i += groupSize) {
      const groupTasks = tasks.slice(i, i + groupSize);
      groups.push({
        id: `mock-group-${i}`,
        name: `関連タスクグループ ${Math.floor(i / groupSize) + 1}`,
        description: '類似した特徴を持つタスクのグループです。',
        taskIds: groupTasks.map((t) => t._id),
        category: 'similar',
        priority: Math.max(...groupTasks.map((t) => t.priority)),
      });
    }

    return groups;
  }

  private mockTaskBreakdown(task: TodoItem): TaskBreakdown | null {
    if (task.task.length < 20) return null;

    return {
      id: `mock-breakdown-${task._id}`,
      originalTaskId: task._id,
      originalTaskTitle: task.task,
      reasoning: 'このタスクは複雑なため、小さなステップに分割することで管理しやすくなります。',
      confidence: 0.8,
      subtasks: [
        {
          id: `subtask-1`,
          title: `${task.task} - 計画フェーズ`,
          description: 'タスクの詳細な計画を立てる',
          priority: 1,
          estimatedMinutes: 30,
          dependencies: [],
          category: '計画',
          type: 'input',
          tags: ['計画'],
        },
        {
          id: `subtask-2`,
          title: `${task.task} - 実行フェーズ`,
          description: 'メインの作業を実行する',
          priority: 2,
          estimatedMinutes: 90,
          dependencies: [`subtask-1`],
          category: '実行',
          type: 'output',
          tags: ['実行'],
        },
        {
          id: `subtask-3`,
          title: `${task.task} - 確認フェーズ`,
          description: '結果を確認し、必要に応じて調整する',
          priority: 3,
          estimatedMinutes: 30,
          dependencies: [`subtask-2`],
          category: '確認',
          type: 'output',
          tags: ['確認'],
        },
      ],
      estimatedTotalTime: 150,
      difficulty: 'medium',
    };
  }

  // Helper methods for parsing and generating content...
  private parsePrioritySuggestions(response: string, tasks: TodoItem[]): AITaskSuggestion[] {
    // Implement parsing logic or return mock for now
    return this.mockPrioritySuggestions(tasks);
  }

  private parseTimeEstimates(response: string, tasks: TodoItem[]): TaskTimeEstimate[] {
    // Implement parsing logic or return mock for now
    return this.mockTimeEstimates(tasks);
  }

  private parseTaskGroups(response: string, tasks: TodoItem[]): TaskGroup[] {
    // Implement parsing logic or return mock for now
    return this.mockTaskGroups(tasks);
  }

  private parseTaskBreakdown(response: string, task: TodoItem): TaskBreakdown | null {
    // Implement parsing logic or return mock for now
    return this.mockTaskBreakdown(task);
  }

  private generateRecommendations(
    tasks: TodoItem[],
    prioritySuggestions: AITaskSuggestion[],
    timeEstimates: TaskTimeEstimate[],
    taskGroups: TaskGroup[]
  ): string[] {
    const recommendations = [];

    if (prioritySuggestions.length > 0) {
      recommendations.push(`${prioritySuggestions.length}個のタスクで優先度の調整を推奨します。`);
    }

    if (timeEstimates.length > 0) {
      const totalTime = timeEstimates.reduce((sum, est) => sum + est.estimatedMinutes, 0);
      recommendations.push(`全タスクの推定完了時間は約${Math.floor(totalTime / 60)}時間です。`);
    }

    if (taskGroups.length > 0) {
      recommendations.push(
        `${taskGroups.length}個のタスクグループに整理することで効率性が向上します。`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('現在のタスク構成は良好です。継続して効率的に進めてください。');
    }

    return recommendations;
  }

  private createPriorityPrompt(tasks: TodoItem[]): string {
    return `Analyze these tasks and suggest priority adjustments: ${tasks.map((t) => t.task).join(', ')}`;
  }

  private createTimeEstimatePrompt(tasks: TodoItem[]): string {
    return `Estimate completion time for these tasks: ${tasks.map((t) => t.task).join(', ')}`;
  }

  private createGroupingPrompt(tasks: TodoItem[]): string {
    return `Group these related tasks: ${tasks.map((t) => t.task).join(', ')}`;
  }

  private createBreakdownPrompt(task: TodoItem): string {
    return `Break down this complex task into smaller subtasks: ${task.task}`;
  }

  // Rate limiting status methods
  getRateLimitStatus(): {
    canMakeRequest: boolean;
    requestsRemaining: number;
    timeUntilReset: number;
  } {
    const canMakeRequest = this.rateLimiter.canMakeRequest();
    const requestsRemaining = Math.max(0, 10 - this.rateLimiter['state'].requests.length);
    const timeUntilReset = this.rateLimiter.getTimeUntilReset();

    return {
      canMakeRequest,
      requestsRemaining,
      timeUntilReset,
    };
  }
}

// Enhanced smart task breakdown with error handling
export const smartTaskBreakdown = async (task: TodoItem): Promise<TaskBreakdown> => {
  try {
    const complexity = evaluateTaskComplexity(task);

    if (complexity.score < 3) {
      throw new AIServiceError(
        'このタスクは十分小さいため、分解する必要がありません',
        'TASK_TOO_SIMPLE',
        false
      );
    }

    const breakdown = await analyzeAndBreakdownTask(task, complexity);
    return breakdown;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError(
      `タスク分解に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'BREAKDOWN_FAILED',
      true
    );
  }
};

// Rest of the existing code remains the same...
export const evaluateTaskComplexity = (task: TodoItem) => {
  let score = 0;
  const factors: string[] = [];

  if (task.task.length > 50) {
    score += 2;
    factors.push('長いタスクタイトル');
  }

  const verbs = ['作成', '実装', '設計', '調査', '分析', '計画', '実行', '検証', '修正'];
  const verbCount = verbs.filter((verb) => task.task.includes(verb)).length;
  if (verbCount > 1) {
    score += verbCount;
    factors.push('複数のアクション');
  }

  const complexKeywords = ['システム', 'アプリケーション', 'プロジェクト', '全体', '完全', '総合'];
  const complexCount = complexKeywords.filter((keyword) => task.task.includes(keyword)).length;
  score += complexCount * 2;
  if (complexCount > 0) factors.push('複雑なスコープ');

  const techKeywords = ['API', 'データベース', 'UI', 'UX', 'フロントエンド', 'バックエンド'];
  const techCount = techKeywords.filter((keyword) =>
    task.task.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  score += techCount;
  if (techCount > 0) factors.push('技術的複雑さ');

  if (task.estimatedDuration && task.estimatedDuration > 240) {
    score += 3;
    factors.push('長時間のタスク');
  }

  return { score, factors };
};

const analyzeAndBreakdownTask = async (task: TodoItem, complexity: any): Promise<TaskBreakdown> => {
  const subtasks = generateSubtasks(task, complexity);

  return {
    id: `breakdown-${Date.now()}`,
    originalTaskId: task._id,
    originalTaskTitle: task.task,
    reasoning: generateBreakdownReasoning(task, complexity),
    confidence: calculateBreakdownConfidence(task, complexity),
    subtasks,
    estimatedTotalTime: subtasks.reduce((sum, st) => sum + st.estimatedMinutes, 0),
    difficulty: complexity.score > 7 ? 'high' : complexity.score > 4 ? 'medium' : 'low',
  };
};

const generateSubtasks = (task: TodoItem, complexity: any): SubTask[] => {
  const subtasks: SubTask[] = [];
  const baseId = `subtask-${Date.now()}`;

  if (task.task.includes('実装') || task.task.includes('開発')) {
    subtasks.push(
      {
        id: `${baseId}-1`,
        title: `${task.task.replace('実装', '').replace('開発', '')}の要件分析`,
        description: 'タスクの要件を詳細に分析し、仕様を明確化する',
        priority: 1,
        estimatedMinutes: 60,
        dependencies: [],
        category: '分析',
        type: 'input',
        tags: ['要件', '分析'],
      },
      {
        id: `${baseId}-2`,
        title: `${task.task.replace('実装', '').replace('開発', '')}の設計`,
        description: 'システム設計とアーキテクチャの検討',
        priority: 2,
        estimatedMinutes: 90,
        dependencies: [`${baseId}-1`],
        category: '設計',
        type: 'input',
        tags: ['設計', 'アーキテクチャ'],
      },
      {
        id: `${baseId}-3`,
        title: `${task.task.replace('実装', '').replace('開発', '')}のコア機能実装`,
        description: 'メイン機能の実装作業',
        priority: 3,
        estimatedMinutes: 180,
        dependencies: [`${baseId}-2`],
        category: '実装',
        type: 'output',
        tags: ['コーディング', 'コア機能'],
      },
      {
        id: `${baseId}-4`,
        title: `${task.task.replace('実装', '').replace('開発', '')}のテスト`,
        description: '単体テストと統合テストの実施',
        priority: 4,
        estimatedMinutes: 120,
        dependencies: [`${baseId}-3`],
        category: 'テスト',
        type: 'output',
        tags: ['テスト', '品質保証'],
      }
    );
  } else if (task.task.includes('調査') || task.task.includes('分析')) {
    subtasks.push(
      {
        id: `${baseId}-1`,
        title: `${task.task}の範囲定義`,
        description: '調査・分析の範囲と目的を明確化',
        priority: 1,
        estimatedMinutes: 30,
        dependencies: [],
        category: '計画',
        type: 'input',
        tags: ['計画', '範囲'],
      },
      {
        id: `${baseId}-2`,
        title: `${task.task}の情報収集`,
        description: '関連情報とデータの収集',
        priority: 2,
        estimatedMinutes: 120,
        dependencies: [`${baseId}-1`],
        category: '調査',
        type: 'input',
        tags: ['情報収集', 'リサーチ'],
      },
      {
        id: `${baseId}-3`,
        title: `${task.task}の結果分析`,
        description: '収集した情報の分析と考察',
        priority: 3,
        estimatedMinutes: 90,
        dependencies: [`${baseId}-2`],
        category: '分析',
        type: 'output',
        tags: ['分析', '考察'],
      },
      {
        id: `${baseId}-4`,
        title: `${task.task}の報告書作成`,
        description: '分析結果をまとめた報告書の作成',
        priority: 4,
        estimatedMinutes: 60,
        dependencies: [`${baseId}-3`],
        category: 'ドキュメント',
        type: 'output',
        tags: ['報告書', 'ドキュメント'],
      }
    );
  } else {
    const phases = ['計画', '実行', '確認'];
    phases.forEach((phase, index) => {
      subtasks.push({
        id: `${baseId}-${index + 1}`,
        title: `${task.task} - ${phase}フェーズ`,
        description: `${task.task}の${phase}を行う`,
        priority: index + 1,
        estimatedMinutes: 60,
        dependencies: index > 0 ? [`${baseId}-${index}`] : [],
        category: phase,
        type: index === 0 ? 'input' : 'output',
        tags: [phase.toLowerCase()],
      });
    });
  }

  return subtasks;
};

const generateBreakdownReasoning = (task: TodoItem, complexity: any): string => {
  const reasons = [
    `タスク「${task.task}」は複雑度スコア${complexity.score}と評価されました。`,
    `検出された複雑要因: ${complexity.factors.join('、')}`,
    'より効率的な進行と品質確保のため、段階的なアプローチを推奨します。',
    '各サブタスクは依存関係を考慮して順序付けされています。',
  ];

  return reasons.join(' ');
};

const calculateBreakdownConfidence = (task: TodoItem, complexity: any): number => {
  let confidence = 0.7;

  if (complexity.score > 6) confidence += 0.2;
  else if (complexity.score > 4) confidence += 0.1;

  if (complexity.factors.includes('技術的複雑さ')) confidence += 0.1;

  if (task.task.includes('実装') || task.task.includes('開発')) confidence += 0.1;

  return Math.min(confidence, 0.95);
};

export default new TaskAIService();
