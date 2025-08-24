import { toast } from '@/components/ui/use-toast';
import { generateOperationId } from '../../utils/idGenerator';

export interface CacheStrategy {
  name: string;
  pattern: RegExp;
  strategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate' | 'networkOnly' | 'cacheOnly';
  options: CacheOptions;
}

export interface CacheOptions {
  cacheName: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
  purgeOnQuotaError?: boolean;
  plugins?: CachePlugin[];
}

export interface CachePlugin {
  id: string;
  name: string;
  cacheKeyWillBeUsed?: (params: CacheKeyParams) => Promise<string>;
  cacheWillUpdate?: (params: CacheWillUpdateParams) => Promise<boolean>;
  cachedResponseWillBeUsed?: (params: CachedResponseParams) => Promise<Response | undefined>;
}

export interface CacheKeyParams {
  request: Request;
  mode: 'read' | 'write';
}

export interface CacheWillUpdateParams {
  request: Request;
  response: Response;
  event: any; // ExtendableEvent
}

export interface CachedResponseParams {
  cacheName: string;
  request: Request;
  cachedResponse?: Response;
  event: any; // ExtendableEvent
}

export interface SyncTask {
  id: string;
  tag: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  scheduledAt?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  type: 'immediate' | 'background' | 'periodic';
}

export interface OfflineAction {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  retries: number;
  maxRetries: number;
}

export interface PushSubscriptionConfig {
  userVisibleOnly: boolean;
  applicationServerKey: string;
  scope?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export interface ServiceWorkerConfig {
  version: string;
  cacheStrategies: CacheStrategy[];
  syncConfig: {
    backgroundSyncEnabled: boolean;
    periodicSyncEnabled: boolean;
    syncInterval: number;
  };
  pushConfig: {
    enabled: boolean;
    vapidKey: string;
    defaultIcon: string;
    defaultBadge: string;
  };
  updateConfig: {
    checkInterval: number;
    forceUpdateOnActivate: boolean;
    skipWaiting: boolean;
  };
}

export interface ServiceWorkerStats {
  version: string;
  status: 'installing' | 'waiting' | 'active' | 'redundant';
  cacheStats: {
    totalCaches: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
  };
  syncStats: {
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
  };
  pushStats: {
    subscribed: boolean;
    messagesReceived: number;
    messagesClicked: number;
  };
  lastUpdated: string;
}

/**
 * 📱 プログレッシブWebマスター: 高度ServiceWorkerサービス
 * PWA・オフライン機能・ネイティブ体験の実現
 */
class AdvancedServiceWorkerService {
  private static instance: AdvancedServiceWorkerService | null = null;
  private serviceWorker: ServiceWorker | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private cacheStrategies: Map<string, CacheStrategy> = new Map();
  private syncTasks: Map<string, SyncTask> = new Map();
  private offlineActions: Map<string, OfflineAction> = new Map();
  private pushSubscription: PushSubscription | null = null;
  private isOnline: boolean = navigator.onLine;
  private updateAvailable: boolean = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    // this.initializeServiceWorker(); // Temporarily disabled for debugging
    this.setupEventListeners();
    this.initializeCacheStrategies();
  }

  public static getInstance(): AdvancedServiceWorkerService {
    if (!AdvancedServiceWorkerService.instance) {
      AdvancedServiceWorkerService.instance = new AdvancedServiceWorkerService();
    }
    return AdvancedServiceWorkerService.instance;
  }

  /**
   * 🔧 デフォルト設定取得
   */
  private getDefaultConfig(): ServiceWorkerConfig {
    return {
      version: '1.0.0',
      cacheStrategies: [],
      syncConfig: {
        backgroundSyncEnabled: true,
        periodicSyncEnabled: true,
        syncInterval: 300000, // 5分
      },
      pushConfig: {
        enabled: true,
        vapidKey: process.env.VITE_VAPID_PUBLIC_KEY || '',
        defaultIcon: '/icons/icon-192x192.png',
        defaultBadge: '/icons/badge-72x72.png',
      },
      updateConfig: {
        checkInterval: 60000, // 1分
        forceUpdateOnActivate: true,
        skipWaiting: true,
      },
    };
  }

