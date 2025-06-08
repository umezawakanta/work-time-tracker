import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '@/context/AuthContext';
import WBSActualDataService, {
  ActualDataSummary,
  WBSActualReport,
} from '@/services/integration/WBSActualDataService';
import { siteDevNodes } from '@/data/siteDevWBS';
import { WBSNode } from '@/types/wbs';

interface WBSActualDataIntegrationProps {
  projectId?: string;
  nodes?: WBSNode[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const WBSActualDataIntegration: React.FC<WBSActualDataIntegrationProps> = ({
  projectId = 'site-dev-project',
  nodes = siteDevNodes,
  autoRefresh = true,
  refreshInterval = 60000, // 1分
}) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [actualReport, setActualReport] = useState<WBSActualReport | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<ActualDataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 実績データを取得する関数
  const fetchActualData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const report = await WBSActualDataService.generateWBSActualReport(projectId, nodes, user.uid);

      setActualReport(report);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch actual data:', err);
      setError('実績データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, projectId, nodes]);

  // 特定ノードの詳細データを取得
  const fetchNodeDetail = async (nodeId: string) => {
    if (!user?.uid) return;

    try {
      const nodeData = await WBSActualDataService.getActualDataSummary(nodeId, user.uid);
      setSelectedNodeData(nodeData);
    } catch (err) {
      console.error('Failed to fetch node detail:', err);
    }
  };

  // 初回データ取得
  useEffect(() => {
    fetchActualData();
  }, [user?.uid, projectId, fetchActualData]);

  // 自動更新設定
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchActualData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchActualData]);

  // エクスポート機能
  const exportReport = () => {
    if (!actualReport) return;

    const dataStr = JSON.stringify(actualReport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wbs-actual-report-${actualReport.reportDate.split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 効率性のカラーを取得
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency <= 90) return 'text-green-600';
    if (efficiency <= 110) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ステータスのバッジ色を取得
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !actualReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">実績データを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!actualReport) {
    return (
      <Alert>
        <AlertDescription>実績データがありません</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">WBS実績データ統合</h2>
          <p className="text-gray-600">最終更新: {lastUpdated?.toLocaleString('ja-JP')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchActualData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総計画工数</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualReport.totalPlannedHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総実績工数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualReport.totalActualHours}h</div>
            <p className={`text-xs ${getEfficiencyColor(actualReport.budgetEfficiency)}`}>
              効率性: {actualReport.budgetEfficiency.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">全体進捗</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualReport.overallProgress.toFixed(1)}%</div>
            <Progress value={actualReport.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">予定通り完了率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualReport.onTimeDelivery.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細タブ */}
      <Tabs defaultValue="nodes" className="w-full">
        <TabsList>
          <TabsTrigger value="nodes">ノード別実績</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス分析</TabsTrigger>
          <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4">
            {actualReport.nodeReports.map((nodeReport) => (
              <Card
                key={nodeReport.nodeId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => fetchNodeDetail(nodeReport.nodeId)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{nodeReport.nodeId}</CardTitle>
                      <CardDescription>
                        {nodeReport.completedTasks}/{nodeReport.totalTasks} タスク完了
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(nodeReport.status)}>
                      {nodeReport.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">計画工数</p>
                      <p className="font-semibold">{nodeReport.plannedHours}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">実績工数</p>
                      <p className="font-semibold">{nodeReport.actualHours}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">進捗</p>
                      <div className="flex items-center gap-2">
                        <Progress value={nodeReport.progress} className="flex-1" />
                        <span className="text-xs">{nodeReport.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">効率性</p>
                      <p className={`font-semibold ${getEfficiencyColor(nodeReport.efficiency)}`}>
                        {nodeReport.efficiency.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* 実際の日付情報 */}
                  {(nodeReport.actualStartDate || nodeReport.actualEndDate) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {nodeReport.actualStartDate && (
                          <span>開始: {nodeReport.actualStartDate}</span>
                        )}
                        {nodeReport.actualEndDate && <span>終了: {nodeReport.actualEndDate}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  高パフォーマンスノード
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actualReport.topPerformingNodes.length > 0 ? (
                  <ul className="space-y-2">
                    {actualReport.topPerformingNodes.map((nodeId) => (
                      <li key={nodeId} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{nodeId}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">該当するノードがありません</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  遅延ノード
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actualReport.delayedNodes.length > 0 ? (
                  <ul className="space-y-2">
                    {actualReport.delayedNodes.map((nodeId) => (
                      <li key={nodeId} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span>{nodeId}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">遅延しているノードはありません</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {actualReport.recommendations.length > 0 ? (
            <div className="space-y-3">
              {actualReport.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                現在、特に改善が必要な事項はありません。良好な進捗です。
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* 選択されたノードの詳細 */}
      {selectedNodeData && (
        <Card>
          <CardHeader>
            <CardTitle>ノード詳細: {selectedNodeData.nodeId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 関連タスク */}
              {selectedNodeData.relatedTasks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">関連タスク</h4>
                  <div className="space-y-2">
                    {selectedNodeData.relatedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {task.estimatedHours && <span>見積: {task.estimatedHours}h</span>}
                            {task.actualHours && <span>実績: {task.actualHours}h</span>}
                          </div>
                        </div>
                        <Badge variant={task.completed ? 'default' : 'secondary'}>
                          {task.completed ? '完了' : '未完了'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 作業時間エントリ */}
              {selectedNodeData.workTimeEntries.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">作業時間記録</h4>
                  <div className="space-y-2">
                    {selectedNodeData.workTimeEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{entry.projectName}</p>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{entry.duration}h</p>
                          <p className="text-xs text-muted-foreground">{entry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WBSActualDataIntegration;
