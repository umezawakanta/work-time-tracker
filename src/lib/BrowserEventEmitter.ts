/**
 * 🌐 ブラウザ対応EventEmitter
 * Node.jsのEventEmitterをブラウザ環境で再現する軽量実装
 */

export type EventListener = (...args: any[]) => void;

export interface EventEmitterInterface {
  on(eventName: string, listener: EventListener): this;
  off(eventName: string, listener: EventListener): this;
  emit(eventName: string, ...args: any[]): boolean;
  once(eventName: string, listener: EventListener): this;
  removeAllListeners(eventName?: string): this;
  listenerCount(eventName: string): number;
  listeners(eventName: string): EventListener[];
}

/**
 * ブラウザ対応EventEmitterクラス
 * Node.jsのEventEmitterと同じAPIを提供
 */
export class BrowserEventEmitter implements EventEmitterInterface {
  private events: Map<string, EventListener[]> = new Map();
  private maxListeners: number = 10;

  /**
   * イベントリスナーを登録
   */
  on(eventName: string, listener: EventListener): this {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listeners = this.events.get(eventName)!;
    listeners.push(listener);

    // 最大リスナー数チェック
    if (listeners.length > this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ` +
          `${listeners.length} ${eventName} listeners added. ` +
          `Use emitter.setMaxListeners() to increase limit`
      );
    }

    return this;
  }

  /**
   * イベントリスナーを削除
   */
  off(eventName: string, listener: EventListener): this {
    const listeners = this.events.get(eventName);
    if (!listeners) return this;

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 空の配列は削除
    if (listeners.length === 0) {
      this.events.delete(eventName);
    }

    return this;
  }

  /**
   * イベントを発生させる
   */
  emit(eventName: string, ...args: any[]): boolean {
    const listeners = this.events.get(eventName);
    if (!listeners || listeners.length === 0) {
      return false;
    }

    // リスナーのコピーを作成（実行中の変更を避けるため）
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('EventEmitter listener error:', error);
        // エラーイベントを発生させる
        this.emitError(error);
      }
    }

    return true;
  }

  /**
   * 一度だけ実行されるイベントリスナーを登録
   */
  once(eventName: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(eventName, onceWrapper);
      listener.apply(this, args);
    };

    return this.on(eventName, onceWrapper);
  }

  /**
   * すべてのリスナーを削除
   */
  removeAllListeners(eventName?: string): this {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * 指定したイベントのリスナー数を取得
   */
  listenerCount(eventName: string): number {
    const listeners = this.events.get(eventName);
    return listeners ? listeners.length : 0;
  }

  /**
   * 指定したイベントのリスナー配列を取得
   */
  listeners(eventName: string): EventListener[] {
    const listeners = this.events.get(eventName);
    return listeners ? [...listeners] : [];
  }

  /**
   * 最大リスナー数を設定
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * 最大リスナー数を取得
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * すべてのイベント名を取得
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * エラーイベントを発生させる
   */
  private emitError(error: any): void {
    if (this.listenerCount('error') > 0) {
      this.emit('error', error);
    } else {
      // エラーリスナーがない場合はコンソールにエラーを出力
      console.error('Uncaught EventEmitter error:', error);
    }
  }

  /**
   * リスナーの前に別のリスナーを追加
   */
  prependListener(eventName: string, listener: EventListener): this {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listeners = this.events.get(eventName)!;
    listeners.unshift(listener);

    return this;
  }

  /**
   * 一度だけ実行されるリスナーを先頭に追加
   */
  prependOnceListener(eventName: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(eventName, onceWrapper);
      listener.apply(this, args);
    };

    return this.prependListener(eventName, onceWrapper);
  }

  /**
   * 指定したイベントの生のリスナー配列を取得
   */
  rawListeners(eventName: string): EventListener[] {
    return this.listeners(eventName);
  }
}

/**
 * Node.js EventEmitterとの互換性のためのエイリアス
 */
export const EventEmitter = BrowserEventEmitter;

/**
 * デフォルトエクスポート
 */
export default BrowserEventEmitter;
