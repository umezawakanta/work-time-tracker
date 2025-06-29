import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CheckCircle, Circle, ArrowUpDown, LayoutGrid, List, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterStatus, ViewMode } from './TodoViewControls';

interface QuickActionsProps {
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isPremium: boolean;
}

/**
 * QuickActions Component
 * 素早いアクセスのためのクイックアクションボタン
 */
export const QuickActions: React.FC<QuickActionsProps> = React.memo(
  ({ filterStatus, onFilterStatusChange, viewMode = 'list', onViewModeChange, isPremium }) => {
    const statusButtons = [
      {
        value: 'all' as FilterStatus,
        icon: <ArrowUpDown className="h-3 w-3" />,
        label: 'すべて',
      },
      {
        value: 'active' as FilterStatus,
        icon: <Circle className="h-3 w-3" />,
        label: '未完了',
      },
      {
        value: 'completed' as FilterStatus,
        icon: <CheckCircle className="h-3 w-3" />,
        label: '完了済み',
      },
    ];

    const viewModeButtons = [
      {
        value: 'list' as ViewMode,
        icon: <List className="h-3 w-3" />,
        label: 'リスト',
      },
      {
        value: 'grid' as ViewMode,
        icon: <LayoutGrid className="h-3 w-3" />,
        label: 'グリッド',
      },
      {
        value: 'kanban' as ViewMode,
        icon: <Columns className="h-3 w-3" />,
        label: 'カンバン',
      },
    ];

    return (
      <div className="flex items-center gap-3">
        {/* ステータスフィルター */}
        <div className="flex items-center">
          {statusButtons.map((button, index) => (
            <React.Fragment key={button.value}>
              <Button
                variant={filterStatus === button.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onFilterStatusChange(button.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3',
                  filterStatus === button.value && 'shadow-sm'
                )}
              >
                {button.icon}
                <span>{button.label}</span>
              </Button>
              {index < statusButtons.length - 1 && <div className="h-4 w-px bg-border mx-1" />}
            </React.Fragment>
          ))}
        </div>

        {/* ビューモード切り替え（プレミアム） */}
        {isPremium && onViewModeChange && (
          <div className="ml-3 pl-3 border-l">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) onViewModeChange(value as ViewMode);
              }}
              className="gap-1"
            >
              {viewModeButtons.map((button) => (
                <ToggleGroupItem
                  key={button.value}
                  value={button.value}
                  aria-label={`${button.label}表示`}
                  className="h-8 px-2"
                >
                  {button.icon}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </div>
    );
  }
);

QuickActions.displayName = 'QuickActions';
