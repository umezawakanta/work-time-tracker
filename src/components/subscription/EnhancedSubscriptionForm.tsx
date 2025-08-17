import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  AlertCircle,
  CreditCard,
  Loader2,
  Shield,
  Clock,
  Info,
  RefreshCw,
  ArrowRight,
  Lock,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    workHours: number;
    projects: number;
    tasks: number;
    reports: number;
    apiCalls: number;
    storage: number;
    teamMembers: number;
  };
  isPopular?: boolean;
  trialDays?: number;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface EnhancedSubscriptionFormProps {
  plans: SubscriptionPlan[];
  onSubscriptionCreate?: (subscription: any) => void;
  onError?: (error: any) => void;
}

const EnhancedSubscriptionForm: React.FC<EnhancedSubscriptionFormProps> = ({
  plans,
  onSubscriptionCreate,
  onError,
}) => {
  // 安全対策: plansのデフォルト値
  const safePlans: SubscriptionPlan[] = Array.isArray(plans) ? plans : [];
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [confirmationToken, setConfirmationToken] = useState('');

  // 決済ステップの定義
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([
    {
      id: 'validation',
      title: '入力内容の確認',
      description: 'プラン選択と支払い情報を検証しています',
      status: 'pending',
    },
    {
      id: 'customer',
      title: 'アカウント設定',
      description: '決済アカウントを準備しています',
      status: 'pending',
    },
    {
      id: 'subscription',
      title: 'サブスクリプション作成',
      description: 'サブスクリプションを作成しています',
      status: 'pending',
    },
    {
      id: 'payment',
      title: '決済処理',
      description: '決済を処理しています',
      status: 'pending',
    },
    {
      id: 'confirmation',
      title: '完了確認',
      description: 'サブスクリプションを有効化しています',
      status: 'pending',
    },
  ]);

  // エラー状態の管理
  const [error, setError] = useState<{
    code?: string;
    message: string;
    retryable: boolean;
    nextSteps: string[];
  } | null>(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    paymentMethodId: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'JP',
    },
  });

  // 確認トークンの生成
  useEffect(() => {
    if (selectedPlan) {
      setConfirmationToken(`conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [selectedPlan]);

  // ステップの更新
  const updateStep = useCallback(
    (stepId: string, status: PaymentStep['status'], error?: string) => {
      setPaymentSteps((prev) =>
        prev.map((step) => (step.id === stepId ? { ...step, status, error } : step))
      );
    },
    []
  );

  // 進捗の計算
  useEffect(() => {
    const completedSteps = paymentSteps.filter((step) => step.status === 'completed').length;
    const newProgress = (completedSteps / paymentSteps.length) * 100;
    setProgress(newProgress);
  }, [paymentSteps]);

  // プラン選択
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  // 決済処理の実行
  const processPayment = async () => {
    if (!selectedPlan || !user) {
      toast.error('プランまたはユーザー情報が不足しています');
      return;
    }

    setIsProcessing(true);
    setShowPaymentDialog(true);
    setCurrentStep(0);
    setError(null);

    // すべてのステップをリセット
    setPaymentSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending', error: undefined }))
    );

    try {
      // ステップ1: 入力検証
      updateStep('validation', 'processing');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!formData.cardNumber || !formData.expiryDate || !formData.cvc) {
        throw new Error('カード情報を正しく入力してください');
      }

      updateStep('validation', 'completed');

      // ステップ2: カスタマー作成
      updateStep('customer', 'processing');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStep('customer', 'completed');

      // ステップ3: サブスクリプション作成
      updateStep('subscription', 'processing');

      const subscriptionData = {
        planId: selectedPlan.id,
        billingCycle,
        confirmationToken,
        paymentMethodId: formData.paymentMethodId,
      };

      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'サブスクリプションの作成に失敗しました');
      }

      const result = await response.json();
      updateStep('subscription', 'completed');

      // ステップ4: 決済処理
      updateStep('payment', 'processing');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStep('payment', 'completed');

      // ステップ5: 確認
      updateStep('confirmation', 'processing');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStep('confirmation', 'completed');

      // 成功
      toast.success('サブスクリプションが正常に作成されました！');
      onSubscriptionCreate?.(result.data.subscription);

      // 成功ダイアログを表示
      setTimeout(() => {
        setShowPaymentDialog(false);
        setIsProcessing(false);
      }, 2000);
    } catch (error: any) {
      console.error('Payment processing error:', error);

      const errorInfo = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '予期しないエラーが発生しました',
        retryable: !['PLAN_NOT_FOUND', 'USER_NOT_FOUND', 'DUPLICATE_OPERATION'].includes(
          error.code
        ),
        nextSteps: getNextSteps(error.code, error.message),
      };

      setError(errorInfo);

      // 現在のステップをエラー状態に
      const currentStepId = paymentSteps.find((step) => step.status === 'processing')?.id;
      if (currentStepId) {
        updateStep(currentStepId, 'error', error.message);
      }

      onError?.(error);
      setIsProcessing(false);
    }
  };

  // エラーに基づく次のステップを提案
  const getNextSteps = (errorCode?: string, errorMessage?: string): string[] => {
    if (errorCode?.includes('CARD_DECLINED')) {
      return [
        '別のクレジットカードをお試しください',
        'カードの有効期限を確認してください',
        'カード会社に問い合わせください',
      ];
    }

    if (errorCode?.includes('INSUFFICIENT_FUNDS')) {
      return [
        'カードの残高を確認してください',
        '別の支払い方法を選択してください',
        'しばらく時間をおいてから再度お試しください',
      ];
    }

    if (errorCode?.includes('STRIPE_')) {
      return [
        'しばらく時間をおいてから再度お試しください',
        '別のブラウザでお試しください',
        'サポートにお問い合わせください',
      ];
    }

    return [
      'ページをリロードして再度お試しください',
      'ネットワーク接続を確認してください',
      '問題が続く場合はサポートにお問い合わせください',
    ];
  };

  // リトライ処理
  const handleRetry = () => {
    setError(null);
    setShowPaymentDialog(false);
    setTimeout(() => {
      processPayment();
    }, 500);
  };

  // プランカードのレンダリング
  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const monthlyPrice = plan.billingCycle === 'yearly' ? plan.price / 12 : plan.price;
    const yearlyDiscount =
      plan.billingCycle === 'yearly' ? Math.round((1 - plan.price / 12 / plan.price) * 100) : 0;

    return (
      <Card
        key={plan.id}
        className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300'
        } ${plan.isPopular ? 'border-blue-500' : ''}`}
        onClick={() => handlePlanSelect(plan)}
      >
        {plan.isPopular && (
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
            <Star className="w-3 h-3 mr-1" />
            人気プラン
          </Badge>
        )}

        <CardHeader className="text-center">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription className="text-sm">{plan.description}</CardDescription>

          <div className="mt-4">
            <div className="text-3xl font-bold">
              ¥{monthlyPrice.toLocaleString()}
              <span className="text-lg font-normal text-gray-600">/月</span>
            </div>
            {plan.billingCycle === 'yearly' && yearlyDiscount > 0 && (
              <div className="text-sm text-green-600 font-semibold">
                年間プランで{yearlyDiscount}%割引
              </div>
            )}
            {plan.trialDays && (
              <div className="text-sm text-blue-600 font-semibold">
                {plan.trialDays}日間無料トライアル
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-2 text-sm">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                作業時間:{' '}
                {plan.limits.workHours === -1 ? '無制限' : `${plan.limits.workHours}時間/月`}
              </div>
              <div>
                プロジェクト: {plan.limits.projects === -1 ? '無制限' : `${plan.limits.projects}個`}
              </div>
              <div>チームメンバー: {plan.limits.teamMembers}名</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 決済ダイアログのレンダリング
  const renderPaymentDialog = () => (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            サブスクリプション作成中
          </DialogTitle>
          <DialogDescription>
            {selectedPlan?.name}の決済を処理しています。このプロセスには数分かかる場合があります。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* プログレスバー */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>進捗</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* ステップ表示 */}
          <div className="space-y-3">
            {paymentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'processing'
                        ? 'bg-blue-500 text-white'
                        : step.status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : step.status === 'processing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      step.status === 'error' ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div
                    className={`text-sm ${
                      step.status === 'error' ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    {step.error || step.description}
                  </div>
                </div>

                {step.status === 'processing' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
            ))}
          </div>

          {/* エラー表示 */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-semibold mb-2">{error.message}</div>
                <div className="text-sm">
                  <div className="font-medium mb-1">次のステップ:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {error.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* セキュリティ情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2" />
              <span>すべての決済情報は暗号化され、安全に処理されます</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          {error && error.retryable && (
            <Button variant="outline" onClick={handleRetry} disabled={isProcessing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              再試行
            </Button>
          )}

          {!isProcessing && (
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              閉じる
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">サブスクリプションプラン</h1>
        <p className="text-lg text-gray-600">
          あなたに最適なプランを選択して、すべての機能をご利用ください
        </p>

        {/* 請求サイクル選択 */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
          >
            月額プラン
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
            className="relative"
          >
            年額プラン
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">割引</Badge>
          </Button>
        </div>
      </div>

      {/* プラン一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safePlans.filter((plan) => plan.billingCycle === billingCycle).map(renderPlanCard)}
      </div>

      {/* 選択されたプランの詳細 */}
      {selectedPlan && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              選択されたプラン: {selectedPlan.name}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">プラン詳細</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    月額料金: ¥
                    {(selectedPlan.billingCycle === 'yearly'
                      ? selectedPlan.price / 12
                      : selectedPlan.price
                    ).toLocaleString()}
                  </li>
                  <li>請求サイクル: {billingCycle === 'monthly' ? '月次' : '年次'}</li>
                  {selectedPlan.trialDays && <li>無料トライアル: {selectedPlan.trialDays}日間</li>}
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="min-w-32"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {selectedPlan.trialDays ? '無料トライアルを開始' : 'サブスクリプションを開始'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* セキュリティとサポート情報 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">安全な決済</div>
              <div className="text-gray-600">256bit SSL暗号化により、すべての決済情報を保護</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">いつでもキャンセル</div>
              <div className="text-gray-600">契約の縛りなし。いつでもキャンセル可能</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">24/7サポート</div>
              <div className="text-gray-600">お困りの際はいつでもサポートチームにお問い合わせ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 決済ダイアログ */}
      {renderPaymentDialog()}
    </div>
  );
};

export default EnhancedSubscriptionForm;
