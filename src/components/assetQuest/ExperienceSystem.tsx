import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Award, Calendar } from 'lucide-react';

interface HeroData {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  avatar: string;
  totalAssets: number;
}

interface QuestProgress {
  monthlyQuestCompleted: boolean;
  streakDays: number;
  totalQuestsCompleted: number;
  currentReward: number;
}

interface ExperienceSystemProps {
  hero: HeroData;
  questProgress: QuestProgress;
}

export const ExperienceSystem: React.FC<ExperienceSystemProps> = ({ hero, questProgress }) => {
  const expPercentage = (hero.experience / (hero.experience + hero.experienceToNext)) * 100;

  const getExpSources = () => [
    { name: '貯蓄目標達成', exp: 500, icon: '💰', completed: questProgress.monthlyQuestCompleted },
    { name: '予算内支出', exp: 300, icon: '📊', completed: true },
    {
      name: '継続ボーナス',
      exp: questProgress.streakDays * 10,
      icon: '🔥',
      completed: questProgress.streakDays > 0,
    },
    { name: '投資実行', exp: 200, icon: '📈', completed: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            経験値システム
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {hero.level >= 20 ? '⚔️' : hero.level >= 10 ? '🛡️' : '🌱'}
            </div>
            <h3 className="text-2xl font-bold mb-2">レベル {hero.level}</h3>
            <p className="text-gray-600 mb-4">{hero.title}</p>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>経験値</span>
                <span>
                  {hero.experience.toLocaleString()} /{' '}
                  {(hero.experience + hero.experienceToNext).toLocaleString()} EXP
                </span>
              </div>
              <Progress value={expPercentage} className="h-4" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getExpSources().map((source, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${source.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{source.icon}</span>
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">+{source.exp} EXP</div>
                    <Badge variant={source.completed ? 'default' : 'secondary'}>
                      {source.completed ? '獲得済み' : '未獲得'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            成長記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {questProgress.totalQuestsCompleted}
              </div>
              <div className="text-sm text-gray-600">完了クエスト数</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{questProgress.streakDays}</div>
              <div className="text-sm text-gray-600">連続達成日数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{hero.level}</div>
              <div className="text-sm text-gray-600">現在レベル</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
