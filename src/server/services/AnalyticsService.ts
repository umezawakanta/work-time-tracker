/**
 * 📊 Analytics Service
 * ユーザー行動トラッキングとアナリティクスデータ処理サービス
 */

import { EventEmitter } from 'events';

// イベントデータの型定義
export interface AnalyticsEvent {
  id?: string;
  event: string;
  data: Record<string, any>;
  timestamp: string;
  userId: string;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  url: string;
}

// アナリティクス取得オプション
export interface AnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
  userId?: string;
}

// ダッシュボードデータオプション
export interface DashboardOptions {
  period: string;
  userId?: string;
}

// ユーザー行動分析オプション
export interface UserBehaviorOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 📊 Analytics Service Class
 */
export class AnalyticsService extends EventEmitter {
  private events: AnalyticsEvent[] = [];
  private isDebugMode: boolean;

  constructor(debugMode = false) {
    super();
    this.isDebugMode = debugMode;

    if (this.isDebugMode) {
      console.log('📊 Analytics Service initialized in debug mode');
    }
  }

  /**
   * 📈 イベントトラッキング
   */
  async trackEvent(eventData: Omit<AnalyticsEvent, 'id'>): Promise<AnalyticsEvent> {
    const event: AnalyticsEvent = {
      ...eventData,
      id: this.generateEventId(),
    };

    // メモリに保存（本番環境ではデータベースを使用）
    this.events.push(event);

    if (this.isDebugMode) {
      console.log('📊 Event tracked:', {
        event: event.event,
        userId: event.userId,
        timestamp: event.timestamp,
      });
    }

    // イベントを発行
    this.emit('event_tracked', event);

    // データベース保存をシミュレート（非同期）
    setTimeout(() => {
      this.emit('event_saved', event);
    }, 100);

    return event;
  }

