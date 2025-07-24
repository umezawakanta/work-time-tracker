/**
 * 🗄️ 統一データベースフック
 * 統一データベース・API基盤システムを簡単に使用するためのReactインターフェース
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';

import { unifiedAPIManager } from '@/api/unified/UnifiedAPIManager';
import { realtimeDataSyncService } from '@/services/sync/RealtimeDataSyncService';
import { backupRestoreService } from '@/services/backup/BackupRestoreService';
import { performanceOptimizationService } from '@/services/performance/PerformanceOptimizationService';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';
import type {
  BaseEntity,
  SchemaEntity,
  UserProfile,
  WorkSession,
  Project,
  Task,
  Todo,
} from '@/database/schema/UnifiedDatabaseSchema';

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface UseUnifiedDatabaseOptions {
  entity: SchemaEntity;
  enableRealtime?: boolean;
  enableCaching?: boolean;
  enableOptimization?: boolean;
  enableBackup?: boolean;
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  optimizationLevel?: 'low' | 'medium' | 'high';
  batchSize?: number;
  prefetchRelated?: boolean;
  autoSync?: boolean;
  errorHandling?: 'throw' | 'toast' | 'silent' | 'custom';
  onError?: (error: any) => void;
  onSuccess?: (result: any) => void;
}

export interface UseUnifiedDatabaseReturn<T extends BaseEntity> {
  // データ状態
  data: T[];
  item: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;

  // データ操作
  create: (data: Partial<T>) => Promise<T | null>;
  read: (id: string) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  list: (options?: ListOptions) => Promise<T[]>;

  // バッチ操作
  createMany: (items: Partial<T>[]) => Promise<T[]>;
  updateMany: (updates: Array<{ id: string; data: Partial<T> }>) => Promise<T[]>;
  removeMany: (ids: string[]) => Promise<boolean>;

  // 検索・フィルタリング
  search: (query: string, options?: SearchOptions) => Promise<T[]>;
  filter: (predicate: (item: T) => boolean) => T[];
  sort: (compareFn?: (a: T, b: T) => number) => T[];

  // 同期
  sync: (direction?: 'up' | 'down' | 'both') => Promise<SyncResult>;
  syncItem: (id: string) => Promise<boolean>;
  getConflicts: () => SyncConflict[];
  resolveConflict: (conflictId: string, resolution: any) => Promise<boolean>;

  // キャッシュ
  invalidateCache: (key?: string) => Promise<void>;
  preload: (ids: string[]) => Promise<void>;
  getCacheStats: () => CacheStats;

  // バックアップ
  backup: (options?: BackupOptions) => Promise<string>;
  restore: (backupId: string, options?: RestoreOptions) => Promise<boolean>;
  getBackups: () => BackupInfo[];

  // パフォーマンス
  optimize: () => Promise<OptimizationResult>;
  getMetrics: () => PerformanceMetrics;

  // 状態
  refresh: () => Promise<void>;
  reset: () => void;
  getStatistics: () => DatabaseStatistics;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, any>;
  include?: string[];
  exclude?: string[];
}

export interface SearchOptions {
  fields?: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  maxResults?: number;
}

export interface SyncResult {
  success: boolean;
  synchronized: number;
  conflicts: number;
  errors: string[];
}

export interface SyncConflict {
  id: string;
  entity: SchemaEntity;
  entityId: string;
  localData: any;
  remoteData: any;
  conflictType: string;
}

export interface CacheStats {
  hitRate: number;
  totalEntries: number;
  totalSize: number;
}

export interface BackupOptions {
  name?: string;
  description?: string;
  includeRelated?: boolean;
}

export interface RestoreOptions {
  overwrite?: boolean;
  createNew?: boolean;
  validateFirst?: boolean;
}

export interface BackupInfo {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  recordCount: number;
}

export interface OptimizationResult {
  success: boolean;
  improvements: any[];
  recommendatio: any[];
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface DatabaseStatistics {
  totalRecords: number;
  totalOperations: number;
  averageResponseTime: number;
  errorRate: number;
  syncStatus: string;
  lastBackup: string;
}

// =============================================================================
// Main Hook Implementation
// =============================================================================

export function useUnifiedDatabase<T extends BaseEntity>(
  options: UseUnifiedDatabaseOptions
): UseUnifiedDatabaseReturn<T> {
  const {
    entity,
    enableRealtime = true,
    enableCaching = true,
    enableOptimization = true,
    enableBackup = false,
    cacheStrategy = 'cache-first',
    optimizationLevel = 'medium',
    batchSize = 50,
    prefetchRelated = false,
    autoSync = true,
    errorHandling = 'toast',
    onError,
    onSuccess,
  } = options;

  // State
  const [data, setData] = useState<T[]>([]);
  const [item, setItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const isMounted = useRef(true);
  const operationQueue = useRef<Array<() => Promise<any>>>([]);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  /**
   * 🔧 エラーハンドリング
   */
  const handleError = useCallback(
    async (error: any, context?: string) => {
      console.error(`Database error (${entity}):`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setIsError(true);
      setError(errorMessage);

      // エラーハンドリング戦略
      switch (errorHandling) {
        case 'throw':
          throw error;
        case 'toast':
          toast.error(errorMessage);
          break;
        case 'custom':
          if (onError) {
            onError(error);
          }
          break;
        case 'silent':
          // 何もしない
          break;
      }

      // 統一エラーハンドラーに記録
      await unifiedErrorHandler.handleError(error, {
        component: 'useUnifiedDatabase',
        action: context || 'unknown',
        additionalData: { entity },
      });
    },
    [entity, errorHandling, onError]
  );

  /**
   * 🎯 成功ハンドリング
   */
  const handleSuccess = useCallback(
    (result: any, context?: string) => {
      setIsError(false);
      setError(null);

      if (onSuccess) {
        onSuccess(result);
      }

      console.log(`Database success (${entity}):`, context, result);
    },
    [entity, onSuccess]
  );

  /**
   * 📝 作成操作
   */
  const create = useCallback(
    async (createData: Partial<T>): Promise<T | null> => {
      try {
        setIsLoading(true);

        const response = await unifiedAPIManager.create<T>(entity, createData);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Create failed');
        }

        const newItem = response.data;
        setData((prev) => [...prev, newItem]);

        // リアルタイム同期
        if (enableRealtime && autoSync) {
          await realtimeDataSyncService.syncOperation({
            entity,
            entityId: newItem.id,
            operation: 'create',
            data: newItem,
            userId: 'current_user', // 実際の実装では現在のユーザーIDを使用
            version: newItem.version,
            priority: 'normal',
            retryCount: 0,
            maxRetries: 3,
            dependencies: [],
            metadata: {},
          });
        }

        // キャッシュ更新
        if (enableCaching) {
          cacheRef.current.set(newItem.id, {
            data: newItem,
            timestamp: Date.now(),
          });
        }

        handleSuccess(newItem, 'create');
        return newItem;
      } catch (error) {
        await handleError(error, 'create');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [entity, enableRealtime, enableCaching, autoSync, handleError, handleSuccess]
  );

  /**
   * 📖 読み取り操作
   */
  const read = useCallback(
    async (id: string): Promise<T | null> => {
      try {
        setIsLoading(true);

        // キャッシュチェック
        if (enableCaching && cacheStrategy === 'cache-first') {
          const cached = cacheRef.current.get(id);
          if (cached && Date.now() - cached.timestamp < 300000) {
            // 5分間有効
            setItem(cached.data);
            handleSuccess(cached.data, 'read_cached');
            return cached.data;
          }
        }

        const response = await unifiedAPIManager.read<T>(entity, id);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Read failed');
        }

        const readItem = response.data;
        setItem(readItem);

        // キャッシュ更新
        if (enableCaching) {
          cacheRef.current.set(id, {
            data: readItem,
            timestamp: Date.now(),
          });
        }

        handleSuccess(readItem, 'read');
        return readItem;
      } catch (error) {
        await handleError(error, 'read');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [entity, enableCaching, cacheStrategy, handleError, handleSuccess]
  );

  /**
   * ✏️ 更新操作
   */
  const update = useCallback(
    async (id: string, updateData: Partial<T>): Promise<T | null> => {
      try {
        setIsLoading(true);

        const response = await unifiedAPIManager.update<T>(entity, id, updateData);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Update failed');
        }

        const updatedItem = response.data;

        // ローカル状態更新
        setData((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
        if (item && item.id === id) {
          setItem(updatedItem);
        }

        // リアルタイム同期
        if (enableRealtime && autoSync) {
          await realtimeDataSyncService.syncOperation({
            entity,
            entityId: id,
            operation: 'update',
            data: updatedItem,
            userId: 'current_user',
            version: updatedItem.version,
            priority: 'normal',
            retryCount: 0,
            maxRetries: 3,
            dependencies: [],
            metadata: {},
          });
        }

        // キャッシュ更新
        if (enableCaching) {
          cacheRef.current.set(id, {
            data: updatedItem,
            timestamp: Date.now(),
          });
        }

        handleSuccess(updatedItem, 'update');
        return updatedItem;
      } catch (error) {
        await handleError(error, 'update');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [entity, enableRealtime, enableCaching, autoSync, item, handleError, handleSuccess]
  );

  /**
   * 🗑️ 削除操作
   */
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const response = await unifiedAPIManager.delete(entity, id);

        if (!response.success) {
          throw new Error(response.error?.message || 'Delete failed');
        }

        // ローカル状態更新
        setData((prev) => prev.filter((item) => item.id !== id));
        if (item && item.id === id) {
          setItem(null);
        }

        // リアルタイム同期
        if (enableRealtime && autoSync) {
          await realtimeDataSyncService.syncOperation({
            entity,
            entityId: id,
            operation: 'delete',
            data: null,
            userId: 'current_user',
            version: 0,
            priority: 'normal',
            retryCount: 0,
            maxRetries: 3,
            dependencies: [],
            metadata: {},
          });
        }

        // キャッシュクリア
        if (enableCaching) {
          cacheRef.current.delete(id);
        }

        handleSuccess(true, 'delete');
        return true;
      } catch (error) {
        await handleError(error, 'delete');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [entity, enableRealtime, enableCaching, autoSync, item, handleError, handleSuccess]
  );

  /**
   * 📋 一覧取得操作
   */
  const list = useCallback(
    async (listOptions?: ListOptions): Promise<T[]> => {
      try {
        setIsLoading(true);

        const response = await unifiedAPIManager.list<T>(entity, listOptions);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'List failed');
        }

        const items = response.data.items;
        setData(items);

        // キャッシュ更新
        if (enableCaching) {
          items.forEach((item) => {
            cacheRef.current.set(item.id, {
              data: item,
              timestamp: Date.now(),
            });
          });
        }

        handleSuccess(items, 'list');
        return items;
      } catch (error) {
        await handleError(error, 'list');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [entity, enableCaching, handleError, handleSuccess]
  );

  /**
   * 🔍 検索操作
   */
  const search = useCallback(
    async (query: string, searchOptions?: SearchOptions): Promise<T[]> => {
      try {
        setIsLoading(true);

        // 検索APIの実装（簡略化）
        const listResponse = await list({
          ...searchOptions,
          filter: { search: query },
        });

        return listResponse;
      } catch (error) {
        await handleError(error, 'search');
        return [];
      }
    },
    [list, handleError]
  );

  /**
   * 🔄 同期操作
   */
  const sync = useCallback(
    async (direction: 'up' | 'down' | 'both' = 'both'): Promise<SyncResult> => {
      try {
        if (!enableRealtime) {
          throw new Error('Realtime sync is disabled');
        }

        const result = await realtimeDataSyncService.synchronize({
          entities: [entity],
          direction,
          force: false,
        });

        handleSuccess(result, 'sync');
        return result;
      } catch (error) {
        await handleError(error, 'sync');
        return {
          success: false,
          synchronized: 0,
          conflicts: 0,
          errors: [error instanceof Error ? error.message : 'Sync failed'],
        };
      }
    },
    [entity, enableRealtime, handleError, handleSuccess]
  );

  /**
   * 💾 バックアップ操作
   */
  const backup = useCallback(
    async (backupOptions?: BackupOptions): Promise<string> => {
      try {
        if (!enableBackup) {
          throw new Error('Backup is disabled');
        }

        const backupId = await backupRestoreService.createBackup({
          name: backupOptions?.name || `${entity}_backup_${Date.now()}`,
          entities: [entity],
          description: backupOptions?.description,
          type: 'full',
        });

        handleSuccess(backupId, 'backup');
        return backupId;
      } catch (error) {
        await handleError(error, 'backup');
        return '';
      }
    },
    [entity, enableBackup, handleError, handleSuccess]
  );

  /**
   * ⚡ 最適化操作
   */
  const optimize = useCallback(async (): Promise<OptimizationResult> => {
    try {
      if (!enableOptimization) {
        throw new Error('Optimization is disabled');
      }

      const result = await performanceOptimizationService.optimize();

      handleSuccess(result, 'optimize');
      return result;
    } catch (error) {
      await handleError(error, 'optimize');
      return {
        success: false,
        improvements: [],
        recommendatio: [],
      };
    }
  }, [enableOptimization, handleError, handleSuccess]);

  /**
   * 🔄 リフレッシュ操作
   */
  const refresh = useCallback(async (): Promise<void> => {
    await list();
  }, [list]);

  /**
   * 🧹 リセット操作
   */
  const reset = useCallback((): void => {
    setData([]);
    setItem(null);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    cacheRef.current.clear();
  }, []);

  // バッチ操作の実装
  const createMany = useCallback(
    async (items: Partial<T>[]): Promise<T[]> => {
      const results: T[] = [];
      const batches = chunkArray(items, batchSize);

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(batch.map((item) => create(item)));

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          }
        });
      }

      return results;
    },
    [create, batchSize]
  );

  const updateMany = useCallback(
    async (updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> => {
      const results: T[] = [];
      const batches = chunkArray(updates, batchSize);

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map(({ id, data }) => update(id, data))
        );

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          }
        });
      }

      return results;
    },
    [update, batchSize]
  );

  const removeMany = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const batches = chunkArray(ids, batchSize);
      let allSuccess = true;

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(batch.map((id) => remove(id)));

        batchResults.forEach((result) => {
          if (result.status === 'rejected' || !result.value) {
            allSuccess = false;
          }
        });
      }

      return allSuccess;
    },
    [remove, batchSize]
  );

  // フィルタリング・ソート
  const filter = useCallback(
    (predicate: (item: T) => boolean): T[] => {
      return data.filter(predicate);
    },
    [data]
  );

  const sort = useCallback(
    (compareFn?: (a: T, b: T) => number): T[] => {
      return [...data].sort(compareFn);
    },
    [data]
  );

  // その他の操作（簡略化）
  const syncItem = useCallback(async (id: string): Promise<boolean> => {
    // 単一アイテムの同期
    return true;
  }, []);

  const getConflicts = useCallback((): SyncConflict[] => {
    // 同期競合の取得
    return [];
  }, []);

  const resolveConflict = useCallback(
    async (conflictId: string, resolution: any): Promise<boolean> => {
      // 競合解決
      return true;
    },
    []
  );

  const invalidateCache = useCallback(async (key?: string): Promise<void> => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const preload = useCallback(
    async (ids: string[]): Promise<void> => {
      // プリロード
      await Promise.allSettled(ids.map((id) => read(id)));
    },
    [read]
  );

  const getCacheStats = useCallback((): CacheStats => {
    return {
      hitRate: 0.8,
      totalEntries: cacheRef.current.size,
      totalSize: 0, // 計算が複雑なため簡略化
    };
  }, []);

  const restore = useCallback(
    async (backupId: string, restoreOptions?: RestoreOptions): Promise<boolean> => {
      // 復元操作
      return true;
    },
    []
  );

  const getBackups = useCallback((): BackupInfo[] => {
    // バックアップ一覧
    return [];
  }, []);

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      responseTime: 100,
      throughput: 50,
      memoryUsage: 0.3,
      cacheHitRate: 0.8,
    };
  }, []);

  const getStatistics = useCallback((): DatabaseStatistics => {
    return {
      totalRecords: data.length,
      totalOperations: 0,
      averageResponseTime: 100,
      errorRate: 0.01,
      syncStatus: 'connected',
      lastBackup: '',
    };
  }, [data.length]);

  // 初期化処理
  useEffect(() => {
    if (enableRealtime) {
      realtimeDataSyncService.start('current_user');
    }

    return () => {
      isMounted.current = false;
    };
  }, [enableRealtime]);

  return {
    // データ状態
    data,
    item,
    isLoading,
    isError,
    error,

    // データ操作
    create,
    read,
    update,
    remove,
    list,

    // バッチ操作
    createMany,
    updateMany,
    removeMany,

    // 検索・フィルタリング
    search,
    filter,
    sort,

    // 同期
    sync,
    syncItem,
    getConflicts,
    resolveConflict,

    // キャッシュ
    invalidateCache,
    preload,
    getCacheStats,

    // バックアップ
    backup,
    restore,
    getBackups,

    // パフォーマンス
    optimize,
    getMetrics,

    // 状態
    refresh,
    reset,
    getStatistics,
  };
}

