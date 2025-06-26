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
  Timestamp,
} from 'firebase/firestore';

export interface UserActivity {
  userId: string;
  sessionId: string;
  timestamp: string;
  duration: number; // in minutes
  actions: UserAction[];
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    platform: string;
  };
  engagement: {
    pageViews: number;
    interactions: number;
    tasksCompleted: number;
    featuresUsed: string[];
  };
}

export interface UserAction {
  type: 'page_view' | 'task_create' | 'task_complete' | 'feature_use' | 'click' | 'form_submit';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RetentionCohort {
  cohortMonth: string; // YYYY-MM format
  cohortSize: number;
  registrations: number;
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  averageSessionDuration: number;
  averageActionsPerSession: number;
  churnRate: number;
}

export interface UserEngagementScore {
  userId: string;
  score: number; // 0-100
  factors: {
    frequency: number; // How often they visit
    recency: number; // How recently they visited
    depth: number; // How many features they use
    duration: number; // How long they stay
    completion: number; // How much they complete tasks
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  lastCalculated: string;
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number; // 0-1
  daysUntilPredictedChurn: number;
  riskFactors: string[];
  interventionRecommendations: string[];
  lastActive: string;
  predictionDate: string;
}

export interface RetentionMetrics {
  overview: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    retentionRates: {
      day1: number;
      day7: number;
      day30: number;
    };
    churnRate: number;
    averageSessionDuration: number;
    averageEngagementScore: number;
  };
  cohorts: RetentionCohort[];
  topChurnRisks: UserEngagementScore[];
  engagementTrends: {
    date: string;
    dailyActiveUsers: number;
    averageSessionDuration: number;
    completionRate: number;
  }[];
}

class RetentionAnalyticsService {
  private readonly ENGAGEMENT_WEIGHTS = {
    frequency: 0.25,
    recency: 0.2,
    depth: 0.2,
    duration: 0.15,
    completion: 0.2,
  };

  private readonly ACTIVITY_POINTS = {
    page_view: 1,
    task_create: 5,
    task_complete: 10,
    feature_use: 3,
    click: 1,
    form_submit: 3,
  };

  async trackUserActivity(activity: UserActivity): Promise<void> {
    try {
      const activityRef = doc(collection(db, 'user_activities'));
      await setDoc(activityRef, {
        ...activity,
        createdAt: serverTimestamp(),
      });

      // Update user's last activity
      const userRef = doc(db, 'users', activity.userId);
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
        lastSessionDuration: activity.duration,
        totalSessions: (await this.getUserSessionCount(activity.userId)) + 1,
      });

      // Update engagement score
      await this.updateUserEngagementScore(activity.userId);
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  }

