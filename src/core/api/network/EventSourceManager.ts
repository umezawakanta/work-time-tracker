/**
 * EventSourceマネージャー
 * SSE（Server-Sent Events）接続を管理するコンポーネント
 */
import { ApiLogger } from '../tracking/ApiLogger';

/**
 * EventSourceマネージャークラス
 */
export class EventSourceManager {
  private logger = new ApiLogger();
  private activeSources: Map<string, EventSource> = new Map();
  private reconnectIntervals: Map<string, number> = new Map();

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger.setContext('EventSourceManager');
  }

  /**
   * EventSourceを作成
   */
  public createEventSource(
    endpoint: string,
    params?: Record<string, string>,
    withCredentials = false
  ): EventSource {
    // URLを構築
    const url = this.buildUrl(endpoint, params);

    // すでに同じURLのEventSourceが存在する場合は閉じる
    if (this.activeSources.has(url)) {
      this.closeEventSource(url);
    }

    // EventSourceを作成
    const eventSource = new EventSource(url, { withCredentials });

    // エラーハンドラを設定
    eventSource.addEventListener('error', this.createErrorHandler(url, eventSource));

    // アクティブなソースに追加
    this.activeSources.set(url, eventSource);

    this.logger.debug(`EventSourceを作成しました: ${url}`);

    return eventSource;
  }

  /**
   * URLを構築
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // パラメータが空の場合はエンドポイントをそのまま返す
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    // URLパラメータを構築
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    // エンドポイントにパラメータを追加
    const separator = endpoint.includes('?') ? '&' : '?';

    return `${endpoint}${separator}${queryParams}`;
  }

  /**
   * エラーハンドラを作成
   */
  private createErrorHandler(url: string, eventSource: EventSource): (event: Event) => void {
    return (event: Event) => {
      this.logger.warn(`EventSourceエラー: ${url}`, event);

      // readyStateがCLOSEDの場合は再接続を試みる
      if (eventSource.readyState === EventSource.CLOSED) {
        this.logger.info(`EventSourceが切断されました。再接続を試みます: ${url}`);

        // 既存の再接続タイマーをクリア
        if (this.reconnectIntervals.has(url)) {
          clearTimeout(this.reconnectIntervals.get(url));
        }

        // 再接続を試みる
        const timeoutId = window.setTimeout(() => {
          this.reconnectEventSource(url);
        }, 5000);

        this.reconnectIntervals.set(url, timeoutId);
      }
    };
  }

  /**
   * EventSourceを再接続
   */
  private reconnectEventSource(url: string): void {
    try {
      // 再接続用の設定を抽出
      const oldEventSource = this.activeSources.get(url);
      if (!oldEventSource) {
        return;
      }

      // 古いEventSourceを閉じる
      this.closeEventSource(url);

      // 新しいEventSourceを作成
      const newEventSource = new EventSource(url, { withCredentials: true });

      // エラーハンドラを設定
      newEventSource.addEventListener('error', this.createErrorHandler(url, newEventSource));

      // アクティブなソースに追加
      this.activeSources.set(url, newEventSource);

      this.logger.info(`EventSourceを再接続しました: ${url}`);
    } catch (error) {
      this.logger.error(`EventSourceの再接続に失敗しました: ${url}`, error);
    }
  }

  /**
   * EventSourceを閉じる
   */
  private closeEventSource(url: string): void {
    const eventSource = this.activeSources.get(url);
    if (eventSource) {
      // EventSourceを閉じる
      eventSource.close();

      // アクティブなソースから削除
      this.activeSources.delete(url);

      // 再接続タイマーをクリア
      if (this.reconnectIntervals.has(url)) {
        clearTimeout(this.reconnectIntervals.get(url));
        this.reconnectIntervals.delete(url);
      }

      this.logger.debug(`EventSourceを閉じました: ${url}`);
    }
  }

  /**
   * すべてのEventSourceを閉じる
   */
  public closeAll(): void {
    // すべてのEventSourceを閉じる
    this.activeSources.forEach((eventSource, url) => {
      eventSource.close();
      this.logger.debug(`EventSourceを閉じました: ${url}`);
    });

    // すべての再接続タイマーをクリア
    this.reconnectIntervals.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });

    // マップをクリア
    this.activeSources.clear();
    this.reconnectIntervals.clear();

    this.logger.info('すべてのEventSourceを閉じました');
  }

  /**
   * アクティブなEventSourceの数を取得
   */
  public getActiveSourcesCount(): number {
    return this.activeSources.size;
  }
}
