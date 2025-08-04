import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Settings,
  Shield,
  Database,
  Activity,
  UserPlus,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SocialShareButton from '@/components/ui/SocialShareButton';

interface AdminMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    churnRate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    todayRevenue: number;
    conversionRate: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  support: {
    openTickets: number;
    avgResponseTime: string;
    satisfaction: number;
  };
}

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'users' | 'revenue' | 'system' | 'support';
  deadline?: string;
  assignee?: string;
  completed: boolean;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setPriorityActions(data.priorityActions);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          users: {
            total: 1247,
            active: 892,
            newToday: 23,
            churnRate: 2.1,
          },
          revenue: {
            mrr: 980000,
            arr: 11760000,
            todayRevenue: 32400,
            conversionRate: 15.3,
          },
          system: {
            uptime: 99.97,
            responseTime: 245,
            errorRate: 0.03,
            activeConnections: 156,
          },
          support: {
            openTickets: 12,
            avgResponseTime: '2.3h',
            satisfaction: 4.6,
          },
        });

        setPriorityActions([
          {
            id: 'action1',
            title: 'サーバー容量の監視',
            description: 'データベース使用量が80%に達しています。スケーリングの検討が必要です。',
            urgency: 'high',
            category: 'system',
            deadline: '2025-02-01',
            assignee: '運用チーム',
            completed: false,
          },
          {
            id: 'action2',
            title: '新規契約企業への対応',
            description: '大手企業3社からエンタープライズプランの引き合いがあります。',
            urgency: 'high',
            category: 'revenue',
            deadline: '2025-01-31',
            assignee: '営業チーム',
            completed: false,
          },
          {
            id: 'action3',
            title: 'セキュリティ監査実施',
            description: '四半期セキュリティ監査の実施時期です。',
            urgency: 'medium',
            category: 'system',
            deadline: '2025-02-15',
            assignee: 'セキュリティチーム',
            completed: false,
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error);
      toast.error('メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // アクション完了処理
  const completeAction = async (actionId: string) => {
    try {
      const response = await fetch(`/api/admin/actions/${actionId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setPriorityActions((prev) =>
          prev.map((action) => (action.id === actionId ? { ...action, completed: true } : action))
        );
        toast.success('アクションを完了しました');
      }
    } catch (error) {
      console.error('Failed to complete action:', error);
      toast.error('アクションの完了に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();

    // 30秒ごとに自動更新
    const interval = setInterval(fetchMetrics, 30000);
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
          <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          <p className="text-gray-600">最終更新: {lastUpdate.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* 重要アラート */}
      {priorityActions.filter((action) => action.urgency === 'critical' && !action.completed)
        .length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">緊急対応が必要です</AlertTitle>
          <AlertDescription className="text-red-700">
            {
              priorityActions.filter((action) => action.urgency === 'critical' && !action.completed)
                .length
            }
            件の緊急タスクがあります。
          </AlertDescription>
        </Alert>
      )}

      {/* メトリクス概要 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold">{metrics.users.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{metrics.users.newToday} 今日</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <Progress
                value={(metrics.users.active / metrics.users.total) * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                アクティブ率: {Math.round((metrics.users.active / metrics.users.total) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">月次売上 (MRR)</p>
                  <p className="text-2xl font-bold">¥{metrics.revenue.mrr.toLocaleString()}</p>
                  <p className="text-xs text-green-600">
                    +¥{metrics.revenue.todayRevenue.toLocaleString()} 今日
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.revenue.conversionRate} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                コンバージョン率: {metrics.revenue.conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">システム稼働率</p>
                  <p className="text-2xl font-bold">{metrics.system.uptime}%</p>
                  <p className="text-xs text-blue-600">{metrics.system.responseTime}ms 平均応答</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <Progress value={metrics.system.uptime} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">エラー率: {metrics.system.errorRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">サポート</p>
                  <p className="text-2xl font-bold">{metrics.support.openTickets}</p>
                  <p className="text-xs text-orange-600">未対応チケット</p>
                </div>
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-xs text-gray-600">
                  平均応答: {metrics.support.avgResponseTime} | 満足度:{' '}
                  {metrics.support.satisfaction}/5
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="actions">優先アクション</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日のタスク */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  今日の重要タスク
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priorityActions.slice(0, 3).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={action.urgency === 'critical' ? 'destructive' : 'secondary'}
                          >
                            {action.urgency}
                          </Badge>
                          {action.deadline && (
                            <span className="text-xs text-gray-500">期限: {action.deadline}</span>
                          )}
                        </div>
                      </div>
                      {!action.completed && (
                        <Button size="sm" onClick={() => completeAction(action.id)}>
                          完了
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* システム状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  システム状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">データベース</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API サーバー</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CDN</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">決済システム</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">正常</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>優先アクション一覧</CardTitle>
              <CardDescription>緊急度の高い順に表示されています</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityActions.map((action) => (
                  <Card key={action.id} className={action.completed ? 'opacity-50' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{action.title}</h3>
                            <Badge
                              variant={
                                action.urgency === 'critical'
                                  ? 'destructive'
                                  : action.urgency === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {action.urgency}
                            </Badge>
                            {action.completed && (
                              <Badge variant="outline" className="text-green-600">
                                完了
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{action.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {action.assignee && <span>担当: {action.assignee}</span>}
                            {action.deadline && <span>期限: {action.deadline}</span>}
                            <span>カテゴリ: {action.category}</span>
                          </div>
                        </div>
                        {!action.completed && (
                          <Button size="sm" onClick={() => completeAction(action.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            完了
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard isAdminUser={true} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>システム設定</CardTitle>
              <CardDescription>管理者のみアクセス可能な設定項目</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI設定 */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">🤖 Gemini AI設定</h4>
                        <p className="text-sm text-blue-700">
                          AIアイゼンハワーマトリックスを有効化
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        要設定
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>設定方法:</strong>
                        <br />
                        1. プロジェクトルートに <code>.env.local</code> ファイルを作成
                        <br />
                        2. <code>VITE_GEMINI_API_KEY=your_api_key</code> を追加
                        <br />
                        3.{' '}
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Google AI Studio
                        </a>{' '}
                        でキーを取得
                        <br />
                        4. 開発サーバーを再起動 (<code>pnpm dev</code>)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* SNSシェア機能 */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900">📢 SNSシェア機能</h4>
                        <p className="text-sm text-green-700">ユーザー拡散とマーケティング</p>
                      </div>
                      <SocialShareButton
                        title="Work Time Tracker - AI搭載タスク管理"
                        description="ADHDユーザー特化のAI搭載タスク管理ツール！"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 既存の設定項目 */}
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  ユーザー管理
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  決済設定
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  セキュリティ設定
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  データベース管理
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  システム設定
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
