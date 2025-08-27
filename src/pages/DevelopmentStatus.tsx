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
  const [query, setQuery] = useState<string>('');
  const [kinds, setKinds] = useState<Record<Finding['kind'], boolean>>({
    todo: true,
    mock: true,
    wip: true,
    error: true,
    note: true,
  });

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

  const filteredFindings: Finding[] = (() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.findings.filter((f) => {
      if (!kinds[f.kind]) return false;
      if (!q) return true;
      return (
        f.file.toLowerCase().includes(q) ||
        String(f.line).includes(q) ||
        f.snippet.toLowerCase().includes(q) ||
        f.kind.toLowerCase().includes(q)
      );
    });
  })();

  const exportCsv = () => {
    try {
      const rows = [
        ['kind', 'file', 'line', 'snippet'],
        ...filteredFindings.map((f) => [f.kind, f.file, String(f.line), f.snippet.replace(/\n/g, ' ')]),
      ];
      const csv = rows
        .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dev-status.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold">開発ステータス</h1>
      <p className="text-sm text-gray-600 mt-1">未実装・モック・WIP・エラーヒントの自動検出</p>
      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ファイル名・行・テキスト・種別で検索"
            className="w-full max-w-xl border rounded px-3 py-2 text-sm"
            aria-label="検索"
          />
          <button
            onClick={exportCsv}
            className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50"
            aria-label="CSVエクスポート"
          >
            CSVエクスポート
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {(['todo', 'mock', 'wip', 'error', 'note'] as Finding['kind'][]).map((k) => (
            <label key={k} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={kinds[k]}
                onChange={(e) => setKinds((prev) => ({ ...prev, [k]: e.target.checked }))}
              />
              <span className="uppercase">{k}</span>
            </label>
          ))}
          {data && (
            <span className="text-gray-600">表示: {filteredFindings.length} / {data.totals.findings}</span>
          )}
        </div>
      </div>
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
                {filteredFindings.length === 0 && (
                  <div className="p-3 text-gray-500">検出はありませんでした。</div>
                )}
                {filteredFindings.map((f, idx) => (
                  <div key={`${f.file}:${f.line}:${idx}`} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-gray-600">
                        {f.file}:{f.line}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs px-2 py-0.5 border rounded hover:bg-gray-50"
                          onClick={() => {
                            try {
                              navigator.clipboard?.writeText(`${f.file}:${f.line}`);
                            } catch {}
                          }}
                          aria-label="パスをコピー"
                        >
                          コピー
                        </button>
                        <a
                          className="text-xs px-2 py-0.5 border rounded hover:bg-gray-50"
                          href={`https://github.com/umezawakanta/work-time-tracker/blob/main/${f.file}#L${f.line}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHubで開く"
                        >
                          GitHub
                        </a>
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
                    </div>
                    <pre className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                      {f.snippet}
                    </pre>
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
