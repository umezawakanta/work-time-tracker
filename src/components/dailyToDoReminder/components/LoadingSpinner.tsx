import React from 'react';
import { RefreshCcw } from 'lucide-react';

/**
 * Loading Spinner Component
 * Displays loading state with spinning icon
 */
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="読み込み中">
      <RefreshCcw className="h-6 w-6 animate-spin mr-2" aria-hidden="true" />
      <span className="text-gray-600">読み込み中...</span>
    </div>
  );
};
