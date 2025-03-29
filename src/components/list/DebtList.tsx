import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { deleteDebtEntry } from "@/store/debtSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2Icon, PencilIcon } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { formatDateAndTime } from "@/utils/dateUtils";
import { DebtEntry } from "@/types";

interface DebtListProps {
  debtEntries: DebtEntry[];
  onBalanceUpdate: (accountId: string, isAsset: boolean) => void;
}

export const DebtList: React.FC<DebtListProps> = ({
  debtEntries,
  onBalanceUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useLocale();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "未設定";
    return formatDateAndTime(dateString, locale, { dateStyle: "short" });
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await dispatch(deleteDebtEntry(id)).unwrap();
      toast({
        title: "成功",
        description: "負債情報が削除されました。",
      });
    } catch (error) {
      console.error("Failed to delete debt entry:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "負債情報の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>負債情報</CardTitle>
      </CardHeader>
      <CardContent>
        {debtEntries.length > 0 ? (
          <div>
            {debtEntries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between py-2 border-b"
              >
                <div>
                  <p className="font-semibold">{entry.account}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-sm">
                    金額: {entry.value.toLocaleString()}円
                  </p>
                  <p className="text-sm">説明: {entry.description}</p>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBalanceUpdate(entry._id || "", false)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDebt(entry._id || "")}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>負債情報がありません。</p>
        )}
      </CardContent>
    </Card>
  );
};
