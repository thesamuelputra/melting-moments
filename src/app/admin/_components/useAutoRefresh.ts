'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Periodically re-fetches the current route's server component payload
 * (router.refresh()) — but only while the tab is visible — and refreshes
 * immediately when the tab becomes visible again. Returns { refresh } for
 * manual "Refresh" buttons.
 */
export function useAutoRefresh(intervalMs = 60000): { refresh: () => void } {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, intervalMs);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, refresh]);

  return { refresh };
}
