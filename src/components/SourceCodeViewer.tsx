import React, { useState, useEffect } from 'react';
import './SourceCodeViewer.css';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  content?: string;
}

interface SourceCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({ isOpen, onClose }) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [fileStats, setFileStats] = useState<{[key: string]: {lines: number, characters: number}}>({});
  const [fileError, setFileError] = useState<string | null>(null);

  // ファイルの統計情報を計算する関数
  const calculateFileStats = (content: string) => {
    const lines = content.split('\n').length;
    const characters = content.length;
    return { lines, characters };
  };

  // ファイルツリーの構造を定義
  const projectStructure: FileNode[] = [
    {
      name: 'src',
      type: 'directory',
      path: 'src',
      children: [
        {
          name: 'components',
          type: 'directory',
          path: 'src/components',
          children: [
            { name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
            { name: 'AdminPanelComponent.tsx', type: 'file', path: 'src/components/AdminPanelComponent.tsx' },
            { name: 'HeaderComponent.tsx', type: 'file', path: 'src/components/HeaderComponent.tsx' },
            { name: 'MemosComponent.tsx', type: 'file', path: 'src/components/MemosComponent.tsx' },
            { name: 'PublicMemosComponent.tsx', type: 'file', path: 'src/components/PublicMemosComponent.tsx' },
            { name: 'WorkRecordsComponent.tsx', type: 'file', path: 'src/components/WorkRecordsComponent.tsx' },
            { name: 'ReportsComponent.tsx', type: 'file', path: 'src/components/ReportsComponent.tsx' },
            { name: 'LoginComponent.tsx', type: 'file', path: 'src/components/LoginComponent.tsx' },
            { name: 'ShareButtonComponent.tsx', type: 'file', path: 'src/components/ShareButtonComponent.tsx' },
            { name: 'ErrorReportingModal.tsx', type: 'file', path: 'src/components/ErrorReportingModal.tsx' },
            { name: 'UserGreetingComponent.tsx', type: 'file', path: 'src/components/UserGreetingComponent.tsx' },
            { name: 'VersionInfo.tsx', type: 'file', path: 'src/components/VersionInfo.tsx' },
            { name: 'UserInfoComponent.tsx', type: 'file', path: 'src/components/UserInfoComponent.tsx' },
            { name: 'SelfEncyclopediaComponent.tsx', type: 'file', path: 'src/components/SelfEncyclopediaComponent.tsx' },
            { name: 'PrivacyPolicyComponent.tsx', type: 'file', path: 'src/components/PrivacyPolicyComponent.tsx' },
            { name: 'TermsOfServiceComponent.tsx', type: 'file', path: 'src/components/TermsOfServiceComponent.tsx' },
          ]
        },
        {
          name: 'server',
          type: 'directory',
          path: 'src/server',
          children: [
            { name: 'database.ts', type: 'file', path: 'src/server/database.ts' },
            { name: 'models.ts', type: 'file', path: 'src/server/models.ts' },
            { name: 'auth.ts', type: 'file', path: 'src/server/auth.ts' },
            { name: 'validation.ts', type: 'file', path: 'src/server/validation.ts' },
            { name: 'types.ts', type: 'file', path: 'src/server/types.ts' },
            { name: 'utils.ts', type: 'file', path: 'src/server/utils.ts' },
          ]
        },
        {
          name: 'types',
          type: 'directory',
          path: 'src/types',
          children: [
            { name: 'index.ts', type: 'file', path: 'src/types/index.ts' },
          ]
        },
        {
          name: 'utils',
          type: 'directory',
          path: 'src/utils',
          children: [
            { name: 'dateUtils.ts', type: 'file', path: 'src/utils/dateUtils.ts' },
            { name: 'formatUtils.ts', type: 'file', path: 'src/utils/formatUtils.ts' },
          ]
        },
        {
          name: 'constants',
          type: 'directory',
          path: 'src/constants',
          children: [
            { name: 'cookingRecipes.ts', type: 'file', path: 'src/constants/cookingRecipes.ts' },
            { name: 'fonts.ts', type: 'file', path: 'src/constants/fonts.ts' },
            { name: 'themes.ts', type: 'file', path: 'src/constants/themes.ts' },
          ]
        },
        { name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
        { name: 'App.css', type: 'file', path: 'src/App.css' },
        { name: 'main.tsx', type: 'file', path: 'src/main.tsx' },
        { name: 'types.ts', type: 'file', path: 'src/types.ts' },
      ]
    },
    {
      name: 'api',
      type: 'directory',
      path: 'api',
      children: [
        {
          name: 'auth',
          type: 'directory',
          path: 'api/auth',
          children: [
            { name: 'login.ts', type: 'file', path: 'api/auth/login.ts' },
            { name: 'register.ts', type: 'file', path: 'api/auth/register.ts' },
            { name: 'verify.ts', type: 'file', path: 'api/auth/verify.ts' },
          ]
        },
        {
          name: 'memos',
          type: 'directory',
          path: 'api/memos',
          children: [
            { name: 'index.ts', type: 'file', path: 'api/memos/index.ts' },
            { name: 'public.ts', type: 'file', path: 'api/memos/public.ts' },
            { name: '[id].ts', type: 'file', path: 'api/memos/[id].ts' },
            { name: 'reply.ts', type: 'file', path: 'api/memos/reply.ts' },
          ]
        },
        {
          name: 'work-records',
          type: 'directory',
          path: 'api/work-records',
          children: [
            { name: 'salary.ts', type: 'file', path: 'api/work-records/salary.ts' },
            { name: 'diary.ts', type: 'file', path: 'api/work-records/diary.ts' },
          ]
        },
        {
          name: 'admin',
          type: 'directory',
          path: 'api/admin',
          children: [
            { name: 'users.ts', type: 'file', path: 'api/admin/users.ts' },
            { name: 'user-edit.ts', type: 'file', path: 'api/admin/user-edit.ts' },
            { name: 'user-delete.ts', type: 'file', path: 'api/admin/user-delete.ts' },
          ]
        },
        {
          name: 'utils',
          type: 'directory',
          path: 'api/utils',
          children: [
            { name: 'database.ts', type: 'file', path: 'api/utils/database.ts' },
            { name: 'errorHandler.js', type: 'file', path: 'api/utils/errorHandler.js' },
            { name: 'schemas.ts', type: 'file', path: 'api/utils/schemas.ts' },
            { name: 'types.js', type: 'file', path: 'api/utils/types.js' },
            { name: 'validation.ts', type: 'file', path: 'api/utils/validation.ts' },
          ]
        },
        { name: 'user-settings.ts', type: 'file', path: 'api/user-settings.ts' },
        { name: 'version/check.ts', type: 'file', path: 'api/version/check.ts' },
      ]
    },
    { name: 'package.json', type: 'file', path: 'package.json' },
    { name: 'tsconfig.json', type: 'file', path: 'tsconfig.json' },
    { name: 'vite.config.ts', type: 'file', path: 'vite.config.ts' },
    { name: 'vercel.json', type: 'file', path: 'vercel.json' },
    { name: 'index.html', type: 'file', path: 'index.html' },
  ];

  useEffect(() => {
    if (isOpen) {
      setFileTree(projectStructure);
    }
  }, [isOpen]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setLoading(true);
      setFileError(null);
      
      try {
        // ソースコードAPIから実際のファイル内容を取得
        const response = await fetch(`/api/source-code/${encodeURIComponent(file.path)}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFileContent(data.content);
            // 統計情報を計算して保存
            const stats = calculateFileStats(data.content);
            setFileStats(prev => ({ ...prev, [file.path]: stats }));
          } else {
            throw new Error(data.error || 'Failed to load file');
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('ファイルの取得に失敗しました:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setFileError(errorMessage);
        
        // エラー時はサンプルコンテンツを表示
        const sampleContent = generateSampleContent(file);
        setFileContent(sampleContent);
        // 統計情報を計算して保存
        const stats = calculateFileStats(sampleContent);
        setFileStats(prev => ({ ...prev, [file.path]: stats }));
      } finally {
        setLoading(false);
      }
    }
  };

  // サンプルコンテンツを生成する関数
  const generateSampleContent = (file: FileNode): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'tsx':
      case 'ts':
        return `// ${file.name}
import React from 'react';

interface ${file.name.replace('.tsx', '').replace('.ts', '')}Props {
  // プロパティの型定義
}

const ${file.name.replace('.tsx', '').replace('.ts', '')}: React.FC<${file.name.replace('.tsx', '').replace('.ts', '')}Props> = (props) => {
  return (
    <div>
      {/* コンポーネントの内容 */}
    </div>
  );
};

export default ${file.name.replace('.tsx', '').replace('.ts', '')};`;
      
      case 'css':
        return `/* ${file.name} */
.${file.name.replace('.css', '').toLowerCase()} {
  /* スタイルの定義 */
}`;
      
      case 'json':
        return `{
  "name": "${file.name.replace('.json', '')}",
  "version": "1.0.0",
  "description": "設定ファイル"
}`;
      
      case 'html':
        return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace('.html', '')}</title>
</head>
<body>
  <!-- HTMLの内容 -->
</body>
</html>`;
      
      default:
        return `// ${file.name}
// ファイルの内容を表示するには、実際のファイルにアクセスする必要があります。
// このファイルは ${file.path} に配置されています。`;
    }
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.path) ? 'bi-folder2-open' : 'bi-folder2';
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
        return 'bi-filetype-tsx';
      case 'js':
      case 'jsx':
        return 'bi-filetype-jsx';
      case 'css':
        return 'bi-filetype-css';
      case 'json':
        return 'bi-filetype-json';
      case 'html':
        return 'bi-filetype-html';
      case 'md':
        return 'bi-filetype-md';
      default:
        return 'bi-file-earmark';
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes
      .filter(node => 
        searchTerm === '' || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.path.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((node, index) => (
        <div key={index} className="file-tree-item">
          <div
            className={`file-tree-node ${node.type} ${selectedFile?.path === node.path ? 'selected' : ''}`}
            style={{ paddingLeft: `${level * 20 + 10}px` }}
            onClick={() => {
              if (node.type === 'directory') {
                toggleFolder(node.path);
              } else {
                handleFileSelect(node);
              }
            }}
          >
            <i className={`bi ${getFileIcon(node)}`}></i>
            <span className="file-name">{node.name}</span>
            {node.type === 'file' && fileStats[node.path] && (
              <span className="file-stats">
                {fileStats[node.path].lines}行
              </span>
            )}
          </div>
          {node.type === 'directory' && 
           expandedFolders.has(node.path) && 
           node.children && 
           renderFileTree(node.children, level + 1)}
        </div>
      ));
  };

  const getLanguageFromExtension = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="source-code-viewer-overlay">
      <div className="source-code-viewer">
        <div className="source-code-header">
          <h2>
            <i className="bi bi-code-slash"></i>
            ソースコード一覧
          </h2>
          <button className="close-button" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="source-code-content">
          <div className="file-tree-panel">
            <div className="file-tree-search">
              <input
                type="text"
                placeholder="ファイルを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="file-tree">
              {renderFileTree(fileTree)}
            </div>
          </div>

          <div className="file-content-panel">
            {selectedFile ? (
              <div className="file-content">
                <div className="file-content-header">
                  <div className="file-header-info">
                    <h3>
                      <i className={`bi ${getFileIcon(selectedFile)}`}></i>
                      {selectedFile.name}
                    </h3>
                    <span className="file-path">{selectedFile.path}</span>
                  </div>
                  {fileStats[selectedFile.path] && (
                    <div className="file-stats-info">
                      <span className="stat-item">
                        <i className="bi bi-list-ol"></i>
                        {fileStats[selectedFile.path].lines}行
                      </span>
                      <span className="stat-item">
                        <i className="bi bi-type"></i>
                        {fileStats[selectedFile.path].characters.toLocaleString()}文字
                      </span>
                    </div>
                  )}
                </div>
                <div className="file-content-body">
                  {loading ? (
                    <div className="loading">
                      <i className="bi bi-hourglass-split"></i>
                      読み込み中...
                    </div>
                  ) : fileError ? (
                    <div className="file-error">
                      <div className="error-header">
                        <i className="bi bi-exclamation-triangle"></i>
                        <h4>ファイルの読み込みに失敗しました</h4>
                      </div>
                      <div className="error-message">
                        <p><strong>エラー:</strong> {fileError}</p>
                        <p><strong>ファイル:</strong> {selectedFile.path}</p>
                        <p><strong>時間:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      </div>
                      <div className="error-actions">
                        <button 
                          className="retry-button"
                          onClick={() => handleFileSelect(selectedFile)}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                          再試行
                        </button>
                      </div>
                      <div className="sample-content-notice">
                        <p><i className="bi bi-info-circle"></i> 以下はサンプルコンテンツです</p>
                      </div>
                      <pre className="code-content">
                        <code className={`language-${getLanguageFromExtension(selectedFile.name)}`}>
                          {fileContent}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <pre className="code-content">
                      <code className={`language-${getLanguageFromExtension(selectedFile.name)}`}>
                        {fileContent}
                      </code>
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-file-selected">
                <i className="bi bi-file-earmark"></i>
                <p>ファイルを選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceCodeViewer;
