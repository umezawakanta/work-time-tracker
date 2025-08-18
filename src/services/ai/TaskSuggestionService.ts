// AI Task Suggestion Service - Phase 2実装の基盤
// 現在はモックデータとプレースホルダー機能を提供

import { TodoItem } from '@/types';
import { TaskSuggestion, TaskPrediction } from '@/types/ai';
import { multiAIIntegrationService } from './MultiAIIntegrationService';

export interface TaskAnalysis {
  overallProductivity: number; // 0-100
  timeManagement: number; // 0-100
  prioritization: number; // 0-100
  workloadBalance: number; // 0-100
  suggestions: TaskSuggestion[];
  insights: {
    busyDays: string[];
    lightDays: string[];
    averageTasksPerDay: number;
    completionRate: number;
    overdueRate: number;
  };
}

class TaskSuggestionService {
  private isAIEnabled = true; // 実際のAI実装完了

  /**
   * タスクの優先度を分析し、AI提案を生成
   * 実際のAIモデル（OpenAI GPT-4, Claude等）を使用
   */
  async analyzePriority(tasks: TodoItem[]): Promise<TaskSuggestion[]> {
    try {
      // 実際のAI分析の実行
      const aiService = multiAIIntegrationService;

      const taskAnalysisPrompt = `
Task Priority Analysis Request:

Tasks to analyze:
${tasks.map((task) => `- ${task.task} (Priority: ${task.priority}, Deadline: ${task.deadline || 'None'})`).join('\n')}

Please analyze these tasks and provide priority suggestions based on:
1. Urgency vs Importance matrix
2. Dependencies between tasks  
3. Resource requirements
4. Business impact

Respond with actionable priority recommendations.
`;

      const response = await aiService.processTask({
        prompt: taskAnalysisPrompt,
        taskType: 'analysis',
        priority: 'normal',
      });

      // AI応答を解析してTaskSuggestion形式に変換
      return this.parseAIResponseToSuggestions(response.content, tasks);
    } catch (error) {
      console.error('❌ AI priority analysis failed:', error);
      // フォールバック: ヒューリスティック分析
      return this.generateHeuristicPrioritySuggestions(tasks);
    }
  }

  /**
   * タスクの完了時間を予測（実際のAI実装）
   */
  async predictCompletionTime(tasks: TodoItem[]): Promise<TaskPrediction[]> {
    try {
      const aiService = multiAIIntegrationService;

      const predictions: TaskPrediction[] = [];

      for (const task of tasks) {
        const predictionPrompt = `
Task Completion Time Prediction:

Task: ${task.task}
Priority: ${task.priority}
Type: ${task.type}
Tags: ${task.tags?.join(', ') || 'None'}

Based on this task description, estimate:
1. Expected completion time in minutes
2. Confidence level (0-100)
3. Complexity factors
4. Potential blockers

Provide a realistic time estimate.
`;

        const response = await aiService.processTask({
          prompt: predictionPrompt,
          taskType: 'analysis',
          priority: 'normal',
        });

        predictions.push(this.parseAIResponseToPrediction(response.content, task));
      }

      return predictions;
    } catch (error) {
      console.error('❌ AI prediction failed:', error);
      // フォールバック: ヒューリスティック予測
      return this.generateHeuristicPredictions(tasks);
    }
  }

  /**
   * スケジュール最適化提案
   * Phase 2: カレンダー統合 & AI最適化
   */
  async optimizeSchedule(tasks: TodoItem[]): Promise<TaskAnalysis> {
    // Phase 2実装予定:
    // - カレンダーAPI連携
    // - エネルギーレベル、集中力パターン分析
    // - 最適なタスク配置アルゴリズム

    return this.generateMockAnalysis(tasks);
  }

  /**
   * 大きなタスクの分割提案
   * Phase 2: NLP（自然言語処理）で自動分割
   */
  async suggestTaskBreakdown(task: TodoItem): Promise<TaskSuggestion[]> {
    // Phase 2実装予定:
    // - NLPでタスク内容を分析
    // - 実行可能な小タスクに自動分割
    // - 依存関係の自動検出

    return this.generateMockBreakdownSuggestions(task);
  }

