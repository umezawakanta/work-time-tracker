import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// タブの型定義
type TabType = 'list' | 'stats' | 'calendar';

/**
 * HabitTrackerTabsコンポーネントのProps型定義
 */
interface HabitTrackerTabsProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

/**
 * 習慣トラッカーのタブ切り替えコンポーネント
 */
const HabitTrackerTabs = ({ currentTab, setCurrentTab }: HabitTrackerTabsProps) => {
  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => setCurrentTab(value as TabType)}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="list" className="text-sm px-3">
            リスト
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-sm px-3">
            統計
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-sm px-3">
            カレンダー
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
};

export default HabitTrackerTabs;
