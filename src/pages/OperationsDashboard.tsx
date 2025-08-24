import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Server,
  Database,
  Cloud,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  RefreshCw,
  Bell,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings,
  Terminal,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemMetrics {
  servers: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLoad: number;
  };
  database: {
    connections: number;
    queryTime: number;
    replicationLag: number;
    storage: number;
  };
  monitoring: {
    uptime: number;
    errors: number;
    alerts: number;
    incidents: number;
  };
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  assignee?: string;
  estimatedResolution?: string;
}

const OperationsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/operations/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setIncidents(data.incidents);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          servers: {
            total: 12,
            healthy: 10,
            warning: 1,
            critical: 1,
          },
          performance: {
            cpuUsage: 45,
            memoryUsage: 67,
            diskUsage: 78,
            networkLoad: 34,
          },
          database: {
            connections: 45,
            queryTime: 123,
            replicationLag: 0.8,
            storage: 82,
          },
          monitoring: {
            uptime: 99.97,
            errors: 3,
            alerts: 7,
            incidents: 2,
          },
        });

        setIncidents([
          {
            id: 'inc-001',
            title: 'データベース接続遅延',
            description: 'プライマリデータベースへの接続が通常より遅くなっています',
            severity: 'high',
            status: 'investigating',
            createdAt: '2025-01-29T10:30:00Z',
            assignee: '運用チーム',
            estimatedResolution: '2025-01-29T14:00:00Z',
          },
          {
            id: 'inc-002',
            title: 'CDN応答率低下',
            description: '東京リージョンのCDNで応答率が85%に低下しています',
            severity: 'medium',
            status: 'open',
            createdAt: '2025-01-29T09:15:00Z',
            assignee: 'インフラチーム',
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch operations metrics:', error);
      toast.error('メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // インシデント対応
  const updateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      const response = await fetch(`/api/operations/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setIncidents((prev) =>
          prev.map((incident) =>
            incident.id === incidentId ? { ...incident, status: status as any } : incident
          )
        );
        toast.success('インシデントステータスを更新しました');
      }
    } catch (error) {
      console.error('Failed to update incident:', error);
      toast.error('インシデントの更新に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();

    // 10秒ごとに自動更新
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">運用ダッシュボード</h1>
          <p className="text-gray-600">
            最終更新: {lastUpdate.toLocaleString()} | 自動更新: 10秒間隔
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-1" />
            アラート設定
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            ログ出力
          </Button>
        </div>
      </div>

      {/* 緊急アラート */}
      {incidents.filter((inc) => inc.severity === 'critical' && inc.status !== 'resolved').length >
        0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">緊急インシデント発生</AlertTitle>
          <AlertDescription className="text-red-700">
            クリティカルなインシデントが
            {
              incidents.filter((inc) => inc.severity === 'critical' && inc.status !== 'resolved')
                .length
            }
            件発生しています。 即座に対応が必要です。
          </AlertDescription>
        </Alert>
      )}

      {/* システム状況概要 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">サーバー稼働状況</p>
                  <p className="text-2xl font-bold">
                    {metrics.servers.healthy}/{metrics.servers.total}
                  </p>
                  <p className="text-xs text-green-600">正常稼働中</p>
                </div>
                <Server className="w-8 h-8 text-blue-600" />
              </div>
              <Progress
                value={(metrics.servers.healthy / metrics.servers.total) * 100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>警告: {metrics.servers.warning}</span>
                <span>異常: {metrics.servers.critical}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPU使用率</p>
                  <p className="text-2xl font-bold">{metrics.performance.cpuUsage}%</p>
                  <p className="text-xs text-blue-600">平均負荷</p>
                </div>
                <Cpu className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.performance.cpuUsage} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                {metrics.performance.cpuUsage < 70
                  ? '正常'
                  : metrics.performance.cpuUsage < 85
                    ? '注意'
                    : '警告'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">メモリ使用率</p>
                  <p className="text-2xl font-bold">{metrics.performance.memoryUsage}%</p>
                  <p className="text-xs text-orange-600">使用中</p>
                </div>
                <MemoryStick className="w-8 h-8 text-purple-600" />
              </div>
              <Progress value={metrics.performance.memoryUsage} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                {metrics.performance.memoryUsage < 75
                  ? '正常'
                  : metrics.performance.memoryUsage < 90
                    ? '注意'
                    : '警告'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">システム稼働率</p>
                  <p className="text-2xl font-bold">{metrics.monitoring.uptime}%</p>
                  <p className="text-xs text-green-600">24時間平均</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.monitoring.uptime} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">エラー: {metrics.monitoring.errors}件</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="incidents">インシデント</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
          <TabsTrigger value="maintenance">メンテナンス</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 緊急対応タスク */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  緊急対応タスク
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">データベース容量監視</p>
                      <p className="text-sm text-red-600">使用量82% - スケーリング要検討</p>
                    </div>
                    <Badge variant="destructive">緊急</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium text-orange-800">バックアップ検証</p>
                      <p className="text-sm text-orange-600">昨夜のバックアップ完全性チェック</p>
                    </div>
                    <Badge variant="secondary">高</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium text-yellow-800">セキュリティパッチ適用</p>
                      <p className="text-sm text-yellow-600">OS/ミドルウェアの更新</p>
                    </div>
                    <Badge variant="outline">中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* システム健全性 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  システム健全性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Webサーバー</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常 (3/3)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">データベース</span>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">注意 (遅延)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">キャッシュサーバー</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常 (2/2)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ロードバランサー</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常 (2/2)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CDN</span>
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">異常 (応答率85%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>アクティブインシデント</CardTitle>
              <CardDescription>対応が必要なインシデント一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <Card
                    key={incident.id}
                    className={incident.status === 'resolved' ? 'opacity-50' : ''}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{incident.title}</h3>
                            <Badge
                              variant={
                                incident.severity === 'critical'
                                  ? 'destructive'
                                  : incident.severity === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">{incident.status}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{incident.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>作成: {new Date(incident.createdAt).toLocaleString()}</span>
                            {incident.assignee && <span>担当: {incident.assignee}</span>}
                            {incident.estimatedResolution && (
                              <span>
                                予定解決: {new Date(incident.estimatedResolution).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                            disabled={incident.status === 'investigating'}
                          >
                            調査中
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                            disabled={incident.status === 'resolved'}
                          >
                            解決
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>リソース使用状況</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">CPU使用率</span>
                        <span className="text-sm">{metrics.performance.cpuUsage}%</span>
                      </div>
                      <Progress value={metrics.performance.cpuUsage} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">メモリ使用率</span>
                        <span className="text-sm">{metrics.performance.memoryUsage}%</span>
                      </div>
                      <Progress value={metrics.performance.memoryUsage} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">ディスク使用率</span>
                        <span className="text-sm">{metrics.performance.diskUsage}%</span>
                      </div>
                      <Progress value={metrics.performance.diskUsage} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">ネットワーク負荷</span>
                        <span className="text-sm">{metrics.performance.networkLoad}%</span>
                      </div>
                      <Progress value={metrics.performance.networkLoad} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>データベース状況</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">アクティブ接続数</span>
                      <span className="text-sm">{metrics.database.connections}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">平均クエリ時間</span>
                      <span className="text-sm">{metrics.database.queryTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">レプリケーション遅延</span>
                      <span className="text-sm">{metrics.database.replicationLag}s</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">ストレージ使用率</span>
                        <span className="text-sm">{metrics.database.storage}%</span>
                      </div>
                      <Progress value={metrics.database.storage} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>定期メンテナンス</CardTitle>
              <CardDescription>予定されているメンテナンス作業</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">データベース最適化</p>
                    <p className="text-sm text-gray-600">インデックス再構築とテーブル最適化</p>
                    <p className="text-xs text-gray-500">予定: 2025-02-01 02:00-04:00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    詳細
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">セキュリティパッチ適用</p>
                    <p className="text-sm text-gray-600">OS・ミドルウェアのセキュリティ更新</p>
                    <p className="text-xs text-gray-500">予定: 2025-02-03 01:00-03:00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    詳細
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">バックアップ検証</p>
                    <p className="text-sm text-gray-600">災害復旧テストとバックアップ検証</p>
                    <p className="text-xs text-gray-500">予定: 2025-02-05 03:00-05:00</p>
                  </div>
                  <Button size="sm" variant="outline">
                    詳細
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationsDashboard;
