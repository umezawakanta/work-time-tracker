import React, { useMemo, useState } from 'react';
import { featuresRegistry, Feature, FeatureStatus } from '@/config/features';
import { featureArtifactsRegistry } from '@/config/featureArtifacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDerivedFeatureStatuses } from '@/hooks/useDerivedFeatureStatuses';
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

  const byCategory = useMemo(() => {
    const m = new Map<string, Feature[]>();
    for (const f of featuresRegistry) {
      const effectiveStatus = (derived?.effective?.[f.id] ?? f.status) as FeatureStatus;
      // 着手状況フィルタ
      const isComplete = effectiveStatus === 'complete';
      const isNotStarted = effectiveStatus === 'planning';
      if (progressFilter === 'complete' && !isComplete) continue;
      if (progressFilter === 'not_started' && !isNotStarted) continue;
      if (progressFilter === 'in_progress' && (isComplete || isNotStarted)) continue;
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">機能一覧と開発状況</h1>
      <p className="text-muted-foreground mb-6">
        完成の定義: 本番環境で実APIに接続し、不具合なく動作していること（デモ/モック不可）。
      </p>

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
                              {statusLabel[(derived.suggested[f.id] ?? f.status) as FeatureStatus]}{' '}
                              / 承認:{' '}
                              {statusLabel[(derived.approved?.[f.id] ?? f.status) as FeatureStatus]}
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
                                            size="xs"
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
    </div>
  );
}
