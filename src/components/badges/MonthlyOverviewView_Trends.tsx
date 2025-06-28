// トレンド分析表示コンポーネント
const renderTrendAnalysis = (trends: MonthlyTrend[]) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        📈 月次トレンド分析
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {trends.map((trend) => (
          <div key={trend.category} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                trend.trend === 'up' ? 'bg-green-500' :
                trend.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="font-medium">{trend.category}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  前月: {trend.previousMonth}% → 今月: {trend.currentMonth}%
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {trend.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : trend.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className={`text-sm font-medium ${
                  trend.trend === 'up' ? 'text-green-600' :
                  trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* トレンドサマリー */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">📊 トレンドサマリー</h4>
        <div className="grid grid-cols-1 md:grid- 