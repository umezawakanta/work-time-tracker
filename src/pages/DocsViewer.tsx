import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { featureArtifactsRegistry } from '@/config/featureArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { isArtifactApproved, setArtifactApproval } from '@/services/dev/featureStatusEngine';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function DocsViewer(): React.JSX.Element {
  const params = useParams();
  const path = `/docs/${[params['*']].filter(Boolean).join('')}`;
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // 成果物承認（このドキュメントがどの成果物かを逆引き）
  const docMeta = useMemo(() => {
    // path は /docs/features/:featureId/:doc
    const segments = path.split('/').filter(Boolean);
    const featureId = segments[2] || '';
    let artifactId: string | null = null;
    const reg = featureArtifactsRegistry[featureId as keyof typeof featureArtifactsRegistry];
    if (reg) {
      for (const [aId, link] of Object.entries(reg)) {
        if (link.href === path) {
          artifactId = aId;
          break;
        }
      }
    }
    return { featureId, artifactId };
  }, [path]);
  const approved = docMeta.artifactId
    ? isArtifactApproved(docMeta.featureId, docMeta.artifactId)
    : false;
  const [open, setOpen] = useState(false);
  const checklist = [
    '目的とスコープが具体的で検証可能',
    '機能要件が網羅され曖昧さがない',
    '非機能要件（性能/可用性/セキュリティ/アクセシビリティ）が定義済み',
    'API入出力・データフロー・依存関係が明記されている',
    '完了条件と受け入れ基準が明確',
    'リスクと対応が列挙されている',
  ];
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = checklist.every((_, i) => checked[i]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setContent(null);
    const mdUrl = `${path}.md`;
    fetch(mdUrl, { cache: 'no-store' })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((text) => {
        if (!isMounted) return;
        setContent(text);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('ドキュメントが見つかりませんでした');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [path]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">ドキュメント</h1>
          <p className="text-sm text-slate-600">{path}.md</p>
        </div>
        {user?.isAdmin && docMeta.artifactId && (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant={approved ? 'secondary' : 'outline'}>
                {approved ? '承認済' : '承認'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>要件定義書 承認チェック</AlertDialogTitle>
                <AlertDialogDescription>
                  すべての項目にチェックを入れてから承認してください。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3 py-2">
                {checklist.map((label, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[idx])}
                      onChange={(e) => setChecked((s) => ({ ...s, [idx]: e.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  disabled={!allChecked}
                  onClick={() => {
                    setArtifactApproval(docMeta.featureId, docMeta.artifactId!, true);
                    setOpen(false);
                  }}
                >
                  承認する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {loading && <p className="text-slate-500">読み込み中...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <article className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => <p className="leading-7 mb-4" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1 list-item" {...props} />,
              a: ({ node, ...props }) => (
                <a className="underline text-blue-600 hover:text-blue-700" {...props} />
              ),
              code: ({ className, children, ...props }) => (
                <code
                  className={
                    'rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em] ' + (className || '')
                  }
                  {...props}
                >
                  {children}
                </code>
              ),
              pre: ({ node, ...props }) => (
                <pre className="bg-slate-100 rounded p-3 overflow-x-auto text-sm mb-4" {...props} />
              ),
              table: ({ node, ...props }) => (
                <table className="border-collapse w-full my-4" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border px-3 py-2 text-left bg-slate-50" {...props} />
              ),
              td: ({ node, ...props }) => <td className="border px-3 py-2 align-top" {...props} />,
            }}
          >
            {content || ''}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
