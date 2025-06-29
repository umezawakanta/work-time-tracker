import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Calendar, Activity, BarChart3 } from 'lucide-react';

// 完全なバッジタイムラインビューレンダリング関数
export const TimelineViewComplete: React.FC = () => {
  // インターフェース定義（再定義）
  interface TimelineBadge {
    id: string;
    name: string;
    emoji: string;
    category: string;
    difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
    estimatedHours: number;
    actualHours?: number;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
    progress: number;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    dependents: string[];
    tags: string[];
    description: string;
    milestones: Array<{
      id: string;
      name: string;
      targetDate: string;
      isCompleted: boolean;
      completedDate?: string;
    }>;
    risks: Array<{
      type: 'schedule' | 'technical' | 'resource' | 'dependency';
      level: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation?: string;
    }>;
  }

  interface TimelineEvent {
    id: string;
    type: 'badge_start' | 'badge_complete' | 'milestone' | 'dependency' | 'risk' | 'review';
    date: string;
    badgeId?: string;
    title: string;
    description: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
    status: 'planned' | 'actual' | 'overdue' | 'cancelled';
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

  interface TimelineViewSettings {
    viewMode: 'timeline' | 'gantt' | 'calendar' | 'list';
    timeScale: 'day' | 'week' | 'month' | 'quarter';
    groupBy: 'category' | 'priority' | 'status' | 'none';
    showDetails: boolean;
    autoRefresh: boolean;
  }

  // 状態管理
  const [filter, setFilter] = useState<TimelineFilter>({
    categories: [],
    difficulties: [],
    statuses: ['in_progress', 'completed'],
    priorities: [],
    dateRange: { start: '2025-06-01', end: '2025-12-31' },
    showDependencies: true,
    showMilestones: true,
    showRisks: true,
  });

  const [viewSettings, setViewSettings] = useState<TimelineViewSettings>({
    viewMode: 'timeline',
    timeScale: 'week',
    groupBy: 'category',
    showDetails: true,
    autoRefresh: false,
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'events' | 'analytics'>('timeline');

  // サンプルデータ
  const { timelineBadges, timelineEvents } = useMemo(() => {
    const badges: TimelineBadge[] = [
      {
        id: 'security-basics',
        name: 'セキュリティ基礎',
        emoji: '🔐',
        category: 'セキュリティ',
        difficulty: 'silver',
        estimatedHours: 20,
        actualHours: 18,
        plannedStartDate: '2025-06-28',
        plannedEndDate: '2025-07-05',
        actualStartDate: '2025-06-28',
        actualEndDate: '2025-07-03',
        status: 'completed',
        progress: 100,
        confidence: 95,
        priority: 'high',
        dependencies: [],
        dependents: ['network-security'],
        tags: ['基礎', 'セキュリティ'],
        description: 'サイバーセキュリティの基本概念と原則を学習',
        milestones: [
          {
            id: 'security-basics-theory',
            name: '理論学習完了',
            targetDate: '2025-07-01',
            isCompleted: true,
            completedDate: '2025-07-01',
          },
        ],
        risks: [],
      },
      {
        id: 'ai-fundamentals',
        name: 'AI基礎',
        emoji: '🤖',
        category: 'AI・機械学習',
        difficulty: 'gold',
        estimatedHours: 40,
        actualHours: 12,
        plannedStartDate: '2025-07-22',
        plannedEndDate: '2025-08-10',
        actualStartDate: '2025-07-25',
        status: 'in_progress',
        progress: 25,
        confidence: 60,
        priority: 'medium',
        dependencies: [],
        dependents: ['machine-learning'],
        tags: ['AI', '機械学習'],
        description: 'AI・機械学習の基礎理論と実装',
        milestones: [
          {
            id: 'ai-python-setup',
            name: 'Python環境構築',
            targetDate: '2025-07-26',
            isCompleted: true,
            completedDate: '2025-07-26',
          },
          {
            id: 'ai-theory',
            name: 'AI理論学習',
            targetDate: '2025-08-02',
            isCompleted: false,
          },
        ],
        risks: [
          {
            type: 'technical',
            level: 'high',
            description: '数学的基礎知識の不足により進捗遅延の可能性',
            mitigation: '数学基礎の並行学習と専門書の活用',
          },
        ],
      },
    ];

    const events: TimelineEvent[] = [
      {
        id: 'event-1',
        type: 'badge_complete',
        date: '2025-07-03',
        badgeId: 'security-basics',
        title: 'セキュリティ基礎バッジ獲得',
        description: 'セキュリティ基礎バッジを予定より2日早く獲得',
        importance: 'high',
        status: 'actual',
      },
      {
        id: 'event-2',
        type: 'risk',
        date: '2025-07-25',
        badgeId: 'ai-fundamentals',
        title: 'AI基礎学習で遅延リスク発生',
        description: '数学的基礎知識不足により進捗遅延の可能性',
        importance: 'critical',
        status: 'actual',
      },
    ];

    return { timelineBadges: badges, timelineEvents: events };
  }, []);

  // フィルタリング関数
  const getFilteredBadges = () => {
    return timelineBadges.filter((badge) => {
      if (filter.categories.length > 0 && !filter.categories.includes(badge.category)) return false;
      if (filter.statuses.length > 0 && !filter.statuses.includes(badge.status)) return false;
      if (filter.priorities.length > 0 && !filter.priorities.includes(badge.priority)) return false;
      return true;
    });
  };

  const filteredBadges = getFilteredBadges();

  return (
    <div className="space-y-6">
      {/* フィルター・設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            🔧 表示設定・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 表示モード */}
            <div>
              <h4 className="font-medium mb-2">表示モード</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['timeline', 'gantt', 'calendar', 'list'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewSettings.viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewSettings({ ...viewSettings, viewMode: mode })}
                    className="text-xs"
                  >
                    {mode === 'timeline'
                      ? '📅 タイムライン'
                      : mode === 'gantt'
                        ? '📊 ガント'
                        : mode === 'calendar'
                          ? '🗓️ カレンダー'
                          : '📋 リスト'}
                  </Button>
                ))}
              </div>
            </div>

            {/* ステータスフィルター */}
            <div>
              <h4 className="font-medium mb-2">ステータス</h4>
              <div className="flex flex-wrap gap-2">
                {(['not_started', 'in_progress', 'completed', 'delayed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter.statuses.includes(status) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newStatuses = filter.statuses.includes(status)
                        ? filter.statuses.filter((s) => s !== status)
                        : [...filter.statuses, status];
                      setFilter({ ...filter, statuses: newStatuses });
                    }}
                    className="text-xs"
                  >
                    {status === 'not_started'
                      ? '⚪ 未開始'
                      : status === 'in_progress'
                        ? '🔵 進行中'
                        : status === 'completed'
                          ? '✅ 完了'
                          : '🔴 遅延'}
                  </Button>
                ))}
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div>
              <h4 className="font-medium mb-2">カテゴリ</h4>
              <div className="flex flex-wrap gap-2">
                {['セキュリティ', 'AI・機械学習', 'デザイン・UX', 'プロジェクト管理'].map(
                  (category) => (
                    <Button
                      key={category}
                      variant={filter.categories.includes(category) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newCategories = filter.categories.includes(category)
                          ? filter.categories.filter((c) => c !== category)
                          : [...filter.categories, category];
                        setFilter({ ...filter, categories: newCategories });
                      }}
                      className="text-xs"
                    >
                      {category === 'セキュリティ'
                        ? '🔐'
                        : category === 'AI・機械学習'
                          ? '🤖'
                          : category === 'デザイン・UX'
                            ? '🎨'
                            : '📊'}{' '}
                      {category}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="events">イベント</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          {/* バッジタイムライン表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />⏰ バッジタイムライン - {viewSettings.viewMode}
                ビュー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBadges.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-3xl">{badge.emoji}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-lg">{badge.name}</h4>
                          <Badge variant={badge.status === 'completed' ? 'default' : 'secondary'}>
                            {badge.status === 'completed'
                              ? '完了'
                              : badge.status === 'in_progress'
                                ? '進行中'
                                : '未開始'}
                          </Badge>
                          <Badge variant="outline">{badge.difficulty}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>

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

                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>進捗</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                          </div>
                        </div>

                        {filter.showRisks && badge.risks.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-2">⚠️ リスク</div>
                            {badge.risks.map((risk, index) => (
                              <div
                                key={index}
                                className="p-2 bg-red-50 text-red-700 rounded text-sm"
                              >
                                {risk.description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {/* イベント表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                📋 タイムラインイベント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {event.type === 'badge_complete'
                          ? '🏆'
                          : event.type === 'risk'
                            ? '⚠️'
                            : '📌'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge
                            variant={event.importance === 'critical' ? 'destructive' : 'default'}
                          >
                            {event.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="text-xs text-blue-600">
                          {new Date(event.date).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {/* 分析表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                📊 分析ダッシュボード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{filteredBadges.length}</div>
                  <div className="text-xs text-muted-foreground">総バッジ数</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {filteredBadges.filter((b) => b.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground">完了</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">
                    {filteredBadges.filter((b) => b.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-muted-foreground">進行中</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {(
                      filteredBadges.reduce((sum, b) => sum + b.progress, 0) / filteredBadges.length
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">平均進捗</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
