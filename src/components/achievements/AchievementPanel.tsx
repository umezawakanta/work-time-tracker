import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAchievements } from '@/hooks/useAchievements';
import { Trophy, Star, TrendingUp, Calendar, Clock, Zap, RefreshCw } from 'lucide-react';

const categoryIcons = {
  completion: Trophy,
  streak: Calendar,
  productivity: TrendingUp,
  organization: Star,
  time_management: Clock,
  special: Zap,
};

export const AchievementPanel: React.FC = () => {
  const {
    achievements,
    userStats,
    getLevelInfo,
    getAchievementProgress,
    unlockedAchievements,
    lockedAchievements,
  } = useAchievements();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const levelInfo = getLevelInfo();

  // カテゴリ別に実績を分類
  const achievementsByCategory = useMemo(() => {
    const categorized = achievements.reduce(
      (acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(achievement);
        return acc;
      },
      {} as Record<string, typeof achievements>
    );

    return categorized;
  }, [achievements]);

  // フィルタリングされた実績
  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievements;
    if (activeCategory === 'unlocked') return unlockedAchievements;
    if (activeCategory === 'locked') return lockedAchievements;
    return achievementsByCategory[activeCategory] || [];
  }, [
    activeCategory,
    achievements,
    unlockedAchievements,
    lockedAchievements,
    achievementsByCategory,
  ]);

  const resetAchievements = () => {
    if (confirm('すべての実績をリセットしますか？この操作は取り消せません。')) {
      // リセット機能の実装
    }
  };

  return (
    <div className="space-y-6">
      {/* ユーザー統計カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            実績統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalUnlocked}</div>
              <div className="text-sm text-gray-600">獲得実績</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(userStats.completionRate)}%
              </div>
              <div className="text-sm text-gray-600">達成率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Lv.{userStats.currentLevel}</div>
              <div className="text-sm text-gray-600">レベル</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.streakRecord}</div>
              <div className="text-sm text-gray-600">最長連続</div>
            </div>
          </div>

          {/* レベル進捗バー */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>レベル {levelInfo.currentLevel}</span>
              <span>{levelInfo.expRemaining} EXP 必要</span>
            </div>
            <Progress value={levelInfo.progressToNextLevel} className="h-2" />
            <div className="text-xs text-gray-500 text-center">
              {levelInfo.currentExp} / {levelInfo.expForNextLevel} EXP
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 実績一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>実績一覧</CardTitle>
              <CardDescription>タスクを完了して実績を獲得しましょう</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAchievements}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              リセット
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="unlocked">獲得済み</TabsTrigger>
              <TabsTrigger value="locked">未獲得</TabsTrigger>
              <TabsTrigger value="completion">完了</TabsTrigger>
              <TabsTrigger value="streak">連続</TabsTrigger>
              <TabsTrigger value="productivity">生産性</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid gap-4">
                  {filteredAchievements.map((achievement) => {
                    const progress = getAchievementProgress(achievement.id);
                    const IconComponent = categoryIcons[achievement.category];

                    return (
                      <Card
                        key={achievement.id}
                        className={`transition-all hover:shadow-md ${
                          achievement.unlocked
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* アイコン */}
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                              }`}
                            >
                              {achievement.icon}
                            </div>

                            {/* 詳細情報 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className={`font-semibold ${
                                    achievement.unlocked ? 'text-green-800' : 'text-gray-700'
                                  }`}
                                >
                                  {achievement.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {achievement.rarity}
                                </Badge>
                                {IconComponent && (
                                  <IconComponent className="h-4 w-4 text-gray-500" />
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mb-2">
                                {achievement.description}
                              </p>

                              {/* 進捗バー（未獲得の場合） */}
                              {!achievement.unlocked && progress && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>進捗</span>
                                    <span>
                                      {progress.currentValue} / {progress.targetValue}
                                    </span>
                                  </div>
                                  <Progress value={progress.percentage} className="h-1.5" />
                                </div>
                              )}

                              {/* 獲得情報 */}
                              {achievement.unlocked && achievement.unlockedAt && (
                                <div className="text-xs text-green-600">
                                  獲得日: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* 経験値報酬 */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-sm font-medium text-blue-600">
                                +{achievement.experienceReward} EXP
                              </div>
                              {achievement.unlocked && (
                                <Badge className="bg-green-500 text-white text-xs">獲得済み</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementPanel;
