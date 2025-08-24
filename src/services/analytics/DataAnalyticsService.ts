import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

export interface UserBehaviorEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  eventType:
    | 'page_view'
    | 'click'
    | 'form_submit'
    | 'feature_use'
    | 'task_complete'
    | 'conversion'
    | 'exit';
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl: string;
  referrer?: string;
  userAgent: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    screenResolution: string;
  };
  customProperties: Record<string, any>;
}

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: {
    percentage: number;
    criteria: Record<string, any>;
  };
  variants: ABTestVariant[];
  hypothesis: string;
  successMetrics: string[];
  createdBy: string;
  createdAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // Traffic allocation percentage
  config: Record<string, any>;
  isControl: boolean;
}

export interface ABTestResult {
  testId: string;
  variant: string;
  userId: string;
  sessionId: string;
  assignedAt: string;
  convertedAt?: string;
  conversionValue?: number;
  events: UserBehaviorEvent[];
}

export interface ConversionFunnelStep {
  id: string;
  name: string;
  description: string;
  eventCriteria: {
    eventType: string;
    eventAction?: string;
    pageUrl?: string;
    customProperties?: Record<string, any>;
  };
  order: number;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  description: string;
  steps: ConversionFunnelStep[];
  timeWindow: number; // Hours
  createdAt: string;
}

export interface FunnelAnalysisResult {
  funnelId: string;
  periodStart: string;
  periodEnd: string;
  totalUsers: number;
  stepResults: {
    stepId: string;
    stepName: string;
    usersReached: number;
    conversionRate: number;
    dropOffRate: number;
    averageTimeToNext?: number;
  }[];
  overallConversionRate: number;
  insights: string[];
}

export interface PredictiveAnalyticsModel {
  id: string;
  name: string;
  type: 'churn_prediction' | 'ltv_prediction' | 'engagement_score' | 'conversion_probability';
  description: string;
  features: string[];
  algorithm: string;
  accuracy: number;
  lastTrained: string;
  isActive: boolean;
}

export interface UserPrediction {
  userId: string;
  modelId: string;
  prediction: {
    value: number;
    confidence: number;
    factors: Record<string, number>;
  };
  calculatedAt: string;
  validUntil: string;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metrics: Record<string, number>;
  actionItems: string[];
  generatedAt: string;
  expiresAt?: string;
}

class DataAnalyticsService {
  // User Behavior Tracking
  async trackUserBehavior(event: Omit<UserBehaviorEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const eventId = `${event.userId}_${event.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const behaviorEvent: UserBehaviorEvent = {
        ...event,
        id: eventId,
        timestamp: new Date().toISOString(),
      };

      await setDoc(doc(db, 'user_behavior_events', eventId), {
        ...behaviorEvent,
        createdAt: serverTimestamp(),
      });

      // Update user analytics profile
      await this.updateUserAnalyticsProfile(event.userId, behaviorEvent);
    } catch (error) {
      console.error('Error tracking user behavior:', error);
      throw error;
    }
  }

  async getUserBehaviorEvents(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<UserBehaviorEvent[]> {
    try {
      const q = query(
        collection(db, 'user_behavior_events'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserBehaviorEvent);
    } catch (error) {
      console.error('Error fetching user behavior events:', error);
      return [];
    }
  }

  // A/B Testing Framework
  async createABTest(config: Omit<ABTestConfig, 'id' | 'createdAt'>): Promise<ABTestConfig> {
    try {
      const testId = `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const abTest: ABTestConfig = {
        ...config,
        id: testId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'ab_tests', testId), {
        ...abTest,
        createdAt: serverTimestamp(),
      });

