import { TaskRecommendation } from '@/types/ai';

export interface TaskAnalysis {
  id: string;
  originalTask: string;
  issues: string[];
  recommendations: TaskRecommendation[];
  clarity: 'clear' | 'vague' | 'abstract';
  actionability: number; // 0-100
}

export interface TodoAnalysisResult {
  totalTasks: number;
  analyzedTasks: TaskAnalysis[];
  summary: {
    tasksToDelete: number;
    tasksToSplit: number;
    tasksToClarify: number;
    improvementScore: number;
  };
}

class TodoAnalysisService {
  private readonly API_ENDPOINT = '/api/ai/analyze-todos';

  /**
   * ToDoリストをAI分析して改善提案を生成
   */
  async analyzeTodos(
    todos: Array<{ id: string; task: string; description?: string }>
  ): Promise<TodoAnalysisResult> {
    try {
      // 実際のAI APIを呼び出す場合
      // const response = await fetch(this.API_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ todos })
      // });
      // return await response.json();

      // 現在はダミーの分析ロジックを使用
      return this.performDummyAnalysis(todos);
    } catch (error) {
      console.error('AI分析エラー:', error);
      throw new Error('AI分析に失敗しました');
    }
  }

  /**
   * ダミーの分析ロジック（実際のAI APIの代替）
   */
  private performDummyAnalysis(
    todos: Array<{ id: string; task: string; description?: string }>
  ): TodoAnalysisResult {
    const analyzedTasks: TaskAnalysis[] = todos.map((todo) => {
      const analysis = this.analyzeTask(todo.task);
      return {
        id: todo.id,
        originalTask: todo.task,
        ...analysis,
      };
    });

    const summary = this.generateSummary(analyzedTasks);

    return {
      totalTasks: todos.length,
      analyzedTasks,
      summary,
    };
  }

  /**
   * 個別タスクの分析
   */
  private analyzeTask(task: string): Omit<TaskAnalysis, 'id' | 'originalTask'> {
    const issues: string[] = [];
    const recommendations: TaskRecommendation[] = [];

    // 抽象的なキーワードの検出
    const vagueKeywords = [
      '頑張る',
      '努力する',
      '改善する',
      '検討する',
      '考える',
      '整理する',
      '準備する',
    ];
    const hasVagueKeywords = vagueKeywords.some((keyword) => task.includes(keyword));

    // タスクの長さと複雑さ
    const isComplex = task.length > 50 || task.includes('と') || task.includes('、');

    // 動詞の有無
    const actionVerbs = ['作成', '実装', 'テスト', '修正', '確認', '送信', '連絡', '購入', '予約'];
    const hasActionVerb = actionVerbs.some((verb) => task.includes(verb));

    // 明確性の判定
    let clarity: 'clear' | 'vague' | 'abstract' = 'clear';
    let actionability = 80;

    if (hasVagueKeywords) {
      clarity = 'abstract';
      actionability = 20;
      issues.push('抽象的すぎる表現が含まれています');

      if (task.length < 10) {
        recommendations.push({
          type: 'delete',
          reason: '抽象的すぎて具体的なアクションが不明',
          confidence: 85,
        });
      } else {
        recommendations.push({
          type: 'rewrite',
          reason: '抽象的な表現を具体的なアクションに変換',
          rewrittenTask: this.makeTaskConcrete(task),
          confidence: 75,
        });
      }
    }

    if (isComplex) {
      actionability -= 30;
      issues.push('タスクが複雑すぎます');
      recommendations.push({
        type: 'split',
        reason: '複雑なタスクを実行可能な小さなステップに分割',
        newTasks: this.splitComplexTask(task),
        confidence: 80,
      });
    }

    if (!hasActionVerb && clarity === 'clear') {
      clarity = 'vague';
      actionability -= 20;
      issues.push('具体的なアクションが不明確');
      recommendations.push({
        type: 'clarify',
        reason: '具体的な動詞を追加して明確化',
        rewrittenTask: this.addActionVerb(task),
        confidence: 70,
      });
    }

    return {
      issues,
      recommendations,
      clarity,
      actionability: Math.max(0, actionability),
    };
  }

  /**
   * 抽象的なタスクを具体的にする
   */
  private makeTaskConcrete(task: string): string {
    const replacements: Record<string, string> = {
      頑張る: '30分間集中して作業する',
      努力する: '具体的な行動を計画して実行する',
      改善する: '問題点を特定して解決策を実装する',
      検討する: '選択肢をリストアップして比較検討する',
      考える: '10分間アイデアを書き出す',
      整理する: 'カテゴリ別に分類して不要な物を除去する',
      準備する: '必要な材料とステップをリストアップする',
    };

    let improvedTask = task;
    Object.entries(replacements).forEach(([vague, concrete]) => {
      improvedTask = improvedTask.replace(vague, concrete);
    });

    return improvedTask;
  }

  /**
   * 複雑なタスクを分割する
   */
  private splitComplexTask(task: string): string[] {
    // 接続詞で分割
    const parts = task
      .split(/[と、]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 1) {
      return parts.map((part, index) => `${index + 1}. ${part}`);
    }

    // 長いタスクを段階的に分割
    if (task.length > 50) {
      return [
        `1. ${task}の計画を立てる`,
        `2. 必要な資料や情報を収集する`,
        `3. ${task}を実行する`,
        `4. 結果を確認・検証する`,
      ];
    }

    return [task];
  }

  /**
   * アクション動詞を追加する
   */
  private addActionVerb(task: string): string {
    const suggestions = ['作成する: ', '確認する: ', '実行する: ', '完了する: '];

    const randomAction = suggestions[Math.floor(Math.random() * suggestions.length)];
    return `${randomAction}${task}`;
  }

  /**
   * 分析結果のサマリー生成
   */
  private generateSummary(analyzedTasks: TaskAnalysis[]): TodoAnalysisResult['summary'] {
    const tasksToDelete = analyzedTasks.filter((task) =>
      task.recommendations.some((rec) => rec.type === 'delete')
    ).length;

    const tasksToSplit = analyzedTasks.filter((task) =>
      task.recommendations.some((rec) => rec.type === 'split')
    ).length;

    const tasksToClarify = analyzedTasks.filter((task) =>
      task.recommendations.some((rec) => rec.type === 'clarify' || rec.type === 'rewrite')
    ).length;

    const avgActionability =
      analyzedTasks.reduce((sum, task) => sum + task.actionability, 0) / analyzedTasks.length;
    const improvementScore = Math.round(avgActionability);

    return {
      tasksToDelete,
      tasksToSplit,
      tasksToClarify,
      improvementScore,
    };
  }
}

export const todoAnalysisService = new TodoAnalysisService();
