import { useEffect, useState } from 'react';
import {
  DerivedStatusesResult,
  deriveAllFeatureStatuses,
} from '@/services/dev/featureStatusEngine';

export function useDerivedFeatureStatuses(): {
  data: DerivedStatusesResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<DerivedStatusesResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await deriveAllFeatureStatuses();
      setData(result);
    } catch (e) {
      setError('Failed to derive statuses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return { data, isLoading, error, refresh: load };
}
