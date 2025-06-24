import React, { useState } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Palette,
  MousePointer2,
  Type,
  Volume2,
  Settings,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Keyboard,
  Accessibility,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityToolsProps {
  className?: string;
}

export const AccessibilityTools: React.FC<AccessibilityToolsProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isHighContrast,
    isReducedMotion,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    announceToScreenReader,
  } = useAccessibilityContext();

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    announceToScreenReader(
      isExpanded
        ? 'アクセシビリティツールバーを閉じました'
        : 'アクセシビリティツールバーを開きました'
    );
  };

  const toolbarItems = [
    {
      icon: isHighContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />,
      label: '高コントラスト',
      shortcut: 'Alt + H',
      active: isHighContrast,
      onClick: () => {
        toggleHighContrast();
        announceToScreenReader(
          isHighContrast
            ? '高コントラストモードを無効にしました'
            : '高コントラストモードを有効にしました'
        );
      },
    },
    {
      icon: isReducedMotion ? (
        <MousePointer2 className="h-4 w-4" />
      ) : (
        <Palette className="h-4 w-4" />
      ),
      label: 'アニメーション削減',
      shortcut: 'Alt + M',
      active: isReducedMotion,
      onClick: () => {
        toggleReducedMotion();
        announceToScreenReader(
          isReducedMotion
            ? 'アニメーション削減を無効にしました'
            : 'アニメーション削減を有効にしました'
        );
      },
    },
  ];

  return (
    <div
      className={cn('fixed right-4 bottom-4 z-50 max-w-xs', className)}
      role="toolbar"
      aria-label="アクセシビリティツールバー"
    >
      {/* 折りたたみボタン */}
      <Button
        onClick={handleToggleExpanded}
        className={cn('mb-2 w-full shadow-lg', isExpanded ? 'rounded-b-none' : 'rounded-lg')}
        variant={isExpanded ? 'default' : 'secondary'}
        size="sm"
        aria-expanded={isExpanded}
        aria-controls="accessibility-toolbar-content"
        aria-label={`アクセシビリティツールバーを${isExpanded ? '閉じる' : '開く'}`}
      >
        <Accessibility className="h-4 w-4 mr-2" />
        アクセシビリティ
        {isExpanded ? <X className="h-4 w-4 ml-2" /> : <Settings className="h-4 w-4 ml-2" />}
      </Button>

      {/* ツールバーコンテンツ */}
      {isExpanded && (
        <Card
          id="accessibility-toolbar-content"
          className="shadow-xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm"
        >
          <CardContent className="p-4 space-y-4">
            {/* フォントサイズ制御 */}
            <div className="space-y-2" role="group" aria-labelledby="font-size-label">
              <div className="flex items-center justify-between">
                <span id="font-size-label" className="text-sm font-medium">
                  フォントサイズ
                </span>
                <Badge variant="secondary" className="text-xs">
                  {fontSize}px
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    decreaseFontSize();
                    announceToScreenReader(`フォントサイズを縮小: ${fontSize - 2}px`);
                  }}
                  size="sm"
                  variant="outline"
                  disabled={fontSize <= 12}
                  aria-label="フォントサイズを縮小 (Alt + ↓)"
                  title="Alt + ↓"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    resetFontSize();
                    announceToScreenReader('フォントサイズをリセット: 16px');
                  }}
                  size="sm"
                  variant="outline"
                  aria-label="フォントサイズをリセット (Alt + 0)"
                  title="Alt + 0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    increaseFontSize();
                    announceToScreenReader(`フォントサイズを拡大: ${fontSize + 2}px`);
                  }}
                  size="sm"
                  variant="outline"
                  disabled={fontSize >= 24}
                  aria-label="フォントサイズを拡大 (Alt + ↑)"
                  title="Alt + ↑"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 表示設定 */}
            <div className="space-y-2" role="group" aria-labelledby="display-settings-label">
              <span id="display-settings-label" className="text-sm font-medium">
                表示設定
              </span>
              <div className="space-y-2">
                {toolbarItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={item.onClick}
                    variant={item.active ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    aria-pressed={item.active}
                    title={item.shortcut}
                  >
                    {item.icon}
                    <span className="ml-2 flex-1 text-left">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.shortcut.split(' + ')[1]}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* キーボードショートカット案内 */}
            <div className="space-y-2 pt-2 border-t" role="group" aria-labelledby="shortcuts-label">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span id="shortcuts-label" className="text-sm font-medium">
                  ショートカット
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Alt + S: メインコンテンツへスキップ</div>
                <div>Alt + H: 高コントラスト切り替え</div>
                <div>Alt + M: アニメーション削減</div>
                <div>Alt + ↑/↓: フォントサイズ調整</div>
              </div>
            </div>

            {/* スクリーンリーダー案内 */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm font-medium">スクリーンリーダー対応</span>
              </div>
              <Button
                onClick={() =>
                  announceToScreenReader(
                    'このサイトはスクリーンリーダーに対応しています。ナビゲーションにはTabキーとArrowキーを使用してください。',
                    'assertive'
                  )
                }
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                音声案内をテスト
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
