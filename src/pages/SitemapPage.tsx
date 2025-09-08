import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { featuresRegistry, type Feature, type FeatureStatus } from '@/config/features';

type Grouped = Record<string, Feature[]>;

const STATUS_LABEL: Record<FeatureStatus, string> = {
  planning: '計画中',
  designing: '設計中',
  developing: '開発中',
  unit_testing: '単体テスト',
  integration_testing: '結合テスト',
  system_testing: '総合テスト',
  documenting: 'ドキュメント',
  review: 'レビュー',
  release_pending: 'リリース待ち',
  complete: '完成',
  // legacy互換
  in_progress: '進行中',
  planned: '計画中',
  testing: 'テスト',
  docs: 'ドキュメント',
};

const STATUS_ORDER: FeatureStatus[] = [
  'complete',
  'release_pending',
  'system_testing',
  'integration_testing',
  'unit_testing',
  'developing',
  'designing',
  'planning',
  'review',
  'documenting',
  'in_progress',
  'planned',
  'testing',
  'docs',
];

const statusRank = (s: FeatureStatus) => STATUS_ORDER.indexOf(s);

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'good'|'warn'|'bad'|'default' }) {
  const cls =
    tone === 'good' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
    tone === 'warn' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
    tone === 'bad'  ? 'bg-rose-50 text-rose-700 ring-rose-200' :
                      'bg-slate-50 text-slate-700 ring-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

export default function SiteMapPage() {
  const [q, setQ] = useState('');
  const [showOnlyReady, setShowOnlyReady] = useState(false);

  const grouped: Grouped = useMemo(() => {
    // 検索 & 完了のみトグル
    const filtered = featuresRegistry
      .filter(f => !f.disabled)
      .filter(f => {
        const hit = (f.name + f.description + f.category + f.path).toLowerCase().includes(q.toLowerCase());
        return hit;
      })
      .filter(f => !showOnlyReady || f.status === 'complete');

    // カテゴリ別グループ
    return filtered.reduce<Grouped>((acc, f) => {
      (acc[f.category] ||= []).push(f);
      return acc;
    }, {});
  }, [q, showOnlyReady]);

  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  return (
    <main className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 pb-24">
      {/* ヒーロー（CLS対策で固定高・画像なし） */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white p-5 sm:p-8 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold leading-tight">サイトマップ</h1>
        <p className="mt-1 text-sm opacity-95">全機能の一覧と状態。リンクから各ページへ移動できます。</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            aria-label="機能検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="機能名・説明・カテゴリ・パスで検索"
            className="w-full sm:w-96 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          <label className="inline-flex select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={showOnlyReady}
              onChange={(e) => setShowOnlyReady(e.target.checked)}
            />
            完成のみ表示
          </label>
        </div>
      </section>

      {/* 目次（カテゴリ） */}
      <nav className="mb-4 overflow-x-auto">
        <ul className="flex gap-2 min-w-max">
          {categories.map((c) => (
            <li key={c}>
              <a href={`#cat-${encodeURIComponent(c)}`} className="inline-block whitespace-nowrap rounded-xl border px-3 py-1 text-sm hover:bg-slate-50">
                {c}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 本体 */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const items = grouped[cat].slice().sort((a, b) => {
            // 完成を上に、次に優先度、最後に名前
            const sr = statusRank(a.status) - statusRank(b.status);
            if (sr !== 0) return sr;
            const pa = a.priority ?? 'P3';
            const pb = b.priority ?? 'P3';
            if (pa !== pb) return pa.localeCompare(pb); // P0→P3
            return a.name.localeCompare(b.name, 'ja');
          });
          return (
            <section key={cat} id={`cat-${encodeURIComponent(cat)}`}>
              <h2 className="mb-2 text-lg font-semibold">{cat}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((f) => (
                  <li key={f.id} className="rounded-xl border p-3 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={f.path} className="font-medium underline-offset-2 hover:underline break-words">
                        {f.name}
                      </Link>
                      <div className="flex gap-1 shrink-0">
                        {/* 優先度 */}
                        {f.priority && (
                          <Badge tone={f.priority === 'P0' ? 'bad' : f.priority === 'P1' ? 'warn' : 'default'}>
                            {f.priority}
                          </Badge>
                        )}
                        {/* ステータス */}
                        <Badge tone={f.status === 'complete' ? 'good' : f.status.includes('test') ? 'warn' : 'default'}>
                          {STATUS_LABEL[f.status]}
                        </Badge>
                      </div>
                    </div>
                    {f.description && (
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2 break-words">{f.description}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500 break-all">{f.path}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
