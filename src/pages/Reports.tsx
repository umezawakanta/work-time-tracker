"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useLocale } from "../hooks/useLocale";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLibraryTrendChart";
import { WorkTimeList } from "@/components/list/WorkTimeList";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import { WorkTimeCharts } from "@/components/chart/WorkTimeChars";
import { AssetDebtForms } from "@/components/forms/AssetDebtForms";
import { AssetDebtLists } from "@/components/list/AssetDebtLists";
import { useReportData } from "@/hooks/useReportData";
import { useBalanceUpdate } from "@/hooks/useBalanceUpdate";
import { combineData } from "@/utils/combineData";

export default function Reports() {
  const { locale } = useLocale();
  const workTimeEntries = useSelector(
    (state: RootState) => state.workTime.entries
  );
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);

  useReportData();

  const updateLastBalanceDate = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastBalanceUpdateDate", today);
  };

  const {
    isBalanceModalOpen,
    setIsBalanceModalOpen,
    selectedAccount,
    handleBalanceUpdate,
    handleBalanceUpdateSubmit,
  } = useBalanceUpdate(updateLastBalanceDate);

  const combinedData = combineData(assetEntries, debtEntries);

  const handleBalanceUpdateWrapper = (accountId: string, isAsset: boolean) => {
    handleBalanceUpdate(accountId, isAsset ? assetEntries : debtEntries);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">レポート</h1>

      <BalanceUpdateReminder
        assetEntries={assetEntries}
        debtEntries={debtEntries}
      />

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
        onBalanceUpdate={handleBalanceUpdateWrapper}
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
}
