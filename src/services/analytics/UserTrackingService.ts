/**
 * 🔍 ユーザーアクセストラッキング・解析サービス
 * 完全なユーザー行動分析とページ解析機能
 */

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  pageViews: PageView[];
  userAgent: string;
  device: DeviceInfo;
  location: LocationInfo;
  referrer: string;
  totalTimeSpent: number; // seconds
}

export interface PageView {
  id: string;
  sessionId: string;
  userId?: string;
  page: string;
  url: string;
  title: string;
  timestamp: Date;
  timeSpent: number; // seconds
  scrollDepth: number; // percentage
  interactions: UserInteraction[];
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'form_submit' | 'download' | 'share' | 'ai_action';
  element?: string;
  value?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screenResolution: string;
  viewport: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
  language: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  pageViewsTotal: number;
  topPages: { page: string; views: number }[];
  deviceBreakdown: Record<string, number>;
  trafficSources: Record<string, number>;
  userJourney: UserJourneyStep[];
}

export interface UserJourneyStep {
  page: string;
  averageTimeSpent: number;
  exitRate: number;
  nextPages: { page: string; percentage: number }[];
}

class UserTrackingService {
  private static instance: UserTrackingService;
  private currentSession: UserSession | null = null;
  private currentPageView: PageView | null = null;
  private startTime: Date = new Date();

  public static getInstance(): UserTrackingService {
    if (!UserTrackingService.instance) {
      UserTrackingService.instance = new UserTrackingService();
    }
    return UserTrackingService.instance;
  }

  /**
   * 🎯 セッション開始
   */
  public initializeSession(userId?: string): void {
    const sessionId = this.generateSessionId();

    this.currentSession = {
      sessionId,
      userId,
      startTime: new Date(),
      pageViews: [],
      userAgent: navigator.userAgent,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo(),
      referrer: document.referrer,
      totalTimeSpent: 0,
    };

    // セッション開始をサーバーに送信
    this.sendToServer('session_start', this.currentSession);

    // ページ離脱時の処理
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // 非アクティブ時の検知
    this.setupInactivityTracking();

    console.log('📊 User tracking initialized:', sessionId);
  }

  /**
   * 📖 ページビュー記録
   */
  public trackPageView(page: string, url: string, title: string): void {
    if (!this.currentSession) {
      this.initializeSession();
    }

    // 前のページビューを終了
    if (this.currentPageView) {
      this.endPageView();
    }

    const pageViewId = this.generateId();
    this.currentPageView = {
      id: pageViewId,
      sessionId: this.currentSession!.sessionId,
      userId: this.currentSession!.userId,
      page,
      url,
      title,
      timestamp: new Date(),
      timeSpent: 0,
      scrollDepth: 0,
      interactions: [],
    };

    this.currentSession!.pageViews.push(this.currentPageView);

    // スクロール深度追跡
    this.setupScrollTracking();

    // 時間計測開始
    this.startTime = new Date();

    this.sendToServer('page_view', this.currentPageView);
    console.log(`📄 Page view tracked: ${page}`);
  }

  /**
   * 🖱️ ユーザーインタラクション記録
   */
  public trackInteraction(
    type: UserInteraction['type'],
    element?: string,
    value?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.currentPageView) return;

    const interaction: UserInteraction = {
      type,
      element,
      value,
      timestamp: new Date(),
      metadata,
    };

    this.currentPageView.interactions.push(interaction);
    this.sendToServer('interaction', interaction);

