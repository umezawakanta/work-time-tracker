import { toast } from '@/components/ui/use-toast';
import { generateOperationId } from '../../utils/idGenerator';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  category: NotificationCategory;
  priority: NotificationPriority;
  tags: string[];
  variables: NotificationVariable[];
  vibrate?: number[];
  silent?: boolean;
  requireInteraction?: boolean;
}

export interface NotificationVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  description: string;
}

export interface ScheduledNotification {
  id: string;
  templateId: string;
  userId?: string;
  userSegment?: string[];
  title: string;
  body: string;
  data: Record<string, any>;
  scheduledAt: string;
  expiresAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  deliveryTime?: string;
  clickedAt?: string;
  dismissedAt?: string;
  retryCount: number;
  maxRetries: number;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: AudienceFilter;
  schedule: CampaignSchedule;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  stats: CampaignStats;
}

export interface AudienceFilter {
  segments: string[];
  userIds?: string[];
  excludeUserIds?: string[];
  conditions: FilterCondition[];
  estimatedReach: number;
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  description: string;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: string;
  endDate?: string;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  timeOfDay?: string;
  throttling?: {
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
  clickRate: number;
  deliveryRate: number;
  engagementScore: number;
}

export interface UserSubscription {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
  subscribedAt: string;
  lastActive: string;
  preferences: NotificationPreferences;
  segments: string[];
  timezone: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface NotificationPreferences {
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'digest' | 'daily' | 'weekly';
  deliveryChannels: ('push' | 'email' | 'sms')[];
}

export interface NotificationAnalytics {
  notificationId: string;
  userId?: string;
  event: 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed';
  timestamp: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  metadata: Record<string, any>;
}

export interface PushNotificationStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  averageClickRate: number;
  averageDeliveryRate: number;
  dailyStats: DailyNotificationStats[];
  topPerformingTemplates: TemplatePerformance[];
  segmentPerformance: SegmentPerformance[];
}

export interface DailyNotificationStats {
  date: string;
  sent: number;
  delivered: number;
  clicked: number;
  clickRate: number;
  deliveryRate: number;
}

export interface TemplatePerformance {
  templateId: string;
  templateName: string;
  sent: number;
  clicked: number;
  clickRate: number;
  avgEngagementTime: number;
}

export interface SegmentPerformance {
  segment: string;
  subscribers: number;
  sent: number;
  clicked: number;
  clickRate: number;
  engagementScore: number;
}

export type NotificationCategory =
  | 'system'
  | 'reminder'
  | 'update'
  | 'promotion'
  | 'social'
  | 'achievement'
  | 'alert'
  | 'news';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * 📱 プログレッシブWebマスター: 強化プッシュ通知サービス
 * ターゲティング・スケジューリング・分析・リッチ通知機能
 */
class EnhancedPushNotificationService {
  private static instance: EnhancedPushNotificationService | null = null;
  private subscriptions: Map<string, UserSubscription> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private campaigns: Map<string, NotificationCampaign> = new Map();
  private analytics: NotificationAnalytics[] = [];
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    this.initializeTemplates();
    this.initializeVapidKeys();
    this.setupEventListeners();
    this.startScheduleProcessor();
  }

  public static getInstance(): EnhancedPushNotificationService {
    if (!EnhancedPushNotificationService.instance) {
      EnhancedPushNotificationService.instance = new EnhancedPushNotificationService();
    }
    return EnhancedPushNotificationService.instance;
  }

  /**
   * 🔧 VAPID キー初期化
   */
  private initializeVapidKeys(): void {
    // 実際の実装では環境変数から取得
    const publicKey =
      (typeof process !== 'undefined' ? (process as any).env?.VITE_VAPID_PUBLIC_KEY : undefined) ||
      'demo-public-key';
    const privateKey =
      (typeof process !== 'undefined' ? (process as any).env?.VITE_VAPID_PRIVATE_KEY : undefined) ||
      'demo-private-key';

    this.vapidKeys = { publicKey, privateKey };
  }

