import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/useAuth';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import { SubscriptionPlanCard, PlanFeature } from '@/components/subscription/SubscriptionPlanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { UserSubscription } from '@/types';

// Type definition for interval
type PlanInterval = 'month' | 'year';

// Plan interface definition
interface Plan {
  id: string;
  name: string;
  price: number;
  interval: PlanInterval;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
}

// プラン定義
const plans: {
  monthly: Plan[];
  yearly: Plan[];
} = {
  monthly: [
    {
      id: 'free',
      name: 'フリープラン',
      price: 0,
      interval: 'month',
      description: '基本的な機能が利用可能です',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（基本）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: false },
        { name: '睡眠トラッカー', included: false },
        { name: 'ADHD日記', included: false },
        { name: '電話サポート', included: false },
      ],
    },
    {
      id: 'premium-monthly',
      name: 'プレミアムプラン',
      price: 980,
      interval: 'month',
      description: 'すべての機能が使い放題',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（詳細）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: true },
        { name: '睡眠トラッカー', included: true },
        { name: 'ADHD日記', included: true, info: '症状の記録と分析が可能' },
        { name: '電話サポート', included: true },
      ],
      isPopular: true,
    },
    {
      id: 'business-monthly',
      name: 'ビジネスプラン',
      price: 2980,
      interval: 'month',
      description: 'チーム利用に最適なプラン',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（詳細）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: true },
        { name: '睡眠トラッカー', included: true },
        { name: 'ADHD日記', included: true },
        { name: '電話サポート（優先）', included: true, info: '24時間対応' },
        { name: 'チーム管理機能', included: true, info: '最大10名まで' },
        { name: 'API連携', included: true },
      ],
    },
  ],
  yearly: [
    {
      id: 'free',
      name: 'フリープラン',
      price: 0,
      interval: 'year',
      description: '基本的な機能が利用可能です',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（基本）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: false },
        { name: '睡眠トラッカー', included: false },
        { name: 'ADHD日記', included: false },
        { name: '電話サポート', included: false },
      ],
    },
    {
      id: 'premium-yearly',
      name: 'プレミアムプラン',
      price: 9800,
      interval: 'year',
      description: 'すべての機能が使い放題',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（詳細）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: true },
        { name: '睡眠トラッカー', included: true },
        { name: 'ADHD日記', included: true, info: '症状の記録と分析が可能' },
        { name: '電話サポート', included: true },
      ],
      isPopular: true,
    },
    {
      id: 'business-yearly',
      name: 'ビジネスプラン',
      price: 29800,
      interval: 'year',
      description: 'チーム利用に最適なプラン',
      features: [
        { name: '作業時間の記録', included: true },
        { name: '作業レポート（詳細）', included: true },
        { name: 'サブスクリプション管理', included: true },
        { name: '読書管理', included: true },
        { name: '資産/負債管理', included: true },
        { name: '睡眠トラッカー', included: true },
        { name: 'ADHD日記', included: true },
        { name: '電話サポート（優先）', included: true, info: '24時間対応' },
        { name: 'チーム管理機能', included: true, info: '最大10名まで' },
        { name: 'API連携', included: true },
      ],
    },
  ],
};

