import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, ChevronRight } from 'lucide-react';

interface WeeklySchedule {
  weekNumber: number;
  totalPlannedHours: number;
  plannedBadges: any[];
  onTrackScore: number;
  theme: string;
  startDate: string;
  endDate: string;
  riskLevel: string;
  efficiency: number;
  completionRate: number;
}

const weeklySchedules: WeeklySchedule[] = []; // Add your weekly schedule data here

export const WeeklyViewComplete: React.FC = () => {
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(null);

  const getOnTrackColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  const getRiskColor = (risk: string) =>
    risk === 'low' ? 'text-green-600' : risk === 'medium' ? 'text-yellow-600' : 'text-red-600';

  const getPriorityColor = (priority: string) =>
    priority === 'high' ? 'destructive' : priority === 'medium' ? 'secondary' : 'outline';

  const renderWeeklyViewDetailedContent = (week: any, badge: any, index: number) => (
    <div key={index}></div>
  );
  const renderWeeklyMilestonesAndNotes = (week: any) => <div></div>;

  // 完全な週次ビューレンダリング関数
  const renderWeeklyView = () => (
    <div className="space-y-6">
      {/* 週次スケジュール概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅 12週間スケジュール概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {weeklySchedules.reduce((sum, week) => sum + week.totalPlannedHours, 0)}h
              </div>
              <div className="text-sm text-muted-foreground">総予定時間</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {weeklySchedules.reduce((sum, week) => sum + week.plannedBadges.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">予定バッジ数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {weeklySchedules.length > 0
                  ? Math.round(
                      weeklySchedules.reduce((sum, week) => sum + week.onTrackScore, 0) /
                        weeklySchedules.length
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">平均達成予測</div>
            </div>
          </div>

          {/* 週別プログレスバー */}
          <div className="space-y-2">
            <h4 className="font-semibold">週別進捗予測</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {weeklySchedules.slice(0, 12).map((week) => (
                <div key={week.weekNumber} className="text-center">
                  <div className="text-xs font-medium mb-1">Week {week.weekNumber}</div>
                  <Progress value={week.onTrackScore} className="h-2" />
                  <div className={`text-xs mt-1 ${getOnTrackColor(week.onTrackScore)}`}>
                    {week.onTrackScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細な週次計画 */}
      <div className="space-y-4">
        {weeklySchedules.slice(0, 6).map((week) => (
          <Card
            key={week.weekNumber}
            className={expandedWeek === week.weekNumber ? 'ring-2 ring-blue-200' : ''}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)
                    }
                    className="p-1"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${expandedWeek === week.weekNumber ? 'rotate-90' : ''}`}
                    />
                  </Button>
                  <div>
                    <CardTitle className="text-lg">
                      Week {week.weekNumber}: {week.theme}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {week.startDate} - {week.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      week.onTrackScore >= 80
                        ? 'default'
                        : week.onTrackScore >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {week.onTrackScore}% 達成予測
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(week.riskLevel)}>
                    {week.riskLevel} risk
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{week.totalPlannedHours}h</div>
                  <div className="text-xs text-muted-foreground">予定時間</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{week.plannedBadges.length}</div>
                  <div className="text-xs text-muted-foreground">バッジ数</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{week.efficiency}%</div>
                  <div className="text-xs text-muted-foreground">効率予測</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">{week.completionRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">現在進捗</div>
                </div>
              </div>

              {/* バッジ概要 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {week.plannedBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded"
                  >
                    <span>{badge.badgeEmoji}</span>
                    <span className="truncate max-w-32">{badge.badgeName}</span>
                    <Badge variant={getPriorityColor(badge.priority)} className="text-xs">
                      {badge.priority}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 展開時の詳細情報 */}
              {expandedWeek === week.weekNumber && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">📋 詳細計画</h4>
                    <div className="space-y-3">
                      {week.plannedBadges.map((badge, index) =>
                        renderWeeklyViewDetailedContent(week, badge, index)
                      )}
                    </div>
                  </div>

                  {renderWeeklyMilestonesAndNotes(week)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return renderWeeklyView();
};
