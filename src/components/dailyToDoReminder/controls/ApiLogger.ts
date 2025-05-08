/**
 * APIロガー
 * API操作のログ記録と分析を提供するユーティリティ
 */

/**
 * ログレベル
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * ログエントリ
 */
interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: number;
    context?: string;
}

/**
 * ログ保存設定
 */
interface LogStorageConfig {
    maxEntries: number;
    persistErrors: boolean;
    persistLevel: LogLevel;
}

/**
 * ロガーインターフェース
 */
export interface ILogger {
    debug(message: string, ...data: unknown[]): void;
    info(message: string, ...data: unknown[]): void;
    warn(message: string, ...data: unknown[]): void;
    error(message: string, ...data: unknown[]): void;
}

/**
 * APIロガークラス
 */
export class ApiLogger implements ILogger {
    private logs: LogEntry[] = [];
    private errorLogs: LogEntry[] = [];
    private currentLevel: LogLevel = LogLevel.INFO;
    private storageConfig: LogStorageConfig = {
        maxEntries: 1000,
        persistErrors: true,
        persistLevel: LogLevel.ERROR
    };
    private static instance: ApiLogger | null = null;
    private context: string = '';
    private remoteLoggingEndpoint: string | null = null;
    private batchSize = 10;
    private pendingRemoteLogs: LogEntry[] = [];
    private isRemoteLoggingActive = false;

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
    constructor() {
        // 環境変数からログレベルを設定
        this.setLevelFromEnvironment();

        // ローカルストレージからエラーログを復元
        this.loadErrorLogs();
    }

    /**
     * 環境変数からログレベルを設定
     */
    private setLevelFromEnvironment(): void {
        const levelEnv = process.env.NEXT_PUBLIC_LOG_LEVEL;

        if (levelEnv) {
            switch (levelEnv.toUpperCase()) {
                case 'DEBUG':
                    this.currentLevel = LogLevel.DEBUG;
                    break;
                case 'INFO':
                    this.currentLevel = LogLevel.INFO;
                    break;
                case 'WARN':
                    this.currentLevel = LogLevel.WARN;
                    break;
                case 'ERROR':
                    this.currentLevel = LogLevel.ERROR;
                    break;
                default:
                    // デフォルトはINFO
                    this.currentLevel = LogLevel.INFO;
            }
        } else {
            // 開発環境ではDEBUG、本番環境ではINFO
            this.currentLevel = process.env.NODE_ENV === 'development'
                ? LogLevel.DEBUG
                : LogLevel.INFO;
        }
    }

    /**
     * ログレベルの設定
     * @param level ログレベル
     */
    public setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    /**
     * ログコンテキストの設定
     * @param context コンテキスト文字列
     */
    public setContext(context: string): void {
        this.context = context;
    }

    /**
     * リモートロギングの設定
     * @param endpoint エンドポイントURL
     * @param batchSize バッチサイズ
     */
    public configureRemoteLogging(endpoint: string | null, batchSize = 10): void {
        this.remoteLoggingEndpoint = endpoint;
        this.batchSize = batchSize;
        this.isRemoteLoggingActive = !!endpoint;
    }

    /**
     * デバッグログの記録
     * @param message メッセージ
     * @param data 追加データ
     */
    public debug(message: string, ...data: unknown[]): void {
        this.log(LogLevel.DEBUG, message, ...data);
    }

    /**
     * 情報ログの記録
     * @param message メッセージ
     * @param data 追加データ
     */
    public info(message: string, ...data: unknown[]): void {
        this.log(LogLevel.INFO, message, ...data);
    }

    /**
     * 警告ログの記録
     * @param message メッセージ
     * @param data 追加データ
     */
    public warn(message: string, ...data: unknown[]): void {
        this.log(LogLevel.WARN, message, ...data);
    }

    /**
     * エラーログの記録
     * @param message メッセージ
     * @param data 追加データ
     */
    public error(message: string, ...data: unknown[]): void {
        this.log(LogLevel.ERROR, message, ...data);
    }

    /**
     * ログの記録
     * @param level ログレベル
     * @param message メッセージ
     * @param data 追加データ
     */
    private log(level: LogLevel, message: string, ...data: unknown[]): void {
        // 現在のログレベルより低いレベルはスキップ
        if (level < this.currentLevel) {
            return;
        }

        // ログエントリの作成
        const entry: LogEntry = {
            level,
            message,
            data: data.length > 0 ? data : undefined,
            timestamp: Date.now(),
            context: this.context || undefined
        };

        // ログエントリを追加
        this.logs.push(entry);

        // 最大エントリ数を超えた場合は古いエントリを削除
        if (this.logs.length > this.storageConfig.maxEntries) {
            this.logs.shift();
        }

        // エラーログを別に保存
        if (level === LogLevel.ERROR) {
            this.errorLogs.push(entry);

            // エラーログもローテーション
            if (this.errorLogs.length > this.storageConfig.maxEntries) {
                this.errorLogs.shift();
            }

            // エラーログをローカルストレージに保存
            if (this.storageConfig.persistErrors) {
                this.saveErrorLogs();
            }
        }

        // コンソールにログを出力
        this.printToConsole(entry);

        // リモートロギングが有効な場合は送信
        if (this.isRemoteLoggingActive && level >= this.storageConfig.persistLevel) {
            this.queueForRemoteLogging(entry);
        }
    }

