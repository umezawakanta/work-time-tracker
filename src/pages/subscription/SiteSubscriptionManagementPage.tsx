import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import subscriptionGatewayApi, {
  type SubscriptionStatusResponse,
} from '@/services/api/subscriptionGatewayApi';
import { getInvoiceHistory } from '@/services/api/userSubscriptionApi';
import { toast } from 'react-hot-toast';
import { CreditCard, CalendarDays, ExternalLink, ArrowRight } from 'lucide-react';

const SiteSubscriptionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

  const fetchStatus = async (): Promise<void> => {
    try {
      setStatusLoading(true);
      const data = await subscriptionGatewayApi.getSubscriptionStatus();
      setStatus(data);
    } catch {
      // silent in dev
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchInvoices = async (): Promise<void> => {
    try {
      const invoices = await getInvoiceHistory('me');
      setInvoiceCount(Array.isArray(invoices) ? invoices.length : 0);
    } catch {
      setInvoiceCount(0);
    }
  };

  useEffect(() => {
    void fetchStatus();
    void fetchInvoices();
  }, []);

  const openPortal = async (): Promise<void> => {
    try {
      setLoading(true);
      const { url } = await subscriptionGatewayApi.openPortal();
      if (typeof window !== 'undefined' && url.startsWith(window.location.origin)) {
        navigate(url.replace(window.location.origin, ''));
      } else {
        window.location.assign(url);
      }
    } catch {
      toast.error('ポータルの起動に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const cancelAtPeriodEnd = async (): Promise<void> => {
    try {
      setLoading(true);
      await subscriptionGatewayApi.cancelSubscriptionGateway({ atPeriodEnd: true });
      toast.success('次回更新日で解約予定になりました');
      void fetchStatus();
    } catch {
      toast.error('解約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">サイトのサブスクリプション管理</h1>
          <p className="text-gray-600 mt-2">このサイトのプラン、支払い方法、請求履歴を管理します</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/subscription')}>
          料金プランへ
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">現在のステータス</CardTitle>
          <CardDescription>
            {statusLoading ? (
              '読み込み中...'
            ) : status?.status ? (
              <span>
                状態: <Badge>{status.status}</Badge>
                {status.renewAt ? (
                  <span className="ml-3 text-gray-600">
                    次回請求日: {new Date(status.renewAt).toLocaleDateString('ja-JP')}
                  </span>
                ) : null}
                {status.atPeriodEnd ? (
                  <span className="ml-3 text-orange-600">解約予定: 次回更新日に終了</span>
                ) : null}
                {status.card ? (
                  <span className="ml-3 text-gray-600">
                    カード: {status.card.brand.toUpperCase()} •••• {status.card.last4}
                  </span>
                ) : null}
              </span>
            ) : (
              '未加入'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openPortal} disabled={loading}>
            支払い情報を管理（ポータル）
          </Button>
          <Button variant="outline" onClick={cancelAtPeriodEnd} disabled={loading}>
            解約（次回以降）
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/billing-history')}
            className="inline-flex items-center"
          >
            請求履歴 {invoiceCount !== null ? `(${invoiceCount})` : ''}
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> 支払い方法
          </CardTitle>
          <CardDescription>カード情報や請求先の更新はポータルから行えます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status?.card ? (
            <div className="text-gray-700">
              現在のカード: {status.card.brand.toUpperCase()} •••• {status.card.last4}
            </div>
          ) : (
            <Alert>
              <AlertTitle>カード未登録</AlertTitle>
              <AlertDescription>
                お支払い方法が未設定です。「ポータルを開く」からカードを登録してください。
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={openPortal} disabled={loading} className="inline-flex items-center">
            ポータルを開く
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSubscriptionManagementPage;
