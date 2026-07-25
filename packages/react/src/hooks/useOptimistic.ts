"use client";

import { useCallback, useMemo, useState } from 'react';

export interface UseOptimisticResult<T, M> {
  /** The committed (server-truth) value. */
  base: T;
  /** Set the committed value (e.g. after a successful fetch). */
  setBase: (next: T) => void;
  /** Derived value with all queued mutations applied on top of `base`. */
  derived: T;
  /** Currently queued mutations. */
  queue: ReadonlyArray<M>;
  /** Enqueue a mutation; returns a callback to confirm or rollback. */
  mutate: (mutation: M) => { confirm: () => void; rollback: () => void };
}

/**
 * Tiny base / derived / queue optimistic-mutation pattern.
 *
 *  - `base` holds the committed value.
 *  - Calling `mutate(m)` enqueues `m` and re-applies all queued mutations on
 *    top of `base` via the `apply` reducer to produce `derived`.
 *  - The returned `confirm` callback commits the value (drops the mutation
 *    from the queue and folds it into `base`).
 *  - The returned `rollback` drops the mutation without touching `base`.
 *
 * The hook is type-strict: pass `T` for the underlying value type and `M` for
 * the mutation shape.
 */
export function useOptimistic<T, M>(
  initial: T,
  apply: (current: T, mutation: M) => T,
): UseOptimisticResult<T, M> {
  const [base, setBase] = useState<T>(initial);
  const [queue, setQueue] = useState<M[]>([]);

  const derived = useMemo(
    () => queue.reduce((acc, m) => apply(acc, m), base),
    [base, queue, apply],
  );

  const mutate = useCallback(
    (mutation: M) => {
      setQueue((q) => [...q, mutation]);
      return {
        confirm: () => {
          setBase((current) => apply(current, mutation));
          setQueue((q) => q.filter((m) => m !== mutation));
        },
        rollback: () => {
          setQueue((q) => q.filter((m) => m !== mutation));
        },
      };
    },
    [apply],
  );

  return { base, setBase, derived, queue, mutate };
}
