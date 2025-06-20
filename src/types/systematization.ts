export interface SystematizationData {
  user: {
    id: string;
    systematizationLevel: number;
    preferences: UserPreferences;
    goals: SystemGoal[];
  };

  systems: {
    activeWorkflows: SystemWorkflow[];
    templates: SystemTemplate[];
    customSystems: CustomSystem[];
  };

  metrics: {
    automationSavings: number; // 時間節約（分/日）
    consistencyScore: number; // 継続率
    efficiencyGains: number; // 効率向上率
    systemHealth: number; // システム健全性
  };

  insights: {
    patterns: BehaviorPattern[];
    predictions: SystemPrediction[];
    recommendations: SystemRecommendation[];
  };
}
