import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Play,
  Pause,
  Target,
  Users,
  FileText,
  Zap,
  Shield,
  Activity,
} from 'lucide-react';
import { api } from '@/services/api/apiConfig';
import { toast } from 'react-hot-toast';

interface AdminFeature {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  status: string;
  requiresRealAPI?: boolean;
  priority?: string;
  disabled?: boolean;
  targetRelease?: string;
  createdAt?: string;
  updatedAt?: string;
  completionRate?: number;
  dependencies?: string[];
  blockers?: string[];
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  lastActivity?: string;
  testCoverage?: number;
  documentationStatus?: 'none' | 'partial' | 'complete';
  deploymentStatus?: 'not_deployed' | 'staging' | 'production';
  userFeedback?: {
    rating: number;
    count: number;
    lastUpdated: string;
  };
}

interface AdminFeaturesResponse {
  success: boolean;
  features: AdminFeature[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    completionRate: number;
    overdueCount: number;
    thisWeekCount: number;
  };
  lastUpdated: string;
}

const statusLabels: Record<string, string> = {
  planning: '計画中',
  designing: '設計中',
  developing: '開発中',
  unit_testing: '単体テスト中',
  integration_testing: '結合テスト中',
  system_testing: '総合テスト中',
  documenting: 'ドキュメント整備中',
  review: '確認中',
  release_pending: 'リリース待ち',
  complete: '完成',
  planned: '計画中',
  in_progress: '開発中',
  testing: '単体テスト中',
  docs: 'ドキュメント整備中',
};

const statusBadgeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  planning: 'outline',
  designing: 'outline',
  developing: 'secondary',
  unit_testing: 'secondary',
  integration_testing: 'secondary',
  system_testing: 'secondary',
  documenting: 'outline',
  review: 'secondary',
  release_pending: 'secondary',
  complete: 'default',
  planned: 'outline',
  in_progress: 'secondary',
  testing: 'secondary',
  docs: 'outline',
};

const priorityColors: Record<string, string> = {
  P0: 'text-red-600 bg-red-50 border-red-200',
  P1: 'text-orange-600 bg-orange-50 border-orange-200',
  P2: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  P3: 'text-gray-600 bg-gray-50 border-gray-200',
};

const categoryIcons: Record<string, React.ReactNode> = {
  勤怠管理: <Clock className="h-4 w-4" />,
  生産性: <Target className="h-4 w-4" />,
  運用: <Settings className="h-4 w-4" />,
  分析: <BarChart3 className="h-4 w-4" />,
  学習: <FileText className="h-4 w-4" />,
  診断: <Activity className="h-4 w-4" />,
  管理機能: <Shield className="h-4 w-4" />,
};

const getReleaseDateStatus = (targetRelease?: string, status?: string) => {
  if (!targetRelease)
    return { status: 'none', color: 'text-gray-500', bgColor: 'bg-gray-50', icon: Calendar };

  const releaseDate = new Date(targetRelease);
  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const isOverdue = releaseDate < today && status !== 'complete';
  const isThisWeek = releaseDate >= today && releaseDate <= oneWeekFromNow && status !== 'complete';

  if (isOverdue) {
    return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
  } else if (isThisWeek) {
    return { status: 'thisWeek', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock };
  } else {
    return { status: 'normal', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Calendar };
  }
};

export const AdminFeaturesList: React.FC = () => {
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [summary, setSummary] = useState<AdminFeaturesResponse['summary'] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'priority' | 'completion' | 'release'>(
    'priority'
  );
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/features');
      if (response.data.success) {
        setFeatures(response.data.features);
        setSummary(response.data.summary);
        setLastUpdated(response.data.lastUpdated);
      } else {
        toast.error('機能一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
      toast.error('機能一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      const matchesSearch =
        searchQuery === '' ||
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || feature.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || feature.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [features, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const sortedFeatures = useMemo(() => {
    return [...filteredFeatures].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'priority':
          const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
          return (
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
          );
        case 'completion':
          return (b.completionRate || 0) - (a.completionRate || 0);
        case 'release':
          if (!a.targetRelease && !b.targetRelease) return 0;
          if (!a.targetRelease) return 1;
          if (!b.targetRelease) return -1;
          return new Date(a.targetRelease).getTime() - new Date(b.targetRelease).getTime();
        default:
          return 0;
      }
    });
  }, [filteredFeatures, sortBy]);

  const handleRefresh = () => {
    fetchFeatures();
    toast.success('機能一覧を更新しました');
  };

  const handleExport = () => {
    const csvContent = [
      [
        'ID',
        '名前',
        'カテゴリ',
        'ステータス',
        '優先度',
        '完成率',
        'リリース予定日',
        '実API',
        '説明',
      ].join(','),
      ...sortedFeatures.map((feature) =>
        [
          feature.id,
          `"${feature.name}"`,
          feature.category,
          feature.status,
          feature.priority,
          feature.completionRate || 0,
          feature.targetRelease || '',
          feature.requiresRealAPI ? 'Yes' : 'No',
          `"${feature.description || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `features-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSVファイルをダウンロードしました');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">機能一覧を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">機能一覧管理</h2>
          <p className="text-gray-600">全機能の開発状況と管理</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* サマリーカード */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総機能数</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">完成率</p>
                  <p className="text-2xl font-bold">{summary.completionRate}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今週リリース</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.thisWeekCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">遅延中</p>
                  <p className="text-2xl font-bold text-red-600">{summary.overdueCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フィルターとコントロール */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="機能名、説明、カテゴリで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                {Array.from(new Set(features.map((f) => f.category))).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="優先度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="P0">P0</SelectItem>
                <SelectItem value="P1">P1</SelectItem>
                <SelectItem value="P2">P2</SelectItem>
                <SelectItem value="P3">P3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="並び順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">優先度</SelectItem>
                <SelectItem value="name">名前</SelectItem>
                <SelectItem value="status">ステータス</SelectItem>
                <SelectItem value="completion">完成率</SelectItem>
                <SelectItem value="release">リリース日</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 機能一覧テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>機能一覧 ({filteredFeatures.length}件)</CardTitle>
          <CardDescription>
            最終更新: {lastUpdated ? new Date(lastUpdated).toLocaleString() : '不明'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>優先度</TableHead>
                  <TableHead>機能名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>完成率</TableHead>
                  <TableHead>リリース予定</TableHead>
                  <TableHead>実API</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFeatures.map((feature) => {
                  const releaseStatus = getReleaseDateStatus(feature.targetRelease, feature.status);
                  const IconComponent = releaseStatus.icon;

                  return (
                    <TableRow key={feature.id} className={releaseStatus.bgColor}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={priorityColors[feature.priority || 'P3']}
                        >
                          {feature.priority || 'P3'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {categoryIcons[feature.category]}
                          <span className="font-medium">{feature.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feature.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariants[feature.status]}>
                          {statusLabels[feature.status] || feature.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={feature.completionRate || 0} className="w-16" />
                          <span className="text-sm text-gray-600">
                            {feature.completionRate || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {feature.targetRelease ? (
                          <div className="flex items-center gap-1">
                            <IconComponent className={`h-3 w-3 ${releaseStatus.color}`} />
                            <span className={`text-xs ${releaseStatus.color}`}>
                              {new Date(feature.targetRelease).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">未設定</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {feature.requiresRealAPI ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {feature.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
