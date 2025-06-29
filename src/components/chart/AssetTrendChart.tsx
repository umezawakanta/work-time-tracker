import React, { useMemo } from 'react';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO, subMonths, subYears, isAfter } from 'date-fns';
import { Card } from '@/components/ui/card';
import { AssetEntry } from '@/types';

interface AssetTrendChartProps {
  data: AssetEntry[];
  timeRange: 'month' | 'quarter' | 'year' | 'all';
}

// グループ化されたデータの型を定義
interface GroupedDataItem {
  date: string;
  totalValue: number;
}

// データをグループ化して、同じ日付のエントリを合計する
const groupByDate = (entries: AssetEntry[]): GroupedDataItem[] => {
  const groupedData: Record<string, GroupedDataItem> = {};

  // データを日付でソート
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 日付ごとに合計値を計算
  sortedEntries.forEach((entry) => {
    const date = entry.date.split('T')[0]; // ISO日付の日付部分のみを使用

    if (!groupedData[date]) {
      groupedData[date] = {
        date,
        totalValue: 0,
      };
    }

    groupedData[date].totalValue += entry.value;
  });

  // オブジェクトを配列に変換
  return Object.values(groupedData);
};

// 特定の日付範囲でデータをフィルタリングする
const filterDataByTimeRange = (data: GroupedDataItem[], timeRange: string): GroupedDataItem[] => {
  const now = new Date();

  if (timeRange === 'all') {
    return data;
  }

  const cutoffDate =
    timeRange === 'month'
      ? subMonths(now, 1)
      : timeRange === 'quarter'
        ? subMonths(now, 3)
        : subYears(now, 1);

  return data.filter((item) => isAfter(parseISO(item.date), cutoffDate));
};

// ツールチップのprops型を定義
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

export const AssetTrendChart: React.FC<AssetTrendChartProps> = ({ data, timeRange }) => {
  // データを日付でグループ化し、選択された時間範囲でフィルタリング
  const chartData = useMemo(() => {
    const groupedData = groupByDate(data);
    return filterDataByTimeRange(groupedData, timeRange);
  }, [data, timeRange]);

  // データが空の場合
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/10 rounded-md">
        <p className="text-muted-foreground">この期間のデータはありません</p>
      </div>
    );
  }

  // 日本円をフォーマットする関数
  const formatYen = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  // 日付フォーマットをカスタマイズ
  const formatXAxis = (dateStr: string) => {
    return format(parseISO(dateStr), 'MM/dd');
  };

  // ツールチップのカスタマイズ
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-background border shadow-md">
          <p className="font-medium">{format(parseISO(label || ''), 'yyyy年MM月dd日')}</p>
          <p className="text-sm">
            <span className="mr-1">総資産:</span>
            <span className="font-semibold text-primary">{formatYen(payload[0].value)}</span>
          </p>
        </Card>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#888888"
          tick={{ fontSize: 12 }}
        />
        <YAxis tickFormatter={formatYen} stroke="#888888" tick={{ fontSize: 12 }} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalValue"
          stroke="#3b82f6"
          strokeWidth={2}
          name="資産総額"
          dot={{ r: 4, strokeWidth: 1 }}
          activeDot={{ r: 6, strokeWidth: 1 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
