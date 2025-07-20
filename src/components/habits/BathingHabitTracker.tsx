/**
 * 🛁 入浴習慣トラッカー
 * 毎日の入浴を確実に実現するための包括的支援ダッシュボード
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Award,
  Calendar,
  Settings,
  BarChart3,
  Thermometer,
  Timer,
  HelpCircle,
  BookOpen,
  Info,
  Play,
  ChevronRight,
  Users,
  Bell,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  bathingHabitService,
  BathingRecord,
  BathingPlan,
  HabitStats,
  Barrier,
} from '@/services/habits/BathingHabitService';

export const BathingHabitTracker: React.FC = () => {
  const [todayRecord, setTodayRecord] = useState<BathingRecord | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showPlanSetup, setShowPlanSetup] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<any>(null);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<
    'overview' | 'features' | 'emergency' | 'tips'
  >('overview');

  // フォームステート
  const [bathingType, setBathingType] = useState<BathingRecord['bathingType']>('shower');
  const [duration, setDuration] = useState(15);
  const [temperature, setTemperature] = useState<BathingRecord['temperature']>('warm');
  const [mood, setMood] = useState<BathingRecord['mood']>('good');
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // 初期データ読み込み
    loadInitialData();

    // イベントリスナーの設定
    const handleBathingCompleted = (record: BathingRecord) => {
      setTodayRecord(record);
      setShowRecordForm(false);
      loadStats();
      loadMotivationalMessage();
    };

    const handleBathingSkipped = () => {
      loadStats();
      loadMotivationalMessage();
    };

    bathingHabitService.on('bathingCompleted', handleBathingCompleted);
    bathingHabitService.on('bathingSkipped', handleBathingSkipped);

    return () => {
      bathingHabitService.off('bathingCompleted', handleBathingCompleted);
      bathingHabitService.off('bathingSkipped', handleBathingSkipped);
    };
  }, []);

  const loadInitialData = () => {
    loadStats();
    loadMotivationalMessage();
  };

  const loadStats = () => {
    const habitStats = bathingHabitService.getHabitStats();
    setStats(habitStats);
  };

  const loadMotivationalMessage = () => {
    const message = bathingHabitService.getMotivationalMessage();
    setMotivationalMessage(message);
  };

  if (!stats) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* ヘッダーと使い方ガイドボタン */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-6 h-6 text-blue-600" />
              🛁 入浴習慣トラッカー
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                習慣化支援
              </Badge>
            </CardTitle>
            <Button
              onClick={() => setShowUsageGuide(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              使い方ガイド
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            毎日の入浴習慣を確実に実現するための包括的支援システム
          </p>
        </CardContent>
      </Card>

      {/* 使い方ガイドモーダル */}
      {showUsageGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  入浴習慣トラッカー 使い方ガイド
                </h2>
                <Button onClick={() => setShowUsageGuide(false)} variant="outline" size="sm">
                  ✕ 閉じる
                </Button>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="flex border-b">
              {[
                { id: 'overview', label: '概要', icon: <Info className="w-4 h-4" /> },
                { id: 'features', label: '機能詳細', icon: <Settings className="w-4 h-4" /> },
                { id: 'emergency', label: '緊急モード', icon: <AlertCircle className="w-4 h-4" /> },
                { id: 'tips', label: '成功のコツ', icon: <Target className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGuideTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                    activeGuideTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* タブコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeGuideTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      システムの目的
                    </h3>
                    <p className="text-gray-700 mb-4">
                      毎日の入浴習慣を確実に実現するための包括的サポートシステムです。
                      完璧主義に陥らず、継続することを最重視したアプローチで、無理なく習慣化を支援します。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Play className="w-4 h-4 text-green-600" />
                      基本的な使い方
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-medium">入浴完了を記録</p>
                          <p className="text-sm text-gray-600">
                            入浴後に「入浴完了を記録」ボタンをクリック
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-medium">詳細情報を入力</p>
                          <p className="text-sm text-gray-600">
                            入浴タイプ（湯船/シャワー）、所要時間、気分を記録
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <div>
                          <p className="font-medium">ストリーク更新</p>
                          <p className="text-sm text-gray-600">
                            連続記録が自動更新され、モチベーションメッセージが表示
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      統計と追跡
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-sm">現在のストリーク</span>
                        </div>
                        <p className="text-xs text-gray-600">連続入浴日数を表示</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-sm">最長記録</span>
                        </div>
                        <p className="text-xs text-gray-600">過去最高の連続記録</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">成功率</span>
                        </div>
                        <p className="text-xs text-gray-600">過去30日間の達成率</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      主要機能詳細
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-l-blue-500 pl-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        自動リマインダーシステム
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        設定した時間に段階的にリマインダーを送信：
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          • <strong>標準リマインダー</strong>: 設定時刻に送信
                        </li>
                        <li>
                          • <strong>緊急リマインダー</strong>: 1時間後に再送信
                        </li>
                        <li>
                          • <strong>最終警告</strong>: さらに30分後に最終通知
                        </li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-l-green-500 pl-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-green-600" />
                        マイルストーン達成システム
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">継続日数に応じてバッジを獲得：</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>🌟 7日 - 1週間継続バッジ</span>
                        <span>💎 14日 - 2週間マスターバッジ</span>
                        <span>🏅 21日 - 習慣化チャンピオン</span>
                        <span>👑 30日 - 1ヶ月継続王者</span>
                        <span>🚀 50日 - ストリークレジェンド</span>
                        <span>🎯 100日 - グランドマスター</span>
                      </div>
                    </div>

                    <div className="border-l-4 border-l-purple-500 pl-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        パターン分析機能
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">個人の入浴パターンを自動分析：</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 入浴しやすい時間帯の特定</li>
                        <li>• よくある障害要因の分析</li>
                        <li>• 成功した戦略の記録</li>
                        <li>• 週間パターンの可視化</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-l-orange-500 pl-4">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        パーソナライズ機能
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">個人に合わせたカスタマイズ：</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 好みの入浴時間設定</li>
                        <li>• 最低限の基準設定（シャワーだけでもOKなど）</li>
                        <li>• 個人的な障害要因の記録</li>
                        <li>• モチベーションメッセージのカスタマイズ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'emergency' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      緊急モード機能
                    </h3>
                    <p className="text-gray-700 mb-4">
                      入浴を忘れそうな時や、どうしても億劫な時のための支援システムです。
                      完璧な入浴よりも「何かしらの清潔維持」を優先します。
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      緊急モードの発動条件
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• 設定時刻を大幅に過ぎた場合</li>
                      <li>• ストリーク途切れの危険がある場合</li>
                      <li>• ユーザーが手動で緊急モードを選択した場合</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                      段階的な代替案
                    </h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="font-medium text-green-700 mb-2">🟢 軽度の代替案</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 5分だけの超短時間シャワー</li>
                          <li>• 洗髪なしでボディだけ洗う</li>
                          <li>• 朝シャワーへの変更</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="font-medium text-orange-700 mb-2">🟡 中度の代替案</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 濡れタオルでの全身拭き取り</li>
                          <li>• 足湯だけでもOK</li>
                          <li>• 制汗剤とドライシャンプー使用</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="font-medium text-red-700 mb-2">🔴 最小限の代替案</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 顔と手だけ洗う</li>
                          <li>• 清拭用ウェットティッシュで全身</li>
                          <li>• 足だけお湯で洗う</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 重要な考え方</h4>
                    <p className="text-sm text-blue-700">
                      「何もしない」よりも「少しでもする」ことを重視します。
                      完璧を求めすぎると習慣が途切れてしまうため、柔軟性を持たせています。
                    </p>
                  </div>
                </div>
              )}

              {activeGuideTab === 'tips' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      成功のコツとベストプラクティス
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        1. 段階的アプローチ
                      </h4>
                      <div className="text-sm text-green-700 space-y-2">
                        <p className="font-medium">優先順位の考え方：</p>
                        <div className="ml-4 space-y-1">
                          <p>
                            🟢 <strong>理想</strong>: 完璧な入浴（湯船 + 洗髪）
                          </p>
                          <p>
                            🟡 <strong>標準</strong>: シャワーだけ
                          </p>
                          <p>
                            🟠 <strong>最低限</strong>: 体を拭く
                          </p>
                          <p>
                            🔴 <strong>緊急時</strong>: 手足だけ洗う
                          </p>
                        </div>
                        <p className="mt-2 italic">「何もしない」より「少しでもする」を重視</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        2. 時間の柔軟性
                      </h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <ul className="space-y-1">
                          <li>
                            • <strong>メインタイム</strong>: 最も入浴しやすい時間を設定
                          </li>
                          <li>
                            • <strong>バックアップタイム</strong>: 代替時間も準備しておく
                          </li>
                          <li>
                            • <strong>朝シャワー</strong>: 夜が難しい場合の切り替え案
                          </li>
                          <li>
                            • <strong>時短ルーティン</strong>: 忙しい日用の5分プラン
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        3. 視覚的モチベーション活用
                      </h4>
                      <div className="text-sm text-purple-700 space-y-2">
                        <ul className="space-y-1">
                          <li>
                            • <strong>ストリーク数</strong>: 連続記録を意識する
                          </li>
                          <li>
                            • <strong>週間パターン</strong>: 成功パターンを確認
                          </li>
                          <li>
                            • <strong>マイルストーン</strong>: 7日、14日、21日を目標に
                          </li>
                          <li>
                            • <strong>成功率</strong>: 80%以上を維持目標
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        4. 環境整備
                      </h4>
                      <div className="text-sm text-orange-700 space-y-2">
                        <ul className="space-y-1">
                          <li>
                            • <strong>物理的準備</strong>: タオルや着替えを事前準備
                          </li>
                          <li>
                            • <strong>温度設定</strong>: 季節に応じた快適温度
                          </li>
                          <li>
                            • <strong>時短アイテム</strong>: ドライシャンプー、ボディシートを常備
                          </li>
                          <li>
                            • <strong>リマインダー</strong>: スマホアラームと併用
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        5. 失敗時の対処法
                      </h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <ul className="space-y-1">
                          <li>
                            • <strong>完璧主義回避</strong>: 1日休んでも問題なし
                          </li>
                          <li>
                            • <strong>即座の復帰</strong>: 翌日すぐに再開
                          </li>
                          <li>
                            • <strong>原因分析</strong>: 何が障害だったかを記録
                          </li>
                          <li>
                            • <strong>戦略調整</strong>: 時間や方法を見直し
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      最重要ポイント
                    </h4>
                    <p className="text-sm text-yellow-700 font-medium">
                      100点の入浴を目指すのではなく、毎日何らかの形で体をきれいにする習慣を維持することが目標です。
                      継続こそが最大の成功です。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 統計表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">現在のストリーク</p>
                <p className="text-2xl font-bold text-blue-600">{stats.currentStreak}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium">最長記録</p>
                <p className="text-2xl font-bold text-purple-600">{stats.longestStreak}日</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">成功率</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクセス機能説明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            主要機能
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-sm">自動リマインダー</p>
                <p className="text-xs text-gray-600">設定時刻に段階的通知でサポート</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <p className="font-medium text-sm">緊急モード</p>
                <p className="text-xs text-gray-600">時短・代替案でストリーク維持</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-medium text-sm">パターン分析</p>
                <p className="text-xs text-gray-600">個人の習慣パターンを自動分析</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-sm">マイルストーン</p>
                <p className="text-xs text-gray-600">継続記録でバッジ獲得</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日のアクション */}
      <Card>
        <CardHeader>
          <CardTitle>今日の入浴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => {
                bathingHabitService.recordBathing('shower', 15, 'warm', 'good');
              }}
              className="w-full"
            >
              入浴完了を記録
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const emergency = bathingHabitService.activateEmergencyMode();
                  console.log('緊急モード:', emergency);
                }}
                variant="outline"
                size="sm"
                className="flex-1 bg-red-50 text-red-700"
              >
                🚨 緊急モード
              </Button>
              <Button
                onClick={() => setShowUsageGuide(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                ヘルプ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BathingHabitTracker;
