import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BrainCircuit, Tag, Sparkles, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// TaskTypeをenumとして定義
export enum TaskType {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  SHOPPING = 'SHOPPING',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  FINANCE = 'FINANCE',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

// カテゴリルールの型定義
interface CategoryRule {
  id: string;
  keywords: string[];
  category: TaskType;
  priority?: number;
  isActive: boolean;
}

interface TaskAutoCategorizerProps {
  isPremium: boolean;
  onUpgrade: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * タスク自動カテゴリ分類コンポーネント
 * キーワードに基づいて新規タスクを自動的に分類するプレミアム機能
 */
export const TaskAutoCategorizer: React.FC<TaskAutoCategorizerProps> = ({
  isPremium,
  onUpgrade,
  isEnabled,
  onToggle,
}) => {
  // デフォルトのカテゴリルール
  const defaultRules: CategoryRule[] = [
    {
      id: '1',
      keywords: ['会議', 'ミーティング', '打ち合わせ', 'call', 'zoom'],
      category: TaskType.WORK,
      priority: 2,
      isActive: true,
    },
    {
      id: '2',
      keywords: ['買い物', '購入', 'スーパー', 'コンビニ', '食料'],
      category: TaskType.SHOPPING,
      priority: 1,
      isActive: true,
    },
    {
      id: '3',
      keywords: ['健康', '運動', 'ジム', 'トレーニング', '病院', '医者'],
      category: TaskType.HEALTH,
      priority: 3,
      isActive: true,
    },
  ];

  // 状態管理
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>(defaultRules);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<CategoryRule>>({
    keywords: [],
    category: TaskType.WORK,
    priority: 2,
    isActive: true,
  });
  const [newKeyword, setNewKeyword] = useState<string>('');

  // カテゴリの表示名を取得
  const getCategoryDisplayName = (category: TaskType): string => {
    switch (category) {
      case TaskType.WORK:
        return '仕事';
      case TaskType.PERSONAL:
        return '個人';
      case TaskType.SHOPPING:
        return '買い物';
      case TaskType.HEALTH:
        return '健康';
      case TaskType.EDUCATION:
        return '教育';
      case TaskType.FINANCE:
        return '金融';
      case TaskType.SOCIAL:
        return '社交';
      case TaskType.OTHER:
        return 'その他';
      default:
        return 'その他';
    }
  };

  // カテゴリの色を取得
  const getCategoryColor = (category: TaskType): string => {
    switch (category) {
      case TaskType.WORK:
        return 'bg-blue-100 text-blue-800';
      case TaskType.PERSONAL:
        return 'bg-purple-100 text-purple-800';
      case TaskType.SHOPPING:
        return 'bg-green-100 text-green-800';
      case TaskType.HEALTH:
        return 'bg-red-100 text-red-800';
      case TaskType.EDUCATION:
        return 'bg-amber-100 text-amber-800';
      case TaskType.FINANCE:
        return 'bg-emerald-100 text-emerald-800';
      case TaskType.SOCIAL:
        return 'bg-pink-100 text-pink-800';
      case TaskType.OTHER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 優先度の表示名を取得
  const getPriorityDisplayName = (priority?: number): string => {
    switch (priority) {
      case 1:
        return '低';
      case 2:
        return '中';
      case 3:
        return '高';
      case 4:
        return '最高';
      default:
        return '未設定';
    }
  };

  // 新しいキーワードを追加
  const addKeyword = () => {
    if (!newKeyword || newKeyword.trim() === '') return;

    if (isEditing) {
      // 既存ルールの編集
      setCategoryRules((prev) =>
        prev.map((rule) =>
          rule.id === isEditing
            ? { ...rule, keywords: [...rule.keywords, newKeyword.trim()] }
            : rule
        )
      );
    } else {
      // 新規ルールの作成
      setNewRule((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()],
      }));
    }

    setNewKeyword('');
  };

  // キーワードを削除
  const removeKeyword = (ruleId: string | null, keyword: string) => {
    if (ruleId) {
      // 既存ルールのキーワード削除
      setCategoryRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId
            ? { ...rule, keywords: rule.keywords.filter((k) => k !== keyword) }
            : rule
        )
      );
    } else {
      // 新規ルールのキーワード削除
      setNewRule((prev) => ({
        ...prev,
        keywords: (prev.keywords || []).filter((k) => k !== keyword),
      }));
    }
  };

  // 新しいルールを保存
  const saveNewRule = () => {
    if (!newRule.keywords?.length || !newRule.category) return;

    const newId = Date.now().toString();
    setCategoryRules((prev) => [
      ...prev,
      {
        id: newId,
        keywords: newRule.keywords || [],
        category: newRule.category as TaskType,
        priority: newRule.priority || 2,
        isActive: newRule.isActive === undefined ? true : newRule.isActive,
      },
    ]);

    // 新規ルールをリセット
    setNewRule({
      keywords: [],
      category: TaskType.WORK,
      priority: 2,
      isActive: true,
    });
  };

  // ルールを削除
  const deleteRule = (ruleId: string) => {
    setCategoryRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    if (isEditing === ruleId) {
      setIsEditing(null);
    }
  };

  // ルールの編集を開始
  const startEditing = (ruleId: string) => {
    setIsEditing(ruleId);
    setNewKeyword('');
  };

