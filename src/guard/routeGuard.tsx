import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuardContext } from './GuardContext';
import { isNowInSchedule } from './logic';
import { GuardOverlay } from './GuardOverlay';

export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, isPanic, tempUnlockedUntil, setTempUnlockedUntil } = useGuardContext();
  const loc = useLocation();
  const nav = useNavigate();
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.enabled) {
      setBlocked(null);
      return;
    }
    const now = new Date();

    // 一時解除中はスルー
    if (tempUnlockedUntil && Date.now() < tempUnlockedUntil) {
      setBlocked(null);
      return;
    }

    // Panic
    if (isPanic) {
      setBlocked(loc.pathname);
      return;
    }

    // スケジュール該当？
    const inAny = settings.schedules.some((s) => isNowInSchedule(now, s));
    if (!inAny) {
      setBlocked(null);
      return;
    }

    // ルート一致？
    const hit = settings.blockRoutes.some((p) => loc.pathname.startsWith(p));
    if (hit) {
      setBlocked(loc.pathname);
      return;
    }

    setBlocked(null);
  }, [loc.pathname, settings, isPanic, tempUnlockedUntil]);

  const goAlternative = () => {
    nav('/focus', { replace: true });
  };

  const unlock = (minutes: number, reason: string) => {
    // ログだけ記録（ローカル）
    const rec = { at: new Date().toISOString(), path: blocked, minutes, reason };
    const arr = JSON.parse(localStorage.getItem('guard:unlockLogs') || '[]');
    arr.push(rec);
    localStorage.setItem('guard:unlockLogs', JSON.stringify(arr));
    setTempUnlockedUntil(Date.now() + minutes * 60 * 1000);
  };

  return (
    <>
      {blocked && <GuardOverlay blockedPath={blocked} onGoAlt={goAlternative} onUnlock={unlock} />}
      {children}
    </>
  );
};
