/**
 * ⚙️ 勤務パターン設定ページ
 * 標準勤務時間・休憩時間・残業計算基準・労働時間上限設定
 * ADHD/ASD特性に応じた個人最適化機能
 */

import React from 'react';
import WorkPatternConfigDashboard from '@/components/timeTracking/WorkPatternConfigDashboard';

const WorkPatternSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <WorkPatternConfigDashboard />
      </div>
    </div>
  );
};

export default WorkPatternSettingsPage;
