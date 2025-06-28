// 月次メトリクス表示コンポーネント
const renderMonthlyMetrics = (metrics: MonthlyMetrics) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        📊 {metrics.month} 概要
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalBadges}</div>
          <div className="text-xs text-muted-foreground">総バッジ数</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.completedBadges}</div>
          <div className="text-xs text-muted-foreground">完了済み</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{metrics.inProgressBadges}</div>
          <div className="text-xs text-muted-foreground">進行中</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics.actualHours}h</div>
          <div className="text-xs text-muted-foreground">学習時間</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{metrics.efficiency.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">効率</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{metrics.streakDays}</div>
          <div className="text-xs text-muted-foreground">連続日数</div>
        </div>
      </div>

      {/* 進捗サマリー */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">月次完了率</span>
            <span className="text-sm font-bold text-green-600">
              {metrics.completionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.completionRate} className="h-3" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">時間効率</span>
            <span className="text-sm font-bold text-purple-600">
              {metrics.efficiency.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.efficiency} className="h-3" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">平均信頼度</span>
            <span className="text-sm font-bold text-blue-600">
              {metrics.averageConfidence.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.averageConfidence} className="h-3" />
        </div>
      </div>

      {/* トップパフォーマンス */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h4 className="font-semibold mb-2">🏆 今月のトップパフォーマンス</h4>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{metrics.topPerformingCategory}分野</span>
          <span className="text-xs text-muted-foreground">が最も高い進捗を示しています</span>
        </div>
      </div>
    </CardContent>
  </Card>
);
