import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';

// 表示モードの型定義
type ViewMode = 'active' | 'all' | 'archived';

/**
 * HabitTrackerEmptyStateコンポーネントのProps型定義
 */
interface HabitTrackerEmptyStateProps {
  viewMode: ViewMode;
  setShowAddForm: (show: boolean) => void;
}

/**
 * 習慣が登録されていない場合の空の状態コンポーネント
 */
const HabitTrackerEmptyState = ({ viewMode, setShowAddForm }: HabitTrackerEmptyStateProps) => {
  // 表示モードに応じてメッセージを変更
  const getMessage = (): string => {
    if (viewMode === 'active') {
      return '進行中の習慣がありません';
    } else if (viewMode === 'archived') {
      return 'アーカイブされた習慣はありません';
    } else {
      return '習慣が登録されていません';
    }
  };

  return (
    <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
      <Target className="h-10 w-10 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500">{getMessage()}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddForm(true)}>
        <Plus className="h-4 w-4 mr-1" />
        新しい習慣を追加
      </Button>
    </div>
  );
};

export default HabitTrackerEmptyState;
