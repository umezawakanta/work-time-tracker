/**
 * イベントソース管理
 * SSE (Server-Sent Events) 接続を管理するためのユーティリティ
 */
import ApiClient from './ApiClient';
import { ApiLogger } from './ApiLogger';

/**
 * イベントソースオプション
 */
interface EventSourceOptions {
    withCredentials?: boolean;
    headers?: Record<string, string>;
    reconnectDelay?: number;
    maxRetries?: number;
}

/**
 * イベントリスナー情報
 */
interface EventListenerInfo {
    type: string;
    listener: (event: Event) => void;
    options?: boolean | AddEventListenerOptions;
}

/**
 * イベントソース接続の状態
 */
type EventSourceState = 'connecting' | 'open' | 'closed' | 'error';

/**
 * 拡張イベントソース情報
 */
interface ManagedEventSource {
    id: string;
    eventSource: EventSource;
    url: string;
    state: EventSourceState;
    createdAt: number;
    lastEventAt: number;
    eventCount: number;
    listeners: EventListenerInfo[];
    options: EventSourceOptions;
    retryCount: number;
}

/**
 * イベントソース管理クラス
 */
export class EventSourceManager {
    private activeSources: Map<string, ManagedEventSource> = new Map();
    private logger = new ApiLogger();
    private defaultReconnectDelay = 5000; // 5秒
    private defaultMaxRetries = 3;

    /**
     * SSEストリーミング接続を確立
     * @param endpoint エンドポイント
     * @param params クエリパラメータ
     * @param withCredentials 資格情報を含めるかどうか
     * @param options その他のオプション
     * @returns EventSourceインスタンス
     */
    public createEventSource(
        endpoint: string,
        params?: Record<string, string>,
        withCredentials = false,
        options: EventSourceOptions = {}
    ): EventSource {
        // APIクライアントインスタンスを取得
        const apiClient = ApiClient.getInstance();

        // URLの構築
        const url = new URL(apiClient.getConfig().buildUrl(endpoint));

        // クエリパラメータの追加
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        // 認証トークンをURLに追加（代替手段として）
        this.addAuthTokenToUrl(url);

        // オプションの初期化
        const eventSourceOptions = {
            withCredentials,
            reconnectDelay: options.reconnectDelay || this.defaultReconnectDelay,
            maxRetries: options.maxRetries || this.defaultMaxRetries,
            headers: options.headers || {}
        };

        // EventSourceの作成
        const eventSource = new EventSource(url.toString(), { withCredentials });

        // 管理用ID
        const sourceId = this.generateSourceId();

        // 管理情報の初期化
        const managedSource: ManagedEventSource = {
            id: sourceId,
            eventSource,
            url: url.toString(),
            state: 'connecting',
            createdAt: Date.now(),
            lastEventAt: Date.now(),
            eventCount: 0,
            listeners: [],
            options: eventSourceOptions,
            retryCount: 0
        };

        // 基本的なイベントリスナーの追加
        this.addBasicEventListeners(managedSource);

        // 管理対象に追加
        this.activeSources.set(sourceId, managedSource);

        this.logger.info(`EventSource created: ${url.toString()}`);

        return eventSource;
    }

    /**
     * 基本的なイベントリスナーを追加
     * @param managedSource 管理対象のイベントソース
     */
    private addBasicEventListeners(managedSource: ManagedEventSource): void {
        const { eventSource, id } = managedSource;

        // 接続オープン時
        const openListener = (event: Event): void => {
            managedSource.state = 'open';
            managedSource.retryCount = 0;
            this.logger.debug(`EventSource connected: ${id}`);
        };
        eventSource.addEventListener('open', openListener);
        managedSource.listeners.push({ type: 'open', listener: openListener });

        // エラー発生時
        const errorListener = (event: Event): void => {
            managedSource.state = 'error';

            if (eventSource.readyState === EventSource.CLOSED) {
                this.handleDisconnect(managedSource);
            } else {
                this.logger.warn(`EventSource error: ${id}`);
            }
        };
        eventSource.addEventListener('error', errorListener);
        managedSource.listeners.push({ type: 'error', listener: errorListener });

        // メッセージ受信時
        const messageListener = (event: MessageEvent): void => {
            managedSource.lastEventAt = Date.now();
            managedSource.eventCount++;
            this.logger.debug(`EventSource message received: ${id}`);
        };
        eventSource.addEventListener('message', messageListener as EventListener);
        managedSource.listeners.push({ type: 'message', listener: messageListener as EventListener });
    }

