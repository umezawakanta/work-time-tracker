import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  FileCode,
  Activity,
  GitBranch,
  Target,
  TrendingUp,
  BarChart3,
  Download,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface CoverageData {
  total: {
    statements: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
    lines: { total: number; covered: number; pct: number };
  };
  files: Record<
    string,
    {
      statements: { total: number; covered: number; pct: number };
      functions: { total: number; covered: number; pct: number };
      branches: { total: number; covered: number; pct: number };
      lines: { total: number; covered: number; pct: number };
      uncoveredLineNumbers: number[];
    }
  >;
}

const CoverageReportPage = () => {
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // カバレッジデータを読み込み
      const response = await fetch('/coverage/coverage-final.json');
      if (!response.ok) {
        throw new Error('カバレッジデータが見つかりません。テストを実行してください。');
      }

      const data = await response.json();
      setCoverageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カバレッジデータの読み込みに失敗しました');
      // フォールバックのモックデータ
      setCoverageData(generateMockCoverageData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoverageData();
  }, []);

  const generateMockCoverageData = (): CoverageData => ({
    total: {
      statements: { total: 3256, covered: 280, pct: 8.6 },
      functions: { total: 625, covered: 45, pct: 7.2 },
      branches: { total: 892, covered: 27, pct: 3.0 },
      lines: { total: 3134, covered: 276, pct: 8.8 },
    },
    files: {
      'src/components/development/DevelopmentBadgeDashboard.tsx': {
        statements: { total: 131, covered: 77, pct: 58.92 },
        functions: { total: 31, covered: 17, pct: 54.83 },
        branches: { total: 43, covered: 22, pct: 51.16 },
        lines: { total: 128, covered: 75, pct: 58.55 },
        uncoveredLineNumbers: [137, 139, 146, 164, 183, 244, 351, 440],
      },
      'src/components/ui/badge.tsx': {
        statements: { total: 8, covered: 8, pct: 100 },
        functions: { total: 1, covered: 1, pct: 100 },
        branches: { total: 4, covered: 4, pct: 100 },
        lines: { total: 8, covered: 8, pct: 100 },
        uncoveredLineNumbers: [],
      },
      'src/components/ui/button.tsx': {
        statements: { total: 12, covered: 12, pct: 100 },
        functions: { total: 1, covered: 1, pct: 100 },
        branches: { total: 6, covered: 6, pct: 100 },
        lines: { total: 12, covered: 12, pct: 100 },
        uncoveredLineNumbers: [],
      },
      'src/lib/utils.ts': {
        statements: { total: 5, covered: 5, pct: 100 },
        functions: { total: 1, covered: 1, pct: 100 },
        branches: { total: 2, covered: 2, pct: 100 },
        lines: { total: 5, covered: 5, pct: 100 },
        uncoveredLineNumbers: [],
      },
    },
  });

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const sortedFiles = coverageData
    ? Object.entries(coverageData.files).sort((a, b) => b[1].statements.pct - a[1].statements.pct)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>カバレッジデータを読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-2">{error}</div>
                <Button onClick={loadCoverageData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再試行
                </Button>
                <div className="mt-4 text-sm text-gray-500">
                  テストを実行するには:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">pnpm test --coverage</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!coverageData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">テストカバレッジレポート</h1>
            <p className="text-gray-600 mt-1">コードカバレッジの詳細な分析結果</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadCoverageData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
            <Button
              onClick={() => window.open('/coverage/lcov-report/index.html', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              詳細レポート
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/coverage/lcov.info';
                link.download = 'lcov.info';
                link.click();
              }}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              LCOV出力
            </Button>
          </div>
        </div>

        {/* 総合カバレッジサマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ステートメント</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getCoverageColor(coverageData.total.statements.pct)}>
                  {coverageData.total.statements.pct.toFixed(1)}%
                </span>
              </div>
              <Progress value={coverageData.total.statements.pct} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {coverageData.total.statements.covered} / {coverageData.total.statements.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ブランチ</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getCoverageColor(coverageData.total.branches.pct)}>
                  {coverageData.total.branches.pct.toFixed(1)}%
                </span>
              </div>
              <Progress value={coverageData.total.branches.pct} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {coverageData.total.branches.covered} / {coverageData.total.branches.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">関数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getCoverageColor(coverageData.total.functions.pct)}>
                  {coverageData.total.functions.pct.toFixed(1)}%
                </span>
              </div>
              <Progress value={coverageData.total.functions.pct} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {coverageData.total.functions.covered} / {coverageData.total.functions.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ライン</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getCoverageColor(coverageData.total.lines.pct)}>
                  {coverageData.total.lines.pct.toFixed(1)}%
                </span>
              </div>
              <Progress value={coverageData.total.lines.pct} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {coverageData.total.lines.covered} / {coverageData.total.lines.total}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ファイル別カバレッジ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              ファイル別カバレッジ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedFiles.map(([filePath, fileData]) => (
                <div
                  key={filePath}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedFile(selectedFile === filePath ? null : filePath)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{filePath}</div>
                      <div className="flex space-x-4 text-xs text-gray-600">
                        <span>ステートメント: {fileData.statements.pct.toFixed(1)}%</span>
                        <span>ブランチ: {fileData.branches.pct.toFixed(1)}%</span>
                        <span>関数: {fileData.functions.pct.toFixed(1)}%</span>
                        <span>ライン: {fileData.lines.pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getCoverageBadgeVariant(fileData.statements.pct)}>
                        {fileData.statements.pct.toFixed(1)}%
                      </Badge>
                      <Progress value={fileData.statements.pct} className="w-20" />
                    </div>
                  </div>

                  {selectedFile === filePath && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">ステートメント</div>
                          <div>
                            {fileData.statements.covered} / {fileData.statements.total}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">ブランチ</div>
                          <div>
                            {fileData.branches.covered} / {fileData.branches.total}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">関数</div>
                          <div>
                            {fileData.functions.covered} / {fileData.functions.total}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">ライン</div>
                          <div>
                            {fileData.lines.covered} / {fileData.lines.total}
                          </div>
                        </div>
                      </div>

                      {fileData.uncoveredLineNumbers &&
                        fileData.uncoveredLineNumbers.length > 0 && (
                          <div className="mt-4">
                            <div className="font-medium text-sm mb-2">カバーされていない行:</div>
                            <div className="text-xs text-red-600">
                              {fileData.uncoveredLineNumbers.join(', ')}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カバレッジ改善提案 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              カバレッジ改善提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <strong>🎯 優先度高:</strong>
                {sortedFiles.filter(([, data]) => data.statements.pct < 50).length > 0 ? (
                  <>カバレッジが50%未満のファイルからテストを追加することをお勧めします。</>
                ) : (
                  <>現在のカバレッジは良好です。引き続き新機能のテストを追加してください。</>
                )}
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <strong>✅ 良好なファイル:</strong>
                {sortedFiles.filter(([, data]) => data.statements.pct >= 80).length}{' '}
                ファイルが80%以上のカバレッジを達成
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <strong>⚠️ 注意が必要:</strong>
                ブランチカバレッジ ({coverageData.total.branches.pct.toFixed(1)}%)
                の向上に重点を置くことをお勧めします
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverageReportPage;
