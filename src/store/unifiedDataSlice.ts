import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 統一データ構造の型定義
export interface UnifiedSystemMetrics {
  // システム全体の統計
  totalUsers: number;
  activeFeatures: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
  lastUpdated: string;
}

export interface UnifiedTaskMetrics {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  weeklyProgress: number;
  averageCompletionTime: number;
  streakDays: number;
  urgentTasks: number;
  todayProgress: number;
}

export interface UnifiedGamificationMetrics {
  playerLevel: number;
  totalXP: number;
  todayXP: number;
  streakDays: number;
  badges: number;
  achievements: number;
  rank: string;
  nextLevelProgress: number;
  weeklyXP: number;
  monthlyXP: number;
}

export interface UnifiedPerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastOptimization: string;
}

export interface UnifiedRealtimeData {
  activeUsers: number;
  currentSessions: number;
  recentActivities: RecentActivity[];
  systemEvents: SystemEvent[];
  notifications: Notification[];
}

export interface RecentActivity {
  id: string;
  type: 'task_completed' | 'badge_earned' | 'level_up' | 'streak_milestone';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  component?: string;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UnifiedDashboardState {
  // コアメトリクス
  systemMetrics: UnifiedSystemMetrics;
  taskMetrics: UnifiedTaskMetrics;
  gamificationMetrics: UnifiedGamificationMetrics;
  performanceMetrics: UnifiedPerformanceMetrics;
  realtimeData: UnifiedRealtimeData;

  // 状態管理
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncTime: string | null;
  error: string | null;

  // ユーザー設定
  userPreferences: {
    theme: 'light' | 'dark' | 'auto';
    refreshInterval: number;
    notificationsEnabled: boolean;
    compactMode: boolean;
    autoSync: boolean;
  };

  // キャッシュとパフォーマンス
  cache: {
    [key: string]: {
      data: any;
      timestamp: string;
      ttl: number;
    };
  };

  // 接続状態
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

// 初期状態
const initialState: UnifiedDashboardState = {
  systemMetrics: {
    totalUsers: 1,
    activeFeatures: 0,
    systemHealth: 'good',
    uptime: 99.9,
    lastUpdated: new Date().toISOString(),
  },
  taskMetrics: {
    totalTasks: 0,
    completedToday: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    weeklyProgress: 0,
    averageCompletionTime: 0,
    streakDays: 0,
    urgentTasks: 0,
    todayProgress: 0,
  },
  gamificationMetrics: {
    playerLevel: 1,
    totalXP: 0,
    todayXP: 0,
    streakDays: 0,
    badges: 0,
    achievements: 0,
    rank: 'Beginner',
    nextLevelProgress: 0,
    weeklyXP: 0,
    monthlyXP: 0,
  },
  performanceMetrics: {
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
    lastOptimization: new Date().toISOString(),
  },
  realtimeData: {
    activeUsers: 1,
    currentSessions: 1,
    recentActivities: [],
    systemEvents: [],
    notifications: [],
  },
  isLoading: false,
  isRefreshing: false,
  lastSyncTime: null,
  error: null,
  userPreferences: {
    theme: 'auto',
    refreshInterval: 30000, // 30秒
    notificationsEnabled: true,
    compactMode: false,
    autoSync: true,
  },
  cache: {},
  connectionStatus: 'connected',
  syncStatus: 'idle',
};

// 非同期アクション
export const initializeUnifiedSystem = createAsyncThunk(
  'unifiedData/initialize',
  async (userId: string, { rejectWithValue }) => {
    try {
      // 統一システムの初期化
      console.log('🚀 Unified System initialization started for user:', userId);

      // 各種データの並列取得
      const [taskData, gamificationData, performanceData] = await Promise.all([
        fetchTaskMetrics(userId),
        fetchGamificationMetrics(userId),
        fetchPerformanceMetrics(),
      ]);

      return {
        taskMetrics: taskData,
        gamificationMetrics: gamificationData,
        performanceMetrics: performanceData,
        systemMetrics: {
          totalUsers: 1,
          activeFeatures: 25,
          systemHealth: 'excellent' as const,
          uptime: 99.9,
          lastUpdated: new Date().toISOString(),
        },
        realtimeData: {
          activeUsers: 1,
          currentSessions: 1,
          recentActivities: [],
          systemEvents: [
            {
              id: 'init',
              type: 'success' as const,
              message: 'Unified system initialized successfully',
              timestamp: new Date().toISOString(),
              component: 'UnifiedDataSystem',
            },
          ],
          notifications: [],
        },
      };
    } catch (error) {
      console.error('❌ Unified system initialization failed:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const refreshUnifiedData = createAsyncThunk(
  'unifiedData/refresh',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { unifiedData: UnifiedDashboardState };

      // キャッシュチェック
      const cacheKey = `unified_data_${userId}`;
      const cached = state.unifiedData.cache[cacheKey];

      if (cached && Date.now() - new Date(cached.timestamp).getTime() < cached.ttl) {
        console.log('📊 Using cached unified data');
        return cached.data;
      }

      // 新しいデータを取得
      const [taskData, gamificationData, performanceData] = await Promise.all([
        fetchTaskMetrics(userId),
        fetchGamificationMetrics(userId),
        fetchPerformanceMetrics(),
      ]);

      return {
        taskMetrics: taskData,
        gamificationMetrics: gamificationData,
        performanceMetrics: performanceData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Refresh failed');
    }
  }
);

// ヘルパー関数
async function fetchTaskMetrics(userId: string): Promise<UnifiedTaskMetrics> {
  // 既存のtodoSliceやサービスからデータを取得
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const today = new Date().toDateString();

  const completedToday = todos.filter(
    (todo: any) =>
      todo.completed && todo.completedDate && new Date(todo.completedDate).toDateString() === today
  ).length;

  const pendingTasks = todos.filter((todo: any) => !todo.completed).length;
  const overdueTasks = todos.filter(
    (todo: any) => !todo.completed && todo.deadline && new Date(todo.deadline) < new Date()
  ).length;

  const completionRate =
    todos.length > 0
      ? (todos.filter((todo: any) => todo.completed).length / todos.length) * 100
      : 0;

  return {
    totalTasks: todos.length,
    completedToday,
    pendingTasks,
    overdueTasks,
    completionRate: Math.round(completionRate),
    weeklyProgress: 75, // 計算ロジックを後で実装
    averageCompletionTime: 2.5, // 平均完了時間（時間）
    streakDays: 7, // 連続達成日数
    urgentTasks: todos.filter((todo: any) => !todo.completed && todo.priority >= 4).length,
    todayProgress: 85, // 今日の進捗
  };
}

async function fetchGamificationMetrics(userId: string): Promise<UnifiedGamificationMetrics> {
  // ゲーミフィケーションサービスからデータを取得
  const level = parseInt(localStorage.getItem('playerLevel') || '1');
  const totalXP = parseInt(localStorage.getItem('totalXP') || '0');

  return {
    playerLevel: level,
    totalXP,
    todayXP: 150,
    streakDays: 7,
    badges: 12,
    achievements: 8,
    rank: level >= 10 ? 'Expert' : level >= 5 ? 'Intermediate' : 'Beginner',
    nextLevelProgress: ((totalXP % 1000) / 1000) * 100,
    weeklyXP: 750,
    monthlyXP: 3200,
  };
}

async function fetchPerformanceMetrics(): Promise<UnifiedPerformanceMetrics> {
  return {
    pageLoadTime: 1.2,
    apiResponseTime: 180,
    errorRate: 0.1,
    memoryUsage: 45,
    cpuUsage: 12,
    activeConnections: 1,
    lastOptimization: new Date().toISOString(),
  };
}

// Redux Slice
const unifiedDataSlice = createSlice({
  name: 'unifiedData',
  initialState,
  reducers: {
    updateSystemHealth: (state, action: PayloadAction<UnifiedSystemMetrics['systemHealth']>) => {
      state.systemMetrics.systemHealth = action.payload;
      state.systemMetrics.lastUpdated = new Date().toISOString();
    },

    updateConnectionStatus: (
      state,
      action: PayloadAction<'connected' | 'disconnected' | 'reconnecting'>
    ) => {
      state.connectionStatus = action.payload;
    },

    addRecentActivity: (state, action: PayloadAction<RecentActivity>) => {
      state.realtimeData.recentActivities.unshift(action.payload);
      if (state.realtimeData.recentActivities.length > 50) {
        state.realtimeData.recentActivities = state.realtimeData.recentActivities.slice(0, 50);
      }
    },

    addSystemEvent: (state, action: PayloadAction<SystemEvent>) => {
      state.realtimeData.systemEvents.unshift(action.payload);
      if (state.realtimeData.systemEvents.length > 100) {
        state.realtimeData.systemEvents = state.realtimeData.systemEvents.slice(0, 100);
      }
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      state.realtimeData.notifications.unshift(action.payload);
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.realtimeData.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<UnifiedDashboardState['userPreferences']>>
    ) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },

    setCacheData: (state, action: PayloadAction<{ key: string; data: any; ttl: number }>) => {
      const { key, data, ttl } = action.payload;
      state.cache[key] = {
        data,
        timestamp: new Date().toISOString(),
        ttl,
      };
    },

    clearCache: (state) => {
      state.cache = {};
    },

    resetError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // 初期化
      .addCase(initializeUnifiedSystem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncStatus = 'syncing';
      })
      .addCase(initializeUnifiedSystem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskMetrics = action.payload.taskMetrics;
        state.gamificationMetrics = action.payload.gamificationMetrics;
        state.performanceMetrics = action.payload.performanceMetrics;
        state.systemMetrics = action.payload.systemMetrics;
        state.realtimeData = action.payload.realtimeData;
        state.lastSyncTime = new Date().toISOString();
        state.syncStatus = 'success';
        state.connectionStatus = 'connected';
      })
      .addCase(initializeUnifiedSystem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncStatus = 'error';
      })

      // データ更新
      .addCase(refreshUnifiedData.pending, (state) => {
        state.isRefreshing = true;
        state.syncStatus = 'syncing';
      })
      .addCase(refreshUnifiedData.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.taskMetrics = action.payload.taskMetrics;
        state.gamificationMetrics = action.payload.gamificationMetrics;
        state.performanceMetrics = action.payload.performanceMetrics;
        state.lastSyncTime = action.payload.timestamp;
        state.syncStatus = 'success';
      })
      .addCase(refreshUnifiedData.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload as string;
        state.syncStatus = 'error';
      });
  },
});

export const {
  updateSystemHealth,
  updateConnectionStatus,
  addRecentActivity,
  addSystemEvent,
  addNotification,
  markNotificationAsRead,
  updateUserPreferences,
  setCacheData,
  clearCache,
  resetError,
} = unifiedDataSlice.actions;

export default unifiedDataSlice.reducer;
