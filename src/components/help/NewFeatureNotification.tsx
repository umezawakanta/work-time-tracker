/**
 * 🆕 新機能通知コンポーネント
 * 4象限マトリックス機能の案内
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Brain,
  ArrowRight,
  Sparkles,
  X,
  BookOpen,
  Map,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';

interface NewFeatureNotificationProps {
  onDismiss?: () => void;
  autoHide?: boolean;
  hideDelay?: number; // minutes
}

/**
 * 新機能通知コンポーネント
 */
export const NewFeatureNotification: React.FC<NewFeatureNotificationProps> = ({
  onDismiss,
  autoHide = false,
  hideDelay = 1440, // 24時間
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // LocalStorageキー
  const NOTIFICATION_KEY = 'quadrant-feature-notification-dismissed';
  const NOTIFICATION_TIMESTAMP_KEY = 'quadrant-feature-notification-timestamp';

  // 初期化：以前に非表示にされているかチェック
  useEffect(() => {
    const dismissed = localStorage.getItem(NOTIFICATION_KEY);
    const timestamp = localStorage.getItem(NOTIFICATION_TIMESTAMP_KEY);

    if (dismissed === 'true') {
      // 自動表示の場合、指定時間後に再表示
      if (autoHide && timestamp) {
        const dismissedTime = parseInt(timestamp);
        const now = Date.now();
        const hideDelayMs = hideDelay * 60 * 1000;

        if (now - dismissedTime > hideDelayMs) {
          // 指定時間が過ぎたので再表示
          localStorage.removeItem(NOTIFICATION_KEY);
          localStorage.removeItem(NOTIFICATION_TIMESTAMP_KEY);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    }
  }, [autoHide, hideDelay]);

  // 非表示処理
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(NOTIFICATION_KEY, 'true');
    localStorage.setItem(NOTIFICATION_TIMESTAMP_KEY, Date.now().toString());
    onDismiss?.();
  };

  // 4象限ダッシュボードへナビゲート
  const handleTryFeature = () => {
    navigate('/quadrant-dashboard');
    handleDismiss();
  };

  // サイトマップへナビゲート
  const handleViewGuide = () => {
    navigate('/sitemap');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="relative border-2 border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Sparkles className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>🎉 新機能リリース！</span>
                <Badge variant="destructive" className="animate-pulse">
                  NEW
                </Badge>
              </CardTitle>
              <CardDescription className="text-red-700">
                AI駆動の4象限タスク分類システムが利用可能になりました
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 機能説明 */}
        <Alert className="border-blue-200 bg-blue-50">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🎯 4象限マトリックス（アイゼンハワーマトリックス）</strong>
            <br />
            Gemini AIがタスクを重要度・緊急度で自動分類し、生産性を向上させます
          </AlertDescription>
        </Alert>

        {/* 主な特徴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>AI自動分析</span>
            </h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-6">
              <li>• Gemini AIによる自動タスク分類</li>
              <li>• 生産性スコア算出</li>
              <li>• パーソナライズされた改善提案</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>可視化・分析</span>
            </h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-6">
              <li>• 象限別チャート表示</li>
              <li>• リアルタイム進捗追跡</li>
              <li>• 履歴・トレンド分析</li>
            </ul>
          </div>
        </div>

        {/* 4象限の説明 */}
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>4つの象限</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <div>
                <strong className="text-red-600">必須</strong>
                <br />
                <span className="text-gray-600">重要・緊急</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📈</span>
              <div>
                <strong className="text-blue-600">効果性</strong>
                <br />
                <span className="text-gray-600">重要・非緊急</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <div>
                <strong className="text-amber-600">錯覚</strong>
                <br />
                <span className="text-gray-600">非重要・緊急</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🗑️</span>
              <div>
                <strong className="text-gray-600">浪費</strong>
                <br />
                <span className="text-gray-600">非重要・非緊急</span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleTryFeature} className="flex-1 bg-red-600 hover:bg-red-700">
            <Target className="w-4 h-4 mr-2" />
            4象限分析を試す
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button onClick={handleViewGuide} variant="outline" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            使用方法を見る
          </Button>

          <Button onClick={() => navigate('/sitemap')} variant="outline" className="flex-1">
            <Map className="w-4 h-4 mr-2" />
            サイトマップ
          </Button>
        </div>

        {/* 追加情報 */}
        <div className="text-xs text-gray-600 bg-white rounded p-2 border">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>💡 使用のコツ:</strong>
              タスクに詳細な説明、期限、カテゴリを設定すると、AI分析の精度が向上します。
              既存のタスクがある場合、すぐに分析を開始できます。
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewFeatureNotification;
