import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BarChart3 } from 'lucide-react';

const DataVisualizationPage: React.FC = () => {
  return (
    <PageLayout
      title="データビジュアライゼーション"
      subtitle="インタラクティブチャート・3D可視化・データストーリーテリング"
      badge={{
        text: 'データ可視化',
        variant: 'default',
        icon: <BarChart3 className="h-4 w-4" />,
      }}
    >
      <div className="space-y-6">
        {/* プレースホルダーコンテンツ */}
        <div className="text-center p-8">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-2">データビジュアライゼーション</h2>
          <p className="text-gray-600">高度なデータ可視化システムを準備中です</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default DataVisualizationPage;
