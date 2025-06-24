import React from 'react';
import Layout from '@/components/layout/Layout';
import { TodoAnalytics } from '@/components/analytics/TodoAnalytics';

/**
 * TODO分析ダッシュボードページ
 * タスクの完了状況、生産性、トレンドを詳細に分析する画面
 */
export const TodoAnalyticsPage: React.FC = () => {
  return (
    <Layout>
      <TodoAnalytics />
    </Layout>
  );
};

export default TodoAnalyticsPage;
