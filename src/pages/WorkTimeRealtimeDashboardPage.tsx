import React from 'react';
import { WorkTimeRealtimeDashboard } from '@/components/worktime/WorkTimeRealtimeDashboard';

export default function WorkTimeRealtimeDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 リアルタイム勤務監視</h1>
        <p className="text-gray-600">
          全従業員の勤務状況をリアルタイムで監視・管理します（管理者専用）
        </p>
      </div>

      <WorkTimeRealtimeDashboard />
    </div>
  );
}
