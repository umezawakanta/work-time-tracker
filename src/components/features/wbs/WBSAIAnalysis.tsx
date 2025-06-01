import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WBSNode } from '@/types/wbs';
import WBSAIService from '@/services/ai/WBSAIService';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Lightbulb,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface WBSAIAnalysisProps {
  nodes: WBSNode[];
  selectedNode?: WBSNode | null;
  onOptimizationApply?: (nodeId: string, optimization: any) => void;
}

interface AnalysisResult {
  healthScore: number;
  confidenceLevel: number;
  keyFindings: string[];
  risks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    affectedNodes?: string[];
    mitigation: string;
  }>;
  optimizations: Array<{
    title: string;
    description: string;
    impact: string;
    nodeIds?: string[];
  }>;
  predictions: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
    confidence: number;
  };
  recommendations: string[];
  selectedNodeAnalysis?: {
    summary: string;
    progressAssessment: string;
    risks: string[];
    suggestions: string[];
    completionForecast: string;
  };
}

const WBSAIAnalysis: React.FC<WBSAIAnalysisProps> = ({
  nodes,
  selectedNode,
  onOptimizationApply,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // ノードが更新されたときに自動的に再分析を実行
  useEffect(() => {
    if (nodes.length > 0) {
      performAnalysis();
    }
  }, [nodes, selectedNode]);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await WBSAIService.analyzeProject(nodes, selectedNode);
      setAnalysisResult(result as AnalysisResult);
    } catch (err) {
      setError('AI分析の実行中にエラーが発生しました');
      console.error('AI分析エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">AI分析を実行中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">分析データがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 健全性スコア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            プロジェクト健全性
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">
                <span className={getHealthScoreColor(analysisResult.healthScore)}>
                  {analysisResult.healthScore}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                信頼度: {analysisResult.confidenceLevel}%
              </p>
            </div>
            <Progress value={analysisResult.healthScore} className="w-32 h-3" />
          </div>

          {/* 主要な発見 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">主要な発見</h4>
            <ul className="space-y-1">
              {analysisResult.keyFindings.map((finding, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* タブ形式の詳細情報 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="risks">リスク</TabsTrigger>
          <TabsTrigger value="optimizations">最適化</TabsTrigger>
          <TabsTrigger value="predictions">予測</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 推奨事項 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                推奨事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 選択されたノードの分析 */}
          {selectedNode && analysisResult.selectedNodeAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">「{selectedNode.name}」の分析</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">概要</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.selectedNodeAnalysis.summary}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">提案</h4>
                  <ul className="space-y-1">
                    {analysisResult.selectedNodeAnalysis.suggestions.map((sug, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          {analysisResult.risks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-muted-foreground">重大なリスクは検出されませんでした</p>
              </CardContent>
            </Card>
          ) : (
            analysisResult.risks.map((risk, index) => (
              <Alert key={index} variant={getSeverityColor(risk.severity)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  {risk.title}
                  <Badge variant={getBadgeVariant(risk.severity)}>
                    {risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>{risk.description}</p>
                  <p className="font-medium">対策: {risk.mitigation}</p>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          {analysisResult.optimizations.map((opt, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {opt.title}
                  </span>
                  <Badge variant="secondary">{opt.impact}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{opt.description}</p>
                {onOptimizationApply && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (opt.nodeIds && opt.nodeIds.length > 0) {
                        opt.nodeIds.forEach((nodeId) => {
                          onOptimizationApply(nodeId, {
                            type: 'optimization',
                            title: opt.title,
                            impact: opt.impact,
                          });
                        });
                      }
                    }}
                  >
                    この最適化を適用
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                完了予測
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">楽観的</p>
                    <p className="font-semibold text-green-600">
                      {analysisResult.predictions.optimistic}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">現実的</p>
                    <p className="font-semibold">{analysisResult.predictions.realistic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">悲観的</p>
                    <p className="font-semibold text-red-600">
                      {analysisResult.predictions.pessimistic}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">予測信頼度</span>
                    <span className="font-medium">{analysisResult.predictions.confidence}%</span>
                  </div>
                  <Progress value={analysisResult.predictions.confidence} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WBSAIAnalysis;
