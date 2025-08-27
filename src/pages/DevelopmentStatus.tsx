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

type CoverageSummary = {
  total?: {
    lines?: { pct?: number };
    statements?: { pct?: number };
    functions?: { pct?: number };
    branches?: { pct?: number };
  };
};

type TestSummary = {
  generatedAt: string;
  unit?: { hasCoverage?: boolean };
  e2e?: { available?: boolean };
};

export default function DevelopmentStatus(): React.JSX.Element {
  const [data, setData] = useState<DevStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { sha: string; short: string; message: string; timestamp: string; totals: any }[]
  >([]);
  const [seriesVisible, setSeriesVisible] = useState<
    Record<'findings' | 'todo' | 'mock' | 'wip' | 'error', boolean>
  >({
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
  const [coverage, setCoverage] = useState<CoverageSummary | null>(null);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [ciStatus, setCiStatus] = useState<{ github: any[]; vercel: any[] } | null>(null);

  type SeriesKey = 'findings' | 'todo' | 'mock' | 'wip' | 'error';

  // Calculate completion rates and priority ordering (lower % first)
  const priorityOrder: { key: SeriesKey; rate: number; current: number; start: number }[] = (() => {
    if (!data) return [];
    const startFromHistory = history.length > 0 ? (history[0].totals as any) : {};
    const currentTotals = {
      findings: data.findings.length,
      todo: data.totals.todo,
      mock: data.totals.mock,
      wip: data.totals.wip,
      error: data.totals.errorHints,
    };
    const startTotals = {
      findings: Number(startFromHistory.findings ?? currentTotals.findings),
      todo: Number(startFromHistory.todo ?? currentTotals.todo),
      mock: Number(startFromHistory.mock ?? currentTotals.mock),
      wip: Number(startFromHistory.wip ?? currentTotals.wip),
      error: Number(startFromHistory.error ?? currentTotals.error),
    } as Record<SeriesKey, number>;

    const rate = (start: number, cur: number) => {
      const denom = start || 1;
      return Math.max(0, Math.min(100, ((start - cur) / denom) * 100));
    };

    const entries: { key: SeriesKey; rate: number; current: number; start: number }[] = (
      ['findings', 'todo', 'mock', 'wip', 'error'] as SeriesKey[]
    ).map((k) => ({
      key: k,
      rate: rate(startTotals[k], currentTotals[k]),
      current: currentTotals[k],
      start: startTotals[k],
    }));

    entries.sort((a, b) => a.rate - b.rate);
    return entries;
  })();

  const lowestKey: SeriesKey | null = priorityOrder.length > 0 ? priorityOrder[0].key : null;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const ts = Date.now();
        const q = `?ts=${ts}`;
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

        // Load coverage summary if exists
        try {
          const covRes = await fetch(`/coverage-summary.json${q}`);
          if (covRes.ok) {
            const cov = (await covRes.json()) as CoverageSummary;
            setCoverage(cov);
          }
        } catch {}

        // Load test summary if exists
        try {
          const tsRes = await fetch(`/test-summary.json${q}`);
          if (tsRes.ok) {
            const ts = (await tsRes.json()) as TestSummary;
            setTestSummary(ts);
          }
        } catch {}

        // Load CI status (serverless) - best effort
        try {
          const ciRes = await fetch(`/api/status/ci?limit=5&ts=${ts}`);
          if (ciRes.ok) {
            const ci = (await ciRes.json()) as any;
            if (ci?.data) setCiStatus(ci.data);
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
    time: number;
    findingsPct: number;
    todoPct: number;
    mockPct: number;
    wipPct: number;
    errorPct: number;
    covLines?: number;
    covFuncs?: number;
    covBranches?: number;
    e2ePassPct?: number;
    message?: string;
    sha?: string;
    timestamp?: string;
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
        time: h.timestamp ? new Date(h.timestamp).getTime() : 0,
        findingsPct: toPct(base.findings, current.findings),
        todoPct: toPct(base.todo, current.todo),
        mockPct: toPct(base.mock, current.mock),
        wipPct: toPct(base.wip, current.wip),
        errorPct: toPct(base.error, current.error),
        covLines: Number((h as any).tests?.coverage?.lines ?? 0),
        covFuncs: Number((h as any).tests?.coverage?.functions ?? 0),
        covBranches: Number((h as any).tests?.coverage?.branches ?? 0),
        e2ePassPct: Number((h as any).tests?.e2e?.passPct ?? 0),
        message: h.message,
        sha: h.sha,
        timestamp: h.timestamp,
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
              {priorityOrder.length > 0 && (
                <div className="mt-1 text-sm text-gray-700" aria-live="polite">
                  優先カテゴリ:{' '}
                  <span className="font-semibold uppercase">{priorityOrder[0].key}</span>
                  <span className="ml-1">({priorityOrder[0].rate.toFixed(1)}%)</span>
                </div>
              )}
              <div className="mt-2 grid grid-cols-1 gap-3">
                {priorityOrder.map(({ key: k, rate, current, start }) => (
                  <div
                    key={`rate-${k}`}
                    className={`border rounded p-3 ${lowestKey === k ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium uppercase">{k}</span>
                      <span className="text-gray-600">{rate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded">
                      <div
                        className={`h-2 ${lowestKey === k ? 'bg-amber-500' : 'bg-emerald-500'} rounded`}
                        style={{ width: `${rate}%` }}
                        aria-label={`${k} 修正率 ${rate.toFixed(1)}%`}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      現在: {current} / 初期: {start}
                    </div>
                  </div>
                ))}
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
                      onChange={(e) =>
                        setSeriesVisible((prev) => ({ ...prev, [k]: e.target.checked }))
                      }
                    />
                    <span className="uppercase">{k}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={['auto', 'auto']}
                      tickFormatter={(v) =>
                        new Date(v).toLocaleString('ja-JP', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }
                      minTickGap={24}
                    />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      yAxisId={1}
                      orientation="right"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, label, payload }) => {
                        if (!active || !Array.isArray(payload) || payload.length === 0) return null;
                        const p = payload[0]?.payload as any;
                        const ts = p?.timestamp ? new Date(p.timestamp).toLocaleString() : '';
                        return (
                          <div className="bg-white border rounded p-2 text-xs">
                            <div className="font-semibold mb-1">
                              {p?.name} {p?.sha && `(${p.sha})`}
                            </div>
                            {p?.message && <div className="mb-1">{p.message}</div>}
                            {ts && <div className="text-gray-600 mb-1">{ts}</div>}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                              {seriesVisible.findings && (
                                <div>findings: {Number(p.findingsPct).toFixed(1)}%</div>
                              )}
                              {seriesVisible.todo && (
                                <div>todo: {Number(p.todoPct).toFixed(1)}%</div>
                              )}
                              {seriesVisible.mock && (
                                <div>mock: {Number(p.mockPct).toFixed(1)}%</div>
                              )}
                              {seriesVisible.wip && <div>wip: {Number(p.wipPct).toFixed(1)}%</div>}
                              {seriesVisible.error && (
                                <div>error: {Number(p.errorPct).toFixed(1)}%</div>
                              )}
                              {typeof p.covLines === 'number' && (
                                <div>coverage(lines): {Number(p.covLines).toFixed(1)}%</div>
                              )}
                              {typeof p.e2ePassPct === 'number' && (
                                <div>e2e pass: {Number(p.e2ePassPct).toFixed(1)}%</div>
                              )}
                            </div>
                            {p?.sha && (
                              <a
                                className="inline-block mt-2 text-blue-600 underline"
                                href={`https://github.com/umezawakanta/work-time-tracker/commit/${p.sha}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                コミットを開く
                              </a>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    {seriesVisible.findings && (
                      <Line
                        type="monotone"
                        dataKey="findingsPct"
                        name="findings"
                        stroke="#0ea5e9"
                        dot={false}
                        strokeWidth={lowestKey === 'findings' ? 3 : 1.5}
                      />
                    )}
                    {seriesVisible.todo && (
                      <Line
                        type="monotone"
                        dataKey="todoPct"
                        name="todo"
                        stroke="#10b981"
                        dot={false}
                        strokeWidth={lowestKey === 'todo' ? 3 : 1.5}
                      />
                    )}
                    {seriesVisible.mock && (
                      <Line
                        type="monotone"
                        dataKey="mockPct"
                        name="mock"
                        stroke="#6366f1"
                        dot={false}
                        strokeWidth={lowestKey === 'mock' ? 3 : 1.5}
                      />
                    )}
                    {seriesVisible.wip && (
                      <Line
                        type="monotone"
                        dataKey="wipPct"
                        name="wip"
                        stroke="#f59e0b"
                        dot={false}
                        strokeWidth={lowestKey === 'wip' ? 3 : 1.5}
                      />
                    )}
                    {seriesVisible.error && (
                      <Line
                        type="monotone"
                        dataKey="errorPct"
                        name="error"
                        stroke="#ef4444"
                        dot={false}
                        strokeWidth={lowestKey === 'error' ? 3 : 1.5}
                      />
                    )}
                    {/* Secondary overlays */}
                    <Line
                      type="monotone"
                      dataKey="covLines"
                      name="coverage(lines%)"
                      stroke="#22c55e"
                      dot={false}
                      yAxisId={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="e2ePassPct"
                      name="e2e pass%"
                      stroke="#06b6d4"
                      dot={false}
                      yAxisId={1}
                    />
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

          {(coverage || testSummary) && (
            <section>
              <h2 className="text-lg font-medium">テスト/カバレッジ</h2>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded border p-3">
                  <h3 className="font-semibold mb-2">ユニットテスト カバレッジ</h3>
                  {coverage?.total ? (
                    <ul className="space-y-1">
                      <li>Lines: {coverage.total?.lines?.pct ?? 0}%</li>
                      <li>Statements: {coverage.total?.statements?.pct ?? 0}%</li>
                      <li>Functions: {coverage.total?.functions?.pct ?? 0}%</li>
                      <li>Branches: {coverage.total?.branches?.pct ?? 0}%</li>
                    </ul>
                  ) : (
                    <p className="text-gray-600">カバレッジレポートが見つかりません</p>
                  )}
                </div>
                <div className="rounded border p-3">
                  <h3 className="font-semibold mb-2">テスト実行状況</h3>
                  <ul className="space-y-1">
                    <li>Unit coverage file: {testSummary?.unit?.hasCoverage ? 'あり' : 'なし'}</li>
                    <li>E2E results: {testSummary?.e2e?.available ? 'あり' : '未取得'}</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {ciStatus && (
            <section>
              <h2 className="text-lg font-medium">CI / デプロイ状況</h2>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded border p-3">
                  <h3 className="font-semibold mb-2">GitHub Actions（最新5件）</h3>
                  <ul className="space-y-2">
                    {ciStatus.github?.map((r: any) => (
                      <li key={r.id} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {r.name} · {r.status}
                          {r.conclusion ? `/${r.conclusion}` : ''}
                        </span>
                        <a
                          href={r.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          open
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded border p-3">
                  <h3 className="font-semibold mb-2">Vercel Deploy（最新5件）</h3>
                  <ul className="space-y-2">
                    {ciStatus.vercel?.map((d: any) => (
                      <li key={d.uid} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {d.state} · {d.url}
                        </span>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          open
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

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
