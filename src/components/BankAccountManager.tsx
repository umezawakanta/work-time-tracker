import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  CheckCircle,
  AlertCircle,
  CreditCard,
  PiggyBank,
  Clock,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bankAPIService, BankAccountBalance } from '@/services/bank/BankAPIService';

interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'time_deposit' | 'credit_card';
  accountNumber: string;
  branchName?: string;
  accountName: string;
  isMain: boolean;
  isActive: boolean;
  lastBalance?: number;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

interface BankAccountManagerProps {
  userId: string;
  onAccountChange?: () => void;
}

const BankAccountManager: React.FC<BankAccountManagerProps> = ({ userId, onAccountChange }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiBalances, setApiBalances] = useState<BankAccountBalance[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'checking' as const,
    accountNumber: '',
    branchName: '',
    accountName: '',
    isMain: false,
  });

  // 銀行口座一覧を取得
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/bank-accounts?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setAccounts(data.data);
      } else {
        toast.error('銀行口座の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('銀行口座の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    checkLastSyncTime();

    // 初期化時に銀行口座データを同期
    syncBankData();
  }, [userId]);

  // 最後の同期時刻を確認
  const checkLastSyncTime = () => {
    const lastSync = bankAPIService.getLastSyncTime(userId);
    setLastSyncTime(lastSync);
  };

  // 銀行APIから口座データを同期
  const syncBankData = async () => {
    setIsSyncing(true);
    try {
      // 銀行口座APIからデータを取得
      const response = await fetch(`/api/bank-accounts?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        // 取得した口座データを表示用に変換
        const bankBalances = data.data
          .filter((account: any) => account.isActive && account.lastBalance)
          .map((account: any) => ({
            accountId: account._id,
            accountName: account.accountName,
            bankName: account.bankName,
            balance: account.lastBalance,
            currency: 'JPY',
            lastUpdated: account.lastUpdated,
            accountType: account.accountType,
          }));

        setApiBalances(bankBalances);
        setLastSyncTime(new Date().toISOString());
        setAccounts(data.data);

        toast.success(`${bankBalances.length}件の口座データを同期しました`);
      } else {
        throw new Error('Failed to fetch bank data');
      }
    } catch (error) {
      console.error('銀行データ同期エラー:', error);
      toast.error('銀行データの同期に失敗しました');
    } finally {
      setIsSyncing(false);
    }
  };

  // 自動同期の有効化/無効化
  const toggleAutoSync = (enabled: boolean) => {
    if (enabled) {
      bankAPIService.enableAutoSync(userId, 60); // 60分間隔
      toast.success('自動同期を有効にしました（60分間隔）');
    } else {
      bankAPIService.disableAutoSync(userId);
      toast.success('自動同期を無効にしました');
    }
  };

  // フォームをリセット
  const resetForm = () => {
    setFormData({
      bankName: '',
      accountType: 'checking',
      accountNumber: '',
      branchName: '',
      accountName: '',
      isMain: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  // 銀行口座を追加・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      toast.error('必須項目を入力してください');
      return;
    }

    try {
      const url = editingId
        ? `/api/bank-accounts/${editingId}?userId=${userId}`
        : `/api/bank-accounts?userId=${userId}`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? '銀行口座を更新しました' : '銀行口座を追加しました');
        resetForm();
        fetchAccounts();
        onAccountChange?.();
      } else {
        toast.error(data.message || '操作に失敗しました');
      }
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('保存中にエラーが発生しました');
    }
  };

  // 銀行口座を削除
  const handleDelete = async (accountId: string) => {
    if (!confirm('この銀行口座を削除しますか？')) return;

    try {
      const response = await fetch(`/api/bank-accounts/${accountId}?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('銀行口座を削除しました');
        fetchAccounts();
        onAccountChange?.();
      } else {
        toast.error(data.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error('削除中にエラーが発生しました');
    }
  };

  // 編集モードを開始
  const startEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      branchName: account.branchName || '',
      accountName: account.accountName,
      isMain: account.isMain,
    });
    setEditingId(account._id);
    setIsAdding(true);
  };

  // 口座種別のアイコンを取得
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-4 w-4" />;
      case 'savings':
        return <PiggyBank className="h-4 w-4" />;
      case 'time_deposit':
        return <Clock className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  // 口座種別のラベルを取得
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return '普通預金';
      case 'savings':
        return '貯蓄預金';
      case 'time_deposit':
        return '定期預金';
      case 'credit_card':
        return 'クレジットカード';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">銀行口座管理</h2>
          <p className="text-gray-600">メイン銀行口座を登録・管理できます</p>
          {lastSyncTime && (
            <div className="text-sm text-gray-500">
              <p>最終同期: {new Date(lastSyncTime).toLocaleString()}</p>
              {localStorage.getItem(`bank_sync_${userId}`) &&
                JSON.parse(localStorage.getItem(`bank_sync_${userId}`) || '{}').isDemo && (
                  <p className="text-orange-600">※ デモデータを表示中</p>
                )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={syncBankData}
            disabled={isSyncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {isSyncing ? '同期中...' : 'データ同期'}
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            口座を追加
          </Button>
        </div>
      </div>

      {/* 追加・編集フォーム */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? '銀行口座を編集' : '新しい銀行口座を追加'}</CardTitle>
            <CardDescription>銀行口座の情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">銀行名 *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="例: 三菱UFJ銀行"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">口座種別 *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">普通預金</SelectItem>
                      <SelectItem value="savings">貯蓄預金</SelectItem>
                      <SelectItem value="time_deposit">定期預金</SelectItem>
                      <SelectItem value="credit_card">クレジットカード</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountNumber">口座番号 *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="例: 1234567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">支店名</Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="例: 本店"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="accountName">口座名 *</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="例: 田中太郎"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  className="h-4 w-4"
                  aria-label="メイン口座として設定"
                />
                <Label htmlFor="isMain" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  メイン口座として設定
                </Label>
              </div>

              {formData.isMain && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    メイン口座は「毎日20のこと」の「メイン銀行口座の入出金履歴を確認する」タスクで使用されます。
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit">{editingId ? '更新' : '追加'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 銀行口座一覧 */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                登録された銀行口座がありません
              </h3>
              <p className="text-gray-500 mb-4">
                メイン銀行口座を登録して、「毎日20のこと」のタスクを効率的に管理しましょう
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                最初の口座を追加
              </Button>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account._id} className={account.isMain ? 'ring-2 ring-blue-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{account.bankName}</h3>
                        {account.isMain && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            メイン
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {getAccountTypeLabel(account.accountType)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>口座番号: {account.accountNumber}</p>
                        {account.branchName && <p>支店名: {account.branchName}</p>}
                        <p>口座名: {account.accountName}</p>
                        {account.lastBalance !== undefined && (
                          <div className="space-y-1">
                            <p className="font-medium text-green-600">
                              最新残高: ¥{account.lastBalance.toLocaleString()}
                            </p>
                            {account.lastUpdated && (
                              <p className="text-xs text-gray-500">
                                更新: {new Date(account.lastUpdated).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* デモデータの表示 */}
      {apiBalances.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Building2 className="h-5 w-5" />
              同期された口座データ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiBalances.map((balance) => (
                <div
                  key={balance.accountId}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Building2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">
                        {balance.bankName} {balance.accountName}
                      </h4>
                      <p className="text-sm text-green-700">{balance.accountType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-900">
                      ¥{balance.balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      {new Date(balance.lastUpdated).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-green-600 mt-2">
                ※
                現在はデモデータを表示しています。実際の銀行API連携時は、これらのデータが実際の口座残高に置き換わります。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用方法の説明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">メイン口座の設定</h4>
              <p className="text-sm text-gray-600">
                メイン口座として設定すると、「毎日20のこと」の「メイン銀行口座の入出金履歴を確認する」タスクで使用されます。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1 bg-green-100 rounded-full">
              <Building2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">口座情報の管理</h4>
              <p className="text-sm text-gray-600">
                銀行名、口座種別、口座番号などの情報を登録・編集できます。残高情報は銀行データ取り込み機能で自動更新されます。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountManager;
