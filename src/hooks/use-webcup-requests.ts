'use client';

import { useEffect, useState } from 'react';

import type { WebcupSnapshot } from '@/lib/webcup/types';

const POLL_INTERVAL_MS = 30_000;

/**
 * Keep a Terra Nova snapshot fresh by polling the authenticated proxy route.
 *
 * The server refreshes the upstream API in the background (`after()`), so each
 * poll returns the persisted snapshot quickly. Polling pauses while the tab is
 * hidden to avoid pointless traffic.
 */
export function useWebcupRequests(initial: WebcupSnapshot) {
  const [snapshot, setSnapshot] = useState(initial);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      setIsRefreshing(true);

      try {
        const response = await fetch('/api/webcup/requests', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as WebcupSnapshot;

        if (!cancelled) {
          setSnapshot(data);
          setHasError(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    const timer = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { snapshot, hasError, isRefreshing };
}
