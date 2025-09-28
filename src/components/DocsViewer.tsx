import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './DocsViewer.css';

interface DocsViewerProps {
  showDocs: boolean;
  setShowDocs: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

interface DocFile {
  id: string;
  title: string;
  path: string;
  description: string;
  category: string;
}

const DocsViewer: React.FC<DocsViewerProps> = ({
  showDocs,
  setShowDocs,
  closeOtherFeatures,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  // Mermaidの初期化
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      logLevel: 'debug',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
      state: {},
    });
  }, []);

  // 利用可能な設計書ファイルの一覧
  const docFiles: DocFile[] = [
    {
      id: 'sound-app-user-manual',
      title: '音アプリ ユーザーマニュアル',
      path: '/docs/sound-app-user-manual.md',
      description: '音アプリの使い方、機能説明、トラブルシューティング',
      category: 'ユーザーガイド'
    },
    {
      id: 'sound-app-design',
      title: '音アプリ設計書',
      path: '/docs/sound-app-design.md',
      description: '音アプリのアーキテクチャ、実装詳細、改善計画',
      category: 'アプリ設計'
    },
    {
      id: 'sound-app-test-specification',
      title: '音アプリ 総合試験仕様書',
      path: '/docs/sound-app-test-specification.md',
      description: '音アプリの全機能のテスト仕様、テストケース、品質保証',
      category: '品質保証'
    },
    {
      id: 'font-settings-design',
      title: 'フォント設定機能 設計書',
      path: '/docs/font-settings-design.md',
      description: 'フォント設定機能のシステム設計、要件定義、実装計画',
      category: 'アプリ設計'
    },
    {
      id: 'font-settings-user-manual',
      title: 'フォント設定機能 ユーザーマニュアル',
      path: '/docs/font-settings-user-manual.md',
      description: 'フォント設定の使い方、おすすめフォント、トラブルシューティング',
      category: 'ユーザーガイド'
    },
    {
      id: 'font-settings-test-specification',
      title: 'フォント設定機能 総合試験仕様書',
      path: '/docs/font-settings-test-specification.md',
      description: 'フォント設定機能の全機能テスト仕様、テストケース、品質保証',
      category: '品質保証'
    },
    {
      id: 'character-feature-design',
      title: 'キャラクター機能 設計書',
      path: '/docs/character-feature-design.md',
      description: 'キャラクター機能のシステム設計、要件定義、実装計画',
      category: 'アプリ設計'
    },
    {
      id: 'character-feature-user-manual',
      title: 'キャラクター機能 ユーザーマニュアル',
      path: '/docs/character-feature-user-manual.md',
      description: 'キャラクター機能の使い方、おすすめキャラクター、トラブルシューティング',
      category: 'ユーザーガイド'
    },
    {
      id: 'character-feature-test-specification',
      title: 'キャラクター機能 総合試験仕様書',
      path: '/docs/character-feature-test-specification.md',
      description: 'キャラクター機能の全機能テスト仕様、テストケース、品質保証',
      category: '品質保証'
    }
  ];

  // Markdownファイルを読み込む
  const loadDocContent = async (docPath: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(docPath);
      
      if (!response.ok) {
        throw new Error(`ファイルが見つかりません: ${response.status}`);
      }
      
      const content = await response.text();
      setDocContent(content);
    } catch (err) {
      console.error(`❌ ファイル読み込みエラー:`, err);
      setError(err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました');
      setDocContent('');
    } finally {
      setLoading(false);
    }
  };

  // ドキュメント選択時の処理
  const handleDocSelect = (docId: string) => {
    const doc = docFiles.find(d => d.id === docId);
    if (doc) {
      setSelectedDoc(docId);
      loadDocContent(doc.path);
    }
  };

  // Mermaid図をレンダリング
  const renderMermaidDiagrams = async () => {
    if (!mermaidContainerRef.current) {
      return;
    }
    
    // 直接HTMLコンテンツからMermaid図を検索
    const containerHTML = mermaidContainerRef.current.innerHTML;
    const mermaidRegex = /<div class="mermaid">([\s\S]*?)<\/div>/g;
    const mermaidMatches = Array.from(containerHTML.matchAll(mermaidRegex));
    
    if (mermaidMatches.length === 0) {
      return;
    }
    
    // 各Mermaid図を処理
    const renderPromises = mermaidMatches.map(async (match, i) => {
      const fullMatch = match[0];
      let content = match[1].trim();
      const id = `mermaid-${Date.now()}-${i}`;
      
      // HTMLエンティティをデコード
      content = content
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, ' ');
      
      console.log(`📝 図 ${i} の内容:`, content.substring(0, 100) + '...');
      
      if (!content) {
        console.log(`❌ 図 ${i} の内容が空です`);
        return;
      }
      
      try {
        console.log(`🎨 図 ${i} をレンダリング中...`);
        
        // Mermaidのバージョンに応じたレンダリング
        const { svg } = await mermaid.render(id, content);
        console.log(`📊 生成されたSVGの長さ: ${svg.length} 文字`);
        
        // 元のdivを置き換え
        const newDiv = document.createElement('div');
        newDiv.className = 'mermaid mermaid-rendered';
        newDiv.innerHTML = svg;
        
        // 元のdivを直接検索して置き換え
        const originalDivs = mermaidContainerRef.current?.querySelectorAll('.mermaid');
        if (originalDivs && originalDivs[i]) {
          const originalDiv = originalDivs[i] as HTMLElement;
          originalDiv.parentNode?.replaceChild(newDiv, originalDiv);
          console.log(`✅ 図 ${i} のレンダリング完了`);
        } else if (mermaidContainerRef.current) {
          // フォールバック: 直接HTMLを置き換え
          mermaidContainerRef.current.innerHTML = mermaidContainerRef.current.innerHTML.replace(
            fullMatch,
            newDiv.outerHTML
          );
          console.log(`✅ 図 ${i} のレンダリング完了（フォールバック）`);
        }
        
      } catch (error) {
        console.error(`❌ 図 ${i} のレンダリングエラー:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // エラー表示用のdivを作成
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mermaid mermaid-error';
        errorDiv.innerHTML = `
          <div class="mermaid-error">
            <h4>図の表示に失敗しました</h4>
            <p>エラー: ${errorMessage}</p>
            <details>
              <summary>図の内容を表示</summary>
              <pre>${content}</pre>
            </details>
          </div>
        `;
        
        // 元のdivを置き換え
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullMatch;
        const originalDiv = tempDiv.firstChild as HTMLElement;
        
        if (originalDiv) {
          originalDiv.replaceWith(errorDiv);
        }
      }
    });
    
    // すべてのレンダリングが完了するまで待機
    await Promise.all(renderPromises);
    
  };

  // MarkdownをHTMLに変換（Mermaid対応版）
  const renderMarkdown = (content: string) => {
    // まずMermaid図を抽出して保護
    const mermaidBlocks: string[] = [];
    let processedContent = content.replace(/```mermaid\s*\n([\s\S]*?)\n```/g, (match, diagram) => {
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
      // リスト
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
      // 改行
      .replace(/\n/g, '<br>');

    // Mermaid図を復元（HTMLエンティティの変換を防ぐ）
    mermaidBlocks.forEach((diagram, index) => {
      // HTMLエンティティをエスケープして保護
      const protectedDiagram = diagram
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      processedContent = processedContent.replace(
        `__MERMAID_BLOCK_${index}__`,
        `<div class="mermaid">${protectedDiagram}</div>`
      );
    });

    return processedContent;
  };

  // ドキュメントコンテンツが変更されたときにMermaid図をレンダリング
  useEffect(() => {
    if (docContent) {
      // DOMが更新された後にMermaid図をレンダリング
      const timeoutId = setTimeout(() => {
        renderMermaidDiagrams();
      }, 500);
      
      // クリーンアップ関数
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [docContent]);

  // カテゴリ別にドキュメントをグループ化
  const docsByCategory = docFiles.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocFile[]>);

  return (
    <div className="docs-viewer-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📚</span>
          設計書・ドキュメント
        </h2>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className={showDocs ? "close-section-button" : "show-section-button"}
        >
          {showDocs ? "✕" : "▶"}
        </button>
      </div>

      {showDocs && (
        <div className="docs-content">
          <div className="docs-sidebar">
            <h3>ドキュメント一覧</h3>
            {Object.entries(docsByCategory).map(([category, docs]) => (
              <div key={category} className="docs-category">
                <h4>{category}</h4>
                <ul className="docs-list">
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <button
                        className={`doc-item ${selectedDoc === doc.id ? 'active' : ''}`}
                        onClick={() => handleDocSelect(doc.id)}
                      >
                        <div className="doc-title">{doc.title}</div>
                        <div className="doc-description">{doc.description}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="docs-main">
            {selectedDoc ? (
              <div className="doc-viewer">
                <div className="doc-header">
                  <h1>{docFiles.find(d => d.id === selectedDoc)?.title}</h1>
                  <button
                    className="back-button"
                    onClick={() => setSelectedDoc(null)}
                  >
                    ← 一覧に戻る
                  </button>
                </div>
                
                <div className="doc-content">
                  {loading && <div className="loading">読み込み中...</div>}
                  {error && <div className="error">エラー: {error}</div>}
                  {docContent && !loading && !error && (
                    <div 
                      ref={mermaidContainerRef}
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(docContent) }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="docs-welcome">
                <h2>設計書・ドキュメント</h2>
                <p>左側のリストから参照したいドキュメントを選択してください。</p>
                <div className="docs-features">
                  <h3>利用可能な機能</h3>
                  <ul>
                    <li>📖 Markdown形式のドキュメント表示</li>
                    <li>🎨 シンタックスハイライト</li>
                    <li>📊 Mermaid図表の表示</li>
                    <li>🔍 ドキュメント検索（今後実装予定）</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsViewer;
