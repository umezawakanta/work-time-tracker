import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ask, getAIHealth, type ChatMessage } from '@/services/api/aiAssistantApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAnalytics } from '@/lib/analytics';
import { ASSISTANT_TEMPLATES } from '@/constants/aiAssistant';
import { todoApi } from '@/services/api/todoApi';
import { Share2, RotateCcw, CheckCircle } from 'lucide-react';

const templates = ASSISTANT_TEMPLATES;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();

  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const health = await getAIHealth();
        setHasServerKey(health.hasApiKey);
        // eslint-disable-next-line no-console
        console.log('[AI] Server health', health);
      } catch {
        setHasServerKey(null);
      }
    })();
  }, []);

  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const lastSendAtRef = useRef<number>(0);
  // Inactivity nudge
  const [lastInputAt, setLastInputAt] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      if (now - lastInputAt >= 60000) {
        toast('少し休憩しますか？ もしくはAIに次の一手を相談しましょう。', { icon: '✨' });
        setLastInputAt(now);
        try {
          trackEvent('ai_inactivity_nudge');
        } catch {}
      }
    }, 15000);
    return () => clearInterval(t);
  }, [lastInputAt, trackEvent]);
  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const now = Date.now();
    if (now - lastSendAtRef.current < 600) return;
    lastSendAtRef.current = now;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setBusy(true);
    setLastError(null);

    try {
      const res = await ask([...messages, userMsg], {
        timeoutMs: 35000,
        traits: user?.traits,
      });
      const assistant: ChatMessage = { role: 'assistant', content: res.text || '(no content)' };
      setMessages((prev) => [...prev, assistant]);
      trackEvent('ai_assistant_reply', { ok: true });
      toast.success('✅ 計画を生成しました', { icon: '🎉' });
    } catch (e: any) {
      trackEvent('ai_assistant_reply', { ok: false, error: e?.message || 'unknown' });
      const code = e?.message;
      const opts = { icon: '⚠️' } as const;
      if (code === 'NOT_CONFIGURED') {
        toast.error('APIキー未設定です。設定後に再試行してください。', opts as any);
      } else if (code === 'RATE_LIMIT') {
        toast.error('リクエストが多すぎます。しばらくしてからお試しください。', opts as any);
      } else if (code === 'TIMEOUT') {
        toast.error('タイムアウトしました。通信状況を確認して再試行してください。', opts as any);
      } else {
        toast.error('AIリクエストに失敗しました。もう一度お試しください。', opts as any);
      }
      setLastError(code || 'REQUEST_FAILED');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    trackPageView('/ai-assistant', 'AI Assistant');
  }, [trackPageView]);

  const saveOneAction = async (): Promise<void> => {
    // Find last assistant message
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    const content = last?.content?.trim();
    if (!content) {
      toast('保存できるAI提案が見つかりません', { icon: 'ℹ️' });
      return;
    }
    try {
      const firstLine = content.split('\n').find((l) => l.trim().length > 0) || content;
      const task = firstLine.replace(/^[-*\d\.\)\s]+/, '').slice(0, 140);
      const now = new Date().toISOString();
      await todoApi.create(task, 2, true, 'output', undefined, now);
      toast.success('1つのアクションをToDoに保存しました', { icon: '✅' });
      trackEvent('ai_save_one_action', { length: task.length });
    } catch (err) {
      console.error('saveOneAction error', err);
      toast.error('保存に失敗しました');
    }
  };

  return (
    <ErrorBoundary variant="app">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="sr-only">AIパーソナル秘書</h1>
        <Card>
          <CardHeader>
            <CardTitle>AIパーソナル秘書</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={hasServerKey ? 'default' : 'destructive'}>
                {hasServerKey ? 'キーOK' : 'キー未設定'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Conversation log */}
            <div className="space-y-3 mb-4 max-h-80 overflow-auto border rounded p-3 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500">最初のメッセージを入力してください。</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold mr-2">
                      {m.role === 'user' ? 'あなた' : m.role === 'assistant' ? 'AI' : 'システム'}
                    </span>
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                ))
              )}
            </div>

            {/* Prompt input */}
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="AIに相談したい内容を入力..."
                aria-label="AIへの質問入力"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // debounce: 無入力/送信中は無視
                    if (!busy) void send(input);
                  }
                }}
              />
              <Button onClick={() => void send(input)} disabled={loading || busy} aria-label="送信">
                {loading ? '送信中...' : '送信'}
              </Button>
            </div>

            {/* Quick templates */}
            <div
              className="flex flex-wrap items-center gap-2 mt-3"
              aria-label="プロンプトテンプレート"
            >
              <Badge variant="secondary" className="mr-2">
                最短60秒で計画
              </Badge>
              {templates.map((t) => (
                <Button key={t.id} variant="outline" size="sm" onClick={() => setInput(t.text)}>
                  {t.label}
                </Button>
              ))}
            </div>

            {/* Inline retry on error */}
            {lastError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <span>エラーが発生しました（{lastError}）。</span>
                <Button size="sm" variant="outline" onClick={() => void send(input)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> 再試行
                </Button>
              </div>
            )}

            {/* Save one action to Todo */}
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={() => void saveOneAction()} variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-1" /> 1アクションをToDoに保存
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const last = [...messages].reverse().find((m) => m.role === 'assistant');
                    const text = last?.content || '';
                    if (navigator.share && text) {
                      await navigator.share({ title: '今日の計画', text });
                      trackEvent('ai_share_plan', { method: 'web_share' });
                    } else if (text) {
                      await navigator.clipboard.writeText(text);
                      toast.success('計画をコピーしました');
                      trackEvent('ai_share_plan', { method: 'copy' });
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error('共有に失敗しました');
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="計画を共有"
              >
                <Share2 className="w-4 h-4 mr-1" /> 計画を共有
              </Button>
            </div>

            {/* Notice */}
            {hasServerKey === false && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>APIキー未設定: 設定後に再試行してください。</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default AIAssistant;
