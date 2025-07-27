/**
 * 📊 ベースダッシュボードコンポーネント
 * 全ダッシュボードで共通利用される統一されたレイアウトとUIパターン
 */

import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  ExternalLink,
  Download,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 型定義
export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DashboardSection {
  id: string;
  title: string;
  content: ReactNode;
  order: number;
  visible?: boolean;
}

export interface DashboardTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

export interface BaseDashboardProps {
  // ヘッダー情報
  title: string;
  description?: string;
  icon?: ReactNode;

  // メトリクス
  metrics?: MetricCard[];

  // タブ（任意）
  tabs?: DashboardTab[];
  defaultTab?: string;

  // セクション
  sections?: DashboardSection[];

  // 状態
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;

  // アクション
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;

  // レイアウト
  className?: string;
  compactMode?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';

  // 設定
  showHeader?: boolean;
  showMetrics?: boolean;
  metricsColumns?: 2 | 3 | 4 | 6;
}

const getMetricColorClasses = (color: MetricCard['color']) => {
  switch (color) {
    case 'blue':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'green':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'red':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'purple':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'gray':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const MetricCardComponent: React.FC<{ metric: MetricCard; compact?: boolean }> = ({
  metric,
  compact = false,
}) => {
  const colorClasses = getMetricColorClasses(metric.color);

  return (
    <Card className={cn('transition-all hover:shadow-md', compact && 'p-3')}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {metric.icon && <div className={cn('p-1 rounded', colorClasses)}>{metric.icon}</div>}
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            {metric.description && (
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            )}
          </div>

          {metric.trend && (
            <div className="text-right">
              <div
                className={cn(
                  'text-xs font-medium',
                  metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {metric.trend.isPositive ? '↗' : '↘'} {Math.abs(metric.trend.value)}%
              </div>
              {metric.trend.label && <p className="text-xs text-gray-500">{metric.trend.label}</p>}
            </div>
          )}
        </div>

        {metric.action && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={metric.action.onClick}
          >
            {metric.action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton: React.FC<{ metricsCount?: number }> = ({ metricsCount = 4 }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: metricsCount }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

export const BaseDashboard: React.FC<BaseDashboardProps> = ({
  title,
  description,
  icon,
  metrics = [],
  tabs,
  defaultTab,
  sections = [],
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'データがありません',
  onRefresh,
  refreshing = false,
  actions = [],
  className,
  compactMode = false,
  maxWidth = '7xl',
  showHeader = true,
  showMetrics = true,
  metricsColumns = 4,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs?.[0]?.id || '');

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  const metricsGridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[metricsColumns];

  // ローディング状態
  if (isLoading) {
    return (
      <div className={cn('w-full mx-auto p-6', maxWidthClass, className)}>
        <LoadingSkeleton metricsCount={metrics.length || 4} />
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className={cn('w-full mx-auto p-6', maxWidthClass, className)}>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">エラーが発生しました</AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
                再試行
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 空の状態
  if (isEmpty) {
    return (
      <div className={cn('w-full mx-auto p-6', maxWidthClass, className)}>
        {showHeader && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {icon}
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
            {description && <p className="text-lg text-gray-600">{description}</p>}
          </div>
        )}

        <Card>
          <CardContent className="p-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
            <p className="text-gray-600">{emptyMessage}</p>
            {onRefresh && (
              <Button className="mt-4" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                更新
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('w-full mx-auto p-6 space-y-6', maxWidthClass, className)}>
      {/* ヘッダー */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {icon}
              <h1
                className={cn(
                  'font-bold text-gray-900',
                  compactMode ? 'text-2xl' : 'text-3xl lg:text-4xl'
                )}
              >
                {title}
              </h1>
            </div>
            {description && (
              <p className={cn('text-gray-600', compactMode ? 'text-base' : 'text-lg lg:text-xl')}>
                {description}
              </p>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                更新
              </Button>
            )}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* メトリクス */}
      {showMetrics && metrics.length > 0 && (
        <div className={cn('grid gap-4', metricsGridClass)}>
          {metrics.map((metric) => (
            <MetricCardComponent key={metric.id} metric={metric} compact={compactMode} />
          ))}
        </div>
      )}

      {/* タブまたはセクション */}
      {tabs && tabs.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-6">
          {sections
            .filter((section) => section.visible !== false)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id}>
                {section.title && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                )}
                {section.content}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
