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
          <SystemMetric label="自動化度" value={automationLevel} icon={<Bot />} color="blue" />
          <SystemMetric
            label="継続性"
            value={consistencyScore}
            icon={<TrendingUp />}
            color="green"
          />
          <SystemMetric
            label="効率向上"
            value={`+${efficiencyGains}%`}
            icon={<Zap />}
            color="yellow"
          />
          <SystemMetric
            label="システム健全性"
            value={systemHealth}
            icon={<Shield />}
            color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
};
