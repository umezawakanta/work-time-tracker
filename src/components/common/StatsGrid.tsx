import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    period: string;
  };
  progress?: number;
  color: string;
  bgColor: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 4, className }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                <div className={stat.color}>{stat.icon}</div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            </div>

            {stat.progress !== undefined && (
              <div className="mb-3">
                <Progress value={stat.progress} className="h-2" />
              </div>
            )}

            {stat.change && (
              <div className="flex items-center gap-2 text-sm">
                {stat.change.value > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : stat.change.value < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-slate-400" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    stat.change.value > 0
                      ? 'text-green-600'
                      : stat.change.value < 0
                        ? 'text-red-600'
                        : 'text-slate-400'
                  )}
                >
                  {stat.change.value > 0 ? '+' : ''}
                  {stat.change.value}%
                </span>
                <span className="text-slate-500">{stat.change.period}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
