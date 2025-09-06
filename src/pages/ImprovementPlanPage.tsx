import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Code,
  Database,
  Package,
  GitBranch,
  TestTube,
  Shield,
  Sparkles,
  AlertTriangle,
  Zap,
  Rocket,
  BarChart3,
  Lightbulb,
  Settings,
  Monitor,
  Smartphone,
  Globe,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  category: 'ui' | 'architecture' | 'performance' | 'security' | 'ux' | 'devops';
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  estimatedDays: number;
  actualDays?: number;
  assignee?: string;
  dueDate?: string;
  tags: string[];
  dependencies?: string[];
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

const ImprovementPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [improvementItems, setImprovementItems] = useState<ImprovementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 改善項目の初期データ
  const initialImprovementItems: ImprovementItem[] = [
    {
      id: 'ui-unification',
      title: 'UIライブラリの統一',
      description: 'Material-UI、Radix UI、shadcn-uiを統一し、一貫したデザインシステムを構築',
      category: 'ui',
      priority: 'high',
      status: 'in_progress',
      progress: 30,
      estimatedDays: 14,
      actualDays: 4,
      assignee: 'フロントエンドチーム',
      dueDate: '2025-09-20',
      tags: ['UI', 'Design System', 'shadcn-ui'],
      dependencies: [],
      impact: 'high',
      effort: 'high',
    },
    {
      id: 'folder-restructure',
      title: 'フォルダ構造の再編成',
      description: '機能別モジュール構造への移行とコードの整理',
      category: 'architecture',
      priority: 'high',
      status: 'planned',
      progress: 0,
      estimatedDays: 21,
      assignee: 'アーキテクチャチーム',
      dueDate: '2025-10-10',
      tags: ['Architecture', 'Code Organization', 'Monorepo'],
      dependencies: ['ui-unification'],
      impact: 'high',
      effort: 'high',
    },
    {
      id: 'performance-optimization',
      title: 'パフォーマンス最適化',
      description: 'バンドルサイズの削減、レンダリング最適化、キャッシュ戦略の実装',
      category: 'performance',
      priority: 'medium',
      status: 'planned',
      progress: 0,
      estimatedDays: 10,
      assignee: 'パフォーマンスチーム',
      dueDate: '2025-10-01',
      tags: ['Performance', 'Bundle Size', 'Optimization'],
      dependencies: ['ui-unification'],
      impact: 'medium',
      effort: 'medium',
    },
    {
      id: 'security-hardening',
      title: 'セキュリティ強化',
      description: '認証・認可の改善、データ保護の強化、セキュリティ監査の実施',
      category: 'security',
      priority: 'high',
      status: 'planned',
      progress: 0,
      estimatedDays: 14,
      assignee: 'セキュリティチーム',
      dueDate: '2025-09-25',
      tags: ['Security', 'Authentication', 'Data Protection'],
      dependencies: [],
      impact: 'high',
      effort: 'medium',
    },
    {
      id: 'mobile-optimization',
      title: 'モバイル最適化',
      description: 'レスポンシブデザインの改善、モバイル専用機能の追加',
      category: 'ux',
      priority: 'medium',
      status: 'planned',
      progress: 0,
      estimatedDays: 7,
      assignee: 'UXチーム',
      dueDate: '2025-09-30',
      tags: ['Mobile', 'Responsive', 'UX'],
      dependencies: ['ui-unification'],
      impact: 'medium',
      effort: 'medium',
    },
    {
      id: 'testing-framework',
      title: 'テストフレームワークの整備',
      description: '単体テスト、統合テスト、E2Eテストの包括的なテストスイート構築',
      category: 'devops',
      priority: 'medium',
      status: 'in_progress',
      progress: 15,
      estimatedDays: 12,
      actualDays: 2,
      assignee: 'QAチーム',
      dueDate: '2025-10-05',
      tags: ['Testing', 'Quality Assurance', 'Automation'],
      dependencies: [],
      impact: 'medium',
      effort: 'high',
    },
  ];

  useEffect(() => {
    // 実際のAPIからデータを取得する処理
    const loadImprovementItems = async () => {
      setIsLoading(true);
      try {
        // モックデータを使用（実際のAPI実装時は置き換え）
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setImprovementItems(initialImprovementItems);
      } catch (error) {
        console.error('Failed to load improvement items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImprovementItems();
  }, []);

  // カテゴリ別のアイコン
  const categoryIcons = {
    ui: <Package className="h-5 w-5" />,
    architecture: <GitBranch className="h-5 w-5" />,
    performance: <TrendingUp className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />,
    ux: <Monitor className="h-5 w-5" />,
    devops: <Settings className="h-5 w-5" />,
  };

  // ステータス別の色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 優先度別の色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 影響度別の色
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // 統計データの計算
  const stats = {
    total: improvementItems.length,
    completed: improvementItems.filter((item) => item.status === 'completed').length,
    inProgress: improvementItems.filter((item) => item.status === 'in_progress').length,
    planned: improvementItems.filter((item) => item.status === 'planned').length,
    onHold: improvementItems.filter((item) => item.status === 'on_hold').length,
    highPriority: improvementItems.filter((item) => item.priority === 'high').length,
    totalEstimatedDays: improvementItems.reduce((sum, item) => sum + item.estimatedDays, 0),
    totalActualDays: improvementItems.reduce((sum, item) => sum + (item.actualDays || 0), 0),
  };

  // カテゴリ別の統計
  const categoryStats = improvementItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { total: 0, completed: 0, inProgress: 0 };
      }
      acc[item.category].total++;
      if (item.status === 'completed') acc[item.category].completed++;
      if (item.status === 'in_progress') acc[item.category].inProgress++;
      return acc;
    },
    {} as Record<string, { total: number; completed: number; inProgress: number }>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">改善計画を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💡 改善計画</h1>
        <p className="text-muted-foreground">サイトの継続的な改善と技術的負債の解消を管理します</p>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="items">改善項目</TabsTrigger>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* 統計カード */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総改善項目</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  完了: {stats.completed} / 進行中: {stats.inProgress}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">高優先度</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <p className="text-xs text-muted-foreground">緊急対応が必要</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">推定工数</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEstimatedDays}</div>
                <p className="text-xs text-muted-foreground">実績: {stats.totalActualDays}日</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">進捗率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">全体の完了率</p>
              </CardContent>
            </Card>
          </div>

          {/* カテゴリ別統計 */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別進捗</CardTitle>
              <CardDescription>各カテゴリの改善項目の進捗状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(categoryStats).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>
                          {data.completed}/{data.total}
                        </span>
                      </div>
                      <Progress
                        value={data.total > 0 ? (data.completed / data.total) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近の活動 */}
          <Card>
            <CardHeader>
              <CardTitle>最近の活動</CardTitle>
              <CardDescription>最近更新された改善項目</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {improvementItems
                  .filter((item) => item.status === 'in_progress')
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">{categoryIcons[item.category]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.assignee} • {item.progress}% 完了
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'in_progress' ? '進行中' : item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 改善項目タブ */}
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">改善項目一覧</h2>
            <Button onClick={() => navigate('/improvement-plan/new')}>
              <Lightbulb className="h-4 w-4 mr-2" />
              新しい改善項目を追加
            </Button>
          </div>

          <div className="grid gap-4">
            {improvementItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'in_progress'
                          ? '進行中'
                          : item.status === 'completed'
                            ? '完了'
                            : item.status === 'planned'
                              ? '計画中'
                              : '保留中'}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 進捗バー */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>

                    {/* メタデータ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">カテゴリ:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {categoryIcons[item.category]}
                          <span className="capitalize">{item.category}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">担当者:</span>
                        <div className="mt-1">{item.assignee || '未割り当て'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">工数:</span>
                        <div className="mt-1">
                          {item.actualDays ? `${item.actualDays}/` : ''}
                          {item.estimatedDays}日
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">期限:</span>
                        <div className="mt-1">{item.dueDate || '未設定'}</div>
                      </div>
                    </div>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/improvement-plan/${item.id}`)}
                      >
                        詳細を見る
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/improvement-plan/${item.id}/edit`)}
                      >
                        編集
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* タイムラインタブ */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>実装タイムライン</CardTitle>
              <CardDescription>改善項目の実装スケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvementItems
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime()
                  )
                  .map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            item.status === 'completed'
                              ? 'border-green-500 bg-green-100'
                              : item.status === 'in_progress'
                                ? 'border-blue-500 bg-blue-100'
                                : 'border-gray-300 bg-white'
                          }`}
                        >
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : item.status === 'in_progress' ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Calendar className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        {index < improvementItems.length - 1 && (
                          <div className="absolute top-10 h-full w-0.5 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          <span className="text-sm text-muted-foreground">{item.dueDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status === 'in_progress'
                              ? '進行中'
                              : item.status === 'completed'
                                ? '完了'
                                : item.status === 'planned'
                                  ? '計画中'
                                  : '保留中'}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === 'high'
                              ? '高優先度'
                              : item.priority === 'medium'
                                ? '中優先度'
                                : '低優先度'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            進捗: {item.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析タブ */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* カテゴリ別分析 */}
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別分析</CardTitle>
                <CardDescription>各カテゴリの改善項目数と進捗</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[category as keyof typeof categoryIcons]}
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {data.completed}/{data.total}
                        </span>
                      </div>
                      <Progress
                        value={data.total > 0 ? (data.completed / data.total) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 優先度別分析 */}
            <Card>
              <CardHeader>
                <CardTitle>優先度別分析</CardTitle>
                <CardDescription>優先度ごとの改善項目の分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['high', 'medium', 'low'].map((priority) => {
                    const count = improvementItems.filter(
                      (item) => item.priority === priority
                    ).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {priority === 'high'
                              ? '高優先度'
                              : priority === 'medium'
                                ? '中優先度'
                                : '低優先度'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count}件 ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 工数分析 */}
          <Card>
            <CardHeader>
              <CardTitle>工数分析</CardTitle>
              <CardDescription>推定工数と実績工数の比較</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalEstimatedDays}</div>
                  <div className="text-sm text-muted-foreground">推定工数（日）</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalActualDays}</div>
                  <div className="text-sm text-muted-foreground">実績工数（日）</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalEstimatedDays > 0
                      ? ((stats.totalActualDays / stats.totalEstimatedDays) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">工数効率</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => navigate('/improvement-plan/detail')}>
          <FileText className="h-4 w-4 mr-2" />
          詳細計画を見る
        </Button>
        <Button size="lg" onClick={() => navigate('/improvement-plan/new')}>
          <Plus className="h-4 w-4 mr-2" />
          新しい改善項目を追加
        </Button>
      </div>
    </div>
  );
};

export default ImprovementPlanPage;
