/**
 * ログ管理ユーティリティ
 * 本番環境では不要なログを出力しないように制御
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // 本番環境ではINFOレベル以上のみ、開発環境ではDEBUGレベル以上を出力
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // 開発環境でのみ実行される関数を実行
  debugOnly(callback: () => void): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      callback();
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger();