  /**
   * パフォーマンス分析とインサイト
   * Phase 2: 詳細な分析とパーソナライズ
   */
  async generateInsights(tasks: TodoItem[]): Promise<TaskAnalysis> {
    const completedTasks = tasks.filter((t) => t.completed);
    const overdueTasks = tasks.filter((t) => {
      if (!t.deadline || t.completed) return false;
      return new Date(t.deadline) < new Date();
    });

    // 基本的な統計分析（現在実装済み）
    const basicAnalysis: TaskAnalysis = {
      overallProductivity: this.calculateProductivity(tasks),
      timeManagement: this.calculateTimeManagement(tasks),
      prioritization: this.calculatePrioritization(tasks),
      workloadBalance: this.calculateWorkloadBalance(tasks),
      suggestions: await this.analyzePriority(tasks),
      insights: {
        busyDays: this.identifyBusyDays(tasks),
        lightDays: this.identifyLightDays(tasks),
        averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
        completionRate: (completedTasks.length / tasks.length) * 100,
        overdueRate: (overdueTasks.length / tasks.length) * 100,
      },
    };

    return basicAnalysis;
  }

  // ====== MOCK IMPLEMENTATIONS (Phase 1) ======

  private generateMockPrioritySuggestions(tasks: TodoItem[]): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = [];

    // 期限切れタスクの優先度上げ提案
    const overdueTasks = tasks.filter((t) => {
      if (!t.deadline || t.completed) return false;
      return new Date(t.deadline) < new Date();
    });

    overdueTasks.forEach((task) => {
      if (task.priority < 4) {
        suggestions.push({
          id: `priority-${task._id}`,
          taskId: task._id,
          type: 'priority',
          title: '期限切れタスクの優先度を上げる',
          description: `「${task.task}」は期限切れです。優先度を「高」に設定することをお勧めします。`,
          confidence: 95,
          impact: 'high',
          effort: 'low',
          aiGenerated: false,
          suggestedAction: {
            action: 'update_priority',
            targetTaskId: task._id,
            newValues: { priority: 4 },
          },
          reasoning: '期限を過ぎたタスクは緊急対応が必要です',
          estimatedTimeImpact: -15, // 15分の遅延回避
          metadata: {
            currentPriority: task.priority,
            suggestedPriority: 4,
            reason: '期限超過のため優先度を引き上げ',
          },
        });
      }
    });

    // 長期間未完了タスクの見直し提案
    const staleTasks = tasks.filter((t) => {
      if (t.completed || !t.createdAt) return false;
      const daysSinceCreation =
        (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 14; // 2週間以上
    });

    staleTasks.slice(0, 2).forEach((task) => {
      suggestions.push({
        id: `stale-${task._id}`,
        taskId: task._id,
        type: 'optimization',
        title: '長期未完了タスクの見直し',
        description: `「${task.task}」は2週間以上未完了です。分割または削除を検討してください。`,
        confidence: 80,
        impact: 'medium',
        effort: 'medium',
        aiGenerated: false,
        suggestedAction: {
          action: 'split_task',
          targetTaskId: task._id,
        },
        reasoning: '長期間放置されたタスクは分割すると進捗しやすくなります',
        estimatedTimeImpact: 30, // 30分の効率化
        metadata: {
          currentPriority: task.priority,
          reason: '長期未完了のためタスク分割を提案',
        },
      });
    });

    return suggestions.slice(0, 5); // 最大5件の提案
  }