      return abTest;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async assignUserToABTest(
    testId: string,
    userId: string,
    sessionId: string
  ): Promise<string | null> {
    try {
      const testDoc = await getDoc(doc(db, 'ab_tests', testId));
      if (!testDoc.exists()) {
        throw new Error('A/B test not found');
      }

      const test = testDoc.data() as ABTestConfig;
      if (test.status !== 'active') {
        return null;
      }

      // Check if user already assigned
      const existingAssignment = await getDoc(
        doc(db, 'ab_test_assignments', `${testId}_${userId}`)
      );
      if (existingAssignment.exists()) {
        return existingAssignment.data().variantId;
      }

      // Check if user meets criteria
      if (!(await this.userMeetsABTestCriteria(userId, test.targetAudience.criteria))) {
        return null;
      }

      // Assign to variant based on weights
      const variant = this.selectVariantForUser(test.variants, userId);

      const assignment: ABTestResult = {
        testId,
        variant: variant.id,
        userId,
        sessionId,
        assignedAt: new Date().toISOString(),
        events: [],
      };

      await setDoc(doc(db, 'ab_test_assignments', `${testId}_${userId}`), assignment);

      return variant.id;
    } catch (error) {
      console.error('Error assigning user to A/B test:', error);
      return null;
    }
  }

