import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ask, type ChatMessage } from '@/services/api/aiAssistantApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAnalytics } from '@/lib/analytics';
import { ASSISTANT_TEMPLATES } from '@/constants/aiAssistant';

const templates = ASSISTANT_TEMPLATES;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();

  const envInfo = useMemo(() => {
    const hasGemini = Boolean(import.meta?.env?.VITE_GEMINI_API_KEY);
    const hasAnthropic = Boolean(import.meta?.env?.VITE_ANTHROPIC_API_KEY);
    // Log once on first render
    // eslint-disable-next-line no-console
    console.log('[AI] Env check', { hasGemini, hasAnthropic });
    return { hasGemini, hasAnthropic };
  }, []);

  const [busy, setBusy] = useState(false);
  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setBusy(true);

    try {
      const res = await ask([...messages, userMsg], {
        timeoutMs: 35000,
        traits: user?.traits,
      });
      const assistant: ChatMessage = { role: 'assistant', content: res.text || '(no content)' };
      setMessages((prev) => [...prev, assistant]);
      trackEvent('ai_assistant_reply', { ok: true });
    } catch (e: any) {
      trackEvent('ai_assistant_reply', { ok: false, error: e?.message || 'unknown' });
      const code = e?.message;
      const opts = { icon: '⚠️' } as const;
      if (code === 'NOT_CONFIGURED') {
        toast.error('APIキーが未設定です。設定後に再試行してください。', opts as any);
      } else if (code === 'RATE_LIMIT') {
        toast.error('リクエストが多すぎます。しばらくしてからお試しください。', opts as any);
      } else if (code === 'TIMEOUT') {
        toast.error('タイムアウトしました。通信状況を確認して再試行してください。', opts as any);
      } else {
        toast.error('AIリクエストに失敗しました。', opts as any);
      }
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    trackPageView('/ai-assistant', 'AI Assistant');
  }, [trackPageView]);

  return (
    <ErrorBoundary variant="app">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="sr-only">AIパーソナル秘書</h1>
        <Card>
          <CardHeader>
            <CardTitle>AIパーソナル秘書</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={envInfo.hasAnthropic || envInfo.hasGemini ? 'default' : 'destructive'}
              >
                {envInfo.hasAnthropic || envInfo.hasGemini ? 'キーOK' : 'キー未設定'}
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
              {templates.map((t) => (
                <Button key={t.id} variant="outline" size="sm" onClick={() => setInput(t.text)}>
                  {t.label}
                </Button>
              ))}
            </div>

            {/* Notice */}
            {!envInfo.hasAnthropic && !envInfo.hasGemini && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>
                  APIキーが未設定です。環境変数に設定してください。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default AIAssistant;
