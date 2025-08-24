import { toast } from '@/components/ui/use-toast';
import { generateOperationId } from '../../utils/idGenerator';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'batch';
  resource: string;
  localId?: string;
  serverId?: string;
  data?: any;
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  conflictResolution?: 'client_wins' | 'server_wins' | 'merge' | 'manual';
}

export interface SyncState {
  id: string;
  resource: string;
  lastSyncAt: string;
  version: number;
  checksum: string;
  pendingOperations: number;
  conflictCount: number;
  status: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface ConflictResolution {
  operationId: string;
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  clientData: any;
  serverData: any;
  mergedData?: any;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  retryDelay: number;
  maxRetries: number;
  batchSize: number;
  conflictResolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  deltaSync: boolean;
  compressionEnabled: boolean;
}

export interface SyncStats {
  totalOperations: number;
  pendingOperations: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
  lastSyncAt: string;
  nextSyncAt: string;
  dataTransferred: number;
  syncDuration: number;
}

export interface OfflineDatabase {
  name: string;
  version: number;
  stores: OfflineStore[];
}

export interface OfflineStore {
  name: string;
  keyPath: string;
  autoIncrement: boolean;
  indexes: OfflineIndex[];
}

export interface OfflineIndex {
  name: string;
  keyPath: string | string[];
  unique: boolean;
}

export interface SyncPolicy {
  resource: string;
  syncDirection: 'bidirectional' | 'pull_only' | 'push_only';
  conflictResolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  syncFrequency: number;
  batchSize: number;
  deltaSync: boolean;
  fieldMapping?: Record<string, string>;
  transformations?: {
    outbound?: (data: any) => any;
    inbound?: (data: any) => any;
  };
}

/**
 * 📱 プログレッシブWebマスター: オフライン同期サービス
 * データ競合解決・キュー管理・双方向同期
 */
class OfflineSyncService {
  private static instance: OfflineSyncService | null = null;
  private db: IDBDatabase | null = null;
  private syncQueue: Map<string, SyncOperation> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private conflictQueue: Map<string, ConflictResolution> = new Map();
  private syncPolicies: Map<string, SyncPolicy> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeDatabase();
    this.setupEventListeners();
    this.initializeSyncPolicies();
    this.loadPersistedState();
    this.startAutoSync();
  }

  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * 🔧 デフォルト設定取得
   */
  private getDefaultConfig(): SyncConfig {
    return {
      autoSync: true,
      syncInterval: 30000, // 30秒
      retryDelay: 5000, // 5秒
      maxRetries: 3,
      batchSize: 20,
      conflictResolution: 'server_wins',
      deltaSync: true,
      compressionEnabled: true,
    };
  }

  /**
   * 🗄️ データベース初期化
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineSyncDB', 1);

      request.onerror = () => {
        console.error('オフラインDB初期化失敗:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('🗄️ オフラインDB初期化完了');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 同期キューストア
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('resource', 'resource', { unique: false });
        }

        // 同期状態ストア
        if (!db.objectStoreNames.contains('syncStates')) {
          const stateStore = db.createObjectStore('syncStates', { keyPath: 'id' });
          stateStore.createIndex('resource', 'resource', { unique: false });
          stateStore.createIndex('lastSyncAt', 'lastSyncAt', { unique: false });
        }

        // 競合解決ストア
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'operationId' });
          conflictStore.createIndex('strategy', 'strategy', { unique: false });
        }

        // オフラインデータストア
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('resource', 'resource', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('🗄️ オフラインDBスキーマ作成完了');
      };
    });
  }

  /**
   * 👂 イベントリスナー設定
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // ページアンロード時に同期状態を保存
    window.addEventListener('beforeunload', () => {
      this.persistState();
    });
  }

  /**
   * 📋 同期ポリシー初期化
   */
  private initializeSyncPolicies(): void {
    const defaultPolicies: SyncPolicy[] = [
      {
        resource: 'todos',
        syncDirection: 'bidirectional',
        conflictResolution: 'server_wins',
        syncFrequency: 30000,
        batchSize: 20,
        deltaSync: true,
        transformations: {
          outbound: (data) => ({
            ...data,
            clientModified: new Date().toISOString(),
          }),
          inbound: (data) => ({
            ...data,
            serverSynced: true,
          }),
        },
      },
      {
        resource: 'user-preferences',
        syncDirection: 'bidirectional',
        conflictResolution: 'client_wins',
        syncFrequency: 60000,
        batchSize: 5,
        deltaSync: false,
      },
      {
        resource: 'analytics-events',
        syncDirection: 'push_only',
        conflictResolution: 'client_wins',
        syncFrequency: 120000,
        batchSize: 50,
        deltaSync: false,
      },
      {
        resource: 'app-config',
        syncDirection: 'pull_only',
        conflictResolution: 'server_wins',
        syncFrequency: 300000,
        batchSize: 1,
        deltaSync: false,
      },
    ];

    defaultPolicies.forEach((policy) => {
      this.syncPolicies.set(policy.resource, policy);
    });

    console.log('📋 同期ポリシーを初期化しました', this.syncPolicies.size, 'ポリシー');
  }