  /**
   * 📊 アナリティクス取得
   */
  async getAnalytics(options: AnalyticsOptions = {}): Promise<any> {
    const { startDate, endDate, eventType, userId } = options;

    let filteredEvents = this.events;

    // 期間でフィルタ
    if (startDate || endDate) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.timestamp);
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
      });
    }

    // イベントタイプでフィルタ
    if (eventType) {
      filteredEvents = filteredEvents.filter((event) => event.event === eventType);
    }

    // ユーザーIDでフィルタ
    if (userId) {
      filteredEvents = filteredEvents.filter((event) => event.userId === userId);
    }

    // 統計データを生成
    const analytics = {
      totalEvents: filteredEvents.length,
      uniqueUsers: new Set(filteredEvents.map((e) => e.userId)).size,
      uniqueSessions: new Set(filteredEvents.map((e) => e.sessionId)).size,
      eventTypes: this.getEventTypeStats(filteredEvents),
      timeSeriesData: this.getTimeSeriesData(filteredEvents),
      topPages: this.getTopPages(filteredEvents),
      userAgents: this.getUserAgentStats(filteredEvents),
      summary: {
        startDate: startDate?.toISOString() || filteredEvents[0]?.timestamp,
        endDate: endDate?.toISOString() || filteredEvents[filteredEvents.length - 1]?.timestamp,
        dataPoints: filteredEvents.length,
      },
    };

    return analytics;
  }

  /**
   * 📊 ダッシュボード用データ取得
   */
  async getDashboardData(options: DashboardOptions): Promise<any> {
    const { period, userId } = options;

    // 期間の計算
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const analytics = await this.getAnalytics({
      startDate,
      endDate,
      userId,
    });

    return {
      ...analytics,
      period,
      performance: this.getPerformanceMetrics(startDate, endDate, userId),
      trends: this.getTrendAnalysis(startDate, endDate, userId),
      recommendations: this.getRecommendations(analytics),
    };
  }

  /**
   * 🔍 ユーザー行動分析
   */
  async getUserBehavior(options: UserBehaviorOptions): Promise<any> {
    const { userId, startDate, endDate } = options;

    const userEvents = await this.getAnalytics({
      userId,
      startDate,
      endDate,
    });

    return {
      ...userEvents,
      sessionAnalysis: this.getSessionAnalysis(userId, startDate, endDate),
      pageFlow: this.getPageFlow(userId, startDate, endDate),
      engagementMetrics: this.getEngagementMetrics(userId, startDate, endDate),
      behaviorPatterns: this.getBehaviorPatterns(userId, startDate, endDate),
    };
  }

  /**
   * 📱 リアルタイム統計
   */
  async getRealtimeStats(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentEvents = this.events.filter((event) => new Date(event.timestamp) > oneHourAgo);

    return {
      activeUsers: new Set(recentEvents.map((e) => e.userId)).size,
      activeSessions: new Set(recentEvents.map((e) => e.sessionId)).size,
      eventsPerMinute: this.getEventsPerMinute(recentEvents),
      topPages: this.getTopPages(recentEvents).slice(0, 5),
      recentEvents: recentEvents.slice(-10),
      timestamp: now.toISOString(),
    };
  }

  /**
   * 🔧 プライベートメソッド
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEventTypeStats(events: AnalyticsEvent[]): Record<string, number> {
    const stats: Record<string, number> = {};
    events.forEach((event) => {
      stats[event.event] = (stats[event.event] || 0) + 1;
    });
    return stats;
  }

  private getTimeSeriesData(events: AnalyticsEvent[]): Array<{ timestamp: string; count: number }> {
    const groupedByHour: Record<string, number> = {};

    events.forEach((event) => {
      const hour = new Date(event.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      groupedByHour[hour] = (groupedByHour[hour] || 0) + 1;
    });

    return Object.entries(groupedByHour)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, count]) => ({ timestamp, count }));
  }

  private getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
    const pageViews: Record<string, number> = {};

    events
      .filter((event) => event.event === 'page_view')
      .forEach((event) => {
        const page = event.data.page || event.url;
        pageViews[page] = (pageViews[page] || 0) + 1;
      });

    return Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .map(([page, views]) => ({ page, views }));
  }

  private getUserAgentStats(events: AnalyticsEvent[]): Record<string, number> {
    const userAgents: Record<string, number> = {};

    events.forEach((event) => {
      const ua = this.parseUserAgent(event.userAgent);
      userAgents[ua] = (userAgents[ua] || 0) + 1;
    });

    return userAgents;
  }

  private parseUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getPerformanceMetrics(startDate: Date, endDate: Date, userId?: string): any {
    const events = this.events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      const matchesDate = eventDate >= startDate && eventDate <= endDate;
      const matchesUser = !userId || event.userId === userId;
      return matchesDate && matchesUser;
    });

    return {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map((e) => e.userId)).size,
      avgEventsPerUser: events.length / new Set(events.map((e) => e.userId)).size || 0,
      sessionDuration: this.calculateAvgSessionDuration(events),
      bounceRate: this.calculateBounceRate(events),
    };
  }

  private getTrendAnalysis(startDate: Date, endDate: Date, userId?: string): any {
    // トレンド分析のプレースホルダー
    return {
      growth: '12.5%',
      trend: 'up',
      forecast: 'positive',
    };
  }

  private getRecommendations(analytics: any): string[] {
    const recommendations = [];

    if (analytics.totalEvents < 100) {
      recommendations.push('イベントトラッキングを増やして、より詳細な分析を行いましょう');
    }

    if (analytics.uniqueUsers < 10) {
      recommendations.push('ユーザー獲得施策を検討してみてください');
    }

    return recommendations;
  }

  private getSessionAnalysis(userId: string, startDate?: Date, endDate?: Date): any {
    // セッション分析のプレースホルダー
    return {
      sessionCount: 5,
      avgDuration: 300,
      pagesPerSession: 3.2,
    };
  }

  private getPageFlow(userId: string, startDate?: Date, endDate?: Date): any {
    // ページフロー分析のプレースホルダー
    return {
      entryPages: ['/dashboard', '/login'],
      exitPages: ['/logout', '/settings'],
      commonPaths: ['/dashboard -> /tasks -> /analytics'],
    };
  }

  private getEngagementMetrics(userId: string, startDate?: Date, endDate?: Date): any {
    // エンゲージメント指標のプレースホルダー
    return {
      clickThroughRate: 0.15,
      timeOnPage: 120,
      scrollDepth: 0.8,
    };
  }

  private getBehaviorPatterns(userId: string, startDate?: Date, endDate?: Date): any {
    // 行動パターン分析のプレースホルダー
    return {
      activeHours: ['09:00', '14:00', '19:00'],
      preferredFeatures: ['dashboard', 'tasks', 'analytics'],
      deviceTypes: ['desktop', 'mobile'],
    };
  }

  private getEventsPerMinute(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;

    const firstEvent = new Date(events[0].timestamp);
    const lastEvent = new Date(events[events.length - 1].timestamp);
    const durationMinutes = (lastEvent.getTime() - firstEvent.getTime()) / (1000 * 60);

    return durationMinutes > 0 ? events.length / durationMinutes : events.length;
  }

  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    // セッション継続時間の計算（簡易版）
    return 300; // 5分（プレースホルダー）
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    // 直帰率の計算（簡易版）
    return 0.25; // 25%（プレースホルダー）
  }
}

export default AnalyticsService;
