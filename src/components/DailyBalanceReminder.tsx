import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAssetEntry } from '../store/assetSlice';
import { addDebtEntry } from '../store/debtSlice';
import { updateLastReminderDate } from '../store/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { AppDispatch, RootState } from '../store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Wallet, CreditCard, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DailyBalanceReminder() {
  const dispatch = useDispatch<AppDispatch>();
  const [showReminder, setShowReminder] = useState(false);
  const [assetValue, setAssetValue] = useState('');
  const [assetAccount, setAssetAccount] = useState('');
  const [debtValue, setDebtValue] = useState('');
  const [debtAccount, setDebtAccount] = useState('');
  const [isSkipped, setIsSkipped] = useState(false);

  // 前回の記録から取得する
  const lastReminderDate = useSelector((state: RootState) => state.user.lastReminderDate);

  // よく使われる口座リスト
  const commonAssetAccounts = ['普通預金', '投資口座', '現金', '証券口座', '退職金口座'];
  const commonDebtAccounts = [
    'クレジットカード',
    '住宅ローン',
    'カードローン',
    '学生ローン',
    '自動車ローン',
  ];

  useEffect(() => {
    // 今日の日付とリマインダーの表示有無をチェック
    const now = new Date();
    const lastReminder = lastReminderDate ? new Date(lastReminderDate) : null;
    if (!lastReminder || now.toDateString() !== lastReminder.toDateString()) {
      setShowReminder(true);
    }
  }, [lastReminderDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updated = false;

    if (assetValue && assetAccount) {
      dispatch(
        addAssetEntry({
          date: new Date().toISOString().split('T')[0],
          value: parseFloat(assetValue),
          account: assetAccount,
        })
      );
      updated = true;
    }

    if (debtValue && debtAccount) {
      dispatch(
        addDebtEntry({
          date: new Date().toISOString().split('T')[0],
          value: parseFloat(debtValue),
          account: debtAccount,
          description: '日次残高更新',
        })
      );
      updated = true;
    }

    // 日付の更新
    dispatch(updateLastReminderDate(new Date().toISOString()));
    setShowReminder(false);

    // 入力に応じたメッセージ
    if (updated) {
      toast({
        title: '残高更新完了',
        description: '本日の残高が正常に記録されました。',
      });
    } else {
      toast({
        title: 'スキップしました',
        description: '今日の残高記録はスキップされました。',
      });
    }
  };

  const handleSkip = async () => {
    setIsSkipped(true);
    dispatch(updateLastReminderDate(new Date().toISOString()));
    setShowReminder(false);

    // API経由でスキップ情報を保存
    try {
      await fetch('/api/skip-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
      toast({
        title: 'スキップしました',
        description: '今日の残高記録はスキップされました。明日また通知します。',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'スキップ情報の保存に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  const handleAccountSelect = (value: string, type: 'asset' | 'debt') => {
    if (type === 'asset') {
      setAssetAccount(value);
    } else {
      setDebtAccount(value);
    }
  };

  if (!showReminder) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-md border-primary/10">
      {isSkipped && (
        <div className="bg-yellow-100 p-2 text-yellow-800 text-xs text-center">
          前回の更新はスキップされました
        </div>
      )}
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>日次残高更新リマインダー</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              の残高を記録しましょう
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <Alert variant="default" className="bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              毎日の残高を記録すると、資産変動の分析に役立ちます。
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border p-3 rounded-md">
              <h3 className="text-sm font-medium flex items-center mb-3">
                <Wallet className="h-4 w-4 mr-2 text-green-500" />
                資産情報
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="assetAccount">資産口座</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={assetAccount}
                      onValueChange={(value) => handleAccountSelect(value, 'asset')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="口座を選択または入力" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonAssetAccounts.map((account) => (
                          <SelectItem key={account} value={account}>
                            {account}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">その他（手入力）</SelectItem>
                      </SelectContent>
                    </Select>
                    {assetAccount === 'other' && (
                      <Input
                        placeholder="口座名を入力"
                        value={assetAccount === 'other' ? '' : assetAccount}
                        onChange={(e) => setAssetAccount(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="assetValue">残高 (円)</Label>
                  <Input
                    id="assetValue"
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    placeholder="金額を入力"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="border p-3 rounded-md">
              <h3 className="text-sm font-medium flex items-center mb-3">
                <CreditCard className="h-4 w-4 mr-2 text-red-500" />
                負債情報
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="debtAccount">負債口座</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={debtAccount}
                      onValueChange={(value) => handleAccountSelect(value, 'debt')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="口座を選択または入力" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDebtAccounts.map((account) => (
                          <SelectItem key={account} value={account}>
                            {account}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">その他（手入力）</SelectItem>
                      </SelectContent>
                    </Select>
                    {debtAccount === 'other' && (
                      <Input
                        placeholder="口座名を入力"
                        value={debtAccount === 'other' ? '' : debtAccount}
                        onChange={(e) => setDebtAccount(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="debtValue">残高 (円)</Label>
                  <Input
                    id="debtValue"
                    type="number"
                    value={debtValue}
                    onChange={(e) => setDebtValue(e.target.value)}
                    placeholder="金額を入力"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleSkip}>
            今日はスキップ
          </Button>
          <Button type="submit" className="w-full sm:flex-1 flex items-center gap-2">
            残高を更新 <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
