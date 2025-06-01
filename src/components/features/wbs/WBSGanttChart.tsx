// src/components/features/wbs/WBSGanttChart.tsx
import React, { useMemo, useRef } from 'react';
import { WBSNode } from '@/types/wbs';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import styles from './WBSGanttChart.module.css';

interface WBSGanttChartProps {
  nodes: WBSNode[];
  onNodeClick?: (node: WBSNode) => void;
  onProgressUpdate?: (nodeId: string, progress: number) => void;
  startDate: Date;
  endDate: Date;
  readonly?: boolean;
}

// スタイル定数
const STYLES = {
  dayWidth: 30,
  rowHeight: 40,
  headerHeight: 60,
  taskNameWidth: 256,
};

const WBSGanttChart: React.FC<WBSGanttChartProps> = ({
  nodes,
  onNodeClick,
  onProgressUpdate,
  startDate,
  endDate,
  readonly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
          <div className="flex">
            {monthGroups.map((group, index) => (
              <div
                key={index}
                className="border-r text-center font-medium bg-gray-50"
                style={{ width: `${group.days * STYLES.dayWidth}px` }}
              >
                {format(group.month, 'yyyy年M月', { locale: ja })}
              </div>
            ))}
          </div>
        </div>

        {/* 日付ヘッダー */}
        <div className={styles.dateHeader}>
          <div className="w-64 border-r bg-gray-50"></div>
          <div className="flex">
            {Array.from({ length: totalDays }).map((_, index) => {
              const date = addDays(startDate, index);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={index}
                  className={cn(
                    styles.dayColumn,
                    'text-xs text-center py-1',
                    isWeekend && styles.dayColumnWeekend
                  )}
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
        {/* 今日の線 */}
        {todayPosition !== null && (
          <div
            className={styles.todayLine}
            style={{ left: `${STYLES.taskNameWidth + todayPosition}px` }}
          />
        )}

        {nodes.map((node, index) => {
          const nodePosition = getNodePosition(node);

          return (
            <div key={node.id} className={styles.taskRow}>
              {/* タスク名 */}
              <div
                className={styles.taskName}
                style={{ paddingLeft: `${node.level * 20 + 16}px` }}
                onClick={() => onNodeClick?.(node)}
              >
                <span className={styles.taskNameText}>{node.name}</span>
              </div>

              {/* ガントバー */}
              <div className={styles.ganttArea}>
                <div className="absolute inset-0 flex">
                  {Array.from({ length: totalDays }).map((_, dayIndex) => {
                    const date = addDays(startDate, dayIndex);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <div
                        key={dayIndex}
                        className={cn(styles.dayColumn, isWeekend && styles.dayColumnWeekend)}
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

                {/* 依存関係の線 */}
                {node.dependencies.map((depId) => {
                  const depNode = nodes.find((n) => n.id === depId);
                  if (!depNode) return null;

                  const depPos = getNodePosition(depNode);
                  const depIndex = nodes.findIndex((n) => n.id === depId);
                  const svgWidth = nodePosition.left - (depPos.left + depPos.width);
                  const svgHeight = Math.abs(index - depIndex) * STYLES.rowHeight;

                  return (
                    <svg
                      key={depId}
                      className={styles.dependencyArrow}
                      style={{
                        left: `${depPos.left + depPos.width}px`,
                        top: `${-index * STYLES.rowHeight + depIndex * STYLES.rowHeight + STYLES.rowHeight / 2}px`,
                        width: `${svgWidth}px`,
                        height: `${svgHeight}px`,
                      }}
                    >
                      <path
                        d={`M 0 ${STYLES.rowHeight / 2} L ${svgWidth} ${
                          index > depIndex ? svgHeight - STYLES.rowHeight / 2 : STYLES.rowHeight / 2
                        }`}
                        stroke="#666"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                        </marker>
                      </defs>
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