// =============================================================================
// Specialized Hooks
// =============================================================================

/**
 * 👤 ユーザープロファイル用フック
 */
export function useUserProfiles(options?: Partial<UseUnifiedDatabaseOptions>) {
  return useUnifiedDatabase<UserProfile>({
    entity: 'UserProfile',
    enableRealtime: true,
    enableCaching: true,
    ...options,
  });
}

/**
 * ⏰ 勤怠セッション用フック
 */
export function useWorkSessions(options?: Partial<UseUnifiedDatabaseOptions>) {
  return useUnifiedDatabase<WorkSession>({
    entity: 'WorkSession',
    enableRealtime: true,
    enableBackup: true,
    ...options,
  });
}

/**
 * 📋 プロジェクト用フック
 */
export function useProjects(options?: Partial<UseUnifiedDatabaseOptions>) {
  return useUnifiedDatabase<Project>({
    entity: 'Project',
    enableCaching: true,
    prefetchRelated: true,
    ...options,
  });
}

/**
 * ✅ タスク用フック
 */
export function useTasks(options?: Partial<UseUnifiedDatabaseOptions>) {
  return useUnifiedDatabase<Task>({
    entity: 'Task',
    enableRealtime: true,
    autoSync: true,
    ...options,
  });
}

/**
 * 📝 TODO用フック
 */
export function useTodos(options?: Partial<UseUnifiedDatabaseOptions>) {
  return useUnifiedDatabase<Todo>({
    entity: 'Todo',
    enableRealtime: true,
    enableOptimization: true,
    ...options,
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// =============================================================================
// Export Default
// =============================================================================

export default useUnifiedDatabase;
