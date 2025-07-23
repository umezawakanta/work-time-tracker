/**
 * 🎮 ゲームループ・タスク管理ページ
 *
 * プロシージネーション対策の革新的システム
 * 参考: https://www.laurieherault.com/articles/a-thermal-receipt-printer-cured-my-procrastination
 */

import React from 'react';
import { GameLoopTaskDashboard } from '@/components/productivity/GameLoopTaskDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Target,
  Zap,
  BookOpen,
  ExternalLink,
  Lightbulb,
  Sparkles,
  Coffee,
  Clock,
  CheckCircle,
} from 'lucide-react';

const GameLoopTaskPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
              <Play className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎮 ゲームループ・タスクシステム
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">プロシージネーション撲滅の革新的アプローチ</p>

          {/* Article Reference */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            <BookOpen className="w-4 h-4" />
            <span>参考記事:</span>
            <a
              href="https://www.laurieherault.com/articles/a-thermal-receipt-printer-cured-my-procrastination"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline flex items-center gap-1"
            >
              A receipt printer cured my procrastination
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Core Concepts */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              🧠 システムの核心コンセプト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Game Loop Concept */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">🎯 ゲームループ</h3>
                <p className="text-sm text-gray-600">
                  <strong>目標 → 実行 → フィードバック</strong>
                  <br />
                  の高頻度繰り返しでドーパミン分泌を促進
                </p>
              </div>

              {/* Micro-tasks */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">⏱️ マイクロタスク</h3>
                <p className="text-sm text-gray-600">
                  <strong>2-5分</strong>の極小タスクに分解
                  <br />
                  開始障壁を限りなく低くする
                </p>
              </div>

              {/* Immediate Feedback */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">⚡ 即座フィードバック</h3>
                <p className="text-sm text-gray-600">
                  <strong>視覚・聴覚・触覚</strong>の多感覚フィードバック
                  <br />
                  脳の報酬系を効果的に刺激
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional vs Game Loop */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                📊 従来手法 vs ゲームループ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">プロシージネーション</span>
                  <div className="flex gap-2">
                    <Badge variant="destructive">従来: 高</Badge>
                    <Badge variant="default">ループ: 低</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">開始のしやすさ</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">従来: 困難</Badge>
                    <Badge variant="default">ループ: 簡単</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完了感・達成感</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">従来: 少</Badge>
                    <Badge variant="default">ループ: 多</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">継続性</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">従来: 不安定</Badge>
                    <Badge variant="default">ループ: 安定</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />✨ 主要機能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">AI支援によるタスク自動分解</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">付箋紙 → 瓶システム（視覚的フィードバック）</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-sm">レシートプリンター風印刷機能</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-sm">Web Audio API による完了音効果</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm">モーニングルーチン自動生成</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm">ストリーク・統計追跡システム</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brown-500" />
              🚀 クイックスタートガイド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold text-sm mb-2">大きなタスクを入力</h4>
                <p className="text-xs text-gray-600">「部屋の掃除」「プレゼン準備」など</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold text-sm mb-2">AI自動分解</h4>
                <p className="text-xs text-gray-600">5-7個のマイクロタスクに自動分解</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold text-sm mb-2">順次実行</h4>
                <p className="text-xs text-gray-600">2-5分の短時間タスクを次々クリア</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold text-sm mb-2">フィードバック獲得</h4>
                <p className="text-xs text-gray-600">音・視覚・統計でドーパミン分泌</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <GameLoopTaskDashboard />

        {/* Footer Info */}
        <Card className="border-0 shadow-lg bg-gray-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">参考記事について</span>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl mx-auto">
              このシステムは Laurie Hérault氏の
              <a
                href="https://www.laurieherault.com/articles/a-thermal-receipt-printer-cured-my-procrastination"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mx-1"
              >
                「A receipt printer cured my procrastination」
              </a>
              記事のアイデアを基に実装されています。
              ゲームデザインの知見を活用した革新的なプロシージネーション対策手法です。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameLoopTaskPage;
