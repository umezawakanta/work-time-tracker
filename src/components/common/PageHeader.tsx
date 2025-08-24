import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: React.ReactNode;
  };
  backButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
  gradient?: boolean;
  animated?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  backButton = false,
  actions,
  className,
  gradient = false,
  animated = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn('mb-8 relative overflow-hidden', animated && 'animate-fade-in', className)}>
      {/* 背景装飾 */}
      {gradient && (
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-purple-500 to-pink-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {backButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mt-1 hover:bg-slate-100 transition-all duration-200 hover:scale-105"
              aria-label="前のページに戻る"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1
                className={cn(
                  'text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight',
                  gradient &&
                    'bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent'
                )}
              >
                {title}
              </h1>

              {badge && (
                <Badge
                  variant={badge.variant || 'default'}
                  className={cn(
                    'animate-scale-in px-3 py-1 text-sm font-medium',
                    badge.variant === 'default' &&
                      'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0',
                    badge.variant === 'secondary' && 'bg-slate-100 text-slate-700',
                    badge.variant === 'destructive' &&
                      'bg-gradient-to-r from-red-500 to-pink-600 text-white border-0'
                  )}
                >
                  {badge.icon && <span className="mr-2">{badge.icon}</span>}
                  {badge.text}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
