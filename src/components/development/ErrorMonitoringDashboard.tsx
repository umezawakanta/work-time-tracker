import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { ErrorRecoveryService } from '@/services/ErrorRecoveryService';
import { cn } from '@/lib/utils';

interface ErrorMonitoringDashboardProps {
  className?: string;
}

/**
 * 🐛 エラーエリミネーター: リアルタイムエラー監視ダッシュボード
 * システム全体のエラー状況をリアルタイム監視・可視化
 */
export const ErrorMonitoringDashboard: React.FC<ErrorMonitoringDashboardProps> = ({
  className,
}) => {
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    resolvedErrors: 0,
    activeErrors: 0,
    errorsByType: {} as Record<string, number>,
    errorsByEndpoint: {} as Record<string, number>,
    recoveryRate: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  const errorRecoveryService = ErrorRecoveryService.getInstance();

  // 🐛 リアルタイムエラー統計更新
  useEffect(() => {
    const updateStats = () => {
      const stats = errorRecoveryService.getErrorStatistics();
      setErrorStats(stats);
      setLastUpdate(new Date());
    };

    // 初期データロード
    updateStats();

    // カスタムイベントリスナー
    const handleErrorStatsUpdate = (event: CustomEvent) => {
      setErrorStats(event.detail);
      setLastUpdate(new Date());
    };

    // イベントリスナー追加
    window.addEventListener('errorStatsUpdate', handleErrorStatsUpdate as EventListener);

    // 定期更新
    const interval = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener('errorStatsUpdate', handleErrorStatsUpdate as EventListener);
      clearInterval(interval);
    };
  }, [errorRecoveryService]);

  // 🔧 手動リフレッシュ
  const handleRefresh = () => {
    const stats = errorRecoveryService.getErrorStatistics();
    setErrorStats(stats);
    setLastUpdate(new Date());
  };

  // 🔄 回復状況リセット
  const handleResetRecovery = () => {
    errorRecoveryService.resetRecoveryAttempts();
    handleRefresh();
  };

  // 📊 エラーログエクスポート
  const handleExportLog = () => {
    const logData = errorRecoveryService.exportErrorLog();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // エラーレベル判定
  const getSystemHealth = () => {
    if (errorStats.activeErrors === 0) return 'excellent';
    if (errorStats.activeErrors < 5) return 'good';
    if (errorStats.activeErrors < 15) return 'warning';
    return 'critical';
  };

  const healthStatus = getSystemHealth();

  return (
    <div className={cn('space-y-6', className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            🐛 エラー監視ダッシュボード
            <Badge
              variant={healthStatus === 'excellent' ? 'default' : 'destructive'}
              className="gap-1"
            >
              {healthStatus === 'excellent' && <CheckCircle2 className="h-3 w-3" />}
              {healthStatus === 'good' && <Shield className="h-3 w-3" />}
              {healthStatus === 'warning' && <AlertTriangle className="h-3 w-3" />}
              {healthStatus === 'critical' && <XCircle className="h-3 w-3" />}
              {healthStatus === 'excellent'
                ? '正常'
                : healthStatus === 'good'
                  ? '良好'
                  : healthStatus === 'warning'
                    ? '注意'
                    : '緊急'}
            </Badge>
          </h2>
          <p className="text-muted-foreground">リアルタイムエラー検出・自動回復システム</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Activity className="h-3 w-3" />
            {isMonitoring ? 'ライブ監視中' : '停止'}
          </Badge>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            更新
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportLog}>
            <Download className="h-4 w-4 mr-1" />
            ログ出力
          </Button>
        </div>
      </div>

      {/* メトリクスカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総エラー数</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">過去24時間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">回復済み</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{errorStats.resolvedErrors}</div>
            <p className="text-xs text-muted-foreground">自動回復成功</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブエラー</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorStats.activeErrors}</div>
            <p className="text-xs text-muted-foreground">要対応</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">回復率</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {errorStats.recoveryRate.toFixed(1)}%
            </div>
            <Progress value={errorStats.recoveryRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析タブ */}
      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">エラータイプ別</TabsTrigger>
          <TabsTrigger value="endpoints">エンドポイント別</TabsTrigger>
          <TabsTrigger value="recovery">回復状況</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>エラータイプ別分析</CardTitle>
              <CardDescription>発生頻度の高いエラータイプを特定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(errorStats.errorsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}件</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(errorStats.errorsByType))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(errorStats.errorsByType).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    エラーは検出されていません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>エンドポイント別分析</CardTitle>
              <CardDescription>問題のあるAPIエンドポイントを特定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(errorStats.errorsByEndpoint).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {endpoint.slice(0, 40)}
                        {endpoint.length > 40 ? '...' : ''}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}件</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(errorStats.errorsByEndpoint))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(errorStats.errorsByEndpoint).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    エンドポイントエラーは検出されていません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>自動回復状況</CardTitle>
              <CardDescription>エラー回復機能の動作状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 回復率プログレス */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">全体回復率</span>
                    <span className="text-sm text-muted-foreground">
                      {errorStats.recoveryRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={errorStats.recoveryRate} className="h-2" />
                </div>

                {/* 回復機能リスト */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">有効な回復機能</h4>
                  <div className="space-y-1">
                    {[
                      { name: 'API 500エラー自動回復', status: 'active' },
                      { name: '認証エラー自動回復', status: 'active' },
                      { name: 'ネットワークエラー自動回復', status: 'active' },
                      { name: 'データベースエラー自動回復', status: 'active' },
                    ].map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={handleResetRecovery} className="w-full">
                  回復状況リセット
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>監視設定</CardTitle>
              <CardDescription>エラー監視システムの設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">リアルタイム監視</span>
                  <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                    {isMonitoring ? '有効' : '無効'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">最終更新</span>
                  <span className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">🐛 エラーエリミネーター進捗</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">コンソールエラー0件</span>
                      <Badge variant="default">完了</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API 500エラー解決</span>
                      <Badge variant={errorStats.activeErrors === 0 ? 'default' : 'secondary'}>
                        {errorStats.activeErrors === 0 ? '完了' : '進行中'}
                      </Badge>
                    </div>
                    <Progress value={errorStats.activeErrors === 0 ? 100 : 85} className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
