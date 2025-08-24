// 月次概要ビューのインターフェース定義
interface MonthlyBadgeCategory {
  name: string;
  progress: number;
  count: number;
  completedCount: number;
  icon: string;
  color: string;
  estimatedHours: number;
  actualHours: number;
  efficiency: number;
  topBadges: string[];
}

interface MonthlyMetrics {
  month: string;
  year: number;
  totalBadges: number;
  completedBadges: number;
  inProgressBadges: number;
  plannedHours: number;
  actualHours: number;
  efficiency: number;
  completionRate: number;
  averageConfidence: number;
  streakDays: number;
  topPerformingCategory: string;
}

interface MonthlyTrend {
  category: string;
  previousMonth: number;
  currentMonth: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

interface MonthlyAchievement {
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  completedDate: string;
  hoursSpent: number;
  difficulty: string;
  impact: 'high' | 'medium' | 'low';
}

interface MonthlyOverviewData {
  metrics: MonthlyMetrics;
  categories: MonthlyBadgeCategory[];
  trends: MonthlyTrend[];
  achievements: MonthlyAchievement[];
  weeklyBreakdown: Array<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    completedBadges: number;
    hoursSpent: number;
    efficiency: number;
  }>;
  predictions: {
    nextMonthBadges: number;
    nextMonthHours: number;
    recommendedFocus: string[];
  };
}
