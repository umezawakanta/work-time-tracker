import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkTimeEntry } from "../types/workTimeEntry";
import { fetchWorkTimeEntries } from "../store/workTimeSlice";

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );

  useEffect(() => {
    dispatch(fetchWorkTimeEntries());
  }, [dispatch]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | Date | undefined) => {
    if (!dateString) return "未設定";
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDuration = (duration: number | undefined) => {
    if (duration === undefined) return "未設定";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間レポート</h1>
      {workTimeEntries.length === 0 ? (
        <p>データがありません。</p>
      ) : (
        workTimeEntries.map((entry: WorkTimeEntry, index: number) => (
          <Card key={entry._id || `entry-${index}`} className="mb-4">
            <CardHeader>
              <CardTitle>{entry.projectName || "未設定"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>日付: {formatDate(entry.date)}</p>
              <p>開始時間: {formatTime(entry.startTime)}</p>
              <p>終了時間: {formatTime(entry.endTime)}</p>
              <p>作業時間: {formatDuration(entry.duration)}</p>
              <p>説明: {entry.description || "未設定"}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Reports;
