import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  importance: string;
  status: string;
  badgeId?: string;
  relatedBadges?: string[];
}

interface TimelineFilter {
  categories: string[];
  difficulties: string[];
  statuses: string[];
  priorities: string[];
  dateRange: { start: string; end: string };
  showDependencies: boolean;
  showMilestones: boolean;
  showRisks: boolean;
}

// タイムラインイベント表示コンポーネント
export const renderTimelineEvents = (events: TimelineEvent[], filter: TimelineFilter) => {
  // 日付でソート
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'badge_start':
        return '🚀';
      case 'badge_complete':
        return '🏆';
      case 'milestone':
        return '🎯';
      case 'dependency':
        return '🔗';
      case 'risk':
        return '⚠️';
      case 'review':
        return '📝';
      default:
        return '📌';
    }
  };

  const getEventColor = (importance: string, status: string) => {
    if (status === 'overdue') return 'border-red-500 bg-red-50';
    if (status === 'cancelled') return 'border-gray-500 bg-gray-50';

    switch (importance) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actual':
        return (
          <Badge variant="default" className="text-xs">
            実績
          </Badge>
        );
      case 'planned':
        return (
          <Badge variant="outline" className="text-xs">
            予定
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive" className="text-xs">
            遅延
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="text-xs">
            中止
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          📋 タイムラインイベント
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* タイムライン軸 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* イベントマーカー */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${getEventColor(event.importance, event.status).replace('bg-', 'bg-white border-')}`}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* イベント詳細 */}
                <div
                  className={`flex-1 p-4 rounded-lg border ${getEventColor(event.importance, event.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.title}</h4>
                      {getStatusBadge(event.status)}
                      <Badge
                        variant={
                          event.importance === 'critical'
                            ? 'destructive'
                            : event.importance === 'high'
                              ? 'default'
                              : event.importance === 'medium'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {event.importance}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>

                  {event.badgeId && (
                    <div className="text-xs text-blue-600 mb-2">関連バッジ: {event.badgeId}</div>
                  )}

                  {event.relatedBadges && event.relatedBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">関連:</span>
                      {event.relatedBadges.map((badgeId) => (
                        <Badge key={badgeId} variant="outline" className="text-xs">
                          {badgeId}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* イベントサマリー */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold mb-3">📊 イベントサマリー</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {events.filter((e) => e.type === 'badge_complete').length}
              </div>
              <div className="text-xs text-muted-foreground">バッジ完了</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {events.filter((e) => e.type === 'milestone').length}
              </div>
              <div className="text-xs text-muted-foreground">マイルストーン</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">
                {events.filter((e) => e.type === 'risk').length}
              </div>
              <div className="text-xs text-muted-foreground">リスクイベント</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {events.filter((e) => e.status === 'planned').length}
              </div>
              <div className="text-xs text-muted-foreground">予定イベント</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