export default function SubscriptionUpgradePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });

  // サブスクリプション情報の取得
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const response = await userSubscriptionApi.getUserSubscription(user.id);
          setCurrentSubscription(response.data);

          // 現在のプランがあれば、そのプランを選択状態にする
          if (response.data && response.data.planId) {
            setSelectedPlan(response.data.planId);
          }
        } catch (error) {
          console.error('サブスクリプション取得エラー:', error);
          toast.error('サブスクリプション情報の取得に失敗しました');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, user]);

  // プランの選択
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);

    // フリープラン以外を選択した場合は支払いダイアログを表示
    if (planId !== 'free') {
      setShowPaymentDialog(true);
    } else {
      // フリープランはダイアログなしで直接選択可能
      handleSubscriptionUpdate(planId);
    }
  };

  // サブスクリプション更新処理
  const handleSubscriptionUpdate = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('ログインが必要です');
      navigate('/login');
      return;
    }

    try {
      setIsProcessing(true);

      // 現在のサブスクリプションがある場合は更新、なければ新規作成
      if (currentSubscription) {
        await userSubscriptionApi.updateUserSubscription(currentSubscription._id, {
          planId,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        });
      } else {
        await userSubscriptionApi.createUserSubscription({
          userId: user.id,
          planId,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
          cancelAtPeriodEnd: false,
        });
      }

      toast.success(`${planId === 'free' ? 'フリー' : 'プレミアム'}プランに更新しました！`);
      // 最新のサブスクリプション情報を再取得
      const response = await userSubscriptionApi.getUserSubscription(user.id);
      setCurrentSubscription(response.data);
      setShowPaymentDialog(false);

      // プレミアムプランの場合、3秒後に成功メッセージを表示
      if (planId !== 'free') {
        setTimeout(() => {
          toast.success('プレミアム機能がすべて利用可能になりました！', {
            icon: '✨',
            duration: 5000,
          });
        }, 3000);
      }
    } catch (error) {
      console.error('サブスクリプション更新エラー:', error);
      toast.error('サブスクリプションの更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 支払い処理
  const handlePayment = async () => {
    // 支払い処理シミュレーション
    setIsProcessing(true);

    // 入力検証
    if (paymentMethod === 'credit-card') {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.cardName ||
        !cardDetails.expiry ||
        !cardDetails.cvc
      ) {
        toast.error('すべてのカード情報を入力してください');
        setIsProcessing(false);
        return;
      }
    }

    // 処理中の演出（実際の決済処理はここに実装）
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 選択されたプランIDでサブスクリプションを更新
    if (selectedPlan) {
      await handleSubscriptionUpdate(selectedPlan);
    }
  };

  // プランの表示
  const renderPlans = () => {
    const planList = interval === 'monthly' ? plans.monthly : plans.yearly;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planList.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            {...plan}
            isCurrent={currentSubscription?.planId === plan.id}
            onSelect={handlePlanSelect}
            disabled={isProcessing}
          />
        ))}
      </div>
    );
  };

  // 支払いダイアログ
  const renderPaymentDialog = () => {
    const selectedPlanDetails = [...plans.monthly, ...plans.yearly].find(
      (p) => p.id === selectedPlan
    );

    return (
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>お支払い情報</DialogTitle>
            <DialogDescription>
              {selectedPlanDetails && (
                <div className="mt-2">
                  <Badge className="mb-2">
                    {selectedPlanDetails.name} (
                    {selectedPlanDetails.interval === 'month' ? '月額' : '年額'})
                  </Badge>
                  <p className="font-medium text-lg">
                    ¥{selectedPlanDetails.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">
                      /{selectedPlanDetails.interval === 'month' ? '月' : '年'}
                    </span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-2"
            >
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
                  <Info className="h-4 w-4 mr-2" />
                  銀行振込 (準備中)
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'credit-card' && (
              <div className="space-y-3 mt-4">
                <div>
                  <Label htmlFor="cardNumber">カード番号</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">カード名義</Label>
                  <Input
                    id="cardName"
                    placeholder="TARO YAMADA"
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">有効期限 (MM/YY)</Label>
                    <Input
                      id="expiry"
                      placeholder="12/25"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">セキュリティコード</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                  お支払い情報は安全に暗号化されます
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessing}
            >
              キャンセル
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
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
                'お支払いを完了する'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // 現在のサブスクリプション情報を表示
  const renderCurrentSubscription = () => {
    if (!currentSubscription) return null;

    const isActive = currentSubscription.status === 'active';
    const currentPlanDetails = [...plans.monthly, ...plans.yearly].find(
      (p) => p.id === currentSubscription.planId
    );
    const expireDate = new Date(currentSubscription.currentPeriodEnd);
    const daysLeft = Math.max(
      0,
      Math.ceil((expireDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );
    const percentLeft = Math.min(100, Math.max(0, (daysLeft / 30) * 100));

    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>現在のサブスクリプション</span>
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {isActive ? '有効' : '無効'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {currentPlanDetails?.name || currentSubscription.planId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>次回の更新日: {expireDate.toLocaleDateString('ja-JP')}</span>
                <span>{daysLeft}日後</span>
              </div>
              <Progress value={percentLeft} className="h-2" />
            </div>

            {currentSubscription.cancelAtPeriodEnd && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>自動更新が停止されています</AlertTitle>
                <AlertDescription>
                  {expireDate.toLocaleDateString('ja-JP')}
                  に有効期限が切れると、アクセスできなくなります。
                </AlertDescription>
              </Alert>
            )}

            {!isActive && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>サブスクリプションが無効です</AlertTitle>
                <AlertDescription>
                  プレミアム機能にアクセスするには、サブスクリプションを更新してください。
                </AlertDescription>
              </Alert>
            )}

            {currentSubscription.planId !== 'free' && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePlanSelect('free')}
                  disabled={isProcessing}
                >
                  ダウングレード
                </Button>
                <Button
                  variant={currentSubscription.cancelAtPeriodEnd ? 'default' : 'outline'}
                  onClick={async () => {
                    try {
                      setIsProcessing(true);
                      await userSubscriptionApi.updateUserSubscription(currentSubscription._id, {
                        cancelAtPeriodEnd: !currentSubscription.cancelAtPeriodEnd,
                      });
                      // 最新のサブスクリプション情報を再取得
                      const response = await userSubscriptionApi.getUserSubscription(
                        user?.id || ''
                      );
                      setCurrentSubscription(response.data);
                      toast.success(
                        currentSubscription.cancelAtPeriodEnd
                          ? '自動更新が有効になりました'
                          : '次回の更新日以降、自動更新が停止されます'
                      );
                    } catch (error) {
                      console.error('自動更新設定エラー:', error);
                      toast.error('設定の更新に失敗しました');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                >
                  {currentSubscription.cancelAtPeriodEnd
                    ? '自動更新を有効にする'
                    : '自動更新を停止する'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ログインが必要です</AlertTitle>
          <AlertDescription>
            サブスクリプションを管理するには、まずログインしてください。
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate('/login')}
            >
              ログインページへ
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">サブスクリプションプラン</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          あなたのニーズに合ったプランを選択して、すべての機能をお楽しみください。
          いつでもプランの変更や解約が可能です。
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {renderCurrentSubscription()}

          <Tabs
            value={interval}
            onValueChange={(value) => setInterval(value as 'monthly' | 'yearly')}
            className="w-full mb-8"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="monthly">月間プラン</TabsTrigger>
              <TabsTrigger value="yearly">年間プラン (お得)</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="mt-6">
              {renderPlans()}
            </TabsContent>

            <TabsContent value="yearly" className="mt-6">
              {renderPlans()}
            </TabsContent>
          </Tabs>

          <div className="mt-16 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">よくある質問</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">プランはいつでも変更できますか？</h3>
                <p className="text-gray-600">
                  はい、いつでもプランの変更が可能です。アップグレードの場合は即時反映され、ダウングレードの場合は現在の請求期間の終了時に反映されます。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">支払い方法は何がありますか？</h3>
                <p className="text-gray-600">
                  現在はクレジットカード決済に対応しています。近日中に銀行振込やその他の決済方法にも対応予定です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">解約はどうすればいいですか？</h3>
                <p className="text-gray-600">
                  アカウント設定から簡単に解約手続きができます。解約後も現在の請求期間の終了まではプレミアム機能を利用できます。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">年間プランのメリットは何ですか？</h3>
                <p className="text-gray-600">
                  年間プランは月額換算で約16%お得になります。また、価格改定があった場合でも、契約期間中は料金が変わりません。
                </p>
              </div>
            </div>
          </div>

          {renderPaymentDialog()}
        </>
      )}
    </div>
  );
}
