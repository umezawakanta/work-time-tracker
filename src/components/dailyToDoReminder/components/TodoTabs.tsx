import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

// Sub-components (will be implemented separately)
import { TodoList } from "../todo/TodoList";
import { AddTodoForm } from "../todo/AddTodoForm";
import { TodoCalendar } from "@/components/calendar/TodoCalendar";
import { TodoChart } from "@/components/chart/TodoChart";
import TodoAnalysis from "../../todoAnalysis/TodoAnalysis";
import { TodoViewControls } from "../controls/TodoViewControls";

// Types
import { Todo } from "../types";

type TabType = "list" | "calendar" | "chart";
type FilterStatus = "all" | "active" | "completed";
type CategoryFilter = "all" | "input" | "output" | "deadline";

interface TodoHistoryData {
  readonly date: string;
  readonly count: number;
}

interface FilterControls {
  readonly filterStatus: FilterStatus;
  readonly setFilterStatus: (status: FilterStatus) => void;
  readonly categoryFilter: CategoryFilter;
  readonly setCategoryFilter: (category: CategoryFilter) => void;
  readonly showFilters: boolean;
  readonly setShowFilters: (show: boolean) => void;
}

interface TodoTabsProps {
  readonly selectedTab: TabType;
  readonly onTabChange: (tab: TabType) => void;
  readonly todos: readonly Todo[];
  readonly todoHistory: readonly TodoHistoryData[];
  readonly dailyHistory: readonly TodoHistoryData[];
  readonly hasPremium: boolean;
  readonly filterControls: FilterControls;
}

/**
 * Todo Tabs Component
 * Handles tab navigation and content rendering
 */
export const TodoTabs: React.FC<TodoTabsProps> = ({
  selectedTab,
  onTabChange,
  todos,
  todoHistory,
  dailyHistory,
  hasPremium,
  filterControls,
}) => {
  const [showAnalysis, setShowAnalysis] = React.useState<boolean>(false);
  const [showAddForm, setShowAddForm] = React.useState<boolean>(false);
  const [autoAdjustEnabled, setAutoAdjustEnabled] =
    React.useState<boolean>(true);

  const handleAdjustPriorities = (): void => {
    // This will be implemented with actual priority adjustment logic
    console.log("Adjusting priorities...");
  };

  const handleTabChange = (value: string): void => {
    onTabChange(value as TabType);
  };

  return (
    <Tabs
      defaultValue="list"
      value={selectedTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="list">リスト</TabsTrigger>
        <TabsTrigger value="calendar">カレンダー</TabsTrigger>
        <TabsTrigger value="chart">グラフ</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="m-0">
        {hasPremium && (
          <div className="flex justify-end mb-3">
            <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                >
                  <Brain className="h-4 w-4" aria-hidden="true" />
                  <span>タスク分析</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>タスク分析</DialogTitle>
                  <DialogDescription>
                    あなたのタスクパターンを分析し、生産性向上のためのインサイトを提供します。
                  </DialogDescription>
                </DialogHeader>
                <TodoAnalysis />
              </DialogContent>
            </Dialog>
          </div>
        )}

        <TodoViewControls
          showFilters={filterControls.showFilters}
          setShowFilters={filterControls.setShowFilters}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          filterStatus={filterControls.filterStatus}
          setFilterStatus={filterControls.setFilterStatus}
          categoryFilter={filterControls.categoryFilter}
          setCategoryFilter={filterControls.setCategoryFilter}
          autoAdjustEnabled={autoAdjustEnabled}
          setAutoAdjustEnabled={setAutoAdjustEnabled}
          onAdjustPriorities={handleAdjustPriorities}
        />

        {/* タスク追加フォームを表示 */}
        <AddTodoForm
          isVisible={showAddForm}
          onClose={() => setShowAddForm(false)}
          isPremium={hasPremium}
        />

        <TodoList
          todos={todos}
          isPremium={hasPremium}
          onAnalyzeRequest={() => setShowAnalysis(true)}
        />
      </TabsContent>

      <TabsContent value="calendar">
        <TodoCalendar
          todoHistory={[
            ...(dailyHistory.length > 0 ? dailyHistory : todoHistory),
          ]}
        />
      </TabsContent>

      <TabsContent value="chart">
        <TodoChart
          todoHistory={[
            ...(dailyHistory.length > 0 ? dailyHistory : todoHistory),
          ]}
        />
      </TabsContent>
    </Tabs>
  );
};
