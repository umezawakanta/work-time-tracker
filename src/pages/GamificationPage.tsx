import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DailyMotivationGamification } from '@/components/gamification/DailyMotivationGamification';
import { Trophy } from 'lucide-react';

const GamificationPage: React.FC = () => {
  return (
    <PageLayout
      title="ゲーミフィケーション"
      subtitle="毎日の積み重ねでレベルアップ！モチベーション向上システム"
      badge={{
        text: 'エンゲージメント',
        variant: 'default',
        icon: <Trophy className="h-4 w-4" />,
      }}
    >
      <DailyMotivationGamification />
    </PageLayout>
  );
};

export default GamificationPage;
