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
  TrendingDown,
  Target,
  Calendar,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  UserPlus,
  CreditCard,
  Globe,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SalesMetrics {
  revenue: {
    monthly: number;
    quarterly: number;
    yearly: number;
    target: number;
  };
  leads: {
    total: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  customers: {
    new: number;
    retained: number;
    churned: number;
    lifetime: number;
  };
  pipeline: {
    value: number;
    deals: number;
    avgDealSize: number;
    winRate: number;
  };
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: 'website' | 'referral' | 'cold-outreach' | 'marketing';
  status:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'closed-won'
    | 'closed-lost';
  value: number;
  probability: number;
  lastContact: string;
  nextAction: string;
  notes: string;
}

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  assignee: string;
  lastActivity: string;
}

const SalesDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/sales/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setLeads(data.leads);
        setDeals(data.deals);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          revenue: {
            monthly: 2450000,
            quarterly: 7200000,
            yearly: 28800000,
            target: 30000000,
          },
          leads: {
            total: 147,
            qualified: 89,
            converted: 34,
            lost: 12,
          },
          customers: {
            new: 23,
            retained: 156,
            churned: 8,
            lifetime: 245000,
          },
          pipeline: {
            value: 12500000,
            deals: 42,
            avgDealSize: 297619,
            winRate: 68,
          },
        });

        setLeads([
          {
            id: 'lead-1',
            name: '田中太郎',
            company: 'ABC株式会社',
            email: 'tanaka@abc.com',
            phone: '03-1234-5678',
            source: 'website',
            status: 'qualified',
            value: 500000,
            probability: 75,
            lastContact: '2025-01-28',
            nextAction: 'プロポーザル送付',
            notes: 'ADHD従業員20名の管理システム導入検討中',
          },
          {
            id: 'lead-2',
            name: '佐藤花子',
            company: 'XYZ商事',
            email: 'sato@xyz.com',
            phone: '03-9876-5432',
            source: 'referral',
            status: 'proposal',
            value: 1200000,
            probability: 85,
            lastContact: '2025-01-29',
            nextAction: '価格交渉',
            notes: 'エンタープライズプラン希望、カスタマイズ要求あり',
          },
          {
            id: 'lead-3',
            name: '山田次郎',
            company: 'DEF技研',
            email: 'yamada@def.com',
            phone: '03-5555-7777',
            source: 'marketing',
            status: 'new',
            value: 300000,
            probability: 25,
            lastContact: '2025-01-27',
            nextAction: '初回面談設定',
            notes: 'ウェビナー参加者、詳細ヒアリング必要',
          },
        ]);

        setDeals([
          {
            id: 'deal-1',
            title: 'ABC株式会社 - ベーシックプラン',
            customer: 'ABC株式会社',
            value: 500000,
            stage: 'プロポーザル',
            probability: 75,
            closeDate: '2025-02-15',
            assignee: '営業A',
            lastActivity: '要件定義書送付',
          },
          {
            id: 'deal-2',
            title: 'XYZ商事 - エンタープライズ',
            customer: 'XYZ商事',
            value: 1200000,
            stage: '交渉',
            probability: 85,
            closeDate: '2025-02-28',
            assignee: '営業B',
            lastActivity: '価格調整中',
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch sales metrics:', error);
      toast.error('メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // リードステータス更新
  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? { ...lead, status: status as any } : lead))
        );
        toast.success('リードステータスを更新しました');
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('リードの更新に失敗しました');
    }
  };

  // 商談作成
  const createDeal = async (leadId: string) => {
    try {
      const response = await fetch('/api/sales/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ leadId }),
      });

      if (response.ok) {
        toast.success('商談を作成しました');
        fetchMetrics(); // データを再取得
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast.error('商談の作成に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();

    // 20秒ごとに自動更新
    const interval = setInterval(fetchMetrics, 20000);
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
          <h1 className="text-3xl font-bold">営業ダッシュボード</h1>
          <p className="text-gray-600">
            最終更新: {lastUpdate.toLocaleString()} | 自動更新: 20秒間隔
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            新規リード
          </Button>
          <Button variant="default" size="sm">
            <FileText className="w-4 h-4 mr-1" />
            提案書作成
          </Button>
        </div>
      </div>

      {/* 目標達成アラート */}
      {metrics && metrics.revenue.monthly < metrics.revenue.target * 0.8 && (
        <Alert className="border-orange-500 bg-orange-50">
          <Target className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">月次目標への注意が必要です</AlertTitle>
          <AlertDescription className="text-orange-700">
            現在の売上は月次目標の
            {Math.round((metrics.revenue.monthly / (metrics.revenue.target / 12)) * 100)}%です。
            追加の営業活動が必要です。
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
                  <p className="text-sm font-medium text-gray-600">月次売上</p>
                  <p className="text-2xl font-bold">¥{metrics.revenue.monthly.toLocaleString()}</p>
                  <p className="text-xs text-green-600">
                    目標: ¥{(metrics.revenue.target / 12).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <Progress
                value={(metrics.revenue.monthly / (metrics.revenue.target / 12)) * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                達成率:{' '}
                {Math.round((metrics.revenue.monthly / (metrics.revenue.target / 12)) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">パイプライン価値</p>
                  <p className="text-2xl font-bold">¥{metrics.pipeline.value.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">{metrics.pipeline.deals}件の商談</p>
                </div>
                <PieChart className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                平均取引額: ¥{metrics.pipeline.avgDealSize.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">リード数</p>
                  <p className="text-2xl font-bold">{metrics.leads.total}</p>
                  <p className="text-xs text-orange-600">適格: {metrics.leads.qualified}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <Progress
                value={(metrics.leads.qualified / metrics.leads.total) * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                コンバージョン率:{' '}
                {Math.round((metrics.leads.converted / metrics.leads.total) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">受注率</p>
                  <p className="text-2xl font-bold">{metrics.pipeline.winRate}%</p>
                  <p className="text-xs text-green-600">新規顧客: {metrics.customers.new}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.pipeline.winRate} className="mt-2" />
              <div className="mt-1 text-xs text-gray-600">
                チャーン: {metrics.customers.churned}件
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="leads">リード管理</TabsTrigger>
          <TabsTrigger value="deals">商談管理</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日のアクション */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  今日のアクション
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">XYZ商事の価格交渉</p>
                      <p className="text-sm text-red-600">今日が回答期限 - ¥1,200,000案件</p>
                    </div>
                    <Badge variant="destructive">緊急</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium text-orange-800">ABC株式会社フォローアップ</p>
                      <p className="text-sm text-orange-600">プロポーザル送付後の確認</p>
                    </div>
                    <Badge variant="secondary">高</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium text-yellow-800">新規リードの初回面談</p>
                      <p className="text-sm text-yellow-600">DEF技研との面談設定</p>
                    </div>
                    <Badge variant="outline">中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* パフォーマンス */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  パフォーマンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">月次目標達成率</span>
                      <span className="text-sm">
                        {Math.round(
                          (metrics.revenue.monthly / (metrics.revenue.target / 12)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(metrics.revenue.monthly / (metrics.revenue.target / 12)) * 100}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">リード品質</span>
                      <span className="text-sm">
                        {Math.round((metrics.leads.qualified / metrics.leads.total) * 100)}%
                      </span>
                    </div>
                    <Progress value={(metrics.leads.qualified / metrics.leads.total) * 100} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">顧客満足度</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm">4.7/5.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>リード一覧</CardTitle>
              <CardDescription>見込み客の管理と追跡</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{lead.name}</h3>
                            <Badge variant="outline">{lead.company}</Badge>
                            <Badge
                              variant={
                                lead.status === 'qualified'
                                  ? 'default'
                                  : lead.status === 'new'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {lead.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lead.notes}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>💰 ¥{lead.value.toLocaleString()}</span>
                            <span>📈 {lead.probability}%</span>
                            <span>📞 {lead.phone}</span>
                            <span>📧 {lead.email}</span>
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            次のアクション: {lead.nextAction}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextStatus =
                                lead.status === 'new'
                                  ? 'contacted'
                                  : lead.status === 'contacted'
                                    ? 'qualified'
                                    : lead.status === 'qualified'
                                      ? 'proposal'
                                      : 'negotiation';
                              updateLeadStatus(lead.id, nextStatus);
                            }}
                          >
                            進捗更新
                          </Button>
                          {lead.status === 'qualified' && (
                            <Button size="sm" onClick={() => createDeal(lead.id)}>
                              商談作成
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>商談管理</CardTitle>
              <CardDescription>進行中の商談の追跡</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <Card key={deal.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{deal.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>💰 ¥{deal.value.toLocaleString()}</span>
                            <span>📈 {deal.probability}%</span>
                            <span>📅 {deal.closeDate}</span>
                            <span>👤 {deal.assignee}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge>{deal.stage}</Badge>
                            <Progress value={deal.probability} className="w-24" />
                          </div>
                          <p className="text-xs text-gray-500">最終活動: {deal.lastActivity}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            編集
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

        <TabsContent value="analytics" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>売上トレンド</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">月次売上</span>
                        <span className="text-sm text-green-600">
                          ¥{metrics.revenue.monthly.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={80} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">四半期売上</span>
                        <span className="text-sm text-blue-600">
                          ¥{metrics.revenue.quarterly.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">年次売上</span>
                        <span className="text-sm text-purple-600">
                          ¥{metrics.revenue.yearly.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={96} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>顧客分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">新規顧客</span>
                      <span className="text-sm text-green-600">{metrics.customers.new}社</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">継続顧客</span>
                      <span className="text-sm text-blue-600">{metrics.customers.retained}社</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">解約顧客</span>
                      <span className="text-sm text-red-600">{metrics.customers.churned}社</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">顧客生涯価値</span>
                      <span className="text-sm text-purple-600">
                        ¥{metrics.customers.lifetime.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesDashboard;
