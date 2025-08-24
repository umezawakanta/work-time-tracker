import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import adhdService from '@/services/adhdService';
import adhdPersonalization from '@/services/adhdPersonalizationService';
import {
  AlertTriangle,
  Heart,
  Brain,
  Phone,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Waves,
  Activity,
} from 'lucide-react';

interface EmergencyLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  color: string;
  description: string;
  symptoms: string[];
  immediateActions: string[];
  timeframe: string;
}

interface ProtocolStep {
  id: string;
  title: string;
  instruction: string;
  duration: number; // 秒
  type: 'breathing' | 'grounding' | 'thought' | 'action' | 'assessment';
  guidance: string[];
  skipCondition?: string;
}

interface EmergencySession {
  id: string;
  startTime: Date;
  level: number;
  currentStep: number;
  completedSteps: string[];
  notes: string[];
  effectivenessRating?: number;
  duration?: number;
  outcome: 'completed' | 'early-exit' | 'escalated' | 'ongoing';
}

const EMERGENCY_LEVELS: EmergencyLevel[] = [
  {
    level: 1,
    name: '軽度の不安',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: '少し気分が優れない、軽い不安',
    symptoms: ['集中できない', '少し不安', '軽いイライラ'],
    immediateActions: ['深呼吸', '現実確認', '短い休憩'],
    timeframe: '5-10分',
  },
  {
    level: 2,
    name: '中程度の混乱',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: '思考がまとまらない、中程度の不安',
    symptoms: ['頭が混乱', '心配が止まらない', '落ち着かない'],
    immediateActions: ['構造化された呼吸法', 'グラウンディング', '環境整理'],
    timeframe: '10-20分',
  },
  {
    level: 3,
    name: '強い不安',
    color: 'bg-red-100 text-red-800 border-red-200',
    description: '強い不安感、コントロール困難',
    symptoms: ['強い不安', '混乱', '身体症状', '思考停止'],
    immediateActions: ['緊急呼吸法', '5-4-3-2-1テクニック', '安全な場所の確保'],
    timeframe: '20-30分',
  },
  {
    level: 4,
    name: 'パニック状態',
    color: 'bg-red-200 text-red-900 border-red-300',
    description: 'パニック発作、極度の混乱',
    symptoms: ['パニック発作', '現実感の喪失', '極度の恐怖', '身体症状'],
    immediateActions: ['緊急呼吸プロトコル', '即座の現実確認', '緊急連絡先への連絡検討'],
    timeframe: '30-45分',
  },
  {
    level: 5,
    name: '緊急事態',
    color: 'bg-red-300 text-red-900 border-red-400',
    description: '危険な状態、専門的介入が必要',
    symptoms: ['自傷的思考', '現実との完全な乖離', '機能停止'],
    immediateActions: ['即座に専門家に連絡', '緊急サービスの利用', '安全の確保'],
    timeframe: '即座',
  },
];

