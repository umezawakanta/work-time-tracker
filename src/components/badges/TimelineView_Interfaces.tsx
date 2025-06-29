// バッジタイムラインビューのインターフェース定義
interface TimelineBadge {
  id: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  estimatedHours: number;
  actualHours?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  progress: number; // 0-100
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[]; // 依存するバッジのID
  dependents: string[]; // このバッジに依存するバッジのID
  tags: string[];
  description: string;
  milestones: Array<{
    id: string;
    name: string;
    targetDate: string;
    isCompleted: boolean;
    completedDate?: string;
  }>;
  risks: Array<{
    type: 'schedule' | 'technical' | 'resource' | 'dependency';
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation?: string;
  }>;
}

interface TimelineEvent {
  id: string;
  type: 'badge_start' | 'badge_complete' | 'milestone' | 'dependency' | 'risk' | 'review';
  date: string;
  badgeId?: string;
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'actual' | 'overdue' | 'cancelled';
  relatedBadges?: string[];
}

interface TimelineFilter {
  categories: string[];
  difficulties: string[];
  statuses: string[];
  priorities: string[];
  dateRange: {
    start: string;
    end: string;
  };
  showDependencies: boolean;
  showMilestones: boolean;
  showRisks: boolean;
}

interface TimelineViewSettings {
  viewMode: 'timeline' | 'gantt' | 'calendar' | 'list';
  timeScale: 'day' | 'week' | 'month' | 'quarter';
  groupBy: 'category' | 'priority' | 'status' | 'none';
  showDetails: boolean;
  autoRefresh: boolean;
}
