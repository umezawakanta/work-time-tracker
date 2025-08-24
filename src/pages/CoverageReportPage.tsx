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
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface CoverageFile {
  file: string;
  statements: { pct: number; covered: number; total: number };
  branches: { pct: number; covered: number; total: number };
  functions: { pct: number; covered: number; total: number };
  lines: { pct: number; covered: number; total: number };
}

interface CoverageSummary {
  total: {
    statements: { pct: number; covered: number; total: number };
    branches: { pct: number; covered: number; total: number };
    functions: { pct: number; covered: number; total: number };
    lines: { pct: number; covered: number; total: number };
  };
}

const CoverageReportPage = () => {
  const [coverageData, setCoverageData] = useState<{
    summary: CoverageSummary;
    files: CoverageFile[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // カバレッジデータを動的に生成（実際のプロジェクトでは外部ファイルから読み込み）
      const mockCoverageData = {
        summary: {
          total: {
            statements: { pct: 85.7, covered: 1250, total: 1458 },
            branches: { pct: 78.3, covered: 420, total: 536 },
            functions: { pct: 92.1, covered: 245, total: 266 },
            lines: { pct: 86.2, covered: 1180, total: 1369 },
          },
        },
        files: [
          {
            file: 'src/utils/idGenerator.ts',
            statements: { pct: 100, covered: 45, total: 45 },
            branches: { pct: 100, covered: 12, total: 12 },
            functions: { pct: 100, covered: 8, total: 8 },
            lines: { pct: 100, covered: 42, total: 42 },
          },
          {
            file: 'src/utils/badgeConfidenceCalculator.ts',
            statements: { pct: 100, covered: 67, total: 67 },
            branches: { pct: 100, covered: 18, total: 18 },
            functions: { pct: 100, covered: 12, total: 12 },
            lines: { pct: 100, covered: 64, total: 64 },
          },
          {
            file: 'src/components/ui/error-boundary.tsx',
            statements: { pct: 90.7, covered: 49, total: 54 },
            branches: { pct: 85.7, covered: 12, total: 14 },
            functions: { pct: 100, covered: 8, total: 8 },
            lines: { pct: 90.6, covered: 48, total: 53 },
          },
          {
            file: 'src/services/api/authApi.ts',
            statements: { pct: 75.2, covered: 89, total: 118 },
            branches: { pct: 68.4, covered: 26, total: 38 },
            functions: { pct: 85.7, covered: 18, total: 21 },
            lines: { pct: 76.8, covered: 86, total: 112 },
          },
        ],
      };

      setCoverageData(mockCoverageData);
    } catch (err) {
      setError('カバレッジデータの読み込みに失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoverageData();
  }, []);

  // 安全なパーセンテージ値の取得
  const safeGetPercentage = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null && typeof value.pct === 'number') {
      return value.pct;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getCoverageColor = (percentage: any): string => {
    const pct = safeGetPercentage(percentage);
    if (pct >= 90) return 'text-green-600';
    if (pct >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeVariant = (percentage: any) => {
    const pct = safeGetPercentage(percentage);
    if (pct >= 90) return 'default'; // 緑
    if (pct >= 75) return 'secondary'; // 黄
    return 'destructive'; // 赤
  };

  const getCoverageIcon = (percentage: any) => {
    const pct = safeGetPercentage(percentage);
    if (pct >= 90) return <CheckCircle className="h-4 w-4" />;
    if (pct >= 75) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const sortedFiles = coverageData
    ? coverageData.files.sort(
        (a, b) => safeGetPercentage(b.statements.pct) - safeGetPercentage(a.statements.pct)
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 animate-spin text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">
              カバレッジデータを読み込み中...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            テストカバレッジレポート
          </h1>
          <p className="text-gray-600">プロジェクトのテストカバレッジの詳細分析</p>
        </div>

        {/* 概要統計 */}
        {coverageData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statements</CardTitle>
                {getCoverageIcon(coverageData.summary.total.statements.pct)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {safeGetPercentage(coverageData.summary.total.statements.pct).toFixed(1)}%
                </div>
                <Progress
                  value={safeGetPercentage(coverageData.summary.total.statements.pct)}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {coverageData.summary.total.statements.covered} /{' '}
                  {coverageData.summary.total.statements.total}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Branches</CardTitle>
                {getCoverageIcon(coverageData.summary.total.branches.pct)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {safeGetPercentage(coverageData.summary.total.branches.pct).toFixed(1)}%
                </div>
                <Progress
                  value={safeGetPercentage(coverageData.summary.total.branches.pct)}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {coverageData.summary.total.branches.covered} /{' '}
                  {coverageData.summary.total.branches.total}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Functions</CardTitle>
                {getCoverageIcon(coverageData.summary.total.functions.pct)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {safeGetPercentage(coverageData.summary.total.functions.pct).toFixed(1)}%
                </div>
                <Progress
                  value={safeGetPercentage(coverageData.summary.total.functions.pct)}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {coverageData.summary.total.functions.covered} /{' '}
                  {coverageData.summary.total.functions.total}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lines</CardTitle>
                {getCoverageIcon(coverageData.summary.total.lines.pct)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {safeGetPercentage(coverageData.summary.total.lines.pct).toFixed(1)}%
                </div>
                <Progress
                  value={safeGetPercentage(coverageData.summary.total.lines.pct)}
                  className="h-2 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {coverageData.summary.total.lines.covered} /{' '}
                  {coverageData.summary.total.lines.total}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ファイル別詳細 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              ファイル別カバレッジ詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{file.file}</h3>
                    <div className="flex space-x-2">
                      <Badge variant={getCoverageBadgeVariant(file.statements.pct)}>
                        {safeGetPercentage(file.statements.pct).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Statements</div>
                      <div
                        className={`text-sm font-medium ${getCoverageColor(file.statements.pct)}`}
                      >
                        {safeGetPercentage(file.statements.pct).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.statements.covered}/{file.statements.total}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">Branches</div>
                      <div className={`text-sm font-medium ${getCoverageColor(file.branches.pct)}`}>
                        {safeGetPercentage(file.branches.pct).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.branches.covered}/{file.branches.total}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">Functions</div>
                      <div
                        className={`text-sm font-medium ${getCoverageColor(file.functions.pct)}`}
                      >
                        {safeGetPercentage(file.functions.pct).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.functions.covered}/{file.functions.total}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">Lines</div>
                      <div className={`text-sm font-medium ${getCoverageColor(file.lines.pct)}`}>
                        {safeGetPercentage(file.lines.pct).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.lines.covered}/{file.lines.total}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カバレッジ生成コマンド */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              カバレッジレポート生成方法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600">以下のコマンドでカバレッジレポートを生成できます：</p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                <div className="mb-2"># HTMLレポート生成</div>
                <div className="text-blue-600">npm run test:coverage:html</div>
                <div className="mt-3 mb-2"># 全フォーマット対応</div>
                <div className="text-blue-600">npm run test:coverage:full</div>
                <div className="mt-3 mb-2"># ローカルサーバーで表示</div>
                <div className="text-blue-600">npm run test:coverage:serve</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverageReportPage;
