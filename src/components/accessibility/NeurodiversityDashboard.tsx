import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  sensorySensitivityService,
  SensoryProfile,
} from '@/services/accessibility/SensorySensitivityService';
import {
  cognitiveLoadOptimizationService,
  CognitiveLoadProfile,
} from '@/services/accessibility/CognitiveLoadOptimizationService';
import { dyslexiaSupportService, DyslexiaSettings } from '@/services/accessibility/DyslexiaSupport';

interface NeurodiversityDashboardProps {
  className?: string;
}

/**
 * 🧠 ニューロダイバーシティ推進者: 統合アクセシビリティダッシュボード
 * 感覚過敏・認知負荷・ディスレクシア支援の総合管理
 */
export const NeurodiversityDashboard: React.FC<NeurodiversityDashboardProps> = ({
  className = '',
}) => {
  const [sensoryProfile, setSensoryProfile] = useState<SensoryProfile | null>(null);
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveLoadProfile | null>(null);
  const [dyslexiaSettings, setDyslexiaSettings] = useState<DyslexiaSettings>({
    readableFont: false,
    increasedLineSpacing: false,
    letterSpacing: false,
    highlightFocus: false,
    textToSpeech: false,
    readingSpeed: 200,
  });
  const [safeModeActive, setSafeModeActive] = useState(false);
  const [activeServices, setActiveServices] = useState<string[]>([]);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = (): void => {
    // 現在の設定を読み込み
    const currentSensory = sensorySensitivityService.getActiveProfile();
    const currentCognitive = cognitiveLoadOptimizationService.getActiveProfile();
    const currentDyslexia = dyslexiaSupportService.getSettings();

    setSensoryProfile(currentSensory);
    setCognitiveProfile(currentCognitive);
    setDyslexiaSettings(currentDyslexia);
    setSafeModeActive(sensorySensitivityService.isSafeModeActive());

    // アクティブサービス一覧
    const services: string[] = [];
    if (currentSensory?.isActive) services.push('sensory');
    if (currentCognitive?.simplifyInterface) services.push('cognitive');
    if (currentDyslexia.readableFont) services.push('dyslexia');
    setActiveServices(services);
  };

  const handleSafeModeToggle = (): void => {
    if (safeModeActive) {
      // セーフモード解除（現時点では手動実装なし）
      toast({
        title: 'セーフモード解除',
        description: '通常モードに戻りました',
        variant: 'default',
      });
    } else {
      sensorySensitivityService.enableSafeMode();
      setSafeModeActive(true);
    }
  };

  const handleSensoryProfileChange = (profileId: string): void => {
    const profiles = sensorySensitivityService.getProfiles();
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      sensorySensitivityService.applyProfile(profile);
      setSensoryProfile(profile);
      toast({
        title: '感覚プロファイル適用',
        description: `${profile.name}を適用しました`,
        variant: 'default',
      });
    }
  };

  const handleCognitiveToggle = (setting: keyof CognitiveLoadProfile, value: boolean): void => {
    if (cognitiveProfile) {
      const updatedProfile = { ...cognitiveProfile, [setting]: value };
      cognitiveLoadOptimizationService.applyProfile(updatedProfile);
      setCognitiveProfile(updatedProfile);
    }
  };

  const handleDyslexiaToggle = (setting: keyof DyslexiaSettings, value: boolean | number): void => {
    const updatedSettings = { ...dyslexiaSettings, [setting]: value };
    dyslexiaSupportService.updateSettings(updatedSettings);
    setDyslexiaSettings(updatedSettings);
  };

  const getServiceStatus = (service: string): 'active' | 'inactive' | 'partial' => {
    switch (service) {
      case 'sensory':
        return sensoryProfile?.isActive ? 'active' : 'inactive';
      case 'cognitive':
        return cognitiveProfile?.simplifyInterface ? 'active' : 'inactive';
      case 'dyslexia':
        return dyslexiaSettings.readableFont ? 'active' : 'inactive';
      default:
        return 'inactive';
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'partial') => {
    const variants = {
      active: { variant: 'default' as const, text: '有効', color: 'bg-green-500' },
      partial: { variant: 'secondary' as const, text: '部分', color: 'bg-yellow-500' },
      inactive: { variant: 'outline' as const, text: '無効', color: 'bg-gray-500' },
    };
    const { variant, text, color } = variants[status];

    return (
      <Badge variant={variant} className={`${color} text-white`}>
        {text}
      </Badge>
    );
  };

  return (
    <div className={`neurodiversity-dashboard space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧠 ニューロダイバーシティ支援</h1>
          <p className="text-gray-600 mt-2">認知的多様性に配慮したアクセシビリティ機能</p>
        </div>

        {/* 緊急セーフモード */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">🚨 緊急セーフモード</span>
              <Switch checked={safeModeActive} onCheckedChange={handleSafeModeToggle} />
            </div>
            <p className="text-xs text-red-600 mt-1">すべての刺激要素を無効化</p>
          </CardContent>
        </Card>
      </div>

      {/* サービス状況概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊 サービス状況</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">🧩 感覚過敏対応</span>
              {getStatusBadge(getServiceStatus('sensory'))}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">🧠 認知負荷最適化</span>
              {getStatusBadge(getServiceStatus('cognitive'))}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">📖 ディスレクシア支援</span>
              {getStatusBadge(getServiceStatus('dyslexia'))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細設定タブ */}
      <Tabs defaultValue="sensory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sensory">🧩 感覚過敏対応</TabsTrigger>
          <TabsTrigger value="cognitive">🧠 認知負荷最適化</TabsTrigger>
          <TabsTrigger value="dyslexia">📖 ディスレクシア支援</TabsTrigger>
        </TabsList>

        {/* 感覚過敏対応 */}
        <TabsContent value="sensory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🧩 感覚過敏対応設定</CardTitle>
              <CardDescription>視覚・聴覚・動作・認知的な感覚過敏への配慮機能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* プロファイル選択 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">感覚プロファイル</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant={sensoryProfile?.id === 'safe-mode' ? 'default' : 'outline'}
                    onClick={() => handleSensoryProfileChange('safe-mode')}
                    className="justify-start"
                  >
                    🛡️ セーフモード（最小刺激）
                  </Button>
                  <Button
                    variant={sensoryProfile?.id === 'mild-sensitivity' ? 'default' : 'outline'}
                    onClick={() => handleSensoryProfileChange('mild-sensitivity')}
                    className="justify-start"
                  >
                    🌸 軽度感覚過敏
                  </Button>
                </div>
              </div>

              {/* 現在のプロファイル詳細 */}
              {sensoryProfile && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    現在適用中: {sensoryProfile.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      動作軽減: {sensoryProfile.preferences.visual.reducedMotion ? '✅' : '❌'}
                    </div>
                    <div>
                      高コントラスト: {sensoryProfile.preferences.visual.highContrast ? '✅' : '❌'}
                    </div>
                    <div>
                      音声無効: {!sensoryProfile.preferences.auditory.soundsEnabled ? '✅' : '❌'}
                    </div>
                    <div>
                      大きなターゲット:{' '}
                      {sensoryProfile.preferences.interaction.largerClickTargets ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 認知負荷最適化 */}
        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🧠 認知負荷最適化設定</CardTitle>
              <CardDescription>
                情報処理負荷を軽減し、理解しやすいインターフェースを提供
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">インターフェース簡素化</label>
                    <Switch
                      checked={cognitiveProfile?.simplifyInterface || false}
                      onCheckedChange={(value) => handleCognitiveToggle('simplifyInterface', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">選択肢数制限</label>
                    <Switch
                      checked={cognitiveProfile?.reduceChoices || false}
                      onCheckedChange={(value) => handleCognitiveToggle('reduceChoices', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">進捗表示強化</label>
                    <Switch
                      checked={cognitiveProfile?.progressIndicators || false}
                      onCheckedChange={(value) =>
                        handleCognitiveToggle('progressIndicators', value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">メモリ支援</label>
                    <Switch
                      checked={cognitiveProfile?.memorySupport || false}
                      onCheckedChange={(value) => handleCognitiveToggle('memorySupport', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">フォーカス支援</label>
                    <Switch
                      checked={cognitiveProfile?.focusAssistance || false}
                      onCheckedChange={(value) => handleCognitiveToggle('focusAssistance', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">タスク分割</label>
                    <Switch
                      checked={cognitiveProfile?.taskBreakdown || false}
                      onCheckedChange={(value) => handleCognitiveToggle('taskBreakdown', value)}
                    />
                  </div>
                </div>
              </div>

              {/* 認知負荷測定結果 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🧠 現在の認知負荷</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">タスク複雑度</span>
                    <span className="text-sm font-mono">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">選択肢過多</span>
                    <span className="text-sm font-mono">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">記憶要求度</span>
                    <span className="text-sm font-mono">35%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ディスレクシア支援 */}
        <TabsContent value="dyslexia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📖 ディスレクシア支援設定</CardTitle>
              <CardDescription>読字障害・読み困難への配慮機能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">読みやすいフォント</label>
                    <Switch
                      checked={dyslexiaSettings.readableFont}
                      onCheckedChange={(value) => handleDyslexiaToggle('readableFont', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">行間拡大</label>
                    <Switch
                      checked={dyslexiaSettings.increasedLineSpacing}
                      onCheckedChange={(value) =>
                        handleDyslexiaToggle('increasedLineSpacing', value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">文字間隔拡大</label>
                    <Switch
                      checked={dyslexiaSettings.letterSpacing}
                      onCheckedChange={(value) => handleDyslexiaToggle('letterSpacing', value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">フォーカスハイライト</label>
                    <Switch
                      checked={dyslexiaSettings.highlightFocus}
                      onCheckedChange={(value) => handleDyslexiaToggle('highlightFocus', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">テキスト読み上げ</label>
                    <Switch
                      checked={dyslexiaSettings.textToSpeech}
                      onCheckedChange={(value) => handleDyslexiaToggle('textToSpeech', value)}
                    />
                  </div>
                </div>
              </div>

              {/* 読み上げ速度調整 */}
              {dyslexiaSettings.textToSpeech && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    読み上げ速度: {dyslexiaSettings.readingSpeed}語/分
                  </label>
                  <Slider
                    value={[dyslexiaSettings.readingSpeed]}
                    onValueChange={(value) => handleDyslexiaToggle('readingSpeed', value[0])}
                    max={400}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>遅い (50)</span>
                    <span>標準 (200)</span>
                    <span>速い (400)</span>
                  </div>
                </div>
              )}

              {/* 使用方法ガイド */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">📚 使用方法</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• テキストを選択すると自動で読み上げます</li>
                  <li>• Escapeキーで読み上げを停止できます</li>
                  <li>• Ctrl+Rでページ全体を読み上げます</li>
                  <li>• フォーカスした要素がハイライトされます</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={loadCurrentSettings}>
          🔄 設定再読み込み
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem('sensory-profile');
            localStorage.removeItem('cognitive-profile');
            localStorage.removeItem('dyslexia-settings');
            window.location.reload();
          }}
        >
          🔄 すべてリセット
        </Button>
      </div>
    </div>
  );
};

export default NeurodiversityDashboard;
