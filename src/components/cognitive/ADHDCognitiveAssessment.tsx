import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain,
  Clock,
  Target,
  Zap,
  Eye,
  Ear,
  MessageSquare,
  Lightbulb,
  Timer,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Star,
  Award,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Headphones,
  Activity,
  Sparkles,
  Heart,
  Shield,
  BookOpen,
  Puzzle,
  Calculator,
  Palette,
  Gamepad2,
  Radar,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 認知機能テスト結果の型定義
interface CognitiveScore {
  raw: number;
  scaled: number;
  percentile: number;
  classification:
    | 'superior'
    | 'high_average'
    | 'average'
    | 'low_average'
    | 'borderline'
    | 'extremely_low';
}

interface CognitiveProfile {
  id: string;
  userId: string;
  date: Date;
  verbalComprehension: CognitiveScore;
  perceptualReasoning: CognitiveScore;
  workingMemory: CognitiveScore;
  processingSpeed: CognitiveScore;
  // ADHD/ASD特化項目
  executiveFunction: CognitiveScore;
  attentionalControl: CognitiveScore;
  sensoryProcessing: CognitiveScore;
  socialCognition: CognitiveScore;
  // 総合スコア
  fullScaleIQ: CognitiveScore;
  adhdOptimizedScore: CognitiveScore;
  // 分析結果
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  personalizedSettings: {
    optimalTaskDuration: number; // minutes
    preferredBreakFrequency: number; // minutes
    visualComplexityLevel: 'low' | 'medium' | 'high';
    auditoryProcessingPreference: 'minimal' | 'moderate' | 'enhanced';
    multitaskingCapacity: 'single' | 'dual' | 'multiple';
    timeStructureNeed: 'rigid' | 'flexible' | 'adaptive';
  };
}

interface TestQuestion {
  id: string;
  type: 'verbal' | 'visual' | 'memory' | 'speed' | 'executive' | 'attention' | 'sensory' | 'social';
  subtype: string;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  timeLimit?: number; // seconds
  stimulus?: {
    type: 'text' | 'image' | 'audio' | 'sequence' | 'pattern';
    content: string | string[];
  };
  instruction: string;
}

interface TestSession {
  id: string;
  currentTest: string;
  currentQuestion: number;
  startTime: Date;
  responses: {
    questionId: string;
    response: string | number;
    responseTime: number;
    isCorrect: boolean;
  }[];
  isCompleted: boolean;
  pausedTime: number;
}

