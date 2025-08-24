/**
 * 🎯 ADHD実行力強化サービス
 * 計画立案は可能だが実行が困難な特性に特化した支援システム
 */

class EventEmitter {
  private events: { [key: string]: ((...args: any[]) => void)[] } = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) this.events[event].splice(index, 1);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export interface ExecutionTask {
  id: string;
  title: string;
  originalTask: string; // 元のタスク
  microSteps: MicroStep[]; // 超細分化されたステップ
  estimatedTime: number; // 予想実行時間（分）
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  context: string; // 実行コンテキスト
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'planned' | 'in-progress' | 'paused' | 'completed' | 'abandoned';
  executionAttempts: ExecutionAttempt[];
}

export interface MicroStep {
  id: string;
  description: string;
  estimatedMinutes: number; // 2-5分程度
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
  difficulty: number; // 1-5
  reward: string; // 完了時の報酬メッセージ
}

export interface ExecutionAttempt {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  completedSteps: number;
  totalSteps: number;
  interruptions: Interruption[];
  status: 'active' | 'completed' | 'abandoned';
  mood: 'energetic' | 'focused' | 'tired' | 'distracted' | 'overwhelmed';
}

export interface Interruption {
  timestamp: Date;
  reason: 'distraction' | 'overwhelm' | 'boredom' | 'external' | 'physical';
  severity: number; // 1-5
  recoveryTime?: number; // 復帰までの時間（分）
}

export interface ExecutionGuidance {
  type: 'start' | 'continue' | 'break' | 'recovery' | 'celebration';
  message: string;
  visualCue: string;
  soundEffect?: string;
  nextAction: string;
  timeEstimate?: number;
  motivationalBoost: string;
}

