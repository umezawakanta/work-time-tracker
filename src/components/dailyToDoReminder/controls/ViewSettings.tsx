import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ArrowUp, ArrowDown, Calendar, Hash, Type, Star } from 'lucide-react';
import type { ViewMode, SortOption } from './TodoViewControls';

interface ViewSettingsProps {
  viewMode: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  sortOption?: SortOption;
  onSortOptionChange?: (option: SortOption) => void;
}

/**
 * ViewSettings Component
 * 高度なビュー設定とソートオプション
 */
export const ViewSettings: React.FC<ViewSettingsProps> = React.memo(
  ({ viewMode, onViewModeChange, sortOption = 'priority', onSortOptionChange }) => {
    const sortOptions = [
      {
        value: 'priority' as SortOption,
        label: '優先度',
        icon: <Star className="h-3 w-3" />,
        description: '重要度の高い順',
      },
      {
        value: 'deadline' as SortOption,
        label: '期限',
        icon: <Calendar className="h-3 w-3" />,
        description: '期限が近い順',
      },
      {
        value: 'created' as SortOption,
        label: '作成日',
        icon: <Hash className="h-3 w-3" />,
        description: '新しい順',
      },
      {
        value: 'title' as SortOption,
        label: 'タイトル',
        icon: <Type className="h-3 w-3" />,
        description: 'アルファベット順',
      },
    ];

    const viewModes = [
      {
        value: 'list' as ViewMode,
        label: 'リスト表示',
        description: '詳細情報を含む一覧',
      },
      {
        value: 'grid' as ViewMode,
        label: 'グリッド表示',
        description: 'カード形式のレイアウト',
      },
      {
        value: 'kanban' as ViewMode,
        label: 'カンバン表示',
        description: 'ドラッグ＆ドロップ対応',
      },
    ];

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">表示設定</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>表示設定</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* ビューモード設定 */}
          {onViewModeChange && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                表示形式
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={viewMode}
                onValueChange={(value) => onViewModeChange(value as ViewMode)}
              >
                {viewModes.map((mode) => (
                  <DropdownMenuRadioItem
                    key={mode.value}
                    value={mode.value}
                    className="flex flex-col items-start py-2"
                  >
                    <span className="font-medium">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">{mode.description}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          )}

          {/* ソート設定 */}
          {onSortOptionChange && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                並び順
              </DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortOptionChange(option.value)}
                  className={sortOption === option.value ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div className="flex flex-col">
                        <span className="text-sm">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                    {sortOption === option.value && (
                      <div className="flex items-center gap-1 ml-2">
                        <ArrowUp className="h-3 w-3" />
                        <ArrowDown className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

ViewSettings.displayName = 'ViewSettings';
