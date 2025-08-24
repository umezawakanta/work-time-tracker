import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';

interface DeferredPromptEvent extends Event {
  readonly prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' } & Record<string, unknown>>;
}

function isStandaloneDisplay(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

const DISMISS_KEY = 'pwa:install_banner:dismissed_until';

const InstallBanner: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const [deferred, setDeferred] = useState<DeferredPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const isDismissed = useMemo(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      const ts = Number(raw);
      return Number.isFinite(ts) && Date.now() < ts;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay()) return; // すでにインストール/スタンドアロン表示

    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as DeferredPromptEvent;
      setDeferred(evt);
      if (!isDismissed) {
        setVisible(true);
        trackEvent('pwa_install_banner_shown');
      }
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDismissed]);

  if (!visible || !deferred) return null;

  return (
    <div
      className="fixed bottom-4 inset-x-0 z-50 px-4"
      role="region"
      aria-label="アプリインストールのご案内"
    >
      <div className="mx-auto max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-4 flex items-center gap-3">
        <div className="hidden sm:block p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">ホームに追加して、アプリのように使えます</p>
            <Badge variant="secondary" className="hidden sm:inline-block">
              無料
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
            オフライン起動・フルスクリーン表示・素早いアクセス
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={async () => {
              try {
                await deferred.prompt();
                const choice = await deferred.userChoice;
                trackEvent('pwa_install_clicked', { outcome: choice.outcome });
              } catch {
                trackEvent('pwa_install_clicked', { outcome: 'error' });
              } finally {
                setVisible(false);
                setDeferred(null);
              }
            }}
            aria-label="ホームに追加"
          >
            <Download className="w-4 h-4 mr-1" /> ホームに追加
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              try {
                const week = 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem(DISMISS_KEY, String(Date.now() + week));
              } catch {}
              setVisible(false);
              setDeferred(null);
              trackEvent('pwa_install_dismissed');
            }}
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
