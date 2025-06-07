// src/components/subscription/SubscriptionManagement.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService } from '@/types';
import subscriptionApi from '@/services/api/subscriptionApi';
import { formatBillingDate, isValidDateFormat, convertDateStringToNumber } from '@/utils/dateUtils';
import SubscriptionList from '@/components/subscription/SubscriptionList'; // 追加: SubscriptionListをインポート

// サブスクリプション追加・編集フォーム用の型
interface SubscriptionFormData {
  name: string;
  billingDate: string;
  type: string;
  amount: string;
  paymentMethod?: 'credit' | 'bank' | 'paypal' | 'apple' | 'google';
  bankAccount?: string;
  isActive: boolean;
}

// 有効な支払い方法の型
type ValidPaymentMethod = 'credit' | 'bank' | 'paypal' | 'apple' | 'google';

// 空のフォームデータ
const emptyFormData: SubscriptionFormData = {
  name: '',
  billingDate: '',
  amount: '',
  type: '',
  paymentMethod: 'credit', // 明示的に設定
  bankAccount: '',
  isActive: true,
};

// 支払い方法オプション
const paymentMethodOptions = [
  { value: 'credit', label: 'クレジットカード' },
  { value: 'bank', label: '銀行引き落とし' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'apple', label: 'Apple Pay' },
  { value: 'google', label: 'Google Pay' },
];

// サービスタイプオプション
const serviceTypeOptions = [
  { value: 'エンターテイメント', label: 'エンターテイメント' },
  { value: '音楽', label: '音楽' },
  { value: '動画', label: '動画ストリーミング' },
  { value: 'ゲーム', label: 'ゲーム' },
  { value: 'クラウドストレージ', label: 'クラウドストレージ' },
  { value: 'ソフトウェア', label: 'ソフトウェア' },
  { value: 'ニュース', label: 'ニュース/雑誌' },
  { value: '食品', label: '食品/ミールキット' },
  { value: '美容', label: '美容/ヘルスケア' },
  { value: 'その他', label: 'その他' },
];

const SubscriptionManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ステート
  const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionService[]>([]);
  const [totalMonthly, setTotalMonthly] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SubscriptionFormData>(emptyFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isValidationError, setIsValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showBankAccount, setShowBankAccount] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('この機能を利用するにはログインが必要です');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate]);

  // データ取得
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionApi.getAll();
      const subscriptionsData = response.data.subscriptions;
      setSubscriptions(subscriptionsData);

      // 月額合計金額の計算
      const total = subscriptionsData
        .filter((sub) => sub.isActive)
        .reduce((sum, sub) => sum + sub.amount, 0);
      setTotalMonthly(total);
    } catch (error) {
      console.error('データ取得エラー:', error);
      toast.error('サブスクリプション情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchData();
  }, []);

  // フィルタリング
  useEffect(() => {
    let filtered = [...subscriptions];

    // アクティブ状態でフィルター
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      filtered = filtered.filter((sub) => sub.isActive === isActive);
    }

    // タイプでフィルター
    if (typeFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.type === typeFilter);
    }

    // 検索クエリでフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) => sub.name.toLowerCase().includes(query));
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, activeFilter, typeFilter, searchQuery]);

  // フォームデータの検証
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setValidationMessage('サービス名を入力してください');
      setIsValidationError(true);
      return false;
    }

    if (!formData.billingDate.trim()) {
      setValidationMessage('請求日を入力してください');
      setIsValidationError(true);
      return false;
    }

    // 日付形式のバリデーション（YYYY/MM/DD形式が望ましい）
    if (formData.billingDate.includes('/') && !isValidDateFormat(formData.billingDate)) {
      setValidationMessage('請求日は YYYY/MM/DD 形式で入力してください');
      setIsValidationError(true);
      return false;
    }

    if (!formData.amount.trim() || isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      setValidationMessage('有効な金額を入力してください');
      setIsValidationError(true);
      return false;
    }

    if (formData.paymentMethod === 'bank' && !formData.bankAccount?.trim()) {
      setValidationMessage('銀行口座情報を入力してください');
      setIsValidationError(true);
      return false;
    }

    setIsValidationError(false);
    return true;
  };

  // 保存処理
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // billingDateを数値型に変換
      let numericBillingDate: number;
      if (formData.billingDate.includes('/')) {
        numericBillingDate = convertDateStringToNumber(formData.billingDate);
      } else {
        // 数値型に変換できない場合は現在日付を使用
        numericBillingDate =
          parseInt(formData.billingDate, 10) ||
          convertDateStringToNumber(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
      }

      const subscriptionData = {
        name: formData.name,
        billingDate: numericBillingDate,
        type: formData.type || 'その他', // デフォルト値を設定
        amount: Number(formData.amount),
        paymentMethod: {
          type: formData.paymentMethod as ValidPaymentMethod,
          isDefault: true,
        },
        bankAccount: formData.paymentMethod === 'bank' ? formData.bankAccount : undefined,
        isActive: Boolean(formData.isActive), // Booleanで確実に変換
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      };

      if (editingId) {
        // 更新
        await subscriptionApi.update(editingId, subscriptionData);
        toast.success('サブスクリプション情報を更新しました');
      } else {
        // 新規作成
        await subscriptionApi.create(subscriptionData);
        toast.success('サブスクリプションを追加しました');
      }

      // フォームをリセット
      resetForm();
      // データ再取得
      fetchData();
    } catch (error) {
      console.error('保存エラー:', error);
      toast.error('サブスクリプションの保存に失敗しました');
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await subscriptionApi.delete(deleteId);
      toast.success('サブスクリプションを削除しました');

      // 削除後のデータ再取得
      fetchData();
      // ダイアログを閉じる
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('削除エラー:', error);
      toast.error('サブスクリプションの削除に失敗しました');
    }
  };

  // paymentMethodの型アサーション関数を定義
  function ensureValidPaymentMethod(method: string): ValidPaymentMethod {
    // 有効な支払い方法の配列
    const validMethods: ValidPaymentMethod[] = ['credit', 'bank', 'paypal', 'apple', 'google'];

    // 値が有効なリストに含まれるかチェック
    return validMethods.includes(method as ValidPaymentMethod)
      ? (method as ValidPaymentMethod)
      : 'credit';
  }

  // 編集開始
  const handleEdit = (subscription: SubscriptionService) => {
    // billingDateを適切な形式に変換
    const formattedBillingDate = formatBillingDate(subscription.billingDate);

    // フォームデータの設定
    setFormData({
      name: subscription.name,
      billingDate: formattedBillingDate,
      type: subscription.type,
      amount: subscription.amount.toString(),
      paymentMethod:
        typeof subscription.paymentMethod === 'object'
          ? ensureValidPaymentMethod(subscription.paymentMethod.type)
          : ensureValidPaymentMethod(subscription.paymentMethod || 'credit'),
      bankAccount: subscription.bankAccount || '',
      isActive: subscription.isActive,
    });

    setEditingId(subscription._id);
    setIsFormOpen(true);

    const paymentType =
      typeof subscription.paymentMethod === 'object'
        ? subscription.paymentMethod?.type
        : subscription.paymentMethod;

    if (paymentType === 'bank') {
      setShowBankAccount(true);
    }
  };

  // フォームリセット
  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setIsFormOpen(false);
    setIsValidationError(false);
    setShowBankAccount(false);
  };

  // 支払い方法の変更処理
  const handlePaymentMethodChange = (value: ValidPaymentMethod) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
    }));

    setShowBankAccount(value === 'bank');
  };

  // タイプオプションの取得
  const getUniqueTypes = () => {
    const types = new Set(subscriptions.map((sub) => sub.type));
    return Array.from(types);
  };

  // 削除ハンドラを追加（SubscriptionListから呼び出されるようにする）
  const handleSubscriptionDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">サブスクリプション管理</h1>
          <p className="text-gray-500 mt-1">各種サブスクリプションの管理と費用確認</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            新規追加
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">総サブスクリプション数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : filteredSubscriptions.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              有効: {filteredSubscriptions.filter((sub) => sub.isActive).length} / 無効:{' '}
              {filteredSubscriptions.filter((sub) => !sub.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">月額合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? <Skeleton className="h-8 w-24" /> : `¥${totalMonthly.toLocaleString()}`}
            </div>
            <p className="text-sm text-gray-500 mt-1">有効なサブスクリプションのみ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">更新予定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                filteredSubscriptions.filter((sub) => {
                  const expireDate = new Date(sub.expiresAt);
                  const now = new Date();
                  const diffTime = expireDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7 && sub.isActive;
                }).length
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">7日以内に更新予定</p>
          </CardContent>
        </Card>
      </div>

      {/* フィルターと検索 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="サブスクリプションを検索..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="inactive">無効</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="サービスタイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのタイプ</SelectItem>
                {getUniqueTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* サブスクリプション一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>サブスクリプション一覧</CardTitle>
          <CardDescription>登録済みの全てのサブスクリプションサービス</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // ローディング状態
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            // データなし
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">サブスクリプションがありません</h3>
              <p className="text-gray-500 mt-2">サブスクリプションを追加して管理を始めましょう</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                新規追加
              </Button>
            </div>
          ) : (
            // ここでSubscriptionListコンポーネントを使用
            <SubscriptionList
              subscriptions={filteredSubscriptions}
              onEdit={handleEdit}
              onDelete={handleSubscriptionDelete} // 削除ハンドラを渡す
            />
          )}
        </CardContent>
      </Card>

      {/* サブスクリプション追加/編集フォーム */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'サブスクリプションの編集' : '新規サブスクリプション'}
            </DialogTitle>
            <DialogDescription>
              サブスクリプションサービスの情報を入力してください。
            </DialogDescription>
          </DialogHeader>

          {isValidationError && (
            <div className="bg-red-50 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{validationMessage}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">サービス名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: Netflix"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billingDate">請求日 *</Label>
              <Input
                id="billingDate"
                value={formData.billingDate}
                onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                placeholder="例: 2024/01/15"
              />
              <p className="text-xs text-gray-500">YYYY/MM/DD形式で入力してください</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">サービスタイプ</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">月額料金 (円) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="例: 1490"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">支払い方法</Label>
              <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="支払い方法を選択" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value as ValidPaymentMethod}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showBankAccount && (
              <div className="grid gap-2">
                <Label htmlFor="bankAccount">銀行口座情報</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="例: みずほ銀行 渋谷支店 普通1234567"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">有効にする</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>サブスクリプションの削除</AlertDialogTitle>
            <AlertDialogDescription>
              このサブスクリプションを本当に削除しますか？この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionManagement;
