/**
 * APIリクエストキュー
 * オフライン時のリクエストをキューイングするクラス
 */
import Logger from './Logger';

export interface QueueItem {
  execute: () => Promise<unknown>;
  priority: 'high' | 'normal' | 'low';
  timestamp?: number;
  retries?: number;
}

class ApiRequestQueue {
  private queue: QueueItem[];
  private isProcessing: boolean;
  private logger: Logger;
  private maxQueueSize: number;
  private maxRetries: number;

  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.logger = Logger.getInstance();
    this.maxQueueSize = 100;
    this.maxRetries = 3;
  }

  /**
   * リクエストをキューに追加
   */
  public enqueue(item: QueueItem): void {
    if (this.queue.length >= this.maxQueueSize) {
      // 低優先度のリクエストを優先的に削除
      const lowPriorityIndex = this.queue.findIndex(i => i.priority === 'low');
      
      if (lowPriorityIndex !== -1) {
        this.queue.splice(lowPriorityIndex, 1);
      } else {
        // 低優先度がなければ最も古いnormal優先度を削除
        const normalPriorityIndex = this.queue.findIndex(i => i.priority === 'normal');
        
        if (normalPriorityIndex !== -1) {
          this.queue.splice(normalPriorityIndex, 1);
        } else {
          // 全て高優先度の場合は最も古いものを削除
          this.queue.shift();
        }
      }
      
      this.logger.warn('キューが最大サイズに達したため、リクエストを削除しました');
    }
    
    // タイムスタンプとリトライカウンターを追加
    this.queue.push({
      ...item,
      timestamp: Date.now(),
      retries: 0
    });
    
    this.logger.info('リクエストがキューに追加されました', {
      queueSize: this.queue.length,
      priority: item.priority
    });
  }

  /**
   * キューの処理を開始
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    this.logger.info('キュー処理を開始します', { queueSize: this.queue.length });
    
    try {
      // 優先度でソート
      this.sortQueueByPriority();
      
      // キューの処理
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) continue;
        
        try {
          await item.execute();
        } catch (error) {
          // リトライ回数が最大値未満の場合は再度キューに追加
          if ((item.retries || 0) < this.maxRetries) {
            this.queue.push({
              ...item,
              retries: (item.retries || 0) + 1
            });
            
            this.logger.warn('リクエスト実行に失敗しました。再キューイングします', {
              retries: (item.retries || 0) + 1,
              error
            });
          } else {
            this.logger.error('リクエスト実行に最大回数失敗しました', {
              maxRetries: this.maxRetries,
              error
            });
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.logger.info('キュー処理が完了しました');
    }
  }

  /**
   * キューを優先度順にソート
   */
  private sortQueueByPriority(): void {
    const priorityValues = {
      'high': 3,
      'normal': 2,
      'low': 1
    };
    
    this.queue.sort((a, b) => {
      const priorityDiff = priorityValues[b.priority] - priorityValues[a.priority];
      
      // 優先度が同じ場合は古いものを先に処理
      if (priorityDiff === 0) {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      
      return priorityDiff;
    });
  }

  /**
   * キューの現在のサイズを取得
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * キューをクリア
   */
  public clearQueue(): void {
    const queueSize = this.queue.length;
    this.queue = [];
    this.logger.info('キューがクリアされました', { queueSize });
  }
}

export default ApiRequestQueue;