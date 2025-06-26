import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  Activity,
  Database,
  RefreshCw,
  Zap,
  Globe,
  HardDrive,
  Signal,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// サービスのインポート（実際の実装時）
// import { advancedServiceWorkerService } from '@/services/pwa/AdvancedServiceWorkerService';
// import { offlineSyncService } from '@/services/pwa/OfflineSyncService';
// import { enhancedPushNotificationService } from '@/services/pwa/EnhancedPushNotificationService';

interface PWAStats {
  serviceWorker: {
    status: 'installing' | 'waiting' | 'active' | 'redundant';
    version: string;
    updateAvailable: boolean;
    cacheHitRate: number;
    totalCaches: number;
    cacheSize: string;
  };
  offlineSync: {
    isOnline: boolean;
    pendingOperations: number;
    syncInProgress: boolean;
    lastSyncAt: string;
    conflictCount: number;
    successRate: number;
  };
  pushNotifications: {
    subscribed: boolean;
    totalSent: number;
    deliveryRate: number;
    clickRate: number;
    activeSubscriptions: number;
  };
  performance: {
    loadTime: number;
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    cls: number; // Cumulative Layout Shift
    fid: number; // First Input Delay
  };
}

interface CacheInfo {
  name: string;
  size: string;
  entries: number;
  hitRate: number;
  strategy: string;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  status: 'pending' | 'syncing' | 'success' | 'failed';
  timestamp: string;
  retryCount: number;
}

interface NotificationCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  sent: number;
  clickRate: number;
  targetAudience: string;
}

