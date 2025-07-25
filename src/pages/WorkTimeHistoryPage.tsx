import React from 'react';
import { WorkTimeHistoryManager } from '@/components/WorkTimeHistoryManager';

export default function WorkTimeHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 勤怠履歴管理</h1>
        <p className="text-gray-600">詳細な打刻履歴の確認と修正申請ができます</p>
      </div>

      <WorkTimeHistoryManager />
    </div>
  );
}
