import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, Bot, TrendingUp, Zap, Shield } from 'lucide-react';

// Placeholder hook
const useSystematizationMetrics = () => ({
  automationLevel: 75,
  consistencyScore: 82,
  efficiencyGains: 15,
  systemHealth: 90,
});

// Placeholder components
const ActiveSystems = () => (
  <Card>
    <CardContent>アクティブな仕組み</CardContent>
  </Card>
);
const AutomationImpact = () => (
  <Card>
    <CardContent>自動化の効果測定</CardContent>
  </Card>
);
const AISystemSuggestions = () => (
  <Card>
    <CardContent>AIによる仕組み提案</CardContent>
  </Card>
);
const CommunityTemplates = () => (
  <Card>
    <CardContent>コミュニティテンプレート</CardContent>
  </Card>
);

const SystemMetric = ({
  label,
  value,
  icon,
  _color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  _color: string;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

export const SystematizationDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 仕組み化スコア */}
      <SystematizationScore />

      {/* アクティブな仕組み */}
      <ActiveSystems />

      {/* 自動化の効果測定 */}
      <AutomationImpact />

      {/* AIによる仕組み提案 */}
      <AISystemSuggestions />

      {/* コミュニティテンプレート */}
      <CommunityTemplates />
    </div>
  );
};

// 仕組み化スコアコンポーネント
const SystematizationScore: React.FC = () => {
  const { automationLevel, consistencyScore, efficiencyGains, systemHealth } =
    useSystematizationMetrics();

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cog className="h-6 w-6 text-blue-600" />
          仕組み化レベル
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SystemMetric label="自動化度" value={automationLevel} icon={<Bot />} _color="blue" />
          <SystemMetric
            label="継続性"
            value={consistencyScore}
            icon={<TrendingUp />}
            _color="green"
          />
          <SystemMetric
            label="効率向上"
            value={`+${efficiencyGains}%`}
            icon={<Zap />}
            _color="yellow"
          />
          <SystemMetric
            label="システム健全性"
            value={systemHealth}
            icon={<Shield />}
            _color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
};
