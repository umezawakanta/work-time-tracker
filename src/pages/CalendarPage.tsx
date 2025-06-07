'use client';

import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import TaskCalendarView from '@/components/calendar/TaskCalendarView';
import { Calendar, Target, CheckSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function CalendarPage() {
  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // カレンダー統計を計算
  const stats = React.useMemo(() => {
    const today = new Date();
    const todayTasks = todos.filter((todo) => {
      if (!todo.deadline) return false;
      const taskDate = new Date(todo.deadline);
      return taskDate.toDateString() === today.toDateString();
    });

    const overdueTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      const taskDate = new Date(todo.deadline);
      return taskDate < today;
    });

    const upcomingTasks = todos.filter((todo) => {
      if (!todo.deadline || todo.completed) return false;
      const taskDate = new Date(todo.deadline);
      const daysAhead = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysAhead > 0 && daysAhead <= 7;
    });

    return {
      todayTasks: todayTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      completedToday: todayTasks.filter((task) => task.completed).length,
    };
  }, [todos]);

  return (
    <PageLayout
      title="カレンダー"
      subtitle="タスクとイベントを統合的に管理し、スケジュールを効率的に計画しましょう"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <Calendar className="w-4 h-4" />,
      }}
      headerGradient
    >
      <div className="space-y-6">
        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">今日のタスク</p>
                <p className="text-2xl font-bold text-blue-700">{stats.todayTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">今日完了</p>
                <p className="text-2xl font-bold text-green-700">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">期限切れ</p>
                <p className="text-2xl font-bold text-red-700">{stats.overdueTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">今週予定</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.upcomingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* メインカレンダー */}
        <TaskCalendarView />

        {/* 使い方ヒント */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-4">カレンダーの使い方</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">基本操作</h4>
              <ul className="space-y-1">
                <li>• 日付をクリックして新しいイベントを作成</li>
                <li>• タスクをクリックして完了状態を切り替え</li>
                <li>• 月/週/日 ビューで表示を切り替え</li>
                <li>• フィルターでタスクとイベントを絞り込み</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">タスク管理</h4>
              <ul className="space-y-1">
                <li>
                  • <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-1"></span>
                  進行中のタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1"></span>
                  完了したタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>
                  期限切れのタスク
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-purple-100 rounded mr-1"></span>
                  イベント
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
