import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 表示モードの型定義
type ViewMode = 'active' | 'all' | 'archived';

/**
 * HabitTrackerFiltersコンポーネントのProps型定義
 */
interface HabitTrackerFiltersProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  habitCategories: Record<string, string[]>;
}

/**
 * 習慣トラッカーのフィルター機能コンポーネント
 */
const HabitTrackerFilters = ({
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  habitCategories,
}: HabitTrackerFiltersProps) => {
  return (
    <>
      {/* 進行状態フィルター */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {viewMode === 'active' ? '進行中' : viewMode === 'archived' ? 'アーカイブ' : 'すべて'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setViewMode('active')}>進行中</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('archived')}>
            アーカイブ済み
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('all')}>すべて表示</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* カテゴリフィルター */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {selectedCategory === 'all' ? 'すべて' : selectedCategory}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
            すべてのカテゴリ
          </DropdownMenuItem>
          {Object.keys(habitCategories).map((category) => (
            <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default HabitTrackerFilters;
