/**
 * 🎯 入浴習慣トラッカー オンボーディング
 * 初回訪問者向けの使い方ガイド
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  ArrowRight,
  CheckCircle,
  Droplets,
  Calendar,
  TrendingUp,
  Award,
  HelpCircle,
  X,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  highlight?: string;
}

interface BathingHabitOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const BathingHabitOnboarding: React.FC<BathingHabitOnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'ようこそ！入浴習慣トラッカーへ',
      description:
        'このツールは毎日の入浴を習慣化するための包括的なサポートシステムです。一緒に健康的な生活習慣を身につけましょう！',
      icon: <Droplets className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 2,
      title: '簡単記録で始めよう',
      description:
        '「入浴完了を記録」ボタンを押すだけで今日の入浴を記録できます。詳細な情報は後から追加することもできます。',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      action: '入浴完了を記録',
      highlight: 'まずはこのボタンをクリック！',
    },
    {
      id: 3,
      title: '継続を可視化',
      description:
        'カレンダーやヒートマップで継続状況を確認できます。毎日の積み重ねが一目で分かり、モチベーション維持に役立ちます。',
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
    },
    {
      id: 4,
      title: 'レベルアップシステム',
      description:
        '連続記録に応じてレベルが上がります。ビギナーからグランドマスターまで、あなたの成長を楽しみましょう！',
      icon: <Award className="w-8 h-8 text-yellow-500" />,
    },
    {
      id: 5,
      title: '緊急モードで継続サポート',
      description:
        '入浴が困難な時は緊急モードを使用。時短入浴や代替手段で、完璧を求めずに継続することを重視します。',
      icon: <Zap className="w-8 h-8 text-red-500" />,
      action: '緊急モード',
      highlight: '困った時はこちら',
    },
  ];

  const quickStartGuide = [
    {
      step: '1',
      title: '記録ボタンをクリック',
      description: '「入浴完了を記録」で今日の入浴を記録',
    },
    { step: '2', title: '継続を確認', description: 'カレンダーで毎日の記録をチェック' },
    { step: '3', title: 'レベルアップ', description: '連続記録でレベル上昇を目指す' },
    { step: '4', title: '習慣化完了', description: '66日継続で習慣化達成！' },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  if (showQuickStart) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                クイックスタートガイド
              </CardTitle>
              <Button onClick={() => setShowQuickStart(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 mb-6">4つのステップで入浴習慣を身につけましょう</p>

            <div className="space-y-4">
              {quickStartGuide.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={onComplete} className="flex-1">
                始めましょう！
              </Button>
              <Button onClick={onSkip} variant="outline">
                スキップ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-600" />
              使い方ガイド
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                {currentStep + 1}/{steps.length}
              </Badge>
            </CardTitle>
            <Button onClick={onSkip} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 進捗バー */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* ステップコンテンツ */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">{currentStepData.icon}</div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600 leading-relaxed">{currentStepData.description}</p>
            </div>

            {currentStepData.action && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 justify-center">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {currentStepData.highlight}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-white border-blue-300 text-blue-700"
                  disabled
                >
                  {currentStepData.action}
                </Button>
              </div>
            )}
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              ← 前へ
            </Button>

            <div className="flex gap-2">
              <Button onClick={() => setShowQuickStart(true)} variant="outline" size="sm">
                クイックガイド
              </Button>
              <Button onClick={onSkip} variant="outline" size="sm">
                スキップ
              </Button>
            </div>

            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === steps.length - 1 ? '完了' : '次へ →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BathingHabitOnboarding;
