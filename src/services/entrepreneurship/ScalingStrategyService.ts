import { toast } from '@/components/ui/use-toast';

export interface ScalingMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: 'user_growth' | 'revenue' | 'infrastructure' | 'team' | 'market_expansion';
  growthRate: number; // percentage
  isOnTrack: boolean;
  lastUpdated: string;
}

export interface GrowthStrategy {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'marketing' | 'sales' | 'operations' | 'technology';
  priority: 'high' | 'medium' | 'low';
  implementation: 'planning' | 'in_progress' | 'completed' | 'paused';
  expectedImpact: number; // 1-10 scale
  resourcesRequired: string[];
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      title: string;
      date: string;
      isCompleted: boolean;
    }>;
  };
  metrics: ScalingMetric[];
}

/**
 * 📈 スケーリング戦略サービス - 成長戦略の策定と実行
 */
class ScalingStrategyService {
  private static instance: ScalingStrategyService | null = null;
  private metrics: Map<string, ScalingMetric> = new Map();
  private strategies: Map<string, GrowthStrategy> = new Map();
  private trackingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeMetrics();
    this.initializeStrategies();
    this.startGrowthTracking();
    console.log('📈 Scaling Strategy Service initialized');
  }

  public static getInstance(): ScalingStrategyService {
    if (!ScalingStrategyService.instance) {
      ScalingStrategyService.instance = new ScalingStrategyService();
    }
    return ScalingStrategyService.instance;
  }

  private initializeMetrics(): void {
    const initialMetrics: ScalingMetric[] = [
      {
        id: 'monthly_active_users',
        name: 'Monthly Active Users',
        currentValue: 1500,
        targetValue: 10000,
        unit: 'users',
        category: 'user_growth',
        growthRate: 25,
        isOnTrack: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'monthly_revenue',
        name: 'Monthly Recurring Revenue',
        currentValue: 2500,
        targetValue: 50000,
        unit: 'USD',
        category: 'revenue',
        growthRate: 35,
        isOnTrack: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'customer_acquisition_cost',
        name: 'Customer Acquisition Cost',
        currentValue: 45,
        targetValue: 25,
        unit: 'USD',
        category: 'user_growth',
        growthRate: -20,
        isOnTrack: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    initialMetrics.forEach((metric) => {
      this.metrics.set(metric.id, metric);
    });

    console.log('📊 Scaling metrics initialized:', initialMetrics.length);
  }

  private initializeStrategies(): void {
    const growthStrategies: GrowthStrategy[] = [
      {
        id: 'user_acquisition_optimization',
        title: 'User Acquisition Optimization',
        description: 'Optimize user acquisition channels and improve conversion rates',
        category: 'marketing',
        priority: 'high',
        implementation: 'in_progress',
        expectedImpact: 8,
        resourcesRequired: ['Marketing Budget', 'Analytics Tools', 'Content Creation'],
        timeline: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            {
              title: 'A/B Test Landing Pages',
              date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              isCompleted: false,
            },
            {
              title: 'Implement Referral Program',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isCompleted: false,
            },
          ],
        },
        metrics: ['monthly_active_users', 'customer_acquisition_cost']
          .map((id) => this.metrics.get(id)!)
          .filter(Boolean),
      },
      {
        id: 'product_feature_expansion',
        title: 'Product Feature Expansion',
        description: 'Expand core product features to increase user retention and engagement',
        category: 'product',
        priority: 'high',
        implementation: 'planning',
        expectedImpact: 9,
        resourcesRequired: ['Development Team', 'User Research', 'Design Resources'],
        timeline: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            {
              title: 'User Research & Feature Prioritization',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isCompleted: false,
            },
            {
              title: 'MVP Development',
              date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              isCompleted: false,
            },
          ],
        },
        metrics: [],
      },
      {
        id: 'revenue_diversification',
        title: 'Revenue Stream Diversification',
        description:
          'Create multiple revenue streams to reduce dependency and increase total revenue',
        category: 'sales',
        priority: 'medium',
        implementation: 'planning',
        expectedImpact: 7,
        resourcesRequired: ['Business Development', 'Product Marketing', 'Sales Team'],
        timeline: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            {
              title: 'Market Research & Validation',
              date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              isCompleted: false,
            },
          ],
        },
        metrics: ['monthly_revenue'].map((id) => this.metrics.get(id)!).filter(Boolean),
      },
    ];

    growthStrategies.forEach((strategy) => {
      this.strategies.set(strategy.id, strategy);
    });

    console.log('🚀 Growth strategies initialized:', growthStrategies.length);
  }

  private startGrowthTracking(): void {
    this.calculateGrowthMetrics();

    this.trackingInterval = setInterval(
      () => {
        this.calculateGrowthMetrics();
        this.updateStrategyProgress();
      },
      24 * 60 * 60 * 1000
    ); // Daily tracking

    console.log('📈 Growth tracking started');
  }

  private calculateGrowthMetrics(): void {
    for (const metric of this.metrics.values()) {
      // Simulate growth based on strategies
      const activeStrategies = Array.from(this.strategies.values()).filter(
        (s) => s.implementation === 'in_progress'
      );

      let growthBoost = 0;
      activeStrategies.forEach((strategy) => {
        if (strategy.metrics.some((m) => m.id === metric.id)) {
          growthBoost += strategy.expectedImpact * 0.1;
        }
      });

      // Update metric with growth
      const baseGrowth = metric.growthRate / 100;
      const totalGrowth = baseGrowth + growthBoost / 100;

      if (metric.currentValue < metric.targetValue) {
        metric.currentValue = Math.min(metric.targetValue, metric.currentValue * (1 + totalGrowth));
      }

      metric.isOnTrack = this.isMetricOnTrack(metric);
      metric.lastUpdated = new Date().toISOString();
    }

    console.log('📊 Growth metrics updated');
  }

  private isMetricOnTrack(metric: ScalingMetric): boolean {
    const progress = metric.currentValue / metric.targetValue;
    return progress >= 0.3; // At least 30% progress considered on track
  }

  private updateStrategyProgress(): void {
    for (const strategy of this.strategies.values()) {
      // Update milestone completion based on timeline
      const now = new Date();
      strategy.timeline.milestones.forEach((milestone) => {
        if (
          new Date(milestone.date) <= now &&
          !milestone.isCompleted &&
          strategy.priority === 'high' &&
          Math.random() > 0.3
        ) {
          milestone.isCompleted = true;
        }
      });

      // Update implementation status
      const completedMilestones = strategy.timeline.milestones.filter((m) => m.isCompleted).length;
      const totalMilestones = strategy.timeline.milestones.length;

      if (completedMilestones === totalMilestones) {
        strategy.implementation = 'completed';
      } else if (completedMilestones > 0) {
        strategy.implementation = 'in_progress';
      }
    }

    console.log('🎯 Strategy progress updated');
  }

  public getScalingDashboard(): {
    metrics: ScalingMetric[];
    strategies: GrowthStrategy[];
    overallGrowthRate: number;
    strategiesCompleted: number;
    metricsOnTrack: number;
    recommendations: string[];
  } {
    const metrics = Array.from(this.metrics.values());
    const strategies = Array.from(this.strategies.values());

    const overallGrowthRate = metrics.reduce((sum, m) => sum + m.growthRate, 0) / metrics.length;
    const strategiesCompleted = strategies.filter((s) => s.implementation === 'completed').length;
    const metricsOnTrack = metrics.filter((m) => m.isOnTrack).length;

    const recommendations = this.generateRecommendations(metrics, strategies);

    return {
      metrics,
      strategies,
      overallGrowthRate,
      strategiesCompleted,
      metricsOnTrack,
      recommendations,
    };
  }

  private generateRecommendations(
    metrics: ScalingMetric[],
    strategies: GrowthStrategy[]
  ): string[] {
    const recommendations: string[] = [];

    const offTrackMetrics = metrics.filter((m) => !m.isOnTrack);
    if (offTrackMetrics.length > 0) {
      recommendations.push(
        `以下のメトリクスが目標から乖離しています: ${offTrackMetrics.map((m) => m.name).join(', ')}`
      );
    }

    const stagnantStrategies = strategies.filter((s) => s.implementation === 'planning');
    if (stagnantStrategies.length > 0) {
      recommendations.push('計画段階の戦略を実行に移してください');
    }

    const highImpactStrategies = strategies.filter(
      (s) => s.expectedImpact >= 8 && s.implementation !== 'completed'
    );
    if (highImpactStrategies.length > 0) {
      recommendations.push('高インパクト戦略を優先実行してください');
    }

    if (recommendations.length === 0) {
      recommendations.push('順調に成長しています！さらなる改善機会を探しましょう');
    }

    return recommendations;
  }

  public cleanup(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    console.log('🧹 Scaling Strategy Service cleaned up');
  }
}

export const scalingStrategyService = ScalingStrategyService.getInstance();
