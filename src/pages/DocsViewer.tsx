import React from 'react';
import { useParams } from 'react-router-dom';

export default function DocsViewer(): React.JSX.Element {
  const params = useParams();
  const path = `/docs/${[params['*']].filter(Boolean).join('')}`;
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">ドキュメント</h1>
      <p className="text-sm text-slate-600 mb-4">{path}</p>
      <p className="text-slate-500">このパスのドキュメントを準備中です。</p>
    </div>
  );
}
