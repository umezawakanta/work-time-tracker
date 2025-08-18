import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { anthropicService } from '@/services/ai/anthropicService';
import {
  CoachMessage,
  CravingEntry,
  formatDurationJP,
  useQuitSmoking,
} from '@/hooks/useQuitSmoking';
import { Calendar, Heart, Shield, Swords, Timer, Trophy } from 'lucide-react';

type TimerState = {
  isActive: boolean;
  startedAt: number | null; // epoch ms
  durationSec: number; // total seconds
  remainingSec: number; // current remaining seconds
};

const OFFLINE_TIPS: string[] = [
  '3分だけ待って深呼吸を5回: 4秒吸って、4秒止めて、4秒吐く',
  'コップ1杯の水をゆっくり飲む',
  'ガム/ミントを噛む、口寂しさを置き換える',
  '今の気持ちを30秒だけメモする（衝動は波、必ず弱まる）',
  '散歩やスクワットなど、1分だけ身体を動かす',
  '「なぜ禁煙するのか」を声に出して3つ読む',
];

const TRIGGER_OPTIONS: string[] = [
  '朝の習慣',
  'コーヒー',
  '食後',
  '仕事の休憩',
  'ストレス',
  '飲酒',
  '人と一緒にいる時',
  '移動中',
];

const INTENSITY_OPTIONS: Array<{ value: number; label: string }> = Array.from(
  { length: 10 },
  (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  })
);

const milestones: Array<{ days: number; label: string; emoji: string }> = [
  { days: 1, label: '最初の1日', emoji: '🌱' },
  { days: 3, label: '3日目の壁', emoji: '🧗' },
  { days: 7, label: '1週間', emoji: '🗓️' },
  { days: 14, label: '2週間', emoji: '💪' },
  { days: 30, label: '1ヶ月', emoji: '🏆' },
  { days: 90, label: '3ヶ月', emoji: '🥇' },
];

const yen = (n: number): string =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n);

