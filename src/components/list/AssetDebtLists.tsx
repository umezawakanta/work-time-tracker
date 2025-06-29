import React from 'react';
import { AssetList } from '@/components/list/AssetList';
import { DebtList } from '@/components/list/DebtList';
import { AssetEntry, DebtEntry } from '@/types';

interface AssetDebtListsProps {
  assetEntries: AssetEntry[];
  debtEntries: DebtEntry[];
  onBalanceUpdate: (accountId: string, isAsset: boolean) => void;
}

export const AssetDebtLists: React.FC<AssetDebtListsProps> = ({
  assetEntries,
  debtEntries,
  onBalanceUpdate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <AssetList assetEntries={assetEntries} onBalanceUpdate={onBalanceUpdate} />
      <DebtList debtEntries={debtEntries} onBalanceUpdate={onBalanceUpdate} />
    </div>
  );
};
