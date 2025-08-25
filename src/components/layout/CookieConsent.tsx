import React, { useEffect, useState } from 'react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('cookie:consent');
      if (!accepted) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[90%] rounded-lg border bg-white shadow p-4 text-sm"
    >
      <p className="text-slate-700">
        利便性向上のため、サイトは最小限のCookieを使用します。詳細はプライバシーをご確認ください。
      </p>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          className="px-3 py-1.5 rounded border text-slate-700 hover:bg-slate-50"
          onClick={() => setVisible(false)}
        >
          後で
        </button>
        <button
          className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {
            try { localStorage.setItem('cookie:consent', 'accepted'); } catch {}
            setVisible(false);
          }}
        >
          同意する
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;