  // ルールの編集を保存
  const saveEditedRule = (ruleId: string, field: string, value: any) => {
    setCategoryRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, [field]: value } : rule))
    );
  };

  // ルールの編集を終了
  const finishEditing = () => {
    setIsEditing(null);
    setNewKeyword('');
  };

  // ルールのオン/オフを切り替え
  const toggleRuleActive = (ruleId: string) => {
    setCategoryRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule))
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-purple-600" />
              タスク自動カテゴリ分類
              {isPremium && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-amber-100 text-amber-800 border-amber-200"
                >
                  プレミアム
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              キーワードに基づいて新規タスクを自動的にカテゴリ分類します
            </CardDescription>
          </div>

          {isPremium ? (
            <div className="flex items-center space-x-2">
              <Switch id="auto-categorize" checked={isEnabled} onCheckedChange={onToggle} />
              <Label htmlFor="auto-categorize" className="text-sm">
                {isEnabled ? '有効' : '無効'}
              </Label>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200"
              onClick={onUpgrade}
            >
              <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
              <span className="text-xs">プレミアム限定</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isPremium ? (
          <>
            <div className="mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">状態</TableHead>
                    <TableHead>キーワード</TableHead>
                    <TableHead className="w-24">カテゴリ</TableHead>
                    <TableHead className="w-20">優先度</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleActive(rule.id)}
                          className="scale-75"
                        />
                      </TableCell>
                      <TableCell>
                        {isEditing === rule.id ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            {rule.keywords.map((keyword) => (
                              <Badge
                                key={keyword}
                                variant="outline"
                                className="flex items-center gap-1 bg-gray-50"
                              >
                                <span>{keyword}</span>
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeKeyword(rule.id, keyword)}
                                />
                              </Badge>
                            ))}
                            <div className="flex items-center mt-1">
                              <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                className="h-7 text-xs mr-1 w-24"
                                placeholder="新キーワード"
                                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={addKeyword}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {rule.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="bg-gray-50">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing === rule.id ? (
                          <Select
                            value={rule.category}
                            onValueChange={(value) => saveEditedRule(rule.id, 'category', value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="カテゴリ" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(TaskType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {getCategoryDisplayName(type as TaskType)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getCategoryColor(rule.category)}>
                            {getCategoryDisplayName(rule.category)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing === rule.id ? (
                          <Select
                            value={rule.priority?.toString()}
                            onValueChange={(value) =>
                              saveEditedRule(rule.id, 'priority', parseInt(value))
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="優先度" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">低</SelectItem>
                              <SelectItem value="2">中</SelectItem>
                              <SelectItem value="3">高</SelectItem>
                              <SelectItem value="4">最高</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{getPriorityDisplayName(rule.priority)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {isEditing === rule.id ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => finishEditing()}
                            >
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => startEditing(rule.id)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                新しいルールを追加
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <Label htmlFor="new-category" className="text-xs mb-1 block">
                    カテゴリ
                  </Label>
                  <Select
                    value={newRule.category}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, category: value as TaskType })
                    }
                  >
                    <SelectTrigger id="new-category" className="text-xs">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getCategoryDisplayName(type as TaskType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="new-priority" className="text-xs mb-1 block">
                    優先度
                  </Label>
                  <Select
                    value={newRule.priority?.toString()}
                    onValueChange={(value) => setNewRule({ ...newRule, priority: parseInt(value) })}
                  >
                    <SelectTrigger id="new-priority" className="text-xs">
                      <SelectValue placeholder="優先度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">低</SelectItem>
                      <SelectItem value="2">中</SelectItem>
                      <SelectItem value="3">高</SelectItem>
                      <SelectItem value="4">最高</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="new-active"
                        checked={newRule.isActive}
                        onCheckedChange={(checked) => setNewRule({ ...newRule, isActive: checked })}
                      />
                      <Label htmlFor="new-active" className="text-xs">
                        有効にする
                      </Label>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={saveNewRule}
                      disabled={!newRule.keywords?.length}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">保存</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="new-keywords" className="text-xs mb-1 block">
                  キーワード
                </Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {newRule.keywords?.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="flex items-center gap-1 bg-gray-50"
                    >
                      <span>{keyword}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeKeyword(null, keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex">
                  <Input
                    id="new-keywords"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="text-xs mr-2"
                    placeholder="キーワードを入力（例: 会議, ミーティング, 打ち合わせ）"
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">追加</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="bg-purple-100 rounded-full p-3 mb-4">
              <Tag className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">自動カテゴリ分類</h3>
            <p className="text-sm text-gray-500 text-center mb-4 max-w-md">
              キーワードに基づいて新規タスクを自動的に分類します。タスク追加時の手間を省き、効率的なタスク管理を実現します。
            </p>
            <ul className="space-y-2 mb-6 w-full max-w-md">
              <li className="flex items-start">
                <span className="text-green-500 mr-2"></span>
                <span className="text-sm">キーワードに基づく自動カテゴリ分類</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2"></span>
                <span className="text-sm">カスタムルールの作成と編集</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2"></span>
                <span className="text-sm">優先度の自動設定</span>
              </li>
            </ul>
            <Button onClick={onUpgrade}>
              <Sparkles className="h-4 w-4 mr-2" />
              プレミアムにアップグレード
            </Button>
          </div>
        )}
      </CardContent>

      {isPremium && (
        <CardFooter className="bg-gray-50 border-t">
          <p className="text-xs text-gray-500">
            <BrainCircuit className="h-3 w-3 inline mr-1" />
            タスクの自動カテゴリ分類は、入力されたタスク名に含まれるキーワードを分析し、最適なカテゴリと優先度を自動的に設定します。
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
