import React, { useState, useEffect, useRef } from 'react';
import { getEnv } from '@/utils/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface LiveMetrics {
  activeUsers: number;
  completionRate: number;
  avgTaskTime: number;
  todaysTasks: number;
  weeklyTrend: number;
  topCategories: { name: string; value: number; color: string }[];
  hourlyActivity: { hour: string; tasks: number; users: number }[];
  realtimeActivity: { timestamp: Date; action: string; user: string; detail: string }[];
}

interface LiveAnalyticsDashboardProps {
  userId?: string;
  teamId?: string;
  refreshInterval?: number;
}

/**
 * 📊 データウィザード: リアルタイム分析ダッシュボード
 * WebSocketでライブデータ更新、リアルタイム統計表示
 */
export const LiveAnalyticsDashboard: React.FC<LiveAnalyticsDashboardProps> = ({
  userId = 'current-user',
  teamId,
  refreshInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    completionRate: 0,
    avgTaskTime: 0,
    todaysTasks: 0,
    weeklyTrend: 0,
    topCategories: [],
    hourlyActivity: [],
    realtimeActivity: [],
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 📊 データウィザード: WebSocket接続でリアルタイムデータ
  const connectWebSocket = () => {
    // In production, require explicit VITE_WEBSOCKET_URL; otherwise skip gracefully
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !getEnv('VITE_WEBSOCKET_URL')
    ) {
      console.warn('Skipping WebSocket in production: VITE_WEBSOCKET_URL not set');
      setIsConnected(false);
      return;
    }
    try {
      // 動的ポート検出
      const getWebSocketUrl = () => {
        const configuredUrl = getEnv('VITE_WEBSOCKET_URL');
        if (configuredUrl) {
          return configuredUrl;
        }

        // 開発環境では現在のホストとポートを使用
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          const currentPort = window.location.port;
          // フロントエンドポートから推測（フロントエンドが3003なら、バックエンドは3004）
          const backendPort = currentPort ? parseInt(currentPort) + 1 : 3001;
          return `ws://${window.location.hostname}:${backendPort}`;
        }

        // 本番環境では現在のホストを使用
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
      };

      const wsUrl = getWebSocketUrl();
      // サーバーが提供している /notifications パスを使用
      const ws = new WebSocket(`${wsUrl}/notifications`);

      ws.onopen = () => {
        console.log('📊 Analytics WebSocket connected');
        setIsConnected(true);

        // 認証とサブスクリプション（analytics channelを指定）
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            userId,
            teamId,
            channels: ['analytics', 'metrics', 'activity', 'tasks'],
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeUpdate(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('📊 Analytics WebSocket disconnected');
        setIsConnected(false);
        // 自動再接続（5秒後）
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('📊 Analytics WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  };

  // リアルタイムデータ更新処理
  const handleRealtimeUpdate = (data: any) => {
    setLastUpdate(new Date());

    switch (data.type) {
      case 'analytics_data':
        console.log('📊 Received analytics data:', data.data);
        setMetrics((prev) => ({
          ...prev,
          ...data.data,
          realtimeActivity: prev.realtimeActivity, // 既存のアクティビティを保持
        }));
        setIsLoading(false);
        break;

      case 'metrics_update':
        setMetrics((prev) => ({
          ...prev,
          ...data.payload,
        }));
        break;

      case 'activity_update':
        setMetrics((prev) => ({
          ...prev,
          realtimeActivity: [
            data.payload,
            ...prev.realtimeActivity.slice(0, 19), // 最新20件
          ],
        }));
        break;

      case 'task_completed':
        setMetrics((prev) => ({
          ...prev,
          todaysTasks: prev.todaysTasks + 1,
          completionRate: Math.min(prev.completionRate + 0.5, 100),
        }));
        break;

      case 'subscribe_success':
        console.log('📊 Successfully subscribed to channels:', data.channels);
        break;

      default:
        console.log('Unknown websocket message type:', data.type);
    }
  };

  // 📊 データウィザード: フォールバック用ポーリング
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      // 本番環境でのAPI呼び出し
      const response = await fetch('/api/analytics/live-metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
          setLastUpdate(new Date());
          return;
        }
      }

      // フォールバック: モックデータ（API接続失敗時のみ）
      console.warn('Live metrics API not available, using fallback data');
      const mockMetrics: LiveMetrics = {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        completionRate: Math.floor(Math.random() * 40) + 60,
        avgTaskTime: Math.floor(Math.random() * 30) + 15,
        todaysTasks: Math.floor(Math.random() * 20) + 5,
        weeklyTrend: Math.floor(Math.random() * 30) - 15,
        topCategories: [
          { name: '開発', value: 35, color: '#3b82f6' },
          { name: '会議', value: 25, color: '#10b981' },
          { name: '学習', value: 20, color: '#f59e0b' },
          { name: 'レビュー', value: 15, color: '#ef4444' },
          { name: 'その他', value: 5, color: '#8b5cf6' },
        ],
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          tasks: Math.floor(Math.random() * 10),
          users: Math.floor(Math.random() * 15),
        })),
        realtimeActivity: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000),
          action: ['タスク完了', 'タスク作成', 'コメント追加'][Math.floor(Math.random() * 3)],
          user: `ユーザー${Math.floor(Math.random() * 10) + 1}`,
          detail: 'プロジェクト管理システム',
        })),
      };

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Metrics fetch failed:', error);

      // エラー時もフォールバックデータを表示
      const fallbackMetrics: LiveMetrics = {
        activeUsers: 0,
        completionRate: 0,
        avgTaskTime: 0,
        todaysTasks: 0,
        weeklyTrend: 0,
        topCategories: [],
        hourlyActivity: [],
        realtimeActivity: [],
      };
      setMetrics(fallbackMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  // 手動更新
  const handleManualRefresh = async () => {
    await fetchMetrics();
  };

  // 初期化
  useEffect(() => {
    fetchMetrics();
    connectWebSocket();

    // フォールバックポーリング
    intervalRef.current = setInterval(fetchMetrics, refreshInterval);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, teamId, refreshInterval]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">📊 リアルタイム分析</h2>
          <p className="text-muted-foreground">
            ライブデータでプロジェクトの状況をリアルタイム監視
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* 接続状態 */}
          <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'ライブ接続' : 'オフライン'}
          </Badge>

          {/* 手動更新 */}
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>

          <span className="text-xs text-muted-foreground">
            最終更新: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* メトリクスカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">現在オンライン</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均タスク時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgTaskTime}分</div>
            <p className="text-xs text-muted-foreground">1タスクあたり平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todaysTasks}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.weeklyTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(metrics.weeklyTrend)}% 先週比
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析タブ */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            アクティビティ
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <PieChart className="h-4 w-4" />
            カテゴリ分析
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" />
            トレンド
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 時間別アクティビティ */}
            <Card>
              <CardHeader>
                <CardTitle>時間別アクティビティ</CardTitle>
                <CardDescription>24時間の活動状況</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* リアルタイムアクティビティ */}
            <Card>
              <CardHeader>
                <CardTitle>リアルタイムアクティビティ</CardTitle>
                <CardDescription>最新の活動ログ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {metrics.realtimeActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Badge variant="outline" className="text-xs">
                        {activity.action}
                      </Badge>
                      <span className="text-sm font-medium">{activity.user}</span>
                      <span className="text-xs text-muted-foreground flex-1">
                        {activity.detail}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別分析</CardTitle>
              <CardDescription>タスクカテゴリの分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={metrics.topCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {metrics.topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {metrics.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium flex-1">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>トレンド分析</CardTitle>
              <CardDescription>時系列データの推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={metrics.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
