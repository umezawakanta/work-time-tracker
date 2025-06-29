/**
 * 🔍 固定データ可視化ダッシュボード
 * サイト全体の固定値・ハードコーディング箇所を可視化して改善を支援
 */

import React, { useState, useEffect } from 'react';
import {
  hardcodedDataAnalyzer,
  type AnalysisResult,
  type HardcodedIssue,
} from '../services/analysis/HardcodedDataAnalyzer';

// アイコンマッピング
const severityIcons = {
  critical: '🚨',
  high: '⚠️',
  medium: '📝',
  low: '💡',
};

const typeIcons = {
  random: '🎲',
  'mock-data': '🔌',
  'hardcoded-string': '📄',
  'hardcoded-number': '🔢',
  'fixed-array': '📋',
  'api-mock': '🌐',
};

const categoryIcons = {
  performance: '⚡',
  ui: '🎨',
  data: '📊',
  api: '🔗',
  config: '⚙️',
  logic: '🧠',
};

const effortIcons = {
  small: '🟢',
  medium: '🟡',
  large: '🔴',
};

export default function HardcodedDataDashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    category: 'all',
    fixed: 'all',
  });
  const [sortBy, setSortBy] = useState<'severity' | 'type' | 'file' | 'line'>('severity');

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    console.log('🔄 固定データ分析を開始...');

    try {
      const result = await hardcodedDataAnalyzer.analyzeProject();
      console.log('📊 分析結果を受信:', result);
      console.log('📊 問題数:', result.totalIssues);
      console.log('📊 ファイル数:', Object.keys(result.fileAnalysis).length);
      setAnalysisResult(result);
    } catch (error) {
      console.error('❌ 分析エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    hardcodedDataAnalyzer.clearCache();
    await loadAnalysis();
  };

  const markAsFixed = (issueId: string) => {
    hardcodedDataAnalyzer.markAsFixed(issueId);
    loadAnalysis(); // 結果を再読み込み
  };

  const getFilteredIssues = (): HardcodedIssue[] => {
    if (!analysisResult) return [];

    const allIssues = Object.values(analysisResult.fileAnalysis).flat();

    return allIssues
      .filter((issue) => {
        if (filters.severity !== 'all' && issue.severity !== filters.severity) return false;
        if (filters.type !== 'all' && issue.type !== filters.type) return false;
        if (filters.category !== 'all' && issue.category !== filters.category) return false;
        if (filters.fixed === 'fixed' && !issue.isFixed) return false;
        if (filters.fixed === 'unfixed' && issue.isFixed) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'severity': {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          }
          case 'type':
            return a.type.localeCompare(b.type);
          case 'file':
            return a.file.localeCompare(b.file);
          case 'line':
            return a.line - b.line;
          default:
            return 0;
        }
      });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">固定データを分析中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-800">🔍 固定データ可視化ダッシュボード</h1>
            <button
              onClick={refreshAnalysis}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🔄 再分析
            </button>
          </div>
          <p className="text-gray-600">
            サイト全体の固定値・ハードコーディング箇所を検出して改善優先度を可視化
          </p>
        </div>

        {analysisResult && (
          <>
            {/* タブナビゲーション */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                {[
                  { id: 'overview', label: '概要', icon: '📊' },
                  { id: 'issues', label: '問題一覧', icon: '📋' },
                  { id: 'files', label: 'ファイル別', icon: '📁' },
                  { id: 'suggestions', label: '改善提案', icon: '💡' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 概要タブ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* スコアと統計 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}
                      >
                        {analysisResult.overallScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">総合スコア</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${analysisResult.overallScore >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${analysisResult.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">
                        {analysisResult.totalIssues}
                      </div>
                      <div className="text-sm text-gray-500">総問題数</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {analysisResult.criticalIssues}
                      </div>
                      <div className="text-sm text-gray-500">緊急度: 高</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {analysisResult.highPriorityIssues}
                      </div>
                      <div className="text-sm text-gray-500">優先度: 高</div>
                    </div>
                  </div>
                </div>

                {/* カテゴリ別分布 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 カテゴリ別分布</h3>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.issuesByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                            <span className="capitalize">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / analysisResult.totalIssues) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">🏷️ タイプ別分布</h3>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.issuesByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{typeIcons[type as keyof typeof typeIcons]}</span>
                            <span className="text-sm">{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${(count / analysisResult.totalIssues) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 問題一覧タブ */}
            {activeTab === 'issues' && (
              <div className="space-y-6">
                {/* フィルタ */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                      value={filters.severity}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, severity: e.target.value }))
                      }
                      className="border rounded-lg px-3 py-2"
                      aria-label="重要度でフィルタ"
                    >
                      <option value="all">全ての重要度</option>
                      <option value="critical">🚨 緊急</option>
                      <option value="high">⚠️ 高</option>
                      <option value="medium">📝 中</option>
                      <option value="low">💡 低</option>
                    </select>

                    <select
                      value={filters.type}
                      onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                      className="border rounded-lg px-3 py-2"
                      aria-label="タイプでフィルタ"
                    >
                      <option value="all">全てのタイプ</option>
                      <option value="random">🎲 ランダム値</option>
                      <option value="mock-data">🔌 モックデータ</option>
                      <option value="hardcoded-string">📄 固定文字列</option>
                      <option value="hardcoded-number">🔢 固定数値</option>
                      <option value="fixed-array">📋 固定配列</option>
                      <option value="api-mock">🌐 APIモック</option>
                    </select>

                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="border rounded-lg px-3 py-2"
                      aria-label="カテゴリでフィルタ"
                    >
                      <option value="all">全てのカテゴリ</option>
                      <option value="performance">⚡ パフォーマンス</option>
                      <option value="ui">🎨 UI</option>
                      <option value="data">📊 データ</option>
                      <option value="api">🔗 API</option>
                      <option value="config">⚙️ 設定</option>
                      <option value="logic">🧠 ロジック</option>
                    </select>

                    <select
                      value={filters.fixed}
                      onChange={(e) => setFilters((prev) => ({ ...prev, fixed: e.target.value }))}
                      className="border rounded-lg px-3 py-2"
                      aria-label="修正状態でフィルタ"
                    >
                      <option value="all">全ての状態</option>
                      <option value="unfixed">未修正</option>
                      <option value="fixed">修正済み</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border rounded-lg px-3 py-2"
                      aria-label="ソート順序"
                    >
                      <option value="severity">重要度順</option>
                      <option value="type">タイプ順</option>
                      <option value="file">ファイル順</option>
                      <option value="line">行番号順</option>
                    </select>
                  </div>
                </div>

                {/* 問題リスト */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">
                      📋 検出された問題 ({getFilteredIssues().length}件)
                    </h3>
                  </div>
                  <div className="divide-y">
                    {getFilteredIssues().map((issue) => (
                      <div key={issue.id} className={`p-6 ${issue.isFixed ? 'bg-green-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(issue.severity)}`}
                              >
                                {severityIcons[issue.severity]} {issue.severity}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                                {typeIcons[issue.type]} {issue.type}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {categoryIcons[issue.category]} {issue.category}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                {effortIcons[issue.estimatedEffort]} {issue.estimatedEffort}
                              </span>
                              {issue.isFixed && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  ✅ 修正済み
                                </span>
                              )}
                            </div>

                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                              {issue.description}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              📁 {issue.file.replace('./src/', '')} : {issue.line}行目
                            </p>

                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <code className="text-sm text-gray-800 font-mono">
                                {issue.codeSnippet}
                              </code>
                            </div>

                            <div className="text-sm text-blue-600">
                              💡 <strong>改善提案:</strong> {issue.suggestion}
                            </div>
                          </div>

                          <div className="ml-4">
                            {!issue.isFixed && (
                              <button
                                onClick={() => markAsFixed(issue.id)}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              >
                                ✅ 修正完了
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ファイル別タブ */}
            {activeTab === 'files' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ファイル一覧 */}
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">📁 ファイル一覧</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {Object.entries(analysisResult.fileAnalysis).map(([file, issues]) => (
                        <button
                          key={file}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                            selectedFile === file ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="text-sm font-medium truncate">
                            {file.replace('./src/', '')}
                          </div>
                          <div className="text-xs text-gray-500">{issues.length}件の問題</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ファイル詳細 */}
                  <div className="md:col-span-2 bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">
                        {selectedFile
                          ? `📄 ${selectedFile.replace('./src/', '')}`
                          : '📄 ファイルを選択してください'}
                      </h3>
                    </div>
                    <div className="p-4">
                      {selectedFile && analysisResult.fileAnalysis[selectedFile] ? (
                        <div className="space-y-4">
                          {analysisResult.fileAnalysis[selectedFile].map((issue) => (
                            <div
                              key={issue.id}
                              className={`border rounded-lg p-4 ${issue.isFixed ? 'bg-green-50' : ''}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(issue.severity)}`}
                                >
                                  {severityIcons[issue.severity]} {issue.severity}
                                </span>
                                <span className="text-sm text-gray-600">Line {issue.line}</span>
                                {issue.isFixed && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    ✅ 修正済み
                                  </span>
                                )}
                              </div>
                              <div className="text-sm mb-2">{issue.description}</div>
                              <div className="bg-gray-50 rounded p-2 mb-2">
                                <code className="text-xs font-mono">{issue.codeSnippet}</code>
                              </div>
                              <div className="text-sm text-blue-600">💡 {issue.suggestion}</div>
                              {!issue.isFixed && (
                                <button
                                  onClick={() => markAsFixed(issue.id)}
                                  className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                >
                                  ✅ 修正完了
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          ファイルを選択して詳細を確認してください
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 改善提案タブ */}
            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">💡 改善提案</h3>
                  <div className="space-y-4">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded"
                      >
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">🎯 優先度別改善ガイド</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-red-600 mb-2">🚨 緊急度: Critical</h4>
                      <p className="text-sm mb-2">
                        APIモックやテストデータが本番環境で使用されている可能性があります。
                      </p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• 実際のAPIエンドポイントへの接続</li>
                        <li>• データベース統合</li>
                        <li>• 認証システムの実装</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-orange-600 mb-2">⚠️ 優先度: High</h4>
                      <p className="text-sm mb-2">ランダム値や固定配列が多用されています。</p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Math.random()を実際のデータ取得に置換</li>
                        <li>• 設定ファイルからの動的読み込み</li>
                        <li>• ユーザー設定の永続化</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-yellow-600 mb-2">📝 優先度: Medium</h4>
                      <p className="text-sm mb-2">設定値やマジックナンバーの改善が推奨されます。</p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• 定数ファイルの作成</li>
                        <li>• 環境変数の活用</li>
                        <li>• 設定の外部化</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
