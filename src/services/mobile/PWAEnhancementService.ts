/**
 * 📱 PWA機能強化サービス
 * オフライン対応・プッシュ通知・背景同期・ホーム画面追加・ADHD/ASD最適化
 */

import { EventEmitter } from 'eventemitter3';

// PWA状態
export interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  installPrompt: any;
}

// オフラインデータ
export interface OfflineData {
  tasks: any[];
  cognitiveData: any[];
  settings: any;
  lastSync: Date;
  pendingChanges: any[];
}

// プッシュ通知設定
export interface PushNotificationSettings {
  enabled: boolean;
  adhdOptimized: boolean;
  types: {
    taskReminders: boolean;
    energyAlerts: boolean;
    cognitiveOverload: boolean;
    breakReminders: boolean;
    dailySummary: boolean;
    achievements: boolean;
  };
  schedule: {
    quietHours: { start: string; end: string };
    frequency: 'minimal' | 'normal' | 'frequent';
    adaptiveTiming: boolean; // 認知負荷に応じた調整
  };
  adhdSupport: {
    gentleAlerts: boolean; // 穏やかなアラート
    contextualReminders: boolean; // 文脈的リマインダー
    visualCues: boolean; // 視覚的手がかり
    audioCustomization: boolean; // 音声カスタマイズ
  };
}

// 背景同期設定
export interface BackgroundSyncSettings {
  enabled: boolean;
  tasks: {
    cognitiveData: { interval: number; lastRun: Date };
    taskSync: { interval: number; lastRun: Date };
    settingsBackup: { interval: number; lastRun: Date };
    analyticsUpload: { interval: number; lastRun: Date };
  };
}

// インストールガイド
export interface InstallationGuide {
  platform: 'ios' | 'android' | 'desktop';
  steps: string[];
  images?: string[];
  videoUrl?: string;
}

class PWAEnhancementService extends EventEmitter {
  private static instance: PWAEnhancementService | null = null;
  private state!: PWAState;
  private pushSettings!: PushNotificationSettings;
  private syncSettings!: BackgroundSyncSettings;
  private offlineData!: OfflineData;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private installPromptEvent: any = null;

  private constructor() {
    super();
    this.initializeState();
    this.initializePushSettings();
    this.initializeSyncSettings();
    this.initializeOfflineData();
    console.log('📱 PWA Enhancement Service initialized');
  }

  static getInstance(): PWAEnhancementService {
    if (!PWAEnhancementService.instance) {
      PWAEnhancementService.instance = new PWAEnhancementService();
    }
    return PWAEnhancementService.instance;
  }

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    // Service Worker登録
    await this.registerServiceWorker();

    // オンライン/オフライン状態監視
    this.setupOnlineOfflineListeners();

    // インストールプロンプト監視
    this.setupInstallPromptListener();

    // PWA状態検出
    this.detectPWAState();

    // プッシュ通知初期化
    await this.initializePushNotifications();

    // 背景同期初期化
    this.initializeBackgroundSync();

