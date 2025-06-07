import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
  Globe,
  Server,
  Database,
} from 'lucide-react';
import { api } from '@/services/api/apiConfig';
import { AxiosError } from 'axios';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: unknown;
  error?: string;
  duration?: number;
}

interface ApiInfo {
  api?: {
    status?: string;
    version?: string;
  };
  server?: {
    environment?: string;
    platform?: string;
    nodeVersion?: string;
    uptime?: string;
  };
  database?: {
    connected?: boolean;
  };
  cors?: {
    enabled?: boolean;
  };
  endpoints?: Record<string, string>;
}

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);

  const testEndpoints = [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'Status', path: '/api/status', method: 'GET' },
    { name: 'Test Endpoint', path: '/api/test', method: 'GET' },
    { name: 'Auth Test', path: '/api/test/auth', method: 'GET' },
    {
      name: 'POST Test',
      path: '/api/test',
      method: 'POST',
      data: { test: 'data', timestamp: new Date().toISOString() },
    },
    { name: 'Blog API', path: '/api/blog', method: 'GET' },
    { name: 'Auth Check', path: '/api/auth/check', method: 'GET' },
  ];

  useEffect(() => {
    loadApiInfo();
  }, []);

  const loadApiInfo = async () => {
    try {
      const response = await api.get('/api/status');
      setApiInfo(response.data);
    } catch (error) {
      console.error('Failed to load API info:', error);
    }
  };

  const runSingleTest = async (endpoint: (typeof testEndpoints)[0]): Promise<TestResult> => {
    const startTime = Date.now();

    try {
      let response;
      if (endpoint.method === 'POST') {
        response = await api.post(endpoint.path, endpoint.data || {});
      } else {
        response = await api.get(endpoint.path);
      }

      const duration = Date.now() - startTime;

      return {
        endpoint: endpoint.name,
        status: 'success',
        response: response.data,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const axiosError = error as AxiosError;

      return {
        endpoint: endpoint.name,
        status: 'error',
        error: axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message,
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const endpoint of testEndpoints) {
      // テスト開始の表示
      const pendingResult: TestResult = {
        endpoint: endpoint.name,
        status: 'pending',
      };

      setTestResults([...results, pendingResult]);

      const result = await runSingleTest(endpoint);
      results.push(result);

      setTestResults([...results]);

      // テスト間の短い間隔
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const runSingleEndpointTest = async (endpoint: (typeof testEndpoints)[0]) => {
    const existingIndex = testResults.findIndex((r) => r.endpoint === endpoint.name);

    // Pending状態を設定
    const newResults = [...testResults];
    const pendingResult: TestResult = {
      endpoint: endpoint.name,
      status: 'pending',
    };

    if (existingIndex >= 0) {
      newResults[existingIndex] = pendingResult;
    } else {
      newResults.push(pendingResult);
    }

    setTestResults(newResults);

    const result = await runSingleTest(endpoint);

    // 結果を更新
    const updatedResults = [...newResults];
    if (existingIndex >= 0) {
      updatedResults[existingIndex] = result;
    } else {
      updatedResults[updatedResults.length - 1] = result;
    }

    setTestResults(updatedResults);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="outline">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Not tested</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Test Dashboard</h1>
            <p className="text-muted-foreground">APIサーバーの動作確認とエンドポイントテスト</p>
          </div>
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tests">Endpoint Tests</TabsTrigger>
            <TabsTrigger value="info">API Info</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            {/* Test Results */}
            <div className="grid gap-4">
              {testEndpoints.map((endpoint, index) => {
                const result = testResults.find((r) => r.endpoint === endpoint.name);

                return (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result?.status || 'pending')}
                          <div>
                            <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {endpoint.method} {endpoint.path}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {result?.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                          {getStatusBadge(result?.status || 'pending')}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runSingleEndpointTest(endpoint)}
                            disabled={result?.status === 'pending'}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {result && result.status !== 'pending' && (
                      <CardContent>
                        {result.status === 'success' ? (
                          <div className="space-y-2">
                            <p className="text-sm text-green-600 font-medium">✅ Success</p>
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(result.response, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600 font-medium">❌ Error</p>
                            <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-32 text-red-800">
                              {result.error}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            {/* API Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apiInfo ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {apiInfo.api?.status || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>{apiInfo.api?.version || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <span>{apiInfo.server?.environment || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform:</span>
                        <span>{apiInfo.server?.platform || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Node Version:</span>
                        <span>{apiInfo.server?.nodeVersion || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>{apiInfo.server?.uptime || 'Unknown'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading server information...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database & Config
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apiInfo ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Database:</span>
                        <Badge variant={apiInfo.database?.connected ? 'default' : 'destructive'}>
                          {apiInfo.database?.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>CORS:</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {apiInfo.cors?.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="font-medium">Available Endpoints:</span>
                        <div className="pl-4 space-y-1">
                          {apiInfo.endpoints &&
                            Object.entries(apiInfo.endpoints).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span>{key}:</span>
                                <code className="bg-gray-100 px-1 rounded">{value as string}</code>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading database information...</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Status Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={loadApiInfo}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh Info
                    </Button>
                  </div>

                  {apiInfo ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        API server is running and accessible. Last updated:{' '}
                        {new Date().toLocaleTimeString()}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Unable to connect to API server. Please check if the server is running.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiTest;
