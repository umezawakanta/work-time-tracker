import React from 'react';
import { WorkTimeCorrectionApproval } from '@/components/WorkTimeCorrectionApproval';

export default function WorkTimeCorrectionApprovalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✅ 修正申請承認</h1>
        <p className="text-gray-600">
          従業員からの打刻修正申請を効率的に管理・承認します（管理者専用）
        </p>
      </div>

      <WorkTimeCorrectionApproval />
    </div>
  );
}
