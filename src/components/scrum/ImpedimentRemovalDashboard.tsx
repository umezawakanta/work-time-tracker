import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Filter,
  Search,
  Plus,
  Calendar,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Impediment {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'process' | 'resource' | 'external' | 'communication' | 'skill';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'blocked';
  priority: number; // 1-5
  reportedBy: string;
  assignedTo?: string;
  affectedTeam: string;
  affectedSprint?: string;
  reportedDate: string;
  resolvedDate?: string;
  estimatedEffort: number; // hours
  actualEffort?: number; // hours
  impact: 'blocker' | 'major' | 'minor' | 'suggestion';
  tags: string[];
  relatedStories: string[];
  comments: Comment[];
  resolution?: Resolution;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'update' | 'solution' | 'escalation' | 'question';
}

interface Resolution {
  solution: string;
  preventiveMeasures: string[];
  lessonsLearned: string[];
  resolvedBy: string;
  category: 'fixed' | 'workaround' | 'duplicate' | 'wont_fix' | 'process_change';
}

interface ImpedimentMetrics {
  totalImpediments: number;
  openImpediments: number;
  resolvedImpediments: number;
  averageResolutionTime: number; // hours
  impedimentsByType: Record<string, number>;
  impedimentsBySeverity: Record<string, number>;
  resolutionRate: number; // percentage
  escalationRate: number; // percentage
  preventionSuccess: number; // percentage
}

