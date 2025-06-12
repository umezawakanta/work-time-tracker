import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ProductivityTrend,
  BurndownData,
  DashboardMetrics,
} from '@/services/analytics/dashboardService';

interface ProductivityChartProps {
  data: ProductivityTrend[];
  title?: string;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  title = '生産性トレンド',
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(1) : value,
                name === 'completedTasks'
                  ? '完了タスク'
                  : name === 'hoursWorked'
                    ? '作業時間'
                    : '効率性',
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="completedTasks" fill="#3b82f6" name="完了タスク" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              stroke="#ef4444"
              name="効率性"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface BurndownChartProps {
  data: BurndownData[];
  title?: string;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({
  data,
  title = 'バーンダウンチャート',
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
              formatter={(value, name) => [
                value,
                name === 'ideal' ? '理想線' : name === 'actual' ? '実際' : '残タスク',
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              name="理想線"
            />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="実際" />
            <Line type="monotone" dataKey="remaining" stroke="#ef4444" name="残タスク" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface CategoryDistributionChartProps {
  data: Record<string, number>;
  title?: string;
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data,
  title = 'カテゴリ別分布',
}) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">完了率</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{metrics.productivity.completionRate}%</p>
                <span className="text-lg">{getTrendIcon(metrics.productivity.trend)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">日平均タスク数</p>
              <p className="text-2xl font-bold">{metrics.productivity.averageTasksPerDay}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">連続達成</p>
              <p className="text-2xl font-bold">{metrics.productivity.streak}日</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">週間作業時間</p>
              <p className="text-2xl font-bold">{metrics.timeManagement.totalHoursWorked}h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
