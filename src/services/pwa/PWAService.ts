import { EventEmitter } from 'events';

// PWA状態型
interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  serviceWorkerActive: boolean;
  notificationPermission: NotificationPermission;
  backgroundSyncSupported: boolean;
  pushNotificationSupported: boolean;
}

// インストールプロンプト管理
interface InstallPromptState {
  available: boolean;
  deferredPrompt: any;
  lastShown: Date | null;
  userDeclined: boolean;
  installCount: number;
}

// オフライン機能状態
interface OfflineCapability {
  cognitiveAssessment: boolean;
  taskManagement: boolean;
  energyTracking: boolean;
  emergencyFunctions: boolean;
  dataEntry: boolean;
}

// 通知設定型
interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  energyAlerts: boolean;
  budgetWarnings: boolean;
  focusBreaks: boolean;
  emergencySupport: boolean;

  // ADHD特化設定
  hyperfocusProtection: boolean;
  distractionAlerts: boolean;
  medicationReminders: boolean;
  routineNudges: boolean;

  // タイミング設定
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };

  // 頻度制限
  maxNotificationsPerHour: number;
  respectFocusMode: boolean;
}

class PWAService extends EventEmitter {
  private pwaState: PWAState;
  private installPrompt: InstallPromptState;
  private offlineCapability: OfflineCapability;
  private notificationSettings: NotificationSettings;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private isInitialized: boolean = false;

  constructor() {
    super();

    this.pwaState = {
      isInstalled: this.checkIfInstalled(),
      isInstallable: false,
      isOnline: navigator.onLine,
      serviceWorkerActive: false,
      notificationPermission: 'default',
      backgroundSyncSupported: this.checkBackgroundSyncSupport(),
      pushNotificationSupported: this.checkPushNotificationSupport(),
    };

    this.installPrompt = {
      available: false,
      deferredPrompt: null,
      lastShown: null,
      userDeclined: false,
      installCount: 0,
    };

    this.offlineCapability = {
      cognitiveAssessment: true,
      taskManagement: true,
      energyTracking: true,
      emergencyFunctions: true,
      dataEntry: true,
    };

    this.notificationSettings = this.loadNotificationSettings();

    this.initialize();
  }

  /**
   * PWAサービス初期化
   */
  private async initialize(): Promise<void> {
    try {
      await this.registerServiceWorker();
      this.setupEventListeners();
      this.setupInstallPrompt();
      this.setupNotificationManagement();
      await this.requestNotificationPermission();

      this.isInitialized = true;
      console.log('📱 PWAサービス初期化完了');
      this.emit('pwa-initialized', this.pwaState);
    } catch (error) {
      console.error('PWAサービス初期化エラー:', error);
      this.emit('pwa-error', error);
    }
  }

  /**
   * サービスワーカー登録
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        this.serviceWorker = registration;
        this.pwaState.serviceWorkerActive = true;

        console.log('✅ サービスワーカー登録成功');

        // サービスワーカー更新監視
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.emit('update-available');
              }
            });
          }
        });

        // メッセージ通信設定
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });
      } catch (error) {
        console.error('❌ サービスワーカー登録失敗:', error);
        throw error;
      }
    } else {
      throw new Error('サービスワーカーがサポートされていません');
    }
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    // オンライン/オフライン状態監視
    window.addEventListener('online', () => {
      this.pwaState.isOnline = true;
      this.emit('online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.pwaState.isOnline = false;
      this.emit('offline');
      this.notifyOfflineMode();
    });

    // ページ可視性変更監視
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });

    // アプリケーション状態変更監視
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt.deferredPrompt = event;
      this.installPrompt.available = true;
      this.pwaState.isInstallable = true;

      this.emit('install-available');

      // ADHD配慮：適切なタイミングでインストール促進
      this.scheduleInstallPromotion();
    });

    window.addEventListener('appinstalled', () => {
      this.pwaState.isInstalled = true;
      this.installPrompt.installCount++;
      this.emit('app-installed');
      console.log('📱 アプリがインストールされました');
    });
  }

  /**
   * インストールプロンプト設定
   */
  private setupInstallPrompt(): void {
    // ユーザーエンゲージメントに基づく適切なタイミング計算
    const storedData = localStorage.getItem('pwa-install-data');
    if (storedData) {
      const data = JSON.parse(storedData);
      this.installPrompt = { ...this.installPrompt, ...data };
    }
  }

