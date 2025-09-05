import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { featuresRegistry } from '@/config/features';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface BugItem {
  _id: string;
  title: string;
  description?: string;
  featureId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

export default function BugListPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [featureId, setFeatureId] = useState<string>(searchParams.get('featureId') || 'all');
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'all');

  const selectableFeatures = featuresRegistry
    .map((f) => ({ id: f.id, name: f.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (featureId !== 'all') qs.set('featureId', featureId);
    if (status !== 'all') qs.set('status', status);
    const res = await fetch('/api/bugs?' + qs.toString());
    const data = await res.json();
    setBugs(data?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [featureId, status]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (featureId !== 'all') qs.set('featureId', featureId);
    if (status !== 'all') qs.set('status', status);
    setSearchParams(qs, { replace: true });
  }, [featureId, status]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">不具合一覧</h1>
        <Button onClick={() => navigate('/bugs/new')}>不具合を登録</Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">機能</label>
            <Select value={featureId} onValueChange={(v) => setFeatureId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {selectableFeatures.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">状態</label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="open">未対応</SelectItem>
                <SelectItem value="in_progress">対応中</SelectItem>
                <SelectItem value="resolved">修正済み</SelectItem>
                <SelectItem value="closed">クローズ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={load} disabled={loading}>
              再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>読み込み中...</p>
          ) : bugs.length === 0 ? (
            <p className="text-slate-500">不具合はありません</p>
          ) : (
            <ul className="divide-y">
              {bugs.map((b) => (
                <li key={b._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{b.title}</p>
                      <p className="text-xs text-slate-500">
                        機能: {b.featureId} / 重要度: {b.severity} / 状態: {b.status}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(b.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {b.description && (
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                      {b.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
