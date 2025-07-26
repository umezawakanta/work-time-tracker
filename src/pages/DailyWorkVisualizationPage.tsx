/**
 * 📊 日次勤務状況可視化ページ
 * 勤務時間の詳細分析とビジュアル化のメインページ
 */

import React from 'react';
import DailyWorkVisualizationDashboard from '@/components/timeTracking/DailyWorkVisualizationDashboard';

const DailyWorkVisualizationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DailyWorkVisualizationDashboard />
      </div>
    </div>
  );
};

export default DailyWorkVisualizationPage;