    /**
     * 切断処理
     * @param managedSource 管理対象のイベントソース
     */
    private handleDisconnect(managedSource: ManagedEventSource): void {
        managedSource.state = 'closed';

        // 自動再接続が有効で、最大リトライ回数に達していない場合
        if (managedSource.retryCount < managedSource.options.maxRetries!) {
            this.logger.info(`EventSource disconnected, attempting to reconnect: ${managedSource.id}`);

            // リトライカウントをインクリメント
            managedSource.retryCount++;

            // 再接続ディレイ
            const delay = managedSource.options.reconnectDelay! * (1 + (managedSource.retryCount * 0.5));

            // タイムアウトを設定して再接続
            setTimeout(() => {
                this.reconnectEventSource(managedSource);
            }, delay);
        } else {
            this.logger.warn(`EventSource disconnected after ${managedSource.retryCount} retry attempts: ${managedSource.id}`);

            // 最大リトライ回数に達した場合は削除
            this.activeSources.delete(managedSource.id);

            // 接続終了イベントを発行
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('eventsource-disconnected', {
                    detail: {
                        id: managedSource.id,
                        url: managedSource.url,
                        retryCount: managedSource.retryCount
                    }
                }));
            }
        }
    }

    /**
     * イベントソースの再接続
     * @param managedSource 管理対象のイベントソース
     */
    private reconnectEventSource(managedSource: ManagedEventSource): void {
        try {
            // 古い接続を閉じる
            this.closeEventSource(managedSource.eventSource);

            // 新しいEventSourceを作成
            const eventSource = new EventSource(managedSource.url, {
                withCredentials: managedSource.options.withCredentials
            });

            // 管理情報の更新
            managedSource.eventSource = eventSource;
            managedSource.state = 'connecting';

            // 基本的なイベントリスナーの削除
            managedSource.listeners = [];

            // 基本的なイベントリスナーの再追加
            this.addBasicEventListeners(managedSource);

            this.logger.info(`EventSource reconnected: ${managedSource.id}`);
        } catch (error) {
            this.logger.error(`Failed to reconnect EventSource: ${managedSource.id}`, error);

            // 再接続失敗時も再試行
            this.handleDisconnect(managedSource);
        }
    }

    /**
     * URLに認証トークンを追加
     * @param url URL
     */
    private addAuthTokenToUrl(url: URL): void {
        try {
            const apiClient = ApiClient.getInstance();
            const authHeader = apiClient.getConfig().getHeaders().Authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                url.searchParams.append('auth_token', token);
            }
        } catch (error) {
            this.logger.warn('Failed to add auth token to URL', error);
        }
    }

    /**
     * EventSourceの接続を閉じる
     * @param eventSource EventSourceインスタンス
     */
    private closeEventSource(eventSource: EventSource): void {
        try {
            eventSource.close();
        } catch (error) {
            this.logger.warn('Error closing EventSource', error);
        }
    }

    /**
     * ユニークなソースIDを生成
     */
    private generateSourceId(): string {
        return `es-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * アクティブなイベントソースの数を取得
     */
    public getActiveCount(): number {
        return this.activeSources.size;
    }

    /**
     * すべてのイベントソース接続を閉じる
     */
    public closeAll(): void {
        this.activeSources.forEach((managedSource) => {
            try {
                managedSource.eventSource.close();
                managedSource.state = 'closed';
            } catch (error) {
                this.logger.warn(`Error closing EventSource: ${managedSource.id}`, error);
            }
        });

        this.activeSources.clear();
        this.logger.info('All EventSource connections closed');
    }

    /**
     * 特定のイベントソース接続を閉じる
     * @param eventSource EventSourceインスタンス
     * @returns 成功したかどうか
     */
    public close(eventSource: EventSource): boolean {
        let found = false;

        this.activeSources.forEach((managedSource, id) => {
            if (managedSource.eventSource === eventSource) {
                try {
                    managedSource.eventSource.close();
                    this.activeSources.delete(id);
                    found = true;
                    this.logger.debug(`Closed EventSource: ${id}`);
                } catch (error) {
                    this.logger.warn(`Error closing EventSource: ${id}`, error);
                }
            }
        });

        return found;
    }

    /**
     * アクティブなイベントソースの一覧を取得
     */
    public getActiveSources(): Array<{
        id: string;
        url: string;
        state: EventSourceState;
        createdAt: number;
        lastEventAt: number;
        eventCount: number;
    }> {
        const result: Array<{
            id: string;
            url: string;
            state: EventSourceState;
            createdAt: number;
            lastEventAt: number;
            eventCount: number;
        }> = [];

        this.activeSources.forEach((source) => {
            result.push({
                id: source.id,
                url: source.url,
                state: source.state,
                createdAt: source.createdAt,
                lastEventAt: source.lastEventAt,
                eventCount: source.eventCount
            });
        });

        return result;
    }

    /**
     * 接続タイムアウトの設定
     * 一定時間イベントがない場合に接続を切断
     * @param timeoutMs タイムアウト時間（ミリ秒）
     */
    public setupConnectionTimeout(timeoutMs = 60000): void {
        // 既存のタイマーをクリア
        if (typeof window !== 'undefined') {
            clearInterval(window.eventSourceTimeoutTimer as any);

            // タイマーを設定
            window.eventSourceTimeoutTimer = setInterval(() => {
                const now = Date.now();

                this.activeSources.forEach((source, id) => {
                    // 接続中かつ最後のイベントから一定時間経過した場合
                    if (source.state === 'open' && now - source.lastEventAt > timeoutMs) {
                        this.logger.warn(`EventSource timeout: ${id}, no events for ${(now - source.lastEventAt) / 1000}s`);

                        // 接続を切断して再接続
                        try {
                            source.eventSource.close();
                            this.handleDisconnect(source);
                        } catch (error) {
                            this.logger.error(`Error closing timed out EventSource: ${id}`, error);
                        }
                    }
                });
            }, 10000); // 10秒ごとにチェック
        }
    }

    /**
     * 複数のイベントをリッスンするイベントソースを作成
     * @param endpoint エンドポイント
     * @param events イベント名と各イベントのリスナー
     * @param params クエリパラメータ
     * @param options オプション
     * @returns EventSourceインスタンス
     */
    public createEventSourceWithListeners(
        endpoint: string,
        events: Record<string, (event: MessageEvent) => void>,
        params?: Record<string, string>,
        options: EventSourceOptions = {}
    ): EventSource {
        // イベントソースを作成
        const eventSource = this.createEventSource(endpoint, params, options.withCredentials, options);

        // 指定された各イベントにリスナーを追加
        Object.entries(events).forEach(([eventName, listener]) => {
            eventSource.addEventListener(eventName, listener as EventListener);

            // 管理対象のイベントソースを検索
            this.activeSources.forEach((source) => {
                if (source.eventSource === eventSource) {
                    // リスナー情報を登録
                    source.listeners.push({
                        type: eventName,
                        listener: listener as unknown as EventListener
                    });
                }
            });
        });

        return eventSource;
    }

    // Window拡張の型定義
    private setupWindowExtensions(): void {
        if (typeof window !== 'undefined') {
            // タイムアウト処理用プロパティを追加
            if (!('eventSourceTimeoutTimer' in window)) {
                window.eventSourceTimeoutTimer = null;
            }
        }
    }

    /**
     * コンストラクタ
     */
    constructor() {
        this.setupWindowExtensions();
    }
}

// Windowインターフェースの拡張
declare global {
    interface Window {
        eventSourceTimeoutTimer: any;
    }
}