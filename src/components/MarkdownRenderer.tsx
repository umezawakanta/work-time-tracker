import React, { Suspense, lazy } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  CircularProgress,
} from '@mui/material';

// ⚡ Dynamic Import for SyntaxHighlighter (Heavy component)
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((module) => ({
    default: module.Light as React.ComponentType<any>,
  }))
);

interface MarkdownRendererProps {
  content: string;
}

// ⚡ Lightweight Code Block Component
const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match;

  if (isInline) {
    return (
      <Box
        component="code"
        sx={{
          backgroundColor: 'grey.100',
          padding: '2px 6px',
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.9em',
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ my: 2 }}>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
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
    </Box>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        // 見出し
        h1: ({ children }) => (
          <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 3, mb: 2 }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {children}
          </Typography>
        ),
        h4: ({ children }) => (
          <Typography variant="h6" component="h4" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {children}
          </Typography>
        ),

        // 段落
        p: ({ children }) => (
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            {children}
          </Typography>
        ),

        // ⚡ Optimized Code Block
        code: CodeBlock as any,

        // リスト
        ul: ({ children }) => (
          <Box component="ul" sx={{ pl: 3, my: 1 }}>
            {children}
          </Box>
        ),
        ol: ({ children }) => (
          <Box component="ol" sx={{ pl: 3, my: 1 }}>
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
            {children}
          </Typography>
        ),

        // 引用
        blockquote: ({ children }) => (
          <Box
            sx={{
              borderLeft: 4,
              borderColor: 'primary.main',
              pl: 2,
              my: 2,
              backgroundColor: 'grey.50',
              py: 1,
            }}
          >
            {children}
          </Box>
        ),

        // 水平線
        hr: () => <Divider sx={{ my: 3 }} />,

        // リンク
        a: ({ href, children }) => (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ),

        // テーブル
        table: ({ children }) => (
          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table size="small">{children}</Table>
          </TableContainer>
        ),
        thead: ({ children }) => <TableHead>{children}</TableHead>,
        tbody: ({ children }) => <TableBody>{children}</TableBody>,
        tr: ({ children }) => <TableRow>{children}</TableRow>,
        th: ({ children }) => (
          <TableCell component="th" sx={{ fontWeight: 'bold' }}>
            {children}
          </TableCell>
        ),
        td: ({ children }) => <TableCell>{children}</TableCell>,

        // 強調
        strong: ({ children }) => (
          <Typography component="strong" sx={{ fontWeight: 'bold' }}>
            {children}
          </Typography>
        ),
        em: ({ children }) => (
          <Typography component="em" sx={{ fontStyle: 'italic' }}>
            {children}
          </Typography>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
