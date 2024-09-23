import { useSelector } from "react-redux";
import { RootState } from "../store/rootReducer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">作業時間レポート</h1>
      {workTimeEntries.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center">記録された作業時間はありません。</p>
          </CardContent>
        </Card>
      ) : (
        workTimeEntries.map((entry) => (
          <Card key={entry.id} className="mb-4">
            <CardHeader>
              <CardTitle>{entry.projectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>作業内容:</strong> {entry.description}
              </p>
              <p>
                <strong>作業時間:</strong> {formatDuration(entry.duration)}
              </p>
              <p>
                <strong>日付:</strong> {new Date(entry.date).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
