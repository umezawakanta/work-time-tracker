import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

/**
 * 🧠 ニューロダイバーシティ推進者: 統合アクセシビリティページ
 */
const NeurodiversityPage: React.FC = () => {
  const [safeModeActive, setSafeModeActive] = useState(false);
  const [settings, setSettings] = useState({
    sensory: {
      reducedMotion: false,
      highContrast: false,
      soundsEnabled: true,
    },
    cognitive: {
      simplifyInterface: false,
      memorySupport: false,
      focusAssistance: false,
    },
    dyslexia: {
      readableFont: false,
      textToSpeech: false,
      highlightFocus: false,
    },
  });

  const handleSettingChange = (category: string, setting: string, value: boolean): void => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));

    // 設定を適用
    applyAccessibilitySetting(category, setting, value);

    toast({
      title: '設定を更新しました',
      description: `${setting}を${value ? '有効' : '無効'}にしました`,
      variant: 'default',
    });
  };

  const applyAccessibilitySetting = (category: string, setting: string, value: boolean): void => {
    const body = document.body;

    switch (`${category}.${setting}`) {
      case 'sensory.reducedMotion':
        if (value) {
          body.style.setProperty('--animation-duration', '0.1s');
          body.classList.add('reduce-motion');
        } else {
          body.style.removeProperty('--animation-duration');
          body.classList.remove('reduce-motion');
        }
        break;

      case 'sensory.highContrast':
        if (value) {
          body.classList.add('high-contrast');
        } else {
          body.classList.remove('high-contrast');
        }
        break;

      case 'cognitive.simplifyInterface':
        if (value) {
          body.classList.add('simplified-ui');
        } else {
          body.classList.remove('simplified-ui');
        }
        break;

      case 'dyslexia.readableFont':
        if (value) {
          body.style.fontFamily = 'Arial, sans-serif';
          body.style.lineHeight = '1.8';
          body.style.letterSpacing = '0.12em';
        } else {
          body.style.removeProperty('font-family');
          body.style.removeProperty('line-height');
          body.style.removeProperty('letter-spacing');
        }
        break;

      case 'dyslexia.textToSpeech':
        if (value) {
          enableTextToSpeech();
        } else {
          disableTextToSpeech();
        }
        break;
    }
  };

  const enableTextToSpeech = (): void => {
    document.addEventListener('mouseup', handleTextSelection);
  };

  const disableTextToSpeech = (): void => {
    document.removeEventListener('mouseup', handleTextSelection);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTextSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selection.toString());
      utterance.rate = 1.0;
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSafeModeToggle = (): void => {
    setSafeModeActive(!safeModeActive);

    if (!safeModeActive) {
      // セーフモード有効化
      setSettings({
        sensory: {
          reducedMotion: true,
          highContrast: true,
          soundsEnabled: false,
        },
        cognitive: {
          simplifyInterface: true,
          memorySupport: true,
          focusAssistance: true,
        },
        dyslexia: {
          readableFont: true,
          textToSpeech: false,
          highlightFocus: true,
        },
      });

      // すべての安全設定を適用
      document.body.classList.add('safe-mode', 'reduce-motion', 'high-contrast', 'simplified-ui');
      document.body.style.fontFamily = 'Arial, sans-serif';
      document.body.style.lineHeight = '1.8';

      toast({
        title: '🛡️ セーフモード有効',
        description: 'すべての刺激要素を最小限に抑えました',
        variant: 'default',
      });
    } else {
      // セーフモード無効化
      document.body.classList.remove(
        'safe-mode',
        'reduce-motion',
        'high-contrast',
        'simplified-ui'
      );
      document.body.style.removeProperty('font-family');
      document.body.style.removeProperty('line-height');

      toast({
        title: 'セーフモード無効',
        description: '通常表示に戻りました',
        variant: 'default',
      });
    }
  };

  useEffect(() => {
    // スタイル注入
    const style = document.createElement('style');
    style.textContent = `
      .reduce-motion * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      .high-contrast {
        filter: contrast(150%) !important;
      }
      
      .simplified-ui .secondary-feature,
      .simplified-ui .decoration {
        display: none !important;
      }
      
      .safe-mode {
        background: #f8f9fa !important;
      }
      
      .safe-mode * {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-500' : ''}>
      {isActive ? '有効' : '無効'}
    </Badge>
  );

  return (
    <div className="neurodiversity-page p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧠 ニューロダイバーシティ支援</h1>
          <p className="text-gray-600 mt-2">認知的多様性に配慮したアクセシビリティ機能</p>
        </div>

        {/* 緊急セーフモード */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">🚨 緊急セーフモード</span>
              <Switch checked={safeModeActive} onCheckedChange={handleSafeModeToggle} />
            </div>
            <p className="text-xs text-red-600 mt-1">すべての刺激要素を最小化</p>
          </CardContent>
        </Card>
      </div>

      {/* 機能概要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🧩</span>
              <span>感覚過敏対応</span>
            </CardTitle>
            <CardDescription>視覚・聴覚・動作への配慮</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>動作軽減</span>
                {getStatusBadge(settings.sensory.reducedMotion)}
              </div>
              <div className="flex justify-between items-center">
                <span>高コントラスト</span>
                {getStatusBadge(settings.sensory.highContrast)}
              </div>
              <div className="flex justify-between items-center">
                <span>音声制御</span>
                {getStatusBadge(!settings.sensory.soundsEnabled)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🧠</span>
              <span>認知負荷最適化</span>
            </CardTitle>
            <CardDescription>情報処理負荷の軽減</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>UI簡素化</span>
                {getStatusBadge(settings.cognitive.simplifyInterface)}
              </div>
              <div className="flex justify-between items-center">
                <span>メモリ支援</span>
                {getStatusBadge(settings.cognitive.memorySupport)}
              </div>
              <div className="flex justify-between items-center">
                <span>フォーカス支援</span>
                {getStatusBadge(settings.cognitive.focusAssistance)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📖</span>
              <span>ディスレクシア支援</span>
            </CardTitle>
            <CardDescription>読字障害への配慮</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>読みやすいフォント</span>
                {getStatusBadge(settings.dyslexia.readableFont)}
              </div>
              <div className="flex justify-between items-center">
                <span>テキスト読み上げ</span>
                {getStatusBadge(settings.dyslexia.textToSpeech)}
              </div>
              <div className="flex justify-between items-center">
                <span>フォーカス強調</span>
                {getStatusBadge(settings.dyslexia.highlightFocus)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細設定 */}
      <Tabs defaultValue="sensory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sensory">🧩 感覚過敏対応</TabsTrigger>
          <TabsTrigger value="cognitive">🧠 認知負荷最適化</TabsTrigger>
          <TabsTrigger value="dyslexia">📖 ディスレクシア支援</TabsTrigger>
        </TabsList>

        <TabsContent value="sensory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>感覚過敏対応設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">動作・アニメーション軽減</label>
                  <p className="text-xs text-gray-500">画面の動きを最小限に抑制</p>
                </div>
                <Switch
                  checked={settings.sensory.reducedMotion}
                  onCheckedChange={(value) =>
                    handleSettingChange('sensory', 'reducedMotion', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">高コントラスト表示</label>
                  <p className="text-xs text-gray-500">文字と背景の明度差を拡大</p>
                </div>
                <Switch
                  checked={settings.sensory.highContrast}
                  onCheckedChange={(value) => handleSettingChange('sensory', 'highContrast', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">音声・効果音有効</label>
                  <p className="text-xs text-gray-500">音による刺激の制御</p>
                </div>
                <Switch
                  checked={settings.sensory.soundsEnabled}
                  onCheckedChange={(value) =>
                    handleSettingChange('sensory', 'soundsEnabled', value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>認知負荷最適化設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">インターフェース簡素化</label>
                  <p className="text-xs text-gray-500">不要な装飾や複雑な要素を非表示</p>
                </div>
                <Switch
                  checked={settings.cognitive.simplifyInterface}
                  onCheckedChange={(value) =>
                    handleSettingChange('cognitive', 'simplifyInterface', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">メモリ支援機能</label>
                  <p className="text-xs text-gray-500">ヒントやリマインダーを表示</p>
                </div>
                <Switch
                  checked={settings.cognitive.memorySupport}
                  onCheckedChange={(value) =>
                    handleSettingChange('cognitive', 'memorySupport', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">フォーカス支援</label>
                  <p className="text-xs text-gray-500">現在の操作位置を明確化</p>
                </div>
                <Switch
                  checked={settings.cognitive.focusAssistance}
                  onCheckedChange={(value) =>
                    handleSettingChange('cognitive', 'focusAssistance', value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dyslexia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ディスレクシア支援設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">読みやすいフォント</label>
                  <p className="text-xs text-gray-500">文字間隔と行間を最適化</p>
                </div>
                <Switch
                  checked={settings.dyslexia.readableFont}
                  onCheckedChange={(value) =>
                    handleSettingChange('dyslexia', 'readableFont', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">テキスト読み上げ</label>
                  <p className="text-xs text-gray-500">選択したテキストを音声で読み上げ</p>
                </div>
                <Switch
                  checked={settings.dyslexia.textToSpeech}
                  onCheckedChange={(value) =>
                    handleSettingChange('dyslexia', 'textToSpeech', value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">フォーカスハイライト</label>
                  <p className="text-xs text-gray-500">現在読んでいる箇所を強調表示</p>
                </div>
                <Switch
                  checked={settings.dyslexia.highlightFocus}
                  onCheckedChange={(value) =>
                    handleSettingChange('dyslexia', 'highlightFocus', value)
                  }
                />
              </div>

              {settings.dyslexia.textToSpeech && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📚 使用方法</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• テキストを選択すると自動で読み上げます</li>
                    <li>• Escapeキーで読み上げを停止できます</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* テスト用コンテンツ */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 アクセシビリティ機能テスト</CardTitle>
          <CardDescription>設定した機能がどのように動作するかテストできます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <h3 className="font-bold">アニメーション要素</h3>
            <p>この要素は動作軽減設定でアニメーションが制御されます。</p>
          </div>

          <div className="bg-gray-800 text-white p-4 rounded-lg">
            <h3 className="font-bold">高コントラストテスト</h3>
            <p>高コントラストモードでこの文字がより読みやすくなります。</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <h3 className="font-bold">テキスト読み上げテスト</h3>
            <p>
              このテキストを選択すると、読み上げ機能が有効な場合に音声で読み上げられます。ディスレクシア支援の一環として、読むことが困難な方への配慮機能です。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeurodiversityPage;