    console.log('📱 PWA Enhancement Service ready');
    this.emit('pwaReady', this.state);
  }

  /**
   * 状態初期化
   */
  private initializeState(): void {
    this.state = {
      isInstalled: this.isPWAInstalled(),
      isStandalone: this.isPWAStandalone(),
      canInstall: false,
      isOnline: navigator.onLine,
      hasUpdate: false,
      installPrompt: null,
    };
  }

  private initializePushSettings(): void {
    this.pushSettings = {
      enabled: false,
      adhdOptimized: true,
      types: {
        taskReminders: true,
        energyAlerts: true,
        cognitiveOverload: true,
        breakReminders: true,
        dailySummary: true,
        achievements: true,
      },
      schedule: {
        quietHours: { start: '22:00', end: '08:00' },
        frequency: 'normal',
        adaptiveTiming: true,
      },
      adhdSupport: {
        gentleAlerts: true,
        contextualReminders: true,
        visualCues: true,
        audioCustomization: true,
      },
    };
  }

  private initializeSyncSettings(): void {
    this.syncSettings = {
      enabled: true,
      tasks: {
        cognitiveData: { interval: 300000, lastRun: new Date() }, // 5分
        taskSync: { interval: 600000, lastRun: new Date() }, // 10分
        settingsBackup: { interval: 3600000, lastRun: new Date() }, // 1時間
        analyticsUpload: { interval: 1800000, lastRun: new Date() }, // 30分
      },
    };
  }

  private initializeOfflineData(): void {
    this.offlineData = {
      tasks: [],
      cognitiveData: [],
      settings: {},
      lastSync: new Date(),
      pendingChanges: [],
    };
  }

  /**
   * Service Worker登録
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      // Temporarily disabled to prevent sw.js not found errors
      console.log('🔄 Mobile PWA ServiceWorker registration temporarily disabled for development');
      return;

      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('📱 Service Worker registered successfully');

        // アップデート検出
        this.serviceWorker.addEventListener('updatefound', () => {
          this.state.hasUpdate = true;
          this.emit('updateAvailable');
        });

        // Service Workerからのメッセージ受信
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
      } catch (error) {
        console.error('📱 Service Worker registration failed:', error);
      }
    }
  }

  /**
   * オンライン/オフライン監視
   */
  private setupOnlineOfflineListeners(): void {
    const updateOnlineStatus = () => {
      const wasOnline = this.state.isOnline;
      this.state.isOnline = navigator.onLine;

      if (this.state.isOnline && !wasOnline) {
        // オンラインに戻った
        this.handleOnlineRestored();
      } else if (!this.state.isOnline && wasOnline) {
        // オフラインになった
        this.handleOffline();
      }

      this.emit('connectionStateChanged', this.state.isOnline);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  /**
   * インストールプロンプト監視
   */
  private setupInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPromptEvent = event;
      this.state.canInstall = true;
      this.state.installPrompt = event;

      this.emit('installPromptReady');
    });

    window.addEventListener('appinstalled', () => {
      this.state.isInstalled = true;
      this.installPromptEvent = null;
      this.state.canInstall = false;

      this.emit('appInstalled');
    });
  }

  /**
   * PWA状態検出
   */
  private detectPWAState(): void {
    // スタンドアロンモード検出
    this.state.isStandalone = this.isPWAStandalone();

    // インストール状態検出
    this.state.isInstalled = this.isPWAInstalled();
  }

  private isPWAStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  private isPWAInstalled(): boolean {
    return this.isPWAStandalone() || localStorage.getItem('pwa-installed') === 'true';
  }

  /**
   * プッシュ通知初期化
   */
  private async initializePushNotifications(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('📱 Push notifications not supported');
      return;
    }

    // 通知権限チェック
    if (Notification.permission === 'granted') {
      this.pushSettings.enabled = true;
      await this.subscribeToPush();
    }
  }

  /**
   * プッシュ通知許可要求
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      this.pushSettings.enabled = true;
      await this.subscribeToPush();
      this.emit('notificationPermissionGranted');
      return true;
    }

    return false;
  }

  /**
   * プッシュ通知購読
   */
  private async subscribeToPush(): Promise<void> {
    if (!this.serviceWorker) return;

    try {
      const subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        ) as unknown as BufferSource,
      });

      // サーバーに購読情報送信
      await this.sendSubscriptionToServer(subscription);

      console.log('📱 Push notification subscription successful');
    } catch (error) {
      console.error('📱 Push notification subscription failed:', error);
    }
  }

  /**
   * ADHD最適化通知送信
   */
  async sendADHDOptimizedNotification(options: {
    title: string;
    body: string;
    type: keyof PushNotificationSettings['types'];
    urgency?: 'low' | 'normal' | 'high';
    cognitiveLoad?: number;
  }): Promise<void> {
    if (!this.pushSettings.enabled || !this.pushSettings.types[options.type]) {
      return;
    }

    // 認知負荷に応じた調整
    const optimizedOptions = this.optimizeNotificationForADHD(options);

    // 静音時間チェック
    if (this.isQuietHours()) {
      // 緊急度が高い場合のみ送信
      if (options.urgency !== 'high') {
        return;
      }
    }

    // 適応的タイミング
    if (this.pushSettings.schedule.adaptiveTiming && options.cognitiveLoad) {
      if (options.cognitiveLoad > 7 && options.urgency !== 'high') {
        // 認知負荷が高い場合は遅延
        setTimeout(() => {
          this.sendNotification(optimizedOptions);
        }, 300000); // 5分後
        return;
      }
    }

    await this.sendNotification(optimizedOptions);
  }

  /**
   * ADHD向け通知最適化
   */
  private optimizeNotificationForADHD(options: any): any {
    const optimized = { ...options };

    if (this.pushSettings.adhdSupport.gentleAlerts) {
      // 穏やかな表現に調整
      optimized.title = `💙 ${optimized.title}`;
      optimized.body = `${optimized.body} 🌟`;
    }

    if (this.pushSettings.adhdSupport.contextualReminders) {
      // 文脈的情報追加
      const context = this.getCurrentContext();
      optimized.body += `\n現在: ${context}`;
    }

    if (this.pushSettings.adhdSupport.visualCues) {
      // 視覚的手がかり追加
      optimized.icon = '/icons/adhd-friendly-icon.png';
      optimized.badge = '/icons/notification-badge.png';
    }

    return optimized;
  }

  /**
   * 通知送信
   */
  private async sendNotification(options: any): Promise<void> {
    if (this.serviceWorker) {
      this.serviceWorker.active?.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: options,
      });
    } else {
      // フォールバック: ブラウザ通知
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.type,
      });
    }
  }

  /**
   * 背景同期初期化
   */
  private initializeBackgroundSync(): void {
    if (!this.syncSettings.enabled) return;

    // 各タスクの定期実行設定
    Object.entries(this.syncSettings.tasks).forEach(([taskName, config]) => {
      setInterval(() => {
        this.executeBackgroundTask(taskName);
      }, config.interval);
    });
  }

  /**
   * 背景タスク実行
   */
  private async executeBackgroundTask(taskName: string): Promise<void> {
    if (!this.state.isOnline) {
      // オフライン時は保留
      return;
    }

    try {
      switch (taskName) {
        case 'cognitiveData':
          await this.syncCognitiveData();
          break;
        case 'taskSync':
          await this.syncTasks();
          break;
        case 'settingsBackup':
          await this.backupSettings();
          break;
        case 'analyticsUpload':
          await this.uploadAnalytics();
          break;
      }

      this.syncSettings.tasks[taskName as keyof typeof this.syncSettings.tasks].lastRun =
        new Date();
      this.emit('backgroundTaskCompleted', taskName);
    } catch (error) {
      console.error(`📱 Background task ${taskName} failed:`, error);
      this.emit('backgroundTaskFailed', { taskName, error });
    }
  }

  /**
   * オフライン処理
   */
  private handleOffline(): void {
    console.log('📱 App went offline');

    // オフラインデータの準備
    this.prepareOfflineData();

    // ユーザーに通知
    this.emit('offline');

    // ADHD配慮: 穏やかな通知
    if (this.pushSettings.adhdSupport?.gentleAlerts) {
      this.showOfflineNotification();
    }
  }

  private handleOnlineRestored(): void {
    console.log('📱 App back online');

    // 保留中の変更を同期
    this.syncPendingChanges();

    this.emit('online');
  }

  /**
   * オフラインデータ準備
   */
  private prepareOfflineData(): void {
    // 重要なデータをローカルストレージに保存
    const criticalData = {
      tasks: this.getCurrentTasks(),
      cognitiveSettings: this.getCognitiveSettings(),
      userPreferences: this.getUserPreferences(),
    };

    localStorage.setItem('offline-data', JSON.stringify(criticalData));
  }

  /**
   * アプリインストール
   */
  async installApp(): Promise<boolean> {
    if (!this.installPromptEvent) {
      return false;
    }

    try {
      this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;

      if (outcome === 'accepted') {
        this.state.isInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        this.emit('appInstalled');
        return true;
      }

      return false;
    } catch (error) {
      console.error('📱 App installation failed:', error);
      return false;
    }
  }

  /**
   * インストールガイド生成
   */
  getInstallationGuide(): InstallationGuide {
    const platform = this.detectPlatform();

    const guides = {
      ios: {
        platform: 'ios' as const,
        steps: [
          'Safariで当サイトを開く',
          '画面下部の共有ボタンをタップ',
          '「ホーム画面に追加」を選択',
          'アプリ名を確認して「追加」をタップ',
        ],
      },
      android: {
        platform: 'android' as const,
        steps: [
          'Chromeで当サイトを開く',
          '右上のメニューボタンをタップ',
          '「ホーム画面に追加」を選択',
          'アプリ名を確認して「追加」をタップ',
        ],
      },
      desktop: {
        platform: 'desktop' as const,
        steps: [
          'ChromeまたはEdgeで当サイトを開く',
          'アドレスバー右側のインストールアイコンをクリック',
          '「インストール」ボタンをクリック',
        ],
      },
    };

    return guides[platform];
  }

  /**
   * ヘルパーメソッド
   */
  private detectPlatform(): 'ios' | 'android' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'desktop';
    }
  }

  private isQuietHours(): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { start, end } = this.pushSettings.schedule.quietHours;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }

  private getCurrentContext(): string {
    // 現在のコンテキストを取得（例：作業中、休憩中など）
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      return '作業時間';
    } else if (hour >= 18 && hour <= 21) {
      return '夕方の時間';
    } else {
      return 'プライベート時間';
    }
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

  // プレースホルダーメソッド（実装は他のサービスと連携）
  private getCurrentTasks(): any[] {
    return [];
  }
  private getCognitiveSettings(): any {
    return {};
  }
  private getUserPreferences(): any {
    return {};
  }
  private async syncCognitiveData(): Promise<void> {}
  private async syncTasks(): Promise<void> {}
  private async backupSettings(): Promise<void> {}
  private async uploadAnalytics(): Promise<void> {}
  private async syncPendingChanges(): Promise<void> {}
  private async sendSubscriptionToServer(subscription: any): Promise<void> {}
  private handleServiceWorkerMessage(data: any): void {}

  private showOfflineNotification(): void {
    // ADHD配慮のオフライン通知
    this.emit('showNotification', {
      title: '💙 オフラインモード',
      message: 'インターネット接続が切断されました。データは安全に保存されています。',
      type: 'info',
      duration: 5000,
    });
  }

  /**
   * 公開メソッド
   */
  public getState(): PWAState {
    return { ...this.state };
  }

  public getPushSettings(): PushNotificationSettings {
    return { ...this.pushSettings };
  }

  public updatePushSettings(settings: Partial<PushNotificationSettings>): void {
    this.pushSettings = { ...this.pushSettings, ...settings };
    this.emit('pushSettingsUpdated', this.pushSettings);
  }

  public getSyncSettings(): BackgroundSyncSettings {
    return { ...this.syncSettings };
  }

  public updateSyncSettings(settings: Partial<BackgroundSyncSettings>): void {
    this.syncSettings = { ...this.syncSettings, ...settings };
    this.emit('syncSettingsUpdated', this.syncSettings);
  }

  public getDashboardData() {
    return {
      state: this.state,
      pushSettings: this.pushSettings,
      syncSettings: this.syncSettings,
      offlineData: {
        ...this.offlineData,
        size: new Blob([JSON.stringify(this.offlineData)]).size,
      },
    };
  }
}

export const pwaEnhancementService = PWAEnhancementService.getInstance();
export default pwaEnhancementService;
