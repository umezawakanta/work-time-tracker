import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { WorkPreset } from '@/types';

interface CreatePresetParams {
  name: string;
  description: string;
  projectId: string;
  duration: number;
}

export function useWorkPresets() {
  const [presets, setPresets] = useState<WorkPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // エラーハンドリング関数
  const handleError = useCallback((err: unknown, context: string) => {
    let errorMessage = '不明なエラーが発生しました';
    
    if (err instanceof AxiosError) {
      // Axiosの特定のエラータイプ
      errorMessage = err.response?.data?.message || err.message;
    } else if (err instanceof Error) {
      // 一般的なErrorオブジェクト
      errorMessage = err.message;
    }

    console.error(`${context}:`, err);
    setError(errorMessage);

    // エラートーストは特定のエラーでのみ表示
    if (context === 'プリセット取得') {
      toast({
        title: 'エラー',
        description: 'プリセットの取得に失敗しました',
        variant: 'destructive'
      });
    }

    return errorMessage;
  }, [toast]);

  // プリセット一覧を取得
  const fetchPresets = useCallback(async () => {
    try {
      setIsLoadingPresets(true);
      const response = await axios.get('/api/presets');
      setPresets(response.data);
      setError(null);
    } catch (err: unknown) {
      handleError(err, 'プリセット取得');
    } finally {
      setIsLoadingPresets(false);
    }
  }, [handleError]);

  // 人気のプリセットを取得
  const fetchPopularPresets = useCallback(async () => {
    try {
      setIsLoadingPresets(true);
      const response = await axios.get('/api/presets/popular');
      setPresets(response.data);
      setError(null);
    } catch (err: unknown) {
      handleError(err, '人気プリセット取得');
    } finally {
      setIsLoadingPresets(false);
    }
  }, [handleError]);

  // 新しいプリセットを作成
  const createPreset = async (params: CreatePresetParams): Promise<WorkPreset> => {
    try {
      const response = await axios.post('/api/presets', params);
      const newPreset = response.data.preset;
      
      // ローカル状態を更新
      setPresets(prev => [...prev, newPreset]);
      
      return newPreset;
    } catch (err: unknown) {
      const errorMessage = handleError(err, 'プリセット作成');
      throw new Error(errorMessage);
    }
  };

  // プリセットを使用した際にカウンターを更新
  const updatePresetUsage = async (presetId: string) => {
    try {
      const response = await axios.put(`/api/presets/${presetId}/used`);
      const updatedPreset = response.data.preset;
      
      // ローカル状態を更新
      setPresets(prev => 
        prev.map(preset => 
          preset.id === presetId 
            ? { 
                ...preset, 
                usageCount: (preset.usageCount || 0) + 1,
                lastUsed: new Date()
              } 
            : preset
        )
      );
      
      return updatedPreset;
    } catch (err: unknown) {
      handleError(err, 'プリセット使用状況更新');
      // UIに影響しないのでエラー表示はしない
    }
  };

  // プリセットを更新
  const updatePreset = async (presetId: string, updates: Partial<WorkPreset>) => {
    try {
      const response = await axios.put(`/api/presets/${presetId}`, updates);
      const updatedPreset = response.data.preset;
      
      // ローカル状態を更新
      setPresets(prev => 
        prev.map(preset => 
          preset.id === presetId 
            ? { ...preset, ...updatedPreset } 
            : preset
        )
      );
      
      return updatedPreset;
    } catch (err: unknown) {
      const errorMessage = handleError(err, 'プリセット更新');
      throw new Error(errorMessage);
    }
  };

  // プリセットを削除
  const deletePreset = async (presetId: string) => {
    try {
      await axios.delete(`/api/presets/${presetId}`);
      
      // ローカル状態を更新
      setPresets(prev => prev.filter(preset => preset.id !== presetId));
    } catch (err: unknown) {
      const errorMessage = handleError(err, 'プリセット削除');
      throw new Error(errorMessage);
    }
  };

  // 初回レンダリング時にプリセット一覧を取得
  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return {
    presets,
    isLoadingPresets,
    error,
    fetchPresets,
    fetchPopularPresets,
    createPreset,
    updatePresetUsage,
    updatePreset,
    deletePreset
  };
}