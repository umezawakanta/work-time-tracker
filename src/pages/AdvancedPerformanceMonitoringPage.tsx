/**
 * 🚀 高度パフォーマンス監視ページ
 * Lighthouse自動監視・リアルタイム性能分析・最適化提案システム
 */

import React from 'react';
import { AdvancedPerformanceDashboard } from '@/components/performance/AdvancedPerformanceDashboard';

export const AdvancedPerformanceMonitoringPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚀 高度パフォーマンス監視システム</h1>
        <p className="text-blue-100">Lighthouse自動監視・リアルタイム性能分析・ADHD配慮UI最適化</p>
      </div>

      <AdvancedPerformanceDashboard />
    </div>
  );
};

export default AdvancedPerformanceMonitoringPage;
