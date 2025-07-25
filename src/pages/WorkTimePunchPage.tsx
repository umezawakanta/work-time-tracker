import React from 'react';
import { WorkTimePunchSystem } from '@/components/WorkTimePunchSystem';

export default function WorkTimePunchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⏰ リアルタイム勤怠打刻</h1>
        <p className="text-gray-600">GPS位置情報による正確な出勤・退勤・休憩の打刻システム</p>
      </div>

      <WorkTimePunchSystem />
    </div>
  );
}
