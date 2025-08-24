import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CreditCard,
  Building,
  Smartphone,
  Package,
  ArrowLeft,
  Lock,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { Address, PaymentMethod } from '@/types/ecommerce';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  // フォーム状態
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '日本',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({ ...shippingAddress });
  const [useSameAddress, setUseSameAddress] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [processing, setProcessing] = useState<boolean>(false);

  // カートが空の場合は商品ページにリダイレクト
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/products');
    }
  }, [cart, navigate]);

  // 請求先住所の同期
  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [shippingAddress, useSameAddress]);

  // 価格フォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // フォームバリデーション
  const validateShippingForm = (): boolean => {
    const required = ['firstName', 'lastName', 'address1', 'city', 'state', 'postalCode'];
    return required.every((field) => shippingAddress[field as keyof Address]);
  };

  const validatePaymentForm = (): boolean => {
    if (paymentMethod === 'credit_card') {
      return !!(
        cardDetails.cardNumber &&
        cardDetails.expiryDate &&
        cardDetails.cvv &&
        cardDetails.cardholderName
      );
    }
    return true;
  };

  // 注文処理
  const handlePlaceOrder = async () => {
    if (!cart) return;

    setProcessing(true);
    try {
      // 実際の実装では API を呼び出して注文を作成
      await new Promise((resolve) => setTimeout(resolve, 2000)); // シミュレーション

      // 注文完了
      await clearCart();
      setStep('complete');

      toast({
        title: '注文完了',
        description: 'ご注文ありがとうございました',
      });
    } catch (error) {
      console.error('注文エラー:', error);
      toast({
        title: 'エラー',
        description: '注文の処理中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  // 注文完了画面
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">注文完了</h2>
            <p className="text-gray-600 mb-6">
              ご注文ありがとうございました。
              <br />
              注文確認メールをお送りしました。
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/orders')} className="w-full">
                注文履歴を見る
              </Button>
              <Button variant="outline" onClick={() => navigate('/products')} className="w-full">
                ショッピングを続ける
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/products')} className="p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">チェックアウト</h1>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { key: 'shipping', label: '配送先' },
              { key: 'payment', label: '支払い方法' },
              { key: 'review', label: '注文確認' },
            ].map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s.key
                      ? 'bg-blue-600 text-white'
                      : ['shipping', 'payment', 'review'].indexOf(step) > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {['shipping', 'payment', 'review'].indexOf(step) > index ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{s.label}</span>
                {index < 2 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 配送先情報 */}
            {step === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    配送先情報
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">姓 *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">名 *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address1">住所1 *</Label>
                    <Input
                      id="address1"
                      placeholder="都道府県、市区町村、番地"
                      value={shippingAddress.address1}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address1: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2">住所2</Label>
                    <Input
                      id="address2"
                      placeholder="建物名、部屋番号など（任意）"
                      value={shippingAddress.address2}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address2: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">市区町村 *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">都道府県 *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">郵便番号 *</Label>
                      <Input
                        id="postalCode"
                        placeholder="123-4567"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      placeholder="090-1234-5678"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, phone: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    onClick={() => setStep('payment')}
                    disabled={!validateShippingForm()}
                    className="w-full"
                  >
                    支払い方法に進む
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 支払い方法 */}
            {step === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    支払い方法
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        クレジットカード
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        銀行振込
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile_payment" id="mobile_payment" />
                      <Label htmlFor="mobile_payment" className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        モバイル決済
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="cardNumber">カード番号 *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardholderName">カード名義 *</Label>
                        <Input
                          id="cardholderName"
                          placeholder="TARO YAMADA"
                          value={cardDetails.cardholderName}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">有効期限 *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, cvv: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 請求先住所 */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAddress"
                        checked={useSameAddress}
                        onCheckedChange={(checked) => setUseSameAddress(checked === true)}
                      />
                      <Label htmlFor="sameAddress">請求先住所は配送先住所と同じ</Label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('shipping')}
                      className="flex-1"
                    >
                      戻る
                    </Button>
                    <Button
                      onClick={() => setStep('review')}
                      disabled={!validatePaymentForm()}
                      className="flex-1"
                    >
                      注文内容確認
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 注文確認 */}
            {step === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle>注文内容確認</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 配送先情報確認 */}
                  <div>
                    <h4 className="font-medium mb-2">配送先</h4>
                    <div className="text-sm text-gray-600">
                      <p>
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p>{shippingAddress.address1}</p>
                      {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                      </p>
                      {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                    </div>
                  </div>

                  <Separator />

                  {/* 支払い方法確認 */}
                  <div>
                    <h4 className="font-medium mb-2">支払い方法</h4>
                    <div className="text-sm text-gray-600">
                      {paymentMethod === 'credit_card' && (
                        <p>クレジットカード (**** **** **** {cardDetails.cardNumber.slice(-4)})</p>
                      )}
                      {paymentMethod === 'bank_transfer' && <p>銀行振込</p>}
                      {paymentMethod === 'mobile_payment' && <p>モバイル決済</p>}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                      戻る
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={processing} className="flex-1">
                      <Lock className="mr-2 h-4 w-4" />
                      {processing ? '処理中...' : '注文を確定する'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 注文サマリー */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>注文サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 商品一覧 */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-gray-500">数量: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(
                          (item.product.salePrice || item.product.price) * item.quantity
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* 金額詳細 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>小計:</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>消費税:</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>配送料:</span>
                    <span>{cart.shipping === 0 ? '無料' : formatPrice(cart.shipping)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>割引:</span>
                      <span>-{formatPrice(cart.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>合計:</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* 配送情報 */}
                {cart.shipping === 0 && cart.subtotal >= 5000 && (
                  <div className="text-sm text-green-600 text-center bg-green-50 p-2 rounded">
                    ✓ 送料無料でお届けします
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
