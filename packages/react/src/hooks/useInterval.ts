import { useEffect, useRef } from 'react';

export interface UseIntervalOptions {
  /** Pause the loop without unmounting. */
  paused?: boolean;
}

/**
 * Strictly-typed `setInterval` wrapper that always calls the *latest* callback
 * and cleans up on unmount or when the delay changes. Pass `paused: true` to
 * halt the loop without re-creating the hook tree.
 *
 * Set `delay` to `null` (or pass `paused`) to stop the interval.
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  options: UseIntervalOptions = {},
): void {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || options.paused) return;
    const tick = () => saved.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, options.paused]);
}
