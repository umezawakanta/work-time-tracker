import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetEntry } from "@/store/assetSlice";
import { DebtEntry } from "@/store/debtSlice";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { formatDateAndTime } from "@/utils/dateUtils";
import { useLocale } from "@/hooks/useLocale";
import { useDispatch } from "react-redux";
import { addAssetEntry } from "@/store/assetSlice";
import { addDebtEntry } from "@/store/debtSlice";

interface BalanceUpdateReminderProps {
  assetEntries: AssetEntry[];
  debtEntries: DebtEntry[];
}

interface AccountStatus {
  account: string;
  isUpdated: boolean;
  lastUpdateDate: string;
  balance: number;
  type: "asset" | "debt";
}

export default function BalanceUpdateReminder({
  assetEntries,
  debtEntries,
}: BalanceUpdateReminderProps) {
  const { locale } = useLocale();
  const dispatch = useDispatch();
  const [updatingAccounts, setUpdatingAccounts] = useState<Set<string>>(
    new Set()
  );
  const today = new Date().toISOString().split("T")[0];

  const groupAndDeduplicate = (
    entries: AssetEntry[] | DebtEntry[],
    type: "asset" | "debt"
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
            balance: entry.value,
            type,
          });
        }
      } else {
        accountMap.set(entry.account, {
          account: entry.account,
          isUpdated: isUpdated,
          lastUpdateDate: entry.date,
          balance: entry.value,
          type,
        });
      }
    });

    return Array.from(accountMap.values());
  };

  const assetStatuses = groupAndDeduplicate(assetEntries, "asset");
  const debtStatuses = groupAndDeduplicate(debtEntries, "debt");

  const needsUpdate =
    assetStatuses.some((status) => !status.isUpdated) ||
    debtStatuses.some((status) => !status.isUpdated);

  if (!needsUpdate) {
    return null;
  }

  const handleQuickUpdate = async (status: AccountStatus) => {
    setUpdatingAccounts((prev) => new Set(prev).add(status.account));
    const newEntry = {
      account: status.account,
      value: status.balance,
      date: new Date().toISOString(),
    };

    try {
      if (status.type === "asset") {
        await dispatch(addAssetEntry(newEntry));
      } else {
        await dispatch(addDebtEntry(newEntry));
      }
    } catch (error) {
      console.error("Failed to update balance:", error);
    } finally {
      setUpdatingAccounts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(status.account);
        return newSet;
      });
    }
  };

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
            <div className="flex items-center">
              <span className="mr-4 font-medium">
                {status.balance.toLocaleString()}円
              </span>
              <span className="text-sm text-gray-500 mr-2">
                {formatDateAndTime(status.lastUpdateDate, locale, {
                  dateStyle: "short",
                  timeStyle: "medium",
                })}
              </span>
              {!status.isUpdated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickUpdate(status)}
                  disabled={updatingAccounts.has(status.account)}
                >
                  {updatingAccounts.has(status.account) ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "クイック更新"
                  )}
                </Button>
              )}
            </div>
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
