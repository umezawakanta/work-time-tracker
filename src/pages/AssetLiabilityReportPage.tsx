"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLiabilityTrendChart";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import { AssetDebtForms } from "@/components/forms/AssetDebtForms";
import { AssetDebtLists } from "@/components/list/AssetDebtLists";
import { useReportData } from "@/hooks/useReportData";
import { useBalanceUpdate } from "@/hooks/useBalanceUpdate";
import { combineData } from "@/utils/combineData";

export default function AssetLiabilityReportPage() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useReportData();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load report data:", err);
        setError("Failed to load report data. Please try again.");
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">資産/負債レポート</h1>

      <BalanceUpdateReminder
        assetEntries={assetEntries}
        debtEntries={debtEntries}
      />

      {combinedData.length > 0 ? (
        <AssetLiabilityTrendChart data={combinedData} />
      ) : (
        <div className="text-center mt-4">
          資産または負債のデータがありません
        </div>
      )}

      <AssetDebtForms
        editingAsset={editingAsset}
        setEditingAsset={setEditingAsset}
        editingDebt={editingDebt}
        setEditingDebt={setEditingDebt}
        updateLastBalanceDate={updateLastBalanceDate}
      />

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
