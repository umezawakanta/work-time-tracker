import React from "react";
import { useDispatch } from "react-redux";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Award } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  resetTodoList,
  fetchTodoHistory,
  fetchDailyTodoHistory,
} from "@/store/todoSlice";
import { AppDispatch } from "@/store";
import StreakDisplay from "../sections/StreakDisplay";

interface TodoHeaderProps {
  readonly hasPremium: boolean;
  readonly streakCount: number;
}

/**
 * Todo Header Component
 * Displays title, premium badge, streak, and reset functionality
 */
export const TodoHeader: React.FC<TodoHeaderProps> = ({
  hasPremium,
  streakCount,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleResetTodos = async (): Promise<void> => {
    const confirmed = window.confirm(
      "今日のタスクを締めくくり、新しい日を始めますか？\n" +
        "完了したタスクはアーカイブされ、未完了のタスクは引き継がれます。"
    );

    if (!confirmed) return;

    try {
      await dispatch(resetTodoList()).unwrap();
      await Promise.all([
        dispatch(fetchTodoHistory()).unwrap(),
        dispatch(fetchDailyTodoHistory()).unwrap(),
      ]);

      toast.success("新しい日の準備ができました。今日も頑張りましょう！");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Reset error:", err);
      toast.error(`エラーが発生しました: ${errorMessage}`);
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div className="todo-header-info">
        <CardTitle className="text-lg font-bold">本日のToDoリスト</CardTitle>
        <CardDescription>登録したことは必ずやり遂げましょう</CardDescription>
      </div>

      <div className="flex items-center space-x-2">
        {hasPremium && (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 flex items-center gap-1 premium-badge"
          >
            <Award className="h-3 w-3" size={10} aria-hidden="true" />
            <span>プレミアム</span>
          </Badge>
        )}

        <StreakDisplay streakCount={streakCount} />

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetTodos}
          className="reset-button"
          aria-label="1日を締める"
        >
          <RefreshCcw className="h-4 w-4 mr-1" size={16} aria-hidden="true" />
          <span className="hidden sm:inline">1日を締める</span>
        </Button>
      </div>
    </div>
  );
};