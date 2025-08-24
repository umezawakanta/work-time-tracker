// src/components/features/wbs/WBSGanttChart.tsx
import React, { useMemo, useRef } from 'react';
import { WBSNode } from '@/types/wbs';
import {
  format,
  differenceInDays,
  addDays,
  startOfMonth,
  endOfMonth,
  min,
  max,
  subDays,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import styles from './WBSGanttChart.module.css';

interface WBSGanttChartProps {
  nodes: WBSNode[];
  onNodeClick?: (node: WBSNode) => void;
  onProgressUpdate?: (nodeId: string, progress: number) => void;
  startDate?: Date; // オプショナルに変更
  endDate?: Date; // オプショナルに変更
  readonly?: boolean;
}

// スタイル定数
const STYLES = {
  dayWidth: 30,
  rowHeight: 40,
  headerHeight: 60,
  taskNameWidth: 256, // 16rem = 256px
};

const WBSGanttChart: React.FC<WBSGanttChartProps> = ({
  nodes,
  onNodeClick,
  onProgressUpdate,
  startDate: propStartDate, // propsからの日付をリネーム
  endDate: propEndDate, // propsからの日付をリネーム
  readonly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ノードから動的に日付範囲を計算
  const { startDate, endDate } = useMemo(() => {
    if (nodes.length === 0) {
      // ノードがない場合はデフォルトの範囲を使用
      const defaultStart = propStartDate || new Date();
      const defaultEnd = propEndDate || addDays(defaultStart, 90);
      return { startDate: defaultStart, endDate: defaultEnd };
    }

    // すべてのノードの開始日と終了日を収集
    const allStartDates = nodes.map((node) => new Date(node.startDate));
    const allEndDates = nodes.map((node) => new Date(node.endDate));

    // 最も早い開始日と最も遅い終了日を取得
    const calculatedStart = min(allStartDates);
    const calculatedEnd = max(allEndDates);

    // バッファを追加（前後に1週間）
    const bufferedStart = subDays(calculatedStart, 7);
    const bufferedEnd = addDays(calculatedEnd, 7);

    // propsで指定された範囲がある場合は、より広い範囲を採用
    const finalStart = propStartDate ? min([propStartDate, bufferedStart]) : bufferedStart;
    const finalEnd = propEndDate ? max([propEndDate, bufferedEnd]) : bufferedEnd;

    return {
      startDate: finalStart,
      endDate: finalEnd,
    };
  }, [nodes, propStartDate, propEndDate]);

  const totalDays = differenceInDays(endDate, startDate) + 1;

  // 月ごとのグループを作成
  const monthGroups = useMemo(() => {
    const groups: Array<{ month: Date; days: number }> = [];
    let currentDate = startOfMonth(startDate);

    while (currentDate <= endDate) {
      const monthEnd = endOfMonth(currentDate);
      const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;
      const effectiveStart = currentDate < startDate ? startDate : currentDate;
      const days = differenceInDays(effectiveEnd, effectiveStart) + 1;

      groups.push({ month: currentDate, days });
      currentDate = addDays(monthEnd, 1);
    }

    return groups;
  }, [startDate, endDate]);

  // ノードの表示位置を計算
  const getNodePosition = (node: WBSNode) => {
    const nodeStart = new Date(node.startDate);
    const nodeEnd = new Date(node.endDate);
    const left = differenceInDays(nodeStart, startDate) * STYLES.dayWidth;
    const width = (differenceInDays(nodeEnd, nodeStart) + 1) * STYLES.dayWidth;

    return { left, width };
  };

  // ステータスに応じたクラス名を取得
  const getStatusClassName = (status: WBSNode['status']) => {
    const classNames = {
      'not-started': styles.statusNotStarted,
      'in-progress': styles.statusInProgress,
      completed: styles.statusCompleted,
      delayed: styles.statusDelayed,
      cancelled: styles.statusCancelled,
    };
    return classNames[status];
  };

  // 今日の位置を計算
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < startDate || today > endDate) return null;
    return differenceInDays(today, startDate) * STYLES.dayWidth;
  }, [startDate, endDate]);

  const handleProgressDrag = (e: React.MouseEvent, node: WBSNode) => {
    if (readonly || !onProgressUpdate) return;

    e.stopPropagation();
    const startX = e.clientX;
    const { width } = getNodePosition(node);
    const initialProgress = node.progress;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const progressDelta = (deltaX / width) * 100;
      const newProgress = Math.max(0, Math.min(100, initialProgress + progressDelta));
      onProgressUpdate(node.id, Math.round(newProgress));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* ヘッダー */}
      <div className={styles.header}>
        {/* 月ヘッダー */}
        <div className={styles.monthHeader}>
          <div className={styles.taskNameHeader}>タスク名</div>
          <div className="flex overflow-hidden">
            {monthGroups.map((group, index) => (
              <div
                key={index}
                className="border-r text-center font-medium bg-gray-50 flex-shrink-0"
                style={{ width: `${group.days * STYLES.dayWidth}px` }}
              >
                {format(group.month, 'yyyy年M月', { locale: ja })}
              </div>
            ))}
          </div>
        </div>

        {/* 日付ヘッダー */}
        <div className={styles.dateHeader}>
          <div
            className="border-r bg-gray-50 flex-shrink-0"
            style={{ width: `${STYLES.taskNameWidth}px` }}
          ></div>
          <div className="flex overflow-hidden">
            {Array.from({ length: totalDays }).map((_, index) => {
              const date = addDays(startDate, index);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={index}
                  className={cn(
                    styles.dayColumn,
                    'text-xs text-center py-1 flex-shrink-0',
                    isWeekend && styles.dayColumnWeekend
                  )}
                  style={{ width: `${STYLES.dayWidth}px` }}
                >
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* タスク行 */}
      <div className="relative">
        {/* 今日の線 - 位置を修正 */}
        {todayPosition !== null && (
          <div
            className={styles.todayLine}
            style={{
              left: `${todayPosition}px`,
              marginLeft: `${STYLES.taskNameWidth}px`,
            }}
          />
        )}

        {nodes.map((node, rowIndex) => {
          const nodePosition = getNodePosition(node);

          return (
            <div key={node.id} className={styles.taskRow}>
              {/* タスク名 */}
              <div
                className={styles.taskName}
                style={{
                  paddingLeft: `${node.level * 20 + 16}px`,
                  width: `${STYLES.taskNameWidth}px`,
                }}
                onClick={() => onNodeClick?.(node)}
              >
                <span className={styles.taskNameText}>{node.name}</span>
              </div>

              {/* ガントエリア */}
              <div className={styles.ganttArea}>
                {/* 背景グリッド */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: totalDays }).map((_, dayIndex) => {
                    const date = addDays(startDate, dayIndex);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <div
                        key={dayIndex}
                        className={cn(styles.dayColumn, isWeekend && styles.dayColumnWeekend)}
                        style={{ width: `${STYLES.dayWidth}px` }}
                      />
                    );
                  })}
                </div>

                {/* タスクバー */}
                <div
                  className={styles.taskBar}
                  style={{
                    left: `${nodePosition.left}px`,
                    width: `${nodePosition.width}px`,
                    backgroundColor: node.color || '#e5e7eb',
                  }}
                  onClick={() => onNodeClick?.(node)}
                >
                  {/* 進捗バー */}
                  <div
                    className={cn(styles.progressBar, getStatusClassName(node.status))}
                    style={{ width: `${node.progress}%` }}
                  />

                  {/* 進捗ハンドル */}
                  {!readonly && onProgressUpdate && (
                    <div
                      className={styles.progressHandle}
                      style={{ left: `${node.progress}%` }}
                      onMouseDown={(e) => handleProgressDrag(e, node)}
                    />
                  )}

                  {/* 進捗テキスト */}
                  <div className={styles.progressText}>{node.progress}%</div>
                </div>

                {/* 依存関係の線 - 修正版 */}
                {node.dependencies.map((depId) => {
                  const depNode = nodes.find((n) => n.id === depId);
                  if (!depNode) return null;

                  const depPos = getNodePosition(depNode);
                  const depIndex = nodes.findIndex((n) => n.id === depId);

                  // 線の開始と終了位置を計算
                  const startX = depPos.left + depPos.width;
                  const endX = nodePosition.left;
                  const startY = depIndex * STYLES.rowHeight + STYLES.rowHeight / 2;
                  const endY = rowIndex * STYLES.rowHeight + STYLES.rowHeight / 2;

                  if (endX <= startX) return null; // 依存関係が逆方向の場合はスキップ

                  return (
                    <svg
                      key={depId}
                      className={styles.dependencyArrow}
                      style={{
                        position: 'absolute',
                        left: `${startX}px`,
                        top: `${Math.min(startY, endY)}px`,
                        width: `${endX - startX}px`,
                        height: `${Math.abs(endY - startY)}px`,
                        pointerEvents: 'none',
                      }}
                    >
                      <defs>
                        <marker
                          id={`arrowhead-${depId}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                        </marker>
                      </defs>
                      <path
                        d={`M 0,${startY < endY ? 0 : Math.abs(endY - startY)} 
                            L ${endX - startX},${startY < endY ? Math.abs(endY - startY) : 0}`}
                        stroke="#666"
                        strokeWidth="2"
                        fill="none"
                        markerEnd={`url(#arrowhead-${depId})`}
                      />
                    </svg>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WBSGanttChart;
