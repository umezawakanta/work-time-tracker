import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Zap,
} from 'lucide-react';
import { LiveAnalyticsDashboard } from '@/components/analytics/LiveAnalyticsDashboard';
import { TodoAnalytics } from '@/components/analytics/TodoAnalytics';
import { TodoAnalyticsDashboard } from '@/components/analytics/TodoAnalyticsDashboard';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { cn } from '@/lib/utils';

/**
 * 📊 データウィザード: 統合分析ページ
 * リアルタイム分析と従来の分析を統合したダッシュボード
 */
const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [isExporting, setIsExporting] = useState(false);

  // 📊 データウィザード: リアルタイム分析フック
  const {
    data: realtimeData,
    isConnected,
    isConnecting,
    error,
    lastUpdate,
    refresh,
    trackUserActivity,
  } = useRealtimeAnalytics({
    autoConnect: true,
    userId: 'current-user',
  });

  // ページビュー追跡
  React.useEffect(() => {
    trackUserActivity('page_view', { page: 'analytics' });
  }, [trackUserActivity]);

  // データエクスポート
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        realtimeData,
        lastUpdate: lastUpdate.toISOString(),
        connectionStatus: isConnected,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);

      trackUserActivity('data_export', { type: 'analytics' });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 手動リフレッシュ
  const handleRefresh = async () => {
    await refresh();
    trackUserActivity('manual_refresh', { section: activeTab });
  };

  return (
    <PageLayout title="分析ダッシュボード">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">📊 分析ダッシュボード</h1>
            <p className="text-muted-foreground">
              リアルタイムデータと詳細分析でプロジェクトの状況を把握
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 接続ステータス */}
            <Badge
              variant={isConnected ? 'default' : error ? 'destructive' : 'secondary'}
              className={cn('gap-1', isConnected && 'animate-pulse')}
            >
              <Zap className="h-3 w-3" />
              {isConnecting
                ? '接続中...'
                : isConnected
                  ? 'ライブ'
                  : error
                    ? 'エラー'
                    : 'オフライン'}
            </Badge>

            {/* アクション */}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              更新
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1" />
              {isExporting ? 'エクスポート中...' : 'エクスポート'}
            </Button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <Activity className="h-4 w-4" />
                <span className="font-medium">接続エラー:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* メインコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="realtime" className="gap-2">
              <Activity className="h-4 w-4" />
              リアルタイム
            </TabsTrigger>
            <TabsTrigger value="detailed" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              詳細分析
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              ダッシュボード
            </TabsTrigger>
          </TabsList>

          {/* リアルタイム分析 */}
          <TabsContent value="realtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  📊 リアルタイム分析
                </CardTitle>
                <CardDescription>
                  WebSocketによるライブデータ更新で最新の状況をリアルタイム監視
                  {lastUpdate && (
                    <span className="block mt-1 text-xs">
                      最終更新: {lastUpdate.toLocaleString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LiveAnalyticsDashboard userId="current-user" refreshInterval={5000} />
              </CardContent>
            </Card>

            {/* リアルタイムデータサマリー */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">アクティブユーザー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">現在オンライン</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">完了率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">今日のタスク</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">今日のタスク</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.todaysTasks}</div>
                  <p className="text-xs text-muted-foreground">完了済み</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">リアルタイムイベント</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.realtimeEvents.length}</div>
                  <p className="text-xs text-muted-foreground">過去1時間</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 詳細分析 */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  詳細分析レポート
                </CardTitle>
                <CardDescription>
                  タスク完了率、生産性指標、カテゴリ別分析などの詳細データ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TodoAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ダッシュボード */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  統合ダッシュボード
                </CardTitle>
                <CardDescription>総合的な生産性指標とトレンド分析</CardDescription>
              </CardHeader>
              <CardContent>
                <TodoAnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 📊 データウィザード成果表示 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              📊 データウィザード機能
              <Badge variant="secondary">NEW</Badge>
            </CardTitle>
            <CardDescription className="text-blue-700">
              リアルタイム分析機能が完全実装されました！
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                WebSocketリアルタイム接続
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                ライブデータ更新
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                リアルタイム分析ダッシュボード
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                統合分析プラットフォーム
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AnalyticsPage;
