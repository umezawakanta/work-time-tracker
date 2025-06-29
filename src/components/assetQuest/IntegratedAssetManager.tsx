import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAssetEntries, addAssetEntry } from '@/store/assetSlice';
import { fetchDebtEntries, addDebtEntry } from '@/store/debtSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Coins,
  PlusCircle,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  Database,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { assetQuestIntegrationService } from '@/services/assetQuest/AssetQuestIntegrationService';
import { soundManager } from '@/utils/soundManager';
import { toast } from 'react-hot-toast';

interface IntegratedStats {
  totalAssetEntries: number;
  totalDebtEntries: number;
  lastSyncDate: string;
  autoSyncEnabled: boolean;
  questDataLoaded: boolean;
}

export const IntegratedAssetManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const assetStatus = useSelector((state: RootState) => state.asset.status);
  const debtStatus = useSelector((state: RootState) => state.debt.status);

  const [stats, setStats] = useState<IntegratedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'quick-add' | 'integration' | 'stats'>(
    'quick-add'
  );

  // 新規追加フォーム用の状態
  const [newAsset, setNewAsset] = useState({
    account: '',
    value: '',
    category: '',
  });
  const [newDebt, setNewDebt] = useState({
    account: '',
    value: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    initializeManager();
    loadIntegrationStats();

    // 統合サービスのイベントリスナー
    assetQuestIntegrationService.on('quest-data-synced', handleQuestDataSync);
    assetQuestIntegrationService.on('exp-gained', handleExpGained);

    return () => {
      assetQuestIntegrationService.off('quest-data-synced', handleQuestDataSync);
      assetQuestIntegrationService.off('exp-gained', handleExpGained);
    };
  }, []);

  const initializeManager = async () => {
    try {
      setLoading(true);

      // Redux storeからデータを取得
      if (assetStatus === 'idle') {
        dispatch(fetchAssetEntries());
      }
      if (debtStatus === 'idle') {
        dispatch(fetchDebtEntries());
      }

      // 統合サービスと強制同期
      await assetQuestIntegrationService.forceSync();
    } catch (error) {
      console.error('統合マネージャー初期化エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationStats = () => {
    const integrationStats = assetQuestIntegrationService.getIntegrationStats();
    setStats(integrationStats);
  };

  const handleQuestDataSync = (questData: any) => {
    console.log('🎮 クエストデータ同期完了:', questData);
    loadIntegrationStats();
    toast.success('資産データがクエストシステムと同期されました！');
  };

  const handleExpGained = (expEvent: any) => {
    console.log('⚡ 経験値獲得:', expEvent);
    toast.success(`${expEvent.description} (+${expEvent.amount} EXP)`);
    soundManager.playLevelUpSound();
  };

  const handleAddAsset = async () => {
    if (!newAsset.account || !newAsset.value) {
      toast.error('口座名と金額を入力してください');
      return;
    }

    try {
      setLoading(true);

      // 統合サービス経由で追加（Redux storeも自動更新される）
      await assetQuestIntegrationService.addAsset({
        date: new Date().toISOString().split('T')[0],
        value: parseFloat(newAsset.value),
        account: newAsset.account,
        category: newAsset.category || 'other',
      });

      // フォームをリセット
      setNewAsset({ account: '', value: '', category: '' });
      loadIntegrationStats();

      toast.success('資産が正常に追加されました！');
      soundManager.playButtonSound();
    } catch (error) {
      console.error('資産追加エラー:', error);
      toast.error('資産の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async () => {
    if (!newDebt.account || !newDebt.value || !newDebt.description) {
      toast.error('すべての項目を入力してください');
      return;
    }

    try {
      setLoading(true);

      // 統合サービス経由で追加
      await assetQuestIntegrationService.addDebt({
        date: new Date().toISOString().split('T')[0],
        value: parseFloat(newDebt.value),
        account: newDebt.account,
        description: newDebt.description,
        category: newDebt.category || 'other',
      });

      // フォームをリセット
      setNewDebt({ account: '', value: '', description: '', category: '' });
      loadIntegrationStats();

      toast.success('負債が正常に記録されました');
      soundManager.playButtonSound();
    } catch (error) {
      console.error('負債追加エラー:', error);
      toast.error('負債の記録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    try {
      setLoading(true);
      await assetQuestIntegrationService.forceSync();
      loadIntegrationStats();
      toast.success('同期が完了しました！');
      soundManager.playMessageCompleteSound();
    } catch (error) {
      console.error('強制同期エラー:', error);
      toast.error('同期に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoSync = () => {
    const newState = !stats?.autoSyncEnabled;
    assetQuestIntegrationService.setAutoSync(newState);
    loadIntegrationStats();
    toast.success(`自動同期を${newState ? '有効' : '無効'}にしました`);
    soundManager.playButtonSound();
  };

  const totalAssets = assetEntries.reduce((sum, entry) => sum + entry.value, 0);
  const totalDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);
  const netWorth = totalAssets - totalDebts;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🔗 統合資産管理システム
        </h1>
        <p className="text-gray-600">既存の資産管理とクエストシステムの統合ダッシュボード</p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">¥{totalAssets.toLocaleString()}</div>
            <div className="text-sm text-gray-600">総資産</div>
            <Badge variant="secondary" className="mt-1">
              {assetEntries.length} 項目
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">¥{totalDebts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">総負債</div>
            <Badge variant="secondary" className="mt-1">
              {debtEntries.length} 項目
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div
              className={`text-2xl font-bold ${netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
            >
              ¥{netWorth.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">純資産</div>
            <Badge variant={netWorth >= 0 ? 'default' : 'destructive'} className="mt-1">
              レベル {Math.max(1, Math.floor(netWorth / 10000))}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* メインタブ */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab as any}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-add" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            クイック追加
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            統合設定
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            統計情報
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-add" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 資産追加 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  資産追加
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="asset-account">口座・資産名</Label>
                  <Input
                    id="asset-account"
                    value={newAsset.account}
                    onChange={(e) => setNewAsset((prev) => ({ ...prev, account: e.target.value }))}
                    placeholder="例: 三菱UFJ銀行 普通預金"
                  />
                </div>
                <div>
                  <Label htmlFor="asset-value">金額</Label>
                  <Input
                    id="asset-value"
                    type="number"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="例: 1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="asset-category">カテゴリ</Label>
                  <Input
                    id="asset-category"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="例: cash, investment, realestate"
                  />
                </div>
                <Button onClick={handleAddAsset} disabled={loading} className="w-full">
                  {loading ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  資産を追加
                </Button>
              </CardContent>
            </Card>

            {/* 負債追加 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-600" />
                  負債記録
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="debt-account">負債名</Label>
                  <Input
                    id="debt-account"
                    value={newDebt.account}
                    onChange={(e) => setNewDebt((prev) => ({ ...prev, account: e.target.value }))}
                    placeholder="例: 住宅ローン"
                  />
                </div>
                <div>
                  <Label htmlFor="debt-value">金額</Label>
                  <Input
                    id="debt-value"
                    type="number"
                    value={newDebt.value}
                    onChange={(e) => setNewDebt((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="例: 25000000"
                  />
                </div>
                <div>
                  <Label htmlFor="debt-description">詳細</Label>
                  <Input
                    id="debt-description"
                    value={newDebt.description}
                    onChange={(e) =>
                      setNewDebt((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="例: 35年固定金利 1.5%"
                  />
                </div>
                <Button
                  onClick={handleAddDebt}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  負債を記録
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                統合システム設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 同期状態 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">自動同期</h3>
                  <p className="text-sm text-gray-600">Redux storeとクエストシステムの自動同期</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={stats?.autoSyncEnabled ? 'default' : 'secondary'}>
                    {stats?.autoSyncEnabled ? 'ON' : 'OFF'}
                  </Badge>
                  <Button onClick={handleToggleAutoSync} variant="outline" size="sm">
                    切り替え
                  </Button>
                </div>
              </div>

              {/* 手動同期 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">手動同期</h3>
                  <p className="text-sm text-gray-600">データを強制的に同期</p>
                </div>
                <Button onClick={handleForceSync} disabled={loading} variant="outline">
                  {loading ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  今すぐ同期
                </Button>
              </div>

              {/* 同期ステータス */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  最終同期: {stats ? new Date(stats.lastSyncDate).toLocaleString() : '不明'}
                  <br />
                  クエストデータ: {stats?.questDataLoaded ? '読み込み済み' : '未読み込み'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>データ統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>資産エントリー数:</span>
                  <Badge>{stats?.totalAssetEntries || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>負債エントリー数:</span>
                  <Badge>{stats?.totalDebtEntries || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>合計取引数:</span>
                  <Badge variant="outline">
                    {(stats?.totalAssetEntries || 0) + (stats?.totalDebtEntries || 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>統合ステータス</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {stats?.autoSyncEnabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span>自動同期: {stats?.autoSyncEnabled ? '有効' : '無効'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {stats?.questDataLoaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>クエストデータ: {stats?.questDataLoaded ? '同期済み' : '未同期'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
