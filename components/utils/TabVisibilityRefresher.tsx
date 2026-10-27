'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function TabVisibilityRefresher() {
  const router = useRouter();
  const lastRefreshTime = useRef<number>(0);

  useEffect(() => {
    const handleRefresh = () => {
      const now = Date.now();
      // Throttle 30 seconds
      if (now - lastRefreshTime.current >= 30000) {
        lastRefreshTime.current = now;
        router.refresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return null;
}
