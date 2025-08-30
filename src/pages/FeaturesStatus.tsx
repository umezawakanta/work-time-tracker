import React, { useMemo, useState } from 'react';
import { featuresRegistry, Feature, FeatureStatus } from '@/config/features';
import { featureArtifactsRegistry } from '@/config/featureArtifacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDerivedFeatureStatuses } from '@/hooks/useDerivedFeatureStatuses';
import { getFeatureByPath } from '@/config/features';
import { NEW_STATUS_ORDER } from '@/services/dev/featureStatusEngine';
import { setArtifactApproval, isArtifactApproved } from '@/services/dev/featureStatusEngine';

const statusLabel: Record<FeatureStatus, string> = {
  planning: '計画中',
  designing: '設計中',
  developing: '開発中',
  unit_testing: '単体テスト中',
  integration_testing: '結合テスト中',
  system_testing: '総合テスト中',
  documenting: 'ドキュメント整備中',
  review: '確認中',
  release_pending: 'リリース待ち',
  complete: '完成',
  // back-compat
  planned: '計画中',
  in_progress: '開発中',
  testing: '単体テスト中',
  docs: 'ドキュメント整備中',
};

const statusBadgeVariant: Record<FeatureStatus, 'default' | 'secondary' | 'outline'> = {
  planning: 'outline',
  designing: 'outline',
  developing: 'secondary',
  unit_testing: 'secondary',
  integration_testing: 'secondary',
  system_testing: 'secondary',
  documenting: 'outline',
  review: 'secondary',
  release_pending: 'secondary',
  complete: 'default',
  // back-compat
  planned: 'outline',
  in_progress: 'secondary',
  testing: 'secondary',
  docs: 'outline',
};

