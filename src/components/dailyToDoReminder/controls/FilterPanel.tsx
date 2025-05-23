import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  Circle,
  ArrowUpDown,
  Target,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterStatus, CategoryFilter } from "./TodoViewControls";

interface FilterPanelProps {
  filterStatus: FilterStatus;
  categoryFilter: CategoryFilter;
  onFilterStatusChange: (status: FilterStatus) => void;
  onCategoryFilterChange: (category: CategoryFilter) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

/**
 * FilterPanel Component
 * 高度なフィルタリングオプションを提供
 */
export const FilterPanel: React.FC<FilterPanelProps> = React.memo(({
  filterStatus,
  categoryFilter,
  onFilterStatusChange,
  onCategoryFilterChange,
  onClearAll,
  activeFilterCount,
}) => {
  const statusOptions: Array<{
    value: FilterStatus;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      value: "all",
      label: "すべて",
      icon: <ArrowUpDown className="h-3 w-3" />,
      color: "text-gray-600",
    },
    {
      value: "active",
      label: "未完了",
      icon: <Circle className="h-3 w-3" />,
      color: "text-blue-600",
    },
    {
      value: "completed",
      label: "完了済み",
      icon: <CheckCircle className="h-3 w-3" />,
      color: "text-green-600",
    },
  ];

  const categoryOptions: Array<{
    value: CategoryFilter;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: "all",
      label: "すべて",
      icon: <ArrowUpDown className="h-3 w-3" />,
      description: "すべてのカテゴリ",
    },
    {
      value: "input",
      label: "インプット",
      icon: <Target className="h-3 w-3" />,
      description: "学習・収集タスク",
    },
    {
      value: "output",
      label: "アウトプット",
      icon: <CheckCircle className="h-3 w-3" />,
      description: "成果物作成タスク",
    },
    {
      value: "deadline",
      label: "期限あり",
      icon: <Clock className="h-3 w-3" />,
      description: "締切設定済み",
    },
  ];

  return (
    <Card className="border-dashed animate-in slide-in-from-top-2 duration-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ステータスフィルター */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Circle className="h-3 w-3" />
              ステータス
            </Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filterStatus === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterStatusChange(option.value)}
                  className={cn(
                    "flex items-center gap-1.5 transition-all",
                    filterStatus === option.value
                      ? "shadow-sm"
                      : "hover:shadow-sm"
                  )}
                >
                  <span className={option.color}>{option.icon}</span>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* カテゴリフィルター */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              カテゴリ
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={categoryFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryFilterChange(option.value)}
                  className={cn(
                    "flex items-center gap-1.5 transition-all justify-start",
                    categoryFilter === option.value
                      ? "shadow-sm"
                      : "hover:shadow-sm"
                  )}
                  title={option.description}
                >
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* アクティブフィルターサマリー */}
        {activeFilterCount > 0 && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  適用中のフィルター:
                </span>
                <div className="flex gap-1">
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {statusOptions.find((o) => o.value === filterStatus)?.label}
                    </Badge>
                  )}
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {categoryOptions.find((o) => o.value === categoryFilter)?.label}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-xs h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                すべてクリア
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

FilterPanel.displayName = "FilterPanel";