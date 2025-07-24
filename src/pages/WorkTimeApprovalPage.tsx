import React from 'react';
import { WorkTimeApprovalSystem } from '@/components/WorkTimeApprovalSystem';
import Layout from '@/components/layout/Layout';

export default function WorkTimeApprovalPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍💼 勤怠承認管理</h1>
          <p className="text-gray-600">従業員の勤怠記録を確認・承認します（管理者専用）</p>
        </div>

        <WorkTimeApprovalSystem />
      </div>
    </Layout>
  );
}
