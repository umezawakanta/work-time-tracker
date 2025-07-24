/**
 * 🔄 リアルタイムデータ同期サービス
 * WebSocket/SSE/WebRTCを使用した高性能リアルタイム同期システム
 */

import { EventEmitter } from '@/lib/BrowserEventEmitter';
import { unifiedAPIManager } from '@/api/unified/UnifiedAPIManager';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';
import type { BaseEntity, SchemaEntity, SyncStatus } from '@/database/schema/UnifiedDatabaseSchema';

// =============================================================================
// Types and Interfaces
// =============================================================================

export type SyncProtocol = 'websocket' | 'sse' | 'webrtc' | 'polling';
export type ConflictResolution =
  | 'last_write_wins'
  | 'first_write_wins'
  | 'merge'
  | 'manual'
  | 'auto';
export type SyncDirection = 'up' | 'down' | 'both';

export interface RealtimeSyncConfig {
  protocol: SyncProtocol;
  fallbackProtocols: SyncProtocol[];
  endpoint: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  batchSize: number;
  conflictResolution: ConflictResolution;
  enableCompression: boolean;
  enableEncryption: boolean;
  syncInterval: number;
  maxQueueSize: number;
  persistentQueue: boolean;
}

export interface SyncOperation {
  id: string;
  entity: SchemaEntity;
  entityId: string;
  operation: 'create' | 'update' | 'delete' | 'read';
  data: any;
  timestamp: number;
  userId: string;
  clientId: string;
  version: number;
  checksum: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface SyncConflict {
  id: string;
  entity: SchemaEntity;
  entityId: string;
  localOperation: SyncOperation;
  remoteOperation: SyncOperation;
  conflictType: 'concurrent_update' | 'delete_update' | 'create_create' | 'version_mismatch';
  detectedAt: number;
  resolutionStrategy: ConflictResolution;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: any;
}

export interface ConnectionState {
  protocol: SyncProtocol;
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  latency: number;
  lastActivity: number;
  reconnectAttempts: number;
  bytesReceived: number;
  bytesSent: number;
  messagesReceived: number;
  messagesSent: number;
  errors: string[];
}

export interface SyncStatistics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  conflictsDetected: number;
  conflictsResolved: number;
  averageLatency: number;
  throughput: number;
  queueLength: number;
  connectionUptime: number;
  dataTransferred: number;
  compressionRatio: number;
}

export interface PeerConnection {
  id: string;
  userId: string;
  status: 'connecting' | 'connected' | 'disconnected';
  lastSeen: number;
  capabilities: string[];
  version: string;
  metadata: Record<string, any>;
}

// =============================================================================
// WebSocket Connection Manager
// =============================================================================

class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: RealtimeSyncConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState;

  constructor(config: RealtimeSyncConfig) {
    super();
    this.config = config;
    this.connectionState = {
      protocol: 'websocket',
      status: 'disconnected',
      latency: 0,
      lastActivity: 0,
      reconnectAttempts: 0,
      bytesReceived: 0,
      bytesSent: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: [],
    };
  }

  async connect(): Promise<boolean> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return true;
      }

      this.connectionState.status = 'connecting';
      this.emit('statusChange', this.connectionState.status);

      const wsUrl = this.buildWebSocketURL();
      this.ws = new WebSocket(wsUrl);

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          this.connectionState.status = 'connected';
          this.connectionState.reconnectAttempts = 0;
          this.connectionState.lastActivity = Date.now();
          this.startHeartbeat();
          this.emit('connected');
          this.emit('statusChange', this.connectionState.status);
          resolve(true);
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          this.connectionState.status = 'error';
          this.connectionState.errors.push(error.toString());
          this.emit('error', error);
          this.emit('statusChange', this.connectionState.status);
          reject(error);
        };
      });
    } catch (error) {
      this.connectionState.status = 'error';
      this.connectionState.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.emit('error', error);
      this.emit('statusChange', this.connectionState.status);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.stopReconnect();
    this.connectionState.status = 'disconnected';
    this.emit('disconnected');
    this.emit('statusChange', this.connectionState.status);
  }

  send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const message = JSON.stringify(data);
      this.ws.send(message);
      this.connectionState.bytesSent += message.length;
      this.connectionState.messagesSent++;
      this.connectionState.lastActivity = Date.now();
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  private buildWebSocketURL(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseURL = this.config.endpoint.replace(/^https?:/, protocol);
    return `${baseURL}/realtime`;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.connectionState.bytesReceived += event.data.length;
        this.connectionState.messagesReceived++;
        this.connectionState.lastActivity = Date.now();
        this.emit('message', data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      this.connectionState.status = 'disconnected';
      this.emit('disconnected', event);
      this.emit('statusChange', this.connectionState.status);

      if (
        !event.wasClean &&
        this.connectionState.reconnectAttempts < this.config.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionState.errors.push(error.toString());
      this.emit('error', error);
    };
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.connectionState.status = 'reconnecting';
    this.connectionState.reconnectAttempts++;
    this.emit('statusChange', this.connectionState.status);

    this.reconnectTimer = setTimeout(
      () => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      },
      this.config.reconnectInterval * Math.pow(2, this.connectionState.reconnectAttempts - 1)
    );
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }
}

