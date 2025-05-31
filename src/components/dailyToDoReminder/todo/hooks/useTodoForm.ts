import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '@/store';
import { addTodoItem } from '@/store/todoSlice';
import { getErrorMessage } from '../../utils/errorUtils';
import taskAnalyzer from '@/services/RateLimitedTaskAnalyzer';

export type TodoType = 'input' | 'output';
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
};

export const useTodoForm = (onClose: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]): void => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAIAnalysis = useCallback(async (): Promise<void> => {
    if (!formData.text.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await taskAnalyzer.analyzeBoth(formData.text);

      if (analysisResult) {
        // タイプの分析結果を反映
        if (analysisResult.typeAnalysis) {
          const type = analysisResult.typeAnalysis.type.toLowerCase() as TodoType;
          handleInputChange('type', type);

          if (analysisResult.typeAnalysis.confidence > 0.7) {
            toast.success(
              `タスクタイプを「${type === 'input' ? 'インプット' : 'アウトプット'}」に設定しました`
            );
          }
        }

        // 優先度の分析結果を反映
        if (analysisResult.priorityAnalysis) {
          const { importance, urgency, isPrioritized, explanation } =
            analysisResult.priorityAnalysis;

          // 優先度を計算
          const averageScore = (importance + urgency) / 2;
          let priority: PriorityLevel = 3;

          if (averageScore >= 9) priority = 5;
          else if (averageScore >= 7) priority = 4;
          else if (averageScore >= 5) priority = 3;
          else if (averageScore >= 3) priority = 2;
          else priority = 1;

          handleInputChange('priority', priority);

          if (isPrioritized) {
            handleInputChange('isPrioritized', true);
          }

          if (explanation) {
            toast.success(explanation);
          }
        }

        toast.success('AIがタスクを分析しました！');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('AI分析に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData.text, handleInputChange]);

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

        await dispatch(addTodoItem(newTodo)).unwrap();

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

  return {
    formData,
    isSubmitting,
    isAnalyzing,
    handleInputChange,
    handleAIAnalysis,
    handleSubmit,
    handleReset,
  };
};