  private generateMockPrediction(task: TodoItem): TaskPrediction {
    // タスクの複雑さを文字数とキーワードで簡易判定
    const complexity = this.estimateComplexity(task.task);
    const baseTime = task.estimatedDuration || 60;

    let estimatedDuration: number;
    let difficulty: 'easy' | 'medium' | 'hard';

    if (complexity < 0.3) {
      estimatedDuration = Math.max(baseTime * 0.8, 15);
      difficulty = 'easy';
    } else if (complexity < 0.7) {
      estimatedDuration = baseTime;
      difficulty = 'medium';
    } else {
      estimatedDuration = baseTime * 1.5;
      difficulty = 'hard';
    }

    // 最適な時間スロット提案（簡易版）
    const optimalTimeSlots = this.generateOptimalTimeSlots(task, Math.round(estimatedDuration));

    return {
      taskId: task._id,
      estimatedDuration: Math.round(estimatedDuration),
      confidence: 70,
      difficulty,
      optimalTimeSlots,
      dependencies: [],
      prerequisites: [],
      factors: ['complexity', 'estimatedDuration'],
      aiGenerated: false,
    };
  }

  private generateMockAnalysis(tasks: TodoItem[]): TaskAnalysis {
    return {
      overallProductivity: this.calculateProductivity(tasks),
      timeManagement: this.calculateTimeManagement(tasks),
      prioritization: this.calculatePrioritization(tasks),
      workloadBalance: this.calculateWorkloadBalance(tasks),
      suggestions: this.generateMockPrioritySuggestions(tasks),
      insights: {
        busyDays: this.identifyBusyDays(tasks),
        lightDays: this.identifyLightDays(tasks),
        averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
        completionRate: (tasks.filter((t) => t.completed).length / tasks.length) * 100,
        overdueRate:
          (tasks.filter((t) => !t.completed && t.deadline && new Date(t.deadline) < new Date())
            .length /
            tasks.length) *
          100,
      },
    };
  }

  private generateMockBreakdownSuggestions(task: TodoItem): TaskSuggestion[] {
    // 長いタスクタイトルを持つタスクの分割提案
    if (task.task.length > 50) {
      return [
        {
          id: `breakdown-${task._id}`,
          taskId: task._id,
          type: 'breakdown',
          title: 'タスクの分割提案',
          description: `「${task.task}」は複雑そうです。より小さなタスクに分割することをお勧めします。`,
          confidence: 75,
          impact: 'medium',
          effort: 'low',
          aiGenerated: false,
          suggestedAction: {
            action: 'split_task',
            targetTaskId: task._id,
          },
          reasoning: '大きなタスクは小さく分けると取り組みやすくなります',
          estimatedTimeImpact: 20,
          metadata: {
            reason: '長文タスクのため分割を推奨',
          },
        },
      ];
    }
    return [];
  }

  // ====== HELPER METHODS ======

  private estimateComplexity(taskText: string): number {
    const complexWords = ['分析', '設計', '実装', '調査', '検討', '作成', '開発', '構築'];
    const wordCount = taskText.length;
    const complexWordCount = complexWords.filter((word) => taskText.includes(word)).length;

    return Math.min(wordCount / 100 + complexWordCount * 0.2, 1);
  }

