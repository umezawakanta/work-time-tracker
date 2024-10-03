import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { AssetCalendar } from "@/components/calender/AssetCalender";
import { fetchAssetEntries } from "@/store/assetSlice";
import { fetchDebtEntries } from "@/store/debtSlice";

export function AssetCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const assetStatus = useSelector((state: RootState) => state.asset.status);
  const debtStatus = useSelector((state: RootState) => state.debt.status);

  useEffect(() => {
    if (assetStatus === "idle") {
      dispatch(fetchAssetEntries());
    }
    if (debtStatus === "idle") {
      dispatch(fetchDebtEntries());
    }
  }, [dispatch, assetStatus, debtStatus]);

  const combinedData = [
    ...assetEntries.map((entry) => ({ ...entry, date: new Date(entry.date) })),
    ...debtEntries.map((entry) => ({
      ...entry,
      date: new Date(entry.date),
      value: -entry.value,
    })),
  ];

  if (assetStatus === "loading" || debtStatus === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AssetCalendar data={combinedData} />
    </div>
  );
}
