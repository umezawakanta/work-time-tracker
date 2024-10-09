import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { AssetCalendar } from "@/components/calendar/AssetCalendar";
import { fetchAssetEntries } from "@/store/assetSlice";
import { fetchDebtEntries } from "@/store/debtSlice";
import {
  fetchWithdrawalEntries,
  addWithdrawalEntry,
  deleteWithdrawalEntry,
  WithdrawalEntry,
} from "@/store/withdrawalSlice";
import { fetchSubscriptions } from "@/store/subscriptionSlice";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

export function AssetCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const withdrawalEntries = useSelector((state: RootState) => state.withdrawal.entries);
  const subscriptions = useSelector((state: RootState) => state.subscription.subscriptions);
  const assetStatus = useSelector((state: RootState) => state.asset.status);
  const debtStatus = useSelector((state: RootState) => state.debt.status);
  const withdrawalStatus = useSelector((state: RootState) => state.withdrawal.status);
  const subscriptionStatus = useSelector((state: RootState) => state.subscription.status);

  useEffect(() => {
    if (assetStatus === "idle") dispatch(fetchAssetEntries());
    if (debtStatus === "idle") dispatch(fetchDebtEntries());
    if (withdrawalStatus === "idle") dispatch(fetchWithdrawalEntries());
    if (subscriptionStatus === "idle") dispatch(fetchSubscriptions());
  }, [dispatch, assetStatus, debtStatus, withdrawalStatus, subscriptionStatus]);

  const combinedData: DataPoint[] = [
    ...assetEntries.map((entry) => ({ ...entry, date: new Date(entry.date) })),
    ...debtEntries.map((entry) => ({
      ...entry,
      date: new Date(entry.date),
      value: -entry.value,
    })),
  ];

  const withdrawals: WithdrawalEntry[] = withdrawalEntries.map((entry) => ({
    ...entry,
    date: entry.date,
  }));

  const handleAddWithdrawal = async (newWithdrawal: Omit<WithdrawalEntry, "_id">) => {
    try {
      await dispatch(addWithdrawalEntry(newWithdrawal)).unwrap();
    } catch (error) {
      console.error("Failed to add withdrawal:", error);
    }
  };

  const handleDeleteWithdrawal = async (withdrawalId: string) => {
    try {
      await dispatch(deleteWithdrawalEntry(withdrawalId)).unwrap();
    } catch (error) {
      console.error("Failed to delete withdrawal:", error);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    // If needed in the future, implement logic here to handle month changes
    console.log("Month changed to:", newMonth);
  };

  if (
    assetStatus === "loading" ||
    debtStatus === "loading" ||
    withdrawalStatus === "loading" ||
    subscriptionStatus === "loading"
  ) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">資産増減カレンダー</h1>
      <AssetCalendar
        data={combinedData}
        withdrawals={withdrawals}
        subscriptions={subscriptions}
        onAddWithdrawal={handleAddWithdrawal}
        onDeleteWithdrawal={handleDeleteWithdrawal}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}