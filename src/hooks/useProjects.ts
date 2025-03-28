import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Project } from '@/types';
import axios from 'axios';

interface CreateProjectParams {
  name: string;
  color: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // プロジェクト一覧を取得
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setError(null);
    } catch (err: unknown) {
      // より具体的な型チェックを行う
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      console.error('プロジェクト取得エラー:', err);
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: 'プロジェクトの取得に失敗しました',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }, [toast]); // Added toast to dependencies to satisfy React Hook rules

  // 新しいプロジェクトを作成
  const createProject = async (params: CreateProjectParams): Promise<Project> => {
    try {
      const response = await axios.post('/api/projects', params);
      const newProject = response.data.project;
      
      // ローカル状態を更新
      setProjects(prev => [...prev, newProject]);
      
      return newProject;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの作成に失敗しました';
      console.error('プロジェクト作成エラー:', err);
      throw new Error(errorMessage);
    }
  };

  // プロジェクトを使用した際に最終使用日時を更新
  const updateProjectUsage = async (projectId: string) => {
    try {
      await axios.put(`/api/projects/${projectId}/used`);
      
      // ローカル状態を更新
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, lastUsed: new Date() } 
            : project
        )
      );
    } catch (err: unknown) {
      console.error('プロジェクト使用状況更新エラー:', err);
      // UIに影響しないのでエラー表示はしない
    }
  };

  // プロジェクトを更新
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, updates);
      const updatedProject = response.data.project;
      
      // ローカル状態を更新
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updatedProject } 
            : project
        )
      );
      
      return updatedProject;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの更新に失敗しました';
      console.error('プロジェクト更新エラー:', err);
      throw new Error(errorMessage);
    }
  };

  // プロジェクトをアーカイブ（論理削除）
  const archiveProject = async (projectId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      
      // ローカル状態を更新
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトのアーカイブに失敗しました';
      console.error('プロジェクトアーカイブエラー:', err);
      throw new Error(errorMessage);
    }
  };

  // 初回レンダリング時にプロジェクト一覧を取得
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Added fetchProjects to dependency array

  return {
    projects,
    isLoadingProjects,
    error,
    fetchProjects,
    createProject,
    updateProjectUsage,
    updateProject,
    archiveProject
  };
}