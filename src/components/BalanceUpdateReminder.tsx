import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetEntry } from "@/store/assetSlice";
import { DebtEntry } from "@/store/debtSlice";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDateAndTime } from "@/utils/dateUtils";
import { useLocale } from "@/hooks/useLocale";

interface BalanceUpdateReminderProps {
  assetEntries: AssetEntry[];
  debtEntries: DebtEntry[];
}

interface AccountStatus {
  account: string;
  isUpdated: boolean;
  lastUpdateDate: string;
}

export default function BalanceUpdateReminder({
  assetEntries,
  debtEntries,
}: BalanceUpdateReminderProps) {
  const { locale } = useLocale();
  const today = new Date().toISOString().split("T")[0];

  const groupAndDeduplicate = (
    entries: AssetEntry[] | DebtEntry[]
  ): AccountStatus[] => {
    const accountMap = new Map<string, AccountStatus>();

    entries.forEach((entry) => {
      const isUpdated =
        new Date(entry.date).toISOString().split("T")[0] === today;
      const currentStatus = accountMap.get(entry.account);

      if (currentStatus) {
        if (new Date(entry.date) > new Date(currentStatus.lastUpdateDate)) {
          accountMap.set(entry.account, {
            account: entry.account,
            isUpdated: isUpdated,
            lastUpdateDate: entry.date,
          });
        }
      } else {
        accountMap.set(entry.account, {
          account: entry.account,
          isUpdated: isUpdated,
          lastUpdateDate: entry.date,
        });
      }
    });

    return Array.from(accountMap.values());
  };

  const assetStatuses = groupAndDeduplicate(assetEntries);
  const debtStatuses = groupAndDeduplicate(debtEntries);

  const needsUpdate =
    assetStatuses.some((status) => !status.isUpdated) ||
    debtStatuses.some((status) => !status.isUpdated);

  if (!needsUpdate) {
    return null;
  }

  const renderAccountStatus = (statuses: AccountStatus[], type: string) => (
    <div className="mt-2">
      <h3 className="font-semibold">{type}</h3>
      <ul>
        {statuses.map((status) => (
          <li
            key={status.account}
            className="flex items-center justify-between py-1"
          >
            <div className="flex items-center">
              {status.isUpdated ? (
                <CheckCircle className="text-green-500 mr-2" size={16} />
              ) : (
                <XCircle className="text-red-500 mr-2" size={16} />
              )}
              <span>
                {status.account}: {status.isUpdated ? "更新済み" : "未更新"}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatDateAndTime(status.lastUpdateDate, locale, {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card className="mb-8 bg-yellow-100">
      <CardHeader>
        <CardTitle>残高更新リマインダー</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">本日の資産・負債の残高を入力してください。</p>
        {renderAccountStatus(assetStatuses, "資産")}
        {renderAccountStatus(debtStatuses, "負債")}
      </CardContent>
    </Card>
  );
}
