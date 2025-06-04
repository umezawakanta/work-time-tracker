import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { GitCommit, Calendar, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { UpdateHistoryStats } from '@/types/github';

interface UpdateStatsProps {
  stats: UpdateHistoryStats;
}

const UpdateStats: React.FC<UpdateStatsProps> = ({ stats }) => {
  // コミットタイプの表示設定
  const commitTypeConfig = {
    feat: { label: '機能追加', color: 'bg-blue-500', icon: '✨' },
    fix: { label: 'バグ修正', color: 'bg-red-500', icon: '🐛' },
    docs: { label: 'ドキュメント', color: 'bg-gray-500', icon: '📝' },
    style: { label: 'スタイル', color: 'bg-purple-500', icon: '💄' },
    refactor: { label: 'リファクタ', color: 'bg-yellow-500', icon: '♻️' },
    test: { label: 'テスト', color: 'bg-green-500', icon: '🧪' },
    chore: { label: '雑務', color: 'bg-gray-400', icon: '🔧' },
    other: { label: 'その他', color: 'bg-gray-400', icon: '📦' },
  };

  // 最大アクティビティ数を計算
  const maxActivity = Math.max(...stats.activityData.map((d) => d.commits));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 基本統計 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総コミット数</CardTitle>
          <GitCommit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCommits}</div>
          <p className="text-xs text-muted-foreground">今月: {stats.commitsThisMonth}件</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今週のコミット</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.commitsThisWeek}</div>
          <p className="text-xs text-muted-foreground">
            前週比:{' '}
            {(
              (stats.commitsThisWeek /
                Math.max(stats.commitsThisMonth - stats.commitsThisWeek, 1)) *
              100
            ).toFixed(0)}
            %
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">アクティブ貢献者</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topContributors.length}</div>
          <p className="text-xs text-muted-foreground">
            トップ: {stats.topContributors[0]?.author || 'N/A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">開発活動</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activityData.reduce((sum, d) => sum + d.commits, 0)}
          </div>
          <p className="text-xs text-muted-foreground">過去30日間</p>
        </CardContent>
      </Card>

      {/* トップ貢献者 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 mr-2" />
            トップ貢献者
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topContributors.map((contributor, index) => (
              <div key={contributor.author} className="flex items-center space-x-3">
                <Badge
                  variant="outline"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {index + 1}
                </Badge>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contributor.avatar} alt={contributor.author} />
                  <AvatarFallback>{contributor.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{contributor.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {contributor.commitCount}件
                    </span>
                  </div>
                  <Progress
                    value={(contributor.commitCount / stats.topContributors[0].commitCount) * 100}
                    className="h-1 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* コミットタイプ分布 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            コミットタイプ分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.commitsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const config =
                  commitTypeConfig[type as keyof typeof commitTypeConfig] || commitTypeConfig.other;
                const percentage = (count / stats.totalCommits) * 100;

                return (
                  <div key={type} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 w-24">
                      <span className="text-sm">{config.icon}</span>
                      <span className="text-xs text-muted-foreground truncate">{config.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Progress value={percentage} className="h-2 flex-1 mr-2" />
                        <span className="text-xs text-muted-foreground min-w-0">
                          {count}件 ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* アクティビティヒートマップ */}
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            開発アクティビティ (過去30日)
          </CardTitle>
          <CardDescription>日別のコミット数を表示しています</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end h-16 space-x-1">
            {stats.activityData.map((day, index) => {
              const height = maxActivity > 0 ? (day.commits / maxActivity) * 100 : 0;
              return (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-sm transition-all duration-200 ${
                      day.commits > 0
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${day.commits}件のコミット`}
                  />
                  {index % 7 === 0 && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>少ない</span>
            <span>多い</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateStats;
