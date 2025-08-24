/**
 * 📱 モバイル最適化ダッシュボード
 * PWA状態・タッチ設定・オフライン対応・プッシュ通知管理・ADHD/ASD特化モバイル最適化
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  Bell,
  Vibrate,
  Settings,
  Eye,
  Hand,
  Zap,
  Shield,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Home,
  Navigation,
  Volume2,
  Moon,
  Sun,
  Battery,
  Signal,
  Globe,
} from 'lucide-react';
import {
  pwaEnhancementService,
  PWAState,
  PushNotificationSettings,
} from '@/services/mobile/PWAEnhancementService';
import {
  touchGestureHandler,
  ADHDTouchSettings,
  SwipeNavigation,
} from '@/services/mobile/TouchGestureHandler';

interface MobileOptimizationDashboardProps {
  compactMode?: boolean;
}

export const MobileOptimizationDashboard: React.FC<MobileOptimizationDashboardProps> = ({
  compactMode = false,
}) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: true,
    hasUpdate: false,
    installPrompt: null,
  });

  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>({
    enabled: false,
    adhdOptimized: true,
    types: {
      taskReminders: true,
      energyAlerts: true,
      cognitiveOverload: true,
      breakReminders: true,
      dailySummary: true,
      achievements: true,
    },
    schedule: {
      quietHours: { start: '22:00', end: '08:00' },
      frequency: 'normal',
      adaptiveTiming: true,
    },
    adhdSupport: {
      gentleAlerts: true,
      contextualReminders: true,
      visualCues: true,
      audioCustomization: true,
    },
  });

  const [touchSettings, setTouchSettings] = useState<ADHDTouchSettings>({
    enabled: true,
    sensitivity: 'medium',
    targetSize: {
      minimum: 44,
      preferred: 48,
      spacing: 8,
    },
    feedback: {
      haptic: true,
      visual: true,
      audio: false,
      delay: 0,
    },
    assistance: {
      doubleConfirm: true,
      undoTimeout: 5000,
      gestureGuide: true,
      errorPrevention: true,
    },
    cognitiveAdaptation: {
      simplifyOnOverload: true,
      pauseOnFatigue: true,
      contextualHelp: true,
    },
  });

  const [swipeNavigation, setSwipeNavigation] = useState<SwipeNavigation>({
    enabled: true,
    routes: {
      left: '/cognitive-analytics',
      right: '/adhd-task-manager',
      up: '/dashboard',
      down: '/settings',
    },
    threshold: 50,
    velocity: 0.3,
  });

  const [activeTab, setActiveTab] = useState<'pwa' | 'touch' | 'notifications' | 'offline'>('pwa');
  const [isInitializing, setIsInitializing] = useState(true);

  // 初期化
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // PWAサービス初期化
        await pwaEnhancementService.initialize();
        setPwaState(pwaEnhancementService.getState());
        setPushSettings(pwaEnhancementService.getPushSettings());

        // タッチジェスチャー初期化
        touchGestureHandler.initialize();
        setTouchSettings(touchGestureHandler.getSettings());
        setSwipeNavigation(touchGestureHandler.getSwipeNavigation());

        setIsInitializing(false);
      } catch (error) {
        console.error('📱 Mobile services initialization failed:', error);
        setIsInitializing(false);
      }
    };

    initializeServices();

    // イベントリスナー設定
    const handlePWAStateChange = (newState: PWAState) => {
      setPwaState(newState);
    };

    const handleInstallPromptReady = () => {
      setPwaState((prev) => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setPwaState((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
    };

    const handleConnectionChange = (isOnline: boolean) => {
      setPwaState((prev) => ({ ...prev, isOnline }));
    };

    pwaEnhancementService.on('pwaReady', handlePWAStateChange);
    pwaEnhancementService.on('installPromptReady', handleInstallPromptReady);
    pwaEnhancementService.on('appInstalled', handleAppInstalled);
    pwaEnhancementService.on('connectionStateChanged', handleConnectionChange);

    return () => {
      pwaEnhancementService.off('pwaReady', handlePWAStateChange);
      pwaEnhancementService.off('installPromptReady', handleInstallPromptReady);
      pwaEnhancementService.off('appInstalled', handleAppInstalled);
      pwaEnhancementService.off('connectionStateChanged', handleConnectionChange);
    };
  }, []);

  // アプリインストール
  const handleInstallApp = async () => {
    const success = await pwaEnhancementService.installApp();
    if (success) {
      console.log('📱 App installed successfully');
    }
  };

  // 通知権限要求
  const handleRequestNotificationPermission = async () => {
    const granted = await pwaEnhancementService.requestNotificationPermission();
    if (granted) {
      setPushSettings((prev) => ({ ...prev, enabled: true }));
    }
  };

  // プッシュ設定更新
  const updatePushSettings = (newSettings: Partial<PushNotificationSettings>) => {
    const updated = { ...pushSettings, ...newSettings };
    setPushSettings(updated);
    pwaEnhancementService.updatePushSettings(updated);
  };

  // タッチ設定更新
  const updateTouchSettings = (newSettings: Partial<ADHDTouchSettings>) => {
    const updated = { ...touchSettings, ...newSettings };
    setTouchSettings(updated);
    touchGestureHandler.updateADHDSettings(updated);
  };

  // スワイプナビゲーション更新
  const updateSwipeNavigation = (newNavigation: Partial<SwipeNavigation>) => {
    const updated = { ...swipeNavigation, ...newNavigation };
    setSwipeNavigation(updated);
    touchGestureHandler.updateSwipeNavigation(updated);
  };

  if (compactMode) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            モバイル最適化
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* PWA状態 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">PWA状態</span>
            <div className="flex gap-1">
              <Badge variant={pwaState.isInstalled ? 'default' : 'secondary'} className="text-xs">
                {pwaState.isInstalled ? 'インストール済み' : '未インストール'}
              </Badge>
              <Badge variant={pwaState.isOnline ? 'default' : 'destructive'} className="text-xs">
                {pwaState.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              </Badge>
            </div>
          </div>

          {/* インストールボタン */}
          {pwaState.canInstall && (
            <Button size="sm" onClick={handleInstallApp} className="w-full">
              <Download className="h-3 w-3 mr-1" />
              アプリをインストール
            </Button>
          )}

          {/* タッチ設定 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">ADHD最適化</span>
            <Switch
              checked={touchSettings.enabled}
              onCheckedChange={(checked) => updateTouchSettings({ enabled: checked })}
            />
          </div>

          {/* 通知設定 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">プッシュ通知</span>
            <Switch
              checked={pushSettings.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleRequestNotificationPermission();
                } else {
                  updatePushSettings({ enabled: false });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium mb-2">📱 モバイル最適化システム初期化中...</p>
          <p className="text-sm text-gray-600">PWA機能・タッチ操作・プッシュ通知を設定しています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            モバイル最適化ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            PWA・タッチ操作・プッシュ通知・ADHD/ASD特化モバイル最適化
          </p>
        </div>
      </div>

      {/* 状態サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">PWA状態</span>
              {pwaState.isInstalled ? (
                <Home className="h-4 w-4 text-green-500" />
              ) : (
                <Download className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="text-lg font-bold">
              {pwaState.isInstalled ? 'インストール済み' : '未インストール'}
            </div>
            <Badge
              className={
                pwaState.isStandalone ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }
            >
              {pwaState.isStandalone ? 'スタンドアロン' : 'ブラウザ'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">接続状態</span>
              {pwaState.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-lg font-bold">
              {pwaState.isOnline ? 'オンライン' : 'オフライン'}
            </div>
            <span className="text-xs text-gray-500">
              {pwaState.isOnline ? '同期中' : 'ローカル保存'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">タッチ最適化</span>
              <Hand className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-lg font-bold">{touchSettings.enabled ? '有効' : '無効'}</div>
            <span className="text-xs text-gray-500">感度: {touchSettings.sensitivity}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">プッシュ通知</span>
              <Bell className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-lg font-bold">{pushSettings.enabled ? '有効' : '無効'}</div>
            <span className="text-xs text-gray-500">
              ADHD最適化: {pushSettings.adhdOptimized ? 'ON' : 'OFF'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* インストールプロンプト */}
      {pwaState.canInstall && (
        <Alert className="border-blue-200 bg-blue-50">
          <Download className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>アプリをホーム画面に追加できます</strong>
                <p className="text-sm mt-1">
                  より快適な操作体験とオフライン機能をご利用いただけます
                </p>
              </div>
              <Button onClick={handleInstallApp} size="sm">
                インストール
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pwa">PWA設定</TabsTrigger>
          <TabsTrigger value="touch">タッチ操作</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="offline">オフライン対応</TabsTrigger>
        </TabsList>

        {/* PWA設定タブ */}
        <TabsContent value="pwa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PWA機能 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  PWA機能
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">インストール状態</span>
                    <Badge variant={pwaState.isInstalled ? 'default' : 'secondary'}>
                      {pwaState.isInstalled ? 'インストール済み' : '未インストール'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">スタンドアロンモード</span>
                    <Badge variant={pwaState.isStandalone ? 'default' : 'secondary'}>
                      {pwaState.isStandalone ? '有効' : '無効'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">アップデート</span>
                    <Badge variant={pwaState.hasUpdate ? 'destructive' : 'default'}>
                      {pwaState.hasUpdate ? '利用可能' : '最新'}
                    </Badge>
                  </div>
                </div>

                {pwaState.canInstall && (
                  <Button onClick={handleInstallApp} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    アプリをインストール
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* インストールガイド */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-500" />
                  インストール手順
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pwaEnhancementService.getInstallationGuide().steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* タッチ操作タブ */}
        <TabsContent value="touch" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ADHD特化タッチ設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5 text-purple-500" />
                  ADHD特化タッチ設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="touch-enabled">タッチ最適化を有効化</Label>
                  <Switch
                    id="touch-enabled"
                    checked={touchSettings.enabled}
                    onCheckedChange={(checked) => updateTouchSettings({ enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>感度設定</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={touchSettings.sensitivity === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateTouchSettings({ sensitivity: level })}
                      >
                        {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>タッチターゲットサイズ: {touchSettings.targetSize.preferred}px</Label>
                  <Slider
                    value={[touchSettings.targetSize.preferred]}
                    onValueChange={([value]) =>
                      updateTouchSettings({
                        targetSize: { ...touchSettings.targetSize, preferred: value },
                      })
                    }
                    min={44}
                    max={64}
                    step={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* フィードバック設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vibrate className="h-5 w-5 text-orange-500" />
                  フィードバック設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="haptic-feedback">振動フィードバック</Label>
                  <Switch
                    id="haptic-feedback"
                    checked={touchSettings.feedback.haptic}
                    onCheckedChange={(checked) =>
                      updateTouchSettings({
                        feedback: { ...touchSettings.feedback, haptic: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="visual-feedback">視覚フィードバック</Label>
                  <Switch
                    id="visual-feedback"
                    checked={touchSettings.feedback.visual}
                    onCheckedChange={(checked) =>
                      updateTouchSettings({
                        feedback: { ...touchSettings.feedback, visual: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-feedback">音声フィードバック</Label>
                  <Switch
                    id="audio-feedback"
                    checked={touchSettings.feedback.audio}
                    onCheckedChange={(checked) =>
                      updateTouchSettings({
                        feedback: { ...touchSettings.feedback, audio: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>フィードバック遅延: {touchSettings.feedback.delay}ms</Label>
                  <Slider
                    value={[touchSettings.feedback.delay]}
                    onValueChange={([value]) =>
                      updateTouchSettings({
                        feedback: { ...touchSettings.feedback, delay: value },
                      })
                    }
                    min={0}
                    max={200}
                    step={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* スワイプナビゲーション */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-500" />
                  スワイプナビゲーション
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="swipe-navigation">スワイプナビゲーション</Label>
                  <Switch
                    id="swipe-navigation"
                    checked={swipeNavigation.enabled}
                    onCheckedChange={(checked) => updateSwipeNavigation({ enabled: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">← 左スワイプ</div>
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      {typeof swipeNavigation.routes.left === 'string'
                        ? swipeNavigation.routes.left
                        : '関数'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">→ 右スワイプ</div>
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      {typeof swipeNavigation.routes.right === 'string'
                        ? swipeNavigation.routes.right
                        : '関数'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">↑ 上スワイプ</div>
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      {typeof swipeNavigation.routes.up === 'string'
                        ? swipeNavigation.routes.up
                        : '関数'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">↓ 下スワイプ</div>
                    <div className="text-xs bg-gray-100 p-2 rounded">
                      {typeof swipeNavigation.routes.down === 'string'
                        ? swipeNavigation.routes.down
                        : '関数'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>スワイプ閾値: {swipeNavigation.threshold}px</Label>
                    <Slider
                      value={[swipeNavigation.threshold]}
                      onValueChange={([value]) => updateSwipeNavigation({ threshold: value })}
                      min={30}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>速度閾値: {swipeNavigation.velocity.toFixed(2)}</Label>
                    <Slider
                      value={[swipeNavigation.velocity * 100]}
                      onValueChange={([value]) => updateSwipeNavigation({ velocity: value / 100 })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 通知設定タブ */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本通知設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  プッシュ通知設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-enabled">プッシュ通知を有効化</Label>
                  <Switch
                    id="push-enabled"
                    checked={pushSettings.enabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleRequestNotificationPermission();
                      } else {
                        updatePushSettings({ enabled: false });
                      }
                    }}
                  />
                </div>

                {!pushSettings.enabled && (
                  <Button
                    onClick={handleRequestNotificationPermission}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    通知許可を要求
                  </Button>
                )}

                <div className="space-y-3">
                  {Object.entries(pushSettings.types).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm">
                        {key === 'taskReminders' && 'タスクリマインダー'}
                        {key === 'energyAlerts' && 'エネルギーアラート'}
                        {key === 'cognitiveOverload' && '認知負荷警告'}
                        {key === 'breakReminders' && '休憩リマインダー'}
                        {key === 'dailySummary' && '日次サマリー'}
                        {key === 'achievements' && '達成通知'}
                      </Label>
                      <Switch
                        id={key}
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          updatePushSettings({
                            types: { ...pushSettings.types, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ADHD特化通知設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  ADHD特化通知
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adhd-optimized">ADHD最適化</Label>
                  <Switch
                    id="adhd-optimized"
                    checked={pushSettings.adhdOptimized}
                    onCheckedChange={(checked) => updatePushSettings({ adhdOptimized: checked })}
                  />
                </div>

                <div className="space-y-3">
                  {Object.entries(pushSettings.adhdSupport).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm">
                        {key === 'gentleAlerts' && '穏やかなアラート'}
                        {key === 'contextualReminders' && '文脈的リマインダー'}
                        {key === 'visualCues' && '視覚的手がかり'}
                        {key === 'audioCustomization' && '音声カスタマイズ'}
                      </Label>
                      <Switch
                        id={key}
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          updatePushSettings({
                            adhdSupport: { ...pushSettings.adhdSupport, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>通知頻度</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['minimal', 'normal', 'frequent'] as const).map((freq) => (
                      <Button
                        key={freq}
                        variant={pushSettings.schedule.frequency === freq ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          updatePushSettings({
                            schedule: { ...pushSettings.schedule, frequency: freq },
                          })
                        }
                      >
                        {freq === 'minimal' ? '最小' : freq === 'normal' ? '通常' : '頻繁'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="adaptive-timing">適応的タイミング</Label>
                  <Switch
                    id="adaptive-timing"
                    checked={pushSettings.schedule.adaptiveTiming}
                    onCheckedChange={(checked) =>
                      updatePushSettings({
                        schedule: { ...pushSettings.schedule, adaptiveTiming: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* オフライン対応タブ */}
        <TabsContent value="offline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                オフライン機能
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>オフライン機能が有効です</strong>
                  <p className="text-sm mt-1">
                    インターネット接続が切断されても、タスク管理と認知データの記録が継続されます。
                    オンライン復帰時に自動同期されます。
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Battery className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">ローカルデータ</div>
                  <div className="text-xs text-gray-600">128MB利用可能</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">自動同期</div>
                  <div className="text-xs text-gray-600">5分間隔</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm font-medium">データ保護</div>
                  <div className="text-xs text-gray-600">暗号化済み</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>キャッシュ使用量</Label>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>96MB / 128MB使用中</span>
                  <span>75%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileOptimizationDashboard;
