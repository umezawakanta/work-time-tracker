import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { WorkTimeEntry } from "@/types/workTimeEntry";
import { formatDateAndTime } from "@/utils/dateUtils";

interface WorkTimeChartProps {
  workTimeEntries: WorkTimeEntry[];
  locale: string;
}

export const WorkTimeChart: React.FC<WorkTimeChartProps> = ({
  workTimeEntries,
  locale,
}) => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return formatDateAndTime(dateString, locale, { dateStyle: "short" });
  };

  const filterEntriesByTimeRange = (entries: WorkTimeEntry[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return entries.filter((entry) => {
      const entryDate = entry.date ? new Date(entry.date) : null;
      if (!entryDate) return false;
      if (timeRange === "week") return entryDate >= oneWeekAgo;
      if (timeRange === "month") return entryDate >= oneMonthAgo;
      return true;
    });
  };

  const barChartData = filterEntriesByTimeRange(workTimeEntries).map(
    (entry, index) => ({
      name: formatDate(entry.date),
      duration: entry.duration ? entry.duration / 3600 : 0,
      id: entry._id || `entry-${index}`,
    })
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>作業時間記録</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="timeRange">期間</Label>
          <Select
            value={timeRange}
            onValueChange={(value) =>
              setTimeRange(value as "week" | "month" | "all")
            }
          >
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">1週間</SelectItem>
              <SelectItem value="month">1ヶ月</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="duration" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
