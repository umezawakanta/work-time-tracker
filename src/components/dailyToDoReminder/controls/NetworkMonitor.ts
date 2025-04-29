/**
 * ネットワーク状態監視
 * ネットワーク接続状態を監視するクラス
 */
import Logger from './Logger';

class NetworkMonitor {
  private isNetworkOnline: boolean;
  private callbacks: Array<(isOnline: boolean) => void>;
  private logger: Logger;
  private lastPingTime: number;
  private pingInterval: number;
  private pingTimeout: NodeJS.Timeout | null;

  constructor() {
    this.isNetworkOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.callbacks = [];
    this.logger = Logger.getInstance();
    this.lastPingTime = 0;
    this.pingInterval = 30000; // 30秒ごとにチェック
    this.pingTimeout = null;
  }

  /**
   * ネットワーク監視の開始
   */
  public startMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    // オンライン/オフラインイベントのリスナーを設定
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // 定期的なpingでネットワーク状態を検証
    this.schedulePing();
    
    this.logger.info('ネットワーク監視を開始しました');
  }

  /**
   * ネットワーク監視の停止
   */
  public stopMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
    
    this.logger.info('ネットワーク監視を停止しました');
  }

  /**
   * オンラインイベントハンドラー
   */
  private handleOnline = (): void => {
    if (!this.isNetworkOnline) {
      this.isNetworkOnline = true;
      this.notifyCallbacks(true);
      this.logger.info('ネットワーク接続が回復しました');
    }
  };

  /**
   * オフラインイベントハンドラー
   */
  private handleOffline = (): void => {
    if (this.isNetworkOnline) {
      this.isNetworkOnline = false;
      this.notifyCallbacks(false);
      this.logger.warn('ネットワーク接続が切断されました');
    }
  };

  /**
   * 現在のネットワーク状態を取得
   */
  public isOnline(): boolean {
    return this.isNetworkOnline;
  }

  /**
   * ネットワーク状態変化時のコールバックを登録
   */
  public onNetworkStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.callbacks.push(callback);
    
    // 解除用の関数を返す
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 登録済みコールバックの実行
   */
  private notifyCallbacks(isOnline: boolean): void {
    this.callbacks.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        this.logger.error('ネットワークステータス変更コールバックでエラーが発生しました', { error });
      }
    });
  }

  /**
   * サーバーへのping実行
   */
  private async ping(): Promise<void> {
    if (typeof fetch === 'undefined') return;
    
    const pingUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT || '/api'}/ping?_=${Date.now()}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok && !this.isNetworkOnline) {
        this.isNetworkOnline = true;
        this.notifyCallbacks(true);
        this.logger.info('サーバーpingに成功し、接続状態が回復しました');
      }
    } catch (error) {
      if (this.isNetworkOnline) {
        this.isNetworkOnline = false;
        this.notifyCallbacks(false);
        this.logger.warn('サーバーpingに失敗し、接続が切断されたとみなします', { error });
      }
    } finally {
      this.lastPingTime = Date.now();
      this.schedulePing();
    }
  }

  /**
   * 次回のpingをスケジュール
   */
  private schedulePing(): void {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
    
    this.pingTimeout = setTimeout(() => {
      this.ping().catch(() => {
        // エラーは内部で処理済み
      });
    }, this.pingInterval);
  }
}

export default NetworkMonitor;