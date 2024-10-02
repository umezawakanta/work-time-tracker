import { AssetEntry } from "@/store/assetSlice";
import { DebtEntry } from "@/store/debtSlice";

export const combineData = (
  assetEntries: AssetEntry[],
  debtEntries: DebtEntry[]
) => {
  return [...assetEntries, ...debtEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date),
      value: "description" in entry ? -entry.value : entry.value,
      account: entry.account,
    }));
};
