export interface Task {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  checklist: ChecklistItem[];
  startDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  branch?: string;
  pr?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dependencies: string[];
  notes: string;
  researchResult?: {
    content: string;
    knowledgeEntries: string[];
    executedAt: string;
    executedBy: string;
    confidence: number;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
}

export interface SuggestedTask {
  id: string;
  title: string;
  description: string;
  reason: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  checklist: string[];
  phase: string;
  tags: string[];
  confidence: number;
  source: 'ai_analysis' | 'template' | 'user_pattern';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  skills: string[];
  availability: 'available' | 'busy' | 'unavailable';
  workload: number;
}

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  difficulty: 'high' | 'medium' | 'low';
  estimatedDays: number;
  actualDays?: number; // 実際にかかった日数
  progress?: number; // 進捗率 (0-100)
  status: 'planned' | 'in-progress' | 'completed' | 'deferred' | 'not-started';
  acceptance?: string; // 完了基準
  technicalDetails?: string; // 技術詳細
  blockingIssues?: string[]; // ブロッキング課題
  implementationNotes?: string; // 実装メモ
  tags?: string[]; // タグ
  dependencies?: string[]; // 依存関係
  relatedItems?: string[]; // 関連項目
  assignee?: string;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  phase: number;
  outcomes?: string[];
}

export interface PhaseData {
  id: string;
  title: string;
  duration: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  startDate?: string;
  endDate?: string;
}
