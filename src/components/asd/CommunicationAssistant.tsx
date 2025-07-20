/**
 * 🗣️ ASDコミュニケーションアシスタント
 * 「最近どう？」などの抽象的質問への回答支援
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  HelpCircle,
  Target,
  Users,
  BookOpen,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  communicationSupportService,
  QuestionBreakdown,
  ResponseTemplate,
  PersonalContext,
} from '@/services/asd/CommunicationSupportService';

export const CommunicationAssistant: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState('最近どう？');
  const [breakdown, setBreakdown] = useState<QuestionBreakdown | null>(null);
  const [responseTemplate, setResponseTemplate] = useState<ResponseTemplate | null>(null);
  const [selectedContext, setSelectedContext] = useState<
    'work' | 'casual' | 'family' | 'medical' | 'social'
  >('casual');
  const [selectedRelationship, setSelectedRelationship] = useState<
    'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family' | 'colleague'
  >('friend');
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [personalContext, setPersonalContext] = useState<PersonalContext | null>(null);

  useEffect(() => {
    // イベントリスナーの設定
    const handleQuestionAnalyzed = (data: QuestionBreakdown) => {
      setBreakdown(data);
    };

    const handleTemplatesGenerated = (data: ResponseTemplate) => {
      setResponseTemplate(data);
    };

    communicationSupportService.on('questionAnalyzed', handleQuestionAnalyzed);
    communicationSupportService.on('templatesGenerated', handleTemplatesGenerated);

    return () => {
      communicationSupportService.off('questionAnalyzed', handleQuestionAnalyzed);
      communicationSupportService.off('templatesGenerated', handleTemplatesGenerated);
    };
  }, []);

  const handleAnalyzeQuestion = () => {
    const questionBreakdown = communicationSupportService.breakDownAbstractQuestion(
      currentQuestion,
      selectedContext,
      selectedRelationship
    );
    setBreakdown(questionBreakdown);

    const templates = communicationSupportService.generateResponseTemplates(
      selectedContext,
      selectedRelationship,
      true
    );
    setResponseTemplate(templates);
  };

  const handleEmergencyResponse = () => {
    const emergency = communicationSupportService.generateEmergencyResponse(selectedRelationship);
    setShowEmergencyMode(true);
    console.log('緊急対応:', emergency);
  };

  const handlePracticeMode = () => {
    const practice = communicationSupportService.startConversationPractice(
      'daily_greeting',
      selectedRelationship
    );
    setPracticeMode(true);
    console.log('練習開始:', practice);
  };

  const getContextIcon = (context: string) => {
    const icons = {
      work: <Target className="w-4 h-4" />,
      casual: <MessageCircle className="w-4 h-4" />,
      family: <Users className="w-4 h-4" />,
      medical: <AlertCircle className="w-4 h-4" />,
      social: <BookOpen className="w-4 h-4" />,
    };
    return icons[context as keyof typeof icons] || <MessageCircle className="w-4 h-4" />;
  };

  const getRelationshipColor = (relationship: string) => {
    const colors = {
      stranger: 'bg-gray-100 text-gray-700',
      acquaintance: 'bg-blue-100 text-blue-700',
      friend: 'bg-green-100 text-green-700',
      close_friend: 'bg-purple-100 text-purple-700',
      family: 'bg-pink-100 text-pink-700',
      colleague: 'bg-orange-100 text-orange-700',
    };
    return colors[relationship as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* ヘッダー */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            🗣️ ASDコミュニケーションアシスタント
            <Badge variant="outline" className="bg-green-100 text-green-700">
              会話支援
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            「最近どう？」などの抽象的な質問を具体化し、適切な回答をサポートします。
            相手との関係性や状況に応じたパーソナライズされた回答例を提供します。
          </p>
        </CardContent>
      </Card>

      {/* 緊急対応モード */}
      {showEmergencyMode && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">🚨 緊急対応モード</h3>
                <p className="text-red-800 mb-3">今すぐ答える必要がある場合の簡潔な回答：</p>
                <div className="bg-white p-3 rounded border border-red-200 mb-3">
                  <p className="font-medium text-red-900">「元気です、ありがとうございます。」</p>
                </div>
                <Button
                  onClick={() => setShowEmergencyMode(false)}
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

      {/* 質問分析設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            質問と状況の設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="question-input" className="text-sm font-medium">
              受けた質問
            </label>
            <input
              id="question-input"
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="例: 最近どう？、元気？、調子はどう？"
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">状況・場面</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['work', 'casual', 'family', 'medical', 'social'] as const).map((context) => (
                  <Button
                    key={context}
                    variant={selectedContext === context ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedContext(context)}
                    className="flex items-center gap-1"
                  >
                    {getContextIcon(context)}
                    <span className="text-xs">
                      {context === 'work' && '職場'}
                      {context === 'casual' && '日常'}
                      {context === 'family' && '家族'}
                      {context === 'medical' && '医療'}
                      {context === 'social' && '社交'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">相手との関係</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(
                  [
                    'stranger',
                    'acquaintance',
                    'colleague',
                    'friend',
                    'close_friend',
                    'family',
                  ] as const
                ).map((relationship) => (
                  <Button
                    key={relationship}
                    variant={selectedRelationship === relationship ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRelationship(relationship)}
                    className="text-xs"
                  >
                    {relationship === 'stranger' && '初対面'}
                    {relationship === 'acquaintance' && '知人'}
                    {relationship === 'colleague' && '同僚'}
                    {relationship === 'friend' && '友人'}
                    {relationship === 'close_friend' && '親友'}
                    {relationship === 'family' && '家族'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyzeQuestion} className="flex-1">
              質問を分析して回答例を生成
            </Button>
            <Button
              onClick={handleEmergencyResponse}
              variant="outline"
              className="bg-red-50 text-red-700"
            >
              🚨 緊急回答
            </Button>
            <Button onClick={handlePracticeMode} variant="outline">
              💪 練習モード
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 質問分解結果 */}
      {breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />「{breakdown.originalQuestion}」の具体化
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">相手が実際に知りたいことは：</h4>
              <ul className="space-y-2">
                {breakdown.specificQuestions.map((question, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm">{question}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">推奨回答の長さ:</span>
              <Badge variant="outline">
                {breakdown.expectedResponseLength === 'brief' && '簡潔 (1-2文)'}
                {breakdown.expectedResponseLength === 'moderate' && '普通 (2-3文)'}
                {breakdown.expectedResponseLength === 'detailed' && '詳細 (3-4文)'}
              </Badge>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">話題候補:</h5>
              <div className="flex flex-wrap gap-1">
                {breakdown.suggestedTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 回答テンプレート */}
      {responseTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              回答例とテンプレート
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['brief', 'moderate', 'detailed'] as const).map((length) => (
              <div key={length} className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {length === 'brief' && '簡潔な回答 (急いでいるとき)'}
                  {length === 'moderate' && '標準的な回答 (通常の会話)'}
                  {length === 'detailed' && '詳細な回答 (親しい相手)'}
                </h4>
                <div className="space-y-2">
                  {responseTemplate.templates[length].map((template, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigator.clipboard?.writeText(template)}
                    >
                      <p className="text-sm">{template}</p>
                      <span className="text-xs text-gray-500 mt-1 block">クリックでコピー</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {responseTemplate.followUpQuestions.length > 0 && (
              <div className="pt-4 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  相手への質問で会話を続ける場合:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {responseTemplate.followUpQuestions.map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => navigator.clipboard?.writeText(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 個人設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            個人状況の設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            最近の出来事や現在の状況を記録しておくと、より自然な回答例を生成できます。
          </p>
          <Button variant="outline" className="w-full">
            個人状況を更新する
          </Button>
        </CardContent>
      </Card>

      {/* 学習と練習 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            コミュニケーション学習
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              会話パターン学習
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              練習履歴を見る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationAssistant;
