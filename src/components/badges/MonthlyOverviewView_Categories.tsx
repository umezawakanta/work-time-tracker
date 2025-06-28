// カテゴリ別進捗表示コンポーネント
const renderCategoryProgress = (categories: MonthlyBadgeCategory[]) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        🎯 カテゴリ別進捗
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {category.completedCount}/{category.count}個完了 • {category.actualHours}h/
                    {category.estimatedHours}h
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{category.progress}%</div>
                <div className="text-xs text-muted-foreground">
                  効率: {category.efficiency.toFixed(1)}%
                </div>
              </div>
            </div>

            <Progress value={category.progress} className="h-3 mb-3" />

            {/* 完了したバッジ */}
            {category.topBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">完了:</span>
                {category.topBadges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
