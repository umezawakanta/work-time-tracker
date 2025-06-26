import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import PerformanceOptimizationDashboard from '@/components/performance/PerformanceOptimizationDashboard';

/**
 * ⚡ パフォーマンス最適化マスターページ
 * Lighthouse 99点達成・メモリ・CPU最適化管理
 */
const PerformanceOptimizationPage: React.FC = () => {
  return (
    <PageLayout
      title="パフォーマンス最適化"
      subtitle="エンタープライズ級パフォーマンス監視・最適化システム"
    >
      <PerformanceOptimizationDashboard />
    </PageLayout>
  );
};

export default PerformanceOptimizationPage;
