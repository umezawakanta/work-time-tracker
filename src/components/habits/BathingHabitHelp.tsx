/**
 * 🆘 入浴習慣トラッカー ヘルプシステム
 * 機能説明とFAQ
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Award,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'basic' | 'features' | 'troubleshooting';
}

export const BathingHabitHelp: React.FC<HelpProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'faq'>('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const features = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: '簡単記録',
      description: 'ワンクリックで入浴完了を記録',
      usage: '「入浴完了を記録」ボタンをクリックするだけ',
    },
    {
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      title: 'カレンダー表示',
      description: '月間の継続状況を視覚的に確認',
      usage: '「カレンダー」タブで過去の記録をチェック',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
      title: 'ヒートマップ',
      description: '過去12週間の活動密度を表示',
      usage: '「ヒートマップ」タブで長期的なパターンを分析',
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-600" />,
      title: 'レベルシステム',
      description: '継続日数に応じてレベルアップ',
      usage: '毎日継続することで自動的にレベルが上がります',
    },
    {
      icon: <Zap className="w-5 h-5 text-red-600" />,
      title: '緊急モード',
      description: '入浴が困難な時の代替案を提示',
      usage: '「緊急モード」ボタンで時短・代替手段を確認',
    },
    {
      icon: <Target className="w-5 h-5 text-indigo-600" />,
      title: '進捗分析',
      description: '週間パターンと習慣の定着度を分析',
      usage: '「進捗」タブで詳細な統計情報を確認',
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'どうやって入浴を記録しますか？',
      answer:
        '「入浴完了を記録（簡単）」ボタンをクリックするだけです。詳細を記録したい場合は「詳細記録」を開いて、入浴タイプ、時間、気分などを入力できます。',
      category: 'basic',
    },
    {
      question: 'ストリークとは何ですか？',
      answer:
        'ストリークは連続して入浴を記録した日数です。毎日継続することでストリークが伸び、レベルアップにつながります。',
      category: 'basic',
    },
    {
      question: '緊急モードはいつ使いますか？',
      answer:
        '疲れている、時間がない、やる気が出ないなど、通常の入浴が困難な時に使用します。完璧を求めず、何らかの形で清潔を保つことを重視します。',
      category: 'basic',
    },
    {
      question: 'レベルはどうやって上がりますか？',
      answer:
        '連続記録日数に応じて自動的にレベルアップします。3日→7日→14日→21日→30日→50日→100日の段階でレベルが上がります。',
      category: 'features',
    },
    {
      question: 'カレンダーの色の意味は？',
      answer:
        '緑色は入浴完了、灰色は未完了を表します。アイコンは入浴タイプ（🛁湯船、🚿シャワーなど）を示しています。',
      category: 'features',
    },
    {
      question: 'データが消えてしまいました',
      answer:
        'データはブラウザのローカルストレージに保存されます。ブラウザのデータを削除すると記録も消えてしまいます。定期的なバックアップをおすすめします。',
      category: 'troubleshooting',
    },
    {
      question: 'ボタンが反応しません',
      answer:
        'ページを再読み込みしてください。それでも解決しない場合は、ブラウザのキャッシュをクリアするか、別のブラウザをお試しください。',
      category: 'troubleshooting',
    },
    {
      question: '習慣化には何日かかりますか？',
      answer:
        '一般的に新しい習慣の定着には66日かかると言われています。アプリの「習慣化レベル」で進捗を確認できます。',
      category: 'basic',
    },
  ];

  const basicFAQs = faqs.filter((faq) => faq.category === 'basic');
  const featureFAQs = faqs.filter((faq) => faq.category === 'features');
  const troubleshootingFAQs = faqs.filter((faq) => faq.category === 'troubleshooting');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              ヘルプ・使い方ガイド
            </CardTitle>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* タブナビゲーション */}
        <div className="flex border-b px-6">
          {[
            { id: 'overview', label: '概要', icon: <Lightbulb className="w-4 h-4" /> },
            { id: 'features', label: '機能説明', icon: <Target className="w-4 h-4" /> },
            { id: 'faq', label: 'よくある質問', icon: <HelpCircle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  入浴習慣トラッカーの使い方
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  毎日の入浴習慣を身につけるための4つの簡単なステップ
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">記録する</h3>
                      <p className="text-sm text-gray-600">入浴後に「入浴完了を記録」をクリック</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">継続する</h3>
                      <p className="text-sm text-gray-600">毎日記録してストリークを伸ばす</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">確認する</h3>
                      <p className="text-sm text-gray-600">カレンダーで進捗をチェック</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold">習慣化</h3>
                      <p className="text-sm text-gray-600">66日継続で習慣化完了！</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  重要なポイント
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• 完璧を求めず、継続することを重視しましょう</li>
                  <li>• 困った時は「緊急モード」で代替案を確認</li>
                  <li>• 毎日の小さな積み重ねが大きな変化を生みます</li>
                  <li>• レベルアップを楽しみながら続けましょう</li>
                </ul>
              </div>
            </div>
          )}

          {/* 機能説明タブ */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">機能詳細説明</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-700">
                          <strong>使い方:</strong> {feature.usage}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* よくある質問タブ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">よくある質問</h2>

              {/* 基本的な質問 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  基本的な使い方
                </h3>
                <div className="space-y-2">
                  {basicFAQs.map((faq, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {expandedFAQ === index ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 機能について */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  機能について
                </h3>
                <div className="space-y-2">
                  {featureFAQs.map((faq, index) => {
                    const faqIndex = basicFAQs.length + index;
                    return (
                      <div key={faqIndex} className="border rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faqIndex ? null : faqIndex)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                        >
                          <span className="font-medium">{faq.question}</span>
                          {expandedFAQ === faqIndex ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFAQ === faqIndex && (
                          <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* トラブルシューティング */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  トラブルシューティング
                </h3>
                <div className="space-y-2">
                  {troubleshootingFAQs.map((faq, index) => {
                    const faqIndex = basicFAQs.length + featureFAQs.length + index;
                    return (
                      <div key={faqIndex} className="border rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faqIndex ? null : faqIndex)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                        >
                          <span className="font-medium">{faq.question}</span>
                          {expandedFAQ === faqIndex ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        {expandedFAQ === faqIndex && (
                          <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BathingHabitHelp;
