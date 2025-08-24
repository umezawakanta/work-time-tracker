// AchievementsList.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Zap, Crown, CheckCircle } from 'lucide-react';
import { Achievement } from '@/types';

interface AchievementsListProps {
  achievements: Achievement[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate: string | null;
  };
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements, streakData }) => {
  // アイコンのマッピング
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="h-5 w-5" />;
      case 'Medal':
        return <Medal className="h-5 w-5" />;
      case 'Star':
        return <Star className="h-5 w-5" />;
      case 'Zap':
        return <Zap className="h-5 w-5" />;
      case 'Crown':
        return <Crown className="h-5 w-5" />;
      case 'CheckCircle':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  // 取得した実績数と取得率
  const earnedCount = achievements.filter((a) => a.earned).length;
  const earnedPercentage = Math.round((earnedCount / achievements.length) * 100);

  function getDynamicWidthClass(percentage: number) {
    return `w-[${percentage}%]`;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>実績ステータス</CardTitle>
          <CardDescription>あなたの成長を示す実績とストリーク</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">現在のストリーク</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{streakData.currentStreak}</span>
                  <span className="ml-1 text-gray-500">日</span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>最長記録: {streakData.longestStreak}日</div>
                  {streakData.lastEntryDate && (
                    <div>最終記録日: {new Date(streakData.lastEntryDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">取得実績</h3>
              <div className="flex items-center justify-between mb-2">
                <span>達成率</span>
                <span>{earnedPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className={`bg-green-600 h-2.5 rounded-full ${getDynamicWidthClass(
                    earnedPercentage
                  )}`}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-500 mb-4">
                {earnedCount} / {achievements.length} 実績を獲得
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium mb-2 text-amber-800">
                <Crown className="h-5 w-5 inline mr-1 text-amber-500" />
                次に挑戦するべき実績
              </h3>
              {achievements.filter((a) => !a.earned).length > 0 ? (
                <ul className="space-y-2">
                  {achievements
                    .filter((a) => !a.earned)
                    .slice(0, 3)
                    .map((achievement) => (
                      <li key={achievement.id} className="text-sm">
                        • {achievement.description}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm">すべての実績を獲得しました！おめでとうございます！</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>実績一覧</CardTitle>
          <div className="flex mt-2">
            <Badge className="mr-2">獲得済み: {earnedCount}</Badge>
            <Badge variant="outline">未獲得: {achievements.length - earnedCount}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-start p-3 rounded-md border ${
                    achievement.earned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      achievement.earned
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {getIcon(achievement.icon)}
                  </div>
                  <div>
                    <h4 className={`font-medium ${achievement.earned ? '' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    {achievement.earned && achievement.date && (
                      <div className="text-xs text-green-600 mt-1">
                        獲得日: {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {achievement.earned && (
                    <Badge className="ml-auto flex-shrink-0 bg-green-500" title="獲得済み">
                      獲得済み
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsList;
