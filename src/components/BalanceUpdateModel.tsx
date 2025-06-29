import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface BalanceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newBalance: number, isUnknownFunds: boolean, date: string) => void;
  currentBalance: number;
  accountName: string;
}

export function BalanceUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  currentBalance,
  accountName,
}: BalanceUpdateModalProps) {
  const [newBalance, setNewBalance] = useState(currentBalance.toString());
  const [isUnknownFunds, setIsUnknownFunds] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(newBalance), isUnknownFunds, date);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>残高修正 - {accountName}</DialogTitle>
          <DialogDescription>
            以下のフォームで残高を修正してください。不明金として記帳する場合はチェックボックスを選択してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentBalance" className="text-right">
              現在の残高
            </Label>
            <Input
              id="currentBalance"
              value={`${currentBalance} 円`}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newBalance" className="text-right">
              修正後の残高
            </Label>
            <Input
              id="newBalance"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="col-span-3"
              type="number"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unknownFunds"
              checked={isUnknownFunds}
              onCheckedChange={(checked) => setIsUnknownFunds(checked as boolean)}
            />
            <Label htmlFor="unknownFunds">不明金として記帳</Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              記帳日 (年/月/日)
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              この内容で登録する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
