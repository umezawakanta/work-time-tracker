import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  Plus,
  Settings,
  Zap,
  Calendar,
  CheckCircle,
  Circle,
  ArrowUpDown,
} from "lucide-react";

type FilterStatus = "all" | "active" | "completed";
type CategoryFilter = "all" | "input" | "output" | "deadline";

interface TodoViewControlsProps {
  readonly showFilters: boolean;
  readonly setShowFilters: (show: boolean) => void;
  readonly showAddForm: boolean;
  readonly setShowAddForm: (show: boolean) => void;
  readonly filterStatus: FilterStatus;
  readonly setFilterStatus: (status: FilterStatus) => void;
  readonly categoryFilter: CategoryFilter;
  readonly setCategoryFilter: (category: CategoryFilter) => void;
  readonly autoAdjustEnabled: boolean;
  readonly setAutoAdjustEnabled: (enabled: boolean) => void;
  readonly onAdjustPriorities: () => void;
}

/**
 * Todo View Controls Component
 * Provides filtering, sorting, and view control options
 */
export const TodoViewControls: React.FC<TodoViewControlsProps> = ({
  showFilters,
  setShowFilters,
  showAddForm,
  setShowAddForm,
  filterStatus,
  setFilterStatus,
  categoryFilter,
  setCategoryFilter,
  autoAdjustEnabled,
  setAutoAdjustEnabled,
  onAdjustPriorities,
}) => {
  const getStatusIcon = (status: FilterStatus): React.ReactNode => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "active":
        return <Circle className="h-3 w-3" />;
      default:
        return <ArrowUpDown className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: FilterStatus): string => {
    switch (status) {
      case "completed":
        return "完了済み";
      case "active":
        return "未完了";
      default:
        return "すべて";
    }
  };

  const getCategoryLabel = (category: CategoryFilter): string => {
    switch (category) {
      case "input":
        return "インプット";
      case "output":
        return "アウトプット";
      case "deadline":
        return "期限あり";
      default:
        return "すべて";
    }
  };

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">フィルター</span>
            {(filterStatus !== "all" || categoryFilter !== "all") && (
              <Badge variant="secondary" className="text-xs px-1">
                {(filterStatus !== "all" ? 1 : 0) +
                  (categoryFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* Quick Status Filters */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant={filterStatus === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="flex items-center gap-1"
            >
              {getStatusIcon("all")}
              <span>すべて</span>
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("active")}
              className="flex items-center gap-1"
            >
              {getStatusIcon("active")}
              <span>未完了</span>
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
              className="flex items-center gap-1"
            >
              {getStatusIcon("completed")}
              <span>完了済み</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline ml-1">設定</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>表示設定</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-adjust" className="text-sm">
                    自動優先度調整
                  </Label>
                  <Switch
                    id="auto-adjust"
                    checked={autoAdjustEnabled}
                    onCheckedChange={setAutoAdjustEnabled}
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onAdjustPriorities}>
                <Zap className="h-4 w-4 mr-2" />
                優先度を今すぐ調整
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Task Button */}
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">タスク追加</span>
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ステータス</Label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "active", "completed"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(status)}
                      <span>{getStatusLabel(status)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">カテゴリ</Label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "input", "output", "deadline"] as const).map(
                    (category) => (
                      <Button
                        key={category}
                        variant={
                          categoryFilter === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>{getCategoryLabel(category)}</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filterStatus !== "all" || categoryFilter !== "all") && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      適用中のフィルター:
                    </span>
                    <div className="flex gap-1">
                      {filterStatus !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          {getStatusLabel(filterStatus)}
                        </Badge>
                      )}
                      {categoryFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(categoryFilter)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterStatus("all");
                      setCategoryFilter("all");
                    }}
                    className="text-xs"
                  >
                    すべてクリア
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
