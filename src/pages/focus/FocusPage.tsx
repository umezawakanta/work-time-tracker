import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/ui/MobileHeader';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { QuickDistractionTags } from '@/components/focus/QuickDistractionTags';
import { useFocusSession, QUICK_DURATIONS } from '@/hooks/useFocusSession';
import { Clock, Play, Pause, Square, RotateCcw, History } from 'lucide-react';

const QUICK_DURATION_OPTIONS = [
  { label: '25分', value: QUICK_DURATIONS.pomodoro, color: 'bg-green-500' },
  { label: '50分', value: QUICK_DURATIONS.deep, color: 'bg-blue-500' },
  { label: '90分', value: QUICK_DURATIONS.marathon, color: 'bg-purple-500' },
];

export default function FocusPage() {
  const navigate = useNavigate();
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishData, setFinishData] = useState({
    rating: 5,
    note: '',
    tags: [] as string[],
  });

  const {
    state,
    durationMs,
    remainingMs,
    interruptions,
    start,
    pause,
    resume,
    finish,
    reset,
    addInterruption,
  } = useFocusSession();

  const handleStart = (duration: number) => {
    start(duration);
  };

  const handlePause = () => {
    pause();
  };

  const handleResume = () => {
    resume();
  };

  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const handleConfirmFinish = async () => {
    await finish(finishData);
    setShowFinishModal(false);
    setFinishData({ rating: 5, note: '', tags: [] });
  };

  const handleReset = () => {
    reset();
    setShowFinishModal(false);
    setFinishData({ rating: 5, note: '', tags: [] });
  };

  const handleTagToggle = (tag: string) => {
    setFinishData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <MobileHeader
        title="フォーカス"
        subtitle="集中セッション"
        backTo="/"
        rightActions={
          <button
            onClick={() => navigate('/focus/history')}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="履歴を見る"
          >
            <History size={18} />
          </button>
        }
      />

      <main className="max-w-screen-sm mx-auto px-4 mt-16 pb-24">
        {/* メインタイマー */}
        <div className="py-8">
          <FocusTimer remainingMs={remainingMs} durationMs={durationMs} state={state} />
        </div>

        {/* コントロールボタン */}
        <div className="space-y-4 mb-8">
          {state === 'idle' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center">
                セッション時間を選択
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStart(option.value)}
                    className={`
                      flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-white font-medium
                      transition-all duration-200 min-h-[60px] justify-center
                      ${option.color} hover:opacity-90 active:scale-95
                    `}
                    aria-label={`${option.label}で開始`}
                  >
                    <Clock size={20} />
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {state === 'running' && (
            <div className="flex gap-3">
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors min-h-[48px]"
                aria-label="一時停止"
              >
                <Pause size={20} />
                一時停止
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors min-h-[48px]"
                aria-label="終了"
              >
                <Square size={20} />
                終了
              </button>
            </div>
          )}

          {state === 'paused' && (
            <div className="flex gap-3">
              <button
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors min-h-[48px]"
                aria-label="再開"
              >
                <Play size={20} />
                再開
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors min-h-[48px]"
                aria-label="リセット"
              >
                <RotateCcw size={20} />
                リセット
              </button>
            </div>
          )}

          {state === 'finished' && (
            <div className="text-center space-y-4">
              <div className="text-lg font-medium text-green-600">セッション完了！</div>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors min-h-[48px] mx-auto"
                aria-label="新しいセッションを開始"
              >
                <RotateCcw size={20} />
                新しいセッション
              </button>
            </div>
          )}
        </div>

        {/* 分散記録（セッション中のみ表示） */}
        {(state === 'running' || state === 'paused') && (
          <div className="border-t pt-6">
            <QuickDistractionTags onTagClick={addInterruption} />
            {interruptions.length > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  記録された分散: {interruptions.length}回
                </div>
                <div className="text-xs text-gray-500 mt-1">{interruptions.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 終了モーダル */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">セッション完了</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己評価 (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFinishData((prev) => ({ ...prev, rating }))}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        transition-colors
                        ${
                          finishData.rating === rating
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                      aria-label={`評価${rating}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
                <textarea
                  value={finishData.note}
                  onChange={(e) => setFinishData((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="今回のセッションの振り返り..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タグ（任意）</label>
                <div className="flex flex-wrap gap-2">
                  {['集中できた', '疲れた', '楽しかった', '難しかった', '短く感じた'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium transition-colors
                        ${
                          finishData.tags.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmFinish}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
