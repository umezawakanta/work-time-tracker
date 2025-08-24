/**
 * ⏰ リアルタイム打刻ページ
 * 勤怠管理のメインページ
 */

import React from 'react';
import RealtimeClockDashboard from '@/components/timeTracking/RealtimeClockDashboard';

const RealtimeClockPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <RealtimeClockDashboard />
      </div>
    </div>
  );
};

export default RealtimeClockPage;
