import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkTimeEntry } from "../types/workTimeEntry";
import {
  fetchWorkTimeEntries,
  deleteWorkTimeEntry,
} from "../store/workTimeSlice";
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

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchWorkTimeEntries());
  }, [dispatch]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return new Date(dateString).toLocaleTimeString();
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
    dispatch(fetchWorkTimeEntries());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間レポート</h1>
      {workTimeEntries.length === 0 ? (
        <p>データがありません。</p>
      ) : (
        <>
          <div className="mb-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={selectedEntries.length === 0}
                >
                  選択したエントリーを削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。選択された{" "}
                    {selectedEntries.length}{" "}
                    件のエントリーが永久に削除されます。
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
          </div>
          {workTimeEntries.map((entry: WorkTimeEntry) => (
            <Card
              key={entry._id || `entry-${entry.date}-${entry.startTime}`}
              className="mb-4"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{entry.projectName || "未設定"}</CardTitle>
                {entry._id && (
                  <Checkbox
                    id={`select-${entry._id}`}
                    checked={selectedEntries.includes(entry._id)}
                    onCheckedChange={() =>
                      entry._id && handleCheckboxChange(entry._id)
                    }
                  />
                )}
              </CardHeader>
              <CardContent>
                <p>日付: {formatDate(entry.date)}</p>
                <p>開始時間: {formatTime(entry.startTime)}</p>
                <p>終了時間: {formatTime(entry.endTime)}</p>
                <p>作業時間: {formatDuration(entry.duration)}</p>
                <p>説明: {entry.description || "未設定"}</p>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default Reports;
