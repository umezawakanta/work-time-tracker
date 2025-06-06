import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    text: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  hover?: boolean;
  gradient?: string;
  className?: string;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  icon,
  badge,
  action,
  children,
  hover = true,
  gradient = 'from-blue-500 to-purple-600',
  className,
}) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-md bg-white/70 backdrop-blur-sm',
        hover && 'hover-lift cursor-pointer group',
        className
      )}
    >
      {/* グラデーション装飾 */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', gradient)} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={cn(
                  'p-2 rounded-xl bg-gradient-to-r text-white',
                  gradient,
                  hover && 'group-hover:scale-110 transition-transform duration-300'
                )}
              >
                {icon}
              </div>
            )}

            <div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {badge && <Badge variant={badge.variant || 'default'}>{badge.text}</Badge>}
        </div>
      </CardHeader>

      {children && <CardContent className="pt-0">{children}</CardContent>}

      {action && (
        <CardContent className="pt-0 pb-6">
          <Button
            variant={action.variant || 'ghost'}
            onClick={action.onClick}
            className="group-hover:bg-blue-50 group-hover:text-blue-700 transition-all duration-300 p-0 h-auto font-medium"
          >
            {action.icon || (
              <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
            )}
            {action.text}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
