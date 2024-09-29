"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkTimeEntry } from "../types/workTimeEntry";
import {
  fetchWorkTimeEntries,
  deleteWorkTimeEntry,
} from "../store/workTimeSlice";
import { fetchAssetEntries, addAssetEntry } from "../store/assetSlice";
import { fetchDebtEntries, addDebtEntry } from "../store/debtSlice";
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
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");
  const [currentAssetValue, setCurrentAssetValue] = useState<string>("");
  const [currentDebtValue, setCurrentDebtValue] = useState<string>("");
  const [currentDebtDescription, setCurrentDebtDescription] =
    useState<string>("");

  useEffect(() => {
    dispatch(fetchWorkTimeEntries());
    dispatch(fetchAssetEntries());
    dispatch(fetchDebtEntries());
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
    (entry) => ({
      name: formatDate(entry.date),
      duration: entry.duration ? entry.duration / 3600 : 0,
    })
  );

  const pieChartData = filterEntriesByTimeRange(workTimeEntries).reduce(
    (acc, entry) => {
      if (entry.projectName) {
        if (acc[entry.projectName]) {
          acc[entry.projectName] += entry.duration || 0;
        } else {
          acc[entry.projectName] = entry.duration || 0;
        }
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const pieChartDataArray = Object.entries(pieChartData).map(
    ([name, value]) => ({
      name,
      value: value / 3600,
    })
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssetEntry = {
      date: new Date().toISOString().split("T")[0],
      value: parseFloat(currentAssetValue),
    };
    dispatch(addAssetEntry(newAssetEntry));
    setCurrentAssetValue("");
    toast({
      title: "成功",
      description: "資産情報が記録されました。",
    });
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDebtEntry = {
      date: new Date().toISOString().split("T")[0],
      value: parseFloat(currentDebtValue),
      description: currentDebtDescription,
    };
    dispatch(addDebtEntry(newDebtEntry));
    setCurrentDebtValue("");
    setCurrentDebtDescription("");
    toast({
      title: "成功",
      description: "負債情報が記録されました。",
    });
  };

  // 資産と負債のデータを結合して日付でソート
  const combinedData = [...assetEntries, ...debtEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">作業時間と財務レポート</h1>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>資産情報の入力</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assetValue">現在の資産価値（円）</Label>
                <Input
                  id="assetValue"
                  type="number"
                  value={currentAssetValue}
                  onChange={(e) => setCurrentAssetValue(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">資産情報を記録</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>負債情報の入力</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="debtValue">現在の負債額（円）</Label>
                <Input
                  id="debtValue"
                  type="number"
                  value={currentDebtValue}
                  onChange={(e) => setCurrentDebtValue(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debtDescription">負債の説明</Label>
                <Textarea
                  id="debtDescription"
                  value={currentDebtDescription}
                  onChange={(e) => setCurrentDebtDescription(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">負債情報を記録</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {workTimeEntries.length === 0 &&
      assetEntries.length === 0 &&
      debtEntries.length === 0 ? (
        <p>データがありません。</p>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
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
            <div>
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                onClick={() => setTimeRange("week")}
                className="mr-2"
              >
                週間
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                onClick={() => setTimeRange("month")}
                className="mr-2"
              >
                月間
              </Button>
              <Button
                variant={timeRange === "all" ? "default" : "outline"}
                onClick={() => setTimeRange("all")}
              >
                全期間
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>日別作業時間</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <XAxis
                      dataKey="name"
                      scale="point"
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#8884d8">
                      {barChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>プロジェクト別作業時間</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartDataArray}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#82ca9d"
                      label
                    >
                      {pieChartDataArray.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>資産と負債の推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedData}>
                  <XAxis
                    dataKey="date"
                    type="category"
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="資産"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="負債"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <h2 className="text-xl font-bold mb-4">作業時間エントリー</h2>
          {filterEntriesByTimeRange(workTimeEntries).map(
            (entry: WorkTimeEntry) => (
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
            )
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
