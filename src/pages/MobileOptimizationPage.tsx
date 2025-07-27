/**
 * 📱 モバイル最適化ページ
 * PWA・タッチ操作・プッシュ通知・ADHD/ASD特化モバイル最適化の統合管理
 */

import React from 'react';
import { MobileOptimizationDashboard } from '@/components/mobile/MobileOptimizationDashboard';

const MobileOptimizationPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <MobileOptimizationDashboard />
    </div>
  );
};

export default MobileOptimizationPage;
