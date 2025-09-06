import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Server, Activity, RefreshCw, Download, Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ServerError {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface ErrorStats {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  errorsByHour: Record<string, number>;
  recentErrors: ServerError[];
  topErrors: Array<{ message: string; count: number }>;
}

export default function ServerErrorReportingPage() {
  const { user, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState<ServerError[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    const fetchServerErrors = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/admin/server-errors?timeRange=${selectedTimeRange}`);
          if (response.ok) {
            const data = await response.json();
            setErrors(data.errors || []);
            setStats(data.stats || null);
          } else {
            throw new Error('Failed to fetch server errors');
          }
        } catch (error) {
          console.error('Server errors fetch error:', error);
          toast.error('サーバエラーの取得に失敗しました');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchServerErrors();
  }, [isAuthenticated, user, selectedTimeRange]);

  // フィルタリングされたエラー一覧
  const filteredErrors = errors.filter((error) => {
    const levelMatch = selectedLevel === 'all' || error.level === selectedLevel;
    const endpointMatch = selectedEndpoint === 'all' || error.endpoint === selectedEndpoint;
    const searchMatch = searchQuery === '' || 
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.stack?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return levelMatch && endpointMatch && searchMatch;
  });

  // エラーレベルのバッジ色
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'outline';
      case 'info':
        return 'secondary';
      case 'debug':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // 日時フォーマット
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // エラーレベルの日本語表示
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'error':
        return 'エラー';
      case 'warn':
        return '警告';
      case 'info':
        return '情報';
      case 'debug':
        return 'デバッグ';
      default:
        return level;
    }
  };

  // エクスポート機能
  const handleExport = () => {
    const csvContent = [
      ['ID', '日時', 'レベル', 'メッセージ', 'エンドポイント', 'ステータスコード', 'ユーザーID'],
      ...filteredErrors.map(error => [
        error.id,
        formatDateTime(error.timestamp),
        getLevelLabel(error.level),
        error.message,
        error.endpoint || '',
        error.statusCode || '',
        error.userId || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `server-errors-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>サーバエラーレポート</CardTitle>
            <CardDescription>サーバエラーレポートを表示するにはログインが必要です。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/login')}>ログイン</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">サーバエラーレポート</h1>
          <p className="text-muted-foreground mt-2">
            サーバ側のエラー収集・集約・分析
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">総エラー数</p>
                  <p className="text-2xl font-bold">{stats.totalErrors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Server className="h-4 w-4 text-orange-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">エラーレベル</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.errorsByLevel).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">エンドポイント</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.errorsByEndpoint).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">最終更新</p>
                  <p className="text-sm font-bold">リアルタイム</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フィルター */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="timeRange">時間範囲</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">過去1時間</SelectItem>
                  <SelectItem value="24h">過去24時間</SelectItem>
                  <SelectItem value="7d">過去7日間</SelectItem>
                  <SelectItem value="30d">過去30日間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">エラーレベル</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="error">エラー</SelectItem>
                  <SelectItem value="warn">警告</SelectItem>
                  <SelectItem value="info">情報</SelectItem>
                  <SelectItem value="debug">デバッグ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endpoint">エンドポイント</Label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {stats?.errorsByEndpoint && Object.keys(stats.errorsByEndpoint).map(endpoint => (
                    <SelectItem key={endpoint} value={endpoint}>
                      {endpoint}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="メッセージで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* エラー一覧 */}
      <Tabs defaultValue="errors" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="errors">エラー一覧</TabsTrigger>
          <TabsTrigger value="stats">統計情報</TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>エラー一覧</CardTitle>
              <CardDescription>
                {filteredErrors.length}件のエラーが表示されています
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredErrors.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日時</TableHead>
                        <TableHead>レベル</TableHead>
                        <TableHead>メッセージ</TableHead>
                        <TableHead>エンドポイント</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>ユーザー</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredErrors.map((error) => (
                        <TableRow key={error.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(error.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getLevelBadgeVariant(error.level)}>
                              {getLevelLabel(error.level)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={error.message}>
                              {error.message}
                            </div>
                            {error.stack && (
                              <details className="mt-1">
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                  スタックトレース
                                </summary>
                                <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                                  {error.stack}
                                </pre>
                              </details>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {error.method} {error.endpoint}
                          </TableCell>
                          <TableCell>
                            {error.statusCode && (
                              <Badge variant={error.statusCode >= 500 ? 'destructive' : 'outline'}>
                                {error.statusCode}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {error.userId ? (
                              <span className="font-mono">{error.userId.slice(0, 8)}...</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p>エラーが見つかりませんでした</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* エラーレベル別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>エラーレベル別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.errorsByLevel && Object.entries(stats.errorsByLevel).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center py-2">
                    <span className="flex items-center">
                      <Badge variant={getLevelBadgeVariant(level)} className="mr-2">
                        {getLevelLabel(level)}
                      </Badge>
                    </span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* エンドポイント別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>エンドポイント別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.errorsByEndpoint && Object.entries(stats.errorsByEndpoint)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([endpoint, count]) => (
                    <div key={endpoint} className="flex justify-between items-center py-2">
                      <span className="font-mono text-sm truncate">{endpoint}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
