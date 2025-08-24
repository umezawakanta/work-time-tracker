import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PWADashboard from '@/components/pwa/PWADashboard';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Smartphone,
  Download,
  Wifi,
  Bell,
  Zap,
  Globe,
  Database,
  Settings,
  Shield,
  Rocket,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Send,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PWAFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'inactive' | 'demo';
  demoAction?: () => void;
  details: string[];
}

interface PWACapability {
  name: string;
  supported: boolean;
  description: string;
  testAction?: () => void;
}

const PWAPage: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // インストールプロンプト監視
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // オンライン/オフライン状態監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 通知許可状態確認
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * 📱 アプリインストール
   */
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'インストール不可',
        description: '現在このアプリをインストールできません',
        variant: 'destructive',
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        toast({
          title: 'インストール完了',
          description: 'アプリがホーム画面に追加されました',
          variant: 'default',
        });
        setIsInstallable(false);
      } else {
        toast({
          title: 'インストールキャンセル',
          description: 'アプリのインストールがキャンセルされました',
          variant: 'default',
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('インストールエラー:', error);
      toast({
        title: 'インストールエラー',
        description: 'アプリのインストールに失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🔔 プッシュ通知許可要求
   */
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: '通知非対応',
        description: 'このブラウザは通知機能をサポートしていません',
        variant: 'destructive',
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        toast({
          title: '通知許可',
          description: 'プッシュ通知が有効になりました',
          variant: 'default',
        });

        // テスト通知を送信
        new Notification('PWA通知テスト', {
          body: 'プッシュ通知が正常に動作しています！',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        });
      } else {
        toast({
          title: '通知拒否',
          description: 'プッシュ通知が無効になりました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('通知許可エラー:', error);
      toast({
        title: '通知エラー',
        description: '通知許可の要求に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 💾 オフライン機能テスト
   */
  const testOfflineFeatures = () => {
    toast({
      title: 'オフライン機能テスト',
      description: 'ネットワークを無効にしてアプリの動作を確認してください',
      variant: 'default',
    });
  };

  /**
   * 🔄 ServiceWorker更新
   */
  const updateServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        toast({
          title: '更新チェック',
          description: 'ServiceWorkerの更新をチェックしました',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('ServiceWorker更新エラー:', error);
      toast({
        title: '更新エラー',
        description: 'ServiceWorkerの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 📊 キャッシュストレージ使用量確認
   */
  const checkStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = Math.round(((estimate.usage || 0) / 1024 / 1024) * 100) / 100;
        const quotaMB = Math.round(((estimate.quota || 0) / 1024 / 1024) * 100) / 100;

        toast({
          title: 'ストレージ使用量',
          description: `使用中: ${usedMB}MB / 利用可能: ${quotaMB}MB`,
          variant: 'default',
        });
      } catch (error) {
        console.error('ストレージ使用量取得エラー:', error);
      }
    }
  };

  /**
   * PWA機能一覧
   */
  const pwaFeatures: PWAFeature[] = [
    {
      id: 'serviceworker',
      title: '高度ServiceWorker',
      description: '先進的なキャッシュ戦略とバックグラウンド処理',
      icon: Settings,
      status: 'active',
      demoAction: updateServiceWorker,
      details: [
        '複数のキャッシュ戦略（Cache First, Network First, Stale While Revalidate）',
        'バックグラウンド同期機能',
        '自動更新チェックと適用',
        'キャッシュ最適化とクリーンアップ',
        'パフォーマンス監視とメトリクス収集',
      ],
    },
    {
      id: 'offline-sync',
      title: 'オフライン同期',
      description: 'インテリジェントなデータ同期と競合解決',
      icon: Database,
      status: 'active',
      demoAction: testOfflineFeatures,
      details: [
        'オフライン時の操作キューイング',
        'オンライン復帰時の自動同期',
        'データ競合の自動検出と解決',
        '増分同期による効率化',
        'リアルタイム同期状態監視',
      ],
    },
    {
      id: 'push-notifications',
      title: '強化プッシュ通知',
      description: 'ターゲティングとキャンペーン管理機能',
      icon: Bell,
      status: pushPermission === 'granted' ? 'active' : 'inactive',
      demoAction: requestNotificationPermission,
      details: [
        'リッチ通知（画像、アクション、音声）',
        'ユーザーセグメンテーション',
        'スケジュール配信とキャンペーン管理',
        '詳細な配信分析とA/Bテスト',
        '静寂時間とプリファレンス管理',
      ],
    },
    {
      id: 'app-install',
      title: 'ネイティブアプリ体験',
      description: 'ホーム画面追加とアプリライクな操作感',
      icon: Smartphone,
      status: isInstallable ? 'active' : 'demo',
      demoAction: handleInstallApp,
      details: [
        'ワンクリックインストール',
        'ネイティブアプリのような起動画面',
        'フルスクリーン表示対応',
        'ホーム画面アイコンとショートカット',
        'OSレベルでのアプリ管理',
      ],
    },
    {
      id: 'performance',
      title: 'パフォーマンス最適化',
      description: '高速読み込みと滑らかな操作体験',
      icon: Zap,
      status: 'active',
      demoAction: checkStorageUsage,
      details: [
        'Core Web Vitals最適化',
        'レスポンス時間の短縮',
        'メモリ使用量の最適化',
        'プリロードとプリフェッチ',
        'リアルタイムパフォーマンス監視',
      ],
    },
    {
      id: 'security',
      title: 'セキュリティ強化',
      description: 'HTTPS必須とデータ保護機能',
      icon: Shield,
      status: 'active',
      details: [
        'HTTPS通信の強制',
        'Content Security Policy適用',
        'データ暗号化と保護',
        'セキュアなAPI通信',
        'プライバシー保護機能',
      ],
    },
  ];

  /**
   * ブラウザ対応状況
   */
  const pwaCapabilities: PWACapability[] = [
    {
      name: 'Service Worker',
      supported: 'serviceWorker' in navigator,
      description: 'バックグラウンド処理とキャッシュ制御',
      testAction: updateServiceWorker,
    },
    {
      name: 'Push Notifications',
      supported: 'PushManager' in window,
      description: 'プッシュ通知の送受信',
      testAction: requestNotificationPermission,
    },
    {
      name: 'Background Sync',
      supported:
        'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      description: 'オフライン時のバックグラウンド同期',
    },
    {
      name: 'Install Prompt',
      supported: 'BeforeInstallPromptEvent' in window,
      description: 'アプリインストールプロンプト',
      testAction: handleInstallApp,
    },
    {
      name: 'Offline Storage',
      supported: 'caches' in window,
      description: 'オフライン用データストレージ',
      testAction: checkStorageUsage,
    },
    {
      name: 'Web App Manifest',
      supported: true, // マニフェストファイルの存在を前提
      description: 'アプリメタデータとアイコン設定',
    },
  ];

  return (
    <PageLayout
      title="📱 プログレッシブWebアプリ"
      subtitle="先進的なPWA機能でネイティブアプリレベルの体験を提供"
    >
      <div className="space-y-8">
        {/* ヘッダー統計とクイックアクション */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PWAステータス */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                PWAステータス
              </CardTitle>
              <CardDescription>現在のプログレッシブWebアプリ機能の状態</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl mb-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? (
                      <Wifi className="h-8 w-8 mx-auto" />
                    ) : (
                      <Wifi className="h-8 w-8 mx-auto" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{isOnline ? 'オンライン' : 'オフライン'}</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-1 text-blue-600">
                    <Settings className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">ServiceWorker</p>
                  <Badge variant="default" className="text-xs">
                    アクティブ
                  </Badge>
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl mb-1 ${pushPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <Bell className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">プッシュ通知</p>
                  <Badge
                    variant={pushPermission === 'granted' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {pushPermission === 'granted' ? '有効' : '無効'}
                  </Badge>
                </div>

                <div className="text-center">
                  <div
                    className={`text-2xl mb-1 ${isInstallable ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <Download className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm font-medium">インストール</p>
                  <Badge variant={isInstallable ? 'default' : 'secondary'} className="text-xs">
                    {isInstallable ? '可能' : '済み/不可'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                クイックアクション
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isInstallable && (
                <Button onClick={handleInstallApp} className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  アプリをインストール
                </Button>
              )}

              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                className="w-full"
                size="sm"
                disabled={pushPermission === 'granted'}
              >
                <Bell className="h-4 w-4 mr-2" />
                {pushPermission === 'granted' ? '通知有効' : '通知を有効化'}
              </Button>

              <Button onClick={updateServiceWorker} variant="outline" className="w-full" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                SW更新チェック
              </Button>

              <Button onClick={checkStorageUsage} variant="outline" className="w-full" size="sm">
                <Database className="h-4 w-4 mr-2" />
                ストレージ確認
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">PWA機能</TabsTrigger>
            <TabsTrigger value="capabilities">対応状況</TabsTrigger>
            <TabsTrigger value="dashboard">詳細管理</TabsTrigger>
            <TabsTrigger value="demo">デモ・テスト</TabsTrigger>
          </TabsList>

          {/* PWA機能タブ */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pwaFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.id} className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              feature.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : feature.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            feature.status === 'active'
                              ? 'default'
                              : feature.status === 'inactive'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {feature.status === 'active'
                            ? '有効'
                            : feature.status === 'inactive'
                              ? '無効'
                              : 'デモ'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      {feature.demoAction && (
                        <Button
                          onClick={feature.demoAction}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {feature.status === 'inactive' ? '有効化' : 'テスト実行'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ブラウザ対応状況タブ */}
          <TabsContent value="capabilities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  ブラウザ対応状況
                </CardTitle>
                <CardDescription>現在のブラウザでサポートされているPWA機能</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pwaCapabilities.map((capability, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            capability.supported ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{capability.name}</p>
                          <p className="text-sm text-gray-600">{capability.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={capability.supported ? 'default' : 'secondary'}>
                          {capability.supported ? '対応' : '非対応'}
                        </Badge>
                        {capability.testAction && capability.supported && (
                          <Button onClick={capability.testAction} variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            テスト
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 詳細管理タブ */}
          <TabsContent value="dashboard">
            <PWADashboard />
          </TabsContent>

          {/* デモ・テストタブ */}
          <TabsContent value="demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>オフライン機能テスト</CardTitle>
                  <CardDescription>ネットワークを無効にしてオフライン動作を確認</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">テスト手順:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>ブラウザの開発者ツールを開く</li>
                      <li>Networkタブで「Offline」を選択</li>
                      <li>ページをリロードしてキャッシュ動作を確認</li>
                      <li>データの作成・編集を試行</li>
                      <li>オンラインに戻して同期を確認</li>
                    </ol>
                  </div>
                  <Button onClick={testOfflineFeatures} className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                    オフラインテスト開始
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>プッシュ通知テスト</CardTitle>
                  <CardDescription>リッチ通知機能のデモンストレーション</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        if (pushPermission === 'granted') {
                          new Notification('📋 タスクリマインダー', {
                            body: '「重要なプロジェクト」の期限が近づいています',
                            icon: '/icons/notification-todo.png',
                          });
                        } else {
                          toast({
                            title: '通知権限が必要です',
                            description: 'まず通知許可を有効にしてください',
                            variant: 'destructive',
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={pushPermission !== 'granted'}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      タスクリマインダー通知
                    </Button>

                    <Button
                      onClick={() => {
                        if (pushPermission === 'granted') {
                          new Notification('🏆 新しい実績獲得！', {
                            body: '「PWAマスター」バッジを獲得しました',
                            icon: '/icons/notification-achievement.png',
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={pushPermission !== 'granted'}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      実績通知テスト
                    </Button>

                    <Button
                      onClick={() => {
                        if (pushPermission === 'granted') {
                          new Notification('📊 日次レポート', {
                            body: '今日は5つのタスクを完了しました！',
                            icon: '/icons/notification-summary.png',
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={pushPermission !== 'granted'}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      サマリー通知テスト
                    </Button>
                  </div>

                  {pushPermission !== 'granted' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        通知テストを実行するには、まずプッシュ通知を有効にしてください。
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PWAPage;
