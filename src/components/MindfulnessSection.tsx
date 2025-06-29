// MindfulnessSection.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface MindfulnessSectionProps {
  isPremium: boolean;
}

const MindfulnessSection: React.FC<MindfulnessSectionProps> = ({ isPremium }) => {
  // プレミアム機能
  if (!isPremium) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          今日のマインドフルネス
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          数分間の深呼吸で心を落ち着かせ、自己肯定感を高めましょう。
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-white">
            <div className="text-2xl mb-2">🧘‍♀️</div>
            <div className="text-sm font-medium">3分間の呼吸</div>
            <div className="text-xs text-gray-500 mt-1">初心者向け</div>
          </Button>

          <Button variant="outline" className="flex flex-col items-center p-4 h-auto bg-white">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-sm font-medium">自己肯定のひととき</div>
            <div className="text-xs text-gray-500 mt-1">5分間</div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MindfulnessSection;