  /**
   * 💾 状態読み込み
   */
  private async loadPersistedState(): Promise<void> {
    if (!this.db) return;

    try {
      // 同期キューを読み込み
      const queueTransaction = this.db.transaction(['syncQueue'], 'readonly');
      const queueStore = queueTransaction.objectStore('syncQueue');
      const queueRequest = queueStore.getAll();

      queueRequest.onsuccess = () => {
        queueRequest.result.forEach((operation: SyncOperation) => {
          this.syncQueue.set(operation.id, operation);
        });
        console.log('💾 同期キューを復元しました', this.syncQueue.size, '操作');
      };

      // 同期状態を読み込み
      const stateTransaction = this.db.transaction(['syncStates'], 'readonly');
      const stateStore = stateTransaction.objectStore('syncStates');
      const stateRequest = stateStore.getAll();

      stateRequest.onsuccess = () => {
        stateRequest.result.forEach((state: SyncState) => {
          this.syncStates.set(state.id, state);
        });
        console.log('💾 同期状態を復元しました', this.syncStates.size, '状態');
      };
    } catch (error) {
      console.error('状態読み込み失敗:', error);
    }
  }

  /**
   * 💾 状態保存
   */
  private async persistState(): Promise<void> {
    if (!this.db) return;

    try {
      // 同期キューを保存
      const queueTransaction = this.db.transaction(['syncQueue'], 'readwrite');
      const queueStore = queueTransaction.objectStore('syncQueue');

      this.syncQueue.forEach((operation) => {
        queueStore.put(operation);
      });

      // 同期状態を保存
      const stateTransaction = this.db.transaction(['syncStates'], 'readwrite');
      const stateStore = stateTransaction.objectStore('syncStates');

      this.syncStates.forEach((state) => {
        stateStore.put(state);
      });

      console.log('💾 同期状態を保存しました');
    } catch (error) {
      console.error('状態保存失敗:', error);
    }
  }

