import { useEffect, useState } from 'react';

/**
 * SSR-safe `matchMedia` subscriber. Returns `false` during SSR and on the
 * first client render so hydration markup matches.
 */
export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Newer browsers prefer addEventListener; older Safari uses addListener.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Fallback for legacy Safari — guarded behind a feature check.
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
