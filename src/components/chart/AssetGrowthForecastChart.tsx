'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface AssetGrowthForecastChartProps {
  currentAssets: number;
  growthRate: number;
  years: number;
}

export const AssetGrowthForecastChart: React.FC<AssetGrowthForecastChartProps> = ({
  currentAssets,
  growthRate,
  years,
}) => {
  // データポイントの型定義
  type DataPoint = {
    year: string;
    conservative: number;
    expected: number;
    optimistic: number;
  };

  // Calculate forecast data for multiple growth rates
  const generateForecastData = (): DataPoint[] => {
    const data: DataPoint[] = [];

    // Calculate conservative growth (lower rate)
    const conservativeGrowthRate = Math.max(growthRate - 2, 1); // At least 1%

    // Calculate optimistic growth (higher rate)
    const optimisticGrowthRate = growthRate + 2;

    // Generate data points for each year
    for (let year = 0; year <= years; year++) {
      const conservativeAssets = currentAssets * Math.pow(1 + conservativeGrowthRate / 100, year);
      const expectedAssets = currentAssets * Math.pow(1 + growthRate / 100, year);
      const optimisticAssets = currentAssets * Math.pow(1 + optimisticGrowthRate / 100, year);

      data.push({
        year: `${year}年後`,
        conservative: Math.round(conservativeAssets),
        expected: Math.round(expectedAssets),
        optimistic: Math.round(optimisticAssets),
      });
    }

    return data;
  };

  const forecastData = generateForecastData();

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      dataKey: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-0 border-gray-200 shadow-md">
          <CardContent className="p-3">
            <p className="font-medium mb-2">{label}</p>
            <div className="space-y-1 text-sm">
              <p className="text-blue-700">
                <span className="inline-block w-4 h-2 bg-blue-700 mr-2" />
                予測資産: ¥{payload[1].value.toLocaleString()}
              </p>
              <p className="text-green-600">
                <span className="inline-block w-4 h-2 bg-green-600 mr-2" />
                楽観的: ¥{payload[2].value.toLocaleString()}
              </p>
              <p className="text-blue-400">
                <span className="inline-block w-4 h-2 bg-blue-400 mr-2" />
                保守的: ¥{payload[0].value.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={forecastData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tickFormatter={(value) => `¥${(value / 1000000).toFixed(0)}M`}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => {
            if (value === 'conservative') return '保守的予測';
            if (value === 'expected') return '予測資産';
            if (value === 'optimistic') return '楽観的予測';
            return value;
          }}
        />
        <ReferenceLine
          y={currentAssets}
          stroke="#9CA3AF"
          strokeDasharray="3 3"
          label={{
            value: '現在の資産',
            position: 'insideBottomLeft',
            fill: '#6B7280',
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="conservative"
          name="conservative"
          stroke="#93C5FD"
          strokeWidth={2}
          dot={{ fill: '#93C5FD', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expected"
          name="expected"
          stroke="#2563EB"
          strokeWidth={3}
          dot={{ fill: '#2563EB', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="optimistic"
          name="optimistic"
          stroke="#059669"
          strokeWidth={2}
          dot={{ fill: '#059669', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
