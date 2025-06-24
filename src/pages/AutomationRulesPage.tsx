import React from 'react';
import { AutomationRulesManager } from '@/components/automation/AutomationRulesManager';
import Layout from '@/components/layout/Layout';

/**
 * 自動化ルール管理ページ
 * ワークフロー自動化ルールの作成・編集・管理を行う画面
 */
export const AutomationRulesPage: React.FC = () => {
  return (
    <Layout>
      <AutomationRulesManager />
    </Layout>
  );
};

export default AutomationRulesPage;
