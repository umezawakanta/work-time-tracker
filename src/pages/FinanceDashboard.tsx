import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  CreditCard,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Plus,
  Banknote,
  Building2,
  Globe,
  Scale,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FinanceMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    recurring: number;
  };
  expenses: {
    current: number;
    budget: number;
    categories: { [key: string]: number };
    variance: number;
  };
  billing: {
    outstanding: number;
    overdue: number;
    processed: number;
    disputes: number;
  };
  cash: {
    balance: number;
    inflow: number;
    outflow: number;
    forecast: number;
  };
}

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'disputed';
  dueDate: string;
  issueDate: string;
  description: string;
  paymentMethod?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approver?: string;
  receipt?: string;
}

interface TaxTask {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'filed';
  amount?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const FinanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [taxTasks, setTaxTasks] = useState<TaxTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/finance/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setInvoices(data.invoices);
        setExpenses(data.expenses);
        setTaxTasks(data.taxTasks);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          revenue: {
            current: 2450000,
            previous: 2180000,
            growth: 12.4,
            recurring: 1980000,
          },
          expenses: {
            current: 1650000,
            budget: 1800000,
            categories: {
              人件費: 950000,
              インフラ: 280000,
              マーケティング: 220000,
              その他: 200000,
            },
            variance: -8.3,
          },
          billing: {
            outstanding: 580000,
            overdue: 120000,
            processed: 1870000,
            disputes: 3,
          },
          cash: {
            balance: 3200000,
            inflow: 2450000,
            outflow: 1650000,
            forecast: 4000000,
          },
        });

        setInvoices([
          {
            id: 'inv-001',
            customer: 'ABC株式会社',
            amount: 580000,
            status: 'sent',
            dueDate: '2025-02-15',
            issueDate: '2025-01-15',
            description: 'エンタープライズプラン月額利用料',
          },
          {
            id: 'inv-002',
            customer: 'XYZ商事',
            amount: 120000,
            status: 'overdue',
            dueDate: '2025-01-31',
            issueDate: '2025-01-01',
            description: 'ベーシックプラン月額利用料',
          },
          {
            id: 'inv-003',
            customer: 'DEF技研',
            amount: 350000,
            status: 'paid',
            dueDate: '2025-02-28',
            issueDate: '2025-01-28',
            description: 'プレミアムプラン初期費用',
            paymentMethod: 'bank_transfer',
          },
        ]);

        setExpenses([
          {
            id: 'exp-001',
            description: 'AWS インフラ利用料',
            amount: 45000,
            category: 'インフラ',
            date: '2025-01-29',
            status: 'approved',
            approver: '経理部長',
          },
          {
            id: 'exp-002',
            description: 'マーケティング広告費',
            amount: 180000,
            category: 'マーケティング',
            date: '2025-01-28',
            status: 'pending',
          },
          {
            id: 'exp-003',
            description: 'オフィス賃料',
            amount: 250000,
            category: 'その他',
            date: '2025-01-27',
            status: 'paid',
            approver: '総務部',
          },
        ]);

        setTaxTasks([
          {
            id: 'tax-001',
            title: '消費税申告（1月分）',
            type: 'monthly',
            dueDate: '2025-02-28',
            status: 'pending',
            amount: 98000,
            priority: 'high',
          },
          {
            id: 'tax-002',
            title: '法人税四半期予定納税',
            type: 'quarterly',
            dueDate: '2025-03-31',
            status: 'in-progress',
            amount: 450000,
            priority: 'critical',
          },
          {
            id: 'tax-003',
            title: '源泉所得税納付',
            type: 'monthly',
            dueDate: '2025-02-10',
            status: 'completed',
            amount: 125000,
            priority: 'medium',
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch finance metrics:', error);
      toast.error('財務メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 請求書ステータス更新
  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInvoices((prev) =>
          prev.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, status: status as any } : invoice
          )
        );
        toast.success('請求書ステータスを更新しました');
      }
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error('請求書の更新に失敗しました');
    }
  };

  // 経費承認
  const approveExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/finance/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setExpenses((prev) =>
          prev.map((expense) =>
            expense.id === expenseId ? { ...expense, status: 'approved' } : expense
          )
        );
        toast.success('経費を承認しました');
      }
    } catch (error) {
      console.error('Failed to approve expense:', error);
      toast.error('経費の承認に失敗しました');
    }
  };

  // 財務レポート生成
  const generateFinancialReport = async (period: string) => {
    try {
      const response = await fetch(`/api/finance/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ period }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `financial-report-${period}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('財務レポートをダウンロードしました');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('レポート生成に失敗しました');
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
          <h1 className="text-3xl font-bold">経理ダッシュボード</h1>
          <p className="text-gray-600">
            最終更新: {lastUpdate.toLocaleString()} | 自動更新: 30秒間隔
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm" onClick={() => generateFinancialReport('monthly')}>
            <Download className="w-4 h-4 mr-1" />
            月次レポート
          </Button>
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            請求書作成
          </Button>
        </div>
      </div>

      {/* 緊急アラート */}
      {metrics &&
        (metrics.billing.overdue > 100000 ||
          taxTasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').length >
            0) && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">緊急対応が必要です</AlertTitle>
            <AlertDescription className="text-red-700">
              {metrics.billing.overdue > 100000 &&
                `未回収債権 ¥${metrics.billing.overdue.toLocaleString()}があります。`}
              {taxTasks.filter((t) => t.priority === 'critical' && t.status !== 'completed')
                .length > 0 && ' 重要な税務手続きの期限が迫っています。'}
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
                  <p className="text-2xl font-bold">¥{metrics.revenue.current.toLocaleString()}</p>
                  <p className="text-xs text-green-600">前月比 +{metrics.revenue.growth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                継続売上: ¥{metrics.revenue.recurring.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">月次経費</p>
                  <p className="text-2xl font-bold">¥{metrics.expenses.current.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">
                    予算: ¥{metrics.expenses.budget.toLocaleString()}
                  </p>
                </div>
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
              <Progress
                value={
                  ((metrics.expenses.budget - metrics.expenses.current) / metrics.expenses.budget) *
                  100
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                差額: {metrics.expenses.variance > 0 ? '+' : ''}
                {metrics.expenses.variance}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">未回収債権</p>
                  <p className="text-2xl font-bold">
                    ¥{metrics.billing.outstanding.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600">
                    期限超過: ¥{metrics.billing.overdue.toLocaleString()}
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                処理済み: ¥{metrics.billing.processed.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">現金残高</p>
                  <p className="text-2xl font-bold">¥{metrics.cash.balance.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">
                    予測: ¥{metrics.cash.forecast.toLocaleString()}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                流入: ¥{metrics.cash.inflow.toLocaleString()} | 流出: ¥
                {metrics.cash.outflow.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="billing">請求管理</TabsTrigger>
          <TabsTrigger value="expenses">経費管理</TabsTrigger>
          <TabsTrigger value="tax">税務</TabsTrigger>
          <TabsTrigger value="reports">レポート</TabsTrigger>
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
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">法人税四半期予定納税</p>
                      <p className="text-sm text-red-600">期限: 2025-03-31 - ¥450,000</p>
                    </div>
                    <Badge variant="destructive">緊急</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium text-orange-800">XYZ商事 未払い請求書</p>
                      <p className="text-sm text-orange-600">期限超過 - ¥120,000</p>
                    </div>
                    <Badge variant="secondary">高</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium text-yellow-800">マーケティング経費承認</p>
                      <p className="text-sm text-yellow-600">¥180,000の広告費承認待ち</p>
                    </div>
                    <Badge variant="outline">中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 経費カテゴリ分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  経費カテゴリ分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    {Object.entries(metrics.expenses.categories).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(amount / Math.max(...Object.values(metrics.expenses.categories))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">¥{amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>請求書管理</CardTitle>
              <CardDescription>発行済み請求書の管理と回収状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{invoice.customer}</h3>
                            <Badge
                              variant={
                                invoice.status === 'paid'
                                  ? 'default'
                                  : invoice.status === 'overdue'
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{invoice.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>金額: ¥{invoice.amount.toLocaleString()}</span>
                            <span>発行日: {invoice.issueDate}</span>
                            <span>期限: {invoice.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {invoice.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              入金確認
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
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

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>経費管理</CardTitle>
              <CardDescription>経費申請の承認と管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{expense.description}</h3>
                            <Badge
                              variant={
                                expense.status === 'approved'
                                  ? 'default'
                                  : expense.status === 'pending'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {expense.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>金額: ¥{expense.amount.toLocaleString()}</span>
                            <span>カテゴリ: {expense.category}</span>
                            <span>日付: {expense.date}</span>
                            {expense.approver && <span>承認者: {expense.approver}</span>}
                          </div>
                        </div>
                        <div className="flex space-y-2 flex-col">
                          {expense.status === 'pending' && (
                            <Button size="sm" onClick={() => approveExpense(expense.id)}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              承認
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
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

        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>税務管理</CardTitle>
              <CardDescription>税務申告と納税スケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge
                              variant={
                                task.priority === 'critical'
                                  ? 'destructive'
                                  : task.priority === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">{task.status}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>期限: {task.dueDate}</span>
                            <span>種類: {task.type}</span>
                            {task.amount && <span>金額: ¥{task.amount.toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            詳細
                          </Button>
                          {task.status !== 'completed' && (
                            <Button size="sm">
                              <Upload className="w-3 h-3 mr-1" />
                              申告
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

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>財務レポート生成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateFinancialReport('monthly')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    月次財務レポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateFinancialReport('quarterly')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    四半期財務レポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateFinancialReport('annual')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    年次財務レポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateFinancialReport('tax')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    税務申告用レポート
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>KPI監視</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">売上成長率</span>
                      <span className="text-sm text-green-600">+12.4%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">利益率</span>
                      <span className="text-sm text-blue-600">32.7%</span>
                    </div>
                    <Progress value={65} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">回収率</span>
                      <span className="text-sm text-orange-600">79.3%</span>
                    </div>
                    <Progress value={79} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">予算達成率</span>
                      <span className="text-sm text-purple-600">91.7%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
