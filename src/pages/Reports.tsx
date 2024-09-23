import { useSelector } from "react-redux";
import { RootState } from "../store";
import { WorkTimeEntry } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatDateJapanese } from "../utils/dateUtils";

export default function Reports() {
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">作業時間レポート</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workTimeEntries.map((entry: WorkTimeEntry) => (
          <Card key={entry._id}>
            <CardHeader>
              <CardTitle>{entry.projectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>日付:</strong>{" "}
                {formatDateJapanese(new Date(entry.date || entry.startTime))}
              </p>
              <p>
                <strong>作業内容:</strong> {entry.description}
              </p>
              <p>
                <strong>作業時間:</strong> {formatDuration(entry.duration || 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
