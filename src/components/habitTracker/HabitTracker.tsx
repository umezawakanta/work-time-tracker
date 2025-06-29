import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Trophy, Flame, Target, Info, Plus } from 'lucide-react';
import { useHabitTracker } from '@/hooks/useHabitTracker';

// 定数のインポート
import { habitCategories } from '@/components/habitTracker/constants/habitCategories';

// サブコンポーネントのインポート
import HabitTrackerTabs from './HabitTrackerTabs';
import HabitTrackerFilters from './HabitTrackerFilters';
import HabitTrackerEmptyState from './HabitTrackerEmptyState';
import HabitList from './HabitList';
import HabitStats from './HabitStats';
import HabitCalendar from './HabitCalendar';

// デフォルトの習慣リスト
const defaultHabits = [
  '酒',
  'たばこ',
  'ジャンクフード',
  '睡眠不足',
  'SNSの過剰利用',
  '姿勢が悪い',
  'コンビニ弁当',
  '後回し癖',
  'ネガティブ思考',
];

// 表示モードの型定義
type ViewMode = 'active' | 'all' | 'archived';
// タブの型定義
type TabType = 'list' | 'stats' | 'calendar';

const HabitTracker = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<TabType>('list');
  const [newHabit, setNewHabit] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const {
    currentDate,
    stats,
    isLoading,
    error,
    showCongrats,
    toggleHabit,
    handleMonthChange,
    getHabitData,
    addCustomHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    getActiveHabits,
    getArchivedHabits,
    getAllHabits,
    getCategoryHabits,
  } = useHabitTracker(defaultHabits);

  // 表示する習慣のリストを取得
  const getVisibleHabits = (): string[] => {
    let habitsList: string[] = [];

    // ビューモードによるフィルタリング
    if (viewMode === 'active') {
      habitsList = getActiveHabits();
    } else if (viewMode === 'archived') {
      habitsList = getArchivedHabits();
    } else {
      habitsList = getAllHabits();
    }

    // カテゴリによるフィルタリング
    if (selectedCategory !== 'all') {
      habitsList = habitsList.filter((habit) =>
        getCategoryHabits(selectedCategory).includes(habit)
      );
    }

    return habitsList;
  };

  // 新しい習慣を追加
  const handleAddHabit = () => {
    if (newHabit.trim()) {
      addCustomHabit(newHabit.trim());
      setNewHabit('');
      setShowAddForm(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const visibleHabits = getVisibleHabits();

  return (
    <Card className="w-full shadow-sm">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors flex flex-row items-center justify-between space-y-0 pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-md font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" aria-hidden="true" />
          やらないこと トラッカー
        </CardTitle>
        <div className="flex items-center gap-2">
          {showCongrats && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Trophy className="h-3 w-3 mr-1" />
              1週間達成!
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            {isExpanded ? (
              <ChevronUp size={18} aria-label="折りたたむ" />
            ) : (
              <ChevronDown size={18} aria-label="展開する" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="pt-3">
            <HabitTrackerTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

            <div className="flex justify-between items-center mb-4">
              <div></div> {/* スペーサー */}
              <div className="flex items-center gap-2">
                <HabitTrackerFilters
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  habitCategories={habitCategories}
                />

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showAddForm && (
              <div className="mb-4 flex items-center gap-2 bg-gray-50 p-3 rounded-md">
                <Input
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="新しい習慣を入力"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddHabit} disabled={!newHabit.trim()}>
                  追加
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                  キャンセル
                </Button>
              </div>
            )}

            {visibleHabits.length === 0 ? (
              <HabitTrackerEmptyState viewMode={viewMode} setShowAddForm={setShowAddForm} />
            ) : (
              <>
                {currentTab === 'list' && (
                  <HabitList
                    visibleHabits={visibleHabits}
                    stats={stats}
                    currentDate={currentDate}
                    getHabitData={getHabitData}
                    toggleHabit={toggleHabit}
                    archiveHabit={archiveHabit}
                    unarchiveHabit={unarchiveHabit}
                    deleteHabit={deleteHabit}
                    viewMode={viewMode}
                  />
                )}

                {currentTab === 'stats' && (
                  <HabitStats stats={stats} getActiveHabits={getActiveHabits} />
                )}

                {currentTab === 'calendar' && (
                  <HabitCalendar
                    currentDate={currentDate}
                    handleMonthChange={handleMonthChange}
                    getActiveHabits={getActiveHabits}
                    stats={stats}
                    getHabitData={getHabitData}
                    toggleHabit={toggleHabit}
                  />
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="pt-0 justify-between text-xs text-gray-500">
            <p>継続は力なり。日々の小さな変化が大きな変化を生み出します。</p>
            <div className="flex items-center gap-2">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>
                合計{Object.values(stats).reduce((sum, stat) => sum + stat.currentStreak, 0)}
                日継続中
              </span>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default HabitTracker;
