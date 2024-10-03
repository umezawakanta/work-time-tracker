import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AssetCalendar } from "@/components/calender/AssetCalender";
import { AssetEntry } from "@/store/assetSlice";
import { DebtEntry } from "@/store/debtSlice";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

export function AssetCalendarPage() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);

  const combinedData: DataPoint[] = [
    ...assetEntries.map((entry: AssetEntry) => ({
      date: new Date(entry.date),
      value: entry.value,
      account: entry.account,
    })),
    ...debtEntries.map((entry: DebtEntry) => ({
      date: new Date(entry.date),
      value: -entry.value, // Negate debt values
      account: entry.account,
    })),
  ];

  return (
    <div>
      <AssetCalendar data={combinedData} />
    </div>
  );
}
