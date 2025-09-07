import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { deleteAssetEntry } from '@/store/assetSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash2Icon, PencilIcon } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { formatDateAndTime } from '@/utils/dateUtils';
import { AssetEntry } from '@/types';

interface AssetListProps {
  assetEntries: AssetEntry[];
  onBalanceUpdate: (accountId: string, isAsset: boolean) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assetEntries, onBalanceUpdate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useLocale();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '未設定';
    return formatDateAndTime(dateString, locale, { dateStyle: 'short' });
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await dispatch(deleteAssetEntry(id)).unwrap();
      toast({
        title: '成功',
        description: '資産情報が削除されました。',
      });
    } catch (error) {
      console.error('Failed to delete asset entry:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '資産情報の削除に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>資産情報</CardTitle>
      </CardHeader>
      <CardContent>
        {assetEntries && assetEntries.length > 0 ? (
          <div>
            {assetEntries
              .filter((entry) => entry && entry._id && entry.account && entry.value !== undefined)
              .map((entry) => (
                <div key={entry._id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-semibold">{entry.account}</p>
                    <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                    <p className="text-sm">価値: {entry.value.toLocaleString()}円</p>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBalanceUpdate(entry._id || '', true)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAsset(entry._id || '')}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>資産情報がありません。</p>
        )}
      </CardContent>
    </Card>
  );
};
