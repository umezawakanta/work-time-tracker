import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { addDebtEntry, updateDebtEntry } from '@/store/debtSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface DebtFormProps {
  editingDebt: string | null;
  setEditingDebt: React.Dispatch<React.SetStateAction<string | null>>;
  updateLastBalanceDate: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({
  editingDebt,
  setEditingDebt,
  updateLastBalanceDate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDebtValue, setCurrentDebtValue] = useState<string>('');
  const [currentDebtDescription, setCurrentDebtDescription] = useState<string>('');
  const [currentDebtAccount, setCurrentDebtAccount] = useState<string>('');

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDebtAccount) {
      toast({
        title: 'エラー',
        description: '口座を選択してください。',
        variant: 'destructive',
      });
      return;
    }
    const newDebtEntry = {
      date: new Date().toISOString().split('T')[0],
      value: parseFloat(currentDebtValue),
      description: currentDebtDescription.trim() || '日時残額更新',
      account: currentDebtAccount,
    };
    if (editingDebt) {
      dispatch(updateDebtEntry({ id: editingDebt, entry: newDebtEntry }));
      setEditingDebt(null);
    } else {
      dispatch(addDebtEntry(newDebtEntry));
    }
    setCurrentDebtValue('');
    setCurrentDebtDescription('');
    setCurrentDebtAccount('');
    updateLastBalanceDate();
    toast({
      title: '成功',
      description: editingDebt ? '負債情報が更新されました。' : '負債情報が記録されました。',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>負債情報の登録/更新</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDebtSubmit} className="space-y-4">
          <div>
            <Label htmlFor="debtValue">負債額</Label>
            <Input
              id="debtValue"
              type="number"
              value={currentDebtValue}
              onChange={(e) => setCurrentDebtValue(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="debtDescription">説明 (任意)</Label>
            <Textarea
              id="debtDescription"
              value={currentDebtDescription}
              onChange={(e) => setCurrentDebtDescription(e.target.value)}
              placeholder="説明を入力してください（空白の場合は「日時残額更新」と記録されます）"
            />
          </div>
          <div>
            <Label htmlFor="debtAccount">口座</Label>
            <Input
              id="debtAccount"
              type="text"
              value={currentDebtAccount}
              onChange={(e) => setCurrentDebtAccount(e.target.value)}
              required
            />
          </div>
          <Button type="submit">{editingDebt ? '更新' : '登録'}</Button>
          {editingDebt && (
            <Button type="button" variant="outline" onClick={() => setEditingDebt(null)}>
              キャンセル
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
