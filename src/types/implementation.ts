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
  status: 'planned' | 'in-progress' | 'completed' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedDays?: number;
  progress?: number;
  dependencies?: string[];
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
