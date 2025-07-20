/**
 * 🚀 究極統合ダッシュボード
 * ホーム、統合ダッシュボード、タスク管理、ゲーミフィケーションの完全統合
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeGamificationTracking } from '@/hooks/useRealtimeGamificationTracking';
import { useGamifiedTodoCompletion } from '@/components/dailyToDoReminder/hooks/useGamifiedTodoCompletion';
import {
  unifiedDashboardService,
  UnifiedDashboardData,
} from '@/services/integration/UnifiedDashboardService';
import { integratedGamificationService } from '@/services/gamification/IntegratedGamificationService';
import {
  Crown,
  Brain,
  CheckSquare,
  Trophy,
  Zap,
  Star,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  Shield,
  Activity,
  Clock,
  Flame,
  Plus,
  Calendar,
  Home,
  Grid3X3,
  Layers,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Bell,
  Menu,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Cpu,
  Network,
  Database,
  Globe,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Integrated Components
import { IntegratedGamificationDashboard } from '@/components/integrated/IntegratedGamificationDashboard';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import { AIEnhancedGamification } from '@/components/gamification/AIEnhancedGamification';
import { IntegratedAutomationDashboard } from '@/components/automation/IntegratedAutomationDashboard';

interface SuperIntegratedDashboardProps {
  userId?: string;
  defaultView?: 'overview' | 'tasks' | 'gamification' | 'ai' | 'analytics' | 'settings';
  compactMode?: boolean;
  enableCustomization?: boolean;
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'activity' | 'ai_insight' | 'quick_actions';
  title: string;
  component: React.ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl';
  visible: boolean;
  position: { x: number; y: number };
  refreshRate?: number;
}

export const SuperIntegratedDashboard: React.FC<SuperIntegratedDashboardProps> = ({
  userId = 'current_user',
  defaultView = 'overview',
  compactMode = false,
  enableCustomization = true,
}) => {
  // State Management
  const [activeView, setActiveView] = useState<string>(defaultView);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unifiedData, setUnifiedData] = useState<UnifiedDashboardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth and Redux
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // Custom Hooks
  const { trackingData, isTracking, startTracking, stopTracking, getSessionSummary } =
    useRealtimeGamificationTracking();

  const { completeTask, isProcessing, lastRewards, playerLevel, totalXP, streakDays } =
    useGamifiedTodoCompletion();

  // Computed Values
  const todayCompletedTasks = useMemo(() => {
    const today = new Date().toDateString();
    return todos.filter(
      (todo) =>
        todo.completed &&
        todo.completedDate &&
        new Date(todo.completedDate).toDateString() === today
    ).length;
  }, [todos]);

  const pendingTasks = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  const urgentTasks = useMemo(() => {
    return todos.filter((todo) => !todo.completed && todo.priority >= 4).length;
  }, [todos]);

  // Initialize Dashboard
  useEffect(() => {
    initializeSuperDashboard();
  }, [userId]);

  useEffect(() => {
    dispatch(fetchTodoItems());
  }, [dispatch]);

  const initializeSuperDashboard = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Super Integrated Dashboard initialization started');

      // Initialize unified dashboard service
      const dashboardData = await unifiedDashboardService.initialize(userId);
      setUnifiedData(dashboardData);

      // Initialize default widgets
      const defaultWidgets = generateDefaultWidgets();
      setWidgets(defaultWidgets);

      // Setup event listeners
      unifiedDashboardService.on('realtime_updated', handleRealtimeUpdate);
      unifiedDashboardService.on('dashboard_initialized', handleDashboardUpdate);

      // Start real-time tracking if not already active
      if (!isTracking) {
        startTracking();
      }

      console.log('✅ Super Integrated Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Super dashboard initialization failed:', error);
      toast.error('ダッシュボードの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      if (unifiedData) {
        const newData = await unifiedDashboardService.initialize(userId);
        setUnifiedData(newData);
        toast.success('ダッシュボードを更新しました');
      }
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      toast.error('更新に失敗しました');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRealtimeUpdate = useCallback(
    (data: any) => {
      if (unifiedData) {
        setUnifiedData((prev) => ({
          ...prev!,
          realtimeActivity: data,
        }));
      }
    },
    [unifiedData]
  );

  const handleDashboardUpdate = useCallback((data: UnifiedDashboardData) => {
    setUnifiedData(data);
  }, []);

  const generateDefaultWidgets = (): DashboardWidget[] => {
    return [
      {
        id: 'task-overview',
        type: 'metric',
        title: 'タスク概要',
        component: <TaskOverviewWidget />,
        size: 'md',
        visible: true,
        position: { x: 0, y: 0 },
        refreshRate: 30,
      },
      {
        id: 'gamification-stats',
        type: 'metric',
        title: 'ゲーミフィケーション',
        component: <GamificationStatsWidget />,
        size: 'md',
        visible: true,
        position: { x: 1, y: 0 },
        refreshRate: 30,
      },
      {
        id: 'ai-insights',
        type: 'ai_insight',
        title: 'AI洞察',
        component: <AIInsightsWidget />,
        size: 'lg',
        visible: true,
        position: { x: 0, y: 1 },
        refreshRate: 60,
      },
      {
        id: 'recent-activity',
        type: 'activity',
        title: '最近のアクティビティ',
        component: <RecentActivityWidget />,
        size: 'md',
        visible: true,
        position: { x: 2, y: 0 },
        refreshRate: 15,
      },
      {
        id: 'quick-actions',
        type: 'quick_actions',
        title: 'クイックアクション',
        component: <QuickActionsWidget />,
        size: 'sm',
        visible: true,
        position: { x: 0, y: 2 },
        refreshRate: 0,
      },
      {
        id: 'performance-metrics',
        type: 'chart',
        title: 'パフォーマンス',
        component: <PerformanceMetricsWidget />,
        size: 'lg',
        visible: true,
        position: { x: 1, y: 1 },
        refreshRate: 60,
      },
    ];
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">究極統合ダッシュボード初期化中</h3>
            <p className="text-sm text-gray-600">すべてのシステムを統合しています...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <Shield className="w-4 h-4" />
          <AlertDescription>
            究極統合ダッシュボードを利用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 to-blue-50',
        compactMode && 'p-2',
        !compactMode && 'p-6'
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                究極統合ダッシュボード
              </h1>
              <p className="text-gray-600">すべてのシステムが統合された次世代インターフェース</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                )}
              />
              <span className="text-gray-600">
                {isTracking ? 'リアルタイム追跡中' : '追跡停止中'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={refreshDashboard} disabled={isRefreshing}>
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            </Button>

            {enableCustomization && (
              <Button variant="outline" size="sm" onClick={() => setIsCustomizing(!isCustomizing)}>
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{todayCompletedTasks}</div>
                <div className="text-xs text-gray-600">今日完了</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{pendingTasks}</div>
                <div className="text-xs text-gray-600">保留中</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{playerLevel || trackingData.currentLevel}</div>
                <div className="text-xs text-gray-600">レベル</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{totalXP || trackingData.totalXP}</div>
                <div className="text-xs text-gray-600">総XP</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{streakDays || trackingData.streakDays}</div>
                <div className="text-xs text-gray-600">連続日数</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(trackingData.productivityScore)}%
                </div>
                <div className="text-xs text-gray-600">生産性</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            統合概要
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            タスク管理
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            自動化
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            ゲーミフィケーション
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI統合
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            分析
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            設定
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Widget Grid */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {widgets
              .filter((widget) => widget.visible)
              .map((widget) => (
                <Card
                  key={widget.id}
                  className={cn(
                    'relative',
                    widget.size === 'sm' && 'col-span-1 row-span-1',
                    widget.size === 'md' && 'col-span-1 row-span-1',
                    widget.size === 'lg' && 'col-span-2 row-span-1',
                    widget.size === 'xl' && 'col-span-2 row-span-2'
                  )}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      {widget.title}
                      {isCustomizing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{widget.component}</CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-green-600" />
                統合タスク管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyTodoReminder isPremium={hasActiveSubscription} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-blue-600" />
                統合自動化システム
              </CardTitle>
              <p className="text-sm text-gray-600">
                タスク管理、ゲーミフィケーション、AI機能を自動化
              </p>
            </CardHeader>
            <CardContent>
              <IntegratedAutomationDashboard
                compactMode={compactMode}
                showAdvancedFeatures={hasActiveSubscription}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                統合ゲーミフィケーション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IntegratedGamificationDashboard
                userId={user?.uid || userId}
                compactMode={compactMode}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                AI統合システム
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIEnhancedGamification />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>リアルタイム統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>セッション時間</span>
                    <span className="font-mono">
                      {Math.floor(trackingData.currentSessionTime / 60)}分
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>今日のXP</span>
                    <span className="font-mono text-green-600">+{trackingData.todayXP}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>生産性スコア</span>
                    <span className="font-mono">{Math.round(trackingData.productivityScore)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>システム状態</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unifiedData && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>システム健全性</span>
                        <Badge
                          variant={
                            unifiedData.systemOverview.systemHealth === 'excellent'
                              ? 'default'
                              : unifiedData.systemOverview.systemHealth === 'good'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {unifiedData.systemOverview.systemHealth}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>アクティブ機能</span>
                        <span className="font-mono">
                          {unifiedData.systemOverview.activeFeatures}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>稼働時間</span>
                        <span className="font-mono text-green-600">
                          {unifiedData.systemOverview.uptime}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ダッシュボード設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>リアルタイム更新</span>
                  <Button
                    variant={isTracking ? 'default' : 'outline'}
                    size="sm"
                    onClick={isTracking ? stopTracking : startTracking}
                  >
                    {isTracking ? '停止' : '開始'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>コンパクトモード</span>
                  <Button variant="outline" size="sm">
                    切り替え
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>カスタマイズモード</span>
                  <Button
                    variant={isCustomizing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsCustomizing(!isCustomizing)}
                  >
                    {isCustomizing ? '完了' : '開始'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>表示ウィジェット</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <div key={widget.id} className="flex items-center justify-between">
                      <span className="text-sm">{widget.title}</span>
                      <Button
                        variant={widget.visible ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                      >
                        {widget.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Widget Components
const TaskOverviewWidget: React.FC = () => (
  <div className="space-y-3">
    <div className="text-2xl font-bold">12</div>
    <div className="text-sm text-gray-600">今日のタスク</div>
    <Progress value={75} className="h-2" />
    <div className="text-xs text-gray-500">75% 完了</div>
  </div>
);

const GamificationStatsWidget: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Crown className="w-5 h-5 text-purple-500" />
      <div className="text-lg font-bold">レベル 12</div>
    </div>
    <div className="text-sm text-gray-600">1,450 XP</div>
    <Progress value={60} className="h-2" />
    <div className="text-xs text-gray-500">次のレベルまで 40%</div>
  </div>
);

const AIInsightsWidget: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Brain className="w-5 h-5 text-blue-500" />
      <div className="text-sm font-medium">AI洞察</div>
    </div>
    <div className="text-sm text-gray-600">
      午前中のタスク完了率が高いため、重要なタスクを午前に配置することを推奨します。
    </div>
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <Activity className="w-3 h-3" />
      <span>信頼度: 85%</span>
    </div>
  </div>
);

const RecentActivityWidget: React.FC = () => (
  <div className="space-y-2">
    <div className="text-sm font-medium">最近のアクティビティ</div>
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span>タスク完了 +25 XP</span>
        <span className="text-gray-500 ml-auto">5分前</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <span>AI分析実行</span>
        <span className="text-gray-500 ml-auto">15分前</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span>バッジ獲得</span>
        <span className="text-gray-500 ml-auto">1時間前</span>
      </div>
    </div>
  </div>
);

const QuickActionsWidget: React.FC = () => (
  <div className="space-y-2">
    <div className="text-sm font-medium">クイックアクション</div>
    <div className="grid grid-cols-2 gap-2">
      <Button size="sm" variant="outline" className="w-full">
        <Plus className="w-3 h-3 mr-1" />
        タスク
      </Button>
      <Button size="sm" variant="outline" className="w-full">
        <Brain className="w-3 h-3 mr-1" />
        AI分析
      </Button>
    </div>
  </div>
);

const PerformanceMetricsWidget: React.FC = () => (
  <div className="space-y-3">
    <div className="text-sm font-medium">パフォーマンス</div>
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <div className="text-gray-600">ページ読み込み</div>
        <div className="font-mono">1.2s</div>
      </div>
      <div>
        <div className="text-gray-600">API応答</div>
        <div className="font-mono">180ms</div>
      </div>
      <div>
        <div className="text-gray-600">エラー率</div>
        <div className="font-mono text-green-600">0.2%</div>
      </div>
      <div>
        <div className="text-gray-600">メモリ使用量</div>
        <div className="font-mono">65%</div>
      </div>
    </div>
  </div>
);

export default SuperIntegratedDashboard;
