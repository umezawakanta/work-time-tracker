import React, { useEffect, useState } from 'react';
import AIHistoryService, {
  AIInteractionEntry,
  AIProviderName,
} from '@/services/ai/AIHistoryService';

interface Props {
  limit?: number;
  provider?: AIProviderName;
}

export const AIHistoryPanel: React.FC<Props> = ({ limit = 50, provider }) => {
  const [items, setItems] = useState<AIInteractionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await AIHistoryService.listInteractions({ limit, provider });
        if (mounted) setItems(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit, provider]);

  return (
    <div className="p-4 border rounded-md bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">AI Interaction History</h3>
        {loading && <span className="text-xs text-neutral-500">Loading...</span>}
      </div>
      <div className="space-y-3 max-h-80 overflow-auto">
        {items.map((item) => (
          <div key={item.id} className="text-xs p-3 border rounded">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {item.provider} {item.model ? `· ${item.model}` : ''}
              </div>
              <div className="text-neutral-500">
                {new Date(item.createdAt).toLocaleString()}{' '}
                {item.durationMs ? `· ${item.durationMs}ms` : ''}
              </div>
            </div>
            {item.context?.feature && (
              <div className="mt-1 text-neutral-600">feature: {item.context.feature}</div>
            )}
            <div className="mt-2">
              <div className="text-neutral-500">Prompt</div>
              <pre className="whitespace-pre-wrap break-words bg-neutral-50 dark:bg-neutral-800 p-2 rounded">
                {item.request.prompt}
              </pre>
            </div>
            {item.response?.text && (
              <div className="mt-2">
                <div className="text-neutral-500">Response</div>
                <pre className="whitespace-pre-wrap break-words bg-neutral-50 dark:bg-neutral-800 p-2 rounded max-h-40 overflow-auto">
                  {item.response.text}
                </pre>
              </div>
            )}
            {item.error && <div className="mt-2 text-red-600">Error: {item.error.message}</div>}
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="text-xs text-neutral-500">No interactions yet.</div>
        )}
      </div>
    </div>
  );
};

export default AIHistoryPanel;
