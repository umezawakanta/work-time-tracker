// src/components/features/wbs/WBSGanttChart.tsx
import React, { useMemo, useRef, useEffect } from "react";
import { WBSNode } from "@/types/wbs";
import {
  format,
  differenceInDays,
  addDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WBSGanttChartProps {
  nodes: WBSNode[];
  onNodeClick?: (node: WBSNode) => void;
  onProgressUpdate?: (nodeId: string, progress: number) => void;
  startDate: Date;
  endDate: Date;
  readonly?: boolean;
}

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
  const dayWidth = 30;
  const rowHeight = 40;
  const headerHeight = 60;

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
    const left = differenceInDays(nodeStart, startDate) * dayWidth;
    const width = (differenceInDays(nodeEnd, nodeStart) + 1) * dayWidth;

    return { left, width };
  };

  // 進捗バーの幅を計算
  const getProgressWidth = (node: WBSNode) => {
    const { width } = getNodePosition(node);
    return (width * node.progress) / 100;
  };

  // ステータスに応じた色を取得
  const getStatusColor = (status: WBSNode["status"]) => {
    const colors = {
      "not-started": "bg-gray-300",
      "in-progress": "bg-blue-500",
      completed: "bg-green-500",
      delayed: "bg-red-500",
      cancelled: "bg-gray-500",
    };
    return colors[status];
  };

  // 今日の位置を計算
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < startDate || today > endDate) return null;
    return differenceInDays(today, startDate) * dayWidth;
  }, [startDate, endDate, dayWidth]);

  const handleProgressDrag = (e: React.MouseEvent, node: WBSNode) => {
    if (readonly || !onProgressUpdate) return;

    e.stopPropagation();
    const startX = e.clientX;
    const { width } = getNodePosition(node);
    const initialProgress = node.progress;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const progressDelta = (deltaX / width) * 100;
      const newProgress = Math.max(
        0,
        Math.min(100, initialProgress + progressDelta)
      );
      onProgressUpdate(node.id, Math.round(newProgress));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="relative overflow-auto border rounded-lg"
      ref={containerRef}
    >
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-white border-b">
        {/* 月ヘッダー */}
        <div className="flex" style={{ height: headerHeight / 2 }}>
          <div className="w-64 border-r bg-gray-50 px-4 py-2 font-semibold">
            タスク名
          </div>
          <div className="flex">
            {monthGroups.map((group, index) => (
              <div
                key={index}
                className="border-r text-center font-medium bg-gray-50"
                style={{ width: group.days * dayWidth }}
              >
                {format(group.month, "yyyy年M月", { locale: ja })}
              </div>
            ))}
          </div>
        </div>

        {/* 日付ヘッダー */}
        <div className="flex" style={{ height: headerHeight / 2 }}>
          <div className="w-64 border-r bg-gray-50"></div>
          <div className="flex">
            {Array.from({ length: totalDays }).map((_, index) => {
              const date = addDays(startDate, index);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={index}
                  className={cn(
                    "border-r text-xs text-center py-1",
                    isWeekend && "bg-gray-100"
                  )}
                  style={{ width: dayWidth }}
                >
                  {format(date, "d")}
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
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: 256 + todayPosition }}
          />
        )}

        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="flex border-b hover:bg-gray-50"
            style={{ height: rowHeight }}
          >
            {/* タスク名 */}
            <div
              className="w-64 border-r px-4 py-2 truncate cursor-pointer flex items-center"
              style={{ paddingLeft: `${node.level * 20 + 16}px` }}
              onClick={() => onNodeClick?.(node)}
            >
              <span className="font-medium">{node.name}</span>
            </div>

            {/* ガントバー */}
            <div className="relative flex-1">
              <div className="absolute inset-0 flex">
                {Array.from({ length: totalDays }).map((_, dayIndex) => {
                  const date = addDays(startDate, dayIndex);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "border-r h-full",
                        isWeekend && "bg-gray-50"
                      )}
                      style={{ width: dayWidth }}
                    />
                  );
                })}
              </div>

              {/* タスクバー */}
              <div
                className="absolute top-2 bottom-2 rounded cursor-pointer shadow-sm"
                style={{
                  left: getNodePosition(node).left,
                  width: getNodePosition(node).width,
                  backgroundColor: node.color || "#e5e7eb",
                }}
                onClick={() => onNodeClick?.(node)}
              >
                {/* 進捗バー */}
                <div
                  className={cn(
                    "absolute top-0 left-0 bottom-0 rounded-l",
                    getStatusColor(node.status)
                  )}
                  style={{ width: `${node.progress}%` }}
                />

                {/* 進捗ハンドル */}
                {!readonly && onProgressUpdate && (
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-gray-600 cursor-ew-resize opacity-0 hover:opacity-50"
                    style={{ left: `${node.progress}%`, marginLeft: -4 }}
                    onMouseDown={(e) => handleProgressDrag(e, node)}
                  />
                )}

                {/* 進捗テキスト */}
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {node.progress}%
                </div>
              </div>

              {/* 依存関係の線 */}
              {node.dependencies.map((depId) => {
                const depNode = nodes.find((n) => n.id === depId);
                if (!depNode) return null;

                const depPos = getNodePosition(depNode);
                const nodePos = getNodePosition(node);

                return (
                  <svg
                    key={depId}
                    className="absolute pointer-events-none"
                    style={{
                      left: depPos.left + depPos.width,
                      top:
                        -index * rowHeight +
                        nodes.findIndex((n) => n.id === depId) * rowHeight +
                        rowHeight / 2,
                      width: nodePos.left - (depPos.left + depPos.width),
                      height:
                        Math.abs(
                          index - nodes.findIndex((n) => n.id === depId)
                        ) * rowHeight,
                    }}
                  >
                    <path
                      d={`M 0 ${rowHeight / 2} L ${
                        nodePos.left - (depPos.left + depPos.width)
                      } ${
                        index > nodes.findIndex((n) => n.id === depId)
                          ? Math.abs(
                              index - nodes.findIndex((n) => n.id === depId)
                            ) *
                              rowHeight -
                            rowHeight / 2
                          : rowHeight / 2
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
        ))}
      </div>
    </div>
  );
};

export default WBSGanttChart;

