/**
 * 🌐 統一APIマネージャー
 * 全てのデータアクセスを統一されたインターフェースで管理
 */

import { EventEmitter } from '@/lib/BrowserEventEmitter';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';
import { unifiedSecurityMiddleware } from '@/services/security/UnifiedSecurityMiddleware';
import type {
  BaseEntity,
  SchemaEntity,
  UserProfile,
  WorkSession,
  Project,
  Task,
  Todo,
  Achievement,
  Badge,
  ActivityLog,
  PerformanceMetric,
  Report,
  Notification,
} from '@/database/schema/UnifiedDatabaseSchema';

// =============================================================================
// API Configuration Types
// =============================================================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type CacheStrategy =
  | 'no-cache'
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only';
export type ResponseFormat = 'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData';

export interface APIConfig {
  baseURL: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableSecurity: boolean;
  enableMetrics: boolean;
  defaultHeaders: Record<string, string>;
  authTokenHeader: string;
  endpoints: APIEndpointMap;
}

export interface APIEndpoint {
  path: string;
  method: HTTPMethod;
  description: string;
  auth: boolean;
  cache: CacheStrategy;
  timeout?: number;
  rateLimit?: {
    requests: number;
    window: number;
  };
  validation?: {
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: Record<string, any>;
  };
  transformation?: {
    request?: (data: any) => any;
    response?: (data: any) => any;
  };
}

export type APIEndpointMap = Record<string, APIEndpoint>;

// =============================================================================
// Request/Response Types
// =============================================================================

export interface APIRequest<T = any> {
  endpoint: string;
  method: HTTPMethod;
  params?: Record<string, string>;
  query?: Record<string, any>;
  body?: T;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: CacheStrategy;
  retry?: number;
  signal?: AbortSignal;
  metadata?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata: APIResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  traceId?: string;
  stack?: string;
}

export interface APIResponseMetadata {
  requestId: string;
  timestamp: string;
  duration: number;
  cached: boolean;
  cacheKey?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
  serverVersion?: string;
  etag?: string;
}

// =============================================================================
// Cache Management Types
// =============================================================================

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  compressed: boolean;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
  compressionRatio: number;
}

// =============================================================================
// Batch Operations Types
// =============================================================================

export interface BatchRequest {
  id: string;
  request: APIRequest;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface BatchResponse<T = any> {
  id: string;
  response: APIResponse<T>;
  index: number;
}

export interface BatchOptions {
  maxBatchSize: number;
  batchTimeout: number;
  continueOnError: boolean;
  preserveOrder: boolean;
}

// =============================================================================
// Sync Management Types
// =============================================================================

export interface SyncOperation {
  id: string;
  entity: SchemaEntity;
  entityId: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  data: any;
  localVersion: number;
  serverVersion?: number;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface SyncConflict {
  operationId: string;
  entity: SchemaEntity;
  entityId: string;
  localData: any;
  serverData: any;
  conflictType: 'concurrent_update' | 'deleted_on_server' | 'created_locally';
  resolutionStrategy: 'manual' | 'use_local' | 'use_server' | 'merge' | 'auto';
  resolvedAt?: string;
  resolvedBy?: string;
}

// =============================================================================
// Metrics and Analytics Types
// =============================================================================

export interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
  retryRate: number;
  timeouts: number;
}

export interface EndpointMetrics {
  endpoint: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  cacheHitRate: number;
  lastUsed: string;
}

// =============================================================================
// Unified API Manager Implementation
// =============================================================================

class UnifiedAPIManager extends EventEmitter {
  private static instance: UnifiedAPIManager;
  private config: APIConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private syncQueue: Map<string, SyncOperation> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private metrics: Map<string, EndpointMetrics> = new Map();
  private batchQueue: BatchRequest[] = [];
  private activeRequests: Map<string, AbortController> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncTimer: NodeJS.Timeout | null = null;
  private cacheCleanupTimer: NodeJS.Timeout | null = null;