  /**
   * 🚀 ServiceWorker初期化
   */
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('ServiceWorkerがサポートされていません');
      return;
    }

    // Temporarily disabled to prevent sw.js not found errors
    console.log('🔄 ServiceWorker registration temporarily disabled for development');
    return;

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('🚀 ServiceWorker登録成功:', this.registration.scope);

      // ServiceWorkerの状態監視
      this.setupServiceWorkerListeners();

      // 定期的な更新チェック
      this.startUpdateChecking();

      toast({
        title: 'PWA機能有効',
        description: 'オフライン機能とプッシュ通知が利用可能です',
        variant: 'default',
      });
    } catch (error) {
      console.error('ServiceWorker登録失敗:', error);

      toast({
        title: 'PWA機能エラー',
        description: 'ServiceWorkerの登録に失敗しました',
        variant: 'destructive',
      });
    }
  }

  /**
   * 👂 イベントリスナー設定
   */
  private setupEventListeners(): void {
    // オンライン/オフライン状態監視
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
      console.log('🌐 オンライン状態になりました');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
      console.log('📡 オフライン状態になりました');
    });

    // ページ可視性変更
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });

    // アプリインストール
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.handleInstallPrompt(e as any);
    });
  }

  /**
   * 🔧 ServiceWorkerリスナー設定
   */
  private setupServiceWorkerListeners(): void {
    if (!this.registration) return;

    // 新しいServiceWorkerインストール
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // ServiceWorkerからのメッセージ
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });
  }

  /**
   * 📦 キャッシュ戦略初期化
   */
  private initializeCacheStrategies(): void {
    const defaultStrategies: CacheStrategy[] = [
      {
        name: 'api-cache-first',
        pattern: /\/api\/(static|config)/,
        strategy: 'cacheFirst',
        options: {
          cacheName: 'api-cache',
          maxEntries: 100,
          maxAgeSeconds: 86400, // 24時間
        },
      },
      {
        name: 'api-network-first',
        pattern: /\/api\/(todos|user|real-time)/,
        strategy: 'networkFirst',
        options: {
          cacheName: 'api-dynamic',
          maxEntries: 50,
          maxAgeSeconds: 3600, // 1時間
        },
      },
      {
        name: 'static-stale-revalidate',
        pattern: /\.(js|css|html)$/,
        strategy: 'staleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          maxEntries: 200,
          maxAgeSeconds: 604800, // 7日間
        },
      },
      {
        name: 'images-cache-first',
        pattern: /\.(png|jpg|jpeg|svg|webp|gif)$/,
        strategy: 'cacheFirst',
        options: {
          cacheName: 'images',
          maxEntries: 100,
          maxAgeSeconds: 2592000, // 30日間
        },
      },
      {
        name: 'fonts-cache-first',
        pattern: /\.(woff|woff2|ttf|eot)$/,
        strategy: 'cacheFirst',
        options: {
          cacheName: 'fonts',
          maxEntries: 30,
          maxAgeSeconds: 31536000, // 1年間
        },
      },
    ];

    defaultStrategies.forEach((strategy) => {
      this.cacheStrategies.set(strategy.name, strategy);
    });

    console.log('📦 キャッシュ戦略を初期化しました', this.cacheStrategies.size, '戦略');
  }

  /**
   * 🔄 バックグラウンド同期
   */
  async registerBackgroundSync(
    tag: string,
    data: any,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      maxRetries?: number;
    }
  ): Promise<string> {
    const taskId = generateOperationId('sync');

    const syncTask: SyncTask = {
      id: taskId,
      tag,
      data,
      retryCount: 0,
      maxRetries: options?.maxRetries || 3,
      createdAt: new Date().toISOString(),
      priority: options?.priority || 'normal',
      type: 'background',
    };

    this.syncTasks.set(taskId, syncTask);

    // ServiceWorkerが利用可能な場合は即座に同期
    if (this.registration && 'sync' in this.registration) {
      try {
        await (this.registration as any).sync.register(tag);
        console.log(`🔄 バックグラウンド同期登録: ${tag}`);
      } catch (error) {
        console.error('バックグラウンド同期登録失敗:', error);
        // フォールバック: 即座に実行
        this.executeSyncTask(syncTask);
      }
    } else {
      // ServiceWorkerが利用できない場合は即座に実行
      this.executeSyncTask(syncTask);
    }

    return taskId;
  }

  /**
   * ⏰ 定期同期
   */
  async registerPeriodicSync(
    tag: string,
    options: {
      minInterval: number;
      data?: any;
    }
  ): Promise<void> {
    if (!this.registration || !('periodicSync' in this.registration)) {
      console.warn('定期同期がサポートされていません');
      return;
    }

    try {
      await (this.registration as any).periodicSync.register(tag, {
        minInterval: options.minInterval,
      });

      console.log(`⏰ 定期同期登録: ${tag} (${options.minInterval}ms)`);

      toast({
        title: '定期同期有効',
        description: `${tag}の定期同期を開始しました`,
        variant: 'default',
      });
    } catch (error) {
      console.error('定期同期登録失敗:', error);
    }
  }

  /**
   * 📱 プッシュ通知設定
   */
  async setupPushNotifications(): Promise<boolean> {
    if (!this.registration || !('PushManager' in window)) {
      console.warn('プッシュ通知がサポートされていません');
      return false;
    }

    try {
      // 通知許可要求
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('通知許可が拒否されました');
        return false;
      }

      // プッシュ購読
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.pushConfig.vapidKey),
      });

      this.pushSubscription = subscription;

      // サーバーに購読情報を送信
      await this.sendSubscriptionToServer(subscription);

      console.log('📱 プッシュ通知設定完了');

      toast({
        title: 'プッシュ通知有効',
        description: '重要な更新をお知らせします',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('プッシュ通知設定失敗:', error);
      return false;
    }
  }

  /**
   * 📤 プッシュ通知送信
   */
  async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.pushSubscription) {
      console.warn('プッシュ購読が設定されていません');
      return;
    }

    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || this.config.pushConfig.defaultIcon,
      badge: payload.badge || this.config.pushConfig.defaultBadge,
      image: payload.image,
      tag: payload.tag || 'default',
      data: payload.data || {},
      actions: payload.actions || [],
      silent: payload.silent || false,
      vibrate: payload.vibrate || [200, 100, 200],
      timestamp: payload.timestamp || Date.now(),
    };

    // ローカル通知として表示（開発時）
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationPayload.title, notificationPayload);
    }

    console.log('📤 プッシュ通知送信:', notificationPayload);
  }

  /**
   * 💾 オフラインアクション保存
   */
  saveOfflineAction(
    method: string,
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
      maxRetries?: number;
    }
  ): string {
    const actionId = generateOperationId('action');

    const action: OfflineAction = {
      id: actionId,
      method: method.toUpperCase(),
      url,
      headers: options.headers || {},
      body: options.body,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: options.maxRetries || 3,
    };

    this.offlineActions.set(actionId, action);

    console.log('💾 オフラインアクション保存:', action);

    toast({
      title: 'オフライン操作保存',
      description: 'オンライン復帰時に実行されます',
      variant: 'default',
    });

    return actionId;
  }

  /**
   * 🌐 オンライン復帰処理
   */
  private async handleOnline(): Promise<void> {
    console.log('🌐 オンライン復帰 - 保留中の操作を実行します');

    // 保留中のオフラインアクションを実行
    const pendingActions = Array.from(this.offlineActions.values());

    for (const action of pendingActions) {
      try {
        await this.executeOfflineAction(action);
        this.offlineActions.delete(action.id);
      } catch (error) {
        console.error('オフラインアクション実行失敗:', error);
        action.retries++;

        if (action.retries >= action.maxRetries) {
          this.offlineActions.delete(action.id);
          console.warn('オフラインアクション最大リトライ超過:', action.id);
        }
      }
    }

    // 保留中の同期タスクを実行
    const pendingSyncTasks = Array.from(this.syncTasks.values()).filter(
      (task) => task.retryCount < task.maxRetries
    );

    for (const task of pendingSyncTasks) {
      await this.executeSyncTask(task);
    }

    toast({
      title: 'オンライン復帰',
      description: '保留中の操作を実行中です',
      variant: 'default',
    });
  }

  /**
   * 📡 オフライン移行処理
   */
  private handleOffline(): void {
    console.log('📡 オフライン状態 - キャッシュ戦略に切り替えます');

    toast({
      title: 'オフライン状態',
      description: 'キャッシュされたデータで動作します',
      variant: 'default',
    });
  }

  /**
   * 🔄 同期タスク実行
   */
  private async executeSyncTask(task: SyncTask): Promise<void> {
    try {
      // 実際の同期処理をここに実装
      // 例: API呼び出し、データベース更新など
      console.log('🔄 同期タスク実行中:', task);

      // 成功時はタスクを削除
      this.syncTasks.delete(task.id);
    } catch (error) {
      console.error('同期タスク実行失敗:', error);
      task.retryCount++;

      if (task.retryCount >= task.maxRetries) {
        this.syncTasks.delete(task.id);
        console.warn('同期タスク最大リトライ超過:', task.id);
      } else {
        // 指数バックオフでリトライスケジュール
        const delay = Math.pow(2, task.retryCount) * 1000;
        setTimeout(() => {
          this.executeSyncTask(task);
        }, delay);
      }
    }
  }

  /**
   * 🚀 オフラインアクション実行
   */
  private async executeOfflineAction(action: OfflineAction): Promise<Response> {
    const response = await fetch(action.url, {
      method: action.method,
      headers: action.headers,
      body: action.body ? JSON.stringify(action.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * 🔄 更新チェック開始
   */
  private startUpdateChecking(): void {
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateConfig.checkInterval);
  }

  /**
   * 🔍 更新確認
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('更新チェック失敗:', error);
    }
  }

  /**
   * 📢 更新通知
   */
  private notifyUpdateAvailable(): void {
    toast({
      title: 'アプリ更新利用可能',
      description: '新しいバージョンがあります。更新しますか？',
      variant: 'default',
    });
  }

  /**
   * 🔧 ServiceWorkerメッセージ処理
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('📦 キャッシュ更新:', payload);
        break;
      case 'SYNC_COMPLETED':
        console.log('🔄 同期完了:', payload);
        break;
      case 'PUSH_RECEIVED':
        console.log('📱 プッシュ受信:', payload);
        break;
      default:
        console.log('📨 ServiceWorkerメッセージ:', type, payload);
    }
  }

  /**
   * 📱 アプリインストール処理
   */
  private handleInstallPrompt(event: any): void {
    console.log('📱 アプリインストールプロンプト表示可能');

    // カスタムインストールUIを表示
    toast({
      title: 'アプリをインストール',
      description: 'ホーム画面に追加して快適に利用できます',
      variant: 'default',
    });
  }

  /**
   * 🔧 VAPID キー変換
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

  /**
   * 📤 購読情報送信
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
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
  getServiceWorkerStats(): ServiceWorkerStats {
    return {
      version: this.config.version,
      status: (this.serviceWorker?.state as any) || 'redundant',
      cacheStats: {
        totalCaches: this.cacheStrategies.size,
        totalSize: 0, // 実装時は実際のサイズを計算
        hitRate: 85, // サンプル値
        missRate: 15,
      },
      syncStats: {
        pendingTasks: this.syncTasks.size,
        completedTasks: 0, // 実装時は実際の値を追跡
        failedTasks: 0,
      },
      pushStats: {
        subscribed: !!this.pushSubscription,
        messagesReceived: 0, // 実装時は実際の値を追跡
        messagesClicked: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  getCacheStrategies(): CacheStrategy[] {
    return Array.from(this.cacheStrategies.values());
  }

  getSyncTasks(): SyncTask[] {
    return Array.from(this.syncTasks.values());
  }

  getOfflineActions(): OfflineAction[] {
    return Array.from(this.offlineActions.values());
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  isPushSubscribed(): boolean {
    return !!this.pushSubscription;
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  // アップデート適用
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) return;

    const newWorker = this.registration.waiting || this.registration.installing;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // キャッシュクリア
  async clearCache(cacheName?: string): Promise<void> {
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    console.log('🗑️ キャッシュクリア完了');
  }
}

export const advancedServiceWorkerService = AdvancedServiceWorkerService.getInstance();
