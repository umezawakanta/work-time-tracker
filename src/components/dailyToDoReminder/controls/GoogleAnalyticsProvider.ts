/**
 * Google Analyticsプロバイダー
 * Google Analytics 4との連携を提供
 */
import { AnalyticsProvider } from './AnalyticsManager';
import Logger from './Logger';

declare global {
  interface Window {
    // Google Analytics 4のgtag関数
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4用の設定
 */
export interface GA4Config {
  measurementId: string;
  debug?: boolean;
  userIdDimension?: string;
  sessionIdDimension?: string;
  customMap?: Record<string, string>;
}

/**
 * Google Analyticsプロバイダークラス
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  public readonly name = 'GoogleAnalytics';
  private config: GA4Config;
  private logger: Logger;
  private pendingEvents: Array<{ name: string; params: Record<string, unknown> }>;
  private isLoaded: boolean;

  constructor(config: GA4Config) {
    this.config = config;
    this.logger = Logger.getInstance();
    this.pendingEvents = [];
    this.isLoaded = false;
  }

  /**
   * スクリプトのロード状態を確認
   */
  private isScriptLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  /**
   * Google Analytics 4のスクリプトをロード
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // サーバーサイドの場合は何もしない
        resolve();
        return;
      }

      if (this.isScriptLoaded()) {
        this.isLoaded = true;
        resolve();
        return;
      }

      try {
        // データレイヤーの初期化
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
          if (window.dataLayer) {
            window.dataLayer.push(args);
          }
        };

        // 初期設定
        window.gtag('js', new Date());

        // カスタムマッピングの設定
        const customMap: Record<string, string> = {
          ...this.config.customMap,
        };

        if (this.config.userIdDimension) {
          customMap[this.config.userIdDimension] = 'user_id';
        }

        if (this.config.sessionIdDimension) {
          customMap[this.config.sessionIdDimension] = 'session_id';
        }

        // GA4の設定
        window.gtag('config', this.config.measurementId, {
          send_page_view: false, // 手動でページビューを送信
          custom_map: Object.keys(customMap).length > 0 ? customMap : undefined,
          debug_mode: this.config.debug,
        });

        // スクリプトのロード
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
        script.async = true;

        script.onload = () => {
          this.isLoaded = true;
          this.logger.debug('Google Analyticsスクリプトのロードが完了しました');
          resolve();
        };

        script.onerror = (error) => {
          this.logger.error('Google Analyticsスクリプトのロードに失敗しました', { error });
          reject(error);
        };

        document.head.appendChild(script);
      } catch (error) {
        this.logger.error('Google Analyticsの初期化中にエラーが発生しました', { error });
        reject(error);
      }
    });
  }

  /**
   * プロバイダーの初期化
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadScript();

      // ページビューを送信
      if (typeof window !== 'undefined') {
        this.trackPageView(window.location.pathname + window.location.search);
      }

      // 保留中のイベントを処理
      await this.processPendingEvents();

      this.logger.info('Google Analyticsプロバイダーの初期化が完了しました');
    } catch (error) {
      this.logger.error('Google Analyticsプロバイダーの初期化に失敗しました', { error });
      throw error;
    }
  }

  /**
   * 保留中のイベントを処理
   */
  private async processPendingEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    const events = [...this.pendingEvents];
    this.pendingEvents = [];

    for (const event of events) {
      await this.sendEvent(event.name, event.params);
    }

    this.logger.debug(`${events.length}件の保留中イベントを処理しました`);
  }

  /**
   * イベントの送信
   */
  private async sendEvent(eventName: string, params: Record<string, unknown>): Promise<void> {
    if (!this.isLoaded) {
      this.pendingEvents.push({ name: eventName, params });
      return;
    }

    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    try {
      window.gtag('event', eventName, params);

      if (this.config.debug) {
        this.logger.debug('GA4イベント送信', { eventName, params });
      }
    } catch (error) {
      this.logger.error('GA4イベントの送信に失敗しました', { error, eventName });
    }
  }

  /**
   * ページビューの追跡
   */
  private trackPageView(path: string): void {
    this.sendEvent('page_view', {
      page_path: path,
      page_title: document.title,
    });
  }

  /**
   * イベントの追跡
   */
  public async trackEvent(eventName: string, properties: Record<string, unknown>): Promise<void> {
    await this.sendEvent(eventName, properties);
  }

  /**
   * ユーザープロパティの設定
   */
  public async setUserProperties(
    userId: string,
    properties: Record<string, unknown>
  ): Promise<void> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    try {
      // ユーザーIDの設定
      window.gtag('set', 'user_id', userId);

      // ユーザープロパティの設定
      window.gtag('set', {
        user_properties: properties,
      });

      if (this.config.debug) {
        this.logger.debug('GA4ユーザープロパティ設定', { userId, properties });
      }
    } catch (error) {
      this.logger.error('GA4ユーザープロパティの設定に失敗しました', { error, userId });
    }
  }

  /**
   * データの強制送信
   */
  public async flush(): Promise<void> {
    // GA4は自動的にデータを送信するため、特に処理は不要
    await this.processPendingEvents();
  }
}
