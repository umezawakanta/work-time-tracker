import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';

// 週次内訳表示コンポーネント
export const renderWeeklyBreakdown = (
  weeklyBreakdown: Array<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    completedBadges: number;
    hoursSpent: number;
    efficiency: number;
  }>
) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        📅 週次内訳
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {weeklyBreakdown.map((week) => (
          <div key={week.weekNumber} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Week {week.weekNumber}</h4>
                <div className="text-sm text-muted-foreground">
                  {new Date(week.startDate).toLocaleDateString('ja-JP')} -{' '}
                  {new Date(week.endDate).toLocaleDateString('ja-JP')}
                </div>
              </div>
              <Badge
                variant={
                  week.efficiency >= 80
                    ? 'default'
                    : week.efficiency >= 60
                      ? 'secondary'
                      : 'destructive'
                }
              >
                効率 {week.efficiency}%
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{week.completedBadges}</div>
                <div className="text-xs text-muted-foreground">完了バッジ</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{week.hoursSpent}h</div>
                <div className="text-xs text-muted-foreground">学習時間</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{week.efficiency}%</div>
                <div className="text-xs text-muted-foreground">効率</div>
              </div>
            </div>

            {/* 効率プログレスバー */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>週次効率</span>
                <span>{week.efficiency}%</span>
              </div>
              <Progress value={week.efficiency} className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* 週次サマリー */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h4 className="font-semibold mb-3">📊 週次パフォーマンサマリー</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {weeklyBreakdown.reduce((sum, week) => sum + week.completedBadges, 0)}
            </div>
            <div className="text-xs text-muted-foreground">総完了バッジ</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {weeklyBreakdown.reduce((sum, week) => sum + week.hoursSpent, 0)}h
            </div>
            <div className="text-xs text-muted-foreground">総学習時間</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {Math.round(
                weeklyBreakdown.reduce((sum, week) => sum + week.efficiency, 0) /
                  weeklyBreakdown.length
              )}
              %
            </div>
            <div className="text-xs text-muted-foreground">平均効率</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {Math.max(...weeklyBreakdown.map((w) => w.efficiency))}%
            </div>
            <div className="text-xs text-muted-foreground">最高効率</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