  async getUserActivityHistory(userId: string, days: number = 30): Promise<UserActivity[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(db, 'user_activities'),
        where('userId', '==', userId),
        where('timestamp', '>=', cutoffDate.toISOString()),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserActivity);
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      return [];
    }
  }

  async calculateUserEngagementScore(userId: string): Promise<UserEngagementScore> {
    try {
      const activities = await this.getUserActivityHistory(userId, 30);
      const now = new Date();

      if (activities.length === 0) {
        return {
          userId,
          score: 0,
          factors: {
            frequency: 0,
            recency: 0,
            depth: 0,
            duration: 0,
            completion: 0,
          },
          trend: 'decreasing',
          riskLevel: 'high',
          recommendations: ['ユーザーはまだアクティビティがありません'],
          lastCalculated: now.toISOString(),
        };
      }

      // Calculate frequency (sessions per week)
      const weeklySessionCount = activities.length / 4.3; // 30 days / 7 days
      const frequencyScore = Math.min(weeklySessionCount * 20, 100); // 5 sessions per week = 100 points

      // Calculate recency (days since last activity)
      const lastActivity = new Date(activities[0].timestamp);
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyScore = Math.max(100 - daysSinceLastActivity * 10, 0); // Lose 10 points per day

      // Calculate depth (unique features used)
      const uniqueFeatures = new Set<string>();
      activities.forEach((activity) => {
        activity.engagement.featuresUsed.forEach((feature) => uniqueFeatures.add(feature));
      });
      const depthScore = Math.min(uniqueFeatures.size * 10, 100); // 10 features = 100 points

      // Calculate duration (average session length)
      const avgSessionDuration =
        activities.reduce((sum, a) => sum + a.duration, 0) / activities.length;
      const durationScore = Math.min(avgSessionDuration * 2, 100); // 50 minutes average = 100 points

      // Calculate completion (tasks completed vs created)
      const totalTasksCompleted = activities.reduce(
        (sum, a) => sum + a.engagement.tasksCompleted,
        0
      );
      const totalInteractions = activities.reduce((sum, a) => sum + a.engagement.interactions, 0);
      const completionScore =
        totalInteractions > 0 ? Math.min((totalTasksCompleted / totalInteractions) * 100, 100) : 0;

      // Calculate weighted score
      const score = Math.round(
        frequencyScore * this.ENGAGEMENT_WEIGHTS.frequency +
          recencyScore * this.ENGAGEMENT_WEIGHTS.recency +
          depthScore * this.ENGAGEMENT_WEIGHTS.depth +
          durationScore * this.ENGAGEMENT_WEIGHTS.duration +
          completionScore * this.ENGAGEMENT_WEIGHTS.completion
      );

      // Determine trend
      const recentActivities = activities.slice(0, Math.floor(activities.length / 2));
      const olderActivities = activities.slice(Math.floor(activities.length / 2));

      const recentAvg =
        recentActivities.length > 0
          ? recentActivities.reduce((sum, a) => sum + a.engagement.interactions, 0) /
            recentActivities.length
          : 0;
      const olderAvg =
        olderActivities.length > 0
          ? olderActivities.reduce((sum, a) => sum + a.engagement.interactions, 0) /
            olderActivities.length
          : 0;

      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentAvg > olderAvg * 1.1) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (score < 30 || daysSinceLastActivity > 7) riskLevel = 'high';
      else if (score < 60 || daysSinceLastActivity > 3) riskLevel = 'medium';

      // Generate recommendations
      const recommendations = this.generateEngagementRecommendations({
        score,
        factors: {
          frequency: frequencyScore,
          recency: recencyScore,
          depth: depthScore,
          duration: durationScore,
          completion: completionScore,
        },
        trend,
        riskLevel,
      });

      const engagementScore: UserEngagementScore = {
        userId,
        score,
        factors: {
          frequency: frequencyScore,
          recency: recencyScore,
          depth: depthScore,
          duration: durationScore,
          completion: completionScore,
        },
        trend,
        riskLevel,
        recommendations,
        lastCalculated: now.toISOString(),
      };

      // Save to database
      await setDoc(doc(db, 'user_engagement_scores', userId), {
        ...engagementScore,
        updatedAt: serverTimestamp(),
      });

      return engagementScore;
    } catch (error) {
      console.error('Error calculating user engagement score:', error);
      throw error;
    }
  }

  async updateUserEngagementScore(userId: string): Promise<void> {
    await this.calculateUserEngagementScore(userId);
  }

  async predictChurn(userId: string): Promise<ChurnPrediction> {
    try {
      const engagementScore = await this.calculateUserEngagementScore(userId);
      const activities = await this.getUserActivityHistory(userId, 30);

      if (activities.length === 0) {
        return {
          userId,
          churnProbability: 0.95,
          daysUntilPredictedChurn: 1,
          riskFactors: ['ユーザーアクティビティなし'],
          interventionRecommendations: [
            'オンボーディング再開',
            'パーソナライズされたコンテンツ送信',
          ],
          lastActive: 'never',
          predictionDate: new Date().toISOString(),
        };
      }

      // Calculate churn probability based on multiple factors
      let churnProbability = 0;

      // Factor 1: Days since last activity
      const lastActivity = new Date(activities[0].timestamp);
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      churnProbability += Math.min(daysSinceLastActivity * 0.1, 0.6);

      // Factor 2: Engagement score decline
      const scoreDecline = Math.max(0, 80 - engagementScore.score) / 100;
      churnProbability += scoreDecline * 0.3;

      // Factor 3: Session frequency decline
      const recentSessions = activities.filter(
        (a) => new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      const expectedSessions = 3; // 3 sessions per week expected
      if (recentSessions < expectedSessions) {
        churnProbability += (expectedSessions - recentSessions) * 0.1;
      }

      // Factor 4: Feature usage decline
      const uniqueFeaturesRecent = new Set<string>();
      activities.slice(0, 5).forEach((activity) => {
        activity.engagement.featuresUsed.forEach((feature) => uniqueFeaturesRecent.add(feature));
      });

      const uniqueFeaturesOlder = new Set<string>();
      activities.slice(5, 10).forEach((activity) => {
        activity.engagement.featuresUsed.forEach((feature) => uniqueFeaturesOlder.add(feature));
      });

      if (uniqueFeaturesRecent.size < uniqueFeaturesOlder.size) {
        churnProbability += 0.15;
      }

      churnProbability = Math.min(churnProbability, 1);

      // Predict days until churn
      const daysUntilChurn =
        churnProbability > 0.8 ? 3 : churnProbability > 0.6 ? 7 : churnProbability > 0.4 ? 14 : 30;

      // Identify risk factors
      const riskFactors: string[] = [];
      if (daysSinceLastActivity > 3) riskFactors.push('長期間非アクティブ');
      if (engagementScore.score < 50) riskFactors.push('エンゲージメントスコア低下');
      if (recentSessions < 2) riskFactors.push('セッション頻度低下');
      if (uniqueFeaturesRecent.size < 3) riskFactors.push('機能使用率低下');

      // Generate intervention recommendations
      const interventionRecommendations = this.generateChurnInterventions(
        churnProbability,
        riskFactors
      );

      const prediction: ChurnPrediction = {
        userId,
        churnProbability,
        daysUntilPredictedChurn: daysUntilChurn,
        riskFactors,
        interventionRecommendations,
        lastActive: lastActivity.toISOString(),
        predictionDate: new Date().toISOString(),
      };

      // Save prediction to database
      await setDoc(doc(db, 'churn_predictions', userId), {
        ...prediction,
        createdAt: serverTimestamp(),
      });

      return prediction;
    } catch (error) {
      console.error('Error predicting churn:', error);
      throw error;
    }
  }

  async getRetentionMetrics(): Promise<RetentionMetrics> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const totalUsers = users.length;

      // Calculate active users
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get recent activities
      const recentActivitiesQuery = query(
        collection(db, 'user_activities'),
        where('timestamp', '>=', oneMonthAgo.toISOString()),
        limit(10000)
      );
      const recentActivitiesSnapshot = await getDocs(recentActivitiesQuery);
      const recentActivities = recentActivitiesSnapshot.docs.map(
        (doc) => doc.data() as UserActivity
      );

      // Calculate active users
      const dailyActiveUsers = new Set(
        recentActivities.filter((a) => new Date(a.timestamp) >= oneDayAgo).map((a) => a.userId)
      ).size;

      const weeklyActiveUsers = new Set(
        recentActivities.filter((a) => new Date(a.timestamp) >= oneWeekAgo).map((a) => a.userId)
      ).size;

      const monthlyActiveUsers = new Set(
        recentActivities.filter((a) => new Date(a.timestamp) >= oneMonthAgo).map((a) => a.userId)
      ).size;

      // Calculate retention rates (simplified)
      const day1Retention = (dailyActiveUsers / totalUsers) * 100;
      const day7Retention = (weeklyActiveUsers / totalUsers) * 100;
      const day30Retention = (monthlyActiveUsers / totalUsers) * 100;

      // Calculate churn rate
      const churnRate = 100 - day30Retention;

      // Calculate average session duration
      const avgSessionDuration =
        recentActivities.length > 0
          ? recentActivities.reduce((sum, a) => sum + a.duration, 0) / recentActivities.length
          : 0;

      // Get engagement scores
      const engagementScoresSnapshot = await getDocs(collection(db, 'user_engagement_scores'));
      const engagementScores = engagementScoresSnapshot.docs.map(
        (doc) => doc.data() as UserEngagementScore
      );
      const avgEngagementScore =
        engagementScores.length > 0
          ? engagementScores.reduce((sum, s) => sum + s.score, 0) / engagementScores.length
          : 0;

      // Get top churn risks
      const topChurnRisks = engagementScores
        .filter((s) => s.riskLevel === 'high')
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);

      // Generate cohorts (simplified)
      const cohorts: RetentionCohort[] = [];
      const cohortMap = new Map<string, any>();

      users.forEach((user) => {
        const userData = user as any; // Type assertion for user data
        const createdAt =
          userData.createdAt?.toDate?.() || new Date(userData.createdAt || Date.now());
        const monthKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!cohortMap.has(monthKey)) {
          cohortMap.set(monthKey, {
            cohortMonth: monthKey,
            users: [],
            cohortSize: 0,
            registrations: 0,
          });
        }

        const cohort = cohortMap.get(monthKey);
        cohort.users.push(userData);
        cohort.cohortSize++;
        cohort.registrations++;
      });

      for (const [monthKey, cohortData] of cohortMap) {
        const cohortUsers = cohortData.users;
        const cohortActivities = recentActivities.filter((a) =>
          cohortUsers.some((u: any) => u.id === a.userId)
        );

        const cohort: RetentionCohort = {
          cohortMonth: monthKey,
          cohortSize: cohortData.cohortSize,
          registrations: cohortData.registrations,
          retentionRates: {
            day1: day1Retention,
            day7: day7Retention,
            day30: day30Retention,
            day90: day30Retention * 0.8,
          },
          averageSessionDuration:
            cohortActivities.length > 0
              ? cohortActivities.reduce((sum, a) => sum + a.duration, 0) / cohortActivities.length
              : 0,
          averageActionsPerSession:
            cohortActivities.length > 0
              ? cohortActivities.reduce((sum, a) => sum + a.engagement.interactions, 0) /
                cohortActivities.length
              : 0,
          churnRate: 100 - day30Retention,
        };

        cohorts.push(cohort);
      }

      // Generate engagement trends
      const engagementTrends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayActivities = recentActivities.filter((a) => {
          const activityDate = new Date(a.timestamp);
          return activityDate.toDateString() === date.toDateString();
        });

        const dayActiveUsers = new Set(dayActivities.map((a) => a.userId)).size;
        const dayAvgDuration =
          dayActivities.length > 0
            ? dayActivities.reduce((sum, a) => sum + a.duration, 0) / dayActivities.length
            : 0;
        const dayCompletionRate =
          dayActivities.length > 0
            ? (dayActivities.reduce((sum, a) => sum + a.engagement.tasksCompleted, 0) /
                dayActivities.reduce((sum, a) => sum + a.engagement.interactions, 0)) *
              100
            : 0;

        engagementTrends.push({
          date: date.toISOString().split('T')[0],
          dailyActiveUsers: dayActiveUsers,
          averageSessionDuration: dayAvgDuration,
          completionRate: dayCompletionRate,
        });
      }

      return {
        overview: {
          totalUsers,
          activeUsers: {
            daily: dailyActiveUsers,
            weekly: weeklyActiveUsers,
            monthly: monthlyActiveUsers,
          },
          retentionRates: {
            day1: day1Retention,
            day7: day7Retention,
            day30: day30Retention,
          },
          churnRate,
          averageSessionDuration: avgSessionDuration,
          averageEngagementScore: avgEngagementScore,
        },
        cohorts: cohorts.sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth)),
        topChurnRisks,
        engagementTrends,
      };
    } catch (error) {
      console.error('Error getting retention metrics:', error);
      throw error;
    }
  }

  private async getUserSessionCount(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data().totalSessions || 0 : 0;
    } catch (error) {
      console.error('Error getting user session count:', error);
      return 0;
    }
  }

  private generateEngagementRecommendations(engagement: {
    score: number;
    factors: UserEngagementScore['factors'];
    trend: 'increasing' | 'stable' | 'decreasing';
    riskLevel: 'low' | 'medium' | 'high';
  }): string[] {
    const recommendations: string[] = [];

    if (engagement.factors.frequency < 50) {
      recommendations.push('⏰ 定期的な使用のためのリマインダーを設定しましょう');
    }

    if (engagement.factors.recency < 30) {
      recommendations.push('🔔 重要な機能更新をお知らせする通知を有効にしましょう');
    }

    if (engagement.factors.depth < 40) {
      recommendations.push('✨ 新しい機能を試してアプリを最大限活用しましょう');
    }

    if (engagement.factors.duration < 30) {
      recommendations.push('🎯 より長く使えるような目標を設定してみましょう');
    }

    if (engagement.factors.completion < 50) {
      recommendations.push('✅ タスクの完了率向上のためのヒントを確認しましょう');
    }

    if (engagement.trend === 'decreasing') {
      recommendations.push('📈 エンゲージメント向上のための個別サポートを受けましょう');
    }

    if (engagement.riskLevel === 'high') {
      recommendations.push('🆘 アカウントマネージャーとの相談をお勧めします');
    }

    return recommendations.slice(0, 3);
  }

  private generateChurnInterventions(churnProbability: number, riskFactors: string[]): string[] {
    const interventions: string[] = [];

    if (churnProbability > 0.8) {
      interventions.push('緊急: 個別サポートチームからの連絡');
      interventions.push('特別オファーの提供');
      interventions.push('カスタマイズされた再エンゲージメントキャンペーン');
    } else if (churnProbability > 0.6) {
      interventions.push('パーソナライズされたヘルプコンテンツの送信');
      interventions.push('機能使用ガイドの提供');
      interventions.push('プッシュ通知の最適化');
    } else if (churnProbability > 0.4) {
      interventions.push('定期的なエンゲージメント確認');
      interventions.push('新機能の紹介');
      interventions.push('コミュニティ参加の促進');
    } else {
      interventions.push('定期的なフィードバック収集');
      interventions.push('継続使用のためのインセンティブ');
    }

    return interventions;
  }
}

export const retentionAnalyticsService = new RetentionAnalyticsService();
