import { useState, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

type QueuedAction = { id: string; execute: () => Promise<void> };

export function useOfflineQueue() {
  const isConnected = useNetworkStatus();
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  const enqueue = useCallback(
    (action: QueuedAction) => {
      if (isConnected) {
        action.execute().catch(console.error);
      } else {
        setQueue((q) => [...q, action]);
      }
    },
    [isConnected],
  );

  const flush = useCallback(async () => {
    if (!isConnected || queue.length === 0) return;
    const pending = [...queue];
    setQueue([]);
    for (const action of pending) {
      try {
        await action.execute();
      } catch (err) {
        console.error('Failed to execute queued action:', err);
      }
    }
  }, [isConnected, queue]);

  return { enqueue, flush, queueLength: queue.length, isConnected };
}
