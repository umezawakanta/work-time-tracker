import React from 'react';
import { SystematizationDashboard } from '@/components/systematization/SystematizationDashboard';

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-600 mt-2">{subtitle}</p>
  </div>
);

const QuickActions = () => <div>Quick Actions Placeholder</div>;
const ActiveSystems = () => <div>Active Systems Placeholder</div>;
const RecentTemplates = () => <div>Recent Templates Placeholder</div>;

const SystematizationHub: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader title="仕組み化ハブ" subtitle="継続可能な成長システムを構築・管理する中央拠点" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインダッシュボード */}
        <div className="lg:col-span-2">
          <SystematizationDashboard />
        </div>

        {/* サイドパネル */}
        <div className="space-y-6">
          <QuickActions />
          <ActiveSystems />
          <RecentTemplates />
        </div>
      </div>
    </div>
  );
};
