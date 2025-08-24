import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  GitCommit,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  User,
  BarChart3,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useGitHubCommits, useCommitDetail } from '@/hooks/useGitHubCommits';
import CommitCard from '@/components/github/CommitCard';
import UpdateStats from '@/components/github/UpdateStats';
import { CommitSearchParams, EnhancedCommit } from '@/types/github';

const UpdateHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // GitHub コミットフック
  const { commits, stats, loading, error, hasNextPage, loadMore, refresh, searchCommits } =
    useGitHubCommits();

  // 選択されたコミットの詳細フック
  const { commit: selectedCommitDetail, loading: detailLoading } = useCommitDetail(
    selectedCommit || ''
  );

  // フィルタリングされたコミット
  const filteredCommits = React.useMemo(() => {
    return commits.filter((commit) => {
      // テキスト検索
      const matchesSearch =
        searchTerm === '' ||
        commit.commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.authorName.toLowerCase().includes(searchTerm.toLowerCase());

      // 作者フィルター
      const matchesAuthor =
        authorFilter === '' || commit.authorName.toLowerCase().includes(authorFilter.toLowerCase());

      // タイプフィルター
      const matchesType = typeFilter === 'all' || commit.commitType === typeFilter;

      // 日付フィルター
      let matchesDate = true;
      if (dateRange !== 'all') {
        const commitDate = new Date(commit.commit.author.date);
        const now = new Date();

        switch (dateRange) {
          case 'today':
            matchesDate = commitDate.toDateString() === now.toDateString();
            break;
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = commitDate >= weekAgo;
            break;
          }
          case 'month': {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            matchesDate = commitDate >= monthAgo;
            break;
          }
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesAuthor && matchesType && matchesDate;
    });
  }, [commits, searchTerm, authorFilter, typeFilter, dateRange]);

  // 検索実行
  const handleSearch = async () => {
    const params: CommitSearchParams = {};

    if (authorFilter) params.author = authorFilter;
    if (dateRange !== 'all') {
      const now = new Date();
      switch (dateRange) {
        case 'today':
          params.since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          params.since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          params.since = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          ).toISOString();
          break;
      }
    }

    await searchCommits(params);
  };

  // フィルターリセット
  const handleResetFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setTypeFilter('all');
    setDateRange('all');
    searchCommits({});
  };

  // 一意な作者リストを取得
  const uniqueAuthors = React.useMemo(() => {
    const authors = new Set(commits.map((commit) => commit.authorName));
    return Array.from(authors).sort();
  }, [commits]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <GitCommit className="h-8 w-8 mr-3 text-blue-600" />
                更新履歴
              </h1>
              <p className="text-gray-600">
                GitHubリポジトリのコミット履歴をリアルタイムで表示しています
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>

              <Button onClick={refresh} disabled={loading} className="flex items-center">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">エラーが発生しました</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* フィルター */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">フィルター設定</CardTitle>
              <CardDescription>コミット履歴を絞り込むための条件を設定できます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">検索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="メッセージまたは作者名"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>作者</Label>
                  <Select
                    value={authorFilter}
                    onValueChange={(value) => setAuthorFilter(value === 'all-authors' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべての作者" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-authors">すべての作者</SelectItem>
                      {uniqueAuthors.map((author) => (
                        <SelectItem key={author} value={author}>
                          {author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>タイプ</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべてのタイプ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのタイプ</SelectItem>
                      <SelectItem value="feat">機能追加</SelectItem>
                      <SelectItem value="fix">バグ修正</SelectItem>
                      <SelectItem value="docs">ドキュメント</SelectItem>
                      <SelectItem value="style">スタイル</SelectItem>
                      <SelectItem value="refactor">リファクタ</SelectItem>
                      <SelectItem value="test">テスト</SelectItem>
                      <SelectItem value="chore">雑務</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>期間</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべての期間" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての期間</SelectItem>
                      <SelectItem value="today">今日</SelectItem>
                      <SelectItem value="week">過去1週間</SelectItem>
                      <SelectItem value="month">過去1ヶ月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={handleResetFilters}>
                  リセット
                </Button>
                <Button onClick={handleSearch}>検索実行</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* タブコンテンツ */}
        <Tabs defaultValue="commits" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="commits" className="flex items-center">
              <GitCommit className="h-4 w-4 mr-2" />
              コミット履歴
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              統計情報
            </TabsTrigger>
          </TabsList>

          {/* コミット履歴タブ */}
          <TabsContent value="commits" className="space-y-4">
            {/* 結果サマリー */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredCommits.length}件のコミットが見つかりました
              </p>

              {filteredCommits.length !== commits.length && (
                <Badge variant="secondary">
                  フィルター適用中: {commits.length}件中{filteredCommits.length}件表示
                </Badge>
              )}
            </div>

            {/* コミット一覧 */}
            <div className="space-y-4">
              {loading && commits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">コミット履歴を読み込み中...</p>
                </div>
              ) : filteredCommits.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <GitCommit className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      コミットが見つかりません
                    </h3>
                    <p className="text-gray-600">フィルター条件を変更して再度お試しください</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredCommits.map((commit) => (
                    <CommitCard
                      key={commit.sha}
                      commit={commit}
                      onClick={() => setSelectedCommit(commit.sha)}
                    />
                  ))}

                  {/* さらに読み込み */}
                  {hasNextPage && (
                    <div className="text-center pt-6">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            読み込み中...
                          </>
                        ) : (
                          'さらに読み込む'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* 統計情報タブ */}
          <TabsContent value="stats" className="space-y-6">
            {stats ? (
              <UpdateStats stats={stats} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">統計情報を計算中</h3>
                  <p className="text-gray-600">しばらくお待ちください</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* コミット詳細ダイアログ */}
        <Dialog open={!!selectedCommit} onOpenChange={() => setSelectedCommit(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <GitCommit className="h-5 w-5" />
                <span>コミット詳細</span>
                {selectedCommitDetail && (
                  <Badge variant="outline" className="ml-2 font-mono">
                    {selectedCommitDetail.shortSha}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedCommitDetail?.commit.message.split('\n')[0]}
              </DialogDescription>
            </DialogHeader>

            {detailLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">詳細情報を読み込み中...</p>
              </div>
            ) : selectedCommitDetail ? (
              <CommitCard commit={selectedCommitDetail} showDetails={true} />
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">コミット詳細の読み込みに失敗しました</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UpdateHistoryPage;
