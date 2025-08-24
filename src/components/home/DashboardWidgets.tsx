import React from 'react';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import BalanceUpdateReminder from '@/components/BalanceUpdateReminder';
import HabitTracker from '@/components/habitTracker/HabitTracker';

interface DashboardWidgetsProps {
  isPremium: boolean;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ isPremium }) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">今日のダッシュボード</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BalanceUpdateReminder assetEntries={[]} debtEntries={[]} />
        <DailyTodoReminder isPremium={isPremium} />
      </div>

      <div className="mt-6">
        <HabitTracker />
      </div>
    </div>
  );
};
