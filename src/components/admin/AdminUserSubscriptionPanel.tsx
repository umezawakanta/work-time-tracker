import React, { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PublicUser } from '@/types/admin';
import type { UserSubscription, Invoice } from '@/types';
import {
  getUserSubscription,
  updateUserSubscription,
  createUserSubscription,
  updateAutoRenewal,
  cancelSubscription,
  reactivateSubscription,
  getInvoiceHistory,
} from '@/services/api/userSubscriptionApi';
import { CalendarDays, CreditCard, RefreshCw, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  user: PublicUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminUserSubscriptionPanel: React.FC<Props> = ({ user, open, onOpenChange }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [planInput, setPlanInput] = useState<string>('basic-monthly');

  const load = async () => {
    try {
      setLoading(true);
      const s = await getUserSubscription(user._id);
      setSub(s || null);
      try {
        const list = await getInvoiceHistory(user._id);
        setInvoices(Array.isArray(list) ? list : []);
      } catch {
        setInvoices([]);
      }
    } catch {
      setSub(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?._id]);

  const renewDate = useMemo(() => {
    if (!sub?.currentPeriodEnd) return null;
    try {
      const d = new Date(sub.currentPeriodEnd);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('ja-JP');
    } catch {
      return null;
    }
  }, [sub?.currentPeriodEnd]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      const created = await createUserSubscription({
        userId: user._id,
        planId: planInput || 'basic-monthly',
        status: 'active',
        currentPeriodEnd: new Date(now + 30 * 24 * 3600 * 1000),
        cancelAtPeriodEnd: false,
      });
      setSub(created);
      toast.success('サブスクリプションを作成しました');
    } catch {
      toast.error('作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!sub) return;
    try {
      setLoading(true);
      const updated = await updateUserSubscription(sub._id, { planId: planInput });
      setSub(updated);
      toast.success('プランを更新しました');
    } catch {
      toast.error('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!sub) return;
    try {
      setLoading(true);
      const next = !(sub.cancelAtPeriodEnd ?? false);
      const updated = await updateAutoRenewal(sub._id, next);
      setSub(updated);
      toast.success(next ? '次回更新で解約予定にしました' : '自動更新を再開しました');
    } catch {
      toast.error('自動更新の変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNow = async () => {
    if (!sub) return;
    try {
      setLoading(true);
      const updated = await cancelSubscription(sub._id, 'admin_action');
      setSub(updated);
      toast.success('即時解約しました');
    } catch {
      toast.error('解約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!sub) return;
    try {
      setLoading(true);
      const updated = await reactivateSubscription(sub._id);
      setSub(updated);
      toast.success('再開しました');
    } catch {
      toast.error('再開に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>サブスクリプション管理</SheetTitle>
          <SheetDescription>
            {user.email}（{user.name || '—'}）のサブスクリプション状態を管理します
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>現在の状態</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!sub ? (
                <Alert>
                  <AlertTitle>未加入</AlertTitle>
                  <AlertDescription>
                    このユーザーにはサブスクリプションがありません。作成して有効化できます。
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-sm text-gray-700">
                  <div>
                    状態: <Badge>{sub.status}</Badge>
                  </div>
                  <div className="mt-1">プラン: {sub.planId}</div>
                  {renewDate ? (
                    <div className="mt-1 flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" /> 次回請求日: {renewDate}
                    </div>
                  ) : null}
                  {sub.cancelAtPeriodEnd ? (
                    <div className="mt-1 flex items-center gap-1 text-orange-700">
                      <XCircle className="w-4 h-4" /> 解約予定: 次回更新日に終了
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="w-4 h-4" /> 自動更新: 有効
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!sub ? (
                <div className="space-y-2">
                  <label className="block text-sm">プランID</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={planInput}
                    onChange={(e) => setPlanInput(e.target.value)}
                    placeholder="basic-monthly など"
                  />
                  <Button onClick={handleCreate} disabled={loading} className="w-full">
                    作成して有効化
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={planInput}
                      onChange={(e) => setPlanInput(e.target.value)}
                      placeholder="新しいプランID"
                      aria-label="プランID"
                    />
                    <Button variant="outline" onClick={handleUpdatePlan} disabled={loading}>
                      変更
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleToggleAutoRenew} disabled={loading}>
                      {sub.cancelAtPeriodEnd ? '自動更新を再開' : '次回で解約予定にする'}
                    </Button>
                    <Button variant="destructive" onClick={handleCancelNow} disabled={loading}>
                      即時解約
                    </Button>
                    <Button variant="default" onClick={handleReactivate} disabled={loading}>
                      再開
                    </Button>
                    <Button variant="outline" onClick={() => void load()} disabled={loading}>
                      <RefreshCw className="w-4 h-4 mr-1" /> 再読込
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> 請求履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!invoices || invoices.length === 0 ? (
                <div className="text-sm text-gray-500">請求履歴はありません</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {invoices.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {new Date(inv.periodStart).toLocaleDateString('ja-JP')} –{' '}
                          {new Date(inv.periodEnd).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="text-gray-600">
                          {inv.amount.toLocaleString()} {inv.currency.toUpperCase()} ・{' '}
                          {inv.paymentMethod.type} •••• {inv.paymentMethod.lastFour}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4 mr-1" /> 領収書
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminUserSubscriptionPanel;
