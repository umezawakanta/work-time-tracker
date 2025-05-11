/**
 * アナリティクスマネージャー
 * API使用状況の分析と追跡を行うコンポーネント
 */
import { ApiLogger } from './ApiLogger';
import { ApiResponse } from '../client/ApiTypes';

/**
 * イベントタイプ
 */
type EventType =
    | 'api_request'
    | 'api_response'
    | 'api_error'
    | 'auth_token_updated'
    | 'user_action'
    | 'performance'
    | 'error'
    | 'custom';

/**
 * イベントデータインターフェース
 */
interface EventData {
    type: EventType;
    timestamp: number;
    data: Record<string, unknown>;
}

/**
 * アナリティクスマネージャークラス
 */
export class AnalyticsManager {
    private static instance: AnalyticsManager | null = null;
    private logger = new ApiLogger();
    private initialized = false;
    private events: EventData[] = [];
    private maxEvents = 1000;
    private analyticsEndpoint = '';
    private sendInterval = 60 * 1000; // 1分
    private sendTimer: number | null = null;
    private enabled = true;
    private sessionId = '';
    private userId = '';

    /**
     * シングルトンインスタンスを取得
     */
    public static getInstance(): AnalyticsManager {
        if (!AnalyticsManager.instance) {
            AnalyticsManager.instance = new AnalyticsManager();
        }
        return AnalyticsManager.instance;
    }

    /**
     * コンストラクタ
     */
    private constructor() {
        this.logger.setContext('AnalyticsManager');
    }

    /**
     * 初期化
     */
    public initialize(): void {
        if (this.initialized) return;

        this.logger.info('アナリティクスマネージャーを初期化しています');

        // セッションIDの生成
        this.sessionId = this.generateSessionId();

        // 保存されたデータを読み込む
        this.loadData();

        // 環境変数から設定を読み込む
        this.loadConfig();

        // 定期送信タイマーを設定
        if (typeof window !== 'undefined' && this.enabled && this.analyticsEndpoint) {
            this.startSendTimer();
        }

        this.initialized = true;
        this.logger.info('アナリティクスマネージャーが初期化されました');
    }

    /**
     * 設定の読み込み
     */
    private loadConfig(): void {
        if (typeof process !== 'undefined' && process.env) {
            const env = process.env;

            // アナリティクス設定
            if (env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
                this.analyticsEndpoint = env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
            }

            if (env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'false') {
                this.enabled = false;
            }

            if (env.NEXT_PUBLIC_ANALYTICS_MAX_EVENTS) {
                const maxEvents = parseInt(env.NEXT_PUBLIC_ANALYTICS_MAX_EVENTS, 10);
                if (!isNaN(maxEvents) && maxEvents > 0) {
                    this.maxEvents = maxEvents;
                }
            }

            if (env.NEXT_PUBLIC_ANALYTICS_SEND_INTERVAL) {
                const interval = parseInt(env.NEXT_PUBLIC_ANALYTICS_SEND_INTERVAL, 10);
                if (!isNaN(interval) && interval > 0) {
                    this.sendInterval = interval * 1000; // 秒からミリ秒に変換
                }
            }
        }
    }

