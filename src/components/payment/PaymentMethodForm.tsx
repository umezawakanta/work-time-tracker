import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, BanknoteIcon, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import { useAuth } from '@/hooks/useAuth';
import { CustomPaymentMethodData } from '@/types';

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  buttonText?: string;
  isUpdate?: boolean;
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
  buttonText = '支払い方法を保存',
  isUpdate = false,
}: PaymentMethodFormProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // フォームのバリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'credit-card') {
      if (!cardDetails.cardNumber) {
        newErrors.cardNumber = 'カード番号を入力してください';
      } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = '有効なカード番号を入力してください';
      }

      if (!cardDetails.cardName) {
        newErrors.cardName = 'カード名義を入力してください';
      }

      if (!cardDetails.expiry) {
        newErrors.expiry = '有効期限を入力してください';
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = '有効期限はMM/YY形式で入力してください';
      }

      if (!cardDetails.cvc) {
        newErrors.cvc = 'セキュリティコードを入力してください';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
        newErrors.cvc = '有効なセキュリティコードを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 支払い方法の保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('ログインが必要です');
      return;
    }

    setIsProcessing(true);

    try {
      // 支払い方法情報のフォーマット
      const paymentMethodData: CustomPaymentMethodData = {
        type: paymentMethod === 'credit-card' ? 'credit_card' : 'bank_transfer',
        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
        cardholderName: cardDetails.cardName,
        expiryDate: cardDetails.expiry,
        cvc: cardDetails.cvc,
      };

      // APIを呼び出して支払い方法を保存
      await userSubscriptionApi.updatePaymentMethod(user.id, paymentMethodData);

      toast.success('支払い方法が保存されました');

      // 成功時のコールバック
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('支払い方法保存エラー:', error);
      toast.error('支払い方法の保存に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // カード番号の入力フォーマット
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = []; // string[]型を明示的に指定

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // 有効期限の入力フォーマット
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isUpdate ? '支払い方法を更新' : '支払い方法を追加'}</CardTitle>
          <CardDescription>安全な支払い方法を選択して設定してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit-card" id="credit-card" />
              <Label htmlFor="credit-card" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                クレジットカード
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank-transfer" id="bank-transfer" disabled />
              <Label htmlFor="bank-transfer" className="text-gray-500 flex items-center">
                <BanknoteIcon className="h-4 w-4 mr-2" />
                銀行振込 (準備中)
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'credit-card' && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="cardNumber">カード番号</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      cardNumber: formatCardNumber(e.target.value),
                    })
                  }
                  className={errors.cardNumber ? 'border-red-500' : ''}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cardName">カード名義</Label>
                <Input
                  id="cardName"
                  placeholder="TARO YAMADA"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                  className={errors.cardName ? 'border-red-500' : ''}
                />
                {errors.cardName && <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">有効期限 (MM/YY)</Label>
                  <Input
                    id="expiry"
                    placeholder="12/25"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        expiry: formatExpiry(e.target.value),
                      })
                    }
                    className={errors.expiry ? 'border-red-500' : ''}
                    maxLength={5}
                  />
                  {errors.expiry && <p className="text-sm text-red-500 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <Label htmlFor="cvc">セキュリティコード</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cvc: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className={errors.cvc ? 'border-red-500' : ''}
                    maxLength={4}
                  />
                  {errors.cvc && <p className="text-sm text-red-500 mt-1">{errors.cvc}</p>}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                お支払い情報は安全に暗号化されます
              </div>
            </div>
          )}

          <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>重要なお知らせ</AlertTitle>
            <AlertDescription>
              このフォームはデモ用です。実際の支払い処理は行われません。テスト用カード番号「4242
              4242 4242 4242」を使用できます。
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                処理中...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
