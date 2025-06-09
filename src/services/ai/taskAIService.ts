import { TodoItem } from '@/types';

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

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
  }

  // タスクの優先度を自動提案
  async suggestTaskPriority(tasks: TodoItem[]): Promise<AITaskSuggestion[]> {
    if (!this.apiKey) {
      return this.mockPrioritySuggestions(tasks);
    }

    try {
      const prompt = this.createPriorityPrompt(tasks);
      const response = await this.callAI(prompt);
      return this.parsePrioritySuggestions(response, tasks);
    } catch (error) {
      console.error('AI priority suggestion failed:', error);
      return this.mockPrioritySuggestions(tasks);
    }
  }

  // タスク完了時間の予測
  async estimateTaskDuration(tasks: TodoItem[]): Promise<TaskTimeEstimate[]> {
    if (!this.apiKey) {
      return this.mockTimeEstimates(tasks);
    }

    try {
      const prompt = this.createTimeEstimatePrompt(tasks);
      const response = await this.callAI(prompt);
      return this.parseTimeEstimates(response, tasks);
    } catch (error) {
      console.error('AI time estimation failed:', error);
      return this.mockTimeEstimates(tasks);
    }
  }

  // 類似タスクのグループ化
  async groupSimilarTasks(tasks: TodoItem[]): Promise<TaskGroup[]> {
    if (!this.apiKey) {
      return this.mockTaskGroups(tasks);
    }

    try {
      const prompt = this.createGroupingPrompt(tasks);
      const response = await this.callAI(prompt);
      return this.parseTaskGroups(response, tasks);
    } catch (error) {
      console.error('AI task grouping failed:', error);
      return this.mockTaskGroups(tasks);
    }
  }

  // 大きなタスクの分解
  async breakdownLargeTask(task: TodoItem): Promise<TaskBreakdown | null> {
    if (!this.apiKey) {
      return this.mockTaskBreakdown(task);
    }

    try {
      const prompt = this.createBreakdownPrompt(task);
      const response = await this.callAI(prompt);
      return this.parseTaskBreakdown(response, task);
    } catch (error) {
      console.error('AI task breakdown failed:', error);
      return this.mockTaskBreakdown(task);
    }
  }

  // 包括的なAI分析
  async analyzeTasksComprehensively(todos: any[]): Promise<{
    prioritySuggestions: AITaskSuggestion[];
    timeEstimates: TaskTimeEstimate[];
    taskGroups: TaskGroup[];
    recommendations: string[];
  }> {
    const [prioritySuggestions, timeEstimates, taskGroups] = await Promise.all([
      this.suggestTaskPriority([]),
      this.estimateTaskDuration([]),
      this.groupSimilarTasks([]),
    ]);

    const recommendations = this.generateRecommendations(
      [],
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
  }

  // AI API呼び出し
  private async callAI(prompt: string): Promise<string> {
    // Implementation of callAI method
    return '';
  }

  private mockPrioritySuggestions(tasks: TodoItem[]): AITaskSuggestion[] {
    // Implementation of mockPrioritySuggestions method
    return [];
  }

  private mockTimeEstimates(tasks: TodoItem[]): TaskTimeEstimate[] {
    // Implementation of mockTimeEstimates method
    return [];
  }

  private mockTaskGroups(tasks: TodoItem[]): TaskGroup[] {
    // Implementation of mockTaskGroups method
    return [];
  }

  private mockTaskBreakdown(task: TodoItem): TaskBreakdown | null {
    // Implementation of mockTaskBreakdown method
    return null;
  }

  private parsePrioritySuggestions(response: string, tasks: TodoItem[]): AITaskSuggestion[] {
    // Implementation of parsePrioritySuggestions method
    return [];
  }

  private parseTimeEstimates(response: string, tasks: TodoItem[]): TaskTimeEstimate[] {
    // Implementation of parseTimeEstimates method
    return [];
  }

  private parseTaskGroups(response: string, tasks: TodoItem[]): TaskGroup[] {
    // Implementation of parseTaskGroups method
    return [];
  }

  private parseTaskBreakdown(response: string, task: TodoItem): TaskBreakdown | null {
    // Implementation of parseTaskBreakdown method
    return null;
  }

  private generateRecommendations(
    tasks: TodoItem[],
    prioritySuggestions: AITaskSuggestion[],
    timeEstimates: TaskTimeEstimate[],
    taskGroups: TaskGroup[]
  ): string[] {
    // Implementation of generateRecommendations method
    return [];
  }

  private createPriorityPrompt(tasks: TodoItem[]): string {
    // Implementation of createPriorityPrompt method
    return '';
  }

  private createTimeEstimatePrompt(tasks: TodoItem[]): string {
    // Implementation of createTimeEstimatePrompt method
    return '';
  }

  private createGroupingPrompt(tasks: TodoItem[]): string {
    // Implementation of createGroupingPrompt method
    return '';
  }

  private createBreakdownPrompt(task: TodoItem): string {
    // Implementation of createBreakdownPrompt method
    return '';
  }
}

