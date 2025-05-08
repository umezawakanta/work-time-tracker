/**
 * オフラインリクエスト管理
 * オフライン時のリクエストを管理し、同期を行うクラス
 */
import { ApiResponse, RequestConfig } from './ApiTypes';
import { ApiLogger } from './ApiLogger';
import SubscriptionService from './SubscriptionService';
import { encrypt, decrypt } from './SecurityUtils';

// ローカルストレージのキー
const STORAGE_KEY = 'api_offline_requests';
const LAST_SYNC_KEY = 'api_offline_last_sync';

/**
 * オフラインリクエストの型定義
 */
interface OfflineRequest {
    id: string;
    method: string;
    endpoint: string;
    data?: unknown;
    params?: Record<string, string>;
    config?: RequestConfig;
    timestamp: number;
    retryCount: number;
    priority: number;
    metadata?: Record<string, unknown>;
    userId?: string;
}

/**
 * 同期結果の型定義
 */
interface SyncResult {
    successful: number;
    failed: number;
    totalProcessed: number;
    remainingCount: number;
    errors: Array<{
        requestId: string;
        error: string;
        willRetry: boolean;
    }>;
}

/**
 * オフライン設定の型定義
 */
interface OfflineConfig {
    maxQueueSize: number;
    persistData: boolean;
    encryptData: boolean;
    maxRetries: number;
    autoSyncInterval: number | null;
    prioritizeByType: boolean;
    syncBatchSize: number;
    conflictResolution: 'server-wins' | 'client-wins' | 'last-modified-wins';
}

/**
 * オフラインリクエスト管理クラス
 */