  private constructor(config?: Partial<APIConfig>) {
    super();

    this.config = {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
      version: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5分
      enableCompression: true,
      enableSecurity: true,
      enableMetrics: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Version': 'v1',
      },
      authTokenHeader: 'Authorization',
      endpoints: this.getDefaultEndpoints(),
      ...config,
    };

    this.initialize();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<APIConfig>): UnifiedAPIManager {
    if (!UnifiedAPIManager.instance) {
      UnifiedAPIManager.instance = new UnifiedAPIManager(config);
    }
    return UnifiedAPIManager.instance;
  }

  /**
   * 🚀 APIマネージャーの初期化
   */
  private async initialize(): Promise<void> {
    try {
      console.log('🌐 Initializing Unified API Manager...');

      // イベントリスナーの設定
      this.setupEventListeners();

      // キャッシュクリーンアップの開始
      this.startCacheCleanup();

      // オフライン同期の開始
      this.startOfflineSync();

      // バッチ処理の開始
      this.startBatchProcessing();

      console.log('✅ Unified API Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Unified API Manager:', error);
      await unifiedErrorHandler.handleError(error, {
        component: 'UnifiedAPIManager',
        action: 'initialization',
      });
    }
  }

  /**
   * 📡 統一APIリクエスト
   */
  public async request<T = any>(request: APIRequest<any>): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // セキュリティチェック
      if (this.config.enableSecurity) {
        const securityResult = await unifiedSecurityMiddleware.checkSecurity({
          url: this.buildURL(request.endpoint, request.params, request.query),
          method: request.method,
          headers: { ...this.config.defaultHeaders, ...request.headers },
          body: request.body,
          timestamp: Date.now(),
        });

        if (!securityResult.allowed) {
          throw new Error(`Security check failed: ${securityResult.reason}`);
        }
      }

      // エンドポイント設定の取得
      const endpointConfig = this.config.endpoints[request.endpoint];
      if (!endpointConfig) {
        throw new Error(`Unknown endpoint: ${request.endpoint}`);
      }

      // キャッシュチェック
      const cacheStrategy = request.cache || endpointConfig.cache;
      if (cacheStrategy !== 'no-cache' && request.method === 'GET') {
        const cachedResponse = await this.getCachedResponse<T>(request);
        if (cachedResponse) {
          this.updateMetrics(request.endpoint, Date.now() - startTime, true, true);
          return cachedResponse;
        }
      }

      // レート制限チェック
      if (endpointConfig.rateLimit) {
        await this.checkRateLimit(request.endpoint, endpointConfig.rateLimit);
      }

      // リクエスト実行
      const response = await this.executeRequest<T>(request, endpointConfig, requestId);

      // キャッシュ保存
      if (this.config.enableCaching && cacheStrategy !== 'no-cache' && response.success) {
        await this.setCachedResponse(request, response);
      }

      // メトリクス更新
      this.updateMetrics(request.endpoint, Date.now() - startTime, response.success, false);

