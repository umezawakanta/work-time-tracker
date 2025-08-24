/**
 * 🔔 通知設定ページ
 * 出勤・退勤・休憩・残業通知とADHD/ASD特性配慮の通知最適化
 */

import React from 'react';
import AlertConfigDashboard from '@/components/notifications/AlertConfigDashboard';

const NotificationSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AlertConfigDashboard />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