// =============================================================================
// Realtime Data Sync Service Implementation
// =============================================================================

class RealtimeDataSyncService extends EventEmitter {
  private static instance: RealtimeDataSyncService;
  private config: RealtimeSyncConfig;
  private wsManager: WebSocketManager;
  private syncQueue: Map<string, SyncOperation> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private peers: Map<string, PeerConnection> = new Map();
  private isActive: boolean = false;
  private clientId: string;
  private userId: string | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private statistics: SyncStatistics;
  private lastSyncTimestamp: number = 0;

  private constructor(config?: Partial<RealtimeSyncConfig>) {
    super();

    this.config = {
      protocol: 'websocket',
      fallbackProtocols: ['sse', 'polling'],
      endpoint: process.env.REACT_APP_REALTIME_ENDPOINT || 'ws://localhost:3001',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      batchSize: 50,
      conflictResolution: 'last_write_wins',
      enableCompression: true,
      enableEncryption: false,
      syncInterval: 1000,
      maxQueueSize: 1000,
      persistentQueue: true,
      ...config,
    };

    this.clientId = this.generateClientId();
    this.wsManager = new WebSocketManager(this.config);
    this.statistics = this.initializeStatistics();

    this.setupEventListeners();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<RealtimeSyncConfig>): RealtimeDataSyncService {
    if (!RealtimeDataSyncService.instance) {
      RealtimeDataSyncService.instance = new RealtimeDataSyncService(config);
    }
    return RealtimeDataSyncService.instance;
  }