const PWADashboard: React.FC = () => {
  const [stats, setStats] = useState<PWAStats | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    loadPWAData();
    const interval = setInterval(loadPWAData, 30000); // 30秒ごと更新
    return () => clearInterval(interval);
  }, []);

  /**
   * 📱 PWAデータ読み込み
   */
  const loadPWAData = async () => {
    try {
      // 実際の実装ではサービスからデータを取得
      const mockStats: PWAStats = {
        serviceWorker: {
          status: 'active',
          version: '1.2.0',
          updateAvailable: false,
          cacheHitRate: 87.5,
          totalCaches: 5,
          cacheSize: '15.2 MB',
        },
        offlineSync: {
          isOnline: navigator.onLine,
          pendingOperations: 3,
          syncInProgress: false,
          lastSyncAt: '2024-01-20T10:30:00Z',
          conflictCount: 0,
          successRate: 94.8,
        },
        pushNotifications: {
          subscribed: true,
          totalSent: 1247,
          deliveryRate: 96.2,
          clickRate: 23.5,
          activeSubscriptions: 1089,
        },
        performance: {
          loadTime: 1.2,
          fcp: 1.8,
          lcp: 2.3,
          cls: 0.05,
          fid: 15,
        },
      };

      const mockCacheInfo: CacheInfo[] = [
        {
          name: 'api-cache',
          size: '3.2 MB',
          entries: 156,
          hitRate: 92.1,
          strategy: 'Cache First',
        },
        {
          name: 'static-resources',
          size: '8.7 MB',
          entries: 423,
          hitRate: 89.4,
          strategy: 'Stale While Revalidate',
        },
        {
          name: 'images',
          size: '2.8 MB',
          entries: 89,
          hitRate: 95.6,
          strategy: 'Cache First',
        },
        {
          name: 'api-dynamic',
          size: '0.5 MB',
          entries: 34,
          hitRate: 76.3,
          strategy: 'Network First',
        },
      ];

      const mockSyncOperations: SyncOperation[] = [
        {
          id: 'op_1',
          type: 'create',
          resource: 'todos',
          status: 'pending',
          timestamp: '2024-01-20T10:45:00Z',
          retryCount: 0,
        },
        {
          id: 'op_2',
          type: 'update',
          resource: 'user-preferences',
          status: 'syncing',
          timestamp: '2024-01-20T10:44:30Z',
          retryCount: 1,
        },
        {
          id: 'op_3',
          type: 'delete',
          resource: 'todos',
          status: 'failed',
          timestamp: '2024-01-20T10:43:00Z',
          retryCount: 2,
        },
      ];

      const mockCampaigns: NotificationCampaign[] = [
        {
          id: 'camp_1',
          name: 'Daily Reminders',
          status: 'active',
          sent: 1205,
          clickRate: 28.3,
          targetAudience: 'Active Users',
        },
        {
          id: 'camp_2',
          name: 'Feature Updates',
          status: 'completed',
          sent: 892,
          clickRate: 15.7,
          targetAudience: 'All Users',
        },
      ];

      setStats(mockStats);
      setCacheInfo(mockCacheInfo);
      setSyncOperations(mockSyncOperations);
      setCampaigns(mockCampaigns);
      setPushEnabled(mockStats.pushNotifications.subscribed);
      setLoading(false);
    } catch (error) {
      console.error('PWAデータ読み込みエラー:', error);
      setLoading(false);
    }
  };

  /**
   * 🔄 ServiceWorker更新
   */
  const updateServiceWorker = async () => {
    try {
      // advancedServiceWorkerService.applyUpdate();

      toast({
        title: 'アプリ更新開始',
        description: '新しいバージョンをダウンロード中です',
        variant: 'default',
      });

      // リロード
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: '更新エラー',
        description: 'アプリの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🗑️ キャッシュクリア
   */
  const clearCache = async (cacheName?: string) => {
    try {
      // advancedServiceWorkerService.clearCache(cacheName);

      toast({
        title: 'キャッシュクリア',
        description: cacheName ? `${cacheName}をクリアしました` : '全キャッシュをクリアしました',
        variant: 'default',
      });

      await loadPWAData();
    } catch (error) {
      toast({
        title: 'キャッシュクリアエラー',
        description: 'キャッシュのクリアに失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🔄 手動同期実行
   */
  const performManualSync = async () => {
    try {
      // offlineSyncService.performSync(true);

      toast({
        title: '同期開始',
        description: 'データ同期を実行中です',
        variant: 'default',
      });

      await loadPWAData();
    } catch (error) {
      toast({
        title: '同期エラー',
        description: 'データ同期に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 📱 プッシュ通知設定
   */
  const togglePushNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        // enhancedPushNotificationService.subscribe('current-user');
        toast({
          title: 'プッシュ通知有効',
          description: '通知を受信します',
          variant: 'default',
        });
      } else {
        // enhancedPushNotificationService.unsubscribe('current-user');
        toast({
          title: 'プッシュ通知無効',
          description: '通知を停止しました',
          variant: 'default',
        });
      }

      setPushEnabled(enabled);
    } catch (error) {
      toast({
        title: '設定エラー',
        description: 'プッシュ通知設定の変更に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🎨 ステータス色取得
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'synced':
        return 'text-green-600';
      case 'pending':
      case 'syncing':
      case 'waiting':
        return 'text-yellow-600';
      case 'failed':
      case 'error':
      case 'redundant':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * 📊 パフォーマンススコア計算
   */
  const calculatePerformanceScore = (performance: PWAStats['performance']) => {
    // Core Web Vitals based scoring
    const lcpScore = performance.lcp < 2.5 ? 100 : performance.lcp < 4.0 ? 75 : 50;
    const fidScore = performance.fid < 100 ? 100 : performance.fid < 300 ? 75 : 50;
    const clsScore = performance.cls < 0.1 ? 100 : performance.cls < 0.25 ? 75 : 50;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p>PWAデータを読み込めませんでした</p>
      </div>
    );
  }

  const performanceScore = calculatePerformanceScore(stats.performance);

  return (
    <div className="space-y-6">
      {/* ヘッダー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">ServiceWorker</p>
                <p className={`text-lg font-bold ${getStatusColor(stats.serviceWorker.status)}`}>
                  {stats.serviceWorker.status === 'active' ? 'アクティブ' : 'インストール中'}
                </p>
                <p className="text-xs text-blue-600">v{stats.serviceWorker.version}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">オフライン同期</p>
                <p
                  className={`text-lg font-bold ${stats.offlineSync.isOnline ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stats.offlineSync.isOnline ? 'オンライン' : 'オフライン'}
                </p>
                <p className="text-xs text-green-600">
                  {stats.offlineSync.pendingOperations}件待機中
                </p>
              </div>
              {stats.offlineSync.isOnline ? (
                <Wifi className="h-8 w-8 text-green-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">プッシュ通知</p>
                <p
                  className={`text-lg font-bold ${pushEnabled ? 'text-green-600' : 'text-gray-600'}`}
                >
                  {pushEnabled ? '有効' : '無効'}
                </p>
                <p className="text-xs text-purple-600">
                  送信率: {stats.pushNotifications.deliveryRate}%
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">パフォーマンス</p>
                <p
                  className={`text-lg font-bold ${
                    performanceScore >= 90
                      ? 'text-green-600'
                      : performanceScore >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {performanceScore}点
                </p>
                <p className="text-xs text-orange-600">読み込み: {stats.performance.loadTime}s</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ServiceWorker更新通知 */}
      {stats.serviceWorker.updateAvailable && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">アプリの更新が利用可能です</p>
                  <p className="text-sm text-blue-700">新機能と改善が含まれています</p>
                </div>
              </div>
              <Button onClick={updateServiceWorker} size="sm">
                今すぐ更新
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* メインコンテンツ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="cache">キャッシュ</TabsTrigger>
          <TabsTrigger value="sync">同期</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* システム状態 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  システム状態
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ServiceWorker</span>
                    <Badge
                      variant={stats.serviceWorker.status === 'active' ? 'default' : 'secondary'}
                    >
                      {stats.serviceWorker.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">オフライン対応</span>
                    <Badge variant="default">有効</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">プッシュ通知</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={pushEnabled} onCheckedChange={togglePushNotifications} />
                      <Badge variant={pushEnabled ? 'default' : 'secondary'}>
                        {pushEnabled ? '有効' : '無効'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">自動同期</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                      <Badge variant={autoSync ? 'default' : 'secondary'}>
                        {autoSync ? '有効' : '無効'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 使用統計 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  使用統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>キャッシュヒット率</span>
                      <span>{stats.serviceWorker.cacheHitRate}%</span>
                    </div>
                    <Progress value={stats.serviceWorker.cacheHitRate} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>同期成功率</span>
                      <span>{stats.offlineSync.successRate}%</span>
                    </div>
                    <Progress value={stats.offlineSync.successRate} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>通知クリック率</span>
                      <span>{stats.pushNotifications.clickRate}%</span>
                    </div>
                    <Progress value={stats.pushNotifications.clickRate} />
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>総キャッシュサイズ: {stats.serviceWorker.cacheSize}</p>
                    <p>アクティブ購読者: {stats.pushNotifications.activeSubscriptions}</p>
                    <p>最終同期: {new Date(stats.offlineSync.lastSyncAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* キャッシュタブ */}
        <TabsContent value="cache">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">キャッシュ管理</h3>
              <Button onClick={() => clearCache()} variant="outline" size="sm">
                全キャッシュクリア
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cacheInfo.map((cache) => (
                <Card key={cache.name}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{cache.name}</CardTitle>
                      <Button onClick={() => clearCache(cache.name)} variant="ghost" size="sm">
                        クリア
                      </Button>
                    </div>
                    <CardDescription>{cache.strategy}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>サイズ</span>
                        <span className="font-medium">{cache.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>エントリー数</span>
                        <span className="font-medium">{cache.entries}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ヒット率</span>
                          <span>{cache.hitRate}%</span>
                        </div>
                        <Progress value={cache.hitRate} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 同期タブ */}
        <TabsContent value="sync">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">オフライン同期</h3>
              <Button onClick={performManualSync} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                手動同期
              </Button>
            </div>

            {/* 同期統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">待機中の操作</p>
                      <p className="text-xl font-bold">{stats.offlineSync.pendingOperations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">成功率</p>
                      <p className="text-xl font-bold">{stats.offlineSync.successRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">競合</p>
                      <p className="text-xl font-bold">{stats.offlineSync.conflictCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 同期操作一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>同期キュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-3 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            operation.type === 'create'
                              ? 'default'
                              : operation.type === 'update'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {operation.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{operation.resource}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(operation.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            operation.status === 'success'
                              ? 'default'
                              : operation.status === 'pending'
                                ? 'secondary'
                                : operation.status === 'syncing'
                                  ? 'outline'
                                  : 'destructive'
                          }
                        >
                          {operation.status}
                        </Badge>
                        {operation.retryCount > 0 && (
                          <span className="text-xs text-gray-500">
                            リトライ: {operation.retryCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 通知タブ */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">プッシュ通知</h3>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                テスト通知送信
              </Button>
            </div>

            {/* 通知統計 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">購読者数</p>
                      <p className="text-xl font-bold">
                        {stats.pushNotifications.activeSubscriptions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Signal className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">送信数</p>
                      <p className="text-xl font-bold">{stats.pushNotifications.totalSent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">配信率</p>
                      <p className="text-xl font-bold">{stats.pushNotifications.deliveryRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">クリック率</p>
                      <p className="text-xl font-bold">{stats.pushNotifications.clickRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* キャンペーン一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>通知キャンペーン</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 rounded border"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.targetAudience}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>送信: {campaign.sent}</p>
                          <p>クリック率: {campaign.clickRate}%</p>
                        </div>
                        <Badge
                          variant={
                            campaign.status === 'active'
                              ? 'default'
                              : campaign.status === 'paused'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* パフォーマンスタブ */}
        <TabsContent value="performance">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">パフォーマンス監視</h3>

            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>重要なユーザー体験指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-sm text-gray-600 mb-2">LCP (Largest Contentful Paint)</p>
                    <p
                      className={`text-2xl font-bold ${
                        stats.performance.lcp < 2.5
                          ? 'text-green-600'
                          : stats.performance.lcp < 4.0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {stats.performance.lcp}s
                    </p>
                    <p className="text-xs text-gray-500">目標: &lt; 2.5s</p>
                  </div>

                  <div className="text-center p-4 border rounded">
                    <p className="text-sm text-gray-600 mb-2">FID (First Input Delay)</p>
                    <p
                      className={`text-2xl font-bold ${
                        stats.performance.fid < 100
                          ? 'text-green-600'
                          : stats.performance.fid < 300
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {stats.performance.fid}ms
                    </p>
                    <p className="text-xs text-gray-500">目標: &lt; 100ms</p>
                  </div>

                  <div className="text-center p-4 border rounded">
                    <p className="text-sm text-gray-600 mb-2">CLS (Cumulative Layout Shift)</p>
                    <p
                      className={`text-2xl font-bold ${
                        stats.performance.cls < 0.1
                          ? 'text-green-600'
                          : stats.performance.cls < 0.25
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {stats.performance.cls}
                    </p>
                    <p className="text-xs text-gray-500">目標: &lt; 0.1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 総合スコア */}
            <Card>
              <CardHeader>
                <CardTitle>総合パフォーマンススコア</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold mb-4 ${
                      performanceScore >= 90
                        ? 'text-green-600'
                        : performanceScore >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {performanceScore}
                  </div>
                  <Progress value={performanceScore} className="mb-4" />
                  <p className="text-sm text-gray-600">Core Web Vitalsに基づくスコア</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWADashboard;
