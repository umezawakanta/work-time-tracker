import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { AssetCalendar } from "@/components/calender/AssetCalender";
import { fetchAssetEntries } from "@/store/assetSlice";
import { fetchDebtEntries } from "@/store/debtSlice";
import {
  fetchWithdrawalEntries,
  addWithdrawalEntry,
  deleteWithdrawalEntry,
  WithdrawalEntry,
} from "@/store/withdrawalSlice";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

export function AssetCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const withdrawalEntries = useSelector(
    (state: RootState) => state.withdrawal.entries
  );
  const assetStatus = useSelector((state: RootState) => state.asset.status);
  const debtStatus = useSelector((state: RootState) => state.debt.status);
  const withdrawalStatus = useSelector(
    (state: RootState) => state.withdrawal.status
  );

  useEffect(() => {
    if (assetStatus === "idle") {
      dispatch(fetchAssetEntries());
    }
    if (debtStatus === "idle") {
      dispatch(fetchDebtEntries());
    }
    if (withdrawalStatus === "idle") {
      dispatch(fetchWithdrawalEntries());
    }
  }, [dispatch, assetStatus, debtStatus, withdrawalStatus]);

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
    date: entry.date, // Keep the date as a string
  }));

  const handleAddWithdrawal = async (
    newWithdrawal: Omit<WithdrawalEntry, "_id">
  ) => {
    try {
      await dispatch(addWithdrawalEntry(newWithdrawal)).unwrap();
    } catch (error) {
      console.error("Failed to add withdrawal:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteWithdrawal = async (withdrawalId: string) => {
    try {
      await dispatch(deleteWithdrawalEntry(withdrawalId)).unwrap();
    } catch (error) {
      console.error("Failed to delete withdrawal:", error);
      // You might want to show an error message to the user here
    }
  };

  if (
    assetStatus === "loading" ||
    debtStatus === "loading" ||
    withdrawalStatus === "loading"
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AssetCalendar
        data={combinedData}
        withdrawals={withdrawals}
        onAddWithdrawal={handleAddWithdrawal}
        onDeleteWithdrawal={handleDeleteWithdrawal}
      />
    </div>
  );
}
