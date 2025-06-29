import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, Plus, Settings, Zap, Download, Upload, Palette } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { FilterPanel } from './FilterPanel';
import { QuickActions } from './QuickActions';
import { ViewSettings } from './ViewSettings';
import { cn } from '@/lib/utils';

export type FilterStatus = 'all' | 'active' | 'completed';
export type CategoryFilter = 'all' | 'input' | 'output' | 'deadline';
export type SortOption = 'priority' | 'deadline' | 'created' | 'title';
export type ViewMode = 'list' | 'grid' | 'kanban';

interface TodoViewControlsProps {
  readonly showFilters: boolean;
  readonly setShowFilters: (show: boolean) => void;
  readonly showAddForm: boolean;
  readonly setShowAddForm: (show: boolean) => void;
  readonly filterStatus: FilterStatus;
  readonly setFilterStatus: (status: FilterStatus) => void;
  readonly categoryFilter: CategoryFilter;
  readonly setCategoryFilter: (category: CategoryFilter) => void;
  readonly autoAdjustEnabled: boolean;
  readonly setAutoAdjustEnabled: (enabled: boolean) => void;
  readonly onAdjustPriorities: () => void;
  readonly viewMode?: ViewMode;
  readonly setViewMode?: (mode: ViewMode) => void;
  readonly sortOption?: SortOption;
  readonly setSortOption?: (option: SortOption) => void;
  readonly isPremium?: boolean;
}

/**
 * TodoViewControls Component
 * エンタープライズグレードのタスク管理コントロール
 * 高度なフィルタリング、ソート、ビュー制御を提供
 */
export const TodoViewControls: React.FC<TodoViewControlsProps> = React.memo(
  ({
    showFilters,
    setShowFilters,
    showAddForm,
    setShowAddForm,
    filterStatus,
    setFilterStatus,
    categoryFilter,
    setCategoryFilter,
    autoAdjustEnabled,
    setAutoAdjustEnabled,
    onAdjustPriorities,
    viewMode = 'list',
    setViewMode,
    sortOption = 'priority',
    setSortOption,
    isPremium = false,
  }) => {
    const analytics = useAnalytics();

    // アクティブフィルター数の計算
    const activeFilterCount = useMemo(() => {
      let count = 0;
      if (filterStatus !== 'all') count++;
      if (categoryFilter !== 'all') count++;
      return count;
    }, [filterStatus, categoryFilter]);

    // フィルター変更ハンドラー
    const handleFilterStatusChange = useCallback(
      (status: FilterStatus) => {
        setFilterStatus(status);
        analytics.track('todo_filter_changed', { type: 'status', value: status });
      },
      [setFilterStatus, analytics]
    );

    const handleCategoryFilterChange = useCallback(
      (category: CategoryFilter) => {
        setCategoryFilter(category);
        analytics.track('todo_filter_changed', { type: 'category', value: category });
      },
      [setCategoryFilter, analytics]
    );

    // 設定変更ハンドラー
    const handleAutoAdjustToggle = useCallback(
      (enabled: boolean) => {
        setAutoAdjustEnabled(enabled);
        analytics.track('todo_settings_changed', {
          setting: 'auto_adjust',
          value: enabled,
        });
      },
      [setAutoAdjustEnabled, analytics]
    );

    const handleAdjustPriorities = useCallback(() => {
      onAdjustPriorities();
      analytics.track('todo_priorities_adjusted');
    }, [onAdjustPriorities, analytics]);

    // すべてのフィルターをクリア
    const handleClearAllFilters = useCallback(() => {
      setFilterStatus('all');
      setCategoryFilter('all');
      analytics.track('todo_filters_cleared');
    }, [setFilterStatus, setCategoryFilter, analytics]);

    return (
      <div className="space-y-3">
        {/* メインコントロールバー */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* フィルタートグル */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('flex items-center gap-2 transition-all', showFilters && 'shadow-sm')}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">フィルター</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs px-1 ml-1 bg-primary/20">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* クイックフィルター（デスクトップ） */}
            <div className="hidden md:flex items-center">
              <QuickActions
                filterStatus={filterStatus}
                onFilterStatusChange={handleFilterStatusChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isPremium={isPremium}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ビュー設定 */}
            {isPremium && setViewMode && (
              <ViewSettings
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortOption={sortOption}
                onSortOptionChange={setSortOption}
              />
            )}

            {/* 詳細設定メニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline ml-1">設定</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>タスク管理設定</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* 自動優先度調整 */}
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-adjust" className="text-sm cursor-pointer">
                      自動優先度調整
                    </Label>
                    <Switch
                      id="auto-adjust"
                      checked={autoAdjustEnabled}
                      onCheckedChange={handleAutoAdjustToggle}
                    />
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* アクション */}
                <DropdownMenuItem onClick={handleAdjustPriorities}>
                  <Zap className="h-4 w-4 mr-2" />
                  優先度を今すぐ調整
                </DropdownMenuItem>

                {isPremium && (
                  <>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      設定をエクスポート
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      設定をインポート
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Palette className="h-4 w-4 mr-2" />
                      テーマ設定
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* タスク追加ボタン */}
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className={cn(
                'flex items-center gap-2 transition-all',
                showAddForm && 'ring-2 ring-primary/50'
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">タスク追加</span>
            </Button>
          </div>
        </div>

        {/* フィルターパネル */}
        {showFilters && (
          <FilterPanel
            filterStatus={filterStatus}
            categoryFilter={categoryFilter}
            onFilterStatusChange={handleFilterStatusChange}
            onCategoryFilterChange={handleCategoryFilterChange}
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
          />
        )}
      </div>
    );
  }
);

TodoViewControls.displayName = 'TodoViewControls';
