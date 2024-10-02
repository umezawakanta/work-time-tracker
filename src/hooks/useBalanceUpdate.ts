import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateAssetEntry, AssetEntry } from "@/store/assetSlice";
import { updateDebtEntry, DebtEntry } from "@/store/debtSlice";
import { toast } from "@/components/ui/use-toast";

export const useBalanceUpdate = (updateLastBalanceDate: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AssetEntry | DebtEntry | null
  >(null);

  const handleBalanceUpdate = (
    accountId: string,
    isAsset: boolean,
    entries: AssetEntry[] | DebtEntry[]
  ) => {
    const account = entries.find((entry) => entry._id === accountId);
    if (account) {
      setSelectedAccount(account);
      setIsBalanceModalOpen(true);
    }
  };

  const handleBalanceUpdateSubmit = (
    newBalance: number,
    isUnknownFunds: boolean,
    date: string
  ) => {
    if (selectedAccount) {
      const updatedEntry = {
        ...selectedAccount,
        value: newBalance,
        date: date,
        isUnknownFunds: isUnknownFunds,
      };
      if ("description" in selectedAccount) {
        dispatch(
          updateDebtEntry({
            id: selectedAccount._id || "",
            entry: updatedEntry as DebtEntry,
          })
        );
      } else {
        dispatch(
          updateAssetEntry({
            id: selectedAccount._id || "",
            entry: updatedEntry as AssetEntry,
          })
        );
      }
      updateLastBalanceDate();
      toast({
        title: "成功",
        description: "残高が更新されました。",
      });
    }
  };

  return {
    isBalanceModalOpen,
    setIsBalanceModalOpen,
    selectedAccount,
    handleBalanceUpdate,
    handleBalanceUpdateSubmit,
  };
};