export default function FeaturesStatusPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | 'all'>('all');
  const { data: derived, isLoading: isDeriving, refresh } = useDerivedFeatureStatuses();
  const [sortByPriority, setSortByPriority] = useState<boolean>(true);
  const [progressFilter, setProgressFilter] = useState<
    'all' | 'not_started' | 'in_progress' | 'complete'
  >('all');
  const [viewMode, setViewMode] = useState<'category' | 'priority'>('priority');

  const byCategory = useMemo(() => {
    const m = new Map<string, Feature[]>();
    for (const f of featuresRegistry) {
      const effectiveStatus = (derived?.effective?.[f.id] ?? f.status) as FeatureStatus;
      const suggestedStatus = (derived?.suggested?.[f.id] ?? effectiveStatus) as FeatureStatus;
      // 着手状況フィルタ
      const isCompleteEff = effectiveStatus === 'complete';
      const isNotStartedProg = suggestedStatus === 'planning';
      if (progressFilter === 'complete' && !isCompleteEff) continue;
      if (progressFilter === 'not_started' && !isNotStartedProg) continue;
      if (progressFilter === 'in_progress' && (isCompleteEff || isNotStartedProg)) continue;
      // ステータスフィルタ
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) continue;
      const arr = m.get(f.category) || [];
      arr.push({ ...f, status: effectiveStatus });
      m.set(f.category, arr);
    }
    const priorityRank: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const entries = Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    // カテゴリ内ソート
    return entries.map(([category, list]) => {
      const sorted = [...list].sort((a, b) => {
        if (sortByPriority) {
          const pa = priorityRank[(a as any).priority || 'P3'];
          const pb = priorityRank[(b as any).priority || 'P3'];
          if (pa !== pb) return pa - pb;
        }
        return a.name.localeCompare(b.name);
      });
      return [category, sorted] as [string, Feature[]];
    });
  }, [statusFilter, progressFilter, sortByPriority, derived]);

  const prioritizedList = useMemo(() => {
    const priorityRank: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const list: Feature[] = [];
    for (const f of featuresRegistry) {
      const effectiveStatus = (derived?.effective?.[f.id] ?? f.status) as FeatureStatus;
      const suggestedStatus = (derived?.suggested?.[f.id] ?? effectiveStatus) as FeatureStatus;
      const isCompleteEff = effectiveStatus === 'complete';
      const isNotStartedProg = suggestedStatus === 'planning';
      if (progressFilter === 'complete' && !isCompleteEff) continue;
      if (progressFilter === 'not_started' && !isNotStartedProg) continue;
      if (progressFilter === 'in_progress' && (isCompleteEff || isNotStartedProg)) continue;
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) continue;
      list.push({ ...f, status: effectiveStatus });
    }
    return list.sort((a, b) => {
      const pa = priorityRank[(a as any).priority || 'P3'];
      const pb = priorityRank[(b as any).priority || 'P3'];
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
  }, [statusFilter, progressFilter, derived]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">機能一覧と開発状況</h1>
      <p className="text-muted-foreground mb-6">
        完成の定義: 本番環境で実APIに接続し、不具合なく動作していること（デモ/モック不可）。
      </p>

      {/* 開発状況をシェア */}
      {getFeatureByPath('/_bg/share-dev-progress')?.status === 'complete' && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                // 主要P0/P1候補を抽出（例: ログイン/ログアウト/登録）
                const pickIds = ['login', 'logout', 'user-registration'];
                const lines: string[] = [];
                for (const id of pickIds) {
                  const f = featuresRegistry.find((x) => x.id === id);
                  if (!f) continue;
                  const eff = (derived?.effective?.[id] ?? f.status) as FeatureStatus;
                  const order = NEW_STATUS_ORDER;
                  const progress = Math.round(((order.indexOf(eff) + 1) / order.length) * 100);
                  // 目標リリース日（feature.targetRelease があれば使用）
                  const ymd = (f as any).targetRelease || '';
                  let y = '';
                  let m = '';
                  let d = '';
                  if (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
                    [y, m, d] = ymd.split('-');
                  }
                  const name = f.name;
                  const dateStr = y ? `${y}/${m}/${d}` : '未設定';
                  lines.push(`${name}：${progress}% リリース予定日：${dateStr}`);
                }
                const text = lines.join('\n');
                const shareText = `開発状況アップデート\n------------------\n${text}\n------------------`;
                const url = typeof window !== 'undefined' ? window.location.origin : '';
                if (navigator.share) {
                  navigator.share({ text: shareText, url }).catch(() => {});
                } else {
                  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}%0A${encodeURIComponent(url)}`;
                  window.open(intent, '_blank');
                }
              } catch {}
            }}
            aria-label="開発状況をシェア"
          >
            開発状況をシェア
          </Button>
        </div>
      )}

      {/* ステータスフィルター */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', ...NEW_STATUS_ORDER] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s as any)}
          >
            {s === 'all' ? 'すべて' : statusLabel[s as FeatureStatus]}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={refresh} disabled={isDeriving}>
          自動判定を更新
        </Button>
        <Button
          variant={sortByPriority ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortByPriority((v) => !v)}
        >
          優先度順
        </Button>
        <Button
          variant={viewMode === 'priority' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('priority')}
        >
          リスト(優先度順)
        </Button>
        <Button
          variant={viewMode === 'category' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('category')}
        >
          カテゴリ表示
        </Button>
      </div>

      {/* 着手状況フィルタ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            { key: 'all', label: 'すべて' },
            { key: 'not_started', label: '未着手' },
            { key: 'in_progress', label: '着手中' },
            { key: 'complete', label: '完成' },
          ] as const
        ).map(({ key, label }) => (
          <Button
            key={key}
            variant={progressFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setProgressFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {viewMode === 'priority' ? (
        <Card>
          <CardHeader>
            <CardTitle>優先度リスト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">優先度</th>
                    <th className="p-2">機能</th>
                    <th className="p-2">ステータス</th>
                    <th className="p-2">カテゴリ</th>
                    <th className="p-2 hidden md:table-cell">path</th>
                    <th className="p-2">API</th>
                    <th className="p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritizedList.map((f) => {
                    const isComplete = f.status === 'complete';
                    const canNavigate = isComplete || Boolean(user?.isAdmin);
                    return (
                      <tr key={f.id} className="border-t">
                        <td className="p-2">
                          <Badge variant="outline">{(f as any).priority || 'P3'}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{f.name}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={statusBadgeVariant[f.status]}>
                            {statusLabel[f.status]}
                          </Badge>
                        </td>
                        <td className="p-2">{f.category}</td>
                        <td className="p-2 hidden md:table-cell text-slate-500">{f.path}</td>
                        <td className="p-2">{f.requiresRealAPI ? '実API' : '-'}</td>
                        <td className="p-2">
                          <Button
                            variant={canNavigate ? 'default' : 'secondary'}
                            size="sm"
                            disabled={!canNavigate}
                            onClick={() => navigate(f.path)}
                          >
                            移動
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {byCategory.map(([category, features]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">{features.length} 件</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((f) => {
                    const isComplete = f.status === 'complete';
                    const canNavigate = isComplete || Boolean(user?.isAdmin);
                    return (
                      <div
                        key={f.id}
                        className={`p-4 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{f.name}</h3>
                              <Badge variant={statusBadgeVariant[f.status]}>
                                {statusLabel[f.status]}
                              </Badge>
                              {(f as any).priority && (
                                <Badge variant="outline">{(f as any).priority}</Badge>
                              )}
                              {f.requiresRealAPI && <Badge variant="outline">実API必須</Badge>}
                            </div>
                            {derived?.suggested && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                提案:{' '}
                                {
                                  statusLabel[
                                    (derived.suggested[f.id] ?? f.status) as FeatureStatus
                                  ]
                                }{' '}
                                / 承認:{' '}
                                {
                                  statusLabel[
                                    (derived.approved?.[f.id] ?? f.status) as FeatureStatus
                                  ]
                                }
                              </p>
                            )}
                            {f.description && (
                              <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">path: {f.path}</p>
                            {derived?.signals && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                自動判定: dev-status.json / test-summary.json から推定
                              </p>
                            )}
                            {featureArtifactsRegistry[f.id] && (
                              <div className="mt-3">
                                <p className="text-xs text-slate-500 mb-1">成果物:</p>
                                <ul className="grid grid-cols-2 gap-1 text-sm list-disc list-inside">
                                  {Object.entries(featureArtifactsRegistry[f.id]).map(
                                    ([artifactId, art]) => {
                                      const approved = isArtifactApproved(f.id, artifactId);
                                      return (
                                        <li key={art.title} className="flex items-center gap-2">
                                          <a
                                            className="underline text-blue-600 hover:text-blue-700"
                                            href={art.href}
                                          >
                                            {art.title}
                                          </a>
                                          {user?.isAdmin && (
                                            <Button
                                              variant={approved ? 'secondary' : 'outline'}
                                              size="sm"
                                              onClick={() => {
                                                setArtifactApproval(f.id, artifactId, !approved);
                                                refresh();
                                              }}
                                              aria-label={`${art.title} を${approved ? '未承認' : '承認'}にする`}
                                            >
                                              {approved ? '承認済' : '承認'}
                                            </Button>
                                          )}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div>
                            <Button
                              variant={canNavigate ? 'default' : 'secondary'}
                              disabled={!canNavigate}
                              onClick={() => navigate(f.path)}
                              aria-disabled={!canNavigate}
                              aria-label={`${f.name}へ移動`}
                            >
                              移動
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
