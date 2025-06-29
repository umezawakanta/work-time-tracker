'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CombinedDataPoint } from '@/types';

interface DataPoint {
  date: string;
  assets: number;
  debts: number;
  netWorth: number;
  assetGrowth?: number;
  debtGrowth?: number;
  netWorthGrowth?: number;
}

interface MonthlySnapshotTableProps {
  data: CombinedDataPoint[];
}

export const MonthlySnapshotTable: React.FC<MonthlySnapshotTableProps> = () => {
  // 注意: 現在のデモ実装ではpropsを使用していませんが、
  // 実際のアプリではprops.dataを使用してスナップショットを表示します
  // 月次データの生成 (実際のアプリではAPIから取得したり、既存データから計算したりします)
  const generateMonthlySnapshots = (): DataPoint[] => {
    // 日付の範囲を取得 (最大12か月分)
    const now = new Date();
    const snapshots: DataPoint[] = [];

    // サンプルデータを作成（実際はデータから生成）
    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(now);
      currentDate.setMonth(now.getMonth() - i);

      // 資産と負債の値を計算 (サンプルとして簡易的な計算)
      // 実際のアプリではこれを適切なデータから計算する必要があります
      let baseAssets = 10000000 - i * 100000 * Math.random();
      let baseDebts = 3000000 - i * 50000 * Math.random();

      // 変動要素を加える
      baseAssets = baseAssets * (1 + (Math.random() * 0.05 - 0.01));
      baseDebts = baseDebts * (1 - Math.random() * 0.02);

      const netWorth = baseAssets - baseDebts;

      // 前月比の成長率 (最初の月は値なし)
      const assetGrowth = i > 0 ? (baseAssets / snapshots[i - 1].assets - 1) * 100 : undefined;

      const debtGrowth = i > 0 ? (baseDebts / snapshots[i - 1].debts - 1) * 100 : undefined;

      const netWorthGrowth = i > 0 ? (netWorth / snapshots[i - 1].netWorth - 1) * 100 : undefined;

      snapshots.push({
        date: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`,
        assets: Math.round(baseAssets),
        debts: Math.round(baseDebts),
        netWorth: Math.round(netWorth),
        assetGrowth,
        debtGrowth,
        netWorthGrowth,
      });
    }

    return snapshots;
  };

  // データが不足している場合はサンプルデータを生成
  const snapshots = generateMonthlySnapshots();

  // 成長率表示用のアイコンとスタイル
  const renderGrowthIndicator = (growth: number | undefined) => {
    if (growth === undefined) return <MinusIcon className="h-3 w-3 text-gray-400" />;

    if (growth > 0) {
      return (
        <span className="flex items-center text-green-600">
          <ArrowUpIcon className="h-3 w-3 mr-1" />
          {growth.toFixed(1)}%
        </span>
      );
    } else if (growth < 0) {
      return (
        <span className="flex items-center text-red-600">
          <ArrowDownIcon className="h-3 w-3 mr-1" />
          {Math.abs(growth).toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-500">
          <MinusIcon className="h-3 w-3 mr-1" />
          0%
        </span>
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead className="text-right">総資産</TableHead>
            <TableHead className="text-right">前月比</TableHead>
            <TableHead className="text-right">総負債</TableHead>
            <TableHead className="text-right">前月比</TableHead>
            <TableHead className="text-right">純資産</TableHead>
            <TableHead className="text-right">前月比</TableHead>
            <TableHead className="text-right">状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.map((snapshot, index) => (
            <TableRow key={snapshot.date}>
              <TableCell className="font-medium">{snapshot.date}</TableCell>
              <TableCell className="text-right">¥{snapshot.assets.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {renderGrowthIndicator(snapshot.assetGrowth)}
              </TableCell>
              <TableCell className="text-right">¥{snapshot.debts.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {renderGrowthIndicator(snapshot.debtGrowth)}
              </TableCell>
              <TableCell className="text-right font-medium">
                ¥{snapshot.netWorth.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {renderGrowthIndicator(snapshot.netWorthGrowth)}
              </TableCell>
              <TableCell className="text-right">
                {index === 0 ? (
                  <div>
                    <Badge variant="default">現在</Badge>
                  </div>
                ) : snapshot.netWorthGrowth && snapshot.netWorthGrowth > 2 ? (
                  <Badge variant="default" className="bg-green-600">
                    好調
                  </Badge>
                ) : snapshot.netWorthGrowth && snapshot.netWorthGrowth < -2 ? (
                  <Badge variant="destructive">低下</Badge>
                ) : (
                  <Badge variant="secondary">安定</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
