import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bug,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  Edit,
} from 'lucide-react';
import { featuresRegistry } from '@/config/features';
import { toast } from 'react-hot-toast';

interface BugItem {
  _id: string;
  title: string;
  description?: string;
  featureId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source: 'client' | 'server' | 'manual';
  fingerprint?: string;
  occurrences?: number;
  lastOccurredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface BugStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const AdminBugsList: React.FC = () => {
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [stats, setStats] = useState<BugStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const selectableFeatures = featuresRegistry
    .map((f) => ({ id: f.id, name: f.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const loadBugs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFeature !== 'all') params.set('featureId', selectedFeature);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedSeverity !== 'all') params.set('severity', selectedSeverity);

      const response = await fetch(`/api/bugs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBugs(data.data || []);
        calculateStats(data.data || []);
      } else {
        toast.error('不具合データの取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to load bugs:', error);
      toast.error('不具合データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bugList: BugItem[]) => {
    const newStats: BugStats = {
      total: bugList.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    bugList.forEach((bug) => {
      newStats[bug.status]++;
      newStats[bug.severity]++;
    });

    setStats(newStats);
  };

  const updateBugStatus = async (bugId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('ステータスを更新しました');
        loadBugs();
      } else {
        toast.error('ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update bug status:', error);
      toast.error('ステータスの更新に失敗しました');
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    loadBugs();
  }, [selectedFeature, selectedStatus, selectedSeverity]);

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">未対応</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">対応中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">解決済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">クリティカル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="タイトルまたは説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">機能</label>
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger>
                  <SelectValue placeholder="機能を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {selectableFeatures.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">ステータス</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="open">未対応</SelectItem>
                  <SelectItem value="in_progress">対応中</SelectItem>
                  <SelectItem value="resolved">解決済み</SelectItem>
                  <SelectItem value="closed">クローズ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">重要度</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="重要度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="critical">クリティカル</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 不具合一覧 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>不具合一覧</CardTitle>
            <CardDescription>{filteredBugs.length}件の不具合が見つかりました</CardDescription>
          </div>
          <Button onClick={loadBugs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              読み込み中...
            </div>
          ) : filteredBugs.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>条件に一致する不具合が見つかりませんでした。</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>機能</TableHead>
                    <TableHead>重要度</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>発生回数</TableHead>
                    <TableHead>最終発生</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBugs.map((bug) => (
                    <TableRow key={bug._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bug.title}</div>
                          {bug.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {bug.description.length > 100
                                ? `${bug.description.substring(0, 100)}...`
                                : bug.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {selectableFeatures.find((f) => f.id === bug.featureId)?.name ||
                          bug.featureId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(bug.severity)}>{bug.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(bug.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(bug.status)}
                            {bug.status === 'open' && '未対応'}
                            {bug.status === 'in_progress' && '対応中'}
                            {bug.status === 'resolved' && '解決済み'}
                            {bug.status === 'closed' && 'クローズ'}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{bug.occurrences || 1}</TableCell>
                      <TableCell>
                        {bug.lastOccurredAt
                          ? new Date(bug.lastOccurredAt).toLocaleDateString('ja-JP')
                          : new Date(bug.createdAt).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {bug.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBugStatus(bug._id, 'in_progress')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              対応開始
                            </Button>
                          )}
                          {bug.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBugStatus(bug._id, 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              解決
                            </Button>
                          )}
                          {bug.status === 'resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBugStatus(bug._id, 'closed')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              クローズ
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
