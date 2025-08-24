/**
 * 📋 承認ワークフローページ
 * 勤怠データ承認申請・管理者承認・差し戻し・修正申請機能
 * ADHD/ASD特性配慮のコミュニケーション最適化
 */

import React from 'react';
import ApprovalDashboard from '@/components/approval/ApprovalDashboard';

const ApprovalWorkflowPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ApprovalDashboard />
      </div>
    </div>
  );
};

export default ApprovalWorkflowPage;
