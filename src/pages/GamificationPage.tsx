import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import { Trophy } from 'lucide-react';

const GamificationPage: React.FC = () => {
  return (
    <PageLayout
      title="ゲーミフィケーション"
      subtitle="ポイント・報酬・ランキング・チャレンジで楽しく成長"
      badge={{
        text: 'エンゲージメント',
        variant: 'default',
        icon: <Trophy className="h-4 w-4" />,
      }}
    >
      <GamificationDashboard />
    </PageLayout>
  );
};

export default GamificationPage;
