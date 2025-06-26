import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CrossBrowserTestingDashboard } from '@/components/development/CrossBrowserTestingDashboard';

export const CrossBrowserTestPage: React.FC = () => {
  return (
    <PageLayout
      title="🎨 クロスブラウザテスト"
      description="フロントエンド技術の完全マスター - 全ブラウザ互換性テスト"
    >
      <CrossBrowserTestingDashboard />
    </PageLayout>
  );
};