  async getABTestResults(testId: string): Promise<{
    test: ABTestConfig;
    results: Record<
      string,
      {
        participants: number;
        conversions: number;
        conversionRate: number;
        averageValue: number;
        confidence: number;
      }
    >;
    significance: boolean;
    winner?: string;
  }> {
    try {
      const testDoc = await getDoc(doc(db, 'ab_tests', testId));
      if (!testDoc.exists()) {
        throw new Error('A/B test not found');
      }

      const test = testDoc.data() as ABTestConfig;

      // Get all assignments for this test
      const assignmentsQuery = query(
        collection(db, 'ab_test_assignments'),
        where('testId', '==', testId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignments = assignmentsSnapshot.docs.map((doc) => doc.data() as ABTestResult);

      // Calculate results per variant
      const results: Record<string, any> = {};

      for (const variant of test.variants) {
        const variantAssignments = assignments.filter((a) => a.variant === variant.id);
        const conversions = variantAssignments.filter((a) => a.convertedAt).length;
        const totalValue = variantAssignments.reduce((sum, a) => sum + (a.conversionValue || 0), 0);

        results[variant.id] = {
          participants: variantAssignments.length,
          conversions,
          conversionRate:
            variantAssignments.length > 0 ? (conversions / variantAssignments.length) * 100 : 0,
          averageValue: conversions > 0 ? totalValue / conversions : 0,
          confidence: this.calculateStatisticalConfidence(variantAssignments),
        };
      }

      // Determine statistical significance and winner
      const significance = this.isStatisticallySignificant(results);
      const winner = significance ? this.determineWinner(results) : undefined;

      return {
        test,
        results,
        significance,
        winner,
      };
    } catch (error) {
      console.error('Error getting A/B test results:', error);
      throw error;
    }
  }

  // Conversion Funnel Analysis
  async createConversionFunnel(
    funnel: Omit<ConversionFunnel, 'id' | 'createdAt'>
  ): Promise<ConversionFunnel> {
    try {
      const funnelId = `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const conversionFunnel: ConversionFunnel = {
        ...funnel,
        id: funnelId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'conversion_funnels', funnelId), {
        ...conversionFunnel,
        createdAt: serverTimestamp(),
      });

      return conversionFunnel;
    } catch (error) {
      console.error('Error creating conversion funnel:', error);
      throw error;
    }
  }

  async analyzeFunnel(
    funnelId: string,
    startDate: string,
    endDate: string
  ): Promise<FunnelAnalysisResult> {
    try {
      const funnelDoc = await getDoc(doc(db, 'conversion_funnels', funnelId));
      if (!funnelDoc.exists()) {
        throw new Error('Conversion funnel not found');
      }

      const funnel = funnelDoc.data() as ConversionFunnel;

      // Get all events in the time period
      const eventsQuery = query(
        collection(db, 'user_behavior_events'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'asc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => doc.data() as UserBehaviorEvent);

      // Track users through funnel steps
      const userJourneys = new Map<string, UserBehaviorEvent[]>();
      events.forEach((event) => {
        if (!userJourneys.has(event.userId)) {
          userJourneys.set(event.userId, []);
        }
        userJourneys.get(event.userId)!.push(event);
      });

      const stepResults = [];
      let remainingUsers = new Set(userJourneys.keys());

      for (const step of funnel.steps.sort((a, b) => a.order - b.order)) {
        const usersReachingStep = new Set<string>();
        const stepTimes: number[] = [];

        for (const userId of remainingUsers) {
          const userEvents = userJourneys.get(userId)!;
          const stepEvent = userEvents.find((event) =>
            this.eventMatchesCriteria(event, step.eventCriteria)
          );

          if (stepEvent) {
            usersReachingStep.add(userId);

            // Calculate time to reach this step
            const firstEvent = userEvents[0];
            const timeToStep =
              new Date(stepEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime();
            stepTimes.push(timeToStep);
          }
        }

        const usersReached = usersReachingStep.size;
        const conversionRate =
          remainingUsers.size > 0 ? (usersReached / remainingUsers.size) * 100 : 0;
        const dropOffRate = 100 - conversionRate;
        const averageTimeToNext =
          stepTimes.length > 0
            ? stepTimes.reduce((sum, time) => sum + time, 0) / stepTimes.length / (1000 * 60)
            : undefined; // minutes

        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          usersReached,
          conversionRate,
          dropOffRate,
          averageTimeToNext,
        });

        remainingUsers = usersReachingStep;
      }

      const totalUsers = userJourneys.size;
      const finalUsers = remainingUsers.size;
      const overallConversionRate = totalUsers > 0 ? (finalUsers / totalUsers) * 100 : 0;

      // Generate insights
      const insights = this.generateFunnelInsights(stepResults, overallConversionRate);

      return {
        funnelId,
        periodStart: startDate,
        periodEnd: endDate,
        totalUsers,
        stepResults,
        overallConversionRate,
        insights,
      };
    } catch (error) {
      console.error('Error analyzing funnel:', error);
      throw error;
    }
  }

  // Predictive Analytics
  async generatePredictiveAnalytics(
    userId: string,
    modelType: PredictiveAnalyticsModel['type']
  ): Promise<UserPrediction | null> {
    try {
      // Get user behavior data
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

      const userEvents = await this.getUserBehaviorEvents(userId, startDate, endDate);

      if (userEvents.length === 0) {
        return null;
      }

      // Calculate features based on model type
      const features = this.extractFeaturesForPrediction(userEvents, modelType);

      // Simple prediction algorithm (in production, this would use ML models)
      const prediction = this.calculatePrediction(features, modelType);

      const userPrediction: UserPrediction = {
        userId,
        modelId: `${modelType}_model_v1`,
        prediction,
        calculatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      // Save prediction
      await setDoc(doc(db, 'user_predictions', `${userId}_${modelType}`), {
        ...userPrediction,
        createdAt: serverTimestamp(),
      });

      return userPrediction;
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      return null;
    }
  }

  async generateAnalyticsInsights(): Promise<AnalyticsInsight[]> {
    try {
      const insights: AnalyticsInsight[] = [];
      const now = new Date();

      // Get recent behavior data
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = now.toISOString();

      const eventsQuery = query(
        collection(db, 'user_behavior_events'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        limit(10000)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => doc.data() as UserBehaviorEvent);

      // Generate various insights
      insights.push(...this.generateUsageInsights(events));
      insights.push(...this.generatePerformanceInsights(events));
      insights.push(...this.generateUserExperienceInsights(events));
      insights.push(...this.generateConversionInsights(events));

      // Save insights
      const batch = writeBatch(db);
      insights.forEach((insight) => {
        const insightRef = doc(collection(db, 'analytics_insights'));
        batch.set(insightRef, {
          ...insight,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();

      return insights;
    } catch (error) {
      console.error('Error generating analytics insights:', error);
      return [];
    }
  }

  // Private helper methods
  private async updateUserAnalyticsProfile(
    userId: string,
    event: UserBehaviorEvent
  ): Promise<void> {
    const profileRef = doc(db, 'user_analytics_profiles', userId);
    const profileDoc = await getDoc(profileRef);

    const currentData = profileDoc.exists()
      ? profileDoc.data()
      : {
          userId,
          totalEvents: 0,
          lastActive: event.timestamp,
          deviceTypes: {},
          topPages: {},
          eventCounts: {},
        };

    // Update analytics profile
    currentData.totalEvents++;
    currentData.lastActive = event.timestamp;
    currentData.deviceTypes[event.deviceInfo.type] =
      (currentData.deviceTypes[event.deviceInfo.type] || 0) + 1;
    currentData.topPages[event.pageUrl] = (currentData.topPages[event.pageUrl] || 0) + 1;
    currentData.eventCounts[event.eventType] = (currentData.eventCounts[event.eventType] || 0) + 1;

    await setDoc(profileRef, {
      ...currentData,
      updatedAt: serverTimestamp(),
    });
  }

  private async userMeetsABTestCriteria(
    userId: string,
    criteria: Record<string, any>
  ): Promise<boolean> {
    // Simplified criteria matching - in production, this would be more sophisticated
    return Math.random() < 0.8; // 80% of users meet criteria
  }

  private selectVariantForUser(variants: ABTestVariant[], userId: string): ABTestVariant {
    // Simple hash-based assignment for consistent variant selection
    const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedPosition = (userHash % 100) / 100;

    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight / totalWeight;
      if (normalizedPosition <= cumulativeWeight) {
        return variant;
      }
    }

    return variants[0]; // Fallback
  }

  private calculateStatisticalConfidence(assignments: ABTestResult[]): number {
    // Simplified confidence calculation - in production, use proper statistical tests
    const sampleSize = assignments.length;
    if (sampleSize < 30) return 0;

    const baseConfidence = Math.min(sampleSize / 1000, 0.95);
    return Math.round(baseConfidence * 100);
  }

  private isStatisticallySignificant(results: Record<string, any>): boolean {
    const variants = Object.values(results);
    if (variants.length < 2) return false;

    // Simple significance test - check if difference in conversion rates is meaningful
    const rates = variants.map((v: any) => v.conversionRate);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);

    return maxRate - minRate > 5 && Math.max(...variants.map((v: any) => v.confidence)) > 90;
  }

  private determineWinner(results: Record<string, any>): string {
    let bestVariant = '';
    let bestRate = 0;

    for (const [variantId, result] of Object.entries(results)) {
      if ((result as any).conversionRate > bestRate) {
        bestRate = (result as any).conversionRate;
        bestVariant = variantId;
      }
    }

    return bestVariant;
  }

  private eventMatchesCriteria(
    event: UserBehaviorEvent,
    criteria: ConversionFunnelStep['eventCriteria']
  ): boolean {
    if (event.eventType !== criteria.eventType) return false;
    if (criteria.eventAction && event.eventAction !== criteria.eventAction) return false;
    if (criteria.pageUrl && !event.pageUrl.includes(criteria.pageUrl)) return false;

    // Check custom properties
    if (criteria.customProperties) {
      for (const [key, value] of Object.entries(criteria.customProperties)) {
        if (event.customProperties[key] !== value) return false;
      }
    }

    return true;
  }

  private extractFeaturesForPrediction(
    events: UserBehaviorEvent[],
    modelType: string
  ): Record<string, number> {
    const features: Record<string, number> = {};

    // Common features
    features.totalEvents = events.length;
    features.uniqueDays = new Set(events.map((e) => e.timestamp.split('T')[0])).size;
    features.avgEventsPerDay = features.totalEvents / Math.max(features.uniqueDays, 1);
    features.deviceTypes = new Set(events.map((e) => e.deviceInfo.type)).size;
    features.uniquePages = new Set(events.map((e) => e.pageUrl)).size;

    // Model-specific features
    switch (modelType) {
      case 'churn_prediction':
        features.daysSinceLastActivity = Math.floor(
          (Date.now() - new Date(events[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)
        );
        features.sessionFrequency = events.length / 30; // events per day over 30 days
        break;

      case 'engagement_score':
        features.completionEvents = events.filter((e) => e.eventType === 'task_complete').length;
        features.featureUsageEvents = events.filter((e) => e.eventType === 'feature_use').length;
        break;
    }

    return features;
  }

  private calculatePrediction(
    features: Record<string, number>,
    modelType: string
  ): UserPrediction['prediction'] {
    // Simplified prediction calculation - in production, use trained ML models
    let value = 0;
    const confidence = 0.7;
    const factors: Record<string, number> = {};

    switch (modelType) {
      case 'churn_prediction':
        // Higher activity = lower churn probability
        value = Math.max(0, Math.min(1, 1 - features.avgEventsPerDay / 10));
        factors.activityLevel = features.avgEventsPerDay;
        factors.recency = features.daysSinceLastActivity;
        break;

      case 'engagement_score':
        // Score based on activity and completion
        value = Math.min(100, features.completionEvents * 10 + features.avgEventsPerDay * 5);
        factors.completions = features.completionEvents;
        factors.activity = features.avgEventsPerDay;
        break;

      default:
        value = 0.5;
    }

    return { value, confidence, factors };
  }

  private generateFunnelInsights(stepResults: any[], overallConversionRate: number): string[] {
    const insights: string[] = [];

    // Find biggest drop-off
    let maxDropOff = 0;
    let dropOffStep = '';

    stepResults.forEach((step) => {
      if (step.dropOffRate > maxDropOff) {
        maxDropOff = step.dropOffRate;
        dropOffStep = step.stepName;
      }
    });

    if (maxDropOff > 50) {
      insights.push(`最大の離脱ポイント: ${dropOffStep} (${maxDropOff.toFixed(1)}%の離脱)`);
    }

    if (overallConversionRate < 10) {
      insights.push('全体的なコンバージョン率が低く、改善の余地があります');
    }

    // Time-based insights
    const avgTimes = stepResults.filter((s) => s.averageTimeToNext).map((s) => s.averageTimeToNext);
    if (avgTimes.length > 0) {
      const maxTime = Math.max(...avgTimes);
      if (maxTime > 60) {
        // More than 1 hour
        insights.push('一部のステップで完了に時間がかかりすぎています');
      }
    }

    return insights;
  }

  private generateUsageInsights(events: UserBehaviorEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Page view analysis
    const pageViews = events.filter((e) => e.eventType === 'page_view');
    const topPages = this.getTopItems(
      pageViews.map((e) => e.pageUrl),
      5
    );

    insights.push({
      id: `usage_insight_${Date.now()}`,
      type: 'trend',
      title: '人気ページランキング',
      description: `過去7日間で最もアクセスされたページを特定しました`,
      severity: 'low',
      category: 'usage',
      metrics: { totalPageViews: pageViews.length, uniquePages: topPages.length },
      actionItems: ['人気ページの機能拡張を検討', 'アクセスの少ないページの改善'],
      generatedAt: new Date().toISOString(),
    });

    return insights;
  }

  private generatePerformanceInsights(events: UserBehaviorEvent[]): AnalyticsInsight[] {
    // Implementation for performance insights
    return [];
  }

  private generateUserExperienceInsights(events: UserBehaviorEvent[]): AnalyticsInsight[] {
    // Implementation for UX insights
    return [];
  }

  private generateConversionInsights(events: UserBehaviorEvent[]): AnalyticsInsight[] {
    // Implementation for conversion insights
    return [];
  }

  private getTopItems(items: string[], limit: number): { item: string; count: number }[] {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const dataAnalyticsService = new DataAnalyticsService();
