/**
 * 📖 ダッシュボード使い方ガイド
 * 初回訪問者や迷ったユーザー向けの包括的な使い方説明
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Crown,
  Target,
  CheckSquare,
  Clock,
  Award,
  Brain,
  Gamepad2,
  BarChart3,
  Droplets,
  Scissors,
  Play,
  Info,
  Lightbulb,
  Rocket,
  Shield,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    path?: string;
    onClick?: () => void;
  };
  features: string[];
  priority: 'high' | 'medium' | 'low';
  category: '必須機能' | '生産性向上' | '健康管理' | 'エンターテイメント';
}

interface DashboardGuideProps {
  onClose?: () => void;
  className?: string;
}

export const DashboardGuide: React.FC<DashboardGuideProps> = ({ onClose, className }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const guideSteps: GuideStep[] = [
    {
      id: 'welcome',
      title: '🎉 LifeSyncへようこそ！',
      description: '生産性向上プラットフォームの使い方をご説明します',
      icon: <Rocket className="h-8 w-8 text-blue-500" />,
      features: [
        '⚡ AIサポートでタスク管理を自動化',
        '🎮 ゲーミフィケーションでモチベーション維持',
        '📊 統合ダッシュボードで進捗を可視化',
        '🏆 バッジシステムで成果を実感',
      ],
      priority: 'high',
      category: '必須機能',
    },
    {
      id: 'life-support',
      title: '🤗 ライフサポートAI',
      description: '迷った時の最初の相談窓口',
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      action: {
        text: '🤗 AIに相談してみる',
        onClick: () => {
          const event = new CustomEvent('openLifeSupportBot', {
            detail: { action: 'life-support' },
          });
          window.dispatchEvent(event);
        },
      },
      features: [
        '💬 何をすべきか迷った時の相談',
        '📅 今日のプランを立てるサポート',
        '🚨 緊急時の対処法アドバイス',
        '🧠 心理的サポートとモチベーション維持',
      ],
      priority: 'high',
      category: '必須機能',
    },
    {
      id: 'task-management',
      title: '📋 タスク管理システム',
      description: '毎日のやることを効率的に管理',
      icon: <CheckSquare className="h-8 w-8 text-green-500" />,
      action: {
        text: 'ToDo管理を開く',
        path: '/todos',
      },
      features: [
        '✅ 簡単なタスク追加と完了管理',
        '📊 AIによる次のタスク提案',
        '⏰ 期限管理とリマインダー',
        '📈 生産性の分析とレポート',
      ],
      priority: 'high',
      category: '必須機能',
    },
    {
      id: 'gamification',
      title: '🎮 ゲーミフィケーション',
      description: 'レベルアップとバッジでモチベーション維持',
      icon: <Gamepad2 className="h-8 w-8 text-purple-500" />,
      action: {
        text: 'ゲーム画面を見る',
        path: '/gamification',
      },
      features: [
        '🎯 タスク完了でXP獲得',
        '🏆 各種バッジの収集',
        '📊 レベルアップシステム',
        '🔥 連続ストリーク記録',
      ],
      priority: 'medium',
      category: 'エンターテイメント',
    },
    {
      id: 'asset-quest',
      title: '🏰 資産形成クエスト',
      description: 'お金の管理をゲーム感覚で',
      icon: <Crown className="h-8 w-8 text-yellow-500" />,
      action: {
        text: 'クエスト開始',
        path: '/asset-quest',
      },
      features: [
        '💰 家計簿をゲーム風に管理',
        '🐉 AIチャットボット「ドクエ」のサポート',
        '📈 資産の可視化とアドバイス',
        '🎯 貯金目標の設定と達成管理',
      ],
      priority: 'medium',
      category: '生産性向上',
    },
    {
      id: 'work-time',
      title: '⏰ 勤怠・時間管理',
      description: '作業時間を記録して生産性を向上',
      icon: <Clock className="h-8 w-8 text-teal-500" />,
      action: {
        text: '勤怠記録を開く',
        path: '/work-time',
      },
      features: [
        '⏱️ ワンクリックで打刻',
        '📊 作業時間の分析レポート',
        '🎯 生産性の可視化',
        '📅 週間・月間のサマリー',
      ],
      priority: 'high',
      category: '必須機能',
    },
    {
      id: 'habits',
      title: '🧘 習慣管理',
      description: '健康的な生活習慣を身につける',
      icon: <Droplets className="h-8 w-8 text-blue-500" />,
      action: {
        text: '習慣管理を見る',
        path: '/bathing-habit',
      },
      features: [
        '🛁 入浴習慣の記録と継続支援',
        '🪒 髭剃り習慣の管理',
        '📊 習慣の可視化とストリーク',
        '🎯 マイルストーン達成システム',
      ],
      priority: 'medium',
      category: '健康管理',
    },
    {
      id: 'adhd-support',
      title: '🧠 ADHD実行力支援',
      description: '計画から実行まで細かくサポート',
      icon: <Brain className="h-8 w-8 text-indigo-500" />,
      action: {
        text: 'ADHD支援を開く',
        path: '/adhd-execution',
      },
      features: [
        '📋 タスクの細分化サポート',
        '⚡ 衝動的な行動の抑制',
        '🎯 集中力向上のテクニック',
        '📊 実行パターンの分析',
      ],
      priority: 'medium',
      category: '生産性向上',
    },
    {
      id: 'quality-tools',
      title: '🛡️ 品質管理ツール',
      description: '開発品質とシステムの監視',
      icon: <Shield className="h-8 w-8 text-red-500" />,
      action: {
        text: '品質ダッシュボード',
        path: '/quality-dashboard',
      },
      features: [
        '🔍 エラー監視とアラート',
        '📊 パフォーマンス分析',
        '🧪 テストカバレッジ確認',
        '⚡ サイト最適化の提案',
      ],
      priority: 'low',
      category: '生産性向上',
    },
  ];

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const currentStepData = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '必須機能':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '生産性向上':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case '健康管理':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'エンターテイメント':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className={cn('border-0 shadow-2xl bg-white/95 backdrop-blur-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <HelpCircle className="h-8 w-8 text-blue-500" />
            LifeSync 使い方ガイド
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="text-sm text-slate-600">
            {currentStep + 1} / {guideSteps.length}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 現在のステップ */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">{currentStepData.icon}</div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentStepData.title}</h3>
            <p className="text-slate-600 text-lg">{currentStepData.description}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Badge className={getPriorityColor(currentStepData.priority)}>
              優先度:{' '}
              {currentStepData.priority === 'high'
                ? '高'
                : currentStepData.priority === 'medium'
                  ? '中'
                  : '低'}
            </Badge>
            <Badge className={getCategoryColor(currentStepData.category)}>
              {currentStepData.category}
            </Badge>
          </div>
        </div>

        {/* 機能リスト */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            主な機能
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        {currentStepData.action && (
          <div className="text-center">
            <Button
              onClick={() => {
                if (currentStepData.action?.path) {
                  navigate(currentStepData.action.path);
                } else if (currentStepData.action?.onClick) {
                  currentStepData.action.onClick();
                }
                handleStepComplete(currentStepData.id);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {currentStepData.action.text}
            </Button>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>

          <div className="flex gap-2">
            {guideSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  index === currentStep
                    ? 'bg-blue-500 scale-125'
                    : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (isLastStep) {
                onClose?.();
              } else {
                setCurrentStep(Math.min(guideSteps.length - 1, currentStep + 1));
              }
            }}
            className="flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle className="h-4 w-4" />
                完了
              </>
            ) : (
              <>
                次へ
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* 完了ステップの表示 */}
        {completedSteps.size > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                完了した機能: {completedSteps.size}/{guideSteps.length}
              </span>
            </div>
            <div className="text-sm text-green-700">
              素晴らしい！あと {guideSteps.length - completedSteps.size}{' '}
              機能をチェックして、LifeSyncを完全活用しましょう！
            </div>
          </div>
        )}

        {/* ヘルプリンク */}
        <div className="text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <Info className="h-4 w-4" />
            困った時は画面上部の「🤗 相談する」ボタンでAIサポートを受けられます
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
