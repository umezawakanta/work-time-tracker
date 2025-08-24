export interface UserPreferences {
  workingHours: { start: string; end: string };
  focusBlocks: string[];
  breakIntervals: number;
  notificationSettings: Record<string, boolean>;
}

export interface SystemGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export interface SystemWorkflow {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SystemTemplate {
  id: string;
  name: string;
  category: string;
}

export interface CustomSystem {
  id: string;
  name: string;
  description: string;
}

export interface BehaviorPattern {
  type: string;
  frequency: number;
}

export interface SystemPrediction {
  event: string;
  probability: number;
}

export interface SystemRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

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
