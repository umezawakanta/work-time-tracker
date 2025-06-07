import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Download, FileText, Receipt } from 'lucide-react';

interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'failed';
  periodStart: Date;
  periodEnd: Date;
  paymentMethod: {
    type: string;
    lastFour: string;
  };
  createdAt: Date;
}

interface PaymentMethod {
  type: string;
  lastFour?: string;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: PaymentMethod;
}

interface RawInvoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'failed';
  periodStart: string;
  periodEnd: string;
  paymentMethod: {
    type: string;
    lastFour: string;
  };
  createdAt: string;
}

export default function BillingHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);

          // サブスクリプション情報を取得
          const subscriptionResponse = await userSubscriptionApi.getUserSubscription(user.id);
          setSubscription(subscriptionResponse.data);

          // 支払い方法情報は通常はサブスクリプション情報の一部
          if (subscriptionResponse.data && subscriptionResponse.data.paymentMethod) {
            setPaymentMethod(subscriptionResponse.data.paymentMethod);
          }

          // 請求履歴を取得
          const invoiceResponse = await userSubscriptionApi.getInvoiceHistory(user.id);
          // 日付をDate型に変換
          const formattedInvoices = invoiceResponse.map((invoice: RawInvoice) => ({
            ...invoice,
            periodStart: new Date(invoice.periodStart),
            periodEnd: new Date(invoice.periodEnd),
            createdAt: new Date(invoice.createdAt),
          }));
          setInvoices(formattedInvoices);
        } catch (error) {
          console.error('請求情報取得エラー:', error);
          toast.error('請求情報の取得に失敗しました');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [isAuthenticated, user]);

  // 支払い方法の表示
  const renderPaymentMethod = () => {
    if (!paymentMethod) return '登録されていません';

    if (paymentMethod.type === 'credit_card') {
      return (
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          <span>クレジットカード •••• {paymentMethod.lastFour}</span>
        </div>
      );
    }

    return paymentMethod.type;
  };

  // 請求書のステータスに応じたバッジを表示
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">支払い済み</Badge>;
      case 'unpaid':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            未払い
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">失敗</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 金額のフォーマット
  const formatCurrency = (amount: number, currency: string = 'jpy') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // 日付のフォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>請求履歴</CardTitle>
            <CardDescription>請求履歴を表示するにはログインが必要です。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/login')}>ログイン</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">請求と支払い</h1>

      <Tabs defaultValue="history">
        <TabsList className="mb-8">
          <TabsTrigger value="history">請求履歴</TabsTrigger>
          <TabsTrigger value="payment">支払い方法</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>請求履歴</CardTitle>
              <CardDescription>過去の請求書と支払い記録</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell>
                          {subscription && (
                            <>
                              {subscription.planId.includes('premium')
                                ? 'プレミアムプラン'
                                : subscription.planId}
                              <div className="text-xs text-gray-500">
                                {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                              </div>
                            </>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" title="請求書をダウンロード">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>請求履歴はありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>支払い方法</CardTitle>
              <CardDescription>登録済みの支払い方法と管理</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">現在の支払い方法</h3>
                    <div className="text-sm text-gray-700">{renderPaymentMethod()}</div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      支払い方法を変更
                    </Button>
                    <Button variant="ghost" className="w-full sm:w-auto">
                      請求先住所を編集
                    </Button>
                  </div>

                  {subscription && subscription.planId !== 'free' && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">次回の請求</h3>
                      <p className="text-sm text-gray-700">
                        {subscription.currentPeriodEnd && (
                          <>
                            {formatDate(new Date(subscription.currentPeriodEnd))}に
                            {subscription.planId.includes('premium')
                              ? 'プレミアムプラン'
                              : subscription.planId}
                            の料金が請求されます。
                          </>
                        )}
                      </p>

                      {subscription.cancelAtPeriodEnd && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                          このサブスクリプションは自動更新が停止されており、次回の請求日以降は課金されません。
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-bold mb-4">請求書のエクスポート</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-sm font-medium text-gray-900">すべての請求書をダウンロード</h3>
                <p className="text-sm text-gray-500">
                  過去のすべての請求書をCSV形式でダウンロードします
                </p>
              </div>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                CSVでダウンロード
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
