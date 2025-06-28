// 週次ビューの詳細展開部分の続き
const renderWeeklyViewDetailedContent = (
  week: WeeklySchedule,
  badge: WeeklyBadgePlan,
  index: number
) => (
  <div key={index} className="border rounded-lg p-3">
    <div className="flex items-start gap-3">
      <span className="text-2xl">{badge.badgeEmoji}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">{badge.badgeName}</span>
          <Badge variant={getPriorityColor(badge.priority)}>{badge.priority}</Badge>
          <Badge variant="outline" className="text-xs">
            {badge.estimatedHours}h
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          カテゴリ: {badge.category} | 目標: {badge.targetDate}
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>進捗</span>
              <span>{badge.progress}%</span>
            </div>
            <Progress value={badge.progress} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>信頼度</span>
              <span
                className={
                  badge.confidence >= 80
                    ? 'text-green-600'
                    : badge.confidence >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }
              >
                {badge.confidence}%
              </span>
            </div>
            <Progress value={badge.confidence} className="h-2" />
          </div>
        </div>
        {badge.dependencies.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            依存: {badge.dependencies.join(', ')}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${getStatusColor(badge.status)}`}>
          {badge.status === 'completed'
            ? '完了'
            : badge.status === 'in_progress'
              ? '進行中'
              : badge.status === 'delayed'
                ? '遅延'
                : '未開始'}
        </div>
      </div>
    </div>
  </div>
);