export class OfflineRequestManager {
    private pendingRequests: OfflineRequest[] = [];
    private processing = false;
    private lastSyncTime = 0;
    private logger = new ApiLogger();
    private subscriptionService = new SubscriptionService();
    private initialized = false;
    private autoSyncTimer: number | null = null;
    private config: OfflineConfig = {
        maxQueueSize: 1000,
        persistData: true,
        encryptData: true,
        maxRetries: 3,
        autoSyncInterval: 60000, // 1分ごと
        prioritizeByType: true,
        syncBatchSize: 10,
        conflictResolution: 'last-modified-wins'
    };

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger.setContext('OfflineManager');
    }

    /**
     * 初期化
     */
    public initialize(): void {
        if (this.initialized) return;

        // 環境変数から設定を読み込む
        this.loadEnvironmentConfig();

        // 保存済みのリクエストを読み込む
        this.loadFromStorage();

        // 最終同期時間を読み込む
        this.loadLastSyncTime();

        // 自動同期を設定
        this.setupAutoSync();

        this.initialized = true;
        this.logger.info(`オフラインマネージャーが初期化されました（${this.pendingRequests.length}件のリクエストを復元）`);
    }

    /**
     * 環境変数から設定を読み込む
     */
    private loadEnvironmentConfig(): void {
        // 環境変数がある場合は上書き
        if (typeof process !== 'undefined' && process.env) {
            if (process.env.NEXT_PUBLIC_OFFLINE_MAX_QUEUE_SIZE) {
                this.config.maxQueueSize = parseInt(process.env.NEXT_PUBLIC_OFFLINE_MAX_QUEUE_SIZE, 10);
            }

            if (process.env.NEXT_PUBLIC_OFFLINE_PERSIST_DATA === 'false') {
                this.config.persistData = false;
            }

            if (process.env.NEXT_PUBLIC_OFFLINE_ENCRYPT_DATA === 'false') {
                this.config.encryptData = false;
            }

            if (process.env.NEXT_PUBLIC_OFFLINE_MAX_RETRIES) {
                this.config.maxRetries = parseInt(process.env.NEXT_PUBLIC_OFFLINE_MAX_RETRIES, 10);
            }

            if (process.env.NEXT_PUBLIC_OFFLINE_AUTO_SYNC_INTERVAL) {
                const interval = parseInt(process.env.NEXT_PUBLIC_OFFLINE_AUTO_SYNC_INTERVAL, 10);
                this.config.autoSyncInterval = interval > 0 ? interval : null;
            }

            if (process.env.NEXT_PUBLIC_OFFLINE_CONFLICT_RESOLUTION) {
                const resolution = process.env.NEXT_PUBLIC_OFFLINE_CONFLICT_RESOLUTION;
                if (
                    resolution === 'server-wins' ||
                    resolution === 'client-wins' ||
                    resolution === 'last-modified-wins'
                ) {
                    this.config.conflictResolution = resolution;
                }
            }
        }
    }

    /**
     * 自動同期の設定
     */
    private setupAutoSync(): void {
        if (typeof window === 'undefined' || !this.config.autoSyncInterval) {
            return;
        }

        // 既存のタイマーをクリア
        if (this.autoSyncTimer !== null) {
            window.clearInterval(this.autoSyncTimer);
        }

        // 新しいタイマーを設定
        this.autoSyncTimer = window.setInterval(() => {
            if (this.pendingRequests.length > 0 && navigator.onLine) {
                this.processPendingRequests().catch(error => {
                    this.logger.error('自動同期中にエラーが発生しました', error);
                });
            }
        }, this.config.autoSyncInterval);
    }

    /**
     * オフラインリクエストの処理
     */
    public async handleOfflineRequest<T>(
        requestFn: () => Promise<ApiResponse<T>>
    ): Promise<ApiResponse<T>> {
        // サブスクリプションでオフライン機能が利用可能か確認
        const hasOfflineAccess = await this.checkOfflineAccess();

        if (!hasOfflineAccess) {
            return {
                success: false,
                data: null,
                status: 403,
                error: {
                    code: 'OFFLINE_ACCESS_DENIED',
                    message: 'オフライン機能はプレミアムサブスクリプションでのみ利用可能です',
                    statusCode: 403
                }
            };
        }

        // リクエスト情報の抽出
        const requestInfo = this.extractRequestInfo(requestFn);

        if (!requestInfo) {
            return {
                success: false,
                data: null,
                status: 400,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'リクエスト情報の抽出に失敗しました',
                    statusCode: 400
                }
            };
        }

        // キューがいっぱいかチェック
        if (this.pendingRequests.length >= this.config.maxQueueSize) {
            // 優先度の低いリクエストがあれば削除
            const removed = this.removeLowestPriorityRequest();

            if (!removed) {
                return {
                    success: false,
                    data: null,
                    status: 507,
                    error: {
                        code: 'OFFLINE_QUEUE_FULL',
                        message: 'オフラインキューがいっぱいです',
                        statusCode: 507
                    }
                };
            }
        }

        // リクエストの優先度を決定
        const priority = this.calculatePriority(requestInfo.method, requestInfo.endpoint);

        // 保留中のリクエストとして保存
        const offlineRequest: OfflineRequest = {
            id: this.generateRequestId(),
            ...requestInfo,
            timestamp: Date.now(),
            retryCount: 0,
            priority,
            userId: this.getCurrentUserId()
        };

        this.pendingRequests.push(offlineRequest);

        // ストレージに保存
        if (this.config.persistData) {
            this.saveToStorage();
        }

        this.logger.info(`オフラインリクエストをキューに追加しました: ${offlineRequest.method} ${offlineRequest.endpoint}`);

        // オフラインレスポンスを返す
        return {
            success: true,
            data: null as unknown as T,
            status: 202,
            meta: {
                offline: true,
                queued: true,
                requestId: offlineRequest.id,
                timestamp: offlineRequest.timestamp,
                priority,
                message: 'リクエストはオフラインキューに追加されました。オンラインに戻ると自動的に処理されます。'
            }
        };
    }

    /**
     * 保留中のリクエストを処理
     */
    public async processPendingRequests(): Promise<SyncResult> {
        if (this.processing || this.pendingRequests.length === 0) {
            return {
                successful: 0,
                failed: 0,
                totalProcessed: 0,
                remainingCount: this.pendingRequests.length,
                errors: []
            };
        }

        this.processing = true;
        this.logger.info(`${this.pendingRequests.length}件の保留中リクエストを処理します`);

        // 同期開始イベントの発行
        this.dispatchEvent('offline-sync-start', {
            count: this.pendingRequests.length,
            timestamp: Date.now()
        });

        // 優先度順にソート
        const sortedRequests = [...this.pendingRequests]
            .sort((a, b) => b.priority - a.priority);

        // 同期結果の初期化
        const result: SyncResult = {
            successful: 0,
            failed: 0,
            totalProcessed: 0,
            remainingCount: 0,
            errors: []
        };

        // バッチサイズ単位で処理
        const batchSize = this.config.syncBatchSize;
        const requests = sortedRequests.slice(0, batchSize);

        for (const request of requests) {
            try {
                const success = await this.executePendingRequest(request);

                if (success) {
                    // 成功したリクエストを削除
                    this.removeRequest(request.id);
                    result.successful++;
                } else {
                    // 失敗したリクエストのリトライカウントを増やす
                    const updatedRequest = this.pendingRequests.find(r => r.id === request.id);

                    if (updatedRequest) {
                        updatedRequest.retryCount++;

                        // 最大リトライ回数を超えた場合は削除
                        if (updatedRequest.retryCount > this.config.maxRetries) {
                            this.logger.warn(`${updatedRequest.retryCount}回の失敗後にリクエストを削除します: ${request.endpoint}`);
                            this.removeRequest(request.id);

                            result.errors.push({
                                requestId: request.id,
                                error: '最大リトライ回数を超えました',
                                willRetry: false
                            });
                        } else {
                            result.errors.push({
                                requestId: request.id,
                                error: 'リクエスト実行エラー',
                                willRetry: true
                            });
                        }
                    }

                    result.failed++;
                }
            } catch (error) {
                this.logger.error(`保留中リクエストの処理中にエラーが発生しました: ${request.endpoint}`, error);

                // エラー情報を追加
                result.errors.push({
                    requestId: request.id,
                    error: error instanceof Error ? error.message : String(error),
                    willRetry: true
                });

                result.failed++;
            }

            result.totalProcessed++;
        }

        // ストレージを更新
        if (this.config.persistData) {
            this.saveToStorage();
        }

        // 最終同期時間を更新
        this.lastSyncTime = Date.now();
        this.saveLastSyncTime();

        // 結果を更新
        result.remainingCount = this.pendingRequests.length;

        // 同期終了イベントの発行
        this.dispatchEvent('offline-sync-complete', {
            ...result,
            timestamp: this.lastSyncTime
        });

        this.processing = false;
        this.logger.info(`オフラインリクエストの処理が完了しました (成功: ${result.successful}, 失敗: ${result.failed}, 残り: ${result.remainingCount})`);

        return result;
    }

    /**
     * リクエスト情報の抽出
     */
    private extractRequestInfo(
        requestFn: () => Promise<any>
    ): Pick<OfflineRequest, 'method' | 'endpoint' | 'data' | 'params' | 'config'> | null {
        try {
            // 関数の文字列表現を取得
            const fnString = requestFn.toString();

            // 正規表現でメソッド、エンドポイント、データを抽出
            const methodMatch = fnString.match(/\.(get|post|put|patch|delete)<.*?>\('?(.*?)'?(?:,\s*({.*?}|\[.*?\]|null))?/i);

            if (methodMatch) {
                const [, method, endpoint, dataStr] = methodMatch;

                // データの解析
                let data;
                if (dataStr) {
                    try {
                        // 安全な方法でデータを解析
                        data = JSON.parse(dataStr.replace(/'/g, '"'));
                    } catch {
                        // 解析エラーは無視して続行
                    }
                }

                // パラメータの抽出（GETリクエスト用）
                let params: Record<string, string> | undefined;
                const paramsMatch = fnString.match(/params:\s*({.*?})/);
                if (paramsMatch && paramsMatch[1]) {
                    try {
                        params = JSON.parse(paramsMatch[1].replace(/'/g, '"'));
                    } catch {
                        // 解析エラーは無視
                    }
                }

                // 設定の抽出
                let config: RequestConfig | undefined;
                const configMatch = fnString.match(/config:\s*({.*?})/);
                if (configMatch && configMatch[1]) {
                    try {
                        config = JSON.parse(configMatch[1].replace(/'/g, '"'));
                    } catch {
                        // 解析エラーは無視
                    }
                }

                return {
                    method,
                    endpoint,
                    data,
                    params,
                    config
                };
            }
        } catch (error) {
            this.logger.error('リクエスト情報の抽出に失敗しました', error);
        }

        return null;
    }

    /**
     * 保留中のリクエストを実行
     */
    private async executePendingRequest(request: OfflineRequest): Promise<boolean> {
        // 実行開始のログ
        this.logger.debug(`保留中リクエストを実行: ${request.method} ${request.endpoint}`);

        try {
            // APIクライアントを動的にインポート
            const ApiClient = (await import('./ApiClient')).default;
            const apiClient = ApiClient.getInstance();

            // リクエストにメタデータを追加
            const config = {
                ...request.config,
                meta: {
                    ...(request.config?.meta || {}),
                    offlineSync: true,
                    originalTimestamp: request.timestamp,
                    retryCount: request.retryCount
                }
            };

            // メソッドに応じてリクエストを実行
            let response;
            switch (request.method.toLowerCase()) {
                case 'get':
                    response = await apiClient.get(request.endpoint, request.params, config);
                    break;

                case 'post':
                    response = await apiClient.post(request.endpoint, request.data, config);
                    break;

                case 'put':
                    response = await apiClient.put(request.endpoint, request.data, config);
                    break;

                case 'patch':
                    response = await apiClient.patch(request.endpoint, request.data, config);
                    break;

                case 'delete':
                    response = await apiClient.delete(request.endpoint, config);
                    break;

                default:
                    throw new Error(`未知のメソッド: ${request.method}`);
            }

            // レスポンスに基づいて成功を判断
            return response.success;
        } catch (error) {
            this.logger.error(`リクエスト実行エラー: ${request.method} ${request.endpoint}`, error);
            return false;
        }
    }

    /**
     * リクエストの優先度を計算
     */
    private calculatePriority(method: string, endpoint: string): number {
        if (!this.config.prioritizeByType) {
            return 1; // デフォルト優先度
        }

        // メソッドによる優先度
        let priority = 1;

        switch (method.toLowerCase()) {
            case 'post':
                // 作成操作は高優先度
                priority = 3;
                break;

            case 'put':
            case 'patch':
                // 更新操作は中優先度
                priority = 2;
                break;

            case 'get':
                // 取得操作は低優先度
                priority = 1;
                break;

            case 'delete':
                // 削除操作は高優先度（データ整合性のため）
                priority = 4;
                break;
        }

        // エンドポイントによる優先度調整
        if (endpoint.includes('auth') || endpoint.includes('login') || endpoint.includes('user')) {
            // 認証や重要なユーザー操作は最優先
            priority += 2;
        } else if (endpoint.includes('sync') || endpoint.includes('settings')) {
            // 同期や設定は高優先
            priority += 1;
        }

        return priority;
    }

    /**
     * 優先度が最も低いリクエストを削除
     */
    private removeLowestPriorityRequest(): boolean {
        if (this.pendingRequests.length === 0) {
            return false;
        }

        // 優先度が最も低いリクエストを見つける
        let lowestPriorityIndex = 0;
        let lowestPriority = this.pendingRequests[0].priority;

        for (let i = 1; i < this.pendingRequests.length; i++) {
            if (this.pendingRequests[i].priority < lowestPriority) {
                lowestPriority = this.pendingRequests[i].priority;
                lowestPriorityIndex = i;
            }
        }

        // 見つかったリクエストを削除
        const removedRequest = this.pendingRequests.splice(lowestPriorityIndex, 1)[0];
        this.logger.warn(`キューがいっぱいのため、優先度の低いリクエストを削除しました: ${removedRequest.method} ${removedRequest.endpoint}`);

        return true;
    }

    /**
     * リクエストをIDで削除
     */
    private removeRequest(id: string): void {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== id);
    }

    /**
     * ユニークなリクエストIDを生成
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * 現在のユーザーIDを取得
     */
    private getCurrentUserId(): string | undefined {
        try {
            // サービスやストアからユーザーIDを取得する実装
            // ここでは簡単な例として、ローカルストレージから取得
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem('current_user_id') || undefined;
            }
        } catch (error) {
            this.logger.warn('ユーザーIDの取得に失敗しました', error);
        }

        return undefined;
    }

    /**
     * オフライン機能が利用可能かチェック
     */
    private async checkOfflineAccess(): Promise<boolean> {
        try {
            const subscriptionInfo = await this.subscriptionService.getSubscriptionInfo();
            return subscriptionInfo.features.offlineSync === true;
        } catch (error) {
            this.logger.warn('サブスクリプション情報の取得に失敗しました', error);
            // エラー時はデフォルトで許可
            return true;
        }
    }

    /**
     * ストレージからリクエストを読み込み
     */
    private loadFromStorage(): void {
        if (typeof window === 'undefined' || !this.config.persistData) {
            return;
        }

        try {
            const storedData = localStorage.getItem(STORAGE_KEY);

            if (!storedData) {
                return;
            }

            let data = storedData;

            // 暗号化されたデータの復号
            if (this.config.encryptData) {
                try {
                    data = decrypt(storedData);
                } catch (error) {
                    this.logger.error('オフラインデータの復号に失敗しました', error);
                    return;
                }
            }

            this.pendingRequests = JSON.parse(data);
            this.logger.info(`ストレージから${this.pendingRequests.length}件のオフラインリクエストを読み込みました`);
        } catch (error) {
            this.logger.error('ストレージからのオフラインリクエスト読み込みに失敗しました', error);
            // エラー時はデータをクリア
            this.pendingRequests = [];
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    /**
     * ストレージに保存
     */
    public saveToStorage(): void {
        if (typeof window === 'undefined' || !this.config.persistData) {
            return;
        }

        try {
            let data = JSON.stringify(this.pendingRequests);

            // データの暗号化
            if (this.config.encryptData) {
                data = encrypt(data);
            }

            localStorage.setItem(STORAGE_KEY, data);
        } catch (error) {
            this.logger.error('オフラインリクエストのストレージへの保存に失敗しました', error);
        }
    }

    /**
     * 最終同期時間を読み込み
     */
    private loadLastSyncTime(): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const storedTime = localStorage.getItem(LAST_SYNC_KEY);

            if (storedTime) {
                this.lastSyncTime = parseInt(storedTime, 10);
            }
        } catch (error) {
            this.logger.warn('最終同期時間の読み込みに失敗しました', error);
        }
    }

    /**
     * 最終同期時間を保存
     */
    private saveLastSyncTime(): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(LAST_SYNC_KEY, String(this.lastSyncTime));
        } catch (error) {
            this.logger.warn('最終同期時間の保存に失敗しました', error);
        }
    }

    /**
     * カスタムイベントの発行
     */
    private dispatchEvent(eventName: string, detail: Record<string, unknown>): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    /**
     * 保留中のリクエスト数を取得
     */
    public getPendingCount(): number {
        return this.pendingRequests.length;
    }

    /**
     * 最終同期時間を取得
     */
    public getLastSyncTime(): number {
        return this.lastSyncTime;
    }

    /**
     * すべての保留中リクエストをクリア
     */
    public clearPendingRequests(): void {
        this.pendingRequests = [];
        this.saveToStorage();
        this.logger.info('すべての保留中リクエストをクリアしました');
    }

    /**
     * オフライン設定を更新
     */
    public updateConfig(newConfig: Partial<OfflineConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };

        // 自動同期タイマーを再設定
        if ('autoSyncInterval' in newConfig) {
            this.setupAutoSync();
        }

        this.logger.info('オフライン設定を更新しました', newConfig);
    }

    /**
     * 特定ユーザーのリクエストだけを同期
     */
    public async syncUserRequests(userId: string): Promise<SyncResult> {
        if (!userId) {
            return {
                successful: 0,
                failed: 0,
                totalProcessed: 0,
                remainingCount: this.pendingRequests.length,
                errors: []
            };
        }

        // 指定ユーザーのリクエストをフィルタリング
        const userRequests = this.pendingRequests.filter(r => r.userId === userId);

        if (userRequests.length === 0) {
            return {
                successful: 0,
                failed: 0,
                totalProcessed: 0,
                remainingCount: this.pendingRequests.length,
                errors: []
            };
        }

        this.logger.info(`ユーザー ${userId} の ${userRequests.length} 件のリクエストを同期します`);

        // 通常の同期処理を実行
        return this.processPendingRequests();
    }
}

export default OfflineRequestManager;