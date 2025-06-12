// タスク管理の型定義を拡張
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags: string[];
  assignee?: string;
  estimatedTime?: number; // 分単位
  actualTime?: number; // 分単位
  subtasks: SubTask[];
  dependencies: string[]; // 依存するタスクのID
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  category?: string;
  progress: number; // 0-100

  // 期限管理
  deadline?: Date;
  startDate?: Date;
  estimatedDuration?: number; // 分単位

  // カテゴリとタグ
  category?: string;
  tags: string[];

  // AI機能用
  aiSuggestions?: TaskSuggestion[];
  complexityScore?: number;

  // 依存関係
  blockedBy: string[]; // このタスクをブロックしているタスクのID

  // メタデータ
  userId: string;

  // カレンダー統合
  calendarEventId?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'completed' | 'archived';
  tasks: string[]; // タスクIDの配列
  teamMembers: string[]; // ユーザーIDの配列
  wbsStructure?: WBSNode[];
}

export interface WBSNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  parentId?: string;
  children: string[];
  taskId?: string; // 関連するタスクID
  estimatedDuration?: number;
  dependencies: string[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskFilter {
  status?: Task['status'][];
  priority?: Task['priority'][];
  tags?: string[];
  assignee?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
}

export interface TaskSort {
  field: keyof Task;
  direction: 'asc' | 'desc';
}
