import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progressValue?: number;
  progressColor?: string;
  tooltipText?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeClassName?: string;
  isLoading?: boolean;
}

/**
 * 統計情報を表示するカードコンポーネント
 * プレミアムダッシュボードで使用
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  progressValue,
  progressColor = 'bg-blue-500',
  tooltipText,
  badgeText,
  badgeVariant = 'default',
  badgeClassName = '',
  isLoading = false,
}) => {
  // ローディングスケルトン表示用のクラス
  const loadingClass = isLoading ? 'animate-pulse bg-gray-200' : '';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              <h3 className="text-sm font-medium text-gray-700">{title}</h3>
              {tooltipText && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <InfoIcon className="h-3 w-3 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{tooltipText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className={`text-2xl font-bold ${loadingClass || ''}`}>
              {isLoading ? <div className="h-8 w-20 rounded"></div> : <span>{value}</span>}
              {badgeText && (
                <Badge variant={badgeVariant} className={`ml-2 text-xs ${badgeClassName}`}>
                  {badgeText}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className={`text-xs text-gray-500 ${loadingClass || ''}`}>
                {isLoading ? <div className="h-3 w-24 rounded"></div> : subtitle}
              </p>
            )}
          </div>

          {icon && (
            <div className={`p-2 rounded-md ${isLoading ? 'bg-gray-200' : 'bg-gray-100'}`}>
              {icon}
            </div>
          )}
        </div>

        {progressValue !== undefined && (
          <div className="mt-4">
            <Progress
              value={isLoading ? 30 : progressValue}
              className="h-1"
              style={
                {
                  background: isLoading ? '#e5e7eb' : undefined,
                  '--progress-foreground': progressColor,
                } as React.CSSProperties
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
