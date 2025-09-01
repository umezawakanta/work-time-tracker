import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VersionInfo = {
  version: string;
  commit?: string;
  builtAt?: string;
};

type ChangelogEntry = { version: string; notes: string };

export const __testables = {
  fetchVersion: async () => {
    try {
      const v = await fetch(`/version.json?ts=${Date.now()}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      return v;
    } catch {
      return null;
    }
  },
  fetchChangelog: async () => {
    try {
      const c = await fetch(`/changelog.json?ts=${Date.now()}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      return c;
    } catch {
      return null;
    }
  },
};

export const VersionInfo: React.FC = () => {
  const [ver, setVer] = useState<VersionInfo | null>(null);
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await fetch(`/version.json?ts=${Date.now()}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (v) setVer(v);
        else setError('バージョン情報の取得に失敗しました');
      } catch {
        setError('バージョン情報の取得に失敗しました');
      }
      try {
        const c = await fetch(`/changelog.json?ts=${Date.now()}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (c && Array.isArray(c.entries)) setEntries(c.entries.slice(0, 3));
        else if (!error) setError('更新履歴の取得に失敗しました');
      } catch {
        if (!error) setError('更新履歴の取得に失敗しました');
      }
    })();
  }, []);

  const fmtDate = (iso?: string): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('ja-JP');
    } catch {
      return iso;
    }
  };

  const shareToX = () => {
    try {
      const latest = entries[0];
      const url = 'https://work-time-tracker-five.vercel.app';
      const title = latest
        ? `Work Time Tracker v${latest.version} を公開しました`
        : 'Work Time Tracker 更新情報';
      const text = latest?.notes ? `${title}\n\n${latest.notes}\n\n${url}` : `${title}\n\n${url}`;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  const shareToLINE = () => {
    try {
      const latest = entries[0];
      const url = 'https://work-time-tracker-five.vercel.app';
      const title = latest
        ? `Work Time Tracker v${latest.version} を公開しました`
        : 'Work Time Tracker 更新情報';
      const text = latest?.notes ? `${title}\n\n${latest.notes}` : title;
      const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  return (
    <div className="mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">バージョン情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {error ? error : 'OK'}
          </div>
          <div className="text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span>現在のバージョン:</span>
              <span className="font-semibold">{ver?.version || '—'}</span>
              {ver?.commit && <span className="text-gray-500">(commit {ver.commit})</span>}
              {ver?.builtAt && (
                <span className="ml-auto text-gray-500">ビルド: {fmtDate(ver.builtAt)}</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">更新履歴（最新）</p>
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">更新履歴がまだありません。</p>
            ) : (
              <div className="space-y-3">
                {entries.map((e) => (
                  <div key={e.version} className="text-sm">
                    <div className="font-medium">v{e.version}</div>
                    {e.notes ? (
                      <pre className="whitespace-pre-wrap text-gray-700 mt-1 leading-6">
                        {e.notes}
                      </pre>
                    ) : (
                      <p className="text-gray-500">（内容なし）</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/changelog">すべての更新履歴を見る</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={shareToX} aria-label="Xでシェア">
                Xでシェア
              </Button>
              <Button variant="ghost" size="sm" onClick={shareToLINE} aria-label="LINEでシェア">
                LINEでシェア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionInfo;
