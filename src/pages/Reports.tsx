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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkTimeEntry } from "../types/workTimeEntry";
import {
  fetchWorkTimeEntries,
  deleteWorkTimeEntry,
} from "../store/workTimeSlice";
import {
  fetchAssetEntries,
  addAssetEntry,
  deleteAssetEntry,
} from "../store/assetSlice";
import {
  fetchDebtEntries,
  addDebtEntry,
  deleteDebtEntry,
} from "../store/debtSlice";
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
import { Trash2Icon } from "lucide-react";

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
  const [currentAssetAccount, setCurrentAssetAccount] = useState<string>("");
  const [currentDebtValue, setCurrentDebtValue] = useState<string>("");
  const [currentDebtDescription, setCurrentDebtDescription] =
    useState<string>("");
  const [currentDebtAccount, setCurrentDebtAccount] = useState<string>("");

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
    (entry, index) => ({
      name: formatDate(entry.date),
      duration: entry.duration ? entry.duration / 3600 : 0,
      id: entry._id || `entry-${index}`,
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
    ([name, value], index) => ({
      name,
      value: value / 3600,
      id: `project-${index}`,
    })
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
  ];

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssetAccount) {
      toast({
        title: "エラー",
        description: "口座を選択してください。",
        variant: "destructive",
      });
      return;
    }
    const newAssetEntry = {
      date: new Date().toISOString().split("T")[0],
      value: parseFloat(currentAssetValue),
      account: currentAssetAccount,
    };
    dispatch(addAssetEntry(newAssetEntry));
    setCurrentAssetValue("");
    setCurrentAssetAccount("");
    toast({
      title: "成功",
      description: "資産情報が記録されました。",
    });
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDebtAccount) {
      toast({
        title: "エラー",
        description: "口座を選択してください。",
        variant: "destructive",
      });
      return;
    }
    const newDebtEntry = {
      date: new Date().toISOString().split("T")[0],
      value: parseFloat(currentDebtValue),
      description: currentDebtDescription,
      account: currentDebtAccount,
    };
    dispatch(addDebtEntry(newDebtEntry));
    setCurrentDebtValue("");
    setCurrentDebtDescription("");
    setCurrentDebtAccount("");
    toast({
      title: "成功",
      description: "負債情報が記録されました。",
    });
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await dispatch(deleteAssetEntry(id)).unwrap();
      toast({
        title: "成功",
        description: "資産情報が削除されました。",
      });
    } catch (error) {
      console.error("Failed to delete asset entry:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "資産情報の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await dispatch(deleteDebtEntry(id)).unwrap();
      toast({
        title: "成功",
        description: "負債情報が削除されました。",
      });
    } catch (error) {
      console.error("Failed to delete debt entry:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "負債情報の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const combinedData = [...assetEntries, ...debtEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry, index) => ({
      ...entry,
      id: `financial-${index}`,
    }));

  const accounts = Array.from(
    new Set([
      ...assetEntries.map((entry) => entry.account),
      ...debtEntries.map((entry) => entry.account),
    ])
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">レポート</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
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
            <div className="h-64">
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

        <Card>
          <CardHeader>
            <CardTitle>プロジェクト別作業時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartDataArray}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieChartDataArray.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>資産と負債の推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {accounts.map((account, index) => (
                  <Line
                    key={account}
                    type="monotone"
                    dataKey={(entry) =>
                      entry.account === account
                        ? "value" in entry
                          ? entry.value
                          : -entry.value
                        : undefined
                    }
                    name={account}
                    stroke={COLORS[index % COLORS.length]}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>資産情報の登録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <div>
                <Label htmlFor="assetValue">資産価値</Label>
                <Input
                  id="assetValue"
                  type="number"
                  value={currentAssetValue}
                  onChange={(e) => setCurrentAssetValue(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="assetAccount">口座</Label>
                <Input
                  id="assetAccount"
                  type="text"
                  value={currentAssetAccount}
                  onChange={(e) => setCurrentAssetAccount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">登録</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>負債情報の登録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div>
                <Label htmlFor="debtValue">負債額</Label>
                <Input
                  id="debtValue"
                  type="number"
                  value={currentDebtValue}
                  onChange={(e) => setCurrentDebtValue(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="debtDescription">説明</Label>
                <Textarea
                  id="debtDescription"
                  value={currentDebtDescription}
                  onChange={(e) => setCurrentDebtDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="debtAccount">口座</Label>
                <Input
                  id="debtAccount"
                  type="text"
                  value={currentDebtAccount}
                  onChange={(e) => setCurrentDebtAccount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">登録</Button>
            </form>
          </CardContent>
        </Card>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>資産情報</CardTitle>
          </CardHeader>
          <CardContent>
            {assetEntries.length > 0 ? (
              <div>
                {assetEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div>
                      <p className="font-semibold">{entry.account}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-sm">
                        価値: {entry.value.toLocaleString()}円
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAsset(entry._id || "")}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>資産情報がありません。</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>負債情報</CardTitle>
          </CardHeader>
          <CardContent>
            {debtEntries.length > 0 ? (
              <div>
                {debtEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div>
                      <p className="font-semibold">{entry.account}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-sm">
                        金額: {entry.value.toLocaleString()}円
                      </p>
                      <p className="text-sm">説明: {entry.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDebt(entry._id || "")}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>負債情報がありません。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
