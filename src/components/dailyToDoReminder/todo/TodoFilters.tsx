import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Calendar,
  RefreshCw,
  Tag,
  Clock,
  Search,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TodoFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  autoAdjustEnabled: boolean;
  setAutoAdjustEnabled: (enabled: boolean) => void;
  onAdjustPriorities: () => void;
  isPremium?: boolean;
  tags?: string[];
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  dateRangeFilter?: [Date | null, Date | null];
  setDateRangeFilter?: (range: [Date | null, Date | null]) => void;
}

/**
 * TodoFilters - タスクのフィルタリングコンポーネント
 */
const TodoFilters: React.FC<TodoFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  categoryFilter,
  setCategoryFilter,
  autoAdjustEnabled,
  setAutoAdjustEnabled,
  onAdjustPriorities,
  isPremium = false,
  tags = [],
  selectedTags = [],
  onTagsChange,
  searchQuery = "",
  setSearchQuery,
  dateRangeFilter,
  setDateRangeFilter,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // 一般的なタグ（実際の実装ではデータベースから取得するか、ユーザーが作成したタグを表示）
  const availableTags =
    tags.length > 0 ? tags : ["仕事", "個人", "緊急", "会議", "勉強", "買い物"];

  // クイックフィルターの選択
  const handleQuickFilterSelect = (filter: string) => {
    setQuickFilter(filter);

    // フィルターの状態を設定
    switch (filter) {
      case "today":
        setCategoryFilter("deadline");
        setFilterStatus("active");
        break;
      case "important":
        setFilterStatus("all");
        setCategoryFilter("all");
        // 重要なタスクのみを表示する処理（実装は別途必要）
        break;
      case "inputOnly":
        setCategoryFilter("input");
        setFilterStatus("all");
        break;
      case "outputOnly":
        setCategoryFilter("output");
        setFilterStatus("all");
        break;
      default:
        // デフォルトの状態にリセット
        setCategoryFilter("all");
        setFilterStatus("all");
    }
  };

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索処理（実装は別途必要）
    if (setSearchQuery) {
      console.log("検索: " + searchQuery);
    }
  };

  // タグの選択/解除
  const toggleTag = (tag: string) => {
    if (!onTagsChange) return;

    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 日付範囲フィルターの設定
  const handleDateRangeChange = (key: "start" | "end", value: string) => {
    if (!setDateRangeFilter || !dateRangeFilter) return;

    const newRange: [Date | null, Date | null] = [...dateRangeFilter];

    if (value) {
      newRange[key === "start" ? 0 : 1] = new Date(value);
    } else {
      newRange[key === "start" ? 0 : 1] = null;
    }

    setDateRangeFilter(newRange);
  };

  return (
    <div className="filter-area">
      {/* 検索フィールド - プレミアム機能 */}
      {isPremium && setSearchQuery && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <Input
            placeholder="タスクを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
            aria-label="タスクを検索"
          />
          <Button
            type="submit"
            size="sm"
            className="h-8 px-2"
            aria-label="検索実行"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}

      {/* クイックフィルター - プレミアム機能 */}
      {isPremium && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            variant={quickFilter === null ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickFilterSelect("none")}
          >
            すべて
          </Badge>
          <Badge
            variant={quickFilter === "today" ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickFilterSelect("today")}
          >
            今日期限
          </Badge>
          <Badge
            variant={quickFilter === "important" ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickFilterSelect("important")}
          >
            重要
          </Badge>
          <Badge
            variant={quickFilter === "inputOnly" ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickFilterSelect("inputOnly")}
          >
            インプットのみ
          </Badge>
          <Badge
            variant={quickFilter === "outputOnly" ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => handleQuickFilterSelect("outputOnly")}
          >
            アウトプットのみ
          </Badge>
        </div>
      )}

      <div className="filter-group">
        <span className="filter-label">状態</span>
        <div className="filter-buttons">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="text-xs"
          >
            すべて
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
            className="text-xs"
          >
            未完了
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
            className="text-xs"
          >
            完了済み
          </Button>
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">カテゴリー</span>
        <div className="filter-buttons">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
            className="text-xs"
          >
            すべて
          </Button>
          <Button
            variant={categoryFilter === "input" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("input")}
            className="text-xs flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>インプット</span>
          </Button>
          <Button
            variant={categoryFilter === "output" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("output")}
            className="text-xs flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            <span>アウトプット</span>
          </Button>
          <Button
            variant={categoryFilter === "deadline" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("deadline")}
            className="text-xs flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            <span>期限あり</span>
          </Button>
        </div>
      </div>

      {/* 詳細フィルター - トグルボタン */}
      {isPremium && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs w-full justify-start"
          >
            {showAdvancedFilters
              ? "詳細フィルターを隠す"
              : "詳細フィルターを表示"}
          </Button>
        </div>
      )}

      {/* 詳細フィルター - プレミアム機能 */}
      {isPremium && showAdvancedFilters && (
        <div className="mt-2 space-y-3 pt-2 border-t border-gray-200">
          {/* タグフィルター */}
          {onTagsChange && (
            <div>
              <span className="filter-label flex items-center gap-1">
                <Tag className="h-3 w-3" />
                タグ
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 日付範囲フィルター */}
          {setDateRangeFilter && dateRangeFilter && (
            <div>
              <span className="filter-label flex items-center gap-1">
                <Clock className="h-3 w-3" />
                期間
              </span>
              <div className="flex gap-2 mt-1">
                <div className="flex-1">
                  <label
                    htmlFor="start-date"
                    className="text-xs text-gray-500 mb-1 block"
                  >
                    開始日
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={
                      dateRangeFilter[0]?.toISOString().split("T")[0] || ""
                    }
                    onChange={(e) =>
                      handleDateRangeChange("start", e.target.value)
                    }
                    className="w-full text-xs p-1 border rounded"
                    aria-label="期間の開始日"
                    title="期間の開始日を選択"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="end-date"
                    className="text-xs text-gray-500 mb-1 block"
                  >
                    終了日
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={
                      dateRangeFilter[1]?.toISOString().split("T")[0] || ""
                    }
                    onChange={(e) =>
                      handleDateRangeChange("end", e.target.value)
                    }
                    className="w-full text-xs p-1 border rounded"
                    aria-label="期間の終了日"
                    title="期間の終了日を選択"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 優先度フィルター */}
          <div>
            <span className="filter-label">優先度</span>
            <div className="flex items-center gap-2 mt-1">
              <Select>
                <SelectTrigger
                  className="w-full h-8 text-xs"
                  aria-label="優先度を選択"
                >
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="high">高優先度</SelectItem>
                  <SelectItem value="medium">中優先度</SelectItem>
                  <SelectItem value="low">低優先度</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2 mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-adjust"
                    checked={autoAdjustEnabled}
                    onCheckedChange={setAutoAdjustEnabled}
                  />
                  <Label
                    htmlFor="auto-adjust"
                    className="text-xs cursor-pointer"
                  >
                    自動調整
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  期限に基づいて自動的に優先度を調整します
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustPriorities}
          className="text-xs flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>今すぐ優先度を調整</span>
        </Button>
      </div>
    </div>
  );
};

export default TodoFilters;