  /**
   * ➕ 同期操作追加
   */
  async addSyncOperation(
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: any,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      localId?: string;
      serverId?: string;
    }
  ): Promise<string> {
    const operationId = generateOperationId('op');

    const operation: SyncOperation = {
      id: operationId,
      type,
      resource,
      localId: options?.localId,
      serverId: options?.serverId,
      data,
      timestamp: new Date().toISOString(),
      priority: options?.priority || 'normal',
      retryCount: 0,
      maxRetries: this.config.maxRetries,
    };

    this.syncQueue.set(operationId, operation);

    // 即座に同期を試行（オンラインの場合）
    if (this.isOnline && this.config.autoSync) {
      this.performSync();
    }

    console.log(`➕ 同期操作追加: ${type} ${resource}`, operation);

    // オフラインの場合は通知
    if (!this.isOnline) {
      toast({
        title: 'オフライン操作保存',
        description: 'オンライン復帰時に同期されます',
        variant: 'default',
      });
    }

    return operationId;
  }

  /**
   * 🔄 同期実行
   */
  async performSync(force: boolean = false): Promise<void> {
    if (this.syncInProgress && !force) {
      console.log('🔄 同期処理中のためスキップ');
      return;
    }

    if (!this.isOnline) {
      console.log('📡 オフライン状態のため同期をスキップ');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 同期処理開始');

    try {
      const startTime = Date.now();

      // 優先度順で同期操作をソート
      const operations = Array.from(this.syncQueue.values())
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, this.config.batchSize);

      if (operations.length === 0) {
        console.log('🔄 同期する操作がありません');
        return;
      }

      // バッチごとに同期処理
      await this.processSyncBatch(operations);

      const duration = Date.now() - startTime;
      console.log(`🔄 同期処理完了: ${operations.length}操作 (${duration}ms)`);

      toast({
        title: '同期完了',
        description: `${operations.length}件の操作を同期しました`,
        variant: 'default',
      });
    } catch (error) {
      console.error('同期処理失敗:', error);

      toast({
        title: '同期エラー',
        description: '同期処理中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 📦 同期バッチ処理
   */
  private async processSyncBatch(operations: SyncOperation[]): Promise<void> {
    const resourceGroups = new Map<string, SyncOperation[]>();

    // リソース別にグループ化
    operations.forEach((op) => {
      if (!resourceGroups.has(op.resource)) {
        resourceGroups.set(op.resource, []);
      }
      resourceGroups.get(op.resource)!.push(op);
    });

    // リソースごとに同期処理
    for (const [resource, resourceOps] of resourceGroups) {
      const policy = this.syncPolicies.get(resource);
      if (!policy) {
        console.warn(`同期ポリシーが見つかりません: ${resource}`);
        continue;
      }

      await this.syncResource(resource, resourceOps, policy);
    }
  }

  /**
   * 🔄 リソース同期
   */
  private async syncResource(
    resource: string,
    operations: SyncOperation[],
    policy: SyncPolicy
  ): Promise<void> {
    try {
      // アウトバウンド同期（ローカル → サーバー）
      if (policy.syncDirection === 'bidirectional' || policy.syncDirection === 'push_only') {
        await this.performOutboundSync(resource, operations, policy);
      }

      // インバウンド同期（サーバー → ローカル）
      if (policy.syncDirection === 'bidirectional' || policy.syncDirection === 'pull_only') {
        await this.performInboundSync(resource, policy);
      }

      // 同期状態更新
      this.updateSyncState(resource, operations.length);
    } catch (error) {
      console.error(`リソース同期失敗: ${resource}`, error);

      // 失敗した操作のリトライカウント増加
      operations.forEach((op) => {
        op.retryCount++;
        op.lastError = error instanceof Error ? error.message : '不明なエラー';

        if (op.retryCount >= op.maxRetries) {
          console.warn(`操作リトライ上限到達: ${op.id}`);
          this.syncQueue.delete(op.id);
        }
      });
    }
  }

  /**
   * ⬆️ アウトバウンド同期
   */
  private async performOutboundSync(
    resource: string,
    operations: SyncOperation[],
    policy: SyncPolicy
  ): Promise<void> {
    const payload = {
      resource,
      operations: operations.map((op) => ({
        id: op.id,
        type: op.type,
        localId: op.localId,
        serverId: op.serverId,
        data: policy.transformations?.outbound ? policy.transformations.outbound(op.data) : op.data,
        timestamp: op.timestamp,
      })),
      deltaSync: policy.deltaSync,
      checksum: this.calculateChecksum(operations),
    };

    const response = await fetch(`/api/sync/${resource}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`アウトバウンド同期失敗: ${response.status}`);
    }

    const result = await response.json();

    // 成功した操作をキューから削除
    if (result.success) {
      operations.forEach((op) => {
        this.syncQueue.delete(op.id);
      });
    }

    // 競合がある場合は競合解決キューに追加
    if (result.conflicts && result.conflicts.length > 0) {
      result.conflicts.forEach((conflict: any) => {
        this.handleConflict(conflict, policy);
      });
    }
  }

  /**
   * ⬇️ インバウンド同期
   */
  private async performInboundSync(resource: string, policy: SyncPolicy): Promise<void> {
    const syncState = this.syncStates.get(`${resource}_state`);
    const lastSyncTimestamp = syncState?.lastSyncAt || '1970-01-01T00:00:00.000Z';

    const response = await fetch(
      `/api/sync/${resource}/pull?since=${lastSyncTimestamp}&delta=${policy.deltaSync}`
    );

    if (!response.ok) {
      throw new Error(`インバウンド同期失敗: ${response.status}`);
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      // データ変換
      const transformedData = policy.transformations?.inbound
        ? result.data.map(policy.transformations.inbound)
        : result.data;

      // ローカルデータベースに保存
      await this.saveInboundData(resource, transformedData);

      console.log(`⬇️ インバウンド同期完了: ${resource} (${result.data.length}件)`);
    }
  }

  /**
   * ⚔️ 競合処理
   */
  private handleConflict(conflict: any, policy: SyncPolicy): void {
    const resolution: ConflictResolution = {
      operationId: conflict.operationId,
      strategy: policy.conflictResolution,
      clientData: conflict.clientData,
      serverData: conflict.serverData,
    };

    switch (policy.conflictResolution) {
      case 'client_wins':
        resolution.mergedData = conflict.clientData;
        break;
      case 'server_wins':
        resolution.mergedData = conflict.serverData;
        break;
      case 'merge':
        resolution.mergedData = this.mergeData(conflict.clientData, conflict.serverData);
        break;
      case 'manual':
        // 手動解決キューに追加
        this.conflictQueue.set(conflict.operationId, resolution);
        this.notifyConflict(conflict);
        return;
    }

    resolution.resolvedAt = new Date().toISOString();
    resolution.resolvedBy = 'system';

    // 解決済み競合を処理
    this.applyConflictResolution(resolution);
  }

  /**
   * 🔧 データマージ
   */
  private mergeData(clientData: any, serverData: any): any {
    // 基本的なマージ戦略（フィールドレベル）
    const merged = { ...serverData };

    // クライアントのより新しいフィールドを優先
    Object.keys(clientData).forEach((key) => {
      if (key.endsWith('At') || key.endsWith('Time')) {
        // タイムスタンプフィールドは新しい方を採用
        if (!merged[key] || new Date(clientData[key]) > new Date(merged[key])) {
          merged[key] = clientData[key];
        }
      } else if (!Object.prototype.hasOwnProperty.call(merged, key)) {
        // サーバーにないフィールドはクライアントから追加
        merged[key] = clientData[key];
      }
    });

    return merged;
  }

  /**
   * 📢 競合通知
   */
  private notifyConflict(conflict: any): void {
    toast({
      title: 'データ競合検出',
      description: '手動での競合解決が必要です',
      variant: 'destructive',
    });

    console.warn('⚔️ データ競合検出:', conflict);
  }

  /**
   * ✅ 競合解決適用
   */
  private async applyConflictResolution(resolution: ConflictResolution): Promise<void> {
    try {
      // 解決されたデータでローカルを更新
      await this.updateLocalData(resolution.operationId, resolution.mergedData);

      // 競合キューから削除
      this.conflictQueue.delete(resolution.operationId);

      console.log('✅ 競合解決適用完了:', resolution.operationId);
    } catch (error) {
      console.error('競合解決適用失敗:', error);
    }
  }

  /**
   * 💾 インバウンドデータ保存
   */
  private async saveInboundData(resource: string, data: any[]): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');

    data.forEach((item) => {
      const record = {
        id: `${resource}_${item.id || Date.now()}`,
        resource,
        data: item,
        timestamp: new Date().toISOString(),
      };
      store.put(record);
    });

    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * 🔄 ローカルデータ更新
   */
  private async updateLocalData(operationId: string, data: any): Promise<void> {
    // 実装時はアプリケーション固有のデータストアを更新
    console.log('🔄 ローカルデータ更新:', operationId, data);
  }

  /**
   * 📊 同期状態更新
   */
  private updateSyncState(resource: string, operationCount: number): void {
    const stateId = `${resource}_state`;
    let state = this.syncStates.get(stateId);

    if (!state) {
      state = {
        id: stateId,
        resource,
        lastSyncAt: new Date().toISOString(),
        version: 1,
        checksum: '',
        pendingOperations: 0,
        conflictCount: 0,
        status: 'synced',
      };
    }

    state.lastSyncAt = new Date().toISOString();
    state.version++;
    state.pendingOperations = Math.max(0, state.pendingOperations - operationCount);
    state.status = state.pendingOperations > 0 ? 'pending' : 'synced';

    this.syncStates.set(stateId, state);
  }

  /**
   * 🔢 チェックサム計算
   */
  private calculateChecksum(operations: SyncOperation[]): string {
    const data = operations
      .map((op) => `${op.type}:${op.resource}:${JSON.stringify(op.data)}`)
      .join('|');

    // 簡単なハッシュ計算（実際の実装ではCRC32やSHA256を使用）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }

    return hash.toString(16);
  }

  /**
   * 🌐 オンライン復帰処理
   */
  private handleOnline(): void {
    console.log('🌐 オンライン復帰 - 同期処理を開始します');

    toast({
      title: 'オンライン復帰',
      description: 'データ同期を開始しています',
      variant: 'default',
    });

    // 即座に同期実行
    this.performSync(true);
  }

  /**
   * 📡 オフライン移行処理
   */
  private handleOffline(): void {
    console.log('📡 オフライン状態 - ローカルモードに切り替えます');

    toast({
      title: 'オフライン状態',
      description: 'ローカルデータで動作します',
      variant: 'default',
    });

    // 状態を保存
    this.persistState();
  }

  /**
   * ⏰ 自動同期開始
   */
  private startAutoSync(): void {
    if (!this.config.autoSync) return;

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync();
      }
    }, this.config.syncInterval);

    console.log('⏰ 自動同期を開始しました');
  }

  /**
   * ⏹️ 自動同期停止
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏹️ 自動同期を停止しました');
    }
  }

  // ゲッター
  getSyncStats(): SyncStats {
    const pendingOps = this.syncQueue.size;
    const totalOps = Array.from(this.syncStates.values()).reduce(
      (sum, state) => sum + state.version,
      0
    );

    return {
      totalOperations: totalOps,
      pendingOperations: pendingOps,
      successfulSyncs: totalOps - pendingOps,
      failedSyncs: 0, // 実装時は実際の失敗数を追跡
      conflictsResolved: this.conflictQueue.size,
      lastSyncAt: this.getLastSyncTime(),
      nextSyncAt: this.getNextSyncTime(),
      dataTransferred: 0, // 実装時は実際のデータ量を追跡
      syncDuration: 0, // 実装時は実際の処理時間を追跡
    };
  }

  getSyncQueue(): SyncOperation[] {
    return Array.from(this.syncQueue.values());
  }

  getSyncStates(): SyncState[] {
    return Array.from(this.syncStates.values());
  }

  getConflictQueue(): ConflictResolution[] {
    return Array.from(this.conflictQueue.values());
  }

  isOnlineMode(): boolean {
    return this.isOnline;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  private getLastSyncTime(): string {
    const states = Array.from(this.syncStates.values());
    if (states.length === 0) return new Date().toISOString();

    return states.reduce(
      (latest, state) =>
        new Date(state.lastSyncAt) > new Date(latest) ? state.lastSyncAt : latest,
      states[0].lastSyncAt
    );
  }

  private getNextSyncTime(): string {
    return new Date(Date.now() + this.config.syncInterval).toISOString();
  }

  // 競合解決
  async resolveConflict(
    operationId: string,
    strategy: 'client_wins' | 'server_wins' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const conflict = this.conflictQueue.get(operationId);
    if (!conflict) {
      throw new Error('競合が見つかりません');
    }

    const resolution: ConflictResolution = {
      ...conflict,
      strategy,
      mergedData:
        mergedData || (strategy === 'client_wins' ? conflict.clientData : conflict.serverData),
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'user',
    };

    await this.applyConflictResolution(resolution);

    toast({
      title: '競合解決完了',
      description: 'データの競合が解決されました',
      variant: 'default',
    });
  }

  // 設定更新
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 自動同期の再設定
    if (newConfig.autoSync !== undefined || newConfig.syncInterval !== undefined) {
      this.stopAutoSync();
      if (this.config.autoSync) {
        this.startAutoSync();
      }
    }

    console.log('⚙️ 同期設定を更新しました', this.config);
  }
}

export const offlineSyncService = OfflineSyncService.getInstance();