      return response;
    } catch (error) {
      // エラーハンドリング
      const apiError = await this.handleAPIError(error, request, requestId);
      this.updateMetrics(request.endpoint, Date.now() - startTime, false, false);

      return {
        success: false,
        error: apiError,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          cached: false,
        },
      };
    }
  }

  /**
   * 📊 CRUD操作の統一インターフェース
   */
  public async create<T extends BaseEntity>(
    entity: SchemaEntity,
    data: Partial<T>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint: `${entity.toLowerCase()}/create`,
      method: 'POST',
      body: data,
    });
  }

  public async read<T extends BaseEntity>(
    entity: SchemaEntity,
    id: string
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint: `${entity.toLowerCase()}/read`,
      method: 'GET',
      params: { id },
    });
  }

  public async update<T extends BaseEntity>(
    entity: SchemaEntity,
    id: string,
    data: Partial<T>
  ): Promise<APIResponse<T>> {
    return this.request<T>({
      endpoint: `${entity.toLowerCase()}/update`,
      method: 'PUT',
      params: { id },
      body: data,
    });
  }

  public async delete<T extends BaseEntity>(
    entity: SchemaEntity,
    id: string
  ): Promise<APIResponse<boolean>> {
    return this.request<boolean>({
      endpoint: `${entity.toLowerCase()}/delete`,
      method: 'DELETE',
      params: { id },
    });
  }

  public async list<T extends BaseEntity>(
    entity: SchemaEntity,
    options?: {
      page?: number;
      limit?: number;
      sort?: string;
      filter?: Record<string, any>;
      search?: string;
    }
  ): Promise<APIResponse<{ items: T[]; total: number; page: number; limit: number }>> {
    return this.request({
      endpoint: `${entity.toLowerCase()}/list`,
      method: 'GET',
      query: options,
    });
  }

  /**
   * 🚀 バッチ操作
   */
  public async batch<T = any>(
    requests: BatchRequest[],
    options?: Partial<BatchOptions>
  ): Promise<BatchResponse<T>[]> {
    const opts: BatchOptions = {
      maxBatchSize: 50,
      batchTimeout: 30000,
      continueOnError: true,
      preserveOrder: true,
      ...options,
    };

    const batches = this.chunkArray(requests, opts.maxBatchSize);
    const allResults: BatchResponse<T>[] = [];

    for (const batch of batches) {
      try {
        const batchResults = await Promise.allSettled(
          batch.map(async (batchRequest, index) => {
            const response = await this.request<T>(batchRequest.request);
            return {
              id: batchRequest.id,
              response,
              index: opts.preserveOrder ? requests.indexOf(batchRequest) : index,
            };
          })
        );

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            allResults.push(result.value);
          } else if (!opts.continueOnError) {
            throw result.reason;
          }
        }
      } catch (error) {
        if (!opts.continueOnError) {
          throw error;
        }
      }
    }

    return opts.preserveOrder ? allResults.sort((a, b) => a.index - b.index) : allResults;
  }

  /**
   * 🔄 同期操作
   */
  public async sync(
    entity: SchemaEntity,
    options?: {
      direction?: 'up' | 'down' | 'both';
      force?: boolean;
      batchSize?: number;
    }
  ): Promise<{
    success: boolean;
    synchronized: number;
    conflicts: number;
    errors: string[];
  }> {
    const opts = {
      direction: 'both' as const,
      force: false,
      batchSize: 100,
      ...options,
    };

    const result = {
      success: true,
      synchronized: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      // 上り同期（ローカル → サーバー）
      if (opts.direction === 'up' || opts.direction === 'both') {
        const upResult = await this.syncUp(entity, opts.batchSize);
        result.synchronized += upResult.synchronized;
        result.conflicts += upResult.conflicts;
        result.errors.push(...upResult.errors);
      }

      // 下り同期（サーバー → ローカル）
      if (opts.direction === 'down' || opts.direction === 'both') {
        const downResult = await this.syncDown(entity, opts.batchSize);
        result.synchronized += downResult.synchronized;
        result.conflicts += downResult.conflicts;
        result.errors.push(...downResult.errors);
      }

      this.emit('syncCompleted', { entity, result });
      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');

      await unifiedErrorHandler.handleError(error, {
        component: 'UnifiedAPIManager',
        action: 'sync',
        additionalData: { entity, options: opts },
      });

      return result;
    }
  }

  /**
   * 📊 メトリクス取得
   */
  public getMetrics(): APIMetrics {
    const endpointMetrics = Array.from(this.metrics.values());
    const totalRequests = endpointMetrics.reduce((sum, m) => sum + m.requestCount, 0);
    const successfulRequests = endpointMetrics.reduce((sum, m) => sum + m.successCount, 0);
    const failedRequests = endpointMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalTime = endpointMetrics.reduce((sum, m) => sum + m.averageTime * m.requestCount, 0);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
      slowestEndpoint: this.getSlowestEndpoint(),
      fastestEndpoint: this.getFastestEndpoint(),
      cacheHitRate: this.getCacheStats().hitRate,
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0,
      throughput: this.calculateThroughput(),
      activeConnections: this.activeRequests.size,
      retryRate: 0, // TODO: 実装
      timeouts: 0, // TODO: 実装
    };
  }

  /**
   * 💾 キャッシュ統計
   */
  public getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalHits = entries.reduce((sum, entry) => sum + entry.accessCount, 0);

    return {
      totalEntries: entries.length,
      totalSize,
      hitCount: totalHits,
      missCount: Math.max(0, totalAccess - totalHits),
      hitRate: totalAccess > 0 ? (totalHits / totalAccess) * 100 : 0,
      oldestEntry: Math.min(...entries.map((e) => e.timestamp)),
      newestEntry: Math.max(...entries.map((e) => e.timestamp)),
      compressionRatio: this.calculateCompressionRatio(),
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  /**
   * 🔗 URL構築
   */
  private buildURL(
    endpoint: string,
    params?: Record<string, string>,
    query?: Record<string, any>
  ): string {
    let url = `${this.config.baseURL}/${this.config.version}/${endpoint}`;

    // パラメータの置換
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      });
    }

    // クエリパラメータの追加
    if (query) {
      const queryString = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      if (queryString.toString()) {
        url += `?${queryString.toString()}`;
      }
    }

    return url;
  }

  /**
   * 📡 リクエスト実行
   */
  private async executeRequest<T>(
    request: APIRequest,
    endpointConfig: APIEndpoint,
    requestId: string
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);

    try {
      const url = this.buildURL(request.endpoint, request.params, request.query);
      const timeout = request.timeout || endpointConfig.timeout || this.config.timeout;

      // タイムアウト設定
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // ヘッダーの構築
      const headers = {
        ...this.config.defaultHeaders,
        ...request.headers,
      };

      // 認証トークンの追加
      if (endpointConfig.auth) {
        const token = await this.getAuthToken();
        if (token) {
          headers[this.config.authTokenHeader] = `Bearer ${token}`;
        }
      }

      // リクエストボディの変換
      let body = request.body;
      if (endpointConfig.transformation?.request) {
        body = endpointConfig.transformation.request(body);
      }

      // Fetchリクエスト実行
      const response = await fetch(url, {
        method: endpointConfig.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // レスポンスの解析
      let data: T;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = (await response.text()) as unknown as T;
      } else {
        data = (await response.blob()) as unknown as T;
      }

      // レスポンス変換
      if (endpointConfig.transformation?.response) {
        data = endpointConfig.transformation.response(data);
      }

      return {
        success: true,
        data,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - parseInt(requestId.split('_')[1]),
          cached: false,
          rateLimitRemaining: this.parseRateLimitHeader(response, 'remaining'),
          rateLimitReset: this.parseRateLimitHeader(response, 'reset'),
          serverVersion: response.headers.get('X-Server-Version') || undefined,
          etag: response.headers.get('ETag') || undefined,
        },
      };
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * 🚨 APIエラーハンドリング
   */
  private async handleAPIError(
    error: any,
    request: APIRequest,
    requestId: string
  ): Promise<APIError> {
    const apiError: APIError = {
      code: 'API_ERROR',
      message: 'API request failed',
      timestamp: new Date().toISOString(),
      traceId: requestId,
    };

    if (error.name === 'AbortError') {
      apiError.code = 'REQUEST_TIMEOUT';
      apiError.message = 'Request timeout';
    } else if (error.message?.includes('HTTP')) {
      const match = error.message.match(/HTTP (\d+)/);
      if (match) {
        const status = parseInt(match[1]);
        apiError.code = `HTTP_${status}`;
        apiError.message = error.message;
      }
    } else if (error.message?.includes('Network')) {
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'Network connection failed';
    } else {
      apiError.message = error.message || 'Unknown API error';
      apiError.details = error;
    }

    // エラーをUnifiedErrorHandlerに記録
    await unifiedErrorHandler.handleError(error, {
      component: 'UnifiedAPIManager',
      action: 'api_request',
      additionalData: {
        endpoint: request.endpoint,
        method: request.method,
        requestId,
      },
    });

    return apiError;
  }

  /**
   * 🔑 認証トークン取得
   */
  private async getAuthToken(): Promise<string | null> {
    // localStorage または sessionStorage からトークンを取得
    return (
      localStorage.getItem('unified_access_token') || sessionStorage.getItem('unified_access_token')
    );
  }

  /**
   * 🎲 リクエストID生成
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 📋 デフォルトエンドポイント設定
   */
  private getDefaultEndpoints(): APIEndpointMap {
    return {
      // User Management
      'users/create': {
        path: 'users',
        method: 'POST',
        description: 'Create user',
        auth: true,
        cache: 'no-cache',
      },
      'users/read': {
        path: 'users/:id',
        method: 'GET',
        description: 'Get user',
        auth: true,
        cache: 'cache-first',
      },
      'users/update': {
        path: 'users/:id',
        method: 'PUT',
        description: 'Update user',
        auth: true,
        cache: 'no-cache',
      },
      'users/delete': {
        path: 'users/:id',
        method: 'DELETE',
        description: 'Delete user',
        auth: true,
        cache: 'no-cache',
      },
      'users/list': {
        path: 'users',
        method: 'GET',
        description: 'List users',
        auth: true,
        cache: 'network-first',
      },

      // Work Sessions
      'worksessions/create': {
        path: 'work-sessions',
        method: 'POST',
        description: 'Create work session',
        auth: true,
        cache: 'no-cache',
      },
      'worksessions/read': {
        path: 'work-sessions/:id',
        method: 'GET',
        description: 'Get work session',
        auth: true,
        cache: 'cache-first',
      },
      'worksessions/update': {
        path: 'work-sessions/:id',
        method: 'PUT',
        description: 'Update work session',
        auth: true,
        cache: 'no-cache',
      },
      'worksessions/delete': {
        path: 'work-sessions/:id',
        method: 'DELETE',
        description: 'Delete work session',
        auth: true,
        cache: 'no-cache',
      },
      'worksessions/list': {
        path: 'work-sessions',
        method: 'GET',
        description: 'List work sessions',
        auth: true,
        cache: 'network-first',
      },

      // Projects
      'projects/create': {
        path: 'projects',
        method: 'POST',
        description: 'Create project',
        auth: true,
        cache: 'no-cache',
      },
      'projects/read': {
        path: 'projects/:id',
        method: 'GET',
        description: 'Get project',
        auth: true,
        cache: 'cache-first',
      },
      'projects/update': {
        path: 'projects/:id',
        method: 'PUT',
        description: 'Update project',
        auth: true,
        cache: 'no-cache',
      },
      'projects/delete': {
        path: 'projects/:id',
        method: 'DELETE',
        description: 'Delete project',
        auth: true,
        cache: 'no-cache',
      },
      'projects/list': {
        path: 'projects',
        method: 'GET',
        description: 'List projects',
        auth: true,
        cache: 'network-first',
      },

      // Tasks
      'tasks/create': {
        path: 'tasks',
        method: 'POST',
        description: 'Create task',
        auth: true,
        cache: 'no-cache',
      },
      'tasks/read': {
        path: 'tasks/:id',
        method: 'GET',
        description: 'Get task',
        auth: true,
        cache: 'cache-first',
      },
      'tasks/update': {
        path: 'tasks/:id',
        method: 'PUT',
        description: 'Update task',
        auth: true,
        cache: 'no-cache',
      },
      'tasks/delete': {
        path: 'tasks/:id',
        method: 'DELETE',
        description: 'Delete task',
        auth: true,
        cache: 'no-cache',
      },
      'tasks/list': {
        path: 'tasks',
        method: 'GET',
        description: 'List tasks',
        auth: true,
        cache: 'network-first',
      },

      // Todos
      'todos/create': {
        path: 'todos',
        method: 'POST',
        description: 'Create todo',
        auth: true,
        cache: 'no-cache',
      },
      'todos/read': {
        path: 'todos/:id',
        method: 'GET',
        description: 'Get todo',
        auth: true,
        cache: 'cache-first',
      },
      'todos/update': {
        path: 'todos/:id',
        method: 'PUT',
        description: 'Update todo',
        auth: true,
        cache: 'no-cache',
      },
      'todos/delete': {
        path: 'todos/:id',
        method: 'DELETE',
        description: 'Delete todo',
        auth: true,
        cache: 'no-cache',
      },
      'todos/list': {
        path: 'todos',
        method: 'GET',
        description: 'List todos',
        auth: true,
        cache: 'network-first',
      },

      // Analytics
      'analytics/dashboard': {
        path: 'analytics/dashboard',
        method: 'GET',
        description: 'Get dashboard analytics',
        auth: true,
        cache: 'network-first',
      },
      'analytics/reports': {
        path: 'analytics/reports',
        method: 'GET',
        description: 'Get reports',
        auth: true,
        cache: 'cache-first',
      },
      'analytics/metrics': {
        path: 'analytics/metrics',
        method: 'GET',
        description: 'Get metrics',
        auth: true,
        cache: 'network-first',
      },

      // Sync
      'sync/up': {
        path: 'sync/upload',
        method: 'POST',
        description: 'Upload sync data',
        auth: true,
        cache: 'no-cache',
      },
      'sync/down': {
        path: 'sync/download',
        method: 'GET',
        description: 'Download sync data',
        auth: true,
        cache: 'no-cache',
      },
      'sync/conflicts': {
        path: 'sync/conflicts',
        method: 'GET',
        description: 'Get sync conflicts',
        auth: true,
        cache: 'no-cache',
      },
    };
  }

  // Additional helper methods would be implemented here...
  // (キャッシュ関連、同期関連、メトリクス関連のプライベートメソッド)

  private async getCachedResponse<T>(request: APIRequest): Promise<APIResponse<T> | null> {
    // キャッシュ実装
    return null; // 簡略化
  }

  private async setCachedResponse<T>(request: APIRequest, response: APIResponse<T>): Promise<void> {
    // キャッシュ保存実装
  }

  private updateMetrics(
    endpoint: string,
    duration: number,
    success: boolean,
    cached: boolean
  ): void {
    // メトリクス更新実装
  }

  private setupEventListeners(): void {
    // イベントリスナー設定
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });
  }

  private startCacheCleanup(): void {
    // キャッシュクリーンアップ開始
  }

  private startOfflineSync(): void {
    // オフライン同期開始
  }

  private startBatchProcessing(): void {
    // バッチ処理開始
  }

  private async checkRateLimit(
    endpoint: string,
    rateLimit: { requests: number; window: number }
  ): Promise<void> {
    // レート制限チェック
  }

  private async syncUp(
    entity: SchemaEntity,
    batchSize: number
  ): Promise<{ synchronized: number; conflicts: number; errors: string[] }> {
    // 上り同期実装
    return { synchronized: 0, conflicts: 0, errors: [] };
  }

  private async syncDown(
    entity: SchemaEntity,
    batchSize: number
  ): Promise<{ synchronized: number; conflicts: number; errors: string[] }> {
    // 下り同期実装
    return { synchronized: 0, conflicts: 0, errors: [] };
  }

  private getSlowestEndpoint(): string {
    const metrics = Array.from(this.metrics.values());
    return metrics.length > 0
      ? metrics.reduce((slowest, current) =>
          current.averageTime > slowest.averageTime ? current : slowest
        ).endpoint
      : '';
  }

  private getFastestEndpoint(): string {
    const metrics = Array.from(this.metrics.values());
    return metrics.length > 0
      ? metrics.reduce((fastest, current) =>
          current.averageTime < fastest.averageTime ? current : fastest
        ).endpoint
      : '';
  }

  private calculateThroughput(): number {
    // スループット計算
    return 0;
  }

  private calculateCompressionRatio(): number {
    // 圧縮率計算
    return 1.0;
  }

  private parseRateLimitHeader(
    response: Response,
    type: 'remaining' | 'reset'
  ): number | undefined {
    const header = response.headers.get(
      `X-RateLimit-${type === 'remaining' ? 'Remaining' : 'Reset'}`
    );
    return header ? parseInt(header) : undefined;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// =============================================================================
// Rate Limiter Implementation
// =============================================================================

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return this.requests[0] + this.windowMs;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// シングルトンインスタンスをエクスポート
export const unifiedAPIManager = UnifiedAPIManager.getInstance();

// デフォルトエクスポート
export default unifiedAPIManager;