export const ImpedimentRemovalDashboard: React.FC = () => {
  const [impediments, setImpediments] = useState<Impediment[]>([]);
  const [selectedImpediment, setSelectedImpediment] = useState<Impediment | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeImpediments();
  }, []);

  const initializeImpediments = async () => {
    try {
      setIsLoading(true);

      // 実際のAPI呼び出し
      const response = await fetch('/api/scrum/impediments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setImpediments(data.data);
          return;
        }
      }

      // API接続失敗時は空の配列を設定
      console.warn('Impediments API not available');
      setImpediments([]);

      throw new Error('Impediments API is not available in production');
    } catch (error) {
      console.error('Failed to load impediments:', error);
      setImpediments([]);
      // エラー通知を表示
      if (typeof toast !== 'undefined') {
        toast.error('障害データの取得に失敗しました。管理者にお問い合わせください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (): ImpedimentMetrics => {
    const totalImpediments = impediments.length;
    const openImpediments = impediments.filter((i) => i.status === 'open').length;
    const resolvedImpediments = impediments.filter((i) => i.status === 'resolved').length;

    const resolvedWithTime = impediments.filter(
      (i) => i.status === 'resolved' && i.reportedDate && i.resolvedDate
    );

    const averageResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((acc, imp) => {
            const reported = new Date(imp.reportedDate);
            const resolved = new Date(imp.resolvedDate!);
            return acc + (resolved.getTime() - reported.getTime()) / (1000 * 60 * 60);
          }, 0) / resolvedWithTime.length
        : 0;

    const impedimentsByType = impediments.reduce(
      (acc, imp) => {
        acc[imp.type] = (acc[imp.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const impedimentsBySeverity = impediments.reduce(
      (acc, imp) => {
        acc[imp.severity] = (acc[imp.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalImpediments,
      openImpediments,
      resolvedImpediments,
      averageResolutionTime,
      impedimentsByType,
      impedimentsBySeverity,
      resolutionRate: totalImpediments > 0 ? (resolvedImpediments / totalImpediments) * 100 : 0,
      escalationRate: 15, // シミュレーション値
      preventionSuccess: 85, // シミュレーション値
    };
  };

  const getFilteredImpediments = () => {
    return impediments.filter((imp) => {
      const matchesType = filterType === 'all' || imp.type === filterType;
      const matchesStatus = filterStatus === 'all' || imp.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        imp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imp.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  };

  const getSeverityColor = (severity: Impediment['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: Impediment['status']) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: Impediment['impact']) => {
    switch (impact) {
      case 'blocker':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'major':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'minor':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suggestion':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const metrics = calculateMetrics();
  const filteredImpediments = getFilteredImpediments();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">障害除去ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">
            スクラムチームの障害を特定・追跡・解決してスプリント目標達成を支援
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新規障害登録
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
          <TabsTrigger value="impediments">障害一覧</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="process">プロセス改善</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* メトリクスカード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">総障害数</p>
                    <p className="text-2xl font-bold text-primary">{metrics.totalImpediments}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">未解決</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.openImpediments}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">解決済み</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.resolvedImpediments}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">解決率</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.resolutionRate.toFixed(0)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 進行中の重要障害 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                緊急対応が必要な障害
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {impediments
                  .filter(
                    (imp) =>
                      (imp.severity === 'critical' || imp.severity === 'high') &&
                      imp.status !== 'resolved'
                  )
                  .slice(0, 5)
                  .map((impediment) => (
                    <div
                      key={impediment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedImpediment(impediment)}
                    >
                      <div className="flex items-center gap-3">
                        {getImpactIcon(impediment.impact)}
                        <div>
                          <h4 className="font-semibold text-sm">{impediment.title}</h4>
                          <p className="text-xs text-muted-foreground">{impediment.affectedTeam}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(impediment.severity)}>
                          {impediment.severity}
                        </Badge>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(impediment.status)}`}
                        >
                          {impediment.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impediments" className="space-y-4">
          {/* フィルターバー */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="障害を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="種類で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全種類</SelectItem>
                <SelectItem value="technical">技術的</SelectItem>
                <SelectItem value="process">プロセス</SelectItem>
                <SelectItem value="resource">リソース</SelectItem>
                <SelectItem value="external">外部</SelectItem>
                <SelectItem value="communication">コミュニケーション</SelectItem>
                <SelectItem value="skill">スキル</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="open">未着手</SelectItem>
                <SelectItem value="in_progress">対応中</SelectItem>
                <SelectItem value="resolved">解決済み</SelectItem>
                <SelectItem value="blocked">ブロック中</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 障害一覧 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>障害一覧 ({filteredImpediments.length}件)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredImpediments.slice(0, 20).map((impediment) => (
                  <div
                    key={impediment.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedImpediment?.id === impediment.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedImpediment(impediment)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{impediment.title}</h4>
                      <div className="flex items-center gap-1">
                        {getImpactIcon(impediment.impact)}
                        <Badge variant={getSeverityColor(impediment.severity)}>
                          {impediment.severity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{impediment.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {impediment.affectedTeam}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full ${getStatusColor(impediment.status)}`}
                      >
                        {impediment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredImpediments.length > 20 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">
                      他 {filteredImpediments.length - 20} 件
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 詳細表示 */}
            <div className="lg:col-span-2">
              {selectedImpediment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedImpediment.title}
                      <div className="flex gap-2">
                        <Badge variant={getSeverityColor(selectedImpediment.severity)}>
                          {selectedImpediment.severity}
                        </Badge>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedImpediment.status)}`}
                        >
                          {selectedImpediment.status}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{selectedImpediment.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">種類:</span> {selectedImpediment.type}
                      </div>
                      <div>
                        <span className="font-medium">影響:</span> {selectedImpediment.impact}
                      </div>
                      <div>
                        <span className="font-medium">報告者:</span> {selectedImpediment.reportedBy}
                      </div>
                      <div>
                        <span className="font-medium">担当者:</span>{' '}
                        {selectedImpediment.assignedTo || '未割り当て'}
                      </div>
                      <div>
                        <span className="font-medium">影響チーム:</span>{' '}
                        {selectedImpediment.affectedTeam}
                      </div>
                      <div>
                        <span className="font-medium">関連スプリント:</span>{' '}
                        {selectedImpediment.affectedSprint || 'なし'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">タグ</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedImpediment.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedImpediment.resolution && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">解決方法</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedImpediment.resolution.solution}
                        </p>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">予防策:</h5>
                          <ul className="text-sm space-y-1">
                            {selectedImpediment.resolution.preventiveMeasures.map(
                              (measure, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  {measure}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedImpediment.comments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">コメント</h4>
                        <div className="space-y-2">
                          {selectedImpediment.comments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>種類別障害分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.impedimentsByType).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span>{count}件</span>
                      </div>
                      <Progress value={(count / metrics.totalImpediments) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>重要度別分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.impedimentsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{severity}</span>
                        <span>{count}件</span>
                      </div>
                      <Progress value={(count / metrics.totalImpediments) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {metrics.averageResolutionTime.toFixed(1)}h
                  </p>
                  <p className="text-sm text-muted-foreground">平均解決時間</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{metrics.escalationRate}%</p>
                  <p className="text-sm text-muted-foreground">エスカレーション率</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{metrics.preventionSuccess}%</p>
                  <p className="text-sm text-muted-foreground">予防成功率</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プロセス改善提案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🔍 早期発見の強化</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    障害の早期発見により解決時間を短縮し、スプリント影響を最小化
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• デイリースタンドアップでの障害確認</li>
                    <li>• 定期的なレトロスペクティブ</li>
                    <li>• 自動監視アラートの設定</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">⚡ 迅速な対応フロー</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    標準化された対応フローにより効率的な障害解決を実現
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• 障害種類別の対応手順書</li>
                    <li>• エスカレーションマトリックス</li>
                    <li>• 緊急時の連絡体制</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">📚 学習と改善</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    障害から学習し、同様の問題の再発を防止
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• 解決後の振り返り会議</li>
                    <li>• ナレッジベースの構築</li>
                    <li>• 予防策の実装追跡</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
