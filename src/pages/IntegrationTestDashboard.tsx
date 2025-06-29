/**
 * 🧪 統合テストダッシュボード
 * GitHub・Vercel・品質管理システムの全体連携テスト結果を可視化
 */

import React, { useState, useEffect } from 'react';
import { integrationTestingService } from '../services/testing/IntegrationTestingService';
import { gitHubAutomationService } from '../services/integration/GitHubAutomationService';
import { vercelDeploymentService } from '../services/deployment/VercelDeploymentService';

// アイコンマッピング
const statusIcons = {
  pending: '⏳',
  running: '🔄',
  passed: '✅',
  failed: '❌',
  skipped: '⏭️',
};

const serviceIcons = {
  github: '🐙',
  vercel: '▲',
  quality: '📊',
  testing: '🧪',
};

export default function IntegrationTestDashboard() {
  const [testExecutions, setTestExecutions] = useState<any[]>([]);
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [testReport, setTestReport] = useState<any>(null);
  const [githubStatus, setGithubStatus] = useState<any>(null);
  const [vercelStatus, setVercelStatus] = useState<any>(null);

  useEffect(() => {
    loadTestData();
    loadServiceStatus();
  }, []);

  const loadTestData = () => {
    const executions = integrationTestingService.getTestExecutions();
    setTestExecutions(executions);
  };

  const loadServiceStatus = () => {
    // GitHub統合サービス状況
    const githubIssues = gitHubAutomationService.getDetectedIssues();
    const githubFixes = gitHubAutomationService.getAutoFixes();
    const githubPRs = gitHubAutomationService.getPullRequests();

    setGithubStatus({
      issues: githubIssues.length,
      fixes: githubFixes.length,
      pullRequests: githubPRs.length,
      qualityReport: gitHubAutomationService.generateQualityReport(),
    });

    // Vercel統合サービス状況
    const vercelDeployments = vercelDeploymentService.getDeploymentResults();
    const vercelRules = vercelDeploymentService.getAutoDeploymentRules();

    setVercelStatus({
      deployments: vercelDeployments.length,
      successfulDeployments: vercelDeployments.filter((d) => d.status === 'ready').length,
      rules: vercelRules.length,
      lastDeployment: vercelDeployments[vercelDeployments.length - 1],
    });
  };

  const runMainWorkflowTest = async () => {
    setIsRunning(true);
    setCurrentExecution(null);
    setTestReport(null);

    try {
      console.log('🚀 メインワークフロー統合テスト開始');

      const result = await integrationTestingService.runMainWorkflowTest();

      setCurrentExecution(result);
      setTestReport(result.testReport);
      loadTestData();

      console.log('🎉 統合テスト完了:', result.overallSuccess ? '成功' : '失敗');
    } catch (error) {
      console.error('❌ 統合テスト失敗:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (suiteId: string) => {
    setIsRunning(true);

    try {
      const execution = await integrationTestingService.runTestSuite(suiteId);
      setSelectedTest(execution.id);
      loadTestData();
    } catch (error) {
      console.error(`❌ テストスイート失敗: ${suiteId}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'skipped':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSuccessRate = (execution: any): number => {
    if (!execution?.summary) return 0;
    return execution.summary.total > 0
      ? (execution.summary.passed / execution.summary.total) * 100
      : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-800">🧪 統合テストダッシュボード</h1>
            <button
              onClick={runMainWorkflowTest}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors`}
            >
              {isRunning ? '🔄 実行中...' : '🚀 メインワークフローテスト実行'}
            </button>
          </div>
          <p className="text-gray-600">
            GitHub・Vercel・品質管理システムの全体連携テスト結果を確認
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'tests', label: 'テスト結果', icon: '🧪' },
              { id: 'services', label: 'サービス状況', icon: '⚙️' },
              { id: 'workflow', label: 'ワークフロー', icon: '🔄' },
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
            {/* 最新テスト結果 */}
            {currentExecution && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">🎯 最新テスト結果</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentExecution.overallSuccess
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentExecution.overallSuccess ? '✅ 成功' : '❌ 失敗'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {testReport?.overall?.totalTests || 0}
                    </div>
                    <div className="text-sm text-gray-600">総テスト数</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {testReport?.overall?.totalPassed || 0}
                    </div>
                    <div className="text-sm text-gray-600">成功</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {testReport?.overall?.qualityScore || 0}
                    </div>
                    <div className="text-sm text-gray-600">品質スコア</div>
                  </div>
                </div>

                {testReport?.overall && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>成功率</span>
                        <span>
                          {Math.round(
                            (testReport.overall.totalPassed / testReport.overall.totalTests) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(testReport.overall.totalPassed / testReport.overall.totalTests) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* システム統合状況 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub統合状況 */}
              {githubStatus && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🐙</span>
                    <h3 className="text-lg font-semibold">GitHub統合状況</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">検出問題数</span>
                      <span className="font-semibold">{githubStatus.issues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">自動修正数</span>
                      <span className="font-semibold">{githubStatus.fixes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">プルリクエスト数</span>
                      <span className="font-semibold">{githubStatus.pullRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">品質スコア</span>
                      <span
                        className={`font-semibold ${
                          githubStatus.qualityReport?.qualityScore >= 90
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {githubStatus.qualityReport?.qualityScore || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Vercel統合状況 */}
              {vercelStatus && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">▲</span>
                    <h3 className="text-lg font-semibold">Vercel統合状況</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">総デプロイ数</span>
                      <span className="font-semibold">{vercelStatus.deployments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">成功デプロイ数</span>
                      <span className="font-semibold">{vercelStatus.successfulDeployments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">自動化ルール数</span>
                      <span className="font-semibold">{vercelStatus.rules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">成功率</span>
                      <span
                        className={`font-semibold ${
                          vercelStatus.deployments > 0 &&
                          vercelStatus.successfulDeployments / vercelStatus.deployments >= 0.9
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {vercelStatus.deployments > 0
                          ? Math.round(
                              (vercelStatus.successfulDeployments / vercelStatus.deployments) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* テスト結果タブ */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* テストスイート一覧 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">🧪 テストスイート</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'github-automation-tests',
                      name: 'GitHub自動化',
                      icon: '🐙',
                      desc: '問題検出・修正・PR作成',
                    },
                    {
                      id: 'vercel-deployment-tests',
                      name: 'Vercelデプロイ',
                      icon: '▲',
                      desc: '自動デプロイ・品質チェック',
                    },
                    {
                      id: 'end-to-end-workflow-tests',
                      name: 'E2Eワークフロー',
                      icon: '🔄',
                      desc: '完全自動化フロー',
                    },
                  ].map((suite) => (
                    <div key={suite.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{suite.icon}</span>
                        <span className="font-semibold">{suite.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suite.desc}</p>
                      <button
                        onClick={() => runIndividualTest(suite.id)}
                        disabled={isRunning}
                        className={`w-full py-2 px-4 rounded text-sm font-medium ${
                          isRunning
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } transition-colors`}
                      >
                        {isRunning ? '実行中...' : 'テスト実行'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* テスト実行履歴 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">📋 テスト実行履歴</h2>
              </div>
              <div className="p-6">
                {testExecutions.length > 0 ? (
                  <div className="space-y-4">
                    {testExecutions.map((execution) => (
                      <div key={execution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={getStatusColor(execution.status)}>
                              {statusIcons[execution.status as keyof typeof statusIcons]}
                            </span>
                            <span className="font-medium">{execution.suiteId}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(execution.startedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">総数</span>
                            <div className="font-semibold">{execution.summary.total}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">成功</span>
                            <div className="font-semibold text-green-600">
                              {execution.summary.passed}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">失敗</span>
                            <div className="font-semibold text-red-600">
                              {execution.summary.failed}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">成功率</span>
                            <div className="font-semibold">
                              {Math.round(getSuccessRate(execution))}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    テスト実行履歴がありません。テストを実行してください。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* サービス状況タブ */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub統合サービス詳細 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🐙</span>
                  <h3 className="text-lg font-semibold">GitHub自動化サービス</h3>
                </div>
                {githubStatus && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">品質レポート</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>品質スコア</span>
                          <span className="font-semibold">
                            {githubStatus.qualityReport?.qualityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>セキュリティスコア</span>
                          <span className="font-semibold">
                            {githubStatus.qualityReport?.securityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>保守性スコア</span>
                          <span className="font-semibold">
                            {githubStatus.qualityReport?.maintainabilityScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">推奨事項</h4>
                      <ul className="text-sm space-y-1">
                        {(githubStatus.qualityReport?.recommendations || []).map(
                          (rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Vercel統合サービス詳細 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">▲</span>
                  <h3 className="text-lg font-semibold">Vercelデプロイメントサービス</h3>
                </div>
                {vercelStatus && (
                  <div className="space-y-4">
                    {vercelStatus.lastDeployment && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">最新デプロイ</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>ステータス</span>
                            <span
                              className={`font-semibold ${
                                vercelStatus.lastDeployment.status === 'ready'
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {vercelStatus.lastDeployment.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>環境</span>
                            <span className="font-semibold">
                              {vercelStatus.lastDeployment.environment}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>ビルド時間</span>
                            <span className="font-semibold">
                              {vercelStatus.lastDeployment.buildTime}ms
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">自動化設定</h4>
                      <div className="text-sm text-gray-600">
                        {vercelStatus.rules}個の自動デプロイルールが設定されています
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ワークフロータブ */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">🔄 統合ワークフロー</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="text-2xl">🔍</span>
                  <div className="flex-1">
                    <h3 className="font-medium">1. 問題検出</h3>
                    <p className="text-sm text-gray-600">
                      コードベースの固定値・ハードコーディング問題を自動検出
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    完了
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="text-2xl">🔧</span>
                  <div className="flex-1">
                    <h3 className="font-medium">2. 自動修正</h3>
                    <p className="text-sm text-gray-600">検出された問題の自動修正コードを生成</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    完了
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="text-2xl">📝</span>
                  <div className="flex-1">
                    <h3 className="font-medium">3. プルリクエスト作成</h3>
                    <p className="text-sm text-gray-600">修正内容を含むプルリクエストを自動作成</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    完了
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="text-2xl">🚀</span>
                  <div className="flex-1">
                    <h3 className="font-medium">4. 自動デプロイ</h3>
                    <p className="text-sm text-gray-600">
                      プレビュー環境への自動デプロイメント実行
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    完了
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="text-2xl">📊</span>
                  <div className="flex-1">
                    <h3 className="font-medium">5. 品質チェック</h3>
                    <p className="text-sm text-gray-600">
                      デプロイ後の自動品質チェック・レポート生成
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    完了
                  </span>
                </div>
              </div>
            </div>

            {currentExecution && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">📈 ワークフロー実行結果</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">GitHub処理結果</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>検出問題数</span>
                        <span>{currentExecution.github?.summary?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>修正成功数</span>
                        <span>{currentExecution.github?.summary?.passed || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Vercel処理結果</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>デプロイ数</span>
                        <span>{currentExecution.vercel?.summary?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>成功数</span>
                        <span>{currentExecution.vercel?.summary?.passed || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
