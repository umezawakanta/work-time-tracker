/**
 * 🌐 ブラウザ互換EventEmitter
 * Node.js EventEmitterのブラウザ互換実装
 */

export type EventListener = (...args: any[]) => void;

export class BrowserEventEmitter {
  private events: Map<string, EventListener[]> = new Map();

  /**
   * イベントリスナーを追加
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  /**
   * 一度だけ実行されるイベントリスナーを追加
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * イベントリスナーを削除
   */
  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  /**
   * 指定されたイベントのすべてのリスナーを削除
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * イベントを発火
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (listeners && listeners.length > 0) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
      return true;
    }
    return false;
  }

  /**
   * 指定されたイベントのリスナー数を取得
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 指定されたイベントのすべてのリスナーを取得
   */
  listeners(event: string): EventListener[] {
    return this.events.get(event) || [];
  }

  /**
   * すべてのイベント名を取得
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

// Node.js EventEmitterとの互換性のためのエクスポート
export { BrowserEventEmitter as EventEmitter };
export default BrowserEventEmitter;
