import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics';
import { buildOwnInviteUrl, ensureOwnReferralCode } from '@/services/share/referral';

const Invite: React.FC = () => {
  const { trackPageView, trackEvent } = useAnalytics();
  const inviteUrl = useMemo(() => buildOwnInviteUrl(), []);
  const code = useMemo(() => ensureOwnReferralCode(), []);

  useEffect(() => {
    trackPageView('/invite', 'Invite Friends');
  }, [trackPageView]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>友だちを招待</CardTitle>
          <CardDescription>自己診断やAI秘書を友だちと試してみましょう。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              あなたの招待コード: <span className="font-mono font-semibold">{code}</span>
            </div>
            <div className="p-3 rounded border bg-gray-50 break-all text-sm" aria-label="招待URL">
              {inviteUrl}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteUrl);
                  trackEvent('referral_invite_copied', { code });
                }}
              >
                リンクをコピー
              </Button>
              {typeof window !== 'undefined' && (navigator as any).share && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await (navigator as any).share({ title: '招待リンク', url: inviteUrl });
                      trackEvent('referral_invite_shared', { code, method: 'web_share' });
                    } catch {}
                  }}
                >
                  共有する
                </Button>
              )}
            </div>
            <div className="pt-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  inviteUrl
                )}`}
                alt="招待用QRコード"
                width={220}
                height={220}
                className="border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
