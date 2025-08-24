import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Key,
  Brain,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Save,
  TestTube,
  Sparkles,
  Zap,
  DollarSign,
  BarChart3,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import anthropicService from '@/services/ai/anthropicService';

interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enableAI: boolean;
  debugMode: boolean;
  rateLimit: number;
  rateLimitWindow: number;
}

interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

interface UsageStats {
  requestsToday: number;
  tokensUsed: number;
  estimatedCost: number;
  lastRequest?: Date;
}

const AISettings: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 8192,
    temperature: 0.7,
    enableAI: true,
    debugMode: false,
    rateLimit: 10,
    rateLimitWindow: 60000,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    requestsToday: 0,
    tokensUsed: 0,
    estimatedCost: 0,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
    loadUsageStats();
  }, []);

  // Load configuration from localStorage and environment variables
  const loadConfiguration = () => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
    } else {
      // Load from environment variables
      setConfig({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        maxTokens: parseInt(import.meta.env.VITE_ANTHROPIC_MAX_TOKENS || '8192'),
        temperature: 0.7,
        enableAI: import.meta.env.VITE_ENABLE_AI === 'true',
        debugMode: import.meta.env.VITE_AI_DEBUG_MODE === 'true',
        rateLimit: parseInt(import.meta.env.VITE_AI_RATE_LIMIT || '10'),
        rateLimitWindow: parseInt(import.meta.env.VITE_AI_RATE_WINDOW_MS || '60000'),
      });
    }
  };

  // Load usage statistics
  const loadUsageStats = () => {
    const stats = localStorage.getItem('ai-usage-stats');
    if (stats) {
      const parsed = JSON.parse(stats);
      setUsageStats({
        ...parsed,
        lastRequest: parsed.lastRequest ? new Date(parsed.lastRequest) : undefined,
      });
    }
  };

  // Save configuration
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('ai-config', JSON.stringify(config));

      // Update Anthropic service configuration
      anthropicService.updateConfig({
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      toast.success('設定を保存しました');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // Test API connection
  const testConnection = async () => {
    if (!config.apiKey) {
      toast.error('APIキーを入力してください');
      return;
    }

    setIsTesting(true);
    try {
      // Temporarily update service config for testing
      anthropicService.updateConfig({
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
      });

      const result = await anthropicService.testConnection();

      setTestResult({
        success: result.success,
        message: result.message,
        timestamp: new Date(),
      });

      if (result.success) {
        toast.success('接続テストに成功しました！');
      } else {
        toast.error(`接続テスト失敗: ${result.message}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({
        success: false,
        message: 'テスト中にエラーが発生しました',
        timestamp: new Date(),
      });
      toast.error('接続テストに失敗しました');
    } finally {
      setIsTesting(false);
    }
  };

  // Handle configuration changes
  const handleConfigChange = (key: keyof AIConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Get available models
  const availableModels = anthropicService.getAvailableModels();

  // Calculate estimated cost
  const calculateEstimatedCost = (model: string, tokensUsed: number): number => {
    const rates: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    };

    const rate = rates[model] || rates['claude-3-5-sonnet-20241022'];
    // Rough estimate: 70% input, 30% output
    return (tokensUsed * 0.7 * rate.input + tokensUsed * 0.3 * rate.output) / 1000;
  };

  // Reset usage statistics
  const resetUsageStats = () => {
    const emptyStats = {
      requestsToday: 0,
      tokensUsed: 0,
      estimatedCost: 0,
      lastRequest: null,
    };
    localStorage.setItem('ai-usage-stats', JSON.stringify(emptyStats));
    setUsageStats(emptyStats);
    toast.success('使用統計をリセットしました');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI設定
              </CardTitle>
              <CardDescription>Anthropic Claude APIの設定を管理します</CardDescription>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                未保存の変更
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                一般
              </TabsTrigger>
              <TabsTrigger value="model">
                <Brain className="h-4 w-4 mr-2" />
                モデル
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                セキュリティ
              </TabsTrigger>
              <TabsTrigger value="usage">
                <BarChart3 className="h-4 w-4 mr-2" />
                使用状況
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="api-key">APIキー</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey}
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                      placeholder="sk-ant-api03-..."
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 px-2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={testConnection}
                    disabled={isTesting || !config.apiKey}
                    variant="outline"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        テスト中...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        接続テスト
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  AnthropicのAPIキーを入力してください。
                  <a
                    href="https://console.anthropic.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    APIキーを取得
                  </a>
                </p>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{testResult.success ? '接続成功' : '接続失敗'}</AlertTitle>
                  <AlertDescription>
                    {testResult.message}
                    <span className="text-xs block mt-1">
                      {testResult.timestamp.toLocaleString()}
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-ai">AI機能を有効化</Label>
                  <div className="text-xs text-gray-500">
                    AIによるタスク分析やコード生成機能を使用します
                  </div>
                </div>
                <Switch
                  id="enable-ai"
                  checked={config.enableAI}
                  onCheckedChange={(checked) => handleConfigChange('enableAI', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">デバッグモード</Label>
                  <div className="text-xs text-gray-500">詳細なログを出力します</div>
                </div>
                <Switch
                  id="debug-mode"
                  checked={config.debugMode}
                  onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
                />
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="model">AIモデル</Label>
                <Select
                  value={config.model}
                  onValueChange={(value) => handleConfigChange('model', value)}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          {model.id === 'claude-3-5-sonnet-20241022' && (
                            <Badge variant="default" className="ml-2">
                              <Sparkles className="h-3 w-3 mr-1" />
                              推奨
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {availableModels.find((m) => m.id === config.model)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">最大トークン数</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                  min="100"
                  max="200000"
                />
                <p className="text-xs text-gray-500">生成される応答の最大長（推奨: 8192）</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="temperature"
                    type="range"
                    value={config.temperature}
                    onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                    min="0"
                    max="1"
                    step="0.1"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{config.temperature}</span>
                </div>
                <p className="text-xs text-gray-500">応答の創造性レベル（0=決定的、1=創造的）</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>モデル選択のヒント</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>
                      <strong>Claude 3.5 Sonnet:</strong> 最新で高速、コスパ最高
                    </li>
                    <li>
                      <strong>Claude 3 Opus:</strong> 最も高性能、複雑なタスク向け
                    </li>
                    <li>
                      <strong>Claude 3 Haiku:</strong> 最速、シンプルなタスク向け
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">レート制限（リクエスト/分）</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={config.rateLimit}
                    onChange={(e) => handleConfigChange('rateLimit', parseInt(e.target.value))}
                    min="1"
                    max="60"
                  />
                  <p className="text-xs text-gray-500">1分あたりの最大リクエスト数</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-window">レート制限ウィンドウ（ミリ秒）</Label>
                  <Input
                    id="rate-window"
                    type="number"
                    value={config.rateLimitWindow}
                    onChange={(e) =>
                      handleConfigChange('rateLimitWindow', parseInt(e.target.value))
                    }
                    min="10000"
                    max="300000"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500">
                    レート制限の時間ウィンドウ（デフォルト: 60000ms = 1分）
                  </p>
                </div>

                <Separator />

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>セキュリティに関する注意</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>APIキーは暗号化されてローカルに保存されます</li>
                      <li>APIキーを他人と共有しないでください</li>
                      <li>定期的にAPIキーを更新することを推奨します</li>
                      <li>本番環境では環境変数を使用してください</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  {config.apiKey ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">APIキーが設定されています</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">APIキーが未設定です</span>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">本日のリクエスト</p>
                        <p className="text-2xl font-bold">{usageStats.requestsToday}</p>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">使用トークン</p>
                        <p className="text-2xl font-bold">
                          {usageStats.tokensUsed.toLocaleString()}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">推定コスト</p>
                        <p className="text-2xl font-bold">
                          ${calculateEstimatedCost(config.model, usageStats.tokensUsed).toFixed(4)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {usageStats.lastRequest && (
                <div className="text-sm text-gray-500">
                  最終リクエスト: {usageStats.lastRequest.toLocaleString()}
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">使用制限</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>レート制限</span>
                    <Badge variant="outline">{config.rateLimit} リクエスト/分</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>最大トークン数</span>
                    <Badge variant="outline">{config.maxTokens.toLocaleString()} トークン</Badge>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>料金について</AlertTitle>
                <AlertDescription>
                  表示されているコストは推定値です。実際の請求額はAnthropicのコンソールで確認してください。
                  <a
                    href="https://www.anthropic.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    料金詳細
                  </a>
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={resetUsageStats} className="w-full">
                使用統計をリセット
              </Button>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Button
              onClick={saveConfiguration}
              disabled={isSaving || !hasChanges}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  設定を保存
                </>
              )}
            </Button>
            <Button variant="outline" onClick={loadConfiguration} disabled={isSaving}>
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">クイックスタートガイド</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <a
                href="https://console.anthropic.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                AnthropicコンソールでAPIキーを取得
              </a>
            </li>
            <li>上記のAPIキー欄にキーを入力</li>
            <li>「接続テスト」ボタンで接続を確認</li>
            <li>お好みのモデルとパラメータを選択</li>
            <li>「設定を保存」をクリックして完了</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettings;
