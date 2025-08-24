/**
 * 🎯 ADHD実行力アシスタント
 * リアルタイム実行支援とガイダンス
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Heart,
  Brain,
  Coffee,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  adhdExecutionSupport,
  ExecutionTask,
  ExecutionGuidance,
} from '@/services/adhd/ADHDExecutionSupportService';

export const ADHDExecutionAssistant: React.FC = () => {
  const [currentTask, setCurrentTask] = useState<ExecutionTask | null>(null);
  const [guidance, setGuidance] = useState<ExecutionGuidance | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [taskInput, setTaskInput] = useState('');
  const [mood, setMood] = useState<
    'energetic' | 'focused' | 'tired' | 'distracted' | 'overwhelmed'
  >('focused');

  useEffect(() => {
    // イベントリスナーの設定
    const handleStepCompleted = (data: any) => {
      setCurrentStepIndex(data.task.microSteps.filter((s: any) => s.completed).length);
    };

    const handleInterrupted = () => {
      setIsExecuting(false);
    };

    const handleNeedsSupport = (data: any) => {
      setGuidance({
        type: 'recovery',
        message: data.message,
        visualCue: '🆘',
        nextAction: '少し休憩してリフレッシュしましょう',
        motivationalBoost: '大丈夫、あなたはよくやっています',
      });
    };

    adhdExecutionSupport.on('stepCompleted', handleStepCompleted);
    adhdExecutionSupport.on('interrupted', handleInterrupted);
    adhdExecutionSupport.on('needsSupport', handleNeedsSupport);

    return () => {
      adhdExecutionSupport.off('stepCompleted', handleStepCompleted);
      adhdExecutionSupport.off('interrupted', handleInterrupted);
      adhdExecutionSupport.off('needsSupport', handleNeedsSupport);
    };
  }, []);

  const handleCreateTask = async () => {
    if (!taskInput.trim()) {
      return;
    }

    const task = adhdExecutionSupport.decomposeTask(taskInput, '家庭作業');
    setCurrentTask(task);
    setTaskInput('');
    setCurrentStepIndex(0);
  };

  const handleStartExecution = async () => {
    if (!currentTask) return;

    try {
      const newGuidance = await adhdExecutionSupport.startExecution(currentTask.id, mood);
      setGuidance(newGuidance);
      setIsExecuting(true);
    } catch (error) {
      console.error('Failed to start execution:', error);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    try {
      const newGuidance = adhdExecutionSupport.completeStep(stepId);
      setGuidance(newGuidance);

      // 次のステップへ
      const nextIncompleteIndex =
        currentTask?.microSteps.findIndex((step) => !step.completed) ?? -1;
      if (nextIncompleteIndex === -1) {
        // タスク完了
        setIsExecuting(false);
        setGuidance({
          type: 'celebration',
          message: '🎉 タスク完了！素晴らしい実行力でした！',
          visualCue: '🏆',
          nextAction: '次のタスクを計画する',
          motivationalBoost: 'あなたの実行力が向上しています！',
        });
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const handleInterruption = (
    reason: 'distraction' | 'overwhelm' | 'boredom' | 'external' | 'physical'
  ) => {
    try {
      const newGuidance = adhdExecutionSupport.recordInterruption(reason);
      setGuidance(newGuidance);
      setIsExecuting(false);
    } catch (error) {
      console.error('Failed to record interruption:', error);
    }
  };

  const handleResume = () => {
    try {
      const newGuidance = adhdExecutionSupport.resumeExecution();
      setGuidance(newGuidance);
      setIsExecuting(true);
    } catch (error) {
      console.error('Failed to resume execution:', error);
    }
  };

  const handleEmergencyHelp = () => {
    const newGuidance = adhdExecutionSupport.createEmergencyPlan(5);
    setGuidance(newGuidance);
  };

  const getMoodIcon = (moodType: string) => {
    const icons = {
      energetic: <Zap className="w-4 h-4" />,
      focused: <Target className="w-4 h-4" />,
      tired: <Coffee className="w-4 h-4" />,
      distracted: <Brain className="w-4 h-4" />,
      overwhelmed: <Heart className="w-4 h-4" />,
    };
    return icons[moodType as keyof typeof icons] || <Brain className="w-4 h-4" />;
  };

  const currentStep = currentTask?.microSteps[currentStepIndex];
  const completedSteps = currentTask?.microSteps.filter((step) => step.completed).length || 0;
  const totalSteps = currentTask?.microSteps.length || 0;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {/* ヘッダー */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            🎯 ADHD実行力アシスタント
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              実行特化
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            計画は立てられるけど実行が困難？大丈夫です。マイクロステップと即座のフィードバックで実行力をサポートします。
          </p>
        </CardContent>
      </Card>

      {/* タスク作成 */}
      {!currentTask && (
        <Card>
          <CardHeader>
            <CardTitle>タスクを実行可能に分解</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">実行したいタスク</label>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="例: 部屋の掃除、レポート作成、買い物リスト作成"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">今の気分</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {(['energetic', 'focused', 'tired', 'distracted', 'overwhelmed'] as const).map(
                  (moodType) => (
                    <Button
                      key={moodType}
                      variant={mood === moodType ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMood(moodType)}
                      className="flex items-center gap-1"
                    >
                      {getMoodIcon(moodType)}
                      <span className="text-xs">
                        {moodType === 'energetic' && '元気'}
                        {moodType === 'focused' && '集中'}
                        {moodType === 'tired' && '疲労'}
                        {moodType === 'distracted' && '散漫'}
                        {moodType === 'overwhelmed' && '圧倒'}
                      </span>
                    </Button>
                  )
                )}
              </div>
            </div>

            <Button onClick={handleCreateTask} disabled={!taskInput.trim()} className="w-full">
              タスクを実行可能に分解
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 実行ガイダンス */}
      {guidance && (
        <Card
          className={cn(
            'border-l-4',
            guidance.type === 'celebration' && 'border-l-green-500 bg-green-50',
            guidance.type === 'start' && 'border-l-blue-500 bg-blue-50',
            guidance.type === 'recovery' && 'border-l-orange-500 bg-orange-50',
            guidance.type === 'continue' && 'border-l-purple-500 bg-purple-50'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{guidance.visualCue}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{guidance.message}</p>
                <p className="text-sm text-gray-600 mt-1">{guidance.motivationalBoost}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">次のアクション:</span>
                  <Badge variant="outline">{guidance.nextAction}</Badge>
                  {guidance.timeEstimate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {guidance.timeEstimate}分
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* タスク実行エリア */}
      {currentTask && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>{currentTask.title}</span>
                <Badge variant="outline">{totalSteps}ステップ</Badge>
              </CardTitle>
              <div className="flex gap-2">
                {!isExecuting ? (
                  <Button onClick={handleStartExecution} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    実行開始
                  </Button>
                ) : (
                  <Button
                    onClick={handleResume}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    再開
                  </Button>
                )}
                <Button onClick={handleEmergencyHelp} variant="outline" size="sm">
                  🆘 緊急支援
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  進捗: {completedSteps}/{totalSteps}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {currentTask.microSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    step.completed && 'bg-green-50 border-green-200',
                    index === currentStepIndex &&
                      isExecuting &&
                      'bg-blue-50 border-blue-200 ring-2 ring-blue-300',
                    !step.completed && index !== currentStepIndex && 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : index === currentStepIndex && isExecuting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            step.completed && 'text-green-700',
                            index === currentStepIndex && isExecuting && 'text-blue-700'
                          )}
                        >
                          {step.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{step.estimatedMinutes}分</Badge>
                          <Badge variant="outline">難易度 {step.difficulty}/5</Badge>
                        </div>
                      </div>
                    </div>

                    {index === currentStepIndex && isExecuting && !step.completed && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompleteStep(step.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          完了
                        </Button>
                        <Button
                          onClick={() => handleInterruption('distraction')}
                          variant="outline"
                          size="sm"
                        >
                          中断
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 中断要因ボタン */}
            {isExecuting && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">もし中断してしまったら:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { reason: 'distraction', label: '気が散った', icon: '🎯' },
                    { reason: 'overwhelm', label: '圧倒された', icon: '😰' },
                    { reason: 'boredom', label: '退屈になった', icon: '😴' },
                    { reason: 'external', label: '外部からの中断', icon: '📞' },
                    { reason: 'physical', label: '体調面', icon: '💤' },
                  ].map(({ reason, label, icon }) => (
                    <Button
                      key={reason}
                      onClick={() => handleInterruption(reason as any)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <span>{icon}</span>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 統計とパターン分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            実行パターン分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              const analysis = adhdExecutionSupport.analyzeExecutionPatterns();
              console.log('実行パターン分析:', analysis);
              // 結果をUIに表示する実装
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

export default ADHDExecutionAssistant;
