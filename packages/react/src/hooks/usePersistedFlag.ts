import { useCallback, useEffect, useState } from 'react';

/**
 * Persist a boolean flag to `localStorage` under `key`. Survives reloads and
 * sign-out. Falls back to `initial` when storage is unavailable, the key is
 * missing, or the stored value is unparseable.
 *
 * Returns a `[value, setValue]` tuple matching `useState`'s shape.
 */
export function usePersistedFlag(
  key: string,
  initial: boolean,
): readonly [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw);
      return typeof parsed === 'boolean' ? parsed : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode, quota exceeded) — ignore */
    }
  }, [key, value]);

  const set = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => setValue(next),
    [],
  );

  return [value, set] as const;
}
