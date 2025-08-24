import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/lib/analytics';

const InviteThanks: React.FC = () => {
  const navigate = useNavigate();
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView('/invite/thanks', 'Invite Thanks');
    trackEvent('referral_invite_thanks_shown');
  }, [trackPageView, trackEvent]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>ご協力ありがとうございます！</CardTitle>
          <CardDescription>
            招待リンクの共有が完了しました。次のステップに進みましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate('/assessments')} aria-label="自己診断を始める">
              自己診断を始める
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ai-assistant')}
              aria-label="AI秘書を使う"
            >
              AI秘書を使う
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteThanks;