    /**
     * 保存されたデータの読み込み
     */
    private loadData(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                // ユーザーIDを読み込む
                const savedUserId = localStorage.getItem('analytics-user-id');
                if (savedUserId) {
                    this.userId = savedUserId;
                } else {
                    // 新しいユーザーIDを生成して保存
                    this.userId = this.generateUserId();
                    localStorage.setItem('analytics-user-id', this.userId);
                }

                // イベントを読み込む
                const savedEvents = localStorage.getItem('analytics-events');
                if (savedEvents) {
                    this.events = JSON.parse(savedEvents) as EventData[];
                    this.logger.debug(`${this.events.length}件のイベントを読み込みました`);
                }
            }
        } catch (error) {
            this.logger.error('アナリティクスデータの読み込みに失敗しました', error);
            this.events = [];
        }
    }

    /**
     * データの保存
     */
    public saveData(): void {
        try {
            if (typeof localStorage !== 'undefined' && this.enabled) {
                localStorage.setItem('analytics-events', JSON.stringify(this.events));
                this.logger.debug(`${this.events.length}件のイベントを保存しました`);
            }
        } catch (error) {
            this.logger.error('アナリティクスデータの保存に失敗しました', error);
        }
    }

    /**
     * セッションIDの生成
     */
    private generateSessionId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * ユーザーIDの生成
     */
    private generateUserId(): string {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * 定期送信タイマーの開始
     */
    private startSendTimer(): void {
        if (this.sendTimer !== null) {
            clearInterval(this.sendTimer);
        }

        this.sendTimer = window.setInterval(() => {
            this.sendEvents();
        }, this.sendInterval);
    }

    /**
     * イベント送信
     */
    private async sendEvents(): Promise<void> {
        if (!this.enabled || this.events.length === 0 || !this.analyticsEndpoint) {
            return;
        }

        try {
            const eventsToSend = [...this.events];
            this.events = [];

            const response = await fetch(this.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userId: this.userId,
                    timestamp: Date.now(),
                    events: eventsToSend
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`送信に失敗しました: ${response.status} ${response.statusText}`);
            }

            this.logger.debug(`${eventsToSend.length}件のイベントを送信しました`);
        } catch (error) {
            this.logger.error('イベント送信に失敗しました', error);
            // 送信に失敗した場合はイベントを戻す
            this.events = [...this.events, ...this.events];

            // 最大イベント数を超えないようにする
            if (this.events.length > this.maxEvents) {
                this.events = this.events.slice(-this.maxEvents);
            }

            this.saveData();
        }
    }

    /**
     * イベントの追跡
     */
    public trackEvent(
        eventType: EventType | string,
        eventData: Record<string, unknown> = {}
    ): void {
        if (!this.initialized) {
            this.initialize();
        }

        if (!this.enabled) {
            return;
        }

        const event: EventData = {
            type: eventType as EventType,
            timestamp: Date.now(),
            data: {
                ...eventData,
                sessionId: this.sessionId,
                userId: this.userId
            }
        };

        this.events.push(event);

        // 最大イベント数を超えた場合は古いものから削除
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // 定期的にデータを保存
        if (this.events.length % 10 === 0) {
            this.saveData();
        }
    }

    /**
     * APIリクエストの追跡
     */
    public trackRequest<T>(response: ApiResponse<T>): void {
        if (!this.enabled) {
            return;
        }

        if (response.success) {
            this.trackEvent('api_response', {
                status: response.status,
                dataType: typeof response.data
            });
        } else {
            this.trackEvent('api_error', {
                status: response.status,
                error: response.error
            });
        }
    }

    /**
     * システム情報の取得
     */
    public getSystemInfo(): Record<string, unknown> {
        if (!this.initialized) {
            this.initialize();
        }

        const browserInfo = this.getBrowserInfo();
        const deviceInfo = this.getDeviceInfo();

        return {
            sessionId: this.sessionId,
            userId: this.userId,
            eventsCount: this.events.length,
            browser: browserInfo,
            device: deviceInfo,
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * ブラウザ情報の取得
     */
    private getBrowserInfo(): Record<string, unknown> {
        if (typeof window === 'undefined' || !window.navigator) {
            return { available: false };
        }

        const { userAgent, language, languages, platform } = window.navigator;

        return {
            userAgent,
            language,
            languages,
            platform,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio
        };
    }

    /**
     * デバイス情報の取得
     */
    private getDeviceInfo(): Record<string, unknown> {
        if (typeof window === 'undefined') {
            return { available: false };
        }

        return {
            isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
            isTablet: /iPad|tablet|Nexus 9/i.test(navigator.userAgent),
            isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
            orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown',
            online: navigator.onLine
        };
    }

    /**
     * クリーンアップ
     */
    public cleanup(): void {
        this.saveData();

        if (this.sendTimer !== null && typeof window !== 'undefined') {
            clearInterval(this.sendTimer);
            this.sendTimer = null;
        }
    }
}

export default AnalyticsManager.getInstance();