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
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  bathingHabitService,
  BathingRecord,
  BathingPlan,
  HabitStats,
  Barrier,
} from '@/services/habits/BathingHabitService';
import BathingHabitVisualization from './BathingHabitVisualization';
import BathingHabitOnboarding from './BathingHabitOnboarding';
import BathingHabitHelp from './BathingHabitHelp';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<BathingRecord[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // フォームステート
  const [bathingType, setBathingType] = useState<BathingRecord['bathingType']>('shower');
  const [duration, setDuration] = useState(15);
  const [temperature, setTemperature] = useState<BathingRecord['temperature']>('warm');
  const [mood, setMood] = useState<BathingRecord['mood']>('good');
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    console.log('🛁 BathingHabitTracker: コンポーネント初期化開始');
    // 初期データ読み込み
    loadInitialData();

    // イベントリスナーの設定
    const handleBathingCompleted = (record: BathingRecord) => {
      console.log('🎉 入浴完了イベント受信:', record);
      setTodayRecord(record);
      setShowRecordForm(false);
      loadStats();
      loadMotivationalMessage();
      loadRecords(); // 記録データも更新
    };

    const handleBathingSkipped = () => {
      console.log('⏭️ 入浴スキップイベント受信');
      loadStats();
      loadMotivationalMessage();
      loadRecords(); // 記録データも更新
    };

    bathingHabitService.on('bathingCompleted', handleBathingCompleted);
    bathingHabitService.on('bathingSkipped', handleBathingSkipped);

    return () => {
      bathingHabitService.off('bathingCompleted', handleBathingCompleted);
      bathingHabitService.off('bathingSkipped', handleBathingSkipped);
    };
  }, []);

  useEffect(() => {
    // 初回訪問チェック
    const hasVisited = localStorage.getItem('bathing_habit_visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowOnboarding(true);
    } else {
      setIsFirstVisit(false);
    }
  }, []);

  const loadRecords = async () => {
    try {
      // bathingHabitServiceからrecordsを取得する方法を追加
      const allRecords = await bathingHabitService.getAllRecords();
      setRecords(allRecords);
    } catch (err) {
      console.error('❌ 記録データ読み込みエラー:', err);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 初期データ読み込み開始');

      await loadStats();
      await loadMotivationalMessage();
      await loadRecords();

      console.log('✅ 初期データ読み込み完了');
    } catch (err) {
      console.error('❌ 初期データ読み込みエラー:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📈 統計データ読み込み中...');
      const habitStats = bathingHabitService.getHabitStats();
      console.log('📈 取得した統計データ:', habitStats);
      setStats(habitStats);
    } catch (err) {
      console.error('❌ 統計データ読み込みエラー:', err);
      throw err;
    }
  };

  const loadMotivationalMessage = async () => {
    try {
      console.log('💪 モチベーションメッセージ読み込み中...');
      const message = bathingHabitService.getMotivationalMessage();
      console.log('💪 取得したメッセージ:', message);
      setMotivationalMessage(message);
    } catch (err) {
      console.error('❌ モチベーションメッセージ読み込みエラー:', err);
      throw err;
    }
  };

  const handleRecordBathing = async () => {
    try {
      console.log('🚿 入浴記録開始...');
      console.log('🚿 記録データ:', { bathingType, duration, temperature, mood, barriers, notes });

      const record = bathingHabitService.recordBathing(
        bathingType,
        duration,
        temperature,
        mood,
        barriers,
        notes
      );

      console.log('✅ 入浴記録完了:', record);

      // UIを更新
      setTodayRecord(record);
      await loadStats();
      await loadMotivationalMessage();
      await loadRecords(); // 記録データも更新

      // フォームリセット
      setBathingType('shower');
      setDuration(15);
      setTemperature('warm');
      setMood('good');
      setBarriers([]);
      setNotes('');
    } catch (err) {
      console.error('❌ 入浴記録エラー:', err);
      setError('入浴記録の保存に失敗しました');
    }
  };

  const handleSimpleRecord = async () => {
    try {
      console.log('🚿 簡単記録開始...');

      const record = bathingHabitService.recordBathing('shower', 15, 'warm', 'good');
      console.log('✅ 簡単記録完了:', record);

      // UIを更新
      setTodayRecord(record);
      await loadStats();
      await loadMotivationalMessage();
      await loadRecords(); // 記録データも更新
    } catch (err) {
      console.error('❌ 簡単記録エラー:', err);
      setError('入浴記録の保存に失敗しました');
    }
  };

  const handleEmergencyMode = () => {
    try {
      console.log('🚨 緊急モード開始...');
      const emergency = bathingHabitService.activateEmergencyMode();
      console.log('🚨 緊急モード:', emergency);
      alert(
        `緊急モード: ${emergency.motivationalMessages[0]}\n\n提案: ${emergency.urgentStrategies.join(', ')}`
      );
    } catch (err) {
      console.error('❌ 緊急モードエラー:', err);
      setError('緊急モードの実行に失敗しました');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('bathing_habit_visited', 'true');
    setShowOnboarding(false);
    setIsFirstVisit(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('bathing_habit_visited', 'true');
    setShowOnboarding(false);
    setIsFirstVisit(false);
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>入浴習慣データを読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">エラーが発生しました</h3>
                <p className="text-red-800">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    loadInitialData();
                  }}
                  className="mt-3"
                  size="sm"
                >
                  再試行
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p>統計データを読み込めませんでした</p>
            <Button onClick={loadInitialData} className="mt-3">
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* オンボーディング */}
      {showOnboarding && (
        <BathingHabitOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* ヘルプモーダル */}
      {showHelp && <BathingHabitHelp onClose={() => setShowHelp(false)} />}

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
              {isFirstVisit && <Badge className="bg-green-500 text-white animate-pulse">NEW</Badge>}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowOnboarding(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                使い方ガイド
              </Button>
              <Button
                onClick={() => setShowHelp(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                ヘルプ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              毎日の入浴習慣を確実に実現するための包括的支援システム
            </p>
            {isFirstVisit && (
              <Button
                onClick={() => setShowOnboarding(true)}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                ✨ 始める
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* クイックアクションガイド */}
      {!isFirstVisit && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">今日やること</h3>
                  <p className="text-sm text-yellow-700">
                    入浴後に「入浴完了を記録」ボタンをクリックしましょう
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHelp(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white border-yellow-300 text-yellow-700"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  ヘルプ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* エラー表示 */}
      {error && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">エラー</p>
                <p className="text-red-800 text-sm">{error}</p>
                <Button onClick={() => setError(null)} size="sm" variant="outline" className="mt-2">
                  閉じる
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* モチベーションメッセージ */}
      {motivationalMessage && (
        <Card
          className={cn(
            'border-l-4',
            motivationalMessage.type === 'celebration' && 'border-l-green-500 bg-green-50',
            motivationalMessage.type === 'encouragement' && 'border-l-blue-500 bg-blue-50',
            motivationalMessage.type === 'streak_protection' && 'border-l-purple-500 bg-purple-50',
            motivationalMessage.type === 'gentle_push' && 'border-l-orange-500 bg-orange-50'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {motivationalMessage.type === 'celebration'
                  ? '🎉'
                  : motivationalMessage.type === 'streak_protection'
                    ? '⚡'
                    : motivationalMessage.type === 'encouragement'
                      ? '🌟'
                      : '💪'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{motivationalMessage.message}</p>
                <p className="text-sm text-gray-600">{motivationalMessage.action}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今日のアクション - 改善版 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            今日の入浴記録
            {todayRecord?.completed && <Badge className="bg-green-500 text-white">✅ 完了</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!todayRecord?.completed ? (
            <div className="space-y-4">
              {/* メイン記録ボタン */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">入浴を記録しよう</h4>
                    <p className="text-sm text-blue-700">入浴後にボタンをクリックして記録</p>
                  </div>
                </div>
                <Button
                  onClick={handleSimpleRecord}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  disabled={isLoading}
                >
                  {isLoading ? '記録中...' : '🛁 入浴完了を記録'}
                </Button>
              </div>

              {/* 詳細記録・緊急モード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowRecordForm(!showRecordForm)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  詳細記録 {showRecordForm ? '（閉じる）' : '（開く）'}
                </Button>

                <Button
                  onClick={handleEmergencyMode}
                  variant="outline"
                  className="bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  🚨 緊急モード
                </Button>
              </div>

              {/* ヘルプリンク */}
              <div className="text-center">
                <Button
                  onClick={() => setShowHelp(true)}
                  variant="link"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  使い方が分からない場合はこちら
                </Button>
              </div>

              {/* 詳細記録フォーム */}
              {showRecordForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">入浴タイプ</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {(['full_bath', 'shower', 'quick_rinse', 'body_wipe'] as const).map(
                          (type) => (
                            <Button
                              key={type}
                              variant={bathingType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setBathingType(type)}
                              className="text-xs"
                            >
                              {type === 'full_bath' && '🛁 湯船'}
                              {type === 'shower' && '🚿 シャワー'}
                              {type === 'quick_rinse' && '⚡ 時短'}
                              {type === 'body_wipe' && '🧽 拭き取り'}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">所要時間（分）</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min="1"
                        max="120"
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">水温</label>
                      <div className="flex gap-1 mt-1">
                        {(['hot', 'warm', 'lukewarm', 'cool'] as const).map((temp) => (
                          <Button
                            key={temp}
                            variant={temperature === temp ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTemperature(temp)}
                            className="flex-1 text-xs"
                          >
                            {temp === 'hot' && '🔥 熱め'}
                            {temp === 'warm' && '♨️ 温かい'}
                            {temp === 'lukewarm' && '🌊 ぬるい'}
                            {temp === 'cool' && '❄️ 冷たい'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">気分</label>
                      <div className="flex gap-1 mt-1">
                        {(['excellent', 'good', 'neutral', 'reluctant'] as const).map(
                          (moodType) => (
                            <Button
                              key={moodType}
                              variant={mood === moodType ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setMood(moodType)}
                              className="flex-1 text-xs"
                            >
                              {moodType === 'excellent' && '🌟'}
                              {moodType === 'good' && '😊'}
                              {moodType === 'neutral' && '😐'}
                              {moodType === 'reluctant' && '😔'}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">メモ（任意）</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="今日の入浴について何かあれば..."
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>

                  <Button
                    onClick={handleRecordBathing}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? '保存中...' : '💾 詳細記録を保存'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">今日の入浴完了！</h3>
              <p className="text-green-600">{stats.currentStreak}日連続記録中です 🎉</p>
              <Button
                onClick={() => setShowHelp(true)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                他の機能を見る
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 可視化セクションを統計表示の後に追加 */}
      {stats && records.length > 0 && <BathingHabitVisualization stats={stats} records={records} />}

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-l-4 border-l-gray-500 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">🔧 デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <p>
                <strong>Stats:</strong> {stats ? 'OK' : 'NULL'}
              </p>
              <p>
                <strong>Today Record:</strong> {todayRecord ? 'あり' : 'なし'}
              </p>
              <p>
                <strong>Loading:</strong> {isLoading ? 'true' : 'false'}
              </p>
              <p>
                <strong>Error:</strong> {error || 'なし'}
              </p>
              <details>
                <summary>統計データ詳細</summary>
                <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BathingHabitTracker;
