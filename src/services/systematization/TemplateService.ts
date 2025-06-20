export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'health' | 'learning' | 'finance' | 'personal';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // 分
  components: TemplateComponent[];
  successMetrics: SuccessMetric[];
  userReviews: TemplateReview[];
  usageCount: number;
  effectivenessScore: number;
}

export interface TemplateComponent {
  type: 'task_template' | 'habit_routine' | 'automation_rule' | 'tracking_metric';
  config: any;
  dependencies: string[];
}

// 人気テンプレート例
const POPULAR_TEMPLATES: SystemTemplate[] = [
  {
    id: 'morning-routine-productivity',
    name: '生産性を最大化する朝のルーティン',
    description: '朝の3時間で1日の成果を決める仕組み',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedSetupTime: 30,
    components: [
      {
        type: 'habit_routine',
        config: {
          habits: ['wake_up_early', 'exercise', 'planning', 'deep_work'],
          schedule: '06:00-09:00',
          autoTrack: true,
        },
      },
      {
        type: 'automation_rule',
        config: {
          trigger: 'morning_routine_complete',
          action: 'create_daily_priorities',
        },
      },
    ],
  },
];