export const ADHDEmergencyProtocol: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepActive, setIsStepActive] = useState(false);
  const [stepTimer, setStepTimer] = useState(0);
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // プロトコルステップの定義
  const getProtocolSteps = (level: number): ProtocolStep[] => {
    const baseSteps: ProtocolStep[] = [
      {
        id: 'safety-check',
        title: '安全確認',
        instruction: '今、安全な場所にいますか？',
        duration: 30,
        type: 'assessment',
        guidance: [
          '周りを見回してください',
          '座れる場所を見つけてください',
          '必要に応じて人に知らせてください',
        ],
      },
      {
        id: 'breathing-basic',
        title: '基本呼吸法',
        instruction: 'ゆっくりと深呼吸をしましょう',
        duration: 60,
        type: 'breathing',
        guidance: [
          '4秒かけて鼻から息を吸う',
          '4秒間息を止める',
          '6秒かけて口から息を吐く',
          'これを3回繰り返してください',
        ],
      },
      {
        id: 'grounding-5-4-3-2-1',
        title: 'グラウンディング',
        instruction: '5-4-3-2-1テクニックを実践しましょう',
        duration: 120,
        type: 'grounding',
        guidance: [
          '5つの見えるものを言ってください',
          '4つの触れるものを触ってください',
          '3つの聞こえる音を識別してください',
          '2つの匂いを嗅いでください',
          '1つの味を感じてください',
        ],
      },
      {
        id: 'thought-challenge',
        title: '思考の整理',
        instruction: '今の気持ちや考えを整理しましょう',
        duration: 90,
        type: 'thought',
        guidance: [
          'これは一時的な状態です',
          'あなたは安全です',
          'この感情は過ぎ去ります',
          '過去にも乗り越えてきました',
        ],
      },
      {
        id: 'action-planning',
        title: '次のアクション',
        instruction: '次に何をするか決めましょう',
        duration: 60,
        type: 'action',
        guidance: [
          '小さな一歩を考える',
          '今日できることに集中',
          '必要な支援を求める',
          'セルフケアを優先する',
        ],
      },
    ];

    // レベル別カスタマイズ
    if (level >= 3) {
      baseSteps.splice(1, 0, {
        id: 'emergency-breathing',
        title: '緊急呼吸法',
        instruction: '強化された呼吸法を実践します',
        duration: 120,
        type: 'breathing',
        guidance: [
          '7秒かけて鼻から大きく息を吸う',
          '5秒間息を止める',
          '8秒かけてゆっくり口から息を吐く',
          '吐く時に「リラックス」と心の中で言う',
          'これを5回繰り返してください',
        ],
      });
    }

    if (level >= 4) {
      baseSteps.unshift({
        id: 'immediate-safety',
        title: '緊急安全確保',
        instruction: '今すぐ安全を確保してください',
        duration: 60,
        type: 'assessment',
        guidance: [
          '危険な場所から離れる',
          '信頼できる人に連絡する',
          '必要に応じて緊急サービスに連絡',
          '薬の服用状況を確認',
        ],
      });
    }

    if (level === 5) {
      return [
        {
          id: 'emergency-contact',
          title: '緊急連絡',
          instruction: '今すぐ専門家または緊急サービスに連絡してください',
          duration: 300,
          type: 'action',
          guidance: [
            '緊急電話番号: 119 (生命の危険)',
            'こころの健康相談統一ダイヤル: 0570-064-556',
            '地域の精神保健福祉センター',
            '信頼できる家族・友人',
          ],
        },
      ];
    }

    return baseSteps;
  };

  // レベル選択
  const selectLevel = (level: number) => {
    setCurrentLevel(level);
    startEmergencySession(level);
  };

  // 緊急セッション開始
  const startEmergencySession = (level: number) => {
    const session: EmergencySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      level,
      currentStep: 0,
      completedSteps: [],
      notes: [],
      outcome: 'ongoing',
    };

    setActiveSession(session);
    setCurrentStepIndex(0);
    setNotes('');

    // セッション開始をサービスに記録
    adhdService.saveThought({
      content: `緊急プロトコル開始 - レベル${level}`,
      type: 'worry',
      score: Math.max(1, 6 - level),
    });
  };

  // ステップ開始
  const startStep = () => {
    if (!activeSession) return;

    const steps = getProtocolSteps(activeSession.level);
    const currentStep = steps[currentStepIndex];

    setIsStepActive(true);
    setStepTimer(currentStep.duration);

    // タイマー開始
    timerRef.current = setInterval(() => {
      setStepTimer((prev) => {
        if (prev <= 1) {
          completeStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 音声ガイダンス（簡易実装）
    if (soundEnabled) {
      playGuidanceSound(currentStep.type);
    }
  };

  // ステップ完了
  const completeStep = () => {
    if (!activeSession) return;

    const steps = getProtocolSteps(activeSession.level);
    const currentStep = steps[currentStepIndex];

    setIsStepActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 完了ステップを記録
    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            completedSteps: [...prev.completedSteps, currentStep.id],
          }
        : null
    );

    // 次のステップまたは完了
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeSession();
    }
  };

  // ステップスキップ
  const skipStep = () => {
    completeStep();
  };

  // セッション完了
  const completeSession = () => {
    if (!activeSession) return;

    const duration = Math.floor((new Date().getTime() - activeSession.startTime.getTime()) / 1000);

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            duration,
            outcome: 'completed',
          }
        : null
    );

    setShowAssessment(true);

    // 完了をサービスに記録
    adhdService.saveThought({
      content: `緊急プロトコル完了 - ${duration}秒`,
      type: 'focus',
      score: 8,
    });
  };

  // セッション中断
  const exitSession = () => {
    if (activeSession) {
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              outcome: 'early-exit',
            }
          : null
      );
    }

    setCurrentLevel(null);
    setCurrentStepIndex(0);
    setIsStepActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 効果評価の保存
  const saveEffectivenessRating = (rating: number) => {
    if (activeSession) {
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              effectivenessRating: rating,
            }
          : null
      );

      // 評価をサービスに記録
      adhdService.saveThought({
        content: `プロトコル効果評価: ${rating}/10`,
        type: 'focus',
        score: Math.min(10, rating),
      });
    }

    setShowAssessment(false);
    setCurrentLevel(null);
    setActiveSession(null);
  };

  // 音声ガイダンス
  const playGuidanceSound = (type: string) => {
    // 実際の実装では、音声ファイルまたは音声合成APIを使用
    if (type === 'breathing') {
      // 呼吸音のシミュレーション
      console.log('🫁 呼吸ガイダンス音声再生');
    }
  };

  // メモ追加
  const addNote = () => {
    if (notes.trim() && activeSession) {
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              notes: [...prev.notes, notes.trim()],
            }
          : null
      );
      setNotes('');
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (showAssessment && activeSession) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              プロトコル完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">緊急プロトコルが完了しました。お疲れ様でした。</p>

              <div className="text-sm text-green-600">
                <div>
                  セッション時間: {Math.floor((activeSession.duration || 0) / 60)}分
                  {(activeSession.duration || 0) % 60}秒
                </div>
                <div>完了ステップ: {activeSession.completedSteps.length}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">
                  このプロトコルの効果はいかがでしたか？ (1-10)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <Button
                      key={rating}
                      variant="outline"
                      size="sm"
                      onClick={() => saveEffectivenessRating(rating)}
                      className="w-10 h-10"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  今の自分を労ってください。必要に応じて休息を取り、専門家への相談も検討してください。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeSession) {
    const steps = getProtocolSteps(activeSession.level);
    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + (isStepActive ? 1 : 0)) / steps.length) * 100;

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* セッション進捗 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                緊急プロトコル実行中
              </div>
              <Button variant="outline" size="sm" onClick={exitSession} className="text-red-600">
                中断
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  ステップ {currentStepIndex + 1} / {steps.length}
                </span>
                <Badge className={EMERGENCY_LEVELS[activeSession.level - 1].color}>
                  レベル {activeSession.level}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 現在のステップ */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-800">
              <div className="flex items-center gap-2">
                {currentStep.type === 'breathing' && <Waves className="h-5 w-5" />}
                {currentStep.type === 'grounding' && <Eye className="h-5 w-5" />}
                {currentStep.type === 'thought' && <Brain className="h-5 w-5" />}
                {currentStep.type === 'action' && <Activity className="h-5 w-5" />}
                {currentStep.type === 'assessment' && <CheckCircle className="h-5 w-5" />}
                {currentStep.title}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-blue-900">{currentStep.instruction}</p>

              {isStepActive && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.floor(stepTimer / 60)}:{(stepTimer % 60).toString().padStart(2, '0')}
                  </div>
                  <Progress value={(1 - stepTimer / currentStep.duration) * 100} className="h-3" />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">ガイダンス:</h4>
                <ul className="space-y-1">
                  {currentStep.guidance.map((guide, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {guide}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                {!isStepActive ? (
                  <Button
                    onClick={startStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    開始
                  </Button>
                ) : (
                  <Button
                    onClick={completeStep}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    完了
                  </Button>
                )}

                <Button variant="outline" onClick={skipStep} className="px-6">
                  スキップ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* メモ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">気持ちや気づきをメモ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="今の気持ちや状況を書いてください..."
                className="min-h-[80px]"
              />
              <Button onClick={addNote} variant="outline" size="sm" disabled={!notes.trim()}>
                メモ追加
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-red-600" />
          ADHD緊急対応プロトコル
        </h1>
        <p className="text-gray-600">パニックや混乱時の段階的サポートシステム</p>
      </div>

      {/* 緊急連絡先 */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Phone className="h-5 w-5" />
            緊急連絡先
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-red-800">🚨 生命に関わる緊急時</div>
              <div className="text-red-700">119 (救急車・消防)</div>
            </div>
            <div>
              <div className="font-semibold text-red-800">💭 こころの相談</div>
              <div className="text-red-700">0570-064-556 (統一ダイヤル)</div>
            </div>
            <div>
              <div className="font-semibold text-red-800">🏥 精神科救急</div>
              <div className="text-red-700">お住まいの地域の精神保健福祉センター</div>
            </div>
            <div>
              <div className="font-semibold text-red-800">💬 24時間チャット</div>
              <div className="text-red-700">よりそいホットライン 0120-279-338</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レベル選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            現在の状態を選択してください
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              あなたの今の状態に最も近いものを選んでください。適切なサポートプロトコルを開始します。
            </p>

            <div className="space-y-3">
              {EMERGENCY_LEVELS.map((level) => (
                <Card
                  key={level.level}
                  className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${level.color}`}
                  onClick={() => selectLevel(level.level)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={level.color}>レベル {level.level}</Badge>
                          <span className="font-semibold">{level.name}</span>
                        </div>
                        <p className="text-sm mb-2">{level.description}</p>
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="font-medium">症状例:</span> {level.symptoms.join('、')}
                          </div>
                          <div>
                            <span className="font-medium">推定時間:</span> {level.timeframe}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 事前準備のヒント */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            普段からできる準備
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">🛡️ 予防策</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 定期的な休息とセルフケア</li>
                <li>• ストレス要因の特定と管理</li>
                <li>• 支援ネットワークの構築</li>
                <li>• 薬の適切な服用</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">📱 環境整備</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 緊急連絡先の登録</li>
                <li>• 安心できる場所の確保</li>
                <li>• リラックスグッズの準備</li>
                <li>• 信頼できる人への事前説明</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
