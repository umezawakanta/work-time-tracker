/**
 * 🔄 統合ダッシュボード同期フック
 * すべてのダッシュボード間のリアルタイム同期を管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import {
  unifiedDashboardService,
  UnifiedDashboardData,
} from '@/services/integration/UnifiedDashboardService';
import { integratedGamificationService } from '@/services/gamification/IntegratedGamificationService';
import { aiGamificationService } from '@/services/gamification/AIGamificationService';

export interface DashboardSyncStatus {
  isConnected: boolean;
  lastSync: string;
  syncCount: number;
  errorCount: number;
  latency: number;
  syncedComponents: string[];
  pendingUpdates: number;
}

export interface UnifiedDashboardState {
  // Data from all systems
  unifiedData: UnifiedDashboardData | null;

  // Sync status
  syncStatus: DashboardSyncStatus;

  // Component states
  homeState: any;
  taskState: any;
  gamificationState: any;
  aiState: any;

  // UI states
  activeView: string;
  isLoading: boolean;
  error: string | null;
}

export interface UseUnifiedDashboardSyncResult {
  // Current state
  state: UnifiedDashboardState;

  // Sync operations
  startSync: () => void;
  stopSync: () => void;
  forceSync: () => Promise<void>;

  // Component updates
  updateComponent: (component: string, data: any) => void;

  // Navigation
  navigateToView: (view: string) => void;

  // Event handlers
  onTaskComplete: (taskId: string) => void;
  onGamificationUpdate: (data: any) => void;
  onAIAnalysis: (data: any) => void;
}

export const useUnifiedDashboardSync = (
  userId: string = 'current_user'
): UseUnifiedDashboardSyncResult => {
  // State Management
  const [state, setState] = useState<UnifiedDashboardState>({
    unifiedData: null,
    syncStatus: {
      isConnected: false,
      lastSync: '',
      syncCount: 0,
      errorCount: 0,
      latency: 0,
      syncedComponents: [],
      pendingUpdates: 0,
    },
    homeState: {},
    taskState: {},
    gamificationState: {},
    aiState: {},
    activeView: 'overview',
    isLoading: true,
    error: null,
  });

  // Refs for sync management
  const syncInterval = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const pendingUpdates = useRef<any[]>([]);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);

  /**
   * 🚀 同期システムの初期化
   */
  useEffect(() => {
    initializeSync();

    return () => {
      cleanup();
    };
  }, [userId]);

  /**
   * 🔄 同期の開始
   */
  const startSync = useCallback(() => {
    if (syncInterval.current) return;

    syncInterval.current = setInterval(async () => {
      await performSync();
    }, 5000); // 5秒間隔で同期

    setState((prev) => ({
      ...prev,
      syncStatus: {
        ...prev.syncStatus,
        isConnected: true,
      },
    }));

    console.log('🔄 Unified dashboard sync started');
  }, []);

  /**
   * ⏹️ 同期の停止
   */
  const stopSync = useCallback(() => {
    if (syncInterval.current) {
      clearInterval(syncInterval.current);
      syncInterval.current = null;
    }

    setState((prev) => ({
      ...prev,
      syncStatus: {
        ...prev.syncStatus,
        isConnected: false,
      },
    }));

    console.log('⏹️ Unified dashboard sync stopped');
  }, []);

  /**
   * 🔃 強制同期
   */
  const forceSync = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await performFullSync();
      setState((prev) => ({
        ...prev,
        syncStatus: {
          ...prev.syncStatus,
          lastSync: new Date().toISOString(),
          syncCount: prev.syncStatus.syncCount + 1,
        },
      }));
    } catch (error) {
      console.error('Force sync failed:', error);
      setState((prev) => ({
        ...prev,
        error: 'Sync failed',
        syncStatus: {
          ...prev.syncStatus,
          errorCount: prev.syncStatus.errorCount + 1,
        },
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  /**
   * 📦 コンポーネント更新
   */
  const updateComponent = useCallback((component: string, data: any) => {
    setState((prev) => {
      const newState = { ...prev };

      switch (component) {
        case 'home':
          newState.homeState = { ...prev.homeState, ...data };
          break;
        case 'tasks':
          newState.taskState = { ...prev.taskState, ...data };
          break;
        case 'gamification':
          newState.gamificationState = { ...prev.gamificationState, ...data };
          break;
        case 'ai':
          newState.aiState = { ...prev.aiState, ...data };
          break;
      }

      return newState;
    });

    // Update queue for batch processing
    pendingUpdates.current.push({
      component,
      data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  /**
   * 🧭 ビューナビゲーション
   */
  const navigateToView = useCallback(
    (view: string) => {
      setState((prev) => ({
        ...prev,
        activeView: view,
      }));

      // Record navigation event
      updateComponent('navigation', { activeView: view, timestamp: new Date().toISOString() });
    },
    [updateComponent]
  );

  /**
   * ✅ タスク完了ハンドラー
   */
  const onTaskComplete = useCallback(
    async (taskId: string) => {
      try {
        // Update task state
        updateComponent('tasks', {
          lastCompletedTask: taskId,
          timestamp: new Date().toISOString(),
        });

        // Trigger gamification update
        await triggerGamificationUpdate('task_complete', { taskId });

        // Force sync to update all dashboards
        await forceSync();
      } catch (error) {
        console.error('Task completion sync failed:', error);
      }
    },
    [updateComponent, forceSync]
  );

  /**
   * 🎮 ゲーミフィケーション更新ハンドラー
   */
  const onGamificationUpdate = useCallback(
    async (data: any) => {
      updateComponent('gamification', data);

      // Sync with gamification service
      try {
        if (data.type === 'xp_gained') {
          // Handle XP gain
        } else if (data.type === 'level_up') {
          // Handle level up
        }
      } catch (error) {
        console.error('Gamification update sync failed:', error);
      }
    },
    [updateComponent]
  );

  /**
   * 🤖 AI分析ハンドラー
   */
  const onAIAnalysis = useCallback(
    async (data: any) => {
      updateComponent('ai', {
        lastAnalysis: data,
        timestamp: new Date().toISOString(),
      });

      // Update AI state across all dashboards
      await forceSync();
    },
    [updateComponent, forceSync]
  );

  // Private methods
  const initializeSync = async () => {
    if (isInitialized.current) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Initialize unified dashboard service
      const unifiedData = await unifiedDashboardService.initialize(userId);

      // Initialize component states
      await Promise.all([
        initializeTaskState(),
        initializeGamificationState(),
        initializeAIState(),
      ]);

      setState((prev) => ({
        ...prev,
        unifiedData,
        isLoading: false,
        syncStatus: {
          ...prev.syncStatus,
          syncedComponents: ['home', 'tasks', 'gamification', 'ai'],
          lastSync: new Date().toISOString(),
        },
      }));

      isInitialized.current = true;

      // Start automatic sync
      startSync();

      console.log('✅ Unified dashboard sync initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard sync initialization failed:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Initialization failed',
      }));
    }
  };

  const performSync = async () => {
    const startTime = Date.now();

    try {
      // Process pending updates
      if (pendingUpdates.current.length > 0) {
        const updates = [...pendingUpdates.current];
        pendingUpdates.current = [];

        // Apply updates to unified service
        for (const update of updates) {
          await applyUpdate(update);
        }
      }

      // Update sync status
      const latency = Date.now() - startTime;
      setState((prev) => ({
        ...prev,
        syncStatus: {
          ...prev.syncStatus,
          lastSync: new Date().toISOString(),
          syncCount: prev.syncStatus.syncCount + 1,
          latency,
          pendingUpdates: pendingUpdates.current.length,
        },
      }));
    } catch (error) {
      console.error('Sync error:', error);
      setState((prev) => ({
        ...prev,
        syncStatus: {
          ...prev.syncStatus,
          errorCount: prev.syncStatus.errorCount + 1,
        },
      }));
    }
  };

  const performFullSync = async () => {
    // Refresh all data from services
    const [unifiedData] = await Promise.all([
      unifiedDashboardService.initialize(userId),
      dispatch(fetchTodoItems()),
    ]);

    setState((prev) => ({
      ...prev,
      unifiedData,
    }));
  };

  const initializeTaskState = async () => {
    // Initialize task-related state
    await dispatch(fetchTodoItems());
  };

  const initializeGamificationState = async () => {
    // Initialize gamification state
    try {
      await integratedGamificationService.initializePlayer(userId);
    } catch (error) {
      console.error('Gamification state initialization failed:', error);
    }
  };

  const initializeAIState = async () => {
    // Initialize AI state
    try {
      // Any AI-specific initialization
    } catch (error) {
      console.error('AI state initialization failed:', error);
    }
  };

  const applyUpdate = async (update: any) => {
    // Apply specific update to the system
    switch (update.component) {
      case 'tasks':
        // Handle task updates
        break;
      case 'gamification':
        // Handle gamification updates
        break;
      case 'ai':
        // Handle AI updates
        break;
    }
  };

  const triggerGamificationUpdate = async (type: string, data: any) => {
    // Trigger gamification system update
    try {
      if (type === 'task_complete') {
        // Process task completion in gamification system
      }
    } catch (error) {
      console.error('Gamification trigger failed:', error);
    }
  };

  const cleanup = () => {
    if (syncInterval.current) {
      clearInterval(syncInterval.current);
    }
    unifiedDashboardService.cleanup();
  };

  return {
    state,
    startSync,
    stopSync,
    forceSync,
    updateComponent,
    navigateToView,
    onTaskComplete,
    onGamificationUpdate,
    onAIAnalysis,
  };
};
