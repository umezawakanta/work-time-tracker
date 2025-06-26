import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DatabaseBackupDashboard } from '@/components/database/DatabaseBackupDashboard';

const DatabaseBackupPage: React.FC = () => {
  return (
    <PageLayout title="データベース管理" subtitle="バックアップ・リカバリシステム">
      <DatabaseBackupDashboard />
    </PageLayout>
  );
};

export default DatabaseBackupPage;
