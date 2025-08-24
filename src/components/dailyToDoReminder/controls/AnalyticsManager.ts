/**
 * アナリティクスマネージャー
 * ユーザー行動や利用状況の追跡と分析を担当
 */
import Logger from './Logger';

/**
 * アナリティクスイベント
 */
export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

/**
 * アナリティクスプロバイダーインターフェース
 */
export interface AnalyticsProvider {
  name: string;
  initialize(): Promise<void>;
  trackEvent(eventName: string, properties: Record<string, unknown>): Promise<void>;
  setUserProperties(userId: string, properties: Record<string, unknown>): Promise<void>;
  flush(): Promise<void>;
}

/**
 * アナリティクスマネージャークラス
 */
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private providers: AnalyticsProvider[];
  private logger: Logger;
  private userId: string | null;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[];
  private isInitialized: boolean;
  private flushInterval: number | null;
  private isDebugMode: boolean;

  private constructor() {
    this.providers = [];
    this.logger = Logger.getInstance();
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.isInitialized = false;
    this.flushInterval = null;
    this.isDebugMode = process.env.NODE_ENV !== 'production';

    // ブラウザの場合はセッション管理を初期化
    if (typeof window !== 'undefined') {
      this.initializeSession();
    }
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * セッションIDの生成
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * セッション管理の初期化
   */
  private initializeSession(): void {
    // セッションストレージからセッションIDを取得
    const storedSessionId = sessionStorage.getItem('analytics_session_id');

    if (storedSessionId) {
      this.sessionId = storedSessionId;
    } else {
      // 新しいセッションIDを保存
      sessionStorage.setItem('analytics_session_id', this.sessionId);
    }

    // ページの閲覧状況変化を監視
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // 定期的なフラッシュ処理を設定
    this.flushInterval = window.setInterval(() => {
      this.flush();
    }, 30000); // 30秒ごと
  }

  /**
   * アナリティクスプロバイダーの登録
   */
  public registerProvider(provider: AnalyticsProvider): void {
    // 既に同名のプロバイダーが登録されている場合は削除
    this.providers = this.providers.filter((p) => p.name !== provider.name);

    // プロバイダーを追加
    this.providers.push(provider);

    this.logger.info(`アナリティクスプロバイダー「${provider.name}」を登録しました`);
  }

  /**
   * 初期化
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 各プロバイダーを初期化
      for (const provider of this.providers) {
        await provider.initialize();
        this.logger.debug(`アナリティクスプロバイダー「${provider.name}」を初期化しました`);
      }

      this.isInitialized = true;
      this.logger.info('アナリティクスマネージャーを初期化しました');

      // キューに溜まっているイベントを処理
      this.processEventQueue();
    } catch (error) {
      this.logger.error('アナリティクスマネージャーの初期化に失敗しました', { error });
    }
  }

  /**
   * ユーザーIDの設定
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
    this.logger.debug(`ユーザーIDを設定しました: ${userId}`);
  }

  /**
   * ユーザープロパティの設定
   */
  public async setUserProperties(properties: Record<string, unknown>): Promise<void> {
    if (!this.userId) {
      this.logger.warn('ユーザーIDが設定されていないためユーザープロパティを設定できません');
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 各プロバイダーにユーザープロパティを設定
      for (const provider of this.providers) {
        await provider.setUserProperties(this.userId, properties);
      }

      this.logger.debug('ユーザープロパティを設定しました', { userId: this.userId });
    } catch (error) {
      this.logger.error('ユーザープロパティの設定に失敗しました', { error });
    }
  }

  /**
   * イベントの追跡
   */
  public trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    // イベントオブジェクトを作成
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
    };

    // デバッグモードの場合はコンソールに出力
    if (this.isDebugMode) {
      console.log('[Analytics]', event);
    }

    // イベントをキューに追加
    this.eventQueue.push(event);

    // 初期化済みの場合はすぐに処理
    if (this.isInitialized) {
      this.processEventQueue();
    }
  }

  /**
   * イベントキューの処理
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // 各プロバイダーにイベントを送信
      for (const provider of this.providers) {
        for (const event of events) {
          await provider.trackEvent(event.eventName, {
            ...event.properties,
            timestamp: event.timestamp,
            sessionId: event.sessionId,
            userId: event.userId,
          });
        }
      }

      this.logger.debug(`${events.length}件のイベントを処理しました`);
    } catch (error) {
      this.logger.error('イベント処理中にエラーが発生しました', { error });

      // 処理に失敗したイベントをキューに戻す
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * データの強制送信
   */
  public async flush(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // イベントキューを処理
      await this.processEventQueue();

      // 各プロバイダーのフラッシュ処理を実行
      for (const provider of this.providers) {
        await provider.flush();
      }

      this.logger.debug('アナリティクスデータをフラッシュしました');
    } catch (error) {
      this.logger.error('アナリティクスデータのフラッシュに失敗しました', { error });
    }
  }

  /**
   * クリーンアップ
   */
  public cleanup(): void {
    // フラッシュ間隔をクリア
    if (this.flushInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // イベントキューをクリア
    this.eventQueue = [];

    this.logger.debug('アナリティクスマネージャーをクリーンアップしました');
  }
}
