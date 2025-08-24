// src/components/subscription/SubscriptionForm.tsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, CreditCard, DollarSign, SmartphoneIcon, Loader2 } from 'lucide-react';
import { SubscriptionService } from '@/types';
import { addSubscription, updateSubscription } from '@/store/subscriptionSlice';
import { format } from 'date-fns';

// 支払い方法の型定義
type PaymentMethodType = 'credit' | 'bank' | 'paypal' | 'apple' | 'google';

interface SubscriptionFormProps {
  editingSubscription: SubscriptionService | null;
  onCancel: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ editingSubscription, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.subscription);
  const [selectedBankAccount, setSelectedBankAccount] = useState('smbc_main');
  const [validationError, setValidationError] = useState('');

  // 日付入力欄に表示する値（文字列）
  const [billingDateDisplay, setBillingDateDisplay] = useState(format(new Date(), 'yyyy/MM/dd'));

  // 新規サブスクリプションのデフォルト値
  const today = new Date();
  const defaultBillingDate = parseInt(format(today, 'yyyyMMdd'), 10);

  const defaultSubscription: Omit<SubscriptionService, '_id'> = {
    name: '',
    billingDate: defaultBillingDate,
    type: '',
    amount: 0,
    paymentMethod: {
      type: 'credit',
      isDefault: true,
    },
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const [subscription, setSubscription] =
    useState<Omit<SubscriptionService, '_id'>>(defaultSubscription);

  // 編集モードの場合、フォームに値をセット
  useEffect(() => {
    if (editingSubscription) {
      // billingDateが存在しない場合は今日の日付を使用
      const formattedDate = editingSubscription.billingDate
        ? String(editingSubscription.billingDate)
        : format(new Date(), 'yyyy/MM/dd');

      setBillingDateDisplay(formattedDate);

      setSubscription({
        ...editingSubscription,
        // billingDateが存在しない場合は、今日の日付から生成した数値を設定
        billingDate: editingSubscription.billingDate || defaultBillingDate,
      });

      // 銀行支払いの場合、選択中の銀行口座を設定
      if (
        typeof editingSubscription.paymentMethod === 'object' &&
        editingSubscription.paymentMethod.type === 'bank' &&
        editingSubscription.bankAccount
      ) {
        setSelectedBankAccount(editingSubscription.bankAccount);
      }
    }
  }, [editingSubscription, defaultBillingDate]);

  // 支払い方法を変更
  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setSubscription({
      ...subscription,
      paymentMethod: {
        type: method,
        isDefault: true,
      },
      bankAccount: method === 'bank' ? selectedBankAccount : undefined,
    });
  };

  // 日付入力変更処理
  const handleBillingDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingDateDisplay(e.target.value);
  };

  // 日付文字列を数値に変換する関数
  const convertDateStringToNumber = (dateStr: string): number => {
    // 日付フォーマットの検証
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!datePattern.test(dateStr)) {
      return defaultBillingDate; // 不正な形式の場合はデフォルト値を返す
    }

    // スラッシュを削除して数値に変換
    return parseInt(dateStr.replace(/\//g, ''), 10);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // 日付形式の検証
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!datePattern.test(billingDateDisplay)) {
      setValidationError('引き落とし日は「YYYY/MM/DD」形式で入力してください。例: 2024/01/15');
      return;
    }

    try {
      // 文字列の日付を数値に変換
      const numericDate = convertDateStringToNumber(billingDateDisplay);

      const submittingSubscription = {
        ...subscription,
        billingDate: numericDate, // 数値型に変換して保存
      };

      if (editingSubscription) {
        await dispatch(
          updateSubscription({
            _id: editingSubscription._id,
            subscription: submittingSubscription,
          })
        ).unwrap();
      } else {
        await dispatch(addSubscription(submittingSubscription)).unwrap();
      }

      // 成功したらフォームをリセット
      setBillingDateDisplay(format(new Date(), 'yyyy/MM/dd'));
      setSubscription(defaultSubscription);
      onCancel(); // 編集モードの場合はキャンセル処理を呼び出す
    } catch (err) {
      console.error('Failed to save the subscription: ', err);
      setValidationError('保存中にエラーが発生しました。もう一度お試しください。');
    }
  };

  // 支払い方法タイプを取得
  const paymentMethodType =
    typeof subscription.paymentMethod === 'object' && subscription.paymentMethod
      ? (subscription.paymentMethod.type as PaymentMethodType)
      : 'credit';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingSubscription ? 'サブスクリプション編集' : 'サブスクリプション登録'}
        </CardTitle>
        <CardDescription>
          カード明細や銀行口座から発見したサブスクリプションを登録してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{validationError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={subscription.name}
                onChange={(e) =>
                  setSubscription({
                    ...subscription,
                    name: e.target.value,
                  })
                }
                placeholder="例：Netflix、Spotify"
                required
              />
            </div>
            <div>
              <Label htmlFor="billingDate">引き落とし日 (YYYY/MM/DD)</Label>
              <Input
                id="billingDate"
                value={billingDateDisplay}
                onChange={handleBillingDateChange}
                placeholder="2024/01/01"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">種別</Label>
              <Input
                id="type"
                value={subscription.type}
                onChange={(e) =>
                  setSubscription({
                    ...subscription,
                    type: e.target.value,
                  })
                }
                placeholder="例：動画、音楽、ソフトウェア"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="1"
                value={subscription.amount.toString()}
                onChange={(e) =>
                  setSubscription({
                    ...subscription,
                    amount: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                  })
                }
                placeholder="月額金額（税込）"
                required
              />
            </div>
          </div>

          {/* 支払い方法選択 */}
          <div>
            <Label className="mb-2 block">支払い方法</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={paymentMethodType === 'credit' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => handlePaymentMethodChange('credit')}
              >
                <CreditCard className="h-4 w-4" />
                クレジットカード
              </Button>
              <Button
                type="button"
                variant={paymentMethodType === 'bank' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => handlePaymentMethodChange('bank')}
              >
                <Building className="h-4 w-4" />
                銀行口座振替
              </Button>
              <Button
                type="button"
                variant={paymentMethodType === 'paypal' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <DollarSign className="h-4 w-4" />
                PayPal
              </Button>
              <Button
                type="button"
                variant={paymentMethodType === 'apple' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => handlePaymentMethodChange('apple')}
              >
                <SmartphoneIcon className="h-4 w-4" />
                Apple
              </Button>
              <Button
                type="button"
                variant={paymentMethodType === 'google' ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => handlePaymentMethodChange('google')}
              >
                <SmartphoneIcon className="h-4 w-4" />
                Google Play
              </Button>
            </div>
          </div>

          {/* 銀行口座選択（銀行振替の場合のみ表示） */}
          {paymentMethodType === 'bank' && (
            <div>
              <Label className="mb-2 block">引き落とし口座</Label>
              <Select
                value={selectedBankAccount}
                onValueChange={(value) => {
                  setSelectedBankAccount(value);
                  setSubscription({
                    ...subscription,
                    bankAccount: value,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="口座を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smbc_main">三井住友銀行 (メイン口座)</SelectItem>
                  <SelectItem value="mizuho_savings">みずほ銀行</SelectItem>
                  <SelectItem value="japan_post">ゆうちょ銀行</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  送信中...
                </>
              ) : editingSubscription ? (
                '更新'
              ) : (
                '登録'
              )}
            </Button>
            {editingSubscription && (
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubscriptionForm;
