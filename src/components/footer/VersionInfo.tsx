import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VersionInfo = {
  version: string;
  commit?: string;
  builtAt?: string;
};

type ChangelogEntry = { version: string; notes: string };

export const VersionInfo: React.FC = () => {
  const [ver, setVer] = useState<VersionInfo | null>(null);
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const v = await fetch('/version.json')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (v) setVer(v);
      } catch {}
      try {
        const c = await fetch('/changelog.json')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (c && Array.isArray(c.entries)) setEntries(c.entries.slice(0, 3));
      } catch {}
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

  return (
    <div className="mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">バージョン情報</CardTitle>
        </CardHeader>
        <CardContent>
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
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/changelog">すべての更新履歴を見る</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionInfo;
