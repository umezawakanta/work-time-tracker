import React, { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TodoHistoryItem {
  date: string;
  count: number;
}

interface TodoChartProps {
  todoHistory: Array<{ date: string; count: number }>;
}


export const TodoChart: React.FC<TodoChartProps> = ({ todoHistory }) => {
  // チャートデータの整形
  const chartData = useMemo(() => {
    return todoHistory.sort((a, b) => {
      // 日付順に並べ替え
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [todoHistory]);

  // 日付のフォーマット関数
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-4">Todo完了履歴</h2>
      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                interval={Math.ceil(chartData.length / 7) - 1} 
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}個のタスク`, '完了数']}
                labelFormatter={formatDate}
              />
              <Bar dataKey="count" fill="#8884d8" name="完了したタスク" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
};