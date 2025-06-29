'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  netWorth: number;
  growth?: number;
}

interface NetWorthProgressChartProps {
  data: unknown[]; // 実際のデータ型はプロジェクトの構造に合わせる
  isPremium: boolean;
}

// サンプルデータ生成関数（実際のアプリでは不要）
const generateDemoData = (): ChartDataPoint[] => {
  const now = new Date();
  const data: ChartDataPoint[] = [];

  let previousNetWorth = 0;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);

    // 基本の純資産値（徐々に上昇するパターン）
    let baseNetWorth = 7000000 + (11 - i) * 150000;

    // 変動要素を加える
    const fluctuation = Math.random() * 400000 - 200000;
    baseNetWorth += fluctuation;

    // 成長率の計算
    const growth = i < 11 && previousNetWorth > 0 ? (baseNetWorth / previousNetWorth - 1) * 100 : 0;

    // 現在のnetWorthを保存して次回のループで使用
    previousNetWorth = baseNetWorth;

    data.push({
      date: `${date.getFullYear()}/${date.getMonth() + 1}`,
      netWorth: Math.round(baseNetWorth),
      growth,
    });
  }

  return data;
};

export const NetWorthProgressChart: React.FC<NetWorthProgressChartProps> = (props) => {
  const { isPremium } = props;
  // デモデータを生成（実際のアプリではpropsのデータを加工して使用）
  const chartData = generateDemoData();

  // 現在の純資産と6ヶ月前の純資産を取得
  const currentNetWorth = chartData[chartData.length - 1]?.netWorth || 0;
  const sixMonthsAgoNetWorth = chartData[chartData.length - 7]?.netWorth || 0;

  // 6ヶ月間の成長率を計算
  const sixMonthGrowthRate =
    sixMonthsAgoNetWorth > 0 ? (currentNetWorth / sixMonthsAgoNetWorth - 1) * 100 : 0;

  // カスタムツールチップの型定義
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: ChartDataPoint;
      [key: string]: unknown;
    }>;
    label?: string;
  }

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">純資産: ¥{payload[0].value.toLocaleString()}</p>
          {payload[0].payload.growth && (
            <p
              className={`text-xs ${payload[0].payload.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              前月比: {payload[0].payload.growth >= 0 ? '+' : ''}
              {payload[0].payload.growth.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine
            y={chartData[0]?.netWorth}
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            label={{
              value: '開始時点',
              position: 'insideBottomRight',
              fill: '#6B7280',
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#netWorthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* プレミアムユーザー向けの追加情報表示 */}
      {isPremium && (
        <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
          <div>
            6ヶ月間の変化率:
            <span
              className={`font-medium ml-1 ${sixMonthGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {sixMonthGrowthRate >= 0 ? '+' : ''}
              {sixMonthGrowthRate.toFixed(1)}%
            </span>
          </div>
          <div>
            平均月間増加額:
            <span className="font-medium ml-1 text-blue-600">
              ¥{Math.round((currentNetWorth - sixMonthsAgoNetWorth) / 6).toLocaleString()}/月
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
