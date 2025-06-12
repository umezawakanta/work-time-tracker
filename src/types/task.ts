// タスク管理の型定義を拡張
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';

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
  dependencies: string[]; // 依存するタスクのID
  blockedBy: string[]; // このタスクをブロックしているタスクのID

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId?: string;

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