    console.log(`👆 Interaction tracked: ${type}`, { element, value });
  }

  /**
   * 🤖 AI機能使用追跡
   */
  public trackAIUsage(feature: string, success: boolean, metadata?: Record<string, any>): void {
    this.trackInteraction('ai_action', feature, success ? 'success' : 'failure', {
      ...metadata,
      feature,
      success,
    });
  }

  /**
   * 📊 ユーザー属性更新
   */
  public updateUserAttributes(attributes: {
    userId?: string;
    role?: string;
    subscriptionPlan?: string;
    preferences?: Record<string, any>;
  }): void {
    if (this.currentSession) {
      this.currentSession.userId = attributes.userId || this.currentSession.userId;
    }

    this.sendToServer('user_attributes', attributes);
  }

  /**
   * 📈 リアルタイム解析データ取得
   */
  public async getAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<UserAnalytics> {
    try {
      const apiBaseUrl = this.getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/analytics/summary?range=${timeRange}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      return this.getMockAnalytics();
    }
  }

  /**
   * 🎯 A/Bテスト記録
   */
  public trackABTest(testName: string, variant: string): void {
    this.trackInteraction('ai_action', 'ab_test', variant, {
      testName,
      variant,
    });
  }

  /**
   * ⏰ セッション終了
   */
  private endSession(): void {
    if (!this.currentSession) return;

    this.endPageView();

    this.currentSession.endTime = new Date();
    this.currentSession.totalTimeSpent = Math.floor(
      (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000
    );

    this.sendToServer('session_end', this.currentSession);
    console.log('📊 Session ended:', this.currentSession.totalTimeSpent + 's');
  }

  /**
   * 📄 ページビュー終了
   */
  private endPageView(): void {
    if (!this.currentPageView) return;

    this.currentPageView.timeSpent = Math.floor(
      (new Date().getTime() - this.startTime.getTime()) / 1000
    );

    this.sendToServer('page_view_end', this.currentPageView);
  }

  /**
   * 📱 デバイス情報取得
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    let deviceType: DeviceInfo['type'] = 'desktop';

    if (/mobile|android|iphone/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      deviceType = 'tablet';
    }

    return {
      type: deviceType,
      os: this.getOS(),
      browser: this.getBrowser(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  }

  /**
   * 🌍 位置情報取得
   */
  private getLocationInfo(): LocationInfo {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  /**
   * 📜 スクロール追跡設定
   */
  private setupScrollTracking(): void {
    let maxScroll = 0;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      const percentage = Math.floor((scrolled / total) * 100);

      if (percentage > maxScroll && this.currentPageView) {
        maxScroll = percentage;
        this.currentPageView.scrollDepth = percentage;
      }
    };

    window.addEventListener('scroll', handleScroll);
  }

  /**
   * ⏱️ 非アクティブ追跡設定
   */
  private setupInactivityTracking(): void {
    let inactiveTime = 0;

    const resetTimer = () => {
      inactiveTime = 0;
    };

    const checkInactivity = () => {
      inactiveTime++;
      if (inactiveTime >= 30) {
        // 30分非アクティブでセッション終了
        this.endSession();
      }
    };

    document.addEventListener('mousedown', resetTimer);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('scroll', resetTimer);
    document.addEventListener('touchstart', resetTimer);

    setInterval(checkInactivity, 60000); // 1分ごとにチェック
  }

  /**
   * 📡 サーバーへのデータ送信
   */
  private async sendToServer(event: string, data: any): Promise<void> {
    try {
      // API設定を動的に取得
      const apiBaseUrl = this.getApiBaseUrl();

      await fetch(`${apiBaseUrl}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  /**
   * 🔗 API Base URLを取得
   */
  private getApiBaseUrl(): string {
    // 開発環境では localhost:3001、本番環境では適切なURLを使用
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname === 'work-time-tracker-5d9q.vercel.app') {
        return 'https://work-time-tracker-5d9q.vercel.app/api';
      } else if (hostname.match(/^work-time-tracker-5d9q-.*\.vercel\.app$/)) {
        return 'https://work-time-tracker-5d9q.vercel.app/api';
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
      } else {
        return `${window.location.protocol}//${window.location.hostname}/api`;
      }
    }

    // サーバーサイドや fallback
    return 'http://localhost:3001/api';
  }

  /**
   * 🎲 ID生成
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateId(): string {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 💻 OS検出
   */
  private getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Win') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'macOS';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iPhone') > -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * 🌐 ブラウザ検出
   */
  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  }

  /**
   * 📊 モック解析データ
   */
  private getMockAnalytics(): UserAnalytics {
    return {
      totalUsers: 1247,
      activeUsers: 89,
      newUsers: 23,
      returningUsers: 66,
      averageSessionDuration: 847, // seconds
      pageViewsTotal: 3421,
      topPages: [
        { page: '/dashboard', views: 892 },
        { page: '/todo-manager', views: 743 },
        { page: '/quadrant-dashboard', views: 651 },
        { page: '/role-dashboards', views: 432 },
        { page: '/improvement-plan', views: 387 },
      ],
      deviceBreakdown: {
        desktop: 67,
        mobile: 28,
        tablet: 5,
      },
      trafficSources: {
        direct: 45,
        search: 32,
        social: 15,
        referral: 8,
      },
      userJourney: [
        {
          page: '/dashboard',
          averageTimeSpent: 234,
          exitRate: 12,
          nextPages: [
            { page: '/todo-manager', percentage: 43 },
            { page: '/quadrant-dashboard', percentage: 28 },
          ],
        },
      ],
    };
  }
}

export const userTrackingService = UserTrackingService.getInstance();
export default userTrackingService;
