import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Sparkles,
  Filter,
  Merge,
} from 'lucide-react';
import { WBSNode } from '@/types/wbs';
import WBSAIService from '@/services/ai/WBSAIService';
import { toast } from 'react-hot-toast';

interface WBSCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: WBSNode[];
  onCleanupComplete: (
    deletedNodeIds: string[],
    mergedNodes: Array<{ from: string[]; to: string }>
  ) => void;
}

interface CleanupSuggestion {
  type: 'delete' | 'merge' | 'optimize';
  nodeIds: string[];
  reason: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  details?: {
    mergeTarget?: string;
    optimizationAction?: string;
  };
}

interface CleanupAnalysis {
  totalNodes: number;
  redundantNodes: number;
  mergeableNodes: number;
  lowValueNodes: number;
  suggestions: CleanupSuggestion[];
  summary: string;
  estimatedTimeSaving: number;
  estimatedCostSaving: number;
}

const WBSCleanupDialog: React.FC<WBSCleanupDialogProps> = ({
  open,
  onOpenChange,
  nodes,
  onCleanupComplete,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CleanupAnalysis | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  useEffect(() => {
    if (open && nodes.length > 0) {
      analyzeWBS();
    }
  }, [open, nodes]);

  const analyzeWBS = async () => {
    setAnalyzing(true);
    try {
      // WBS全体を分析
      const analysis = await performCleanupAnalysis(nodes);
      setAnalysis(analysis);

      // デフォルトで信頼度70%以上の提案を選択
      const defaultSelected = new Set<number>();
      analysis.suggestions.forEach((suggestion, index) => {
        if (suggestion.confidence >= 70) {
          defaultSelected.add(index);
        }
      });
      setSelectedSuggestions(defaultSelected);
    } catch (error) {
      console.error('WBS分析エラー:', error);
      toast.error('分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  const performCleanupAnalysis = async (nodes: WBSNode[]): Promise<CleanupAnalysis> => {
    const suggestions: CleanupSuggestion[] = [];

    // 1. 重複タスクの検出
    const duplicates = findDuplicateTasks(nodes);
    duplicates.forEach((dup) => {
      suggestions.push({
        type: 'delete',
        nodeIds: dup.duplicates,
        reason: `「${dup.originalName}」と類似したタスクが複数存在します`,
        impact: 'medium',
        confidence: 85,
      });
    });

    // 2. 低価値タスクの検出
    const lowValueTasks = findLowValueTasks(nodes);
    lowValueTasks.forEach((task) => {
      suggestions.push({
        type: 'delete',
        nodeIds: [task.id],
        reason: task.reason,
        impact: 'low',
        confidence: task.confidence,
      });
    });

    // 3. 統合可能なタスクの検出
    const mergeableTasks = findMergeableTasks(nodes);
    mergeableTasks.forEach((group) => {
      suggestions.push({
        type: 'merge',
        nodeIds: group.nodeIds,
        reason: group.reason,
        impact: 'medium',
        confidence: group.confidence,
        details: {
          mergeTarget: group.targetId,
        },
      });
    });

    // 4. 最適化可能なタスクの検出
    const optimizableTasks = findOptimizableTasks(nodes);
    optimizableTasks.forEach((opt) => {
      suggestions.push({
        type: 'optimize',
        nodeIds: [opt.nodeId],
        reason: opt.reason,
        impact: opt.impact,
        confidence: opt.confidence,
        details: {
          optimizationAction: opt.action,
        },
      });
    });

    // 統計情報の計算
    const redundantNodes = suggestions
      .filter((s) => s.type === 'delete')
      .reduce((sum, s) => sum + s.nodeIds.length, 0);
    const mergeableNodes = suggestions
      .filter((s) => s.type === 'merge')
      .reduce((sum, s) => sum + s.nodeIds.length - 1, 0);
    const lowValueNodes = lowValueTasks.length;

    // 削減効果の推定
    const estimatedTimeSaving = calculateTimeSaving(nodes, suggestions);
    const estimatedCostSaving = calculateCostSaving(nodes, suggestions);

    return {
      totalNodes: nodes.length,
      redundantNodes,
      mergeableNodes,
      lowValueNodes,
      suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
      summary: generateCleanupSummary(nodes, suggestions),
      estimatedTimeSaving,
      estimatedCostSaving,
    };
  };

  const findDuplicateTasks = (nodes: WBSNode[]) => {
    const duplicates: Array<{ originalName: string; duplicates: string[] }> = [];
    const processed = new Set<string>();

    nodes.forEach((node) => {
      if (processed.has(node.id)) return;

      const similar = nodes.filter((other) => {
        if (other.id === node.id || processed.has(other.id)) return false;

        // 名前の類似度をチェック（閾値を0.7に下げて、より多くの重複を検出）
        const similarity = calculateSimilarity(node.name, other.name);

        // 同じ親を持つか、または同じカテゴリ/タグを持つタスクを検出
        const sameParent = node.parentId === other.parentId;
        const sameCategory = node.category === other.category;
        const hasCommonTags = node.tags?.some((tag) => other.tags?.includes(tag));

        return similarity > 0.7 && (sameParent || sameCategory || hasCommonTags);
      });

      if (similar.length > 0) {
        duplicates.push({
          originalName: node.name,
          duplicates: similar.map((s) => s.id),
        });
        similar.forEach((s) => processed.add(s.id));
      }
    });

    return duplicates;
  };

  const findLowValueTasks = (nodes: WBSNode[]) => {
    return nodes
      .filter((node) => {
        // 完了済みで成果物がないタスク
        if (node.status === 'completed' && node.deliverables.length === 0) {
          return true;
        }

        // 工数が極端に少ないタスク（1時間未満）
        if (node.estimatedHours < 1 && node.level > 1) {
          return true;
        }

        // 進捗0%で期限切れのタスク
        if (node.progress === 0 && new Date(node.endDate) < new Date()) {
          return true;
        }

        return false;
      })
      .map((node) => ({
        id: node.id,
        reason: getReasonForLowValue(node),
        confidence: calculateConfidenceForLowValue(node),
      }));
  };

  const findMergeableTasks = (nodes: WBSNode[]) => {
    const groups: Array<{
      nodeIds: string[];
      targetId: string;
      reason: string;
      confidence: number;
    }> = [];

    // 同じ親を持つ類似タスクをグループ化
    const parentGroups = new Map<string, WBSNode[]>();
    nodes.forEach((node) => {
      if (node.parentId) {
        const siblings = parentGroups.get(node.parentId) || [];
        siblings.push(node);
        parentGroups.set(node.parentId, siblings);
      }
    });

    parentGroups.forEach((siblings) => {
      if (siblings.length < 2) return;

      // 短期間の連続タスクを検出
      const sequential = findSequentialTasks(siblings);
      sequential.forEach((seq) => {
        groups.push({
          nodeIds: seq.map((n) => n.id),
          targetId: seq[0].id,
          reason: '短期間の連続タスクは統合可能です',
          confidence: 75,
        });
      });

      // 同じ担当者の類似タスクを検出
      const byAssignee = groupByAssignee(siblings);
      byAssignee.forEach((tasks) => {
        if (tasks.length >= 2 && areSimilarTasks(tasks)) {
          groups.push({
            nodeIds: tasks.map((t) => t.id),
            targetId: tasks[0].id,
            reason: '同じ担当者の類似タスクは統合できます',
            confidence: 70,
          });
        }
      });
    });

    return groups;
  };

  const findOptimizableTasks = (nodes: WBSNode[]) => {
    return nodes
      .filter((node) => {
        // 過大な見積もり
        if (node.actualHours > 0 && node.estimatedHours > node.actualHours * 2) {
          return true;
        }

        // 依存関係の最適化が可能
        if (node.dependencies.length > 3) {
          return true;
        }

        return false;
      })
      .map((node) => ({
        nodeId: node.id,
        reason: getOptimizationReason(node),
        action: getOptimizationAction(node),
        impact: 'low' as const,
        confidence: 65,
      }));
  };

  const applyCleanup = async () => {
    if (!analysis) return;

    setApplying(true);
    try {
      const deletedNodeIds: string[] = [];
      const mergedNodes: Array<{ from: string[]; to: string }> = [];

      // 選択された提案を適用
      const selectedSuggestionsList = Array.from(selectedSuggestions).map(
        (i) => analysis.suggestions[i]
      );

      for (const suggestion of selectedSuggestionsList) {
        if (suggestion.type === 'delete') {
          deletedNodeIds.push(...suggestion.nodeIds);
        } else if (suggestion.type === 'merge' && suggestion.details?.mergeTarget) {
          mergedNodes.push({
            from: suggestion.nodeIds.filter((id) => id !== suggestion.details!.mergeTarget),
            to: suggestion.details.mergeTarget,
          });
        }
      }

      // 親コンポーネントに通知
      onCleanupComplete(deletedNodeIds, mergedNodes);

      toast.success(
        `${deletedNodeIds.length}個のタスクを削除、${mergedNodes.length}個のグループを統合しました`
      );
      onOpenChange(false);
    } catch (error) {
      console.error('クリーンアップエラー:', error);
      toast.error('クリーンアップに失敗しました');
    } finally {
      setApplying(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'merge':
        return <Merge className="h-4 w-4" />;
      case 'optimize':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            WBS整理・最適化
          </DialogTitle>
          <DialogDescription>
            AIがWBS全体を分析し、不要なタスクの削除や統合の提案を行います
          </DialogDescription>
        </DialogHeader>

        {analyzing ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">WBSを分析中...</span>
          </div>
        ) : analysis ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'details')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="details">詳細</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* 分析サマリー */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分析結果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analysis.totalNodes}</div>
                      <div className="text-sm text-muted-foreground">総タスク数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {analysis.redundantNodes}
                      </div>
                      <div className="text-sm text-muted-foreground">削除候補</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analysis.mergeableNodes}
                      </div>
                      <div className="text-sm text-muted-foreground">統合候補</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.lowValueNodes}
                      </div>
                      <div className="text-sm text-muted-foreground">低価値タスク</div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{analysis.summary}</AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>推定時間削減</span>
                      <span className="font-medium">{analysis.estimatedTimeSaving}時間</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>推定コスト削減</span>
                      <span className="font-medium">
                        ¥{analysis.estimatedCostSaving.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 提案リスト */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>最適化提案</span>
                    <Badge variant="secondary">
                      {selectedSuggestions.size}/{analysis.suggestions.length} 選択中
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                          onClick={() => toggleSuggestion(index)}
                        >
                          <Checkbox
                            checked={selectedSuggestions.has(index)}
                            onCheckedChange={() => toggleSuggestion(index)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSuggestionIcon(suggestion.type)}
                              <span className="font-medium">
                                {suggestion.type === 'delete' && '削除'}
                                {suggestion.type === 'merge' && '統合'}
                                {suggestion.type === 'optimize' && '最適化'}
                              </span>
                              <Badge
                                variant="outline"
                                className={getImpactColor(suggestion.impact)}
                              >
                                影響:{' '}
                                {suggestion.impact === 'high'
                                  ? '大'
                                  : suggestion.impact === 'medium'
                                    ? '中'
                                    : '小'}
                              </Badge>
                              <Badge variant="secondary">信頼度: {suggestion.confidence}%</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                            <div className="mt-1">
                              <span className="text-xs text-muted-foreground">
                                対象: {suggestion.nodeIds.length}個のタスク
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* 詳細な提案内容 */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {analysis.suggestions
                    .filter((_, index) => selectedSuggestions.has(index))
                    .map((suggestion, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            {suggestion.type === 'delete' && '削除提案'}
                            {suggestion.type === 'merge' && '統合提案'}
                            {suggestion.type === 'optimize' && '最適化提案'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-3">{suggestion.reason}</p>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">対象タスク:</span>
                              <ul className="mt-1 ml-4 space-y-1">
                                {suggestion.nodeIds.map((nodeId) => {
                                  const node = nodes.find((n) => n.id === nodeId);
                                  return (
                                    <li key={nodeId} className="text-muted-foreground">
                                      • {node?.name || nodeId}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                            {suggestion.type === 'merge' && suggestion.details?.mergeTarget && (
                              <div className="text-sm">
                                <span className="font-medium">統合先:</span>
                                <span className="ml-2 text-muted-foreground">
                                  {
                                    nodes.find((n) => n.id === suggestion.details!.mergeTarget)
                                      ?.name
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>
            キャンセル
          </Button>
          <Button
            onClick={applyCleanup}
            disabled={analyzing || applying || selectedSuggestions.size === 0}
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                適用中...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                選択した提案を適用
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ヘルパー関数
const calculateSimilarity = (str1: string, str2: string): number => {
  // 文字列を正規化
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  // 完全一致
  if (s1 === s2) return 1.0;

  // 部分一致（一方が他方に含まれる）
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // 文字列の長さが大きく異なる場合は類似度を下げる
  const lengthDiff = Math.abs(s1.length - s2.length);
  if (lengthDiff > Math.max(s1.length, s2.length) * 0.5) return 0.3;

  // 共通の単語を数える
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const commonWords = [...words1].filter((word) => words2.has(word));

  // 共通単語の割合を計算
  const totalWords = new Set([...words1, ...words2]).size;
  const similarity = commonWords.length / totalWords;

  return similarity;
};

const getReasonForLowValue = (node: WBSNode): string => {
  if (node.status === 'completed' && node.deliverables.length === 0) {
    return '完了済みですが成果物が定義されていません';
  }
  if (node.estimatedHours < 1) {
    return '工数が1時間未満の細かすぎるタスクです';
  }
  if (node.progress === 0 && new Date(node.endDate) < new Date()) {
    return '期限切れで進捗がないタスクです';
  }
  return '低価値タスクと判定されました';
};

const calculateConfidenceForLowValue = (node: WBSNode): number => {
  let confidence = 50;

  if (node.status === 'completed' && node.deliverables.length === 0) {
    confidence += 30;
  }
  if (node.estimatedHours < 0.5) {
    confidence += 20;
  }
  if (node.dependencies.length === 0 && node.level > 2) {
    confidence += 10;
  }

  return Math.min(confidence, 90);
};

const findSequentialTasks = (siblings: WBSNode[]): WBSNode[][] => {
  const groups: WBSNode[][] = [];
  const sorted = siblings.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  let currentGroup: WBSNode[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (currentGroup.length === 0) {
      currentGroup.push(sorted[i]);
    } else {
      const lastEnd = new Date(currentGroup[currentGroup.length - 1].endDate);
      const currentStart = new Date(sorted[i].startDate);
      const daysDiff = (currentStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 1 && sorted[i].duration <= 3) {
        currentGroup.push(sorted[i]);
      } else {
        if (currentGroup.length >= 2) {
          groups.push([...currentGroup]);
        }
        currentGroup = [sorted[i]];
      }
    }
  }

  if (currentGroup.length >= 2) {
    groups.push(currentGroup);
  }

  return groups;
};

const groupByAssignee = (tasks: WBSNode[]): WBSNode[][] => {
  const assigneeMap = new Map<string, WBSNode[]>();

  tasks.forEach((task) => {
    task.assignees.forEach((assignee) => {
      const group = assigneeMap.get(assignee) || [];
      group.push(task);
      assigneeMap.set(assignee, group);
    });
  });

  return Array.from(assigneeMap.values()).filter((group) => group.length >= 2);
};

const areSimilarTasks = (tasks: WBSNode[]): boolean => {
  // タスク名の類似度をチェック
  for (let i = 0; i < tasks.length - 1; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const similarity = calculateSimilarity(tasks[i].name, tasks[j].name);
      if (similarity > 0.7) return true;
    }
  }
  return false;
};

const getOptimizationReason = (node: WBSNode): string => {
  if (node.actualHours > 0 && node.estimatedHours > node.actualHours * 2) {
    return '見積もりが実績の2倍以上です';
  }
  if (node.dependencies.length > 3) {
    return '依存関係が複雑すぎます';
  }
  return '最適化の余地があります';
};

const getOptimizationAction = (node: WBSNode): string => {
  if (node.actualHours > 0 && node.estimatedHours > node.actualHours * 2) {
    return '見積もりを実績に基づいて調整';
  }
  if (node.dependencies.length > 3) {
    return '依存関係を整理';
  }
  return '構造を簡素化';
};

const calculateTimeSaving = (nodes: WBSNode[], suggestions: CleanupSuggestion[]): number => {
  let totalSaving = 0;

  suggestions.forEach((suggestion) => {
    if (suggestion.type === 'delete') {
      suggestion.nodeIds.forEach((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          totalSaving += node.estimatedHours;
        }
      });
    } else if (suggestion.type === 'merge') {
      // 統合による管理オーバーヘッドの削減（推定）
      totalSaving += suggestion.nodeIds.length * 0.5;
    }
  });

  return Math.round(totalSaving);
};

const calculateCostSaving = (nodes: WBSNode[], suggestions: CleanupSuggestion[]): number => {
  let totalSaving = 0;

  suggestions.forEach((suggestion) => {
    if (suggestion.type === 'delete') {
      suggestion.nodeIds.forEach((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          totalSaving += node.budget;
        }
      });
    }
  });

  return Math.round(totalSaving);
};

const generateCleanupSummary = (nodes: WBSNode[], suggestions: CleanupSuggestion[]): string => {
  const deleteCount = suggestions.filter((s) => s.type === 'delete').length;
  const mergeCount = suggestions.filter((s) => s.type === 'merge').length;
  const optimizeCount = suggestions.filter((s) => s.type === 'optimize').length;

  const parts = [];
  if (deleteCount > 0) parts.push(`${deleteCount}個の削除提案`);
  if (mergeCount > 0) parts.push(`${mergeCount}個の統合提案`);
  if (optimizeCount > 0) parts.push(`${optimizeCount}個の最適化提案`);

  return `分析の結果、${parts.join('、')}が見つかりました。これらを適用することで、プロジェクトの効率を大幅に改善できます。`;
};

export default WBSCleanupDialog;
