import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Target, Star, AlertTriangle } from 'lucide-react';

interface TimelineBadge {
  category: string;
  status: string;
  progress: number;
  confidence: number;
  estimatedHours: number;
  actualHours?: number;
  difficulty: string;
  risks: Array<{ level: string }>;
}

interface TimelineEvent {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  importance?: string;
  status?: string;
}

// タイムライン統計・分析コンポーネント
export const renderTimelineAnalytics = (badges: TimelineBadge[], events: TimelineEvent[]) => {
  // 統計計算
  const totalBadges = badges.length;
  const completedBadges = badges.filter((b) => b.status === 'completed').length;
  const inProgressBadges = badges.filter((b) => b.status === 'in_progress').length;
  const delayedBadges = badges.filter((b) => b.status === 'delayed').length;

  const averageProgress = badges.reduce((sum, b) => sum + b.progress, 0) / totalBadges;
  const averageConfidence = badges.reduce((sum, b) => sum + b.confidence, 0) / totalBadges;

  const totalEstimatedHours = badges.reduce((sum, b) => sum + b.estimatedHours, 0);
  const totalActualHours = badges.reduce((sum, b) => sum + (b.actualHours || 0), 0);

  // カテゴリ別統計
  const categoryStats = badges.reduce(
    (stats, badge) => {
      if (!stats[badge.category]) {
        stats[badge.category] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          estimatedHours: 0,
          actualHours: 0,
        };
      }

      stats[badge.category].total++;
      if (badge.status === 'completed') stats[badge.category].completed++;
      if (badge.status === 'in_progress') stats[badge.category].inProgress++;
      stats[badge.category].estimatedHours += badge.estimatedHours;
      stats[badge.category].actualHours += badge.actualHours || 0;

      return stats;
    },
    {} as Record<string, any>
  );

  // 難易度別統計
  const difficultyStats = badges.reduce(
    (stats, badge) => {
      if (!stats[badge.difficulty]) {
        stats[badge.difficulty] = { total: 0, completed: 0 };
      }
      stats[badge.difficulty].total++;
      if (badge.status === 'completed') stats[badge.difficulty].completed++;
      return stats;
    },
    {} as Record<string, any>
  );

  // リスク分析
  const totalRisks = badges.reduce((sum, badge) => sum + badge.risks.length, 0);
  const criticalRisks = badges.reduce(
    (sum, badge) =>
      sum + badge.risks.filter((r) => r.level === 'critical' || r.level === 'high').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* 総合統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            📊 総合統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{totalBadges}</div>
              <div className="text-xs text-muted-foreground">総バッジ数</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{completedBadges}</div>
              <div className="text-xs text-muted-foreground">完了</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{inProgressBadges}</div>
              <div className="text-xs text-muted-foreground">進行中</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{delayedBadges}</div>
              <div className="text-xs text-muted-foreground">遅延</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{averageProgress.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">平均進捗</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {averageConfidence.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">平均信頼度</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">全体完了率</span>
                <span className="text-sm font-bold text-green-600">
                  {((completedBadges / totalBadges) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(completedBadges / totalBadges) * 100} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">時間効率</span>
                <span className="text-sm font-bold text-blue-600">
                  {totalEstimatedHours > 0
                    ? ((totalActualHours / totalEstimatedHours) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0}
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            🎯 カテゴリ別統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{category}</h4>
                  <div className="text-sm text-muted-foreground">
                    {stats.completed}/{stats.total} 完了
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">総数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">完了</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">進行中</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>完了率</span>
                      <span>{((stats.completed / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.completed / stats.total) * 100} className="h-2" />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>予定: {stats.estimatedHours}h</span>
                    <span>実績: {stats.actualHours}h</span>
                    <span>
                      効率:{' '}
                      {stats.estimatedHours > 0
                        ? ((stats.actualHours / stats.estimatedHours) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 難易度別統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />⭐ 難易度別統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(difficultyStats).map(([difficulty, stats]) => (
              <div key={difficulty} className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">
                  {difficulty === 'legendary'
                    ? '🏆'
                    : difficulty === 'platinum'
                      ? '💎'
                      : difficulty === 'gold'
                        ? '🥇'
                        : difficulty === 'silver'
                          ? '🥈'
                          : '🥉'}
                </div>
                <div className="font-medium capitalize mb-2">{difficulty}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.completed}/{stats.total} 完了
                </div>
                <Progress value={(stats.completed / stats.total) * 100} className="h-2 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* リスク分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            ⚠️ リスク分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalRisks}</div>
              <div className="text-sm text-muted-foreground">総リスク数</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{criticalRisks}</div>
              <div className="text-sm text-muted-foreground">重要リスク</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {totalRisks > 0 ? ((criticalRisks / totalRisks) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">重要度</div>
            </div>
          </div>

          {criticalRisks > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 font-medium text-red-700">
                <AlertTriangle className="w-4 h-4" />
                重要リスクが検出されました
              </div>
              <div className="text-sm text-red-600 mt-1">
                {criticalRisks}個の高リスク要因が存在します。詳細確認と対策の検討をお勧めします。
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
