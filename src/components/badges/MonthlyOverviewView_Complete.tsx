// 完全な月次概要ビューレンダリング関数
const renderMonthlyView = () => {
  const monthlyData = generateMonthlyOverviewData();

  return (
    <div className="space-y-6">
      {/* メトリクス表示 */}
      {renderMonthlyMetrics(monthlyData.metrics)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ別進捗 */}
        {renderCategoryProgress(monthlyData.categories)}

        {/* トレンド分析 */}
        {renderTrendAnalysis(monthlyData.trends)}
      </div>

      {/* 達成バッジ */}
      {renderMonthlyAchievements(monthlyData.achievements)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週次内訳 */}
        {renderWeeklyBreakdown(monthlyData.weeklyBreakdown)}

        {/* 来月予測 */}
        {renderNextMonthPredictions(monthlyData.predictions)}
      </div>
    </div>
  );
};
