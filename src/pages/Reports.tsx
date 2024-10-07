"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLiabilityTrendChart";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import { AssetDebtForms } from "@/components/forms/AssetDebtForms";
import { AssetDebtLists } from "@/components/list/AssetDebtLists";
import { useReportData } from "@/hooks/useReportData";
import { useBalanceUpdate } from "@/hooks/useBalanceUpdate";
import { combineData } from "@/utils/combineData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addSubscription, Subscription } from "@/store/subscriptionSlice";

export default function Reports() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const subscriptions = useSelector(
    (state: RootState) => state.subscription.subscriptions
  );
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubscription, setNewSubscription] = useState<Subscription>({
    id: "",
    name: "",
    billingDate: "",
    type: "",
    amount: 0,
  });

  const dispatch = useDispatch<AppDispatch>();

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

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addSubscription({ ...newSubscription, id: Date.now().toString() })
    );
    setNewSubscription({
      id: "",
      name: "",
      billingDate: "",
      type: "",
      amount: 0,
    });
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

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">サブスクリプション管理</h2>
        <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              value={newSubscription.name}
              onChange={(e) =>
                setNewSubscription({ ...newSubscription, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="billingDate">引き落とし日 (YYYY/MM/DD)</Label>
            <Input
              id="billingDate"
              value={newSubscription.billingDate}
              onChange={(e) =>
                setNewSubscription({
                  ...newSubscription,
                  billingDate: e.target.value,
                })
              }
              pattern="\d{4}/\d{2}/\d{2}"
              placeholder="2024/01/01"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">種別</Label>
            <Input
              id="type"
              value={newSubscription.type}
              onChange={(e) =>
                setNewSubscription({ ...newSubscription, type: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">金額</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={newSubscription.amount}
              onChange={(e) =>
                setNewSubscription({
                  ...newSubscription,
                  amount: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
          <Button type="submit">登録</Button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">サブスクリプション一覧</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>引き落とし日</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.name}</TableCell>
                  <TableCell>{sub.billingDate}</TableCell>
                  <TableCell>{sub.type}</TableCell>
                  <TableCell>{sub.amount.toLocaleString()}円</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
