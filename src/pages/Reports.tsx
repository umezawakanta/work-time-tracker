"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
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
import { Trash2Icon, PencilIcon } from "lucide-react";
import { useLocale } from "../hooks/useLocale";
import { formatDateAndTime } from "../utils/dateUtils";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLibraryTrendChart";
import { WorkTimeChart } from "@/components/chart/WorkTimeChart";
import { ProjectPieChart } from "@/components/chart/ProjectPieChart";
import { AssetForm } from "@/components/forms/AssetForm";
import { DebtForm } from "@/components/forms/DebtForm";
import {
  fetchWorkTimeEntries,
  deleteWorkTimeEntry,
} from "../store/workTimeSlice";
import {
  fetchAssetEntries,
  deleteAssetEntry,
  updateAssetEntry,
  AssetEntry,
} from "../store/assetSlice";
import {
  fetchDebtEntries,
  deleteDebtEntry,
  updateDebtEntry,
  DebtEntry,
} from "../store/debtSlice";

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useLocale();
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AssetEntry | DebtEntry | null
  >(null);

  useEffect(() => {
    dispatch(fetchWorkTimeEntries());
    dispatch(fetchAssetEntries());
    dispatch(fetchDebtEntries());
    const storedDate = localStorage.getItem("lastBalanceUpdateDate");
    setLastUpdateDate(storedDate);
  }, [dispatch]);

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
    dispatch(fetchWorkTimeEntries());
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
    .map((entry) => ({
      date: new Date(entry.date),
      value: "description" in entry ? -entry.value : entry.value,
      account: entry.account,
    }));

  const updateLastBalanceDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setLastUpdateDate(today);
    localStorage.setItem("lastBalanceUpdateDate", today);
  };

  const isUpdateNeeded = () => {
    if (!lastUpdateDate) return true;
    const today = new Date().toISOString().split("T")[0];
    return lastUpdateDate !== today;
  };

  const handleBalanceUpdate = (accountId: string, isAsset: boolean) => {
    const account = isAsset
      ? assetEntries.find((entry) => entry._id === accountId)
      : debtEntries.find((entry) => entry._id === accountId);
    if (account) {
      setSelectedAccount(account);
      setIsBalanceModalOpen(true);
    }
  };

  const handleBalanceUpdateSubmit = (
    newBalance: number,
    isUnknownFunds: boolean,
    date: string
  ) => {
    if (selectedAccount) {
      const updatedEntry = {
        ...selectedAccount,
        value: newBalance,
        date: date,
        isUnknownFunds: isUnknownFunds,
      };
      if ("description" in selectedAccount) {
        dispatch(
          updateDebtEntry({
            id: selectedAccount._id || "",
            entry: updatedEntry as DebtEntry,
          })
        );
      } else {
        dispatch(
          updateAssetEntry({
            id: selectedAccount._id || "",
            entry: updatedEntry as AssetEntry,
          })
        );
      }
      updateLastBalanceDate();
      toast({
        title: "成功",
        description: "残高が更新されました。",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">レポート</h1>

      {isUpdateNeeded() && (
        <Card className="mb-8 bg-yellow-100">
          <CardHeader>
            <CardTitle>残高更新リマインダー</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              本日の資産・負債の残高を入力してください。最後の更新日:{" "}
              {lastUpdateDate || "未更新"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {workTimeEntries.length > 0 ? (
          <>
            <WorkTimeChart workTimeEntries={workTimeEntries} locale={locale} />
            <ProjectPieChart workTimeEntries={workTimeEntries} />
          </>
        ) : (
          <Card className="md:col-span-2">
            <CardContent>
              <p>作業時間データがありません。</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AssetLiabilityTrendChart data={combinedData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AssetForm
          editingAsset={editingAsset}
          setEditingAsset={setEditingAsset}
          updateLastBalanceDate={updateLastBalanceDate}
        />
        <DebtForm
          editingDebt={editingDebt}
          setEditingDebt={setEditingDebt}
          updateLastBalanceDate={updateLastBalanceDate}
        />
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
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleBalanceUpdate(entry._id || "", true)
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAsset(entry._id || "")}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleBalanceUpdate(entry._id || "", false)
                        }
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDebt(entry._id || "")}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>負債情報がありません。</p>
            )}
          </CardContent>
        </Card>
      </div>

      <BalanceUpdateModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSubmit={handleBalanceUpdateSubmit}
        currentBalance={selectedAccount?.value || 0}
        accountName={selectedAccount?.account || ""}
      />
    </div>
  );
};

export default Reports;
