import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const NetInfo = await import('@react-native-community/netinfo');
        unsubscribe = NetInfo.default.addEventListener((state) => {
          setIsConnected(state.isConnected ?? true);
        });
      } catch {
        // NetInfo not installed — assume online
      }
    })();

    return () => unsubscribe?.();
  }, []);

  return isConnected;
}
