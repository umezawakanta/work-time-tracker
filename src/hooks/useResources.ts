import { useState, useEffect, useCallback } from 'react';

interface Resource {
  title: string;
  url: string;
  icon: React.ReactNode;
}

interface UseResourcesReturn {
  resources: Resource[];
  isLoading: boolean;
  refreshResources: () => Promise<void>;
}

export const useResources = (category: string): UseResourcesReturn => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshResources = useCallback(async () => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // For now, return mock data based on category
      const mockResources: Resource[] = [
        {
          title: 'shadcn-ui ドキュメント',
          url: 'https://ui.shadcn.com/',
          icon: null,
        },
        {
          title: 'Next.js 15 移行ガイド',
          url: 'https://nextjs.org/docs/app/building-your-application/upgrading',
          icon: null,
        },
      ];

      setResources(mockResources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  return {
    resources,
    isLoading,
    refreshResources,
  };
};
