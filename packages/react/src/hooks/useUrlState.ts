import { useCallback, useEffect, useState } from 'react';

function readParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Sync a single piece of state to a `?key=` query string parameter via
 * `history.replaceState`. SSR-safe — returns the default value on first
 * render in non-browser environments.
 */
export function useUrlState(
  key: string,
  defaultValue: string,
): [string, (next: string) => void] {
  const [value, setValue] = useState<string>(() => readParam(key) ?? defaultValue);

  // Pop back to the URL value when the user hits back/forward.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPop = () => setValue(readParam(key) ?? defaultValue);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [key, defaultValue]);

  const set = useCallback(
    (next: string) => {
      setValue(next);
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (!next || next === defaultValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, next);
      }
      window.history.replaceState(null, '', url.toString());
    },
    [key, defaultValue],
  );

  return [value, set];
}