class ADHDExecutionSupportService extends EventEmitter {
  private static instance: ADHDExecutionSupportService;
  private currentTask: ExecutionTask | null = null;
  private currentAttempt: ExecutionAttempt | null = null;
  private executionTimer: NodeJS.Timeout | null = null;
  private reminderTimer: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.setupPeriodicReminders();
  }

  public static getInstance(): ADHDExecutionSupportService {
    if (!ADHDExecutionSupportService.instance) {
      ADHDExecutionSupportService.instance = new ADHDExecutionSupportService();
    }
    return ADHDExecutionSupportService.instance;
  }

  /**
   * タスクを実行しやすい形に超細分化
   */
  public decomposeTask(originalTask: string, context: string = ''): ExecutionTask {
    const microSteps = this.generateMicroSteps(originalTask);

    const task: ExecutionTask = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.extractTaskTitle(originalTask),
      originalTask,
      microSteps,
      estimatedTime: microSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
      priority: this.assessPriority(originalTask),
      difficulty: this.assessDifficulty(originalTask),
      context,
      createdAt: new Date(),
      status: 'planned',
      executionAttempts: [],
    };

    this.saveTask(task);
    this.emit('taskCreated', task);

    return task;
  }

  /**
   * タスク実行開始
   */
  public async startExecution(
    taskId: string,
    mood: ExecutionAttempt['mood'] = 'focused'
  ): Promise<ExecutionGuidance> {
    const task = this.getTask(taskId);
    if (!task) throw new Error('Task not found');

    this.currentTask = task;
    this.currentAttempt = {
      id: `attempt_${Date.now()}`,
      startedAt: new Date(),
      completedSteps: 0,
      totalSteps: task.microSteps.length,
      interruptions: [],
      status: 'active',
      mood,
    };

    task.status = 'in-progress';
    task.startedAt = new Date();
    task.executionAttempts.push(this.currentAttempt);

    this.setupExecutionMonitoring();
    this.saveTask(task);

    return this.generateStartGuidance(task, mood);
  }

  /**
   * マイクロステップ完了
   */
  public completeStep(stepId: string): ExecutionGuidance {
    if (!this.currentTask || !this.currentAttempt) {
      throw new Error('No active execution session');
    }

    const step = this.currentTask.microSteps.find((s) => s.id === stepId);
    if (!step) throw new Error('Step not found');

    step.completed = true;
    step.completedAt = new Date();
    this.currentAttempt.completedSteps++;

    // 即座の報酬とフィードバック
    const guidance = this.generateProgressGuidance(step);

    // 次のステップの準備
    this.scheduleNextStepReminder();

    this.emit('stepCompleted', { step, task: this.currentTask });
    this.saveTask(this.currentTask);

    return guidance;
  }

  /**
   * 実行中断の記録と復帰支援
   */
  public recordInterruption(
    reason: Interruption['reason'],
    severity: number = 3
  ): ExecutionGuidance {
    if (!this.currentAttempt) {
      throw new Error('No active execution session');
    }

    const interruption: Interruption = {
      timestamp: new Date(),
      reason,
      severity,
    };

    this.currentAttempt.interruptions.push(interruption);
    this.emit('interrupted', { interruption, task: this.currentTask });

    return this.generateRecoveryGuidance(reason, severity);
  }

  /**
   * 実行復帰支援
   */
  public resumeExecution(): ExecutionGuidance {
    if (!this.currentTask || !this.currentAttempt) {
      throw new Error('No task to resume');
    }

    const lastInterruption =
      this.currentAttempt.interruptions[this.currentAttempt.interruptions.length - 1];
    if (lastInterruption) {
      const now = new Date();
      lastInterruption.recoveryTime = Math.floor(
        (now.getTime() - lastInterruption.timestamp.getTime()) / (1000 * 60)
      );
    }

    const nextStep = this.getNextIncompleteStep();
    return this.generateRecoveryGuidance(
      lastInterruption?.reason || 'external',
      lastInterruption?.severity || 3
    );
  }

  /**
   * 緊急時の簡易実行プラン
   */
  public createEmergencyPlan(overwhelmLevel: number = 5): ExecutionGuidance {
    const emergencyTasks = [
      '深呼吸を3回する',
      '水を一口飲む',
      '今いる場所を整理する',
      '一番簡単なタスクを1つ選ぶ',
      '5分だけ集中してみる',
    ];

    const selectedTask = emergencyTasks[Math.floor(Math.random() * emergencyTasks.length)];

    return {
      type: 'recovery',
      message: `大丈夫、一歩ずつ。まずは「${selectedTask}」から始めましょう。`,
      visualCue: '🌟',
      nextAction: selectedTask,
      timeEstimate: 2,
      motivationalBoost: 'あなたは既にここまで来ました。きっとできます。',
    };
  }

  /**
   * 実行パターン分析と個人最適化
   */
  public analyzeExecutionPatterns(): {
    bestExecutionTimes: string[];
    commonInterruptions: Interruption['reason'][];
    averageStepTime: number;
    successfulStrategies: string[];
    recommendations: string[];
  } {
    const tasks = this.getAllTasks();
    const completedTasks = tasks.filter((t) => t.status === 'completed');

    // 実行時間帯の分析
    const executionTimes = completedTasks
      .map((t) => {
        if (t.startedAt) {
          return t.startedAt.getHours();
        }
        return null;
      })
      .filter((t) => t !== null) as number[];

    // 中断要因の分析
    const allInterruptions = completedTasks.flatMap((t) =>
      t.executionAttempts.flatMap((a) => a.interruptions)
    );

    const interruptionCounts = allInterruptions.reduce(
      (acc, int) => {
        acc[int.reason] = (acc[int.reason] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      bestExecutionTimes: this.identifyBestTimes(executionTimes),
      commonInterruptions: Object.keys(interruptionCounts).sort(
        (a, b) => interruptionCounts[b] - interruptionCounts[a]
      ) as Interruption['reason'][],
      averageStepTime: this.calculateAverageStepTime(completedTasks),
      successfulStrategies: this.identifySuccessfulStrategies(completedTasks),
      recommendations: this.generatePersonalizedRecommendations(completedTasks),
    };
  }

  // プライベートメソッド

  private generateMicroSteps(task: string): MicroStep[] {
    // AI支援による超細分化（実装時はより高度なロジック）
    const baseSteps = this.basicTaskDecomposition(task);

    return baseSteps.map((step, index) => ({
      id: `step_${index}_${Math.random().toString(36).substr(2, 9)}`,
      description: step.description,
      estimatedMinutes: Math.min(5, Math.max(2, step.estimatedMinutes)),
      completed: false,
      difficulty: step.difficulty,
      reward: this.generateReward(step.description),
    }));
  }

  private basicTaskDecomposition(
    task: string
  ): Array<{ description: string; estimatedMinutes: number; difficulty: number }> {
    // 基本的なタスク分解ロジック
    const words = task.split(' ').length;

    if (words <= 3) {
      // 単純なタスク
      return [
        { description: '必要な道具/資料を準備する', estimatedMinutes: 2, difficulty: 1 },
        { description: `${task}を実行する`, estimatedMinutes: 3, difficulty: 2 },
        { description: '完了確認と片付け', estimatedMinutes: 2, difficulty: 1 },
      ];
    } else {
      // 複雑なタスク
      return [
        { description: '作業環境を整える', estimatedMinutes: 3, difficulty: 1 },
        { description: 'タスクの詳細を確認する', estimatedMinutes: 2, difficulty: 2 },
        { description: '第1段階を実行する', estimatedMinutes: 5, difficulty: 3 },
        { description: '中間確認とリフレッシュ', estimatedMinutes: 2, difficulty: 1 },
        { description: '第2段階を実行する', estimatedMinutes: 5, difficulty: 3 },
        { description: '最終確認と完了処理', estimatedMinutes: 3, difficulty: 2 },
      ];
    }
  }

  private generateStartGuidance(task: ExecutionTask, mood: string): ExecutionGuidance {
    const moodMessages = {
      energetic: '素晴らしいエネルギーです！この勢いで進みましょう！',
      focused: '集中モード突入！一歩ずつ確実に進んでいきます。',
      tired: '疲れているときこそ、小さな一歩が大切です。ゆっくり始めましょう。',
      distracted: '気が散っても大丈夫。マイクロステップで確実に進みます。',
      overwhelmed: '圧倒されている時は、まず深呼吸。一番小さなステップから。',
    };

    return {
      type: 'start',
      message: `${moodMessages[mood as keyof typeof moodMessages]}\n\n最初のステップ：${task.microSteps[0]?.description}`,
      visualCue: '🚀',
      nextAction: task.microSteps[0]?.description || '準備を始める',
      timeEstimate: task.microSteps[0]?.estimatedMinutes || 3,
      motivationalBoost: 'あなたならできます。今日もう一歩前進しましょう！',
    };
  }

  private generateProgressGuidance(step: MicroStep): ExecutionGuidance {
    const congratulations = [
      '素晴らしい！',
      'やりました！',
      '完璧です！',
      'その調子！',
      '順調です！',
    ];

    const randomCongrats = congratulations[Math.floor(Math.random() * congratulations.length)];

    return {
      type: 'celebration',
      message: `${randomCongrats} ${step.reward}\n\n次のステップに進む準備はできていますか？`,
      visualCue: '🎉',
      nextAction: '次のステップを確認する',
      motivationalBoost: '一歩一歩着実に前進しています！',
    };
  }

  private generateRecoveryGuidance(reason: string, severity: number): ExecutionGuidance {
    const recoveryStrategies = {
      distraction: {
        message: '気が散ってしまいましたね。大丈夫です、よくあることです。',
        nextAction: '深呼吸をして、今やっていたステップを思い出しましょう',
        visualCue: '🎯',
      },
      overwhelm: {
        message: '圧倒されてしまいました。少し休憩して、もっと小さなステップに分けましょう。',
        nextAction: '2分間リラックスして、一番簡単なことから再開',
        visualCue: '🌙',
      },
      boredom: {
        message: '退屈になってきました。少し変化をつけてみましょう。',
        nextAction: '環境を変えるか、報酬を思い出して再開',
        visualCue: '✨',
      },
      external: {
        message: '外部からの中断でした。元のタスクに戻る準備をしましょう。',
        nextAction: '中断前のステップを確認して再開',
        visualCue: '🔄',
      },
      physical: {
        message: '体の調子に合わせて調整しましょう。',
        nextAction: '体調に配慮したペースで再開',
        visualCue: '💪',
      },
    };

    const strategy =
      recoveryStrategies[reason as keyof typeof recoveryStrategies] ||
      recoveryStrategies.distraction;

    return {
      type: 'recovery',
      message: strategy.message,
      visualCue: strategy.visualCue,
      nextAction: strategy.nextAction,
      motivationalBoost: '中断は誰にでもあります。大切なのは再開することです。',
    };
  }

  private setupExecutionMonitoring(): void {
    // 5分ごとの進捗確認
    this.executionTimer = setInterval(
      () => {
        this.checkProgress();
      },
      5 * 60 * 1000
    );
  }

  private checkProgress(): void {
    if (!this.currentTask || !this.currentAttempt) return;

    const startTime = this.currentAttempt.startedAt.getTime();
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);

    // 長時間進捗がない場合の支援
    if (elapsedMinutes > 15 && this.currentAttempt.completedSteps === 0) {
      this.emit('needsSupport', {
        type: 'stagnation',
        message: '15分経過しました。少し休憩しませんか？',
      });
    }
  }

  private scheduleNextStepReminder(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }

    // 3分後にリマインダー
    this.reminderTimer = setTimeout(
      () => {
        this.emit('stepReminder', {
          message: '次のステップに進む時間です！',
        });
      },
      3 * 60 * 1000
    );
  }

  private setupPeriodicReminders(): void {
    // 1時間ごとの実行力チェック
    setInterval(
      () => {
        const tasks = this.getAllTasks();
        const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

        if (inProgressTasks.length === 0) {
          this.emit('executionReminder', {
            message: '何か実行できるタスクはありませんか？小さな一歩から始めましょう。',
          });
        }
      },
      60 * 60 * 1000
    );
  }

  private getNextIncompleteStep(): MicroStep | null {
    if (!this.currentTask) return null;
    return this.currentTask.microSteps.find((step) => !step.completed) || null;
  }

  private generateReward(stepDescription: string): string {
    const rewards = [
      'よくできました！小さな成功の積み重ねです。',
      '素晴らしい集中力でした！',
      'この調子で次も進みましょう！',
      '着実に前進しています！',
      '小さな一歩、大きな意味があります！',
    ];
    return rewards[Math.floor(Math.random() * rewards.length)];
  }

  // ストレージ関連
  private saveTask(task: ExecutionTask): void {
    const tasks = this.getAllTasks();
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem('adhd_execution_tasks', JSON.stringify(tasks));
  }

  private getTask(id: string): ExecutionTask | null {
    const tasks = this.getAllTasks();
    return tasks.find((t) => t.id === id) || null;
  }

  private getAllTasks(): ExecutionTask[] {
    try {
      const stored = localStorage.getItem('adhd_execution_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 分析用ヘルパーメソッド
  private identifyBestTimes(hours: number[]): string[] {
    // 時間帯別の成功率分析（簡易版）
    const timeRanges = [
      '朝(6-10時)',
      '午前(10-12時)',
      '昼(12-14時)',
      '午後(14-17時)',
      '夕方(17-19時)',
      '夜(19-22時)',
    ];
    return timeRanges.slice(0, 2); // 上位2つを返す（実装時はより詳細な分析）
  }

  private calculateAverageStepTime(tasks: ExecutionTask[]): number {
    const allSteps = tasks.flatMap((t) => t.microSteps.filter((s) => s.completed));
    const totalTime = allSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    return allSteps.length > 0 ? totalTime / allSteps.length : 3;
  }

  private identifySuccessfulStrategies(tasks: ExecutionTask[]): string[] {
    return [
      '2-5分のマイクロステップ化',
      '即座の報酬とフィードバック',
      '視覚的進捗表示',
      '中断時の復帰支援',
    ];
  }

  private generatePersonalizedRecommendations(tasks: ExecutionTask[]): string[] {
    return [
      'タスクをさらに細分化してみましょう',
      '実行時間帯を最適化しましょう',
      '中断要因を事前に対策しましょう',
      '報酬システムをカスタマイズしましょう',
    ];
  }

  private extractTaskTitle(task: string): string {
    return task.length > 30 ? task.substring(0, 30) + '...' : task;
  }

  private assessPriority(task: string): 'high' | 'medium' | 'low' {
    const urgentWords = ['急ぎ', '緊急', '今日', '期限', 'urgent', 'asap'];
    return urgentWords.some((word) => task.toLowerCase().includes(word)) ? 'high' : 'medium';
  }

  private assessDifficulty(task: string): 'easy' | 'medium' | 'hard' {
    const complexWords = ['分析', '設計', '調査', '検討', 'complex', 'difficult'];
    return complexWords.some((word) => task.toLowerCase().includes(word)) ? 'hard' : 'medium';
  }
}

export const adhdExecutionSupport = ADHDExecutionSupportService.getInstance();
export default adhdExecutionSupport;
