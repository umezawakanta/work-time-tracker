/**
 * APIロガー
 * ログ出力を管理するユーティリティ
 */

/**
 * ログレベル定義
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * APIロガークラス
 */
export class ApiLogger {
  private static instance: ApiLogger | null = null;
  private context = 'API';
  private logLevel = LogLevel.INFO;
  private enableConsole = true;
  private enableRemote = false;
  private remoteEndpoint = '';
  private logQueue: Array<{
    level: LogLevel;
    message: string;
    context: string;
    data?: unknown;
    timestamp: number;
  }> = [];

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  /**
   * コンストラクタ
   */
  private constructor() {
    // 環境変数からログレベルを設定
    if (typeof process !== 'undefined' && process.env) {
      const envLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
      if (envLogLevel) {
        switch (envLogLevel.toUpperCase()) {
          case 'DEBUG':
            this.logLevel = LogLevel.DEBUG;
            break;
          case 'INFO':
            this.logLevel = LogLevel.INFO;
            break;
          case 'WARN':
            this.logLevel = LogLevel.WARN;
            break;
          case 'ERROR':
            this.logLevel = LogLevel.ERROR;
            break;
        }
      }

      // リモートログ設定
      this.enableRemote = process.env.NEXT_PUBLIC_REMOTE_LOGGING === 'true';
      this.remoteEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT || '';
    }

    // 開発環境では常にコンソールログを有効にする
    this.enableConsole = process.env.NODE_ENV !== 'production' || true;
  }

  /**
   * コンテキストを設定
   */
  public setContext(context: string): void {
    this.context = context;
  }

  /**
   * DEBUGレベルログ
   */
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * INFOレベルログ
   */
  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * WARNレベルログ
   */
  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * ERRORレベルログ
   */
  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * ログ出力処理
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // 設定されたレベル未満のログは無視
    if (level < this.logLevel) {
      return;
    }

    const timestamp = Date.now();
    const logEntry = {
      level,
      message,
      context: this.context,
      data,
      timestamp,
    };

    // コンソールログ
    if (this.enableConsole) {
      this.logToConsole(level, `[${this.context}] ${message}`, data);
    }

    // リモートログ
    if (this.enableRemote && this.remoteEndpoint) {
      this.logQueue.push(logEntry);
      this.flushLogsIfNeeded();
    }
  }

  /**
   * コンソールログ出力
   */
  private logToConsole(level: LogLevel, message: string, data?: unknown): void {
    const time = new Date().toISOString();
    const prefix = `[${time}][${this.getLevelName(level)}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data || '');
        break;
    }
  }

  /**
   * ログレベル名を取得
   */
  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * ログをリモートサーバーに送信
   */
  private flushLogsIfNeeded(): void {
    // 10件以上たまったらフラッシュ
    if (this.logQueue.length >= 10) {
      this.flushLogs();
    }
  }

  /**
   * ログをフラッシュ
   */
  public flushLogs(): void {
    if (this.logQueue.length === 0 || !this.enableRemote || !this.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    // ログの送信
    this.sendLogs(logsToSend).catch(() => {
      // 送信失敗した場合は再度キューに追加
      this.logQueue = [...logsToSend, ...this.logQueue];
    });
  }

  /**
   * ログをリモートサーバーに送信
   */
  private async sendLogs(
    logs: Array<{
      level: LogLevel;
      message: string;
      context: string;
      data?: unknown;
      timestamp: number;
    }>
  ): Promise<void> {
    try {
      const response = await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          source: typeof window !== 'undefined' ? window.location.href : 'api',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'api',
          timestamp: Date.now(),
        }),
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`ログの送信に失敗しました: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('ログ送信エラー:', error);
      throw error;
    }
  }

  /**
   * ログ設定の変更
   */
  public configure(options: {
    logLevel?: LogLevel;
    enableConsole?: boolean;
    enableRemote?: boolean;
    remoteEndpoint?: string;
  }): void {
    if (options.logLevel !== undefined) {
      this.logLevel = options.logLevel;
    }
    if (options.enableConsole !== undefined) {
      this.enableConsole = options.enableConsole;
    }
    if (options.enableRemote !== undefined) {
      this.enableRemote = options.enableRemote;
    }
    if (options.remoteEndpoint) {
      this.remoteEndpoint = options.remoteEndpoint;
    }
  }
}