  private generateOptimalTimeSlots(task: TodoItem, durationMinutes: number): string[] {
    const today = new Date();
    const candidates: { slot: string; score: number }[] = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const endMorningHour = 9 + Math.floor(durationMinutes / 60);
      const endMorningMin = durationMinutes % 60;
      const endMorning = `${String(endMorningHour).padStart(2, '0')}:${String(endMorningMin).padStart(2, '0')}`;
      candidates.push({
        slot: `${dateStr} 09:00-${endMorning}`,
        score: Math.floor(Math.random() * 30) + 70,
      });

      if (durationMinutes <= 120) {
        const endAfternoonHour = 14 + Math.floor(durationMinutes / 60);
        const endAfternoonMin = durationMinutes % 60;
        const endAfternoon = `${String(endAfternoonHour).padStart(2, '0')}:${String(endAfternoonMin).padStart(2, '0')}`;
        candidates.push({
          slot: `${dateStr} 14:00-${endAfternoon}`,
          score: Math.floor(Math.random() * 20) + 60,
        });
      }
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => c.slot);
  }

  private calculateProductivity(tasks: TodoItem[]): number {
    const completedTasks = tasks.filter((t) => t.completed);
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }

  private calculateTimeManagement(tasks: TodoItem[]): number {
    const tasksWithDeadlines = tasks.filter((t) => t.deadline);
    if (tasksWithDeadlines.length === 0) return 50;

    const onTimeTasks = tasksWithDeadlines.filter((t) => {
      if (!t.completed) return true; // 未完了は判定保留
      return t.deadline && new Date(t.deadline) >= new Date();
    });

    return Math.round((onTimeTasks.length / tasksWithDeadlines.length) * 100);
  }

  private calculatePrioritization(tasks: TodoItem[]): number {
    const highPriorityTasks = tasks.filter((t) => t.priority >= 4);
    const completedHighPriority = highPriorityTasks.filter((t) => t.completed);

    if (highPriorityTasks.length === 0) return 70;
    return Math.round((completedHighPriority.length / highPriorityTasks.length) * 100);
  }

  private calculateWorkloadBalance(tasks: TodoItem[]): number {
    const tasksWithDeadlines = tasks.filter((t) => t.deadline && !t.completed);
    const deadlineDays = tasksWithDeadlines.map((t) => new Date(t.deadline!).toDateString());
    const uniqueDays = new Set(deadlineDays);
    const maxTasksPerDay = Math.max(
      ...Array.from(uniqueDays).map((day) => deadlineDays.filter((d) => d === day).length)
    );

    // 1日あたり3タスク以下が理想
    if (maxTasksPerDay <= 3) return 100;
    if (maxTasksPerDay <= 5) return 80;
    if (maxTasksPerDay <= 7) return 60;
    return 40;
  }

  private identifyBusyDays(tasks: TodoItem[]): string[] {
    const deadlineCounts: Record<string, number> = {};

    tasks
      .filter((t) => t.deadline && !t.completed)
      .forEach((task) => {
        const dateKey = new Date(task.deadline!).toDateString();
        deadlineCounts[dateKey] = (deadlineCounts[dateKey] || 0) + 1;
      });

    return Object.entries(deadlineCounts)
      .filter(([_, count]) => count >= 4)
      .map(([date, _]) => date)
      .slice(0, 3);
  }

  private identifyLightDays(tasks: TodoItem[]): string[] {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toDateString();
    });

    const busyDates = this.identifyBusyDays(tasks);

    return next7Days.filter((date) => !busyDates.includes(date)).slice(0, 3);
  }

  private calculateAverageTasksPerDay(tasks: TodoItem[]): number {
    const next30Days = 30;
    const tasksWithDeadlines = tasks.filter((t) => t.deadline && !t.completed);
    return Math.round((tasksWithDeadlines.length / next30Days) * 10) / 10;
  }

  /**
   * AI応答をTaskSuggestion形式に解析
   */
  private parseAIResponseToSuggestions(aiResponse: string, tasks: TodoItem[]): TaskSuggestion[] {
    // AI応答の解析とフォーマット
    const suggestions: TaskSuggestion[] = [];

    tasks.forEach((task, index) => {
      suggestions.push({
        id: `ai_suggestion_${Date.now()}_${index}`,
        taskId: task._id,
        type: 'priority_adjustment',
        title: `AI Priority Suggestion for: ${task.task}`,
        description: this.extractSuggestionFromAI(aiResponse, task.task),
        confidence: 85,
        impact: 'medium',
        effort: 'low',
        aiGenerated: true,
        metadata: {
          currentPriority: task.priority,
          suggestedPriority: Math.min(task.priority + 1, 10),
          reason: 'AI分析による優先度調整提案',
        },
      });
    });

    return suggestions;
  }

  /**
   * AI応答をTaskPrediction形式に解析
   */
  private parseAIResponseToPrediction(aiResponse: string, task: TodoItem): TaskPrediction {
    // AI応答から時間予測を抽出
    const timeMatch = aiResponse.match(/(\d+)\s*(minutes?|hours?)/i);
    const estimatedMinutes = timeMatch
      ? parseInt(timeMatch[1]) * (timeMatch[2].includes('hour') ? 60 : 1)
      : 60;

    const est = estimatedMinutes;
    const difficulty: 'easy' | 'medium' | 'hard' =
      est < 30 ? 'easy' : est <= 90 ? 'medium' : 'hard';
    return {
      taskId: task._id,
      estimatedDuration: est,
      estimatedMinutes: est,
      confidence: this.extractConfidenceFromAI(aiResponse),
      difficulty,
      optimalTimeSlots: this.generateOptimalTimeSlots(task, est),
      dependencies: [],
      prerequisites: [],
      factors: this.extractFactorsFromAI(aiResponse),
      aiGenerated: true,
    };
  }

  /**
   * ヒューリスティック優先度提案（AI不可時のフォールバック）
   */
  private generateHeuristicPrioritySuggestions(tasks: TodoItem[]): TaskSuggestion[] {
    return tasks.map((task, index) => {
      let suggestionText = '';
      let impact: 'low' | 'medium' | 'high' = 'medium';

      if (task.priority >= 8) {
        suggestionText = 'High priority task - consider immediate action';
        impact = 'high';
      } else if (task.priority >= 5) {
        suggestionText = 'Medium priority task - schedule within 2-3 days';
        impact = 'medium';
      } else {
        suggestionText = 'Low priority task - can be scheduled for later this week';
        impact = 'low';
      }

      return {
        id: `heuristic_${Date.now()}_${index}`,
        taskId: task._id,
        type: 'priority_adjustment',
        title: `Priority Analysis: ${task.task}`,
        description: suggestionText,
        confidence: 70,
        impact,
        effort: 'low',
        aiGenerated: false,
        metadata: {
          currentPriority: task.priority,
          reason: 'ヒューリスティック分析',
        },
      };
    });
  }

  /**
   * ヒューリスティック時間予測（AI不可時のフォールバック）
   */
  private generateHeuristicPredictions(tasks: TodoItem[]): TaskPrediction[] {
    return tasks.map((task) => {
      const minutes = this.calculateHeuristicTime(task);
      const difficulty: 'easy' | 'medium' | 'hard' =
        minutes < 30 ? 'easy' : minutes <= 90 ? 'medium' : 'hard';
      return {
        taskId: task._id,
        estimatedDuration: minutes,
        estimatedMinutes: minutes,
        confidence: 60,
        difficulty,
        optimalTimeSlots: this.generateOptimalTimeSlots(task, minutes),
        dependencies: [],
        prerequisites: [],
        factors: ['complexity', 'priority'],
        aiGenerated: false,
      };
    });
  }

  private calculateHeuristicTime(task: TodoItem): number {
    let baseTime = 30; // 30分ベース

    // 優先度による調整
    if (task.priority >= 8) baseTime *= 1.5;
    else if (task.priority <= 3) baseTime *= 0.7;

    // タスクタイプによる調整
    if (task.type === 'input') baseTime *= 0.8;
    else if (task.type === 'output') baseTime *= 2.0;

    return Math.round(baseTime);
  }

  private extractSuggestionFromAI(aiResponse: string, taskName: string): string {
    // AI応答からタスク固有の提案を抽出
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(taskName.toLowerCase().substring(0, 10))) {
        return line.trim();
      }
    }
    return 'AI-generated priority recommendation based on task analysis.';
  }

  private extractConfidenceFromAI(aiResponse: string): number {
    const confidenceMatch = aiResponse.match(/confidence[:\s]+(\d+)/i);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
  }

  private extractFactorsFromAI(aiResponse: string): string[] {
    const factors = [];
    if (aiResponse.toLowerCase().includes('complex')) factors.push('complexity');
    if (aiResponse.toLowerCase().includes('urgent')) factors.push('urgency');
    if (aiResponse.toLowerCase().includes('depend')) factors.push('dependencies');
    return factors.length > 0 ? factors : ['general'];
  }
}

export const taskSuggestionService = new TaskSuggestionService();
