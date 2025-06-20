export interface SystemWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  isActive: boolean;
  createdBy: 'system' | 'user' | 'ai';
  category: 'productivity' | 'health' | 'learning' | 'finance';
}

export interface WorkflowTrigger {
  type: 'time_based' | 'task_completion' | 'habit_streak' | 'data_threshold';
  config: {
    schedule?: string; // cron形式
    taskCategory?: string;
    habitType?: string;
    threshold?: number;
  };
}

export interface WorkflowAction {
  type: 'create_task' | 'send_notification' | 'update_habit' | 'generate_report' | 'ai_analysis';
  config: Record<string, any>;
}

class SystematizationEngine {
  // 自動タスク生成
  async createAutomaticTasks(userPattern: UserPattern): Promise<TodoItem[]> {
    // ユーザーの行動パターンを分析して最適なタスクを自動生成
  }

  // 習慣の仕組み化
  async systematizeHabit(habit: HabitData): Promise<HabitSystemTemplate> {
    // 成功した習慣を他の人も使えるテンプレートに変換
  }

  // データドリブンな改善提案
  async generateSystemImprovements(userData: UserData): Promise<SystemImprovement[]> {
    // 個人のデータから継続可能な改善システムを提案
  }
}
