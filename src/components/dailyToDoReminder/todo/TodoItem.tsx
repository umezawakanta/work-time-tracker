import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Star,
  Calendar,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

// 共通の型をインポート
import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  isPremium?: boolean;
  onTogglePriority: () => void;
  onEditStart: () => void;
  onDelete: () => void;
}

/**
 * Todoアイテムを表示するコンポーネント
 */
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isPremium = false,
  onTogglePriority,
  onEditStart,
  onDelete,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 期限の書式と色を計算
  const getDeadlineInfo = () => {
    if (!todo.deadline) return null;

    const deadlineDate = new Date(todo.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deadlineDay = new Date(deadlineDate);
    deadlineDay.setHours(0, 0, 0, 0);

    let badgeClass = "";
    if (deadlineDay < today) {
      badgeClass = "deadline-expired";
    } else if (deadlineDay.getTime() === today.getTime()) {
      badgeClass = "deadline-today";
    } else if (deadlineDay.getTime() === tomorrow.getTime()) {
      badgeClass = "deadline-tomorrow";
    } else {
      badgeClass = "deadline-future";
    }

    return {
      text: formatDistanceToNow(deadlineDate, { addSuffix: true, locale: ja }),
      class: badgeClass,
    };
  };

  const deadlineInfo = todo.deadline ? getDeadlineInfo() : null;

  // プレミアム機能：タスク分析
  const getTaskAnalysis = () => {
    if (!isPremium) return null;

    const completionTime =
      todo.completed && todo.completedDate
        ? (new Date(todo.completedDate).getTime() -
            new Date(todo.createdAt).getTime()) /
          (1000 * 60 * 60)
        : null;

    const hasDeadline = !!todo.deadline;

    let analysisText = "";

    if (todo.completed) {
      if (completionTime !== null) {
        if (completionTime < 1) {
          const minutes = Math.round(completionTime * 60);
          analysisText = `このタスクは約${minutes}分で完了しました。`;
        } else {
          analysisText = `このタスクは約${completionTime.toFixed(
            1
          )}時間で完了しました。`;
        }
      } else {
        analysisText = "このタスクは完了しています。";
      }

      if (hasDeadline && todo.deadline) {
        // ここで追加のチェックを行う
        const deadlineDate = new Date(todo.deadline);
        const completedDate = new Date(todo.completedDate!);
        const isBeforeDeadline = completedDate < deadlineDate;

        if (isBeforeDeadline) {
          analysisText += " 期限内に完了することができました。";
        } else {
          analysisText += " 期限を過ぎて完了しました。";
        }
      }
    } else {
      analysisText = "このタスクはまだ完了していません。";

      if (hasDeadline) {
        const deadlineInfo = getDeadlineInfo();
        analysisText += ` 期限は${deadlineInfo?.text}です。`;
      } else {
        analysisText += " 期限は設定されていません。";
      }
    }

    return analysisText;
  };

  // タスク作成からの経過時間
  const getElapsedTime = () => {
    return formatDistanceToNow(new Date(todo.createdAt), {
      addSuffix: true,
      locale: ja,
    });
  };

  return (
    <div className="flex-grow pl-3">
      <div className="flex justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-gray-900 ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {todo.task}
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            <Badge
              variant="outline"
              className={`text-xs ${
                todo.type === "input"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {todo.type === "input" ? "インプット" : "アウトプット"}
            </Badge>

            {deadlineInfo && (
              <Badge
                variant="outline"
                className={`text-xs ${deadlineInfo.class}`}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {deadlineInfo.text}
              </Badge>
            )}

            {isPremium && (
              <Badge
                variant="outline"
                className="text-xs bg-gray-50 text-gray-600"
              >
                <Clock className="h-3 w-3 mr-1" />
                {getElapsedTime()}
              </Badge>
            )}

            {todo.isPrioritized && (
              <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                <Star className="h-3 w-3 mr-1" />
                優先
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>タスクを管理</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onTogglePriority}>
                <Star className="h-4 w-4 mr-2" />
                {todo.isPrioritized ? "優先から解除" : "優先に設定"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditStart}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              {isPremium && (
                <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  詳細を表示
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* タスク詳細ダイアログ（プレミアム機能） */}
      {isPremium && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{todo.task}</DialogTitle>
              <DialogDescription>
                {todo.completed ? "完了済み" : "未完了"} •{" "}
                {todo.type === "input" ? "インプット" : "アウトプット"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {todo.deadline && (
                <div>
                  <h4 className="text-sm font-medium">期限</h4>
                  <p className="text-sm">
                    {new Date(todo.deadline).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium">作成日時</h4>
                <p className="text-sm">
                  {new Date(todo.createdAt).toLocaleString("ja-JP")}
                </p>
              </div>

              {todo.completed && todo.completedDate && (
                <div>
                  <h4 className="text-sm font-medium">完了日時</h4>
                  <p className="text-sm">
                    {new Date(todo.completedDate).toLocaleString("ja-JP")}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">タスク分析</h4>
                <p className="text-sm text-gray-700">{getTaskAnalysis()}</p>
              </div>

              {todo.efficiency && (
                <div className="bg-indigo-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-1">AI効率分析</h4>
                  <p className="text-sm text-indigo-800">
                    {todo.efficiency.suggestion ||
                      "このタスクには効率化のポイントがありません。"}
                  </p>
                  {todo.efficiency.efficiencyScore !== undefined && (
                    <div className="mt-2">
                      <span className="text-xs font-medium">効率スコア: </span>
                      <span className="text-xs font-bold">
                        {todo.efficiency.efficiencyScore}/100
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">閉じる</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TodoItem;