    /**
     * コンソールへのログ出力
     * @param entry ログエントリ
     */
    private printToConsole(entry: LogEntry): void {
        // 本番環境では出力しない（ERRORレベルは除く）
        if (process.env.NODE_ENV === 'production' && entry.level < LogLevel.ERROR) {
            return;
        }

        const timestamp = new Date(entry.timestamp).toISOString();
        const prefix = entry.context ? `[API:${entry.context}]` : '[API]';

        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(`${timestamp} ${prefix} ${entry.message}`, entry.data);
                break;
            case LogLevel.INFO:
                console.info(`${timestamp} ${prefix} ${entry.message}`, entry.data);
                break;
            case LogLevel.WARN:
                console.warn(`${timestamp} ${prefix} ${entry.message}`, entry.data);
                break;
            case LogLevel.ERROR:
                console.error(`${timestamp} ${prefix} ${entry.message}`, entry.data);
                break;
            default:
                break;
        }
    }

    /**
     * リモートロギングのためのキューに追加
     * @param entry ログエントリ
     */
    private queueForRemoteLogging(entry: LogEntry): void {
        if (!this.remoteLoggingEndpoint) return;

        this.pendingRemoteLogs.push(entry);

        // バッチサイズに達したらリモートに送信
        if (this.pendingRemoteLogs.length >= this.batchSize) {
            this.sendLogsToRemote();
        }
    }

    /**
     * ログをリモートサーバーに送信
     */
    private async sendLogsToRemote(): Promise<void> {
        if (!this.remoteLoggingEndpoint || this.pendingRemoteLogs.length === 0) {
            return;
        }

        const logsToSend = [...this.pendingRemoteLogs];
        this.pendingRemoteLogs = [];

        try {
            await fetch(this.remoteLoggingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend,
                    source: 'api-client',
                    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
                    timestamp: Date.now()
                }),
                // エラーがあってもブロックしない
                keepalive: true
            });
        } catch (error) {
            // リモート送信に失敗した場合は再度キューに追加
            // ただし、エラーログの無限ループを避けるため、エラーレベルのログは出さない
            console.warn('Failed to send logs to remote server', error);

            // 重要なログのみ再キューイング
            const criticalLogs = logsToSend.filter(log => log.level === LogLevel.ERROR);
            if (criticalLogs.length > 0) {
                this.pendingRemoteLogs.push(...criticalLogs);
            }
        }
    }

    /**
     * エラーログをローカルストレージに保存
     */
    private saveErrorLogs(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('api_error_logs', JSON.stringify(this.errorLogs));
        } catch (error) {
            // ストレージエラーは無視（ログ保存の失敗でアプリを止めない）
            console.warn('Failed to save error logs to local storage', error);
        }
    }

    /**
     * エラーログをローカルストレージから読み込み
     */
    private loadErrorLogs(): void {
        if (typeof window === 'undefined') return;

        try {
            const storedLogs = localStorage.getItem('api_error_logs');

            if (storedLogs) {
                this.errorLogs = JSON.parse(storedLogs);
            }
        } catch (error) {
            // ストレージエラーは無視
            console.warn('Failed to load error logs from local storage', error);
        }
    }

    /**
     * 現在のログを取得
     * @param level 最小ログレベル
     * @param limit 最大数
     */
    public getLogs(level: LogLevel = LogLevel.DEBUG, limit = 100): LogEntry[] {
        return this.logs
            .filter(log => log.level >= level)
            .slice(-limit);
    }

    /**
     * エラーログを取得
     * @param limit 最大数
     */
    public getErrorLogs(limit = 100): LogEntry[] {
        return this.errorLogs.slice(-limit);
    }

    /**
     * すべてのログをクリア
     */
    public clearLogs(): void {
        this.logs = [];
    }

    /**
     * エラーログをクリア
     */
    public clearErrorLogs(): void {
        this.errorLogs = [];
        this.saveErrorLogs();
    }

    /**
     * 保留中のすべてのリモートログを強制送信
     */
    public flushRemoteLogs(): void {
        if (this.pendingRemoteLogs.length > 0) {
            this.sendLogsToRemote();
        }
    }
}

// デフォルトエクスポート
export default ApiLogger.getInstance();