// スマートタスク分解の実装
export const smartTaskBreakdown = async (task: TodoItem): Promise<TaskBreakdown> => {
  // タスクの複雑さを評価
  const complexity = evaluateTaskComplexity(task);

  if (complexity.score < 3) {
    throw new Error('このタスクは十分小さいため、分解する必要がありません');
  }

  // AI分析によるタスク分解
  const breakdown = await analyzeAndBreakdownTask(task, complexity);

  return breakdown;
};

// タスクの複雑さを評価
export const evaluateTaskComplexity = (task: TodoItem) => {
  let score = 0;
  const factors: string[] = [];

  // タスクタイトルの長さ
  if (task.task.length > 50) {
    score += 2;
    factors.push('長いタスクタイトル');
  }

  // 複数の動詞が含まれている
  const verbs = ['作成', '実装', '設計', '調査', '分析', '計画', '実行', '検証', '修正'];
  const verbCount = verbs.filter((verb) => task.task.includes(verb)).length;
  if (verbCount > 1) {
    score += verbCount;
    factors.push('複数のアクション');
  }

  // 複雑なキーワード
  const complexKeywords = ['システム', 'アプリケーション', 'プロジェクト', '全体', '完全', '総合'];
  const complexCount = complexKeywords.filter((keyword) => task.task.includes(keyword)).length;
  score += complexCount * 2;
  if (complexCount > 0) factors.push('複雑なスコープ');

  // 技術的キーワード
  const techKeywords = ['API', 'データベース', 'UI', 'UX', 'フロントエンド', 'バックエンド'];
  const techCount = techKeywords.filter((keyword) =>
    task.task.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  score += techCount;
  if (techCount > 0) factors.push('技術的複雑さ');

  // 推定時間（長い場合は複雑）
  if (task.estimatedDuration && task.estimatedDuration > 240) {
    // 4時間以上
    score += 3;
    factors.push('長時間のタスク');
  }

  return { score, factors };
};

// AI分析によるタスク分解
const analyzeAndBreakdownTask = async (task: TodoItem, complexity: any): Promise<TaskBreakdown> => {
  // モックAI分析 - 実際の実装ではOpenAI API等を使用
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

// サブタスク生成
const generateSubtasks = (task: TodoItem, complexity: any): SubTask[] => {
  const subtasks: SubTask[] = [];
  const baseId = `subtask-${Date.now()}`;

  // タスクタイプに基づく分解パターン
  if (task.task.includes('実装') || task.task.includes('開発')) {
    // 開発タスクの分解
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
    // 調査・分析タスクの分解
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
    // 汎用的なタスク分解
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

// 分解理由の生成
const generateBreakdownReasoning = (task: TodoItem, complexity: any): string => {
  const reasons = [
    `タスク「${task.task}」は複雑度スコア${complexity.score}と評価されました。`,
    `検出された複雑要因: ${complexity.factors.join('、')}`,
    'より効率的な進行と品質確保のため、段階的なアプローチを推奨します。',
    '各サブタスクは依存関係を考慮して順序付けされています。',
  ];

  return reasons.join(' ');
};

// 分解信頼度の計算
const calculateBreakdownConfidence = (task: TodoItem, complexity: any): number => {
  let confidence = 0.7; // ベース信頼度

  // より複雑なタスクほど分解の信頼度が高い
  if (complexity.score > 6) confidence += 0.2;
  else if (complexity.score > 4) confidence += 0.1;

  // 技術的なタスクは分解しやすい
  if (complexity.factors.includes('技術的複雑さ')) confidence += 0.1;

  // 明確なキーワードがある場合
  if (task.task.includes('実装') || task.task.includes('開発')) confidence += 0.1;

  return Math.min(confidence, 0.95); // 最大95%
};

export default new TaskAIService();
