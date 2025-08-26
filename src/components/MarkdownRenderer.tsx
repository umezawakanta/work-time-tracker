import React, { Suspense, lazy } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

// ⚡ Dynamic Import for SyntaxHighlighter (Heavy component)
const SyntaxHighlighter = lazy(async () => {
  const module = await import('react-syntax-highlighter');
  return { default: (module as any).Light as React.ComponentType<any> };
});

interface MarkdownRendererProps {
  content: string;
}

// ⚡ Lightweight Code Block Component
const CodeBlock: React.FC<any> = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match;

  if (isInline) {
    return (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="my-4">
      <Suspense
        fallback={
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <SyntaxHighlighter
          language={match[1]}
          PreTag="div"
          customStyle={{
            background: '#2d3748',
            color: '#e2e8f0',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
};

// ⚡ Custom Components for Markdown Elements
const markdownComponents: any = {
  // Headers
  h1: ({ children }: any) => (
    <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-gray-200">{children}</h1>
  ),
  h2: ({ children }: any) => <h2 className="text-2xl font-semibold mb-4 mt-8">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-semibold mb-3 mt-6">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-lg font-semibold mb-2 mt-4">{children}</h4>,
  h5: ({ children }: any) => <h5 className="text-base font-semibold mb-2 mt-3">{children}</h5>,
  h6: ({ children }: any) => <h6 className="text-sm font-semibold mb-2 mt-2">{children}</h6>,

  // Paragraphs and text
  p: ({ children }: any) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,

  // Lists
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-gray-700">{children}</li>,

  // Links
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // Code
  code: CodeBlock,

  // Emphasis
  strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,

  // Blockquotes
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">
      {children}
    </blockquote>
  ),

  // Horizontal Rule
  hr: () => <Separator className="my-8" />,

  // Tables
  table: ({ children }: any) => (
    <div className="overflow-auto my-6">
      <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }: any) => <td className="px-4 py-3 text-sm text-gray-700">{children}</td>,

  // Images
  img: ({ src, alt }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg shadow-md my-4"
      loading="lazy"
    />
  ),
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
