/**
 * 🤖 マルチAI統合ダッシュボード
 * 複数のAIサービス（ChatGPT、Claude、Gemini、Manus、NotebookLM、Notion、AI Studio、SuperWhisper、Sora）を管理
 */

import React, { useState, useEffect } from 'react';
import {
  multiAIIntegrationService,
  type AITaskRequest,
  type AITaskResponse,
} from '../services/ai/MultiAIIntegrationService';

// アイコンマッピング
const providerIcons: Record<string, string> = {
  chatgpt: '🚀',
  claude: '🧠',
  gemini: '✨',
  manus: '✍️',
  notebooklm: '📚',
  notion: '📝',
  aistudio: '🎨',
  superwhisper: '🎤',
  sora: '🎬',
};

const taskTypeIcons: Record<string, string> = {
  code: '💻',
  analysis: '📊',
  creative: '🎨',
  transcription: '🎤',
  video: '🎬',
  notes: '📝',
  planning: '📋',
};

export default function MultiAIDashboard() {
  const [providers, setProviders] = useState<Record<string, any>>({});
  const [usageStats, setUsageStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<AITaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // テストリクエスト設定
  const [testRequest, setTestRequest] = useState<AITaskRequest>({
    prompt: 'Work Time Trackerアプリケーションの自己改善機能について説明してください',
    taskType: 'analysis',
    priority: 'normal',
    useMultiple: false,
  });

  // APIキー設定
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProviderInfo();
    loadUsageStats();
  }, []);

  const loadProviderInfo = () => {
    const capabilities = multiAIIntegrationService.getCapabilityMatrix();
    const mockProviders = Object.entries(capabilities).reduce(
      (acc, [name, caps]) => {
        acc[name.toLowerCase()] = {
          name,
          capabilities: caps,
          speed: 'fast',
          pricing: name === 'NotebookLM' ? 'free' : 'paid',
          reliability: 95,
        };
        return acc;
      },
      {} as Record<string, any>
    );
    setProviders(mockProviders);
  };

  const loadUsageStats = () => {
    const stats = multiAIIntegrationService.getUsageStatistics();
    setUsageStats(stats);
  };

  const handleSetApiKey = (provider: string, apiKey: string) => {
    if (apiKey.trim()) {
      // Note: MultiAIIntegrationService doesn't have setApiKey method
      setApiKeys((prev) => ({ ...prev, [provider]: apiKey }));
    }
  };

  const handleTestRequest = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await multiAIIntegrationService.processTask(testRequest);
      setTestResult(response);
      loadUsageStats(); // 統計を更新
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderStatusColor = (provider: string): string => {
    const providerInfo = providers[provider];
    if (!providerInfo) return 'gray';

    // 無料プロバイダーは常に利用可能
    if (providerInfo.pricing === 'free') return 'green';

    // APIキーが設定されているかチェック
    return apiKeys[provider] ? 'green' : 'red';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🤖 マルチAI統合ダッシュボード</h1>
          <p className="text-gray-600">
            複数のAIサービスを統合管理し、最適なAIを自動選択してタスクを実行
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'test', label: 'テスト実行', icon: '🧪' },
              { id: 'settings', label: '設定', icon: '⚙️' },
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
            {/* プロバイダー概要 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  🎯 AI プロバイダー概要
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {Object.entries(providers).map(([key, provider]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{providerIcons[key]}</span>
                          <span className="font-semibold">{provider.name}</span>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            getProviderStatusColor(key) === 'green' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {provider.capabilities.map((cap: string) => (
                          <span
                            key={cap}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {taskTypeIcons[cap]} {cap}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
                          {provider.speed}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                          {provider.pricing}
                        </span>
                        <span className="px-2 py-1 rounded text-xs border border-gray-300 text-gray-700">
                          {provider.reliability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 使用統計 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">📊 使用統計</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(usageStats).map(([provider, stats]) => (
                    <div key={provider} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{providerIcons[provider]}</span>
                          <span className="font-medium">
                            {providers[provider]?.name || provider}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${stats.successRate > 90 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          成功率: {stats.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">リクエスト数</span>
                          <div className="font-semibold">{stats.requests}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">エラー数</span>
                          <div className="font-semibold text-red-600">{stats.errors}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">総コスト</span>
                          <div className="font-semibold">${stats.totalCost.toFixed(4)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">平均コスト</span>
                          <div className="font-semibold">${stats.averageCost.toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* テスト実行タブ */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">🧪 AIテスト実行</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="test-prompt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    プロンプト
                  </label>
                  <textarea
                    id="test-prompt"
                    value={testRequest.prompt}
                    onChange={(e) =>
                      setTestRequest((prev) => ({ ...prev, prompt: e.target.value }))
                    }
                    placeholder="AIに実行させたいタスクを入力してください"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="task-type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      タスクタイプ
                    </label>
                    <select
                      id="task-type"
                      value={testRequest.taskType}
                      onChange={(e) =>
                        setTestRequest((prev) => ({ ...prev, taskType: e.target.value as any }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="code">💻 コード</option>
                      <option value="analysis">📊 分析</option>
                      <option value="creative">🎨 創作</option>
                      <option value="transcription">🎤 音声認識</option>
                      <option value="video">🎬 動画生成</option>
                      <option value="notes">📝 ノート</option>
                      <option value="planning">📋 計画</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      優先度
                    </label>
                    <select
                      id="priority"
                      value={testRequest.priority}
                      onChange={(e) =>
                        setTestRequest((prev) => ({ ...prev, priority: e.target.value as any }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">低</option>
                      <option value="normal">通常</option>
                      <option value="high">高</option>
                      <option value="urgent">緊急</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="use-consensus"
                      checked={testRequest.useMultiple}
                      onChange={(e) =>
                        setTestRequest((prev) => ({ ...prev, useMultiple: e.target.checked }))
                      }
                      className="mr-2"
                    />
                    <label htmlFor="use-consensus" className="text-sm font-medium text-gray-700">
                      複数AI活用
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleTestRequest}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-md font-medium ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors`}
                >
                  {isLoading ? '実行中...' : 'AIテスト実行'}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-red-800">{error}</div>
                  </div>
                )}

                {testResult && (
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          {providerIcons[testResult.provider.toLowerCase()] || '🤖'}
                          {testResult.provider}の回答
                        </h3>
                        <span className="px-2 py-1 rounded text-xs border border-gray-300 text-gray-700">
                          信頼度: {testResult.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="whitespace-pre-wrap">{testResult.content}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">モデル</span>
                            <div className="font-semibold">{testResult.model}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">処理時間</span>
                            <div className="font-semibold">{testResult.processingTime}ms</div>
                          </div>
                          <div>
                            <span className="text-gray-500">トークン数</span>
                            <div className="font-semibold">{testResult.tokens || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">コスト</span>
                            <div className="font-semibold">
                              ${testResult.cost?.toFixed(4) || '0.0000'}
                            </div>
                          </div>
                        </div>

                        {testResult.metadata && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              メタデータ
                            </label>
                            <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto">
                              {JSON.stringify(testResult.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">⚙️ システム設定</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-blue-800">
                    各AIプロバイダーのAPIキーを設定して、すべての機能を有効化してください。
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(providers)
                    .filter(([_, provider]) => provider.pricing !== 'free')
                    .map(([key, provider]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{providerIcons[key]}</span>
                          <span className="font-semibold">{provider.name}</span>
                        </div>
                        <div>
                          <label
                            htmlFor={`settings-api-key-${key}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            APIキー
                          </label>
                          <input
                            id={`settings-api-key-${key}`}
                            type="password"
                            placeholder="APIキーを入力"
                            value={apiKeys[key] || ''}
                            onChange={(e) =>
                              setApiKeys((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onBlur={(e) => handleSetApiKey(key, e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
