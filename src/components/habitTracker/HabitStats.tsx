import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Flame } from 'lucide-react';

// 習慣の統計情報の型定義
interface HabitStat {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
}

// コンポーネントのProps型定義
interface HabitStatsProps {
  stats: Record<string, HabitStat>;
  getActiveHabits: () => string[];
}

/**
 * 習慣の統計情報を表示するコンポーネント
 */
const HabitStats = ({ stats, getActiveHabits }: HabitStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 達成率トップ5 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
            達成率トップ5
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(stats)
            .filter(([habit]) => getActiveHabits().includes(habit))
            .sort((a, b) => b[1].monthlyProgress - a[1].monthlyProgress)
            .slice(0, 5)
            .map(([habit, habitStats], index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{habit}</span>
                  <span>{habitStats.monthlyProgress}%</span>
                </div>
                <Progress value={habitStats.monthlyProgress} className="h-2" />
              </div>
            ))}

          {/* データがない場合のフォールバック */}
          {Object.entries(stats).filter(([habit]) => getActiveHabits().includes(habit)).length ===
            0 && <div className="text-center py-4 text-gray-500">表示するデータがありません</div>}
        </CardContent>
      </Card>

      {/* 最長継続記録 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Flame className="h-4 w-4 mr-2 text-orange-500" />
            最長継続記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(stats)
            .filter(([habit]) => getActiveHabits().includes(habit))
            .sort((a, b) => b[1].longestStreak - a[1].longestStreak)
            .slice(0, 5)
            .map(([habit, habitStats], index) => (
              <div
                key={index}
                className="flex justify-between items-center mb-2 pb-2 border-b last:border-0"
              >
                <span className="text-sm">{habit}</span>
                <Badge className={habitStats.longestStreak >= 30 ? 'bg-yellow-500' : 'bg-blue-500'}>
                  {habitStats.longestStreak}日
                </Badge>
              </div>
            ))}

          {/* データがない場合のフォールバック */}
          {Object.entries(stats).filter(([habit]) => getActiveHabits().includes(habit)).length ===
            0 && <div className="text-center py-4 text-gray-500">表示するデータがありません</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitStats;
