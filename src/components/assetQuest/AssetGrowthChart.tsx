import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, BarChart3, LineChart, PieChart } from 'lucide-react';

interface AssetGrowthChartProps {
  totalAssets: number;
}

interface AssetData {
  month: string;
  assets: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export const AssetGrowthChart: React.FC<AssetGrowthChartProps> = ({ totalAssets }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '2y'>('1y');

  // サンプルデータ（実際の実装では外部から取得）
  const assetHistory: AssetData[] = [
    {
      month: '2024-01',
      assets: 1000000,
      income: 300000,
      expenses: 200000,
      savings: 100000,
      savingsRate: 33.3,
    },
    {
      month: '2024-02',
      assets: 1120000,
      income: 300000,
      expenses: 180000,
      savings: 120000,
      savingsRate: 40.0,
    },
    {
      month: '2024-03',
      assets: 1250000,
      income: 320000,
      expenses: 190000,
      savings: 130000,
      savingsRate: 40.6,
    },
    {
      month: '2024-04',
      assets: 1380000,
      income: 320000,
      expenses: 190000,
      savings: 130000,
      savingsRate: 40.6,
    },
    {
      month: '2024-05',
      assets: 1520000,
      income: 340000,
      expenses: 200000,
      savings: 140000,
      savingsRate: 41.2,
    },
    {
      month: '2024-06',
      assets: 1680000,
      income: 340000,
      expenses: 180000,
      savings: 160000,
      savingsRate: 47.1,
    },
    {
      month: '2024-07',
      assets: 1850000,
      income: 350000,
      expenses: 180000,
      savings: 170000,
      savingsRate: 48.6,
    },
    {
      month: '2024-08',
      assets: 2030000,
      income: 350000,
      expenses: 170000,
      savings: 180000,
      savingsRate: 51.4,
    },
    {
      month: '2024-09',
      assets: 2220000,
      income: 360000,
      expenses: 170000,
      savings: 190000,
      savingsRate: 52.8,
    },
    {
      month: '2024-10',
      assets: 2420000,
      income: 360000,
      expenses: 160000,
      savings: 200000,
      savingsRate: 55.6,
    },
    {
      month: '2024-11',
      assets: 2630000,
      income: 370000,
      expenses: 160000,
      savings: 210000,
      savingsRate: 56.8,
    },
    {
      month: '2024-12',
      assets: 2850000,
      income: 370000,
      expenses: 150000,
      savings: 220000,
      savingsRate: 59.5,
    },
  ];

  const getFilteredData = () => {
    const months = timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24;
    return assetHistory.slice(-months);
  };

  const filteredData = getFilteredData();
  const latestData = filteredData[filteredData.length - 1];
  const firstData = filteredData[0];
  const totalGrowth = latestData.assets - firstData.assets;
  const growthRate = ((latestData.assets - firstData.assets) / firstData.assets) * 100;
  const averageSavingsRate =
    filteredData.reduce((sum, data) => sum + data.savingsRate, 0) / filteredData.length;

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}億円`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万円`;
    return `${amount.toLocaleString()}円`;
  };

  const formatMonth = (month: string): string => {
    const date = new Date(month);
    return `${date.getMonth() + 1}月`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            資産成長チャート
          </CardTitle>
          <div className="flex gap-2">
            <div className="flex border rounded-lg">
              {[
                { id: '6m', label: '6ヶ月' },
                { id: '1y', label: '1年' },
                { id: '2y', label: '2年' },
              ].map((range) => (
                <Button
                  key={range.id}
                  variant={timeRange === range.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range.id as any)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <div className="flex border rounded-lg">
              {[
                { id: 'line', icon: LineChart },
                { id: 'bar', icon: BarChart3 },
                { id: 'pie', icon: PieChart },
              ].map((chart) => (
                <Button
                  key={chart.id}
                  variant={chartType === chart.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType(chart.id as any)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg p-2"
                >
                  <chart.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 成長サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(latestData.assets)}
            </div>
            <div className="text-sm text-gray-600">現在の総資産</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">+{formatCurrency(totalGrowth)}</div>
            <div className="text-sm text-gray-600">
              {timeRange === '6m' ? '6ヶ月' : timeRange === '1y' ? '1年' : '2年'}間の成長
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">+{growthRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">成長率</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {averageSavingsRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">平均貯蓄率</div>
          </div>
        </div>

        {/* チャート表示エリア */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 min-h-[400px]">
          {chartType === 'line' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">資産推移グラフ</h3>
              <div className="relative h-80 flex items-end justify-between gap-2">
                {filteredData.map((data, index) => {
                  const height =
                    (data.assets / Math.max(...filteredData.map((d) => d.assets))) * 100;
                  const isLatest = index === filteredData.length - 1;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2">
                        <div
                          className={`w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg transition-all duration-500 ${
                            isLatest ? 'shadow-lg' : ''
                          }`}
                          style={{ height: `${height * 3}px` }}
                        />
                        {isLatest && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            最新
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        {formatMonth(data.month)}
                      </div>
                      <div className="text-xs font-medium text-gray-800 text-center">
                        {formatCurrency(data.assets)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chartType === 'bar' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">月次収支比較</h3>
              <div className="space-y-3">
                {filteredData.slice(-6).map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">{formatMonth(data.month)}</div>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>収入</span>
                          <span>{formatCurrency(data.income)}</span>
                        </div>
                        <div className="h-4 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>支出</span>
                          <span>{formatCurrency(data.expenses)}</span>
                        </div>
                        <div className="h-4 bg-red-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all duration-500"
                            style={{ width: `${(data.expenses / data.income) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>貯蓄</span>
                          <span>{formatCurrency(data.savings)}</span>
                        </div>
                        <div className="h-4 bg-green-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(data.savings / data.income) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartType === 'pie' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">資産構成（予想）</h3>
              <div className="flex justify-center items-center h-64">
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatCurrency(latestData.assets)}
                      </div>
                      <div className="text-sm text-gray-600">総資産</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">現金・預金 (40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <span className="text-sm">投資信託 (35%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">株式 (20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">その他 (5%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 目標設定 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-indigo-800">来年の目標</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">
                {formatCurrency(Math.round(latestData.assets * 1.3))}
              </div>
              <div className="text-sm text-gray-600">目標総資産</div>
              <Badge variant="outline" className="mt-1">
                +30% 成長
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">
                {(averageSavingsRate + 5).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">目標貯蓄率</div>
              <Badge variant="outline" className="mt-1">
                +5% 改善
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">12ヶ月</div>
              <div className="text-sm text-gray-600">連続達成</div>
              <Badge variant="outline" className="mt-1">
                継続目標
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
