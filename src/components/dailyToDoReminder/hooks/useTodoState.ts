import { useState } from 'react';

type TabType = 'list' | 'calendar' | 'chart';

interface UseTodoStateReturn {
  readonly selectedTab: TabType;
  readonly setSelectedTab: (tab: TabType) => void;
}

/**
 * Custom hook for managing todo UI state
 */
export const useTodoState = (): UseTodoStateReturn => {
  const [selectedTab, setSelectedTab] = useState<TabType>('list');

  return {
    selectedTab,
    setSelectedTab,
  };
};
