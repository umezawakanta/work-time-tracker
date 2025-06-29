import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

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

// タイムラインフィルターコンポーネント
export const renderTimelineFilters = (
  filter: TimelineFilter,
  onFilterChange: (newFilter: TimelineFilter) => void,
  viewSettings: TimelineViewSettings,
  onViewSettingsChange: (newSettings: TimelineViewSettings) => void
) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        🔧 表示設定・フィルター
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* 表示モード設定 */}
        <div>
          <h4 className="font-medium mb-3">表示モード</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['timeline', 'gantt', 'calendar', 'list'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewSettings.viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewSettingsChange({ ...viewSettings, viewMode: mode })}
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

        {/* 時間スケール */}
        <div>
          <h4 className="font-medium mb-3">時間スケール</h4>
          <div className="grid grid-cols-4 gap-2">
            {(['day', 'week', 'month', 'quarter'] as const).map((scale) => (
              <Button
                key={scale}
                variant={viewSettings.timeScale === scale ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewSettingsChange({ ...viewSettings, timeScale: scale })}
                className="text-xs"
              >
                {scale === 'day'
                  ? '日'
                  : scale === 'week'
                    ? '週'
                    : scale === 'month'
                      ? '月'
                      : '四半期'}
              </Button>
            ))}
          </div>
        </div>

        {/* グループ化設定 */}
        <div>
          <h4 className="font-medium mb-3">グループ化</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['none', 'category', 'priority', 'status'] as const).map((group) => (
              <Button
                key={group}
                variant={viewSettings.groupBy === group ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewSettingsChange({ ...viewSettings, groupBy: group })}
                className="text-xs"
              >
                {group === 'none'
                  ? 'なし'
                  : group === 'category'
                    ? 'カテゴリ'
                    : group === 'priority'
                      ? '優先度'
                      : 'ステータス'}
              </Button>
            ))}
          </div>
        </div>

        {/* ステータスフィルター */}
        <div>
          <h4 className="font-medium mb-3">ステータス</h4>
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
                  onFilterChange({ ...filter, statuses: newStatuses });
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

        {/* 優先度フィルター */}
        <div>
          <h4 className="font-medium mb-3">優先度</h4>
          <div className="flex flex-wrap gap-2">
            {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filter.priorities.includes(priority) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const newPriorities = filter.priorities.includes(priority)
                    ? filter.priorities.filter((p) => p !== priority)
                    : [...filter.priorities, priority];
                  onFilterChange({ ...filter, priorities: newPriorities });
                }}
                className="text-xs"
              >
                {priority === 'low'
                  ? '🟢 低'
                  : priority === 'medium'
                    ? '🟡 中'
                    : priority === 'high'
                      ? '🟠 高'
                      : '🔴 緊急'}
              </Button>
            ))}
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div>
          <h4 className="font-medium mb-3">カテゴリ</h4>
          <div className="flex flex-wrap gap-2">
            {['セキュリティ', 'デザイン・UX', 'AI・機械学習', 'プロジェクト管理', '開発'].map(
              (category) => (
                <Button
                  key={category}
                  variant={filter.categories.includes(category) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newCategories = filter.categories.includes(category)
                      ? filter.categories.filter((c) => c !== category)
                      : [...filter.categories, category];
                    onFilterChange({ ...filter, categories: newCategories });
                  }}
                  className="text-xs"
                >
                  {category === 'セキュリティ'
                    ? '🔐'
                    : category === 'デザイン・UX'
                      ? '🎨'
                      : category === 'AI・機械学習'
                        ? '🤖'
                        : category === 'プロジェクト管理'
                          ? '📊'
                          : '💻'}{' '}
                  {category}
                </Button>
              )
            )}
          </div>
        </div>

        {/* 表示オプション */}
        <div>
          <h4 className="font-medium mb-3">表示オプション</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-dependencies"
                checked={filter.showDependencies}
                onChange={(e) => onFilterChange({ ...filter, showDependencies: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="show-dependencies" className="text-sm">
                依存関係を表示
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-milestones"
                checked={filter.showMilestones}
                onChange={(e) => onFilterChange({ ...filter, showMilestones: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="show-milestones" className="text-sm">
                マイルストーンを表示
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-risks"
                checked={filter.showRisks}
                onChange={(e) => onFilterChange({ ...filter, showRisks: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="show-risks" className="text-sm">
                リスクを表示
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-details"
                checked={viewSettings.showDetails}
                onChange={(e) =>
                  onViewSettingsChange({ ...viewSettings, showDetails: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="show-details" className="text-sm">
                詳細情報を表示
              </label>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
