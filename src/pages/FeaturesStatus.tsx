import React, { useMemo } from 'react';
import { featuresRegistry, Feature, FeatureStatus } from '@/config/features';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const statusLabel: Record<FeatureStatus, string> = {
  complete: '完成',
  in_progress: '開発中',
  planned: '計画中',
};

const statusBadgeVariant: Record<FeatureStatus, 'default' | 'secondary' | 'outline'> = {
  complete: 'default',
  in_progress: 'secondary',
  planned: 'outline',
};

export default function FeaturesStatusPage(): React.JSX.Element {
  const navigate = useNavigate();

  const byCategory = useMemo(() => {
    const m = new Map<string, Feature[]>();
    for (const f of featuresRegistry) {
      const arr = m.get(f.category) || [];
      arr.push(f);
      m.set(f.category, arr);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">機能一覧と開発状況</h1>
      <p className="text-muted-foreground mb-6">
        完成の定義: 本番環境で実APIに接続し、不具合なく動作していること（デモ/モック不可）。
      </p>

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
                            {f.requiresRealAPI && <Badge variant="outline">実API必須</Badge>}
                          </div>
                          {f.description && (
                            <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">path: {f.path}</p>
                        </div>
                        <div>
                          <Button
                            variant={isComplete ? 'default' : 'secondary'}
                            disabled={!isComplete}
                            onClick={() => navigate(f.path)}
                            aria-disabled={!isComplete}
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
