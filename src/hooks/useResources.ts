import { useState, useEffect, useCallback } from 'react';
import { resourceService } from '@/services/resourceService';

interface Resource {
  id?: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  icon?: string;
  projectId?: string;
  isGlobal: boolean;
  createdBy: string;
}

interface UseResourcesReturn {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  refreshResources: () => Promise<void>;
  addResource: (resourceData: Omit<Resource, 'id'>) => Promise<boolean>;
  updateResource: (resourceId: string, updates: Partial<Resource>) => Promise<boolean>;
  removeResource: (resourceId: string) => Promise<boolean>;
}

export const useResources = (category: string, projectId?: string): UseResourcesReturn => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resourcesData = await resourceService.getResources(category, projectId);
      setResources(resourcesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リソースの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [category, projectId]);

  const addResource = useCallback(async (resourceData: Omit<Resource, 'id'>): Promise<boolean> => {
    try {
      const newResource = await resourceService.createResource(resourceData);
      setResources((prev) => [...prev, newResource]);
      return true;
    } catch (error) {
      console.error('Add resource error:', error);
      return false;
    }
  }, []);

  const updateResource = useCallback(
    async (resourceId: string, updates: Partial<Resource>): Promise<boolean> => {
      try {
        const updatedResource = await resourceService.updateResource(resourceId, updates);
        setResources((prev) =>
          prev.map((resource) => (resource.id === resourceId ? updatedResource : resource))
        );
        return true;
      } catch (error) {
        console.error('Update resource error:', error);
        return false;
      }
    },
    []
  );

  const removeResource = useCallback(async (resourceId: string): Promise<boolean> => {
    try {
      await resourceService.deleteResource(resourceId);
      setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
      return true;
    } catch (error) {
      console.error('Remove resource error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  return {
    resources,
    isLoading,
    error,
    refreshResources,
    addResource,
    updateResource,
    removeResource,
  };
};
