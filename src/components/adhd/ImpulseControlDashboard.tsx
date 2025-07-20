/**
 * 🛡️ ADHD衝動抑制ダッシュボード
 * 衝動的行動を防ぎ、生活バランスを保護するシステム
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  AlertTriangle,
  Clock,
  Moon,
  Coffee,
  Brain,
  Activity,
  TrendingDown,
  CheckCircle,
  XCircle,
  Pause,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  impulseControlService,
  ImpulseEntry,
  RiskAssessment,
  CoolingOffSession,
} from '@/services/adhd/ImpulseControlService';

export const ImpulseControlDashboard: React.FC = () => {
  const [currentImpulse, setCurrentImpulse] = useState<ImpulseEntry | null>(null);
  const [coolingOffSession, setCoolingOffSession] = useState<CoolingOffSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activityInput, setActivityInput] = useState('');
  const [durationInput, setDurationInput] = useState(30);
  const [urgencyLevel, setUrgencyLevel] = useState(5);
  const [nextDaySchedule, setNextDaySchedule] = useState<string>('');
  const [showEmergencyProtocol, setShowEmergencyProtocol] = useState(false);

  useEffect(() => {
    // イベントリスナーの設定
    const handleImpulseRecorded = (impulse: ImpulseEntry) => {
      setCurrentImpulse(impulse);
      setIsRecording(false);
    };

    const handleCoolingOffStarted = (data: { session: CoolingOffSession }) => {
      setCoolingOffSession(data.session);
    };

    const handleCoolingOffCompleted = () => {
      setCoolingOffSession(null);
    };

    impulseControlService.on('impulseRecorded', handleImpulseRecorded);
    impulseControlService.on('coolingOffStarted', handleCoolingOffStarted);
    impulseControlService.on('coolingOffCompleted', handleCoolingOffCompleted);

    return () => {
      impulseControlService.off('impulseRecorded', handleImpulseRecorded);
      impulseControlService.off('coolingOffStarted', handleCoolingOffStarted);
      impulseControlService.off('coolingOffCompleted', handleCoolingOffCompleted);
    };
  }, []);

  const handleRecordImpulse = () => {
    if (!activityInput.trim()) {
      return;
    }

    setIsRecording(true);
    const scheduleArray = nextDaySchedule
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const impulse = impulseControlService.recordImpulse(
      activityInput,
      durationInput,
      urgencyLevel,
      scheduleArray
    );

    // 高リスクの場合は自動的に冷却期間を開始
    if (
      impulse.riskAssessment.recommendedAction === 'cancel' ||
      impulse.riskAssessment.sleepDeprivationRisk === 'critical'
    ) {
      impulseControlService.startCoolingOff(impulse.id, 20);
    }

    setActivityInput('');
    setNextDaySchedule('');
  };

  const handleDecision = (
    action: 'proceed' | 'delay' | 'substitute' | 'cancel',
    reasoning: string
  ) => {
    if (!currentImpulse) {
      return;
    }

    impulseControlService.recordDecision(
      currentImpulse.id,
      action,
      reasoning,
      coolingOffSession?.duration || 0
    );

    setCurrentImpulse(null);
    setCoolingOffSession(null);
  };

  const handleStartCoolingOff = () => {
    if (!currentImpulse) {
      return;
    }

    impulseControlService.startCoolingOff(currentImpulse.id, 15);
  };

  const handleEmergencyProtocol = () => {
    const protocol = impulseControlService.emergencyImpulseControl();
    setShowEmergencyProtocol(true);

    // 自動的に冷却期間を開始
    if (currentImpulse) {
      impulseControlService.startCoolingOff(currentImpulse.id, protocol.timeLimit);
    }
  };

  const getRiskColor = (risk: RiskAssessment['sleepDeprivationRisk']) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getUrgencyIcon = (level: number) => {
    if (level >= 8) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (level >= 6) return <Activity className="w-4 h-4 text-orange-600" />;
    if (level >= 4) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* ヘッダー */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            🛡️ ADHD衝動抑制システム
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              バランス保護
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            やりたいことの衝動を記録し、睡眠時間や翌日への影響を評価して適切な判断をサポートします。
            衝動的行動による生活バランスの崩壊を防ぎます。
          </p>
        </CardContent>
      </Card>

      {/* 緊急プロトコル */}
      {showEmergencyProtocol && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">🛑 緊急衝動抑制プロトコル</h3>
                <p className="text-red-800 mb-3">
                  深刻なリスクが検出されました。まず以下の活動で心を落ち着けてください：
                </p>
                <ul className="space-y-1 text-sm text-red-700 mb-3">
                  <li>• 深呼吸を10回する</li>
                  <li>• 冷たい水を飲む</li>
                  <li>• 5分間散歩する</li>
                  <li>• 明日の予定を確認する</li>
                </ul>
                <Button
                  onClick={() => setShowEmergencyProtocol(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white border-red-300 text-red-700"
                >
                  理解しました
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 衝動記録フォーム */}
      {!currentImpulse && !coolingOffSession && (
        <Card>
          <CardHeader>
            <CardTitle>やりたいことの記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">今やりたいこと</label>
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                placeholder="例: YouTubeを見る、ゲームをする、プログラミング、読書"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">予想時間（分）</label>
                <input
                  type="number"
                  value={durationInput}
                  onChange={(e) => setDurationInput(Number(e.target.value))}
                  min="5"
                  max="480"
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">衝動の強さ（1-10）</label>
                <input
                  type="range"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1: 軽い欲求</span>
                  <span>{urgencyLevel}</span>
                  <span>10: 我慢できない</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">明日の予定（カンマ区切り）</label>
              <input
                type="text"
                value={nextDaySchedule}
                onChange={(e) => setNextDaySchedule(e.target.value)}
                placeholder="例: 朝8時出勤, 重要な会議, 早朝ランニング"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRecordImpulse}
                disabled={!activityInput.trim() || isRecording}
                className="flex-1"
              >
                {isRecording ? '評価中...' : 'リスク評価を開始'}
              </Button>
              <Button
                onClick={handleEmergencyProtocol}
                variant="outline"
                className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              >
                🚨 緊急制御
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 冷却期間セッション */}
      {coolingOffSession && (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-purple-600" />
              冷却期間中（{coolingOffSession.duration}分間）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-800 mb-4">
              衝動を落ち着けるために少し待ちましょう。以下の活動で心を整えてください：
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {coolingOffSession.activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-700">冷却期間終了まで:</span>
              <div className="flex-1 bg-purple-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* リスク評価結果 */}
      {currentImpulse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />「{currentImpulse.activity}」のリスク評価
              <div className="flex items-center gap-1">
                {getUrgencyIcon(currentImpulse.urgencyLevel)}
                <span className="text-sm">緊急度 {currentImpulse.urgencyLevel}/10</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* リスクレベル表示 */}
            <div
              className={cn(
                'p-4 rounded-lg border-2',
                getRiskColor(currentImpulse.riskAssessment.sleepDeprivationRisk)
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5" />
                <span className="font-medium">睡眠への影響</span>
              </div>
              <p className="text-sm mb-3">{currentImpulse.riskAssessment.warningMessage}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">現在時刻:</span>
                  <span className="ml-2 font-medium">{currentImpulse.currentTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">予想時間:</span>
                  <span className="ml-2 font-medium">{currentImpulse.estimatedDuration}分</span>
                </div>
              </div>
            </div>

            {/* 推奨アクション */}
            <div className="space-y-3">
              <h4 className="font-medium">
                💡 推奨アクション: {currentImpulse.riskAssessment.recommendedAction}
              </h4>

              {currentImpulse.riskAssessment.alternatives.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">代替案:</h5>
                  <ul className="space-y-1">
                    {currentImpulse.riskAssessment.alternatives.map((alt, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 決定ボタン */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
              <Button
                onClick={() => handleDecision('proceed', '自己責任で実行することを選択')}
                variant={
                  currentImpulse.riskAssessment.recommendedAction === 'proceed'
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                実行する
              </Button>
              <Button
                onClick={() => handleDecision('delay', '適切な時間に延期することを選択')}
                variant={
                  currentImpulse.riskAssessment.recommendedAction === 'delay'
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                延期する
              </Button>
              <Button
                onClick={() => handleDecision('substitute', '代替活動を選択')}
                variant={
                  currentImpulse.riskAssessment.recommendedAction === 'substitute'
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <TrendingDown className="w-4 h-4" />
                代替案
              </Button>
              <Button
                onClick={() => handleDecision('cancel', '今回は諦めることを選択')}
                variant={
                  currentImpulse.riskAssessment.recommendedAction === 'cancel'
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                諦める
              </Button>
            </div>

            {/* 冷却期間ボタン */}
            {!coolingOffSession && (
              <div className="pt-2 border-t">
                <Button
                  onClick={handleStartCoolingOff}
                  variant="outline"
                  className="w-full bg-purple-50 border-purple-300 text-purple-700"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  15分間の冷却期間を取る
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* パターン分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            衝動パターン分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              const analysis = impulseControlService.analyzeImpulsePatterns();
              console.log('衝動パターン分析:', analysis);
              // 実際の実装では結果をUIに表示
            }}
            variant="outline"
            className="w-full"
          >
            パターンを分析して改善提案を表示
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpulseControlDashboard;
