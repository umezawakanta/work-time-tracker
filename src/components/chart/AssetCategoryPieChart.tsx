'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LegendProps as RechartsLegendProps,
} from 'recharts';

// styles.cssは実際のプロジェクト構造によって正しいパスに調整してください
import './styles.css';

interface AssetCategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface AssetCategoryPieChartProps {
  data: AssetCategoryData[];
}

// 円グラフのカラーパレット
const COLORS = [
  '#4299E1', // 現金・預金用の青
  '#38B2AC', // 投資用のティール
  '#ED8936', // 不動産用のオレンジ
  '#9F7AEA', // 年金・保険用の紫
  '#718096', // その他用のグレー
];

// カスタムツールチップの型定義
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetCategoryData;
    [key: string]: unknown;
  }>;
}

// カスタムツールチップコンポーネント
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="tooltip-container">
        <p className="tooltip-title">{data.name}</p>
        <p className="tooltip-value">¥{data.value.toLocaleString()}</p>
        <p className="tooltip-percentage">{data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// カスタムレジェンド用の型
type CustomLegendProps = RechartsLegendProps;

// カスタムレジェンドコンポーネント
const CustomLegend: React.FC<CustomLegendProps> = (props) => {
  const { payload } = props;

  if (!payload) return null;

  return (
    <ul className="legend-container">
      {payload.map((entry, index) => (
        <li key={`legend-item-${index}`} className="legend-item">
          {/* SVG要素を使用してカラーボックスを実装 */}
          <span className="legend-color-indicator" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect width="12" height="12" fill={entry.color} />
            </svg>
          </span>
          <span className="legend-text">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export const AssetCategoryPieChart: React.FC<AssetCategoryPieChartProps> = ({ data }) => {
  // データが空の場合は代替表示
  if (!data || data.length === 0) {
    return (
      <div className="empty-data-container">
        <p className="empty-data-text">データがありません</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};