const QuitSmokingCoachPage: React.FC = () => {
  const { state, stats, updateSettings, logCraving, appendMessage, registerSlip, resetAll } =
    useQuitSmoking();

  const [cravingTrigger, setCravingTrigger] = useState<string>('ストレス');
  const [cravingIntensity, setCravingIntensity] = useState<number>(6);
  const [cravingNote, setCravingNote] = useState<string>('');
  const [coachInput, setCoachInput] = useState<string>('今すぐ吸いたい。助けて');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    startedAt: null,
    durationSec: 180,
    remainingSec: 180,
  });

  // Live timer for stats and craving countdown
  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => {
        if (!t.isActive || t.startedAt === null) return t;
        const elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
        const remaining = Math.max(0, t.durationSec - elapsed);
        if (remaining === 0) {
          return { ...t, isActive: false, startedAt: null, remainingSec: 0 };
        }
        return { ...t, remainingSec: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStartTimer = (seconds: number) => {
    setTimer({
      isActive: true,
      startedAt: Date.now(),
      durationSec: seconds,
      remainingSec: seconds,
    });
  };

  const handleCravingResisted = () => {
    logCraving({
      intensity1to10: cravingIntensity,
      trigger: cravingTrigger,
      contextNote: cravingNote,
      resisted: true,
    });
    appendMessage(
      'coach',
      'よく耐えました！この勝利は次の勝利を呼びます。水を飲んで胸を張りましょう。'
    );
    setCravingNote('');
    toast.success('記録しました（成功）');
  };

  const handleSlip = () => {
    logCraving({
      intensity1to10: cravingIntensity,
      trigger: cravingTrigger,
      contextNote: cravingNote,
      resisted: false,
    });
    registerSlip('喫煙を記録');
    appendMessage(
      'coach',
      '大丈夫。原因を一緒に分析し、次はより賢く対応できます。すぐに再開しましょう。'
    );
    setCravingNote('');
    toast('再開ボタンを押す必要はありません。今この瞬間からが新しい開始です。', { icon: '🔁' });
  };

  const summaryForCoach = useMemo(() => {
    const recentCravings = state.cravings.slice(0, 3);
    const reasons = state.settings.primaryReasons.join(' / ');
    return `禁煙開始: ${new Date(state.settings.quitDateIso).toLocaleString('ja-JP')}
経過: ${formatDurationJP(stats.secondsSinceQuit)} / 節約額: ${yen(stats.moneySaved)} / 避けた本数: ${stats.cigarettesAvoided}
主な理由: ${reasons || '未設定'}
想定トリガー: ${state.settings.triggers.join(', ')}
直近の衝動(${recentCravings.length}件): ${recentCravings
      .map(
        (c) =>
          `${new Date(c.timestampIso).toLocaleString('ja-JP')} 強度${c.intensity1to10}/10 トリガー:${c.trigger} ${c.resisted ? '耐えた' : '吸った'}`
      )
      .join(' | ')}`;
  }, [
    state.cravings,
    state.settings.primaryReasons,
    state.settings.quitDateIso,
    state.settings.triggers,
    stats.cigarettesAvoided,
    stats.moneySaved,
    stats.secondsSinceQuit,
  ]);

  const askCoach = async (message: string) => {
    setIsAsking(true);
    appendMessage('user', message);
    try {
      const reply = await anthropicService.chat(
        `あなたは禁煙の専門コーチです。以下の状況を踏まえて、行動可能で短いアドバイスを3点、日本語でください。\n\n状況:\n${summaryForCoach}\n\n相談:\n${message}`,
        'quit-smoking'
      );
      appendMessage('coach', reply);
    } catch (e) {
      const fallback = `以下の手順を試してください:\n- ${OFFLINE_TIPS.slice(0, 3).join('\n- ')}`;
      appendMessage('coach', fallback);
    } finally {
      setIsAsking(false);
    }
  };

  const nextMilestone =
    milestones.find((m) => stats.daysSinceQuit < m.days) || milestones[milestones.length - 1];
  const reached = milestones.filter((m) => stats.daysSinceQuit >= m.days).map((m) => m.days);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚭 禁煙コーチ</h1>
          <p className="text-gray-600 mt-1">
            「今」の衝動を乗り切り、確実に継続するための実戦ツール
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => resetAll()}>
            初期化
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">禁煙継続時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDurationJP(Math.floor(stats.secondsSinceQuit))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-rose-600" />
              <div>
                <p className="text-sm text-gray-600">避けた本数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cigarettesAvoided} 本</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">節約額</p>
                <p className="text-2xl font-bold text-gray-900">{yen(stats.moneySaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-600" /> 今すぐ吸いたい（緊急対処）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600">トリガー</label>
                  <Select value={cravingTrigger} onValueChange={setCravingTrigger}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">強度 (1-10)</label>
                  <Select
                    value={String(cravingIntensity)}
                    onValueChange={(v) => setCravingIntensity(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENSITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">メモ（任意）</label>
                  <Input
                    value={cravingNote}
                    onChange={(e) => setCravingNote(e.target.value)}
                    placeholder="状況や気持ち"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => handleStartTimer(180)} className="gap-2">
                  <Timer className="h-4 w-4" /> 3分タイマー開始
                </Button>
                <Button onClick={() => handleStartTimer(300)} variant="outline" className="gap-2">
                  <Timer className="h-4 w-4" /> 5分タイマー
                </Button>
                {timer.isActive ? (
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    残り {formatDurationJP(timer.remainingSec)}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    タイマー未実行
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCravingResisted}
                >
                  耐えた（記録）
                </Button>
                <Button className="flex-1" variant="outline" onClick={handleSlip}>
                  吸ってしまった（記録）
                </Button>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">即効ガイド</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {OFFLINE_TIPS.map((tip, i) => (
                    <div
                      key={i}
                      className="text-sm text-gray-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2"
                    >
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-emerald-600" /> AI コーチに相談
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={3}
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="今の状況や不安を書いてください"
              />
              <div className="flex gap-2">
                <Button disabled={isAsking} onClick={() => askCoach(coachInput)} className="gap-2">
                  {isAsking ? '相談中…' : '相談する'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => askCoach('今の波を乗り切るための具体的な3ステップを教えて')}
                >
                  3ステップ提案
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.messages.map((m: CoachMessage) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-md border ${m.role === 'user' ? 'bg-blue-50 border-blue-200' : m.role === 'coach' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="text-xs text-slate-500 mb-1">
                      {m.role === 'user' ? 'あなた' : m.role === 'coach' ? 'コーチ' : 'システム'} •{' '}
                      {new Date(m.timestampIso).toLocaleTimeString('ja-JP')}
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-slate-800">{m.content}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-600" /> 設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm text-gray-600">禁煙開始日</label>
              <Input
                type="datetime-local"
                value={new Date(state.settings.quitDateIso).toISOString().slice(0, 16)}
                onChange={(e) =>
                  updateSettings({ quitDateIso: new Date(e.target.value).toISOString() })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">1箱の価格 (円)</label>
                  <Input
                    type="number"
                    value={state.settings.pricePerPack}
                    onChange={(e) => updateSettings({ pricePerPack: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">1箱の本数</label>
                  <Input
                    type="number"
                    value={state.settings.cigarettesPerPack}
                    onChange={(e) =>
                      updateSettings({ cigarettesPerPack: Number(e.target.value || 0) })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">禁煙前の1日本数</label>
                <Input
                  type="number"
                  value={state.settings.cigarettesPerDayBeforeQuit}
                  onChange={(e) =>
                    updateSettings({ cigarettesPerDayBeforeQuit: Number(e.target.value || 0) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">禁煙の理由（改行で複数）</label>
                <Textarea
                  rows={3}
                  value={state.settings.primaryReasons.join('\n')}
                  onChange={(e) =>
                    updateSettings({ primaryReasons: e.target.value.split('\n').filter(Boolean) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">想定トリガー（改行で複数）</label>
                <Textarea
                  rows={2}
                  value={state.settings.triggers.join('\n')}
                  onChange={(e) =>
                    updateSettings({ triggers: e.target.value.split('\n').filter(Boolean) })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>マイルストーン</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {milestones.map((m) => (
                  <Badge
                    key={m.days}
                    variant={reached.includes(m.days) ? 'secondary' : 'outline'}
                    className="px-3 py-1"
                  >
                    {m.emoji} {m.label}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                次の目標: {nextMilestone.label}（あと
                {Math.max(0, Math.ceil(nextMilestone.days - stats.daysSinceQuit))}日）
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近の記録</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {state.cravings.length === 0 ? (
                <div className="text-sm text-gray-500">まだ記録がありません</div>
              ) : (
                state.cravings.map((c: CravingEntry) => (
                  <div
                    key={c.id}
                    className="border rounded-md px-3 py-2 flex items-center justify-between"
                  >
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {new Date(c.timestampIso).toLocaleString('ja-JP')}（強度 {c.intensity1to10}
                        /10）
                      </div>
                      <div className="text-gray-600">
                        トリガー: {c.trigger}
                        {c.contextNote ? ` ／ ${c.contextNote}` : ''}
                      </div>
                    </div>
                    <Badge variant={c.resisted ? 'secondary' : 'outline'}>
                      {c.resisted ? '耐えた' : '吸った'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuitSmokingCoachPage;
