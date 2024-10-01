import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { deleteWorkTimeEntry } from "@/store/workTimeSlice";
import { WorkTimeEntry } from "@/types/workTimeEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { useLocale } from "@/hooks/useLocale";
import { formatDateAndTime } from "@/utils/dateUtils";

interface WorkTimeListProps {
  workTimeEntries: WorkTimeEntry[];
}

export const WorkTimeList: React.FC<WorkTimeListProps> = ({
  workTimeEntries,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useLocale();
  const [selectedEntries, setSelectedEntries] = React.useState<string[]>([]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return formatDateAndTime(dateString, locale, { dateStyle: "short" });
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return formatDateAndTime(dateString, locale, { timeStyle: "short" });
  };

  const formatDuration = (duration: number | undefined) => {
    if (duration === undefined) return "未設定";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  const handleCheckboxChange = (entryId: string) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleDelete = async () => {
    for (const entryId of selectedEntries) {
      try {
        await dispatch(deleteWorkTimeEntry(entryId)).unwrap();
      } catch (error) {
        console.error(`Failed to delete entry ${entryId}:`, error);
        toast({
          title: "エラー",
          description: `エントリー ${entryId} の削除に失敗しました。`,
          variant: "destructive",
        });
      }
    }
    setSelectedEntries([]);
    toast({
      title: "成功",
      description: "選択されたエントリーが削除されました。",
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>作業時間エントリー</CardTitle>
      </CardHeader>
      <CardContent>
        {workTimeEntries.length > 0 ? (
          <div>
            {workTimeEntries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between py-2 border-b"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`select-${entry._id}`}
                    checked={selectedEntries.includes(entry._id || "")}
                    onCheckedChange={() =>
                      handleCheckboxChange(entry._id || "")
                    }
                  />
                  <div>
                    <p className="font-semibold">{entry.projectName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(entry.date)} {formatTime(entry.startTime)} -{" "}
                      {formatTime(entry.endTime)}
                    </p>
                    <p className="text-sm">
                      作業時間: {formatDuration(entry.duration)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {selectedEntries.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">
                    選択したエントリーを削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>削除の確認</AlertDialogTitle>
                    <AlertDialogDescription>
                      選択したエントリーを削除してもよろしいですか？この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ) : (
          <p>作業時間エントリーがありません。</p>
        )}
      </CardContent>
    </Card>
  );
};
