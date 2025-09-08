import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Server, Activity, RefreshCw, Download, Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

// バッジコンポーネント
const SevBadge = ({ s }: { s: ErrorReport['severity'] }) => {
  const m: Record<ErrorReport['severity'], string> = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-sky-50 text-sky-700 border-sky-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const label = { critical: '重大', high: '高', medium: '中', low: '低' }[s];
  return (
    <span className={`inline-flex items-center px-2 py-[2px] text-xs border rounded-full ${m[s]}`}>
      {label}
    </span>
  );
};

const StatusBadge = ({ st }: { st: ErrorReport['status'] }) => {
  const m: Record<ErrorReport['status'], string> = {
    open: 'bg-rose-50 text-rose-700 border-rose-200',
    investigating: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ignored: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const label = { open: '未対応', investigating: '調査中', resolved: '解決', ignored: '無視' }[st];
  return (
    <span className={`inline-flex items-center px-2 py-[2px] text-xs border rounded-full ${m[st]}`}>
      {label}
    </span>
  );
};

// エラー報告用の型定義（提案コードベース）
type ErrorReport = {
  id: string;
  title: string;
  message?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'ignored';
  createdAt: string; // ISO
  path?: string; // 例: /tasks
  userEmail?: string;
};

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

// テーブル用コンポーネント
function Th({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
}

function Td({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-3 py-2 text-gray-800 ${className}`}>{children}</td>;
}

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
    const searchMatch =
      searchQuery === '' ||
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
      ...filteredErrors.map((error) => [
        error.id,
        formatDateTime(error.timestamp),
        getLevelLabel(error.level),
        error.message,
        error.endpoint || '',
        error.statusCode || '',
        error.userId || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

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
            <CardDescription>
              サーバエラーレポートを表示するにはログインが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/login')}>ログイン</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 max-w-screen-md mx-auto">
      {/* ヘッダー - モバイル最適化 */}
      <header className="pt-3 pb-2">
        <h2 className="text-base sm:text-lg font-bold text-center text-gray-800 flex items-center justify-center">
          <Server className="w-5 h-5 mr-2" /> サーバエラーレポート
        </h2>
        <p className="text-sm text-gray-600 text-center mt-1">サーバ側のエラー収集・集約・分析</p>
      </header>

      {/* アクションボタン - モバイル最適化 */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm active:opacity-90 min-h-[40px]"
        >
          <RefreshCw className="h-4 w-4 mr-2 inline" />
          更新
        </button>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm active:opacity-90 min-h-[40px]"
        >
          <Download className="h-4 w-4 mr-2 inline" />
          エクスポート
        </button>
      </div>

      {/* 統計情報 - モバイル最適化 */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">総エラー数</p>
            <p className="text-lg font-bold">{stats.totalErrors}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <Server className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">エラーレベル</p>
            <p className="text-lg font-bold">{Object.keys(stats.errorsByLevel).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <Activity className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">エンドポイント</p>
            <p className="text-lg font-bold">{Object.keys(stats.errorsByEndpoint).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <RefreshCw className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">最終更新</p>
            <p className="text-xs font-bold">リアルタイム</p>
          </div>
        </div>
      )}

      {/* フィルター - モバイル最適化 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="timeRange" className="text-sm font-medium">
              時間範囲
            </Label>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="min-h-[40px]">
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
            <Label htmlFor="level" className="text-sm font-medium">
              エラーレベル
            </Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="min-h-[40px]">
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
            <Label htmlFor="endpoint" className="text-sm font-medium">
              エンドポイント
            </Label>
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {stats?.errorsByEndpoint &&
                  Object.keys(stats.errorsByEndpoint).map((endpoint) => (
                    <SelectItem key={endpoint} value={endpoint}>
                      {endpoint}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="search" className="text-sm font-medium">
              検索
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="メッセージで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 min-h-[40px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* エラー一覧 - モバイル=カード、デスクトップ=テーブル */}
      <div className="mt-4">
        {/* モバイル用カード表示 */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="animate-pulse bg-white rounded-2xl shadow-sm border p-3"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
              エラーが見つかりませんでした
            </div>
          ) : (
            filteredErrors.map((error) => (
              <div
                key={error.id}
                className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[15px] leading-5">{error.message}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 break-all">
                      {error.stack || '—'}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 break-all">
                      {error.method} {error.endpoint}{' '}
                      {error.userId ? `· ${error.userId.slice(0, 8)}...` : ''}
                    </p>
                    <p className="text-[11px] text-gray-400">{formatDateTime(error.timestamp)}</p>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <Badge variant={getLevelBadgeVariant(error.level)}>
                      {getLevelLabel(error.level)}
                    </Badge>
                    {error.statusCode && (
                      <Badge variant={error.statusCode >= 500 ? 'destructive' : 'outline'}>
                        {error.statusCode}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button className="min-h-[40px] px-3 py-2 rounded-lg border text-xs">詳細</button>
                  <button className="min-h-[40px] px-3 py-2 rounded-lg bg-rose-600 text-white text-xs">
                    無視
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* デスクトップ用テーブル表示 */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <Th>日時</Th>
                  <Th>レベル</Th>
                  <Th>メッセージ</Th>
                  <Th>エンドポイント</Th>
                  <Th>ステータス</Th>
                  <Th>ユーザー</Th>
                  <Th className="text-right pr-4">操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-3 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-5 bg-gray-200 rounded-full w-12" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 bg-gray-200 rounded w-40" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="h-6 bg-gray-200 rounded w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredErrors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      エラーが見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredErrors.map((error) => (
                    <tr key={error.id} className="hover:bg-gray-50 align-top">
                      <Td className="font-mono text-sm">{formatDateTime(error.timestamp)}</Td>
                      <Td>
                        <Badge variant={getLevelBadgeVariant(error.level)}>
                          {getLevelLabel(error.level)}
                        </Badge>
                      </Td>
                      <Td className="max-w-md">
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
                      </Td>
                      <Td className="font-mono text-sm">
                        {error.method} {error.endpoint}
                      </Td>
                      <Td>
                        {error.statusCode && (
                          <Badge variant={error.statusCode >= 500 ? 'destructive' : 'outline'}>
                            {error.statusCode}
                          </Badge>
                        )}
                      </Td>
                      <Td className="text-sm">
                        {error.userId ? (
                          <span className="font-mono">{error.userId.slice(0, 8)}...</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </Td>
                      <Td className="text-right pr-3">
                        <div className="inline-flex gap-2">
                          <button className="min-h-[40px] px-3 py-2 rounded-md border text-[13px]">
                            詳細
                          </button>
                          <button className="min-h-[40px] px-3 py-2 rounded-md bg-rose-600 text-white text-[13px]">
                            無視
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 統計情報タブ */}
      <Tabs defaultValue="stats" className="w-full mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="stats">統計情報</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* エラーレベル別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>エラーレベル別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.errorsByLevel &&
                  Object.entries(stats.errorsByLevel).map(([level, count]) => (
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
                {stats?.errorsByEndpoint &&
                  Object.entries(stats.errorsByEndpoint)
                    .sort(([, a], [, b]) => b - a)
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
