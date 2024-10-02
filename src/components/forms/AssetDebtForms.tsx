import React from "react";
import { AssetForm } from "@/components/forms/AssetForm";
import { DebtForm } from "@/components/forms/DebtForm";

interface AssetDebtFormsProps {
  editingAsset: string | null;
  setEditingAsset: React.Dispatch<React.SetStateAction<string | null>>;
  editingDebt: string | null;
  setEditingDebt: React.Dispatch<React.SetStateAction<string | null>>;
  updateLastBalanceDate: () => void;
}

export const AssetDebtForms: React.FC<AssetDebtFormsProps> = ({
  editingAsset,
  setEditingAsset,
  editingDebt,
  setEditingDebt,
  updateLastBalanceDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <AssetForm
        editingAsset={editingAsset}
        setEditingAsset={setEditingAsset}
        updateLastBalanceDate={updateLastBalanceDate}
      />
      <DebtForm
        editingDebt={editingDebt}
        setEditingDebt={setEditingDebt}
        updateLastBalanceDate={updateLastBalanceDate}
      />
    </div>
  );
};
