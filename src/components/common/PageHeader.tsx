import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  backButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  backButton = false,
  actions,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
              {badge && <Badge variant={badge.variant || 'default'}>{badge.text}</Badge>}
            </div>
            {subtitle && <p className="text-lg text-slate-600">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};