  /**
   * 📋 テンプレート初期化
   */
  private initializeTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'todo_reminder',
        name: 'タスクリマインダー',
        title: '🔔 タスクのリマインダー',
        body: '「{{taskTitle}}」が期限を迎えます',
        icon: '/icons/notification-todo.png',
        badge: '/icons/badge.png',
        category: 'reminder',
        priority: 'normal',
        tags: ['productivity', 'todo', 'deadline'],
        variables: [
          {
            name: 'taskTitle',
            type: 'string',
            description: 'タスクのタイトル',
          },
          {
            name: 'dueDate',
            type: 'date',
            description: '期限日時',
          },
        ],
        actions: [
          {
            action: 'mark_complete',
            title: '完了にする',
            icon: '/icons/action-complete.png',
          },
          {
            action: 'snooze',
            title: '後でリマインド',
            icon: '/icons/action-snooze.png',
          },
        ],
        vibrate: [200, 100, 200],
        requireInteraction: true,
      },
      {
        id: 'achievement_unlock',
        name: '実績解除',
        title: '🏆 新しい実績を獲得！',
        body: '「{{achievementName}}」を達成しました',
        icon: '/icons/notification-achievement.png',
        image: '/images/achievement-celebration.jpg',
        category: 'achievement',
        priority: 'high',
        tags: ['gamification', 'achievement', 'celebration'],
        variables: [
          {
            name: 'achievementName',
            type: 'string',
            description: '実績名',
          },
          {
            name: 'points',
            type: 'number',
            description: '獲得ポイント',
          },
        ],
        actions: [
          {
            action: 'view_achievement',
            title: '詳細を見る',
            icon: '/icons/action-view.png',
          },
          {
            action: 'share',
            title: 'シェア',
            icon: '/icons/action-share.png',
          },
        ],
        vibrate: [300, 200, 300, 200, 300],
        requireInteraction: false,
      },
      {
        id: 'daily_summary',
        name: '日次サマリー',
        title: '📊 今日の活動まとめ',
        body: '完了タスク: {{completedTasks}}件, 獲得ポイント: {{earnedPoints}}pt',
        icon: '/icons/notification-summary.png',
        category: 'update',
        priority: 'low',
        tags: ['summary', 'daily', 'stats'],
        variables: [
          {
            name: 'completedTasks',
            type: 'number',
            description: '完了タスク数',
          },
          {
            name: 'earnedPoints',
            type: 'number',
            description: '獲得ポイント',
          },
        ],
        silent: false,
        vibrate: [100],
      },
      {
        id: 'system_update',
        name: 'システム更新',
        title: '🔄 アプリの更新が利用可能',
        body: '新機能と改善が含まれています',
        icon: '/icons/notification-update.png',
        category: 'system',
        priority: 'normal',
        tags: ['system', 'update', 'app'],
        variables: [
          {
            name: 'version',
            type: 'string',
            description: 'バージョン番号',
          },
        ],
        actions: [
          {
            action: 'update_now',
            title: '今すぐ更新',
            icon: '/icons/action-update.png',
          },
          {
            action: 'update_later',
            title: '後で更新',
            icon: '/icons/action-later.png',
          },
        ],
        requireInteraction: true,
      },
      {
        id: 'break_reminder',
        name: '休憩リマインダー',
        title: '☕ 休憩時間です',
        body: '{{workDuration}}分間お疲れ様でした。少し休憩しませんか？',
        icon: '/icons/notification-break.png',
        image: '/images/break-time.jpg',
        category: 'reminder',
        priority: 'normal',
        tags: ['health', 'break', 'wellness'],
        variables: [
          {
            name: 'workDuration',
            type: 'number',
            description: '作業時間（分）',
          },
        ],
        actions: [
          {
            action: 'start_break',
            title: '休憩開始',
            icon: '/icons/action-break.png',
          },
          {
            action: 'continue_work',
            title: '続ける',
            icon: '/icons/action-continue.png',
          },
        ],
        vibrate: [150, 100, 150],
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });

    console.log('📋 通知テンプレートを初期化しました', this.templates.size, 'テンプレート');
  }

  /**
   * 👂 イベントリスナー設定
   */
  private setupEventListeners(): void {
    // 通知クリック処理
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.payload);
        }
      });
    }

    // ページ可視性変更
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateLastActive();
      }
    });
  }

  /**
   * ⏰ スケジュール処理開始
   */
  private startScheduleProcessor(): void {
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60000); // 1分ごと

    console.log('⏰ 通知スケジューラを開始しました');
  }

  /**
   * 📧 購読登録
   */
  async subscribe(
    userId: string,
    preferences?: Partial<NotificationPreferences>
  ): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('プッシュ通知がサポートされていません');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          this.vapidKeys!.publicKey
        ) as unknown as BufferSource,
      });

      this.pushSubscription = subscription;

      // ユーザー購読情報を保存
      const userSubscription: UserSubscription = {
        userId,
        endpoint: subscription.endpoint,
        p256dh: this.getSubscriptionKey(subscription, 'p256dh'),
        auth: this.getSubscriptionKey(subscription, 'auth'),
        userAgent: navigator.userAgent,
        subscribedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        preferences: {
          enabled: true,
          categories: {
            system: true,
            reminder: true,
            update: true,
            promotion: false,
            social: true,
            achievement: true,
            alert: true,
            news: false,
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
          frequency: 'immediate',
          deliveryChannels: ['push'],
          ...preferences,
        },
        segments: this.determineUserSegments(userId),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceType: this.detectDeviceType(),
      };

      this.subscriptions.set(userId, userSubscription);

      // サーバーに購読情報を送信
      await this.sendSubscriptionToServer(userSubscription);

      console.log('📧 プッシュ通知購読完了:', userId);

      toast({
        title: '通知設定完了',
        description: 'プッシュ通知が有効になりました',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('プッシュ通知購読失敗:', error);

      toast({
        title: '通知設定エラー',
        description: 'プッシュ通知の設定に失敗しました',
        variant: 'destructive',
      });

      return false;
    }
  }

  /**
   * 📤 即座に通知送信
   */
  async sendNotification(
    templateId: string,
    targetUsers: string | string[],
    variables: Record<string, any>,
    options?: {
      priority?: NotificationPriority;
      customTitle?: string;
      customBody?: string;
      scheduleAt?: string;
    }
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`テンプレートが見つかりません: ${templateId}`);
    }

    const notificationId = generateOperationId('notif');
    const userIds = Array.isArray(targetUsers) ? targetUsers : [targetUsers];

    // スケジュール通知として登録
    const scheduledNotification: ScheduledNotification = {
      id: notificationId,
      templateId,
      userId: userIds.length === 1 ? userIds[0] : undefined,
      userSegment: userIds.length > 1 ? userIds : undefined,
      title: options?.customTitle || this.interpolateTemplate(template.title, variables),
      body: options?.customBody || this.interpolateTemplate(template.body, variables),
      data: {
        templateId,
        variables,
        notificationId,
        sentAt: new Date().toISOString(),
      },
      scheduledAt: options?.scheduleAt || new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    };

    this.scheduledNotifications.set(notificationId, scheduledNotification);

    // 即座に送信の場合は処理
    if (!options?.scheduleAt) {
      await this.deliverNotification(scheduledNotification, template);
    }

    console.log('📤 通知送信準備完了:', notificationId);
    return notificationId;
  }

  /**
   * 📋 キャンペーン作成
   */
  async createCampaign(
    name: string,
    templateId: string,
    audienceFilter: AudienceFilter,
    schedule: CampaignSchedule,
    options?: {
      description?: string;
    }
  ): Promise<string> {
    const campaignId = generateOperationId('campaign');

    const campaign: NotificationCampaign = {
      id: campaignId,
      name,
      description: options?.description || '',
      templateId,
      targetAudience: audienceFilter,
      schedule,
      status: 'draft',
      createdAt: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        clicked: 0,
        dismissed: 0,
        failed: 0,
        clickRate: 0,
        deliveryRate: 0,
        engagementScore: 0,
      },
    };

    this.campaigns.set(campaignId, campaign);

    console.log('📋 キャンペーン作成完了:', campaignId);

    toast({
      title: 'キャンペーン作成',
      description: `${name}キャンペーンを作成しました`,
      variant: 'default',
    });

    return campaignId;
  }

  /**
   * 🚀 キャンペーン開始
   */
  async startCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('キャンペーンが見つかりません');
    }

    campaign.status = 'active';
    campaign.startedAt = new Date().toISOString();

    // スケジュールに基づいて通知を作成
    await this.scheduleCampaignNotifications(campaign);

    console.log('🚀 キャンペーン開始:', campaignId);

    toast({
      title: 'キャンペーン開始',
      description: `${campaign.name}キャンペーンを開始しました`,
      variant: 'default',
    });
  }

  /**
   * 📊 キャンペーン通知スケジュール
   */
  private async scheduleCampaignNotifications(campaign: NotificationCampaign): Promise<void> {
    const template = this.templates.get(campaign.templateId);
    if (!template) {
      throw new Error('テンプレートが見つかりません');
    }

    // オーディエンスフィルターに基づいてユーザーを取得
    const targetUsers = this.getTargetUsers(campaign.targetAudience);

    // スケジュールタイプに基づいて通知を作成
    switch (campaign.schedule.type) {
      case 'immediate':
        await this.scheduleImmediateNotifications(campaign, targetUsers);
        break;
      case 'scheduled':
        await this.scheduleDelayedNotifications(campaign, targetUsers);
        break;
      case 'recurring':
        await this.scheduleRecurringNotifications(campaign, targetUsers);
        break;
    }
  }

  /**
   * ⚡ 即座通知スケジュール
   */
  private async scheduleImmediateNotifications(
    campaign: NotificationCampaign,
    targetUsers: string[]
  ): Promise<void> {
    for (const userId of targetUsers) {
      await this.sendNotification(campaign.templateId, userId, {});
    }
  }

  /**
   * ⏰ 遅延通知スケジュール
   */
  private async scheduleDelayedNotifications(
    campaign: NotificationCampaign,
    targetUsers: string[]
  ): Promise<void> {
    const scheduleTime = campaign.schedule.startDate || new Date().toISOString();

    for (const userId of targetUsers) {
      await this.sendNotification(
        campaign.templateId,
        userId,
        {},
        {
          scheduleAt: scheduleTime,
        }
      );
    }
  }

  /**
   * 🔄 繰り返し通知スケジュール
   */
  private async scheduleRecurringNotifications(
    campaign: NotificationCampaign,
    targetUsers: string[]
  ): Promise<void> {
    // 繰り返しロジックの実装
    console.log('🔄 繰り返し通知スケジュール:', campaign.id);
    // 実装時は cron ライブラリなどを使用
  }

  /**
   * 🎯 ターゲットユーザー取得
   */
  private getTargetUsers(audienceFilter: AudienceFilter): string[] {
    let targetUsers: string[] = [];

    // セグメントベースの選択
    if (audienceFilter.segments.length > 0) {
      targetUsers = Array.from(this.subscriptions.values())
        .filter((sub) => audienceFilter.segments.some((segment) => sub.segments.includes(segment)))
        .map((sub) => sub.userId);
    }

    // 特定ユーザーID
    if (audienceFilter.userIds) {
      targetUsers = [...new Set([...targetUsers, ...audienceFilter.userIds])];
    }

    // 除外ユーザーID
    if (audienceFilter.excludeUserIds) {
      targetUsers = targetUsers.filter((id) => !audienceFilter.excludeUserIds!.includes(id));
    }

    // 条件フィルター
    if (audienceFilter.conditions.length > 0) {
      targetUsers = targetUsers.filter((userId) => {
        return this.checkFilterConditions(userId, audienceFilter.conditions);
      });
    }

    return targetUsers;
  }

  /**
   * ✅ フィルター条件チェック
   */
  private checkFilterConditions(userId: string, conditions: FilterCondition[]): boolean {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return false;

    return conditions.every((condition) => {
      const value = this.getFieldValue(subscription, condition.field);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(value);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(value);
        default:
          return false;
      }
    });
  }

  /**
   * 🔍 フィールド値取得
   */
  private getFieldValue(subscription: UserSubscription, field: string): any {
    const fieldParts = field.split('.');
    let value: any = subscription;

    for (const part of fieldParts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * 📬 通知配信
   */
  private async deliverNotification(
    notification: ScheduledNotification,
    template: NotificationTemplate
  ): Promise<void> {
    try {
      const targetUsers = notification.userId
        ? [notification.userId]
        : notification.userSegment || [];

      for (const userId of targetUsers) {
        const subscription = this.subscriptions.get(userId);
        if (!subscription || !subscription.preferences.enabled) {
          continue;
        }

        // 静寂時間チェック
        if (this.isQuietTime(subscription)) {
          console.log('🔇 静寂時間のため通知をスキップ:', userId);
          continue;
        }

        // カテゴリ設定チェック
        if (!subscription.preferences.categories[template.category]) {
          console.log('📵 カテゴリが無効のため通知をスキップ:', template.category);
          continue;
        }

        // 実際の通知送信
        await this.sendPushToDevice(subscription, notification, template);

        // 分析データ記録
        this.recordAnalytics(notification.id, userId, 'sent');
      }

      notification.status = 'sent';
      notification.deliveryTime = new Date().toISOString();

      console.log('📬 通知配信完了:', notification.id);
    } catch (error) {
      console.error('通知配信失敗:', error);
      notification.status = 'failed';
      notification.retryCount++;
    }
  }

  /**
   * 📱 デバイスへプッシュ送信
   */
  private async sendPushToDevice(
    subscription: UserSubscription,
    notification: ScheduledNotification,
    template: NotificationTemplate
  ): Promise<void> {
    const payload = {
      title: notification.title,
      body: notification.body,
      icon: template.icon,
      badge: template.badge,
      image: template.image,
      tag: `${template.id}_${notification.id}`,
      data: {
        ...notification.data,
        templateId: template.id,
        userId: subscription.userId,
      },
      actions: template.actions,
      vibrate: template.vibrate,
      silent: template.silent,
      requireInteraction: template.requireInteraction,
    };

    // 実際の実装ではWeb Push ライブラリを使用
    console.log('📱 プッシュ送信:', payload);

    // ローカル通知として表示（開発時）
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(payload.title, payload);

      notif.onclick = () => {
        this.handleNotificationClick({
          notificationId: notification.id,
          templateId: template.id,
          userId: subscription.userId,
        });
      };
    }
  }

  /**
   * 🔇 静寂時間チェック
   */
  private isQuietTime(subscription: UserSubscription): boolean {
    if (!subscription.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().substr(0, 5); // HH:MM
    const startTime = subscription.preferences.quietHours.start;
    const endTime = subscription.preferences.quietHours.end;

    // 同日の場合
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    }
    // 日をまたぐ場合
    else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 📊 分析データ記録
   */
  private recordAnalytics(
    notificationId: string,
    userId: string,
    event: 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed'
  ): void {
    const analytics: NotificationAnalytics = {
      notificationId,
      userId,
      event,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: this.getBrowserName(),
      },
      metadata: {},
    };

    this.analytics.push(analytics);

    // 分析データは定期的にサーバーに送信
    console.log('📊 分析データ記録:', analytics);
  }

  /**
   * 👆 通知クリック処理
   */
  private handleNotificationClick(payload: any): void {
    console.log('👆 通知クリック:', payload);

    // 分析データ記録
    if (payload.userId && payload.notificationId) {
      this.recordAnalytics(payload.notificationId, payload.userId, 'clicked');
    }

    // カスタムアクション処理
    if (payload.action) {
      this.handleNotificationAction(payload.action, payload);
    }

    // ページナビゲーション
    if (payload.url) {
      window.open(payload.url, '_blank');
    }
  }

  /**
   * ⚡ 通知アクション処理
   */
  private handleNotificationAction(action: string, payload: any): void {
    switch (action) {
      case 'mark_complete':
        // タスク完了処理
        console.log('✅ タスク完了アクション');
        break;
      case 'snooze':
        // スヌーズ処理
        console.log('⏰ スヌーズアクション');
        break;
      case 'view_achievement':
        // 実績詳細表示
        console.log('🏆 実績表示アクション');
        break;
      default:
        console.log('⚡ カスタムアクション:', action);
    }
  }

  /**
   * ⏰ スケジュール通知処理
   */
  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const pendingNotifications = Array.from(this.scheduledNotifications.values()).filter(
      (notif) => notif.status === 'pending' && new Date(notif.scheduledAt) <= now
    );

    for (const notification of pendingNotifications) {
      const template = this.templates.get(notification.templateId);
      if (template) {
        await this.deliverNotification(notification, template);
      }
    }
  }

  /**
   * 🧩 テンプレート補間
   */
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  /**
   * 🔧 ユーティリティメソッド
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getSubscriptionKey(subscription: PushSubscription, name: string): string {
    const key = subscription.getKey(name as any);
    return key ? btoa(String.fromCharCode(...new Uint8Array(key))) : '';
  }

  private determineUserSegments(userId: string): string[] {
    // 実装時はユーザーの行動データから判定
    return ['active_users', 'productivity_focused'];
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private updateLastActive(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.lastActive = new Date().toISOString();
    });
  }

  private async sendSubscriptionToServer(subscription: UserSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('購読情報送信失敗:', error);
    }
  }

  // ゲッター
  getStats(): PushNotificationStats {
    const totalSubscriptions = this.subscriptions.size;
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter((sub) => {
      const lastActive = new Date(sub.lastActive);
      const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 30; // 30日以内に活動
    }).length;

    const sentEvents = this.analytics.filter((a) => a.event === 'sent');
    const clickedEvents = this.analytics.filter((a) => a.event === 'clicked');

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalSent: sentEvents.length,
      totalDelivered: this.analytics.filter((a) => a.event === 'delivered').length,
      totalClicked: clickedEvents.length,
      averageClickRate:
        sentEvents.length > 0 ? (clickedEvents.length / sentEvents.length) * 100 : 0,
      averageDeliveryRate: 95, // サンプル値
      dailyStats: [], // 実装時は過去30日のデータ
      topPerformingTemplates: [], // 実装時は実際の統計
      segmentPerformance: [], // 実装時は実際の統計
    };
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  getSubscriptions(): UserSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  getCampaigns(): NotificationCampaign[] {
    return Array.from(this.campaigns.values());
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  // 設定管理
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      subscription.preferences = { ...subscription.preferences, ...preferences };

      toast({
        title: '設定更新完了',
        description: '通知設定を更新しました',
        variant: 'default',
      });
    }
  }

  async unsubscribe(userId: string): Promise<void> {
    this.subscriptions.delete(userId);

    if (this.pushSubscription) {
      await this.pushSubscription.unsubscribe();
      this.pushSubscription = null;
    }

    toast({
      title: '購読解除完了',
      description: 'プッシュ通知を無効にしました',
      variant: 'default',
    });
  }
}

export const enhancedPushNotificationService = EnhancedPushNotificationService.getInstance();
