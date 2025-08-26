import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { requestMagicLink } from '@/services/api/authApi';

const MagicLinkCta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const onSend = async () => {
    if (!isValid || sending) return;
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await requestMagicLink(email.trim());
      setMessage(res.message || 'Magic link sent');
    } catch (e: any) {
      setError(e?.message || '送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-white/80 border shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="メールアドレスを入力して、ログインリンクを受け取る"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              aria-label="メールアドレス"
            />
          </div>
          <Button onClick={onSend} disabled={!isValid || sending} aria-label="マジックリンクを送る">
            {sending ? '送信中...' : 'リンクを送る'}
          </Button>
        </div>
        {message && (
          <Alert className="mt-3">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mt-3" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default MagicLinkCta;


