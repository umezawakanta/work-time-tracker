import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { featureArtifactsRegistry, ArtifactId } from '@/config/featureArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Search, FileText, Calendar, Folder, Clock } from 'lucide-react';

interface DocumentInfo {
  id: string;
  title: string;
  path: string;
  category: string;
  lastModified: string;
  size: number;
  description?: string;
}

interface DocumentCategories {
  [key: string]: {
    name: string;
    description: string;
  };
}

export default function DocsViewer(): React.JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const path = `/docs/${[params['*']].filter(Boolean).join('')}`;
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [categories, setCategories] = useState<DocumentCategories>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListView, setIsListView] = useState<boolean>(true);
  const { user } = useAuth();

  // 成果物承認（このドキュメントがどの成果物かを逆引き）
  const docMeta = useMemo(() => {
    // path は /docs/features/:featureId/:doc
    const segments = path.split('/').filter(Boolean);
    const featureId = segments[2] || '';
    let artifactId: ArtifactId | null = null;
    const reg = featureArtifactsRegistry[featureId as keyof typeof featureArtifactsRegistry];
    if (reg) {
      for (const [aId, link] of Object.entries(reg)) {
        if (link.href === path) {
          artifactId = aId as ArtifactId;
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

  // 成果物タイプ別チェックリスト
  const checklist = useMemo<string[]>(() => {
    switch (docMeta.artifactId) {
      case 'requirements':
        return [
          '目的とスコープが具体的で検証可能',
          '機能要件が網羅され曖昧さがない',
          '非機能要件（性能/可用性/セキュリティ/アクセシビリティ）が定義済み',
          'API入出力・データフロー・依存関係が明記されている',
          '完了条件と受け入れ基準が明確',
          'リスクと対応が列挙されている',
        ];
      case 'basic_design':
        return [
          '画面/コンポーネント構成と責務が適切に定義されている',
          '入力項目・バリデーション・エラー表示の方針が定義済み',
          'API 呼び出しと例外/再試行の振る舞いが設計済み',
          'ローディング/成功/失敗時の UX が定義済み',
          'アクセス制御・権限・FeatureAccessGuard の考慮がある',
          'アクセシビリティ/セキュリティの基本方針が明記されている',
        ];
      case 'detailed_design':
        return [
          'API I/F（入出力スキーマ・エラーケース）が網羅されている',
          'トークン保存/更新処理のシーケンスが定義されている',
          'ルーティングと遷移条件（post_login_redirect など）が明確',
          '状態管理とテスト観点（単体/結合/総合）が定義済み',
          'セキュリティ詳細（XSS/CSRF/トークン保護）が定義済み',
          'ログ/監査・計測項目が定義されている',
        ];
      default:
        return [
          '内容の完全性と一貫性が確認できる',
          '関連機能/依存関係との整合性が取れている',
          'テスト/運用観点の考慮が含まれている',
        ];
    }
  }, [docMeta.artifactId]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = checklist.every((_, i) => checked[i]);

  const approvalTitle = useMemo(() => {
    const labelMap: Record<ArtifactId, string> = {
      requirements: '要件定義書',
      basic_design: '基本設計書',
      detailed_design: '詳細設計書',
      source_code: 'ソースコード',
      github_actions: 'GitHub Actions',
      unit_test_spec: '単体試験仕様書',
      unit_tests: 'ユニットテストコード',
      e2e_tests: 'e2eテストコード',
      integration_test_spec: '結合試験仕様書',
      system_test_spec: '総合試験仕様書',
      operation_manual: '操作手順書',
      runbook: '運用手順書',
      faq: 'FAQ',
    };
    return docMeta.artifactId ? `${labelMap[docMeta.artifactId]} 承認チェック` : '承認チェック';
  }, [docMeta.artifactId]);

  // ドキュメント一覧を取得
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/docs?action=list', { cache: 'no-store' });
        const data = await response.json();
        if (data.success) {
          setDocuments(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/docs?action=categories', { cache: 'no-store' });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchDocuments();
    fetchCategories();
  }, []);

  // 特定のドキュメントの内容を取得
  useEffect(() => {
    if (!path || path === '/docs/') {
      setIsListView(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setContent(null);
    setIsListView(false);

    const docId = path.replace('/docs/', '').replace('.md', '');

    fetch(`/api/docs?action=content&id=${encodeURIComponent(docId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setContent(data.data.content);
        } else {
          setError(data.message || 'ドキュメントが見つかりませんでした');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError('ドキュメントの読み込みに失敗しました');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [path]);

  // フィルタリングされたドキュメント一覧
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  // ドキュメント一覧表示
  const renderDocumentList = () => (
    <div className="space-y-6">
      {/* 検索とフィルター */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ドキュメントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="カテゴリを選択"
          >
            <option value="all">すべてのカテゴリ</option>
            {Object.entries(categories).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* カテゴリ別タブ */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {Object.entries(categories).map(([key, category]) => (
            <TabsTrigger key={key} value={key}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments
                .filter((doc) => doc.category === key)
                .map((doc) => (
                  <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base line-clamp-2">{doc.title}</CardTitle>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {category.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-3 mb-3">
                        {doc.description || '説明なし'}
                      </CardDescription>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(doc.lastModified).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{Math.round(doc.size / 1024)}KB</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => navigate(`/docs/${doc.id}`)}
                      >
                        開く
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{doc.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {categories[doc.category]?.name || doc.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-3 mb-3">
                    {doc.description || '説明なし'}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(doc.lastModified).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>{Math.round(doc.size / 1024)}KB</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigate(`/docs/${doc.id}`)}
                  >
                    開く
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ドキュメントが見つかりません</h3>
          <p className="text-gray-500">
            {searchQuery
              ? '検索条件を変更してみてください'
              : 'ドキュメントがまだ追加されていません'}
          </p>
        </div>
      )}
    </div>
  );

  // ドキュメント表示
  const renderDocument = () => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">ドキュメント</h1>
          <p className="text-sm text-slate-600">{path.replace('/docs/', '')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/docs')}>
            一覧に戻る
          </Button>
          {user?.isAdmin && docMeta.artifactId && (
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant={approved ? 'secondary' : 'outline'}>
                  {approved ? '承認済' : '承認'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{approvalTitle}</AlertDialogTitle>
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
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">読み込み中...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">エラーが発生しました</p>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/docs')}>一覧に戻る</Button>
        </div>
      )}

      {!loading && !error && content && (
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
            {content}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {isListView ? renderDocumentList() : renderDocument()}
    </div>
  );
}
