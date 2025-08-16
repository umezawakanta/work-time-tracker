import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '@/store';
import { addTodoItem, autoSortTodos } from '@/store/todoSlice';
import { getErrorMessage } from '../../utils/errorUtils';
import taskAnalyzer from '@/services/RateLimitedTaskAnalyzer';
import WBSService from '@/services/wbs/WBSService';
import { WBSNode } from '@/types/wbs';
import QuadrantClassificationService from '@/services/ai/QuadrantClassificationService';

export type TodoType = 'input' | 'output' | 'personal' | 'work' | 'study' | 'health' | 'other';
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

export interface FormData {
  text: string;
  description: string;
  type: TodoType;
  priority: PriorityLevel;
  deadline: string;
  estimatedDuration: number;
  category: string;
  tags: readonly string[];
  isPrioritized: boolean;
  linkToWBS: boolean;
  wbsProjectId?: string;
}

const initialFormData: FormData = {
  text: '',
  description: '',
  type: 'input',
  priority: 3,
  deadline: '',
  estimatedDuration: 60,
  category: '',
  tags: [],
  isPrioritized: false,
  linkToWBS: false,
  wbsProjectId: 'site-dev-project',
};

export const useTodoForm = (onClose: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggestingDeadline, setIsSuggestingDeadline] = useState(false);
  const [autoSuggestDeadline, setAutoSuggestDeadline] = useState(
    localStorage.getItem('autoSuggestDeadline') === 'true' || false
  );
  const [isSuggestingType, setIsSuggestingType] = useState(false);
  const [autoSuggestType, setAutoSuggestType] = useState(
    localStorage.getItem('autoSuggestType') === 'true' || false
  );
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [autoSuggestPriority, setAutoSuggestPriority] = useState(
    localStorage.getItem('autoSuggestPriority') === 'true' || false
  );
  const [isSuggestingAll, setIsSuggestingAll] = useState(false);
  const [autoSuggestAll, setAutoSuggestAll] = useState(
    localStorage.getItem('autoSuggestAll') === 'true' || false
  );
  const [classificationService] = useState(() => QuadrantClassificationService.getInstance());
  const [deadlineSuggestTimer, setDeadlineSuggestTimer] = useState<NodeJS.Timeout | null>(null);
  const [typeSuggestTimer, setTypeSuggestTimer] = useState<NodeJS.Timeout | null>(null);
  const [prioritySuggestTimer, setPrioritySuggestTimer] = useState<NodeJS.Timeout | null>(null);
  const [allSuggestTimer, setAllSuggestTimer] = useState<NodeJS.Timeout | null>(null);

  const handleAIAnalysis = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 完全な分析を実行（タイプ、優先度、詳細情報）
      const analysisResult = await taskAnalyzer.analyzeComplete(formData.text);

      if (analysisResult) {
        // タイプの分析結果を反映
        if (analysisResult.typeAnalysis) {
          const type = analysisResult.typeAnalysis.type.toLowerCase() as TodoType;
          setFormData((prev) => ({ ...prev, type }));
        }

        // 優先度の分析結果を反映
        if (analysisResult.priorityAnalysis) {
          const { importance, urgency, isPrioritized } = analysisResult.priorityAnalysis;

          // 優先度を計算
          const averageScore = (importance + urgency) / 2;
          let priority: PriorityLevel = 3;

          if (averageScore >= 9) priority = 5;
          else if (averageScore >= 7) priority = 4;
          else if (averageScore >= 5) priority = 3;
          else if (averageScore >= 3) priority = 2;
          else priority = 1;

          setFormData((prev) => ({ ...prev, priority }));

          if (isPrioritized) {
            setFormData((prev) => ({ ...prev, isPrioritized: true }));
          }
        }

        // 詳細分析結果を反映
        if (analysisResult.detailAnalysis) {
          const { description, category, tags, estimatedDuration, deadline } =
            analysisResult.detailAnalysis;

          // 説明を設定
          if (description && description !== formData.text) {
            setFormData((prev) => ({ ...prev, description }));
          }

          // カテゴリを設定
          if (category && category !== 'その他') {
            setFormData((prev) => ({ ...prev, category }));
          }

          // タグを設定
          if (tags && tags.length > 0) {
            setFormData((prev) => ({ ...prev, tags }));
          }

          // 推定所要時間を設定
          if (estimatedDuration && estimatedDuration !== 60) {
            setFormData((prev) => ({ ...prev, estimatedDuration }));
          }

          // 期限を設定
          if (deadline) {
            // ISO日付形式をHTMLのdatetime-local形式に変換
            const deadlineDate = new Date(deadline);
            const localDatetime = deadlineDate.toISOString().slice(0, 16);
            setFormData((prev) => ({ ...prev, deadline: localDatetime }));
          }

          // 分析の確信度が高い場合はメッセージを表示
          if (analysisResult.detailAnalysis.confidence > 0.7) {
            toast.success('AI分析により、タスクの詳細情報を自動設定しました！');
          } else {
            toast.success('AI分析を実行しました。必要に応じて詳細を調整してください。');
          }
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('AI分析に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData.text]);

  const handleSuggestDeadline = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsSuggestingDeadline(true);
    try {
      const suggestion = await classificationService.suggestDeadline({
        title: formData.text,
        description: formData.description,
        priority: formData.priority,
        type: formData.type,
        estimatedTime: formData.estimatedDuration,
      });

      if (suggestion) {
        // 日付をdatetime-local形式に変換
        const localDatetime = suggestion.deadline.toISOString().slice(0, 16);
        setFormData((prev) => ({ ...prev, deadline: localDatetime }));

        // 確信度に応じたメッセージ
        if (suggestion.confidence > 0.7) {
          toast.success(`期限を自動設定しました: ${suggestion.reasoning}`);
        } else {
          toast(`期限を提案しました: ${suggestion.reasoning}`);
        }
      }
    } catch (error) {
      console.error('Deadline suggestion error:', error);
      toast.error('期限の提案に失敗しました');
    } finally {
      setIsSuggestingDeadline(false);
    }
  }, [formData, classificationService]);

  const handleSuggestType = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsSuggestingType(true);
    try {
      const suggestion = await classificationService.suggestTaskType({
        title: formData.text,
        description: formData.description,
        priority: formData.priority,
        currentType: formData.type,
      });

      if (suggestion) {
        setFormData((prev) => ({ ...prev, type: suggestion.type as TodoType }));

        // 確信度に応じたメッセージ
        if (suggestion.confidence > 0.7) {
          toast.success(`タイプを自動設定しました: ${suggestion.reasoning}`, {
            duration: 3000,
            icon: '🎯',
          });
        } else {
          toast(`タイプを提案しました: ${suggestion.reasoning}`, {
            duration: 3000,
            icon: '💡',
          });
        }
      }
    } catch (error) {
      console.error('Type suggestion error:', error);
      toast.error('タイプの提案に失敗しました');
    } finally {
      setIsSuggestingType(false);
    }
  }, [formData, classificationService]);

  const handleSuggestPriority = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsSuggestingPriority(true);
    try {
      const suggestion = await classificationService.suggestPriority({
        title: formData.text,
        description: formData.description,
        type: formData.type,
        deadline: formData.deadline,
      });

      if (suggestion) {
        setFormData((prev) => ({ ...prev, priority: suggestion.priority as PriorityLevel }));

        // 確信度に応じたメッセージ
        if (suggestion.confidence > 0.7) {
          toast.success(`優先度を自動設定しました: ${suggestion.reasoning}`, {
            duration: 3000,
            icon: '⭐',
          });
        } else {
          toast(`優先度を提案しました: ${suggestion.reasoning}`, {
            duration: 3000,
            icon: '💫',
          });
        }
      }
    } catch (error) {
      console.error('Priority suggestion error:', error);
      toast.error('優先度の提案に失敗しました');
    } finally {
      setIsSuggestingPriority(false);
    }
  }, [formData, classificationService]);

  const handleSuggestAll = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsSuggestingAll(true);
    try {
      const suggestions = await classificationService.suggestAllFields({
        title: formData.text,
        description: formData.description,
      });

      if (suggestions) {
        // すべての項目を一度に設定
        const localDatetime = suggestions.deadline.toISOString().slice(0, 16);
        setFormData((prev) => ({
          ...prev,
          type: suggestions.type as TodoType,
          priority: suggestions.priority as PriorityLevel,
          deadline: localDatetime,
        }));

        // 結果メッセージを表示
        if (suggestions.confidence > 0.7) {
          toast.success(
            `AIが自動設定しました！\n` +
              `タイプ: ${suggestions.type}\n` +
              `優先度: ${suggestions.priority}\n` +
              `期限: ${suggestions.deadline.toLocaleDateString('ja-JP')}`,
            {
              duration: 5000,
              icon: '🎯',
            }
          );
        } else {
          toast(
            `AIが提案しました\n` +
              `タイプ: ${suggestions.type}\n` +
              `優先度: ${suggestions.priority}\n` +
              `期限: ${suggestions.deadline.toLocaleDateString('ja-JP')}`,
            {
              duration: 5000,
              icon: '💡',
            }
          );
        }
      }
    } catch (error) {
      console.error('All fields suggestion error:', error);
      toast.error('自動設定に失敗しました');
    } finally {
      setIsSuggestingAll(false);
    }
  }, [formData.text, formData.description, classificationService]);

  const validateForm = useCallback((): boolean => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return false;
    }

    if (formData.text.length > 100) {
      toast.error('タスク名は100文字以内で入力してください');
      return false;
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      toast.error('期限は現在時刻より後に設定してください');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        const newTodo = {
          task: formData.text.trim(),
          priority: formData.priority,
          isPrioritized: formData.isPrioritized,
          type: formData.type,
          deadline: formData.deadline || undefined,
        };

        // タスクタイプをinput/outputにマッピング
        const mappedType: 'input' | 'output' =
          formData.type === 'work' || formData.type === 'study' || formData.type === 'input'
            ? 'input'
            : 'output';

        // ToDoを作成
        await dispatch(
          addTodoItem({
            ...newTodo,
            type: mappedType,
          })
        ).unwrap();

        // AIによる自動タスク並び替え（オプション機能として実装）
        if (window.localStorage.getItem('enableAutoSort') !== 'false') {
          // タスク並び替えを非同期で実行（UIをブロックしない）
          setTimeout(() => {
            dispatch(autoSortTodos())
              .then((result) => {
                if (autoSortTodos.fulfilled.match(result)) {
                  const { reasoning } = result.payload;
                  if (
                    reasoning &&
                    reasoning !== 'デフォルトの優先度と締切に基づいて並び替えました。'
                  ) {
                    toast.success(`タスクを最適な順序に並び替えました: ${reasoning}`, {
                      duration: 5000,
                      icon: '🤖',
                    });
                  }
                }
              })
              .catch((error) => {
                console.error('自動並び替えエラー:', error);
              });
          }, 500);
        }

        // WBS連携が有効な場合
        if (formData.linkToWBS && formData.wbsProjectId) {
          try {
            const userId = 'current-user'; // 実際のユーザーIDを取得する必要があります

            // ToDoタスクをWBSノードに変換
            const wbsNode: Partial<WBSNode> = {
              projectId: formData.wbsProjectId,
              parentId: null,
              name: formData.text.trim(),
              description: formData.description || '',
              level: 0,
              orderIndex: 999,
              startDate: new Date().toISOString(),
              endDate:
                formData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              duration: Math.ceil(formData.estimatedDuration / 60),
              progress: 0,
              status: formData.isPrioritized ? 'in-progress' : 'not-started',
              assignees: [userId],
              dependencies: [],
              estimatedHours: Math.ceil(formData.estimatedDuration / 60),
              actualHours: 0,
              budget: 0,
              actualCost: 0,
              deliverables: formData.tags ? [...formData.tags] : [],
              risks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: userId,
              color: formData.type === 'output' ? '#3b82f6' : '#10b981',
              icon: formData.type === 'output' ? '📤' : '📥',
            };

            await WBSService.createNode(wbsNode, userId);
            toast.success('タスクをWBSにも追加しました！');
          } catch (wbsError) {
            console.error('WBS連携エラー:', wbsError);
            toast.error('WBSへの追加に失敗しました。タスクは作成されています。');
          }
        }

        toast.success('タスクを追加しました！');
        setFormData(initialFormData);
        onClose();
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(`タスクの追加に失敗しました: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, dispatch, onClose, validateForm]
  );

  const handleReset = useCallback((): void => {
    setFormData(initialFormData);
  }, []);

  const toggleAutoSuggestDeadline = useCallback((): void => {
    const newValue = !autoSuggestDeadline;
    setAutoSuggestDeadline(newValue);
    localStorage.setItem('autoSuggestDeadline', String(newValue));
    toast(newValue ? '自動期限提案を有効にしました' : '自動期限提案を無効にしました');
  }, [autoSuggestDeadline]);

  const toggleAutoSuggestType = useCallback((): void => {
    const newValue = !autoSuggestType;
    setAutoSuggestType(newValue);
    localStorage.setItem('autoSuggestType', String(newValue));
    toast(newValue ? '自動タイプ提案を有効にしました' : '自動タイプ提案を無効にしました');
  }, [autoSuggestType]);

  const toggleAutoSuggestPriority = useCallback((): void => {
    const newValue = !autoSuggestPriority;
    setAutoSuggestPriority(newValue);
    localStorage.setItem('autoSuggestPriority', String(newValue));
    toast(newValue ? '自動優先度提案を有効にしました' : '自動優先度提案を無効にしました');
  }, [autoSuggestPriority]);

  const toggleAutoSuggestAll = useCallback((): void => {
    const newValue = !autoSuggestAll;
    setAutoSuggestAll(newValue);
    localStorage.setItem('autoSuggestAll', String(newValue));
    toast(newValue ? 'AI自動設定を有効にしました' : 'AI自動設定を無効にしました');
  }, [autoSuggestAll]);

  // 適切な位置で handleInputChange を定義（他の関数がすべて定義された後）
  const handleInputChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]): void => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // タイトル入力時に自動提案を実行
      if (field === 'text' && typeof value === 'string' && value.length > 3) {
        // すべて自動設定が有効な場合
        if (autoSuggestAll && value.length > 8) {
          // 既存のタイマーをクリア
          if (allSuggestTimer) {
            clearTimeout(allSuggestTimer);
          }
          // 2秒後にすべての項目を提案
          const timer = setTimeout(() => {
            handleSuggestAll();
          }, 2000);
          setAllSuggestTimer(timer);
        } else {
          // 個別の自動提案
          // タイプの自動提案
          if (autoSuggestType && value.length > 5) {
            if (typeSuggestTimer) clearTimeout(typeSuggestTimer);
            const timer = setTimeout(() => {
              handleSuggestType();
            }, 1000);
            setTypeSuggestTimer(timer);
          }

          // 優先度の自動提案
          if (autoSuggestPriority && value.length > 7) {
            if (prioritySuggestTimer) clearTimeout(prioritySuggestTimer);
            const timer = setTimeout(() => {
              handleSuggestPriority();
            }, 1200);
            setPrioritySuggestTimer(timer);
          }

          // 期限の自動提案
          if (autoSuggestDeadline && !formData.deadline && value.length > 10) {
            if (deadlineSuggestTimer) clearTimeout(deadlineSuggestTimer);
            const timer = setTimeout(() => {
              handleSuggestDeadline();
            }, 1500);
            setDeadlineSuggestTimer(timer);
          }
        }
      }
    },
    [
      formData.deadline,
      autoSuggestAll,
      autoSuggestDeadline,
      autoSuggestType,
      autoSuggestPriority,
      allSuggestTimer,
      deadlineSuggestTimer,
      typeSuggestTimer,
      prioritySuggestTimer,
      handleSuggestAll,
      handleSuggestDeadline,
      handleSuggestType,
      handleSuggestPriority,
    ]
  );

  return {
    formData,
    isSubmitting,
    isAnalyzing,
    isSuggestingDeadline,
    isSuggestingType,
    isSuggestingPriority,
    isSuggestingAll,
    autoSuggestDeadline,
    autoSuggestType,
    autoSuggestPriority,
    autoSuggestAll,
    handleInputChange,
    handleAIAnalysis,
    handleSuggestDeadline,
    handleSuggestType,
    handleSuggestPriority,
    handleSuggestAll,
    handleSubmit,
    handleReset,
    toggleAutoSuggestDeadline,
    toggleAutoSuggestType,
    toggleAutoSuggestPriority,
    toggleAutoSuggestAll,
  };
};
