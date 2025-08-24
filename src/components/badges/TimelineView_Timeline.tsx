import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';

interface TimelineBadge {
  id: string;
  name: string;
  emoji: string;
  category: string;
  status: string;
  priority: string;
  difficulty: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  progress: number;
  confidence: number;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  dependents: string[];
  milestones: Array<{
    id: string;
    name: string;
    targetDate: string;
    isCompleted: boolean;
    completedDate?: string;
  }>;
  risks: Array<{
    type: string;
    level: string;
    description: string;
    mitigation?: string;
  }>;
  tags: string[];
}

interface TimelineEvent {
  id: string;
  type: 'badge_start' | 'badge_complete' | 'milestone' | 'dependency' | 'risk' | 'review';
  date: string;
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'actual' | 'overdue' | 'cancelled';
  badgeId?: string;
  relatedBadges?: string[];
}

interface TimelineFilter {
  categories: string[];
  statuses: string[];
  priorities: string[];
  showDependencies: boolean;
  showMilestones: boolean;
  showRisks: boolean;
}

interface TimelineViewSettings {
  viewMode: string;
  groupBy: string;
}

// タイムライン表示コンポーネント
export const renderTimelineView = (
  badges: TimelineBadge[],
  events: TimelineEvent[],
  filter: TimelineFilter,
  viewSettings: TimelineViewSettings
) => {
  // フィルタリング
  const filteredBadges = badges.filter((badge) => {
    if (filter.categories.length > 0 && !filter.categories.includes(badge.category)) return false;
    if (filter.statuses.length > 0 && !filter.statuses.includes(badge.status)) return false;
    if (filter.priorities.length > 0 && !filter.priorities.includes(badge.priority)) return false;
    return true;
  });

  // グループ化
  const groupedBadges = filteredBadges.reduce(
    (groups, badge) => {
      let key = 'default';
      if (viewSettings.groupBy === 'category') key = badge.category;
      else if (viewSettings.groupBy === 'priority') key = badge.priority;
      else if (viewSettings.groupBy === 'status') key = badge.status;

      if (!groups[key]) groups[key] = [];
      groups[key].push(badge);
      return groups;
    },
    {} as Record<string, TimelineBadge[]>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      case 'not_started':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'legendary':
        return '🏆';
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />⏰ バッジタイムライン - {viewSettings.viewMode}ビュー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedBadges).map(([groupName, groupBadges]) => (
            <div key={groupName}>
              {viewSettings.groupBy !== 'none' && (
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {groupName === 'default'
                    ? 'バッジ一覧'
                    : groupName === 'not_started'
                      ? '⚪ 未開始'
                      : groupName === 'in_progress'
                        ? '🔵 進行中'
                        : groupName === 'completed'
                          ? '✅ 完了'
                          : groupName === 'delayed'
                            ? '🔴 遅延'
                            : groupName === 'critical'
                              ? '🔴 緊急'
                              : groupName === 'high'
                                ? '🟠 高優先度'
                                : groupName === 'medium'
                                  ? '🟡 中優先度'
                                  : groupName === 'low'
                                    ? '🟢 低優先度'
                                    : groupName}
                </h3>
              )}

              <div className="space-y-4">
                {groupBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`border rounded-lg p-4 ${getPriorityColor(badge.priority)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <span className="text-3xl">{badge.emoji}</span>
                          <div
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(badge.status)}`}
                          >
                            <div className="text-xs text-white text-center leading-4">
                              {getDifficultyIcon(badge.difficulty)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-lg">{badge.name}</h4>
                          <Badge
                            variant={
                              badge.priority === 'critical'
                                ? 'destructive'
                                : badge.priority === 'high'
                                  ? 'default'
                                  : badge.priority === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {badge.priority}
                          </Badge>
                          <Badge variant="outline">{badge.difficulty}</Badge>
                          <Badge variant={badge.status === 'completed' ? 'default' : 'secondary'}>
                            {badge.status === 'completed'
                              ? '完了'
                              : badge.status === 'in_progress'
                                ? '進行中'
                                : badge.status === 'delayed'
                                  ? '遅延'
                                  : '未開始'}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>

                        {/* 日程情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm font-medium">📅 予定期間</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(badge.plannedStartDate).toLocaleDateString('ja-JP')} -{' '}
                              {new Date(badge.plannedEndDate).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                          {badge.actualStartDate && (
                            <div>
                              <div className="text-sm font-medium">✅ 実績期間</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(badge.actualStartDate).toLocaleDateString('ja-JP')} -{' '}
                                {badge.actualEndDate
                                  ? new Date(badge.actualEndDate).toLocaleDateString('ja-JP')
                                  : '進行中'}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 進捗・時間情報 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm font-medium">進捗</div>
                            <div className="flex items-center gap-2">
                              <Progress value={badge.progress} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{badge.progress}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">信頼度</div>
                            <div className="text-sm font-bold text-blue-600">
                              {badge.confidence}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">予定時間</div>
                            <div className="text-sm font-bold text-gray-600">
                              {badge.estimatedHours}h
                            </div>
                          </div>
                          {badge.actualHours && (
                            <div>
                              <div className="text-sm font-medium">実績時間</div>
                              <div className="text-sm font-bold text-green-600">
                                {badge.actualHours}h
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 依存関係 */}
                        {filter.showDependencies &&
                          (badge.dependencies.length > 0 || badge.dependents.length > 0) && (
                            <div className="mb-3">
                              {badge.dependencies.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-sm font-medium text-orange-600">
                                    🔗 依存バッジ
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {badge.dependencies.map((depId) => (
                                      <Badge key={depId} variant="outline" className="text-xs">
                                        {depId}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {badge.dependents.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-blue-600">
                                    ⬆️ 後続バッジ
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {badge.dependents.map((depId) => (
                                      <Badge key={depId} variant="outline" className="text-xs">
                                        {depId}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* マイルストーン */}
                        {filter.showMilestones && badge.milestones.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2">🎯 マイルストーン</div>
                            <div className="space-y-1">
                              {badge.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2 text-sm">
                                  <div
                                    className={`w-3 h-3 rounded-full ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                                  ></div>
                                  <span
                                    className={
                                      milestone.isCompleted
                                        ? 'line-through text-muted-foreground'
                                        : ''
                                    }
                                  >
                                    {milestone.name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({new Date(milestone.targetDate).toLocaleDateString('ja-JP')})
                                  </span>
                                  {milestone.isCompleted && milestone.completedDate && (
                                    <Badge variant="outline" className="text-xs">
                                      ✅{' '}
                                      {new Date(milestone.completedDate).toLocaleDateString(
                                        'ja-JP'
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* リスク */}
                        {filter.showRisks && badge.risks.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2">⚠️ リスク</div>
                            <div className="space-y-2">
                              {badge.risks.map((risk, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded text-sm ${
                                    risk.level === 'critical'
                                      ? 'bg-red-50 text-red-700'
                                      : risk.level === 'high'
                                        ? 'bg-orange-50 text-orange-700'
                                        : risk.level === 'medium'
                                          ? 'bg-yellow-50 text-yellow-700'
                                          : 'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="font-medium">
                                    {risk.type === 'schedule'
                                      ? '📅'
                                      : risk.type === 'technical'
                                        ? '🔧'
                                        : risk.type === 'resource'
                                          ? '👥'
                                          : '🔗'}{' '}
                                    {risk.description}
                                  </div>
                                  {risk.mitigation && (
                                    <div className="text-xs mt-1">対策: {risk.mitigation}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* タグ */}
                        <div className="flex flex-wrap gap-1">
                          {badge.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
