// 簡易データ入力コンポーネント - 資産/負債の素早い記録機能

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addAssetEntry } from '@/store/assetSlice';
import { addDebtEntry } from '@/store/debtSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '@/store'; // AppDispatchをインポート

// 繰り返し頻度の選択肢
const FREQUENCIES = [
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: '2weeks', label: '2週間ごと' },
  { value: 'monthly', label: '毎月' },
  { value: 'quarterly', label: '3ヶ月ごと' },
  { value: 'biannual', label: '半年ごと' },
  { value: 'yearly', label: '毎年' },
];

// プリセットのカテゴリ
const ASSET_CATEGORIES = [
  { value: 'cash', label: '現金・預金' },
  { value: 'investment', label: '投資' },
  { value: 'realestate', label: '不動産' },
  { value: 'pension', label: '年金・保険' },
  { value: 'other', label: 'その他' },
];

const DEBT_CATEGORIES = [
  { value: 'mortgage', label: '住宅ローン' },
  { value: 'cardloan', label: 'カードローン・キャッシング' },
  { value: 'carloan', label: '自動車ローン' },
  { value: 'education', label: '教育ローン' },
  { value: 'other', label: 'その他' },
];

// コンポーネントの型定義
interface QuickInputProps {
  onClose?: () => void;
  updateLastBalanceDate: () => void;
}

export const QuickInput: React.FC<QuickInputProps> = ({ onClose, updateLastBalanceDate }) => {
  // 型付きディスパッチを使用
  const dispatch = useDispatch<AppDispatch>();
  const [entryType, setEntryType] = useState<'asset' | 'debt'>('asset');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState(entryType === 'asset' ? 'cash' : 'mortgage');
  const [value, setValue] = useState('');
  const [enableAutoUpdate, setEnableAutoUpdate] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState('monthly');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // タブ切り替え時にカテゴリをリセット
  const handleTypeChange = (value: string) => {
    setEntryType(value as 'asset' | 'debt');
    setCategory(value === 'asset' ? 'cash' : 'mortgage');
  };

  // データ登録処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName || !value) {
      toast.error('名前と金額を入力してください');
      return;
    }

    setIsSubmitting(true);

    const numericValue = parseFloat(value);
    const currentDate = new Date().toISOString();

    try {
      // 目標設定があれば追加データを含める
      const targetSettings = enableAutoUpdate
        ? {
            autoUpdate: true,
            updateFrequency,
            targetValue: targetValue ? parseFloat(targetValue) : numericValue,
            targetDate,
          }
        : undefined;

      // 資産または負債エントリを追加
      if (entryType === 'asset') {
        dispatch(
          addAssetEntry({
            account: accountName,
            value: numericValue,
            date: currentDate,
            description: accountName, // 口座名を説明として使用
            category,
            targetSettings,
          })
        );
      } else {
        dispatch(
          addDebtEntry({
            account: accountName,
            value: numericValue,
            date: currentDate,
            category,
            targetSettings,
            description: '',
          })
        );
      }

      updateLastBalanceDate();
      toast.success(`${entryType === 'asset' ? '資産' : '負債'}を追加しました！`);

      // フォームをリセット
      setAccountName('');
      setValue('');
      setTargetValue('');

      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('エントリの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="asset" value={entryType} onValueChange={handleTypeChange}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="asset">資産の追加</TabsTrigger>
              <TabsTrigger value="debt">負債の追加</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account-name">名前</Label>
                  <Input
                    id="account-name"
                    placeholder={entryType === 'asset' ? '三菱UFJ銀行' : '住宅ローン'}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {(entryType === 'asset' ? ASSET_CATEGORIES : DEBT_CATEGORIES).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="value">{entryType === 'asset' ? '金額' : '負債額'}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">¥</span>
                  <Input
                    id="value"
                    type="number"
                    placeholder="1,000,000"
                    className="pl-8"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="auto-update"
                  checked={enableAutoUpdate}
                  onCheckedChange={setEnableAutoUpdate}
                />
                <Label htmlFor="auto-update" className="cursor-pointer">
                  目標設定・自動更新
                </Label>
              </div>

              {enableAutoUpdate && (
                <div className="space-y-4 p-3 bg-slate-50 rounded-md">
                  <div>
                    <Label htmlFor="update-frequency">更新頻度</Label>
                    <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-value">目標額</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          ¥
                        </span>
                        <Input
                          id="target-value"
                          type="number"
                          placeholder={entryType === 'asset' ? '2,000,000' : '0'}
                          className="pl-8"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="target-date">目標日</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="target-date"
                          type="date"
                          className="pl-8"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {entryType === 'asset'
                        ? '目標額に向けて資産の成長を追跡します'
                        : '負債の返済進捗を追跡します'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                {onClose && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    キャンセル
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {entryType === 'asset' ? '資産を追加' : '負債を追加'}
                </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
};
