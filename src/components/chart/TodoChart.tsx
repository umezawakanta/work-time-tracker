// TodoChart.tsx
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  TooltipProps,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

// より厳密な型定義
interface TodoHistoryItem {
  date: string;
  count: number;
}

interface TodoChartProps {
  todoHistory: TodoHistoryItem[];
  className?: string;
  height?: number;
  colorScheme?: 'blue' | 'green' | 'purple';
}

interface ChartDataItem extends TodoHistoryItem {
  formattedDate: string;
}

interface Statistics {
  total: number;
  average: number;
  max: number;
  min: number;
}

// カスタムツールチップコンポーネント
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-gray-600">
          完了タスク: <span className="font-bold text-blue-600">{payload[0].value}個</span>
        </p>
      </div>
    );
  }
  return null;
};

// カラースキーム定義
const colorSchemes = {
  blue: ['#3b82f6', '#60a5fa', '#93c5fd'],
  green: ['#10b981', '#34d399', '#6ee7b7'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
};

export const TodoChart: React.FC<TodoChartProps> = ({
  todoHistory,
  className = '',
  height = 256,
  colorScheme = 'blue',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // チャートデータの整形と検証
  const { chartData, statistics, error } = useMemo(() => {
    try {
      // データの検証
      if (!Array.isArray(todoHistory)) {
        return { chartData: [], statistics: null, error: 'データが配列ではありません' };
      }

      // 有効なデータのみフィルタリング
      const validData = todoHistory.filter((item) => {
        if (!item || typeof item.count !== 'number' || item.count < 0) return false;
        const date = parseISO(item.date);
        return isValid(date);
      });

      if (validData.length === 0) {
        return { chartData: [], statistics: null, error: null };
      }

      // ソートとフォーマット
      const sorted = [...validData].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      const formatted: ChartDataItem[] = sorted.map((item) => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'M/d', { locale: ja }),
      }));

      // 統計情報の計算
      const counts = validData.map((item) => item.count);
      const stats: Statistics = {
        total: counts.reduce((sum, count) => sum + count, 0),
        average:
          Math.round((counts.reduce((sum, count) => sum + count, 0) / counts.length) * 10) / 10,
        max: Math.max(...counts),
        min: Math.min(...counts),
      };

      return { chartData: formatted, statistics: stats, error: null };
    } catch (err) {
      console.error('チャートデータの処理エラー:', err);
      return { chartData: [], statistics: null, error: 'データの処理中にエラーが発生しました' };
    }
  }, [todoHistory]);

  // バーの色を動的に設定
  const getBarColor = (index: number) => {
    const colors = colorSchemes[colorScheme];
    const colorIndex = index % colors.length;
    return hoveredIndex === index ? colors[0] : colors[colorIndex];
  };

  // エラー表示
  if (error) {
    return (
      <div className={`mt-4 ${className}`}>
        <h2 className="text-lg font-semibold mb-4">Todo完了履歴</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          エラー: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Todo完了履歴</h2>
        {statistics && chartData.length > 0 && (
          <div className="text-sm text-gray-600">
            合計: <span className="font-semibold">{statistics.total}</span> | 平均:{' '}
            <span className="font-semibold">{statistics.average}</span> | 最大:{' '}
            <span className="font-semibold">{statistics.max}</span>
          </div>
        )}
      </div>

      <div style={{ height }} className="w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                interval={Math.max(0, Math.ceil(chartData.length / 7) - 1)}
              />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax + 2']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              <Legend verticalAlign="top" height={36} iconType="rect" />
              <Bar
                dataKey="count"
                name="完了したタスク"
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">まだデータがありません</p>
            <p className="text-xs mt-1">タスクを完了するとここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
};
