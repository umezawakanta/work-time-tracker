"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { useLocale } from "../hooks/useLocale";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLibraryTrendChart";
import { WorkTimeList } from "@/components/list/WorkTimeList";
import { BalanceUpdateReminder } from "@/components/BalanceUpdateReminder";
import { WorkTimeCharts } from "@/components/chart/WorkTimeChars";
import { AssetDebtForms } from "@/components/forms/AssetDebtForms";
import { AssetDebtLists } from "@/components/list/AssetDebtLists";
import { fetchWorkTimeEntries } from "@/store/workTimeSlice";
import {
  fetchAssetEntries,
  updateAssetEntry,
  AssetEntry,
} from "../store/assetSlice";
import {
  fetchDebtEntries,
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
        <BalanceUpdateReminder lastUpdateDate={lastUpdateDate} />
      )}

      <WorkTimeCharts workTimeEntries={workTimeEntries} locale={locale} />

      <AssetLiabilityTrendChart data={combinedData} />

      <AssetDebtForms
        editingAsset={editingAsset}
        setEditingAsset={setEditingAsset}
        editingDebt={editingDebt}
        setEditingDebt={setEditingDebt}
        updateLastBalanceDate={updateLastBalanceDate}
      />

      <WorkTimeList workTimeEntries={workTimeEntries} />

      <AssetDebtLists
        assetEntries={assetEntries}
        debtEntries={debtEntries}
        onBalanceUpdate={handleBalanceUpdate}
      />

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
