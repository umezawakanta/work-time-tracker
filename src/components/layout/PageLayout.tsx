import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: React.ReactNode;
  };
  backButton?: boolean;
  actions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  headerGradient?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  badge,
  backButton = false,
  actions,
  maxWidth = '2xl',
  padding = 'lg',
  className,
  headerGradient = false,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-4 sm:px-6 lg:px-8 py-8',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className={cn('mx-auto', maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
        <PageHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          backButton={backButton}
          actions={actions}
          gradient={headerGradient}
        />

        <main className="animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
