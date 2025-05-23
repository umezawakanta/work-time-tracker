import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, TrendingUp } from "lucide-react";

interface ResetConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  stats: {
    completedCount: number;
    totalCount: number;
    streakCount: number;
  };
}

/**
 * ResetConfirmDialog Component
 * タスクリセット確認用の洗練されたダイアログ
 */
export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = React.memo(
  ({ open, onOpenChange, onConfirm, isLoading, stats }) => {
    const completionRate =
      stats.totalCount > 0
        ? Math.round((stats.completedCount / stats.totalCount) * 100)
        : 0;

    const handleConfirm = async () => {
      await onConfirm();
      if (!isLoading) {
        onOpenChange(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>1日の振り返り</DialogTitle>
            <DialogDescription>
              今日のタスクを締めくくり、新しい日を始めますか？
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 今日の成果サマリー */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-700">今日の成果</h4>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">完了タスク</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">
                    {stats.completedCount} / {stats.totalCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">達成率</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              {stats.streakCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">連続記録</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{stats.streakCount}日</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>• 完了したタスクはアーカイブされます</p>
              <p>• 未完了のタスクは明日に引き継がれます</p>
              <p>• この操作は取り消せません</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  処理中...
                </span>
              ) : (
                "1日を締める"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ResetConfirmDialog.displayName = "ResetConfirmDialog";
