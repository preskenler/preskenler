'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Read client-only preferences (dismissed guides, read alerts) without a
 * hydration mismatch and without calling setState from an effect.
 *
 * `useSyncExternalStore` renders the server snapshot during hydration, then
 * swaps in the real localStorage value, which is exactly what these per-device
 * preferences need. A custom event keeps every subscriber in sync within the
 * tab (the native `storage` event only fires across tabs).
 */

const STORAGE_EVENT = 'preskenler:storage';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function emit() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function getServerSnapshot() {
  return null;
}

function useStoredRaw(key: string) {
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** A list of ids persisted as a JSON array. */
export function useStoredIds(
  key: string,
): [string[], (next: string[]) => void] {
  const raw = useStoredRaw(key);

  const value = useMemo(() => {
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [raw]);

  const set = useCallback(
    (next: string[]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private mode: the value stays in memory for this page view.
      }
      emit();
    },
    [key],
  );

  return [value, set];
}

/** A boolean flag persisted as `"1"`. */
export function useStoredFlag(
  key: string,
): [boolean, (value: boolean) => void] {
  const raw = useStoredRaw(key);

  const set = useCallback(
    (value: boolean) => {
      try {
        if (value) {
          window.localStorage.setItem(key, '1');
        } else {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Private mode: the value stays in memory for this page view.
      }
      emit();
    },
    [key],
  );

  return [raw === '1', set];
}