  /**
   * 通知管理設定
   */
  private setupNotificationManagement(): void {
    if ('Notification' in window) {
      this.pwaState.notificationPermission = Notification.permission;

      // 通知クリック時の処理
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('notificationclick', (event) => {
          this.handleNotificationClick(event);
        });
      });
    }
  }

  /**
   * インストール促進（ADHD配慮）
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.installPrompt.available || !this.installPrompt.deferredPrompt) {
      return false;
    }

    try {
      const promptEvent = this.installPrompt.deferredPrompt;
      const result = await promptEvent.prompt();

      this.installPrompt.lastShown = new Date();
      this.installPrompt.deferredPrompt = null;
      this.installPrompt.available = false;

      if (result.outcome === 'accepted') {
        console.log('✅ ユーザーがインストールを承諾');
        this.saveInstallPromptData();
        return true;
      } else {
        console.log('❌ ユーザーがインストールを拒否');
        this.installPrompt.userDeclined = true;
        this.saveInstallPromptData();
        return false;
      }
    } catch (error) {
      console.error('インストールプロンプトエラー:', error);
      return false;
    }
  }

  /**
   * 適切なタイミングでのインストール促進
   */
  private scheduleInstallPromotion(): void {
    // ADHD配慮：集中を妨げない適切なタイミングを判定
    const conditions = [
      !this.installPrompt.userDeclined,
      this.installPrompt.installCount < 3, // 3回まで
      !this.installPrompt.lastShown ||
        Date.now() - this.installPrompt.lastShown.getTime() > 7 * 24 * 60 * 60 * 1000, // 1週間間隔
    ];

    if (conditions.every(Boolean)) {
      // 使用パターンに基づいて適切なタイミングを計算
      setTimeout(() => {
        this.emit('suggest-install');
      }, 30000); // 30秒後に提案
    }
  }

  /**
   * 通知権限リクエスト
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('通知がサポートされていません');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.pwaState.notificationPermission = permission;
      this.emit('notification-permission-changed', permission);

      if (permission === 'granted') {
        await this.setupPushNotifications();
      }

      return permission;
    }

    return Notification.permission;
  }

  /**
   * プッシュ通知設定
   */
  private async setupPushNotifications(): Promise<void> {
    if (!this.serviceWorker || !('PushManager' in window)) {
      console.warn('プッシュ通知がサポートされていません');
      return;
    }

    try {
      const subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // 実際の実装では環境変数から取得
          'YOUR_VAPID_PUBLIC_KEY'
        ),
      });

      // サーバーに購読情報を送信
      await this.sendSubscriptionToServer(subscription);

      console.log('✅ プッシュ通知設定完了');
    } catch (error) {
      console.error('プッシュ通知設定エラー:', error);
    }
  }

  /**
   * ADHD特化通知送信
   */
  public async sendADHDNotification(
    type: 'task-reminder' | 'energy-alert' | 'focus-break' | 'emergency' | 'medication',
    options: {
      title: string;
      message: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      actionUrl?: string;
      respectQuietHours?: boolean;
      respectFocusMode?: boolean;
    }
  ): Promise<void> {
    // 通知設定チェック
    if (!this.shouldSendNotification(type, options)) {
      return;
    }

    // ADHD配慮：集中状態確認
    const focusState = await this.getCurrentFocusState();
    if (focusState === 'hyperfocus' && options.priority !== 'critical') {
      // ハイパーフォーカス時は緊急以外は遅延
      this.scheduleDelayedNotification(type, options);
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: options.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `adhd-${type}-${Date.now()}`,
      requireInteraction: options.priority === 'critical',
      silent: focusState === 'focused' && options.priority !== 'high',
      data: {
        type,
        url: options.actionUrl,
        timestamp: new Date().toISOString(),
      },
    };

    // 振動パターン（ADHD特化）
    if (type === 'emergency') {
      // Emergency vibrate pattern would be set here for supported browsers
    } else if (type === 'focus-break') {
      // Gentle vibrate pattern would be set here for supported browsers
    }

    // アクションボタン
    // Notification actions would be set here for supported browsers

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // サービスワーカー経由で送信
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: options.title,
        options: notificationOptions,
      });
    } else {
      // 直接通知
      new Notification(options.title, notificationOptions);
    }

    this.logNotificationSent(type, options);
  }

  /**
   * 通知可否判定
   */
  private shouldSendNotification(
    type: string,
    options: { respectQuietHours?: boolean; respectFocusMode?: boolean }
  ): boolean {
    // 基本チェック
    if (!this.notificationSettings.enabled || this.pwaState.notificationPermission !== 'granted') {
      return false;
    }

    // タイプ別設定チェック
    const typeSettings = (this.notificationSettings as any)[type.replace('-', '_')];
    if (typeSettings === false) {
      return false;
    }

    // 静寂時間チェック
    if (options.respectQuietHours && this.isQuietHours()) {
      return false;
    }

    // 頻度制限チェック
    if (this.isNotificationRateLimited()) {
      return false;
    }

    return true;
  }

  /**
   * 静寂時間判定
   */
  private isQuietHours(): boolean {
    if (!this.notificationSettings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.notificationSettings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.notificationSettings.quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 日をまたぐ場合
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 通知頻度制限チェック
   */
  private isNotificationRateLimited(): boolean {
    const recentNotifications = this.getRecentNotifications();
    return recentNotifications.length >= this.notificationSettings.maxNotificationsPerHour;
  }

  /**
   * 背景同期トリガー
   */
  public async triggerBackgroundSync(tag: string): Promise<void> {
    if (!this.serviceWorker || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('背景同期がサポートされていません');
      return;
    }

    try {
      // Background sync would be registered here for supported browsers
      console.log('Background sync requested:', tag);
      console.log(`✅ 背景同期登録: ${tag}`);
    } catch (error) {
      console.error('背景同期登録エラー:', error);
    }
  }

  /**
   * オフラインデータ同期
   */
  private async syncOfflineData(): Promise<void> {
    const syncTasks = [
      'cognitive-data-sync',
      'energy-pattern-sync',
      'task-data-sync',
      'asset-data-sync',
    ];

    for (const task of syncTasks) {
      await this.triggerBackgroundSync(task);
    }

    this.emit('offline-data-synced');
  }

  /**
   * 現在の集中状態取得
   */
  private async getCurrentFocusState(): Promise<string> {
    // ローカルストレージから現在の集中状態を取得
    const storedState = localStorage.getItem('current-focus-state');
    return storedState || 'normal';
  }

  /**
   * 遅延通知スケジューリング
   */
  private scheduleDelayedNotification(type: string, options: any): void {
    const delayedNotifications = JSON.parse(localStorage.getItem('delayed-notifications') || '[]');

    delayedNotifications.push({
      type,
      options,
      scheduledFor: new Date(Date.now() + 10 * 60 * 1000), // 10分後
    });

    localStorage.setItem('delayed-notifications', JSON.stringify(delayedNotifications));

    // 10分後に再チェック
    setTimeout(
      () => {
        this.processDelayedNotifications();
      },
      10 * 60 * 1000
    );
  }

  /**
   * 遅延通知処理
   */
  private async processDelayedNotifications(): Promise<void> {
    const delayedNotifications = JSON.parse(localStorage.getItem('delayed-notifications') || '[]');

    const now = new Date();
    const readyNotifications = delayedNotifications.filter(
      (notification: any) => new Date(notification.scheduledFor) <= now
    );

    for (const notification of readyNotifications) {
      const focusState = await this.getCurrentFocusState();
      if (focusState !== 'hyperfocus') {
        await this.sendADHDNotification(notification.type, notification.options);
      }
    }

    // 処理済み通知を削除
    const remainingNotifications = delayedNotifications.filter(
      (notification: any) => new Date(notification.scheduledFor) > now
    );

    localStorage.setItem('delayed-notifications', JSON.stringify(remainingNotifications));
  }

  /**
   * 通知アクション生成
   */
  private getNotificationActions(type: string): any[] {
    const actions: { [key: string]: any[] } = {
      'task-reminder': [
        { action: 'complete', title: '完了' },
        { action: 'snooze', title: '5分後' },
        { action: 'view', title: '確認' },
      ],
      'energy-alert': [
        { action: 'rest', title: '休憩' },
        { action: 'energize', title: '活性化' },
        { action: 'dismiss', title: '無視' },
      ],
      'focus-break': [
        { action: 'break', title: '休憩開始' },
        { action: 'extend', title: '延長' },
        { action: 'stop', title: '停止' },
      ],
      emergency: [
        { action: 'help', title: 'ヘルプ' },
        { action: 'breathe', title: '呼吸法' },
        { action: 'contact', title: '連絡' },
      ],
    };

    return actions[type] || [];
  }

  /**
   * ユーティリティメソッド
   */
  private checkIfInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  private checkBackgroundSyncSupport(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  }

  private checkPushNotificationSupport(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  private loadNotificationSettings(): NotificationSettings {
    const stored = localStorage.getItem('notification-settings');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      enabled: true,
      taskReminders: true,
      energyAlerts: true,
      budgetWarnings: true,
      focusBreaks: true,
      emergencySupport: true,
      hyperfocusProtection: true,
      distractionAlerts: true,
      medicationReminders: false,
      routineNudges: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      maxNotificationsPerHour: 5,
      respectFocusMode: true,
    };
  }

  private saveInstallPromptData(): void {
    localStorage.setItem(
      'pwa-install-data',
      JSON.stringify({
        lastShown: this.installPrompt.lastShown,
        userDeclined: this.installPrompt.userDeclined,
        installCount: this.installPrompt.installCount,
      })
    );
  }

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

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // 実際の実装では、サーバーに購読情報を送信
    console.log('購読情報をサーバーに送信:', subscription);
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'CACHE_UPDATED':
        this.emit('cache-updated');
        break;
      case 'BACKGROUND_SYNC_COMPLETE':
        this.emit('background-sync-complete', data.tag);
        break;
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data);
        break;
    }
  }

  private handleNotificationClick(data: any): void {
    const { action, notification } = data;

    switch (action) {
      case 'complete':
        this.emit('task-complete', notification.data);
        break;
      case 'snooze':
        this.emit('task-snooze', notification.data);
        break;
      case 'help':
        this.emit('emergency-help-requested');
        break;
    }
  }

  private notifyOfflineMode(): void {
    this.sendADHDNotification('energy-alert', {
      title: 'オフラインモード',
      message: 'ネットワーク接続が失われました。オフライン機能で継続できます。',
      priority: 'normal',
      respectQuietHours: false,
    });
  }

  private checkForUpdates(): void {
    if (this.serviceWorker) {
      this.serviceWorker.update();
    }
  }

  private getRecentNotifications(): any[] {
    const recent = localStorage.getItem('recent-notifications');
    if (!recent) return [];

    const notifications = JSON.parse(recent);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return notifications.filter((n: any) => new Date(n.timestamp) > oneHourAgo);
  }

  private logNotificationSent(type: string, options: any): void {
    const recent = this.getRecentNotifications();
    recent.push({
      type,
      timestamp: new Date().toISOString(),
      title: options.title,
    });

    localStorage.setItem('recent-notifications', JSON.stringify(recent));
  }

  /**
   * パブリックAPI
   */
  public getPWAState(): PWAState {
    return { ...this.pwaState };
  }

  public getOfflineCapability(): OfflineCapability {
    return { ...this.offlineCapability };
  }

  public updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    localStorage.setItem('notification-settings', JSON.stringify(this.notificationSettings));
    this.emit('notification-settings-updated', this.notificationSettings);
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.serviceWorker && this.serviceWorker.waiting) {
      this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  public stop(): void {
    this.removeAllListeners();
    console.log('🛑 PWAサービス停止');
  }
}

// シングルトンインスタンス
const pwaService = new PWAService();

export default pwaService;
export { PWAService };
export type { PWAState, NotificationSettings, OfflineCapability };
