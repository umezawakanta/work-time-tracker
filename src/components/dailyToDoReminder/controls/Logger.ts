/**
 * ロガークラス
 * アプリケーション全体でのログ記録を管理する
 */
export default class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;
    private logStorage: LogEntry[];
    private readonly MAX_LOG_ENTRIES = 1000;
  
    /**
     * ログレベルの定義
     */
    public static readonly LOG_LEVELS = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4
    } as const;
  
    private constructor() {
      this.logLevel = Logger.LOG_LEVELS.INFO; // デフォルトのログレベル
      this.logStorage = [];
    }
  
    /**
     * シングルトンインスタンスの取得
     */
    public static getInstance(): Logger {
      if (!Logger.instance) {
        Logger.instance = new Logger();
      }
      return Logger.instance;
    }
  
    /**
     * ログレベルの設定
     */
    public setLogLevel(level: LogLevel): void {
      this.logLevel = level;
    }
  
    /**
     * デバッグログの記録
     */
    public debug(message: string, data?: unknown): void {
      this.log(Logger.LOG_LEVELS.DEBUG, message, data);
    }
  
    /**
     * 情報ログの記録
     */
    public info(message: string, data?: unknown): void {
      this.log(Logger.LOG_LEVELS.INFO, message, data);
    }
  
    /**
     * 警告ログの記録
     */
    public warn(message: string, data?: unknown): void {
      this.log(Logger.LOG_LEVELS.WARN, message, data);
    }
  
    /**
     * エラーログの記録
     */
    public error(message: string, data?: unknown): void {
      this.log(Logger.LOG_LEVELS.ERROR, message, data);
    }
  
    /**
     * 致命的エラーログの記録
     */
    public fatal(message: string, data?: unknown): void {
      this.log(Logger.LOG_LEVELS.FATAL, message, data);
    }
  
    /**
     * 内部ログ記録処理
     */
    private log(level: LogLevel, message: string, data?: unknown): void {
      // 設定されたログレベル以上のみ記録
      if (level < this.logLevel) {
        return;
      }
  
      const timestamp = new Date().toISOString();
      const entry: LogEntry = {
        timestamp,
        level,
        message,
        data: this.sanitizeData(data)
      };
  
      // コンソールに出力
      this.outputToConsole(entry);
  
      // ストレージに保存
      this.storeLogEntry(entry);
  
      // 必要に応じて外部サービスにも送信
      if (level >= Logger.LOG_LEVELS.ERROR) {
        this.sendToErrorMonitoring(entry);
      }
    }
  
    /**
     * 機密データを削除/マスク
     */
    private sanitizeData(data?: unknown): unknown {
      if (!data) return data;
  
      // オブジェクトをディープコピー
      const sanitized = JSON.parse(JSON.stringify(data));
  
      // 機密情報をマスク（再帰的に処理）
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];
      this.maskSensitiveData(sanitized, sensitiveKeys);
  
      return sanitized;
    }
  
    /**
     * 再帰的に機密データをマスク
     */
    private maskSensitiveData(obj: Record<string, any>, sensitiveKeys: string[]): void {
      if (typeof obj !== 'object' || obj === null) return;
  
      Object.keys(obj).forEach(key => {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          obj[key] = '*****';
        } else if (typeof obj[key] === 'object') {
          this.maskSensitiveData(obj[key], sensitiveKeys);
        }
      });
    }
  
    /**
     * コンソール出力
     */
    private outputToConsole(entry: LogEntry): void {
      const levelLabels = {
        [Logger.LOG_LEVELS.DEBUG]: '🐛 DEBUG',
        [Logger.LOG_LEVELS.INFO]: '📘 INFO',
        [Logger.LOG_LEVELS.WARN]: '⚠️ WARN',
        [Logger.LOG_LEVELS.ERROR]: '❌ ERROR',
        [Logger.LOG_LEVELS.FATAL]: '☠️ FATAL'
      };
  
      const label = levelLabels[entry.level] || 'LOG';
      const dataStr = entry.data ? ` ${JSON.stringify(entry.data, null, 2)}` : '';
      
      // 環境に応じてログ出力を調整
      if (process.env.NODE_ENV === 'development') {
        switch (entry.level) {
          case Logger.LOG_LEVELS.DEBUG:
            console.debug(`${label} [${entry.timestamp}] ${entry.message}${dataStr}`);
            break;
          case Logger.LOG_LEVELS.INFO:
            console.info(`${label} [${entry.timestamp}] ${entry.message}${dataStr}`);
            break;
          case Logger.LOG_LEVELS.WARN:
            console.warn(`${label} [${entry.timestamp}] ${entry.message}${dataStr}`);
            break;
          case Logger.LOG_LEVELS.ERROR:
          case Logger.LOG_LEVELS.FATAL:
            console.error(`${label} [${entry.timestamp}] ${entry.message}${dataStr}`);
            break;
          default:
            console.log(`${label} [${entry.timestamp}] ${entry.message}${dataStr}`);
        }
      } else if (entry.level >= Logger.LOG_LEVELS.WARN) {
        // 本番環境では警告以上のみコンソール出力
        console[entry.level >= Logger.LOG_LEVELS.ERROR ? 'error' : 'warn'](
          `${label} [${entry.timestamp}] ${entry.message}${dataStr}`
        );
      }
    }
  
    /**
     * ログエントリの保存
     */
    private storeLogEntry(entry: LogEntry): void {
      this.logStorage.push(entry);
      
      // 最大サイズを超えた場合、古いログを削除
      if (this.logStorage.length > this.MAX_LOG_ENTRIES) {
        this.logStorage.shift();
      }
    }
  
    /**
     * エラー監視サービスへの送信
     */
    private sendToErrorMonitoring(entry: LogEntry): void {
      // Sentry、DatadogなどのAPIを使用して送信
      // この例では実装を省略
      if (process.env.ERROR_MONITORING_ENABLED === 'true') {
        // エラー監視サービスへの送信処理
        setTimeout(() => {
          // 非同期で送信（失敗してもメインの処理に影響を与えない）
          const url = process.env.ERROR_MONITORING_ENDPOINT;
          if (url) {
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry)
            }).catch(err => {
              // 送信失敗時はコンソールにのみ記録（無限ループを防ぐ）
              console.error('エラー監視サービスへの送信に失敗:', err);
            });
          }
        }, 0);
      }
    }
  
    /**
     * 現在のログストレージを取得
     */
    public getLogStorage(): LogEntry[] {
      return [...this.logStorage];
    }
  
    /**
     * ログのエクスポート
     */
    public exportLogs(): string {
      return JSON.stringify(this.logStorage, null, 2);
    }
  
    /**
     * ログストレージのクリア
     */
    public clearLogs(): void {
      this.logStorage = [];
    }
  }
  
  /**
   * ログレベルの型定義
   */
  export type LogLevel = typeof Logger.LOG_LEVELS[keyof typeof Logger.LOG_LEVELS];
  
  /**
   * ログエントリの型定義
   */
  export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: unknown;
  }