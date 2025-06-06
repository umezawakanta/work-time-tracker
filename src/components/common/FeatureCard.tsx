import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  isPremium?: boolean;
  isNew?: boolean;
  gradient?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  isPremium = false,
  isNew = false,
  gradient = 'from-blue-500 to-blue-600',
  className,
}) => {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <CardContent className="p-8">
        {/* バッジ */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isNew && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              新機能
            </Badge>
          )}
          {isPremium && (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              プレミアム
            </Badge>
          )}
        </div>

        {/* アイコン */}
        <div
          className={cn(
            'w-16 h-16 rounded-2xl bg-gradient-to-r flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300',
            gradient
          )}
        >
          {icon}
        </div>

        {/* コンテンツ */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 leading-relaxed mb-6">{description}</p>

        {/* アクション */}
        {action && (
          <Button
            variant="ghost"
            className="group-hover:bg-blue-50 group-hover:text-blue-700 transition-all duration-300 p-0 h-auto font-medium"
            onClick={action.onClick}
          >
            {action.text}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
