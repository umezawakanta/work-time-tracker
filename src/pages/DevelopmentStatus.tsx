import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

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
  const [history, setHistory] = useState<
    { sha: string; short: string; message: string; timestamp: string; totals: any }[]
  >([]);
  const [seriesVisible, setSeriesVisible] = useState<Record<'findings' | 'todo' | 'mock' | 'wip' | 'error', boolean>>({
    findings: true,
    todo: true,
    mock: true,
    wip: true,
    error: true,
  });
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
        // load history
        try {
          const hres = await fetch(`/dev-status-history.json${q}`);
          if (hres.ok) {
            const h = (await hres.json()) as any[];
            setHistory(Array.isArray(h) ? h : []);
          }
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build chart data (commit-wise % completion from the first snapshot)
  const chartData: Array<{
    name: string;
    findingsPct: number;
    todoPct: number;
    mockPct: number;
    wipPct: number;
    errorPct: number;
    message?: string;
    sha?: string;
  }> = (() => {
    if (!data || history.length === 0) return [];
    const base = {
      findings: Number(history[0]?.totals?.findings ?? (data.findings?.length || 0)),
      todo: Number(history[0]?.totals?.todo ?? 0),
      mock: Number(history[0]?.totals?.mock ?? 0),
      wip: Number(history[0]?.totals?.wip ?? 0),
      error: Number(history[0]?.totals?.error ?? 0),
    };
    const toPct = (start: number, current: number) => {
      if (!start || start <= 0) return 100;
      const pct = ((start - Math.max(0, current)) / start) * 100;
      return Math.max(0, Math.min(100, pct));
    };
    return history.map((h) => {
      const current = {
        findings: Number(h.totals?.findings ?? 0),
        todo: Number(h.totals?.todo ?? 0),
        mock: Number(h.totals?.mock ?? 0),
        wip: Number(h.totals?.wip ?? 0),
        error: Number(h.totals?.error ?? 0),
      };
      return {
        name: h.short,
        findingsPct: toPct(base.findings, current.findings),
        todoPct: toPct(base.todo, current.todo),
        mockPct: toPct(base.mock, current.mock),
        wipPct: toPct(base.wip, current.wip),
        errorPct: toPct(base.error, current.error),
        message: h.message,
        sha: h.sha,
      };
    });
  })();

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
        ...filteredFindings.map((f) => [
          f.kind,
          f.file,
          String(f.line),
          f.snippet.replace(/\n/g, ' '),
        ]),
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
            <span className="text-gray-600">
              表示: {filteredFindings.length} / {data.totals.findings}
            </span>
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
          {/* 修正率サマリー */}
          {history.length > 0 && (
            <section>
              <h2 className="text-lg font-medium">修正率（コミット単位推移）</h2>
              <div className="mt-2 grid grid-cols-1 gap-3">
                {(['findings', 'todo', 'mock', 'wip', 'error'] as const).map((k) => {
                  const current =
                    data.totals[k === 'error' ? 'errorHints' : (k as any)] ||
                    (k === 'findings' ? data.findings.length : 0);
                  const start = history[0]?.totals?.[k] ?? current;
                  const denom = start || 1; // avoid div by zero
                  const rate = Math.max(0, Math.min(100, ((start - current) / denom) * 100));
                  return (
                    <div key={`rate-${k}`} className="border rounded p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium uppercase">{k}</span>
                        <span className="text-gray-600">{rate.toFixed(1)}%</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-100 rounded">
                        <div
                          className="h-2 bg-emerald-500 rounded"
                          style={{ width: `${rate}%` }}
                          aria-label={`${k} 修正率 ${rate.toFixed(1)}%`}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        現在: {current} / 初期: {start}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {history.length > 0 && chartData.length > 0 && (
            <section>
              <h2 className="text-lg font-medium">件数推移（コミット単位・%完了）</h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                {(['findings', 'todo', 'mock', 'wip', 'error'] as const).map((k) => (
                  <label key={`toggle-${k}`} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={seriesVisible[k]}
                      onChange={(e) => setSeriesVisible((prev) => ({ ...prev, [k]: e.target.checked }))}
                    />
                    <span className="uppercase">{k}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                      labelFormatter={(label: any, payload: any) => {
                        const p = Array.isArray(payload) && payload[0] ? payload[0].payload : undefined;
                        return p?.sha ? `${label} (${p.sha})` : String(label);
                      }}
                    />
                    <Legend />
                    {seriesVisible.findings && (
                      <Line type="monotone" dataKey="findingsPct" name="findings" stroke="#0ea5e9" dot={false} />
                    )}
                    {seriesVisible.todo && (
                      <Line type="monotone" dataKey="todoPct" name="todo" stroke="#10b981" dot={false} />
                    )}
                    {seriesVisible.mock && (
                      <Line type="monotone" dataKey="mockPct" name="mock" stroke="#6366f1" dot={false} />
                    )}
                    {seriesVisible.wip && (
                      <Line type="monotone" dataKey="wipPct" name="wip" stroke="#f59e0b" dot={false} />
                    )}
                    {seriesVisible.error && (
                      <Line type="monotone" dataKey="errorPct" name="error" stroke="#ef4444" dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
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
