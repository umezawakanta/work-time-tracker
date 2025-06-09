import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Download,
  Copy,
  AlertCircle,
  CheckCircle,
  Target,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import WBSService, {
  WBSGenerationRequest,
  WBSGenerationResult,
  WBSProject,
  WBSNode,
} from '@/services/ai/wbsService';
import { useAuth } from '@/hooks/useAuth';

interface WBSGeneratorProps {
  onWBSGenerated?: (result: WBSGenerationResult) => void;
}

const WBSGenerator: React.FC<WBSGeneratorProps> = ({ onWBSGenerated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<WBSGenerationRequest>({
    projectName: '',
    projectGoal: '',
    projectScope: '',
    timeline: '',
    methodology: 'hybrid',
    teamSize: 3,
    budget: 0,
    constraints: [],
  });

  const [constraintInput, setConstraintInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<WBSGenerationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // フォーム入力の処理
  const handleInputChange = (field: keyof WBSGenerationRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 制約条件の追加
  const addConstraint = () => {
    if (constraintInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        constraints: [...(prev.constraints || []), constraintInput.trim()],
      }));
      setConstraintInput('');
    }
  };

  // 制約条件の削除
  const removeConstraint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints?.filter((_, i) => i !== index) || [],
    }));
  };

  // WBS生成の実行
  const generateWBS = async () => {
    if (!formData.projectName.trim() || !formData.projectGoal.trim()) {
      toast.error('プロジェクト名と目標は必須です');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await WBSService.generateWBS(formData);
      setGenerationResult(result);
      onWBSGenerated?.(result);
      toast.success(`WBSを生成しました！総工数: ${result.project.totalEstimatedHours}時間`);
    } catch (error) {
      console.error('WBS generation error:', error);
      toast.error('WBS生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  // WBSツリーを再帰的に表示
  const renderWBSTree = (node: WBSNode, depth = 0) => {
    const indentStyle = { paddingLeft: `${depth * 20}px` };

    return (
      <div key={node.id} className="space-y-2">
        <div
          className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
          style={indentStyle}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{node.title}</h4>
              <Badge variant={getPriorityVariant(node.priority)}>優先度{node.priority}</Badge>
              <Badge variant="outline">{node.estimatedHours}h</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{node.description}</p>
            {node.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.deliverables.map((deliverable, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {deliverable}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <Badge variant={getStatusVariant(node.status)} className="mb-1">
              {getStatusLabel(node.status)}
            </Badge>
          </div>
        </div>

        {node.children.map((child) => renderWBSTree(child, depth + 1))}
      </div>
    );
  };

  // 優先度に応じたバッジ色
  const getPriorityVariant = (priority: number) => {
    if (priority <= 2) return 'destructive';
    if (priority <= 3) return 'default';
    return 'secondary';
  };

  // ステータスに応じたバッジ色
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // ステータスラベル
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started':
        return '未着手';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      case 'blocked':
        return 'ブロック';
      default:
        return status;
    }
  };

  // タスクリストをCSVでダウンロード
  const downloadTasksCSV = () => {
    if (!generationResult) return;

    const csvContent = [
      ['タスク名', '説明', '優先度', '予定時間', '期限', 'タグ'],
      ...generationResult.tasks.map((task) => [
        task.task,
        task.note || '',
        task.priority.toString(),
        task.estimatedDuration ? `${task.estimatedDuration}分` : '',
        task.deadline || '',
        task.tags?.join(';') || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${formData.projectName}_tasks.csv`;
    link.click();
  };

  // WBSをJSON形式でコピー
  const copyWBSToClipboard = () => {
    if (!generationResult) return;

    const wbsData = {
      project: generationResult.project,
      tasks: generationResult.tasks,
      recommendations: generationResult.recommendations,
      riskFactors: generationResult.riskFactors,
    };

    navigator.clipboard.writeText(JSON.stringify(wbsData, null, 2));
    toast.success('WBSデータをクリップボードにコピーしました');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            AI WBS生成ツール
          </CardTitle>
          <p className="text-muted-foreground">
            プロジェクト名と目標を入力するだけで、AIが自動的に作業分解構造（WBS）を生成します
          </p>
        </CardHeader>
      </Card>

      {/* 入力フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">プロジェクト名 *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="例: ECサイト開発プロジェクト"
              />
            </div>
            <div>
              <Label htmlFor="methodology">開発手法</Label>
              <Select
                value={formData.methodology}
                onValueChange={(value) => handleInputChange('methodology', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waterfall">ウォーターフォール</SelectItem>
                  <SelectItem value="agile">アジャイル</SelectItem>
                  <SelectItem value="hybrid">ハイブリッド</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="projectGoal">プロジェクト目標 *</Label>
            <Textarea
              id="projectGoal"
              value={formData.projectGoal}
              onChange={(e) => handleInputChange('projectGoal', e.target.value)}
              placeholder="例: 顧客の購入体験を向上させるオンラインショッピングサイトを構築し、売上を20%向上させる"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="projectScope">プロジェクトスコープ（オプション）</Label>
            <Textarea
              id="projectScope"
              value={formData.projectScope}
              onChange={(e) => handleInputChange('projectScope', e.target.value)}
              placeholder="例: ユーザー登録、商品検索、決済機能、管理画面を含む。モバイルアプリは対象外。"
              rows={2}
            />
          </div>

          {/* 詳細設定の切り替え */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            詳細設定 {showAdvanced ? '▲' : '▼'}
          </Button>

          {/* 詳細設定 */}
          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeline">タイムライン</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    placeholder="例: 6ヶ月"
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">チームサイズ</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">予算（円）</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 制約条件 */}
              <div>
                <Label>制約条件</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={constraintInput}
                    onChange={(e) => setConstraintInput(e.target.value)}
                    placeholder="制約条件を入力"
                    onKeyDown={(e) => e.key === 'Enter' && addConstraint()}
                  />
                  <Button type="button" onClick={addConstraint} variant="outline">
                    追加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.constraints?.map((constraint, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeConstraint(index)}
                    >
                      {constraint} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 生成ボタン */}
          <Button
            onClick={generateWBS}
            disabled={isGenerating || !formData.projectName.trim() || !formData.projectGoal.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                WBSを生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                WBSを生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 生成結果 */}
      {generationResult && (
        <div className="space-y-6">
          {/* プロジェクト概要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                プロジェクト概要
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">総工数</p>
                    <p className="font-semibold">
                      {generationResult.project.totalEstimatedHours}時間
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">開発手法</p>
                    <p className="font-semibold">{generationResult.project.methodology}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">信頼度</p>
                    <p className="font-semibold">
                      {Math.round(generationResult.project.confidence * 100)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">タスク数</p>
                    <p className="font-semibold">{generationResult.tasks.length}個</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 推奨事項とリスク */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generationResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  リスク要因
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generationResult.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* WBS構造 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>WBS構造</span>
                <div className="flex gap-2">
                  <Button onClick={copyWBSToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    コピー
                  </Button>
                  <Button onClick={downloadTasksCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    CSV出力
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">{renderWBSTree(generationResult.project.rootNode)}</div>
            </CardContent>
          </Card>

          {/* タスクリスト */}
          <Card>
            <CardHeader>
              <CardTitle>生成されたタスクリスト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generationResult.tasks.map((task, index) => (
                  <div key={task._id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.task}</h4>
                      {task.note && <p className="text-sm text-muted-foreground">{task.note}</p>}
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getPriorityVariant(task.priority)}>
                          優先度{task.priority}
                        </Badge>
                        {task.estimatedDuration && (
                          <Badge variant="outline">
                            {Math.round(task.estimatedDuration / 60)}時間
                          </Badge>
                        )}
                        {task.tags?.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      {task.deadline && (
                        <p className="text-sm text-muted-foreground">
                          期限: {new Date(task.deadline).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WBSGenerator;
