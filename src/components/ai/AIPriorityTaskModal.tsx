import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb } from 'lucide-react';
import useAIAction from '@/hooks/useAIAction';
import { useDispatch } from 'react-redux';
import { setTodaySuggestion } from '@/store/aiSuggestionSlice';
import AdvancedAIService from '@/services/ai/AdvancedAIService';
import { ENV } from '@/utils/env';
import { useNavigate, Link } from 'react-router-dom';
import { trackCtaClick } from '@/lib/track';

export interface AIPriorityTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultContext?: string;
}

type Suggestion = {
  task: string;
  reason?: string;
};

export const AIPriorityTaskModal: React.FC<AIPriorityTaskModalProps> = ({
  open,
  onOpenChange,
  defaultContext,
}) => {
  const [context, setContext] = useState<string>(defaultContext || '');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const aiConfigured = Boolean(
    ENV.OPENAI_API_KEY() || ENV.ANTHROPIC_API_KEY() || ENV.GEMINI_API_KEY()
  );

  const prompt = useMemo(() => {
    const baseInstruction = `あなたは生産性コーチです。以下の状況を踏まえ、今日の「最重要タスク」を1つだけ提案してください。JSONで {"task": string, "reason": string} を返してください。`;
    return `${baseInstruction}\n\n状況:\n${context || '（特になし）'}`;
  }, [context]);

  const ai = useAIAction<Suggestion, [string]>(
    async (p) => {
      try {
        const text = await AdvancedAIService.generateResponse(p);
        // Try to parse JSON first
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const json = JSON.parse(match[0]);
          return {
            task: String(json.task || ''),
            reason: json.reason ? String(json.reason) : undefined,
          };
        }
        // Fallback: use first line as task
        const firstLine =
          text.split(/\n|\r/).find((l) => l.trim().length > 0) ||
          '最重要タスクをひとつ選び、25分集中しましょう';
        return { task: firstLine };
      } catch (e) {
        // Provider missing -> local suggestion
        return {
          task: '「最も期限が近い/影響が大きい」タスクを1つ選んで25分集中',
          reason: 'プロバイダー未設定のためローカル提案。期限×影響で優先度を判断。',
        };
      }
    },
    { maxRetries: 1 }
  );

  const handleExecute = async () => {
    trackCtaClick({
      id: 'ai_suggest_execute',
      label: '提案を受ける',
      variant: 'primary',
      location: 'ai_modal',
      params: { aiConfigured, contextLength: context.length },
    });
    if (!aiConfigured) return;
    const result = await ai.execute(prompt);
    if (result) {
      dispatch(setTodaySuggestion({ task: result.task, reason: result.reason }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            今日の最重要タスクを提案
          </DialogTitle>
          <DialogDescription>
            現在の状況を入力すると、AIが今日の最重要タスクを1件だけ提案します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!aiConfigured && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              AI APIキーが未設定です。設定からAPIキーを入力してください。
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  aria-label="設定を開く"
                >
                  設定を開く
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">今日の状況（任意）</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              placeholder="例: 午後にミーティング2件。レポートの締切が明日。集中力は午前が高い。"
            />
            <p className="text-xs text-slate-500">
              送信データは最小限（この入力テキストのみ）。APIキーは端末に保存され、サーバーへ送信しません。詳しくは{' '}
              <Link to="/privacy" className="underline">
                プライバシーポリシー
              </Link>
              をご確認ください。
            </p>
          </div>

          {ai.isLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              提案を生成中...
            </div>
          )}

          {ai.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              生成に失敗しました。もう一度お試しください。
            </div>
          )}

          {ai.isSuccess && ai.result && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">今日の最重要タスク</div>
              <div className="mt-1 text-lg font-semibold text-emerald-900">{ai.result.task}</div>
              {ai.result.reason && (
                <div className="mt-2 text-sm text-emerald-800/90">理由: {ai.result.reason}</div>
              )}
              {ai.durationMs != null && (
                <div className="mt-2 text-xs text-emerald-800/80">生成時間: {ai.durationMs}ms</div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {ai.isError ? (
            <Button
              variant="outline"
              onClick={ai.retry}
              disabled={ai.isLoading}
              aria-label="再試行"
            >
              再試行
            </Button>
          ) : (
            <Button
              onClick={handleExecute}
              disabled={ai.isLoading || !aiConfigured}
              aria-label="提案を受ける"
            >
              {ai.isLoading
                ? '生成中...'
                : aiConfigured
                  ? '提案を受ける'
                  : 'APIキーを設定してください'}
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)} aria-label="モーダルを閉じる">
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIPriorityTaskModal;