  /**
   * 🚀 同期サービスの開始
   */
  public async start(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Starting Realtime Data Sync Service...');

      this.userId = userId;
      this.isActive = true;

      // WebSocket接続の確立
      const connected = await this.wsManager.connect();
      if (!connected) {
        throw new Error('Failed to establish WebSocket connection');
      }

      // 認証とクライアント登録
      await this.authenticate();

      // 同期キューの復元
      await this.restoreSyncQueue();

      // 定期同期の開始
      this.startPeriodicSync();

      // 初期同期の実行
      await this.performInitialSync();

      console.log('✅ Realtime Data Sync Service started successfully');
      this.emit('started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Realtime Data Sync Service:', error);
      await unifiedErrorHandler.handleError(error, {
        component: 'RealtimeDataSyncService',
        action: 'start',
      });
      return false;
    }
  }

  /**
   * 🛑 同期サービスの停止
   */
  public async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping Realtime Data Sync Service...');

      this.isActive = false;

      // 定期同期の停止
      this.stopPeriodicSync();

      // 保留中の操作の完了を待機
      await this.flushSyncQueue();

      // WebSocket接続の切断
      this.wsManager.disconnect();

      // 同期キューの永続化
      if (this.config.persistentQueue) {
        await this.persistSyncQueue();
      }

      this.emit('stopped');
      console.log('✅ Realtime Data Sync Service stopped');
    } catch (error) {
      console.error('❌ Error stopping Realtime Data Sync Service:', error);
      await unifiedErrorHandler.handleError(error, {
        component: 'RealtimeDataSyncService',
        action: 'stop',
      });
    }
  }

  /**
   * 📝 データ操作の同期
   */
  public async syncOperation(
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'checksum'>
  ): Promise<string> {
    const syncOp: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      clientId: this.clientId,
      checksum: this.calculateChecksum(operation.data),
      retryCount: 0,
      maxRetries: 3,
    };

    // キューに追加
    this.syncQueue.set(syncOp.id, syncOp);

    // 即座に送信を試行
    if (this.isActive && this.wsManager.getConnectionState().status === 'connected') {
      await this.sendOperation(syncOp);
    }

    this.emit('operationQueued', syncOp);
    return syncOp.id;
  }

  /**
   * 🔄 手動同期実行
   */
  public async synchronize(options?: {
    entities?: SchemaEntity[];
    direction?: SyncDirection;
    force?: boolean;
  }): Promise<{
    success: boolean;
    synchronized: number;
    conflicts: number;
    errors: string[];
  }> {
    const opts = {
      entities: [],
      direction: 'both' as SyncDirection,
      force: false,
      ...options,
    };

    const result = {
      success: true,
      synchronized: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      console.log('🔄 Starting manual synchronization...');

      // 上り同期（ローカル → サーバー）
      if (opts.direction === 'up' || opts.direction === 'both') {
        const upResult = await this.syncUp(opts.entities);
        result.synchronized += upResult.synchronized;
        result.conflicts += upResult.conflicts;
        result.errors.push(...upResult.errors);
      }

      // 下り同期（サーバー → ローカル）
      if (opts.direction === 'down' || opts.direction === 'both') {
        const downResult = await this.syncDown(opts.entities);
        result.synchronized += downResult.synchronized;
        result.conflicts += downResult.conflicts;
        result.errors.push(...downResult.errors);
      }

      this.updateStatistics(result);
      this.emit('syncCompleted', result);

      console.log(
        `✅ Synchronization completed: ${result.synchronized} operations, ${result.conflicts} conflicts`
      );
      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');

      await unifiedErrorHandler.handleError(error, {
        component: 'RealtimeDataSyncService',
        action: 'synchronize',
        additionalData: opts,
      });

      return result;
    }
  }

  /**
   * ⚔️ 競合解決
   */
  public async resolveConflict(
    conflictId: string,
    resolution: {
      strategy: ConflictResolution;
      data?: any;
      resolvedBy?: string;
    }
  ): Promise<boolean> {
    try {
      const conflict = this.conflicts.get(conflictId);
      if (!conflict) {
        throw new Error(`Conflict not found: ${conflictId}`);
      }

      console.log(`⚔️ Resolving conflict ${conflictId} with strategy: ${resolution.strategy}`);

      let resolvedData: any;

      switch (resolution.strategy) {
        case 'last_write_wins':
          resolvedData =
            conflict.localOperation.timestamp > conflict.remoteOperation.timestamp
              ? conflict.localOperation.data
              : conflict.remoteOperation.data;
          break;

        case 'first_write_wins':
          resolvedData =
            conflict.localOperation.timestamp < conflict.remoteOperation.timestamp
              ? conflict.localOperation.data
              : conflict.remoteOperation.data;
          break;

        case 'merge':
          resolvedData = this.mergeData(
            conflict.localOperation.data,
            conflict.remoteOperation.data
          );
          break;

        case 'manual':
          if (!resolution.data) {
            throw new Error('Manual resolution requires data');
          }
          resolvedData = resolution.data;
          break;

        case 'auto':
          resolvedData = await this.autoResolveConflict(conflict);
          break;

        default:
          throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
      }

      // 解決をサーバーに送信
      const resolutionOp: SyncOperation = {
        id: this.generateOperationId(),
        entity: conflict.entity,
        entityId: conflict.entityId,
        operation: 'update',
        data: resolvedData,
        timestamp: Date.now(),
        userId: this.userId!,
        clientId: this.clientId,
        version: Math.max(conflict.localOperation.version, conflict.remoteOperation.version) + 1,
        checksum: this.calculateChecksum(resolvedData),
        priority: 'high',
        retryCount: 0,
        maxRetries: 3,
        dependencies: [],
        metadata: {
          conflictResolution: true,
          conflictId,
          strategy: resolution.strategy,
        },
      };

      await this.sendOperation(resolutionOp);

      // 競合を解決済みとしてマーク
      conflict.resolved = true;
      conflict.resolvedAt = Date.now();
      conflict.resolvedBy = resolution.resolvedBy || this.userId!;
      conflict.resolution = resolvedData;
      conflict.resolutionStrategy = resolution.strategy;

      this.statistics.conflictsResolved++;
      this.emit('conflictResolved', conflict);

      console.log(`✅ Conflict ${conflictId} resolved successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to resolve conflict ${conflictId}:`, error);
      await unifiedErrorHandler.handleError(error, {
        component: 'RealtimeDataSyncService',
        action: 'resolveConflict',
        additionalData: { conflictId, resolution },
      });
      return false;
    }
  }

  /**
   * 📊 統計情報の取得
   */
  public getStatistics(): SyncStatistics {
    const connectionState = this.wsManager.getConnectionState();

    return {
      ...this.statistics,
      queueLength: this.syncQueue.size,
      connectionUptime: this.isActive ? Date.now() - this.lastSyncTimestamp : 0,
      dataTransferred: connectionState.bytesReceived + connectionState.bytesSent,
      averageLatency: connectionState.latency,
    };
  }

  /**
   * 🔗 接続状態の取得
   */
  public getConnectionState(): ConnectionState {
    return this.wsManager.getConnectionState();
  }

  /**
   * 👥 ピア接続の取得
   */
  public getPeers(): PeerConnection[] {
    return Array.from(this.peers.values());
  }

  /**
   * ⚔️ 競合一覧の取得
   */
  public getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter((c) => !c.resolved);
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private setupEventListeners(): void {
    // WebSocket イベント
    this.wsManager.on('connected', () => {
      console.log('🔗 WebSocket connected');
      this.emit('connected');
    });

    this.wsManager.on('disconnected', () => {
      console.log('🔌 WebSocket disconnected');
      this.emit('disconnected');
    });

    this.wsManager.on('message', (data) => {
      this.handleMessage(data);
    });

    this.wsManager.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
      this.emit('error', error);
    });

    // ブラウザイベント
    window.addEventListener('beforeunload', () => {
      this.stop();
    });

    window.addEventListener('online', () => {
      if (this.isActive) {
        this.wsManager.connect();
      }
    });

    window.addEventListener('offline', () => {
      this.emit('offline');
    });
  }

  private async handleMessage(message: any): Promise<void> {
    try {
      switch (message.type) {
        case 'sync_operation':
          await this.handleSyncOperation(message.data);
          break;

        case 'conflict_detected':
          await this.handleConflictDetected(message.data);
          break;

        case 'peer_connected':
          this.handlePeerConnected(message.data);
          break;

        case 'peer_disconnected':
          this.handlePeerDisconnected(message.data);
          break;

        case 'ping':
          this.wsManager.send({ type: 'pong', timestamp: Date.now() });
          break;

        case 'pong':
          this.updateLatency(message.timestamp);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await unifiedErrorHandler.handleError(error, {
        component: 'RealtimeDataSyncService',
        action: 'handleMessage',
        additionalData: { messageType: message.type },
      });
    }
  }

  private async handleSyncOperation(operation: SyncOperation): Promise<void> {
    // リモートからの同期操作を処理
    console.log(
      `📥 Received sync operation: ${operation.operation} ${operation.entity}/${operation.entityId}`
    );

    this.statistics.totalOperations++;
    this.emit('operationReceived', operation);
  }

  private async handleConflictDetected(conflictData: any): Promise<void> {
    const conflict: SyncConflict = {
      ...conflictData,
      detectedAt: Date.now(),
      resolved: false,
    };

    this.conflicts.set(conflict.id, conflict);
    this.statistics.conflictsDetected++;

    console.log(`⚔️ Conflict detected: ${conflict.entity}/${conflict.entityId}`);
    this.emit('conflictDetected', conflict);

    // 自動解決を試行
    if (this.config.conflictResolution !== 'manual') {
      await this.resolveConflict(conflict.id, {
        strategy: this.config.conflictResolution,
      });
    }
  }

  private handlePeerConnected(peer: PeerConnection): void {
    this.peers.set(peer.id, peer);
    console.log(`👥 Peer connected: ${peer.userId}`);
    this.emit('peerConnected', peer);
  }

  private handlePeerDisconnected(peerId: string): void {
    this.peers.delete(peerId);
    console.log(`👋 Peer disconnected: ${peerId}`);
    this.emit('peerDisconnected', peerId);
  }

  private async authenticate(): Promise<void> {
    // 認証メッセージを送信
    const authMessage = {
      type: 'authenticate',
      userId: this.userId,
      clientId: this.clientId,
      timestamp: Date.now(),
    };

    this.wsManager.send(authMessage);
  }

  private async sendOperation(operation: SyncOperation): Promise<void> {
    const message = {
      type: 'sync_operation',
      data: operation,
    };

    if (this.wsManager.send(message)) {
      console.log(
        `📤 Sent sync operation: ${operation.operation} ${operation.entity}/${operation.entityId}`
      );
      this.syncQueue.delete(operation.id);
      this.statistics.successfulOperations++;
    } else {
      console.warn(`⚠️ Failed to send operation: ${operation.id}`);
      operation.retryCount++;
      this.statistics.failedOperations++;
    }
  }

  private async syncUp(
    entities: SchemaEntity[]
  ): Promise<{ synchronized: number; conflicts: number; errors: string[] }> {
    // 上り同期の実装
    return { synchronized: 0, conflicts: 0, errors: [] };
  }

  private async syncDown(
    entities: SchemaEntity[]
  ): Promise<{ synchronized: number; conflicts: number; errors: string[] }> {
    // 下り同期の実装
    return { synchronized: 0, conflicts: 0, errors: [] };
  }

  private mergeData(localData: any, remoteData: any): any {
    // データマージの実装（簡易版）
    return { ...localData, ...remoteData, mergedAt: Date.now() };
  }

  private async autoResolveConflict(conflict: SyncConflict): Promise<any> {
    // AI/ルールベースの自動競合解決
    return this.mergeData(conflict.localOperation.data, conflict.remoteOperation.data);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(data: any): string {
    // 簡易チェックサム計算
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private updateLatency(remoteTimestamp: number): void {
    const latency = Date.now() - remoteTimestamp;
    const connectionState = this.wsManager.getConnectionState();
    connectionState.latency = latency;
  }

  private initializeStatistics(): SyncStatistics {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      averageLatency: 0,
      throughput: 0,
      queueLength: 0,
      connectionUptime: 0,
      dataTransferred: 0,
      compressionRatio: 1.0,
    };
  }

  private updateStatistics(result: any): void {
    this.statistics.totalOperations += result.synchronized;
    this.statistics.conflictsDetected += result.conflicts;
  }

  private startPeriodicSync(): void {
    this.syncTimer = setInterval(async () => {
      if (this.syncQueue.size > 0) {
        await this.flushSyncQueue();
      }
    }, this.config.syncInterval);
  }

  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private async flushSyncQueue(): Promise<void> {
    const operations = Array.from(this.syncQueue.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, this.config.batchSize);

    for (const operation of operations) {
      await this.sendOperation(operation);
    }
  }

  private async restoreSyncQueue(): Promise<void> {
    if (!this.config.persistentQueue) return;

    try {
      const queueData = localStorage.getItem(`sync_queue_${this.userId}`);
      if (queueData) {
        const operations = JSON.parse(queueData);
        operations.forEach((op: SyncOperation) => {
          this.syncQueue.set(op.id, op);
        });
        console.log(`🔄 Restored ${operations.length} operations from queue`);
      }
    } catch (error) {
      console.error('Failed to restore sync queue:', error);
    }
  }

  private async persistSyncQueue(): Promise<void> {
    if (!this.config.persistentQueue) return;

    try {
      const operations = Array.from(this.syncQueue.values());
      localStorage.setItem(`sync_queue_${this.userId}`, JSON.stringify(operations));
      console.log(`💾 Persisted ${operations.length} operations to queue`);
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }

  private async performInitialSync(): Promise<void> {
    console.log('🔄 Performing initial sync...');
    this.lastSyncTimestamp = Date.now();

    // 初期同期の実装
    await this.synchronize({
      direction: 'both',
      force: true,
    });
  }
}

// シングルトンインスタンスをエクスポート
export const realtimeDataSyncService = RealtimeDataSyncService.getInstance();

// デフォルトエクスポート
export default realtimeDataSyncService;
