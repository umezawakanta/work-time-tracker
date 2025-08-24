/**
 * 🤖 AI強化ゲーミフィケーションページ
 */

import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIEnhancedGamification } from '@/components/gamification/AIEnhancedGamification';
import { Brain } from 'lucide-react';

const AIGamificationPage: React.FC = () => {
  return (
    <PageLayout
      title="AI強化ゲーミフィケーション"
      subtitle="人工知能があなた専用にカスタマイズしたゲーム体験でモチベーションを最大化"
      badge={{
        text: 'AI Powered',
        variant: 'default',
        icon: <Brain className="h-4 w-4" />,
      }}
    >
      <AIEnhancedGamification />
    </PageLayout>
  );
};

export default AIGamificationPage;
