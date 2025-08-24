/**
 * 📊 月次勤怠集計ページ
 * 月次統計・有給管理・エクスポート機能を含む包括的な勤怠管理ページ
 */

import React from 'react';
import MonthlyReportDashboard from '@/components/timeTracking/MonthlyReportDashboard';

const MonthlyTimesheetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <MonthlyReportDashboard />
      </div>
    </div>
  );
};

export default MonthlyTimesheetPage;
