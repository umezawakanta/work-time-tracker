import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkTimeEntry } from "../types/workTimeEntry";

const Reports: React.FC = () => {
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間レポート</h1>
      {workTimeEntries.map((entry: WorkTimeEntry, index: number) => (
        <Card key={entry._id || `entry-${index}`} className="mb-4">
          <CardHeader>
            <CardTitle>{entry.projectName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>日付: {entry.date || "未設定"}</p>
            <p>
              開始時間:{" "}
              {entry.startTime
                ? new Date(entry.startTime).toLocaleString()
                : "未設定"}
            </p>
            <p>
              終了時間:{" "}
              {entry.endTime
                ? new Date(entry.endTime).toLocaleString()
                : "未設定"}
            </p>
            <p>
              作業時間:{" "}
              {entry.duration !== undefined ? `${entry.duration} 分` : "未設定"}
            </p>
            <p>説明: {entry.description || "未設定"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Reports;
