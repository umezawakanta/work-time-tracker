import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Entry = { version: string; notes: string };

const ChangelogPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const c = await fetch('/changelog.json')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        if (c && Array.isArray(c.entries)) setEntries(c.entries);
      } catch {}
    })();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>更新履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">更新履歴がまだありません。</p>
            ) : (
              entries.map((e) => (
                <div key={e.version}>
                  <div className="text-lg font-semibold">v{e.version}</div>
                  <pre className="whitespace-pre-wrap text-gray-800 mt-2 leading-7">{e.notes}</pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangelogPage;
