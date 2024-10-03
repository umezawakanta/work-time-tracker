import { AssetCalendar } from "@/components/calender/AssetCalender";

const assetChanges = [
  { date: "2023-05-01", value: 10000 },
  { date: "2023-05-02", value: -5000 },
  { date: "2023-05-03", value: 15000 },
  // ... その他のデータ
];

export function AssetCalendarPage() {
  return (
    <div>
      <AssetCalendar assetChanges={assetChanges} />
    </div>
  );
}
