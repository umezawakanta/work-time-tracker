import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Globe,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Zap,
  Network,
  Shield,
  Users,
  Database,
  Cpu,
  Monitor,
  Settings,
} from 'lucide-react';
import { useUniversalPageSync, useBadgeSync, usePageMetrics } from '@/hooks/useUniversalPageSync';

interface UniversalSyncDashboardProps {
  currentPageId?: string;
}

/**
 * 🔄 ユニバーサル同期ダッシュボード
 * 全23ページの同期状況と連携を表示
 */
export const UniversalSyncDashboard: React.FC<UniversalSyncDashboardProps> = ({
  currentPageId = 'home',
}) => {
  const { pageState, allPageStates, syncMetrics, isLoading, error, refresh } =
    useUniversalPageSync(currentPageId);

  const { badgeProgress, totalBadges, completedBadges, averageProgress } =
    useBadgeSync(currentPageId);

  const { metrics, isActive, lastUpdated, syncStatus, pendingUpdates, connections } =
    usePageMetrics(currentPageId);

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'syncing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPageIcon = (pageId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      home: <Monitor className="w-5 h-5" />,
      'integrated-dashboard': <BarChart3 className="w-5 h-5" />,
      'todo-management': <CheckCircle2 className="w-5 h-5" />,
      'automation-rules': <Zap className="w-5 h-5" />,
      'badge-dashboard': <Shield className="w-5 h-5" />,
      gamification: <Activity className="w-5 h-5" />,
      analytics: <TrendingUp className="w-5 h-5" />,
      'system-design': <Network className="w-5 h-5" />,
      'admin-dashboard': <Settings className="w-5 h-5" />,
      profile: <Users className="w-5 h-5" />,
      'performance-monitoring': <Cpu className="w-5 h-5" />,
      'error-monitoring': <AlertTriangle className="w-5 h-5" />,
      'quality-dashboard': <Database className="w-5 h-5" />,
    };
    return iconMap[pageId] || <Globe className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>同期データを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>同期エラー: {error}</span>
            </div>
            <Button onClick={refresh} variant="outline" size="sm" className="mt-2">
              再試行
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            ユニバーサル同期ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            全{syncMetrics.totalPages}ページの連携状況とバッジ進捗を監視
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          更新
        </Button>
      </div>

      {/* 同期メトリクス概要 */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総ページ数</p>
                <p className="text-2xl font-bold">{syncMetrics.totalPages}</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ同期</p>
                <p className="text-2xl font-bold text-blue-600">{syncMetrics.activeSyncs}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-green-600">{syncMetrics.syncSuccessRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待機中更新</p>
                <p className="text-2xl font-bold text-orange-600">{syncMetrics.pendingUpdates}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* バッジ進捗概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            バッジ進捗概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalBadges}</p>
              <p className="text-sm text-gray-600">総バッジ数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedBadges}</p>
              <p className="text-sm text-gray-600">獲得済み</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{Math.round(averageProgress)}%</p>
              <p className="text-sm text-gray-600">平均進捗</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>全体進捗</span>
              <span>{Math.round(averageProgress)}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 現在のページ状態 */}
      {pageState && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPageIcon(pageState.pageId)}
              現在のページ: {pageState.pageName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">同期状態:</span>
                  {getSyncStatusIcon(syncStatus)}
                  <Badge className={getSyncStatusColor(syncStatus)}>{syncStatus}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">待機中更新:</span>
                  <Badge variant="outline">{pendingUpdates}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  最終更新: {new Date(lastUpdated).toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">接続ページ ({connections.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {connections.slice(0, 6).map((connectionId) => {
                    const connectedPage = allPageStates.find((p) => p.pageId === connectionId);
                    return (
                      <Badge key={connectionId} variant="secondary" className="text-xs">
                        {connectedPage?.pageName || connectionId}
                      </Badge>
                    );
                  })}
                  {connections.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{connections.length - 6}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 全ページ状態一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            全ページ同期状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPageStates.map((page) => (
              <div
                key={page.pageId}
                className={`p-3 rounded-lg border transition-colors ${
                  page.pageId === currentPageId
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPageIcon(page.pageId)}
                    <span className="font-medium text-sm">{page.pageName}</span>
                  </div>
                  {getSyncStatusIcon(page.syncStatus)}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>進捗: {Object.keys(page.badgeProgress).length} バッジ</div>
                  <div>更新: {page.pendingUpdates} 件待機</div>
                  <div>接続: {page.connections.length} ページ</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
