/**
 * 🚀 本番環境最適化ページ
 * CDN統合・キャッシュ戦略・監視システム・パフォーマンス最適化
 */

import React from 'react';
import { ProductionOptimizationDashboard } from '@/components/production/ProductionOptimizationDashboard';

export const ProductionOptimizationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚀 本番環境最適化システム</h1>
        <p className="text-blue-100">
          CDN統合・キャッシュ戦略・監視システム・パフォーマンス最適化の統合管理
        </p>
      </div>

      <ProductionOptimizationDashboard />
    </div>
  );
};

export default ProductionOptimizationPage;
