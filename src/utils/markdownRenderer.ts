// マークダウン表示用の関数（DocsViewerから移植）

export const renderMarkdown = (content: string): string => {
  // まずMermaid図を抽出して保護
  const mermaidBlocks: string[] = [];
  let processedContent = content.replace(/```mermaid\s*\n([\s\S]*?)\n```/g, (_, diagram) => {
    const index = mermaidBlocks.length;
    const trimmedDiagram = diagram.trim();
    mermaidBlocks.push(trimmedDiagram);
    return `__MERMAID_BLOCK_${index}__`;
  });

  // その他のMarkdown処理
  processedContent = processedContent
    // ヘッダー
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // コードブロック（Mermaid以外）
    .replace(/```typescript\s*\n([\s\S]*?)\n```/g, '<pre><code class="language-typescript">$1</code></pre>')
    .replace(/```javascript\s*\n([\s\S]*?)\n```/g, '<pre><code class="language-javascript">$1</code></pre>')
    .replace(/```(?!mermaid)([a-zA-Z]*)\s*\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/```(?!mermaid)\s*\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
    // インラインコード
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 太字
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // リスト
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
    // リンク
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // 改行
    .replace(/\n/g, '<br>');

  // Mermaid図を復元（HTMLエンティティの変換を防ぐ）
  mermaidBlocks.forEach((diagram, index) => {
    processedContent = processedContent.replace(
      `__MERMAID_BLOCK_${index}__`,
      `<div class="mermaid">${diagram}</div>`
    );
  });

  return processedContent;
};