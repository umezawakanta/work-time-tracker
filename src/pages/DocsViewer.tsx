import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function DocsViewer(): React.JSX.Element {
  const params = useParams();
  const path = `/docs/${[params['*']].filter(Boolean).join('')}`;
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      <h1 className="text-2xl font-bold mb-4">ドキュメント</h1>
      <p className="text-sm text-slate-600 mb-4">{path}.md</p>
      {loading && <p className="text-slate-500">読み込み中...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <article className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {content || ''}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
