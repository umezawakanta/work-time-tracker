import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import {
  DevelopmentBadge,
  findNextAchievableBadge,
  generateDailyDevelopmentGoal,
} from '@/types/development-badges';

export const DevelopmentMotivation: React.FC = () => {
  const [nextBadge, setNextBadge] = useState<DevelopmentBadge | null>(null);
  const [dailyGoal, setDailyGoal] = useState<string>('');

  useEffect(() => {
    // 次に取得可能なバッジを提案
    const nextAchievableBadge = findNextAchievableBadge();
    setNextBadge(nextAchievableBadge);

    // 今日の開発目標を生成
    const goal = generateDailyDevelopmentGoal(nextAchievableBadge);
    setDailyGoal(goal);
  }, []);

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-orange-500" />
          今日の開発目標
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg font-medium text-orange-800">{dailyGoal}</div>

          {nextBadge && (
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-medium mb-2">次のバッジ: {nextBadge.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{nextBadge.description}</p>
              <Progress value={nextBadge.progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">進捗: {nextBadge.progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              開発を始める
            </Button>
            <Button size="sm" variant="outline">
              進捗を確認
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