export const ADHDCognitiveAssessment: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [currentProfile, setCurrentProfile] = useState<CognitiveProfile | null>(null);
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Test questions database
  const testQuestions: Record<string, TestQuestion[]> = useMemo(
    () => ({
      verbal: [
        {
          id: 'v1',
          type: 'verbal',
          subtype: 'vocabulary',
          question: '「斬新」と同じ意味の言葉を選んでください。',
          options: ['古風な', '新しい', '一般的な', '複雑な'],
          correctAnswer: '新しい',
          instruction: '最も適切な選択肢を選んでください。',
        },
        {
          id: 'v2',
          type: 'verbal',
          subtype: 'similarities',
          question: '「犬」と「猫」の共通点は何ですか？',
          options: ['四足動物', '野生動物', '大型動物', '海洋動物'],
          correctAnswer: '四足動物',
          instruction: '最も適切な共通点を選んでください。',
        },
        {
          id: 'v3',
          type: 'verbal',
          subtype: 'comprehension',
          question: 'なぜ人々は法律を守る必要があるのですか？',
          options: [
            '社会秩序の維持のため',
            '政府への服従のため',
            '伝統の継承のため',
            '個人の自由のため',
          ],
          correctAnswer: '社会秩序の維持のため',
          instruction: '最も適切な理由を選んでください。',
        },
      ],
      perceptual: [
        {
          id: 'p1',
          type: 'visual',
          subtype: 'block_design',
          question: 'この模様を完成させるために必要なブロックの組み合わせを選んでください。',
          stimulus: {
            type: 'pattern',
            content: ['⬜🔴', '🔴⬜', '⬜🔴', '🔴⬜'],
          },
          options: ['A: 赤2個、白2個', 'B: 赤3個、白1個', 'C: 赤1個、白3個', 'D: 赤4個'],
          correctAnswer: 'A: 赤2個、白2個',
          timeLimit: 60,
          instruction: 'パターンを完成させる組み合わせを選んでください。',
        },
        {
          id: 'p2',
          type: 'visual',
          subtype: 'matrix_reasoning',
          question: '?の部分に入るパターンを選んでください。',
          stimulus: {
            type: 'sequence',
            content: ['🔵🔵🔴', '🔴🔵🔴', '🔵🔴🔴', '?'],
          },
          options: ['🔴🔴🔵', '🔵🔵🔵', '🔴🔴🔴', '🔴🔵🔵'],
          correctAnswer: '🔴🔴🔵',
          timeLimit: 90,
          instruction: 'パターンの規則を見つけて正しい答えを選んでください。',
        },
      ],
      memory: [
        {
          id: 'm1',
          type: 'memory',
          subtype: 'digit_span',
          question: '以下の数字を順番通りに覚えて、逆順で入力してください：',
          stimulus: {
            type: 'sequence',
            content: ['5', '7', '2', '9'],
          },
          instruction: '数字を逆順で入力してください（例：9279）',
          timeLimit: 30,
        },
        {
          id: 'm2',
          type: 'memory',
          subtype: 'arithmetic',
          question: '頭の中で計算してください：18 + 27 - 13 = ?',
          correctAnswer: 32,
          timeLimit: 45,
          instruction: '紙や計算機を使わずに計算してください。',
        },
        {
          id: 'm3',
          type: 'memory',
          subtype: 'letter_number',
          question: '次の文字と数字を、数字は小さい順、文字はアルファベット順に並べてください：',
          stimulus: {
            type: 'sequence',
            content: ['G', '3', 'A', '7', 'K', '1'],
          },
          correctAnswer: '1-3-7-A-G-K',
          timeLimit: 60,
          instruction: '数字と文字を別々にソートしてから組み合わせてください。',
        },
      ],
      speed: [
        {
          id: 's1',
          type: 'speed',
          subtype: 'symbol_search',
          question: '次のシンボルの中に目標シンボル「◆」がありますか？',
          stimulus: {
            type: 'pattern',
            content: ['●', '▲', '■', '◆', '★', '▼'],
          },
          options: ['はい', 'いいえ'],
          correctAnswer: 'はい',
          timeLimit: 5,
          instruction: '可能な限り早く答えてください。',
        },
        {
          id: 's2',
          type: 'speed',
          subtype: 'coding',
          question: '記号に対応する数字を入力してください：▲ = ?',
          stimulus: {
            type: 'pattern',
            content: ['● = 1', '▲ = 2', '■ = 3', '◆ = 4'],
          },
          correctAnswer: 2,
          timeLimit: 8,
          instruction: '対応表を参照して素早く入力してください。',
        },
      ],
      executive: [
        {
          id: 'e1',
          type: 'executive',
          subtype: 'stroop',
          question: 'この文字の「色」を答えてください（文字の意味ではなく）：',
          stimulus: {
            type: 'text',
            content: ['赤'], // 実際は青色で表示
          },
          options: ['赤', '青', '緑', '黄'],
          correctAnswer: '青',
          timeLimit: 10,
          instruction: '文字の意味ではなく、文字の色を選んでください。',
        },
        {
          id: 'e2',
          type: 'executive',
          subtype: 'task_switching',
          question: '数字が偶数なら「偶」、文字なら「字」と答えてください：',
          stimulus: {
            type: 'text',
            content: ['8'],
          },
          options: ['偶', '字'],
          correctAnswer: '偶',
          timeLimit: 8,
          instruction: 'ルールに従って素早く判断してください。',
        },
      ],
      attention: [
        {
          id: 'a1',
          type: 'attention',
          subtype: 'sustained_attention',
          question: '「X」が連続で2回現れた時のみボタンを押してください：',
          stimulus: {
            type: 'sequence',
            content: ['A', 'X', 'X', 'B', 'X', 'C'],
          },
          options: ['押す', '押さない'],
          correctAnswer: '押す',
          timeLimit: 15,
          instruction: '連続する「X」に注意を払ってください。',
        },
        {
          id: 'a2',
          type: 'attention',
          subtype: 'divided_attention',
          question: '赤い円と青い四角の合計個数は？',
          stimulus: {
            type: 'pattern',
            content: ['🔴', '🔵', '🟦', '🔴', '🔴', '🟦'],
          },
          correctAnswer: 5,
          timeLimit: 20,
          instruction: '指定された形と色の組み合わせのみを数えてください。',
        },
      ],
      sensory: [
        {
          id: 'sen1',
          type: 'sensory',
          subtype: 'visual_processing',
          question: '画面に表示される図形の向きは？',
          stimulus: {
            type: 'pattern',
            content: ['↗️'],
          },
          options: ['左上', '右上', '左下', '右下'],
          correctAnswer: '右上',
          timeLimit: 8,
          instruction: '矢印の向きを正確に判断してください。',
        },
        {
          id: 'sen2',
          type: 'sensory',
          subtype: 'auditory_processing',
          question: '3つの音のうち、最も高い音はどれでしたか？',
          options: ['1番目', '2番目', '3番目'],
          correctAnswer: '2番目',
          timeLimit: 10,
          instruction: '音の高さを比較してください。',
        },
      ],
      social: [
        {
          id: 'soc1',
          type: 'social',
          subtype: 'emotion_recognition',
          question: 'この表情は何の感情を表していますか？',
          options: ['喜び', '悲しみ', '怒り', '驚き'],
          correctAnswer: '喜び',
          timeLimit: 15,
          instruction: '表情から感情を読み取ってください。',
        },
        {
          id: 'soc2',
          type: 'social',
          subtype: 'social_situation',
          question: '会議中に携帯電話が鳴った時の最も適切な対応は？',
          options: [
            'すぐに電話に出る',
            '着信を止めて後で返電',
            '無視して鳴らし続ける',
            '大声で話す',
          ],
          correctAnswer: '着信を止めて後で返電',
          timeLimit: 20,
          instruction: '社会的に適切な行動を選んでください。',
        },
      ],
    }),
    []
  );

  // Test categories with metadata
  const testCategories = useMemo(
    () => [
      {
        id: 'verbal',
        name: '言語理解',
        icon: <MessageSquare className="h-6 w-6" />,
        description: '言語的情報の理解・推論能力',
        color: 'from-blue-500 to-cyan-500',
        estimatedTime: 15,
        questions: testQuestions.verbal?.length || 0,
      },
      {
        id: 'perceptual',
        name: '知覚推理',
        icon: <Eye className="h-6 w-6" />,
        description: '視覚的情報の処理・パターン認識',
        color: 'from-green-500 to-emerald-500',
        estimatedTime: 20,
        questions: testQuestions.perceptual?.length || 0,
      },
      {
        id: 'memory',
        name: 'ワーキングメモリ',
        icon: <Brain className="h-6 w-6" />,
        description: '短期記憶・注意制御能力',
        color: 'from-purple-500 to-violet-500',
        estimatedTime: 18,
        questions: testQuestions.memory?.length || 0,
      },
      {
        id: 'speed',
        name: '処理速度',
        icon: <Zap className="h-6 w-6" />,
        description: '情報処理の速度・効率性',
        color: 'from-yellow-500 to-orange-500',
        estimatedTime: 12,
        questions: testQuestions.speed?.length || 0,
      },
      {
        id: 'executive',
        name: '実行機能',
        icon: <Target className="h-6 w-6" />,
        description: '計画・制御・切り替え能力',
        color: 'from-red-500 to-pink-500',
        estimatedTime: 15,
        questions: testQuestions.executive?.length || 0,
      },
      {
        id: 'attention',
        name: '注意制御',
        icon: <Activity className="h-6 w-6" />,
        description: '注意の持続・分割・選択能力',
        color: 'from-indigo-500 to-purple-500',
        estimatedTime: 25,
        questions: testQuestions.attention?.length || 0,
      },
      {
        id: 'sensory',
        name: '感覚処理',
        icon: <Radar className="h-6 w-6" />,
        description: '感覚情報の統合・処理能力',
        color: 'from-teal-500 to-cyan-500',
        estimatedTime: 10,
        questions: testQuestions.sensory?.length || 0,
      },
      {
        id: 'social',
        name: '社会認知',
        icon: <Heart className="h-6 w-6" />,
        description: '社会的状況の理解・対応能力',
        color: 'from-pink-500 to-rose-500',
        estimatedTime: 12,
        questions: testQuestions.social?.length || 0,
      },
    ],
    [testQuestions]
  );

  // Timer management
  useEffect(() => {
    if (isTestActive && timeRemaining !== null && timeRemaining > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [isTestActive, timeRemaining, isPaused]);

  // Start test session
  const startTest = useCallback(
    (testType: string) => {
      const session: TestSession = {
        id: Date.now().toString(),
        currentTest: testType,
        currentQuestion: 0,
        startTime: new Date(),
        responses: [],
        isCompleted: false,
        pausedTime: 0,
      };

      setTestSession(session);
      setCurrentQuestionIndex(0);
      setSelectedTest(testType);
      setIsTestActive(true);
      setShowResults(false);
      setIsPaused(false);

      const firstQuestion = testQuestions[testType]?.[0];
      if (firstQuestion?.timeLimit) {
        setTimeRemaining(firstQuestion.timeLimit);
      }
    },
    [testQuestions]
  );

  // Handle test response
  const handleResponse = useCallback(
    (response: string | number) => {
      if (!testSession || !selectedTest) return;

      const currentQuestions = testQuestions[selectedTest];
      const currentQuestion = currentQuestions[currentQuestionIndex];
      const responseTime = Date.now() - testSession.startTime.getTime() - testSession.pausedTime;

      const isCorrect = currentQuestion.correctAnswer
        ? response === currentQuestion.correctAnswer
        : true; // Some questions don't have right/wrong answers

      const newResponse = {
        questionId: currentQuestion.id,
        response,
        responseTime,
        isCorrect,
      };

      const updatedSession = {
        ...testSession,
        responses: [...testSession.responses, newResponse],
      };

      setTestSession(updatedSession);

      // Move to next question or complete test
      if (currentQuestionIndex < currentQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        const nextQuestion = currentQuestions[nextIndex];
        if (nextQuestion.timeLimit) {
          setTimeRemaining(nextQuestion.timeLimit);
        } else {
          setTimeRemaining(null);
        }
      } else {
        completeTest(updatedSession);
      }
    },
    [testSession, selectedTest, currentQuestionIndex, testQuestions]
  );

  // Complete test and calculate scores
  const completeTest = useCallback((session: TestSession) => {
    setIsTestActive(false);
    setTimeRemaining(null);

    // Calculate test scores (simplified algorithm)
    const correctResponses = session.responses.filter((r) => r.isCorrect).length;
    const totalQuestions = session.responses.length;
    const averageResponseTime =
      session.responses.reduce((sum, r) => sum + r.responseTime, 0) / session.responses.length;

    const rawScore = correctResponses;
    const scaledScore = Math.round((rawScore / totalQuestions) * 20); // Scale to 0-20
    const percentile = Math.round(((scaledScore - 10) / 10) * 50 + 50); // Approximate percentile

    const getClassification = (scaled: number): CognitiveScore['classification'] => {
      if (scaled >= 16) return 'superior';
      if (scaled >= 14) return 'high_average';
      if (scaled >= 7) return 'average';
      if (scaled >= 5) return 'low_average';
      if (scaled >= 3) return 'borderline';
      return 'extremely_low';
    };

    const score: CognitiveScore = {
      raw: rawScore,
      scaled: scaledScore,
      percentile: Math.max(1, Math.min(99, percentile)),
      classification: getClassification(scaledScore),
    };

    // Update or create cognitive profile
    // This would normally save to a database
    console.log(`Test ${session.currentTest} completed:`, score);

    setShowResults(true);
  }, []);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (testSession && selectedTest) {
      handleResponse('timeout');
    }
  }, [testSession, selectedTest, handleResponse]);

  // Pause/Resume test
  const togglePause = useCallback(() => {
    if (!testSession) return;

    setIsPaused((prev) => !prev);

    if (!isPaused) {
      // Starting pause
      setTestSession((prev) =>
        prev
          ? {
              ...prev,
              pausedTime: prev.pausedTime + Date.now(),
            }
          : null
      );
    } else {
      // Ending pause
      setTestSession((prev) =>
        prev
          ? {
              ...prev,
              pausedTime: prev.pausedTime + Date.now(),
            }
          : null
      );
    }
  }, [testSession, isPaused]);

  // Get current question
  const getCurrentQuestion = useCallback(() => {
    if (!selectedTest || !testQuestions[selectedTest]) return null;
    return testQuestions[selectedTest][currentQuestionIndex];
  }, [selectedTest, currentQuestionIndex, testQuestions]);

  const currentQuestion = getCurrentQuestion();

  // Classification labels
  const classificationLabels = {
    superior: { label: '優秀', color: 'text-green-600', bg: 'bg-green-50' },
    high_average: { label: '平均上', color: 'text-blue-600', bg: 'bg-blue-50' },
    average: { label: '平均', color: 'text-gray-600', bg: 'bg-gray-50' },
    low_average: { label: '平均下', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    borderline: { label: 'ボーダーライン', color: 'text-orange-600', bg: 'bg-orange-50' },
    extremely_low: { label: '要支援', color: 'text-red-600', bg: 'bg-red-50' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="h-8 w-8" />
              ADHD/ASD特化型認知機能評価システム
            </h1>
            <p className="text-purple-100">WEIS準拠の科学的認知機能測定 + 個人最適化支援</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">WEIS+</div>
            <div className="text-sm text-purple-200">統合版</div>
          </div>
        </div>
      </div>

      {!isTestActive && !showResults && (
        <>
          {/* Test overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                認知機能評価について
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-blue-600">🧠 測定する能力</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      言語理解：言葉での情報処理
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      知覚推理：視覚的パターン認識
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ワーキングメモリ：短期記憶・注意
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      処理速度：情報処理スピード
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-purple-600">🎯 ADHD/ASD特化項目</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      実行機能：計画・制御能力
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      注意制御：集中・持続・分割
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      感覚処理：感覚統合能力
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      社会認知：対人関係理解
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-800">個人最適化機能</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      認知プロファイルに基づいて、タスク管理・カレンダー・資産管理システム全体が
                      あなたの認知特性に合わせて自動調整されます。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testCategories.map((category) => (
              <Card key={category.id} className="relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10`}
                ></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${category.color} text-white`}
                    >
                      {category.icon}
                    </div>
                    <Badge variant="outline">{category.questions}問</Badge>
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />約{category.estimatedTime}分
                    </div>
                  </div>
                  <Button
                    onClick={() => startTest(category.id)}
                    className="w-full"
                    disabled={
                      !testQuestions[category.id] || testQuestions[category.id].length === 0
                    }
                  >
                    <Play className="h-4 w-4 mr-2" />
                    テスト開始
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Active test interface */}
      {isTestActive && currentQuestion && selectedTest && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {testCategories.find((c) => c.id === selectedTest)?.icon}
                {testCategories.find((c) => c.id === selectedTest)?.name}テスト
              </CardTitle>
              <div className="flex items-center gap-4">
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-500" />
                    <span
                      className={`font-mono ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      {timeRemaining}秒
                    </span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={togglePause}>
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                問題 {currentQuestionIndex + 1} / {testQuestions[selectedTest]?.length || 0}
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) / (testQuestions[selectedTest]?.length || 1)) * 100
                }
                className="w-32"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPaused ? (
              <div className="text-center py-12">
                <Pause className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">テスト一時停止中</h3>
                <p className="text-gray-500 mb-4">準備ができたら再開ボタンを押してください</p>
                <Button onClick={togglePause}>
                  <Play className="h-4 w-4 mr-2" />
                  再開
                </Button>
              </div>
            ) : (
              <>
                {/* Question instruction */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">{currentQuestion.instruction}</p>
                </div>

                {/* Question content */}
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">{currentQuestion.question}</h3>

                  {/* Stimulus display */}
                  {currentQuestion.stimulus && (
                    <div className="my-6 p-6 bg-gray-50 rounded-lg">
                      {currentQuestion.stimulus.type === 'sequence' &&
                        Array.isArray(currentQuestion.stimulus.content) && (
                          <div className="flex items-center justify-center gap-4 text-2xl">
                            {currentQuestion.stimulus.content.map((item: string, index: number) => (
                              <span key={index} className="font-mono">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      {currentQuestion.stimulus.type === 'pattern' &&
                        Array.isArray(currentQuestion.stimulus.content) && (
                          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                            {currentQuestion.stimulus.content.map((item: string, index: number) => (
                              <div key={index} className="text-2xl p-2 border rounded">
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      {currentQuestion.stimulus.type === 'text' && (
                        <div className="text-3xl font-bold text-blue-600">
                          {Array.isArray(currentQuestion.stimulus.content)
                            ? currentQuestion.stimulus.content[0]
                            : currentQuestion.stimulus.content}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Answer options */}
                <div className="space-y-3">
                  {currentQuestion.options ? (
                    currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start p-4 h-auto"
                        onClick={() => handleResponse(option)}
                      >
                        <span className="mr-3 text-gray-500">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </Button>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <Input
                        placeholder="答えを入力してください..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            handleResponse(target.value);
                            target.value = '';
                          }
                        }}
                      />
                      <div className="text-center">
                        <Button
                          onClick={() => {
                            const input = document.querySelector('input') as HTMLInputElement;
                            if (input) {
                              handleResponse(input.value);
                              input.value = '';
                            }
                          }}
                        >
                          回答する
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results display */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              テスト結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">テスト完了！</h3>
              <p className="text-gray-600 mb-6">結果の詳細分析と個人最適化設定を準備中です...</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowResults(false)}>他のテストを受ける</Button>
                <Button variant="outline">詳細結果を見る</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
