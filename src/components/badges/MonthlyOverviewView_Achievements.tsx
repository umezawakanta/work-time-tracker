import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Clock } from 'lucide-react';

interface MonthlyAchievement {
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  completedDate: string;
  hoursSpent: number;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  impact: 'low' | 'medium' | 'high';
}

// 達成バッジ表示コンポーネント
const renderMonthlyAchievements = (achievements: MonthlyAchievement[]) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        🏆 今月の達成バッジ
      </CardTitle>
    </CardHeader>
    <CardContent>
      {achievements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>今月はまだバッジを獲得していません</p>
          <p className="text-sm">頑張って学習を続けましょう！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.badgeId}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <span className="text-3xl">{achievement.badgeEmoji}</span>
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        achievement.difficulty === 'legendary'
                          ? 'bg-purple-500'
                          : achievement.difficulty === 'platinum'
                            ? 'bg-gray-400'
                            : achievement.difficulty === 'gold'
                              ? 'bg-yellow-500'
                              : achievement.difficulty === 'silver'
                                ? 'bg-gray-300'
                                : 'bg-orange-400'
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{achievement.badgeName}</h4>
                    <Badge
                      variant={
                        achievement.difficulty === 'legendary'
                          ? 'default'
                          : achievement.difficulty === 'platinum'
                            ? 'secondary'
                            : achievement.difficulty === 'gold'
                              ? 'default'
                              : achievement.difficulty === 'silver'
                                ? 'outline'
                                : 'secondary'
                      }
                    >
                      {achievement.difficulty}
                    </Badge>
                    <Badge
                      variant={
                        achievement.impact === 'high'
                          ? 'destructive'
                          : achievement.impact === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {achievement.impact} impact
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    カテゴリ: {achievement.category}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(achievement.completedDate).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {achievement.hoursSpent}時間
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-green-600">#{index + 1}</div>
                  <div className="text-xs text-muted-foreground">達成順</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 達成統計 */}
      {achievements.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <h4 className="font-semibold mb-3">📈 達成統計</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{achievements.length}</div>
              <div className="text-xs text-muted-foreground">総達成数</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {achievements.reduce((sum, a) => sum + a.hoursSpent, 0)}h
              </div>
              <div className="text-xs text-muted-foreground">総学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {Math.round(
                  achievements.reduce((sum, a) => sum + a.hoursSpent, 0) / achievements.length
                )}
                h
              </div>
              <div className="text-xs text-muted-foreground">平均時間</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {achievements.filter((a) => a.impact === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">高インパクト</div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export { renderMonthlyAchievements };
