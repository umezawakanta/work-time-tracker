import React from 'react';
import { WorkTimeCorrectionApproval } from '@/components/WorkTimeCorrectionApproval';
import Layout from '@/components/layout/Layout';

export default function WorkTimeCorrectionApprovalPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✅ 修正申請承認管理</h1>
          <p className="text-gray-600">従業員からの打刻修正申請の確認・承認（管理者専用）</p>
        </div>

        <WorkTimeCorrectionApproval />
      </div>
    </Layout>
  );
}
