import React, { useEffect, useState } from 'react';

type Finding = {
  file: string;
  line: number;
  snippet: string;
  kind: 'todo' | 'mock' | 'wip' | 'error' | 'note';
};

type Flags = {
  wipRoutes?: string[];
  mockRoutes?: string[];
};

type DevStatus = {
  generatedAt: string;
  totals: {
    filesScanned: number;
    findings: number;
    todo: number;
    mock: number;
    wip: number;
    errorHints: number;
  };
  flags: Flags;
  findings: Finding[];
};

export default function DevelopmentStatus(): React.JSX.Element {
  const [data, setData] = useState<DevStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = `?ts=${Date.now()}`;
        const res = await fetch(`/dev-status.json${q}`);
        if (!res.ok) throw new Error('failed to load dev-status.json');
        const json = (await res.json()) as DevStatus;
        setData(json);
      } catch (e: any) {
        setError(e?.message || 'failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold">開発ステータス</h1>
      <p className="text-sm text-gray-600 mt-1">未実装・モック・WIP・エラーヒントの自動検出</p>
      {loading && <div className="mt-6 h-24 rounded bg-gray-100 animate-pulse" />}
      {error && (
        <p className="mt-4 text-sm text-red-600" aria-live="polite">
          読み込みに失敗しました: {error}
        </p>
      )}
      {data && (
        <div className="mt-6 space-y-6">
          <section>
            <div className="text-sm text-gray-700">
              <div>生成時刻: {new Date(data.generatedAt).toLocaleString()}</div>
              <div className="flex gap-4 mt-1 text-xs">
                <span>ファイル: {data.totals.filesScanned}</span>
                <span>検出: {data.totals.findings}</span>
                <span>TODO: {data.totals.todo}</span>
                <span>MOCK: {data.totals.mock}</span>
                <span>WIP: {data.totals.wip}</span>
                <span>ERROR: {data.totals.errorHints}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium">フラグ付きルート</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded border p-3">
                <h3 className="text-sm font-semibold text-amber-700">WIP</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {(data.flags.wipRoutes || []).map((r) => (
                    <li key={`wip-${r}`}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded border p-3">
                <h3 className="text-sm font-semibold text-sky-700">モック/ダミー</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {(data.flags.mockRoutes || []).map((r) => (
                    <li key={`mock-${r}`}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium">検出結果</h2>
            <div className="mt-2 rounded border">
              <div className="max-h-[60vh] overflow-auto divide-y text-sm">
                {data.findings.length === 0 && (
                  <div className="p-3 text-gray-500">検出はありませんでした。</div>
                )}
                {data.findings.map((f, idx) => (
                  <div key={`${f.file}:${f.line}:${idx}`} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-gray-600">
                        {f.file}:{f.line}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          f.kind === 'todo'
                            ? 'bg-gray-100 text-gray-700'
                            : f.kind === 'mock'
                            ? 'bg-sky-100 text-sky-700'
                            : f.kind === 'wip'
                            ? 'bg-amber-100 text-amber-700'
                            : f.kind === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {f.kind.toUpperCase()}
                      </span>
                    </div>
                    <pre className="mt-1 text-gray-800 whitespace-pre-wrap break-words">{f.snippet}</pre>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}


