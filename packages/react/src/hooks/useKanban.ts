import { useCallback, useState } from 'react';
import type { KanbanItem, KanbanItems } from '../components/KanbanBoard/KanbanBoard';

export interface UseKanbanResult<T extends KanbanItem = KanbanItem> {
  items: KanbanItems<T>;
  move: (itemId: string, from: string, to: string, toIndex: number) => void;
  addCard: (columnId: string, item: T, atIndex?: number) => void;
  removeCard: (itemId: string) => void;
  /** Replace the whole `items` state — useful for "load from server". */
  setItems: (next: KanbanItems<T>) => void;
}

/**
 * Tiny state-manager hook for `KanbanBoard`. Drop-in for the common case where
 * you don't want to wire up your own reducer.
 *
 * @example
 * const { items, move, addCard } = useKanban({
 *   backlog: [{ id: '1', title: 'Refund 1192' }],
 *   doing:   [],
 *   done:    [],
 * });
 * <KanbanBoard columns={cols} items={items} onMove={move} />
 */
export function useKanban<T extends KanbanItem = KanbanItem>(
  initial: KanbanItems<T>,
): UseKanbanResult<T> {
  const [items, setItems] = useState<KanbanItems<T>>(initial);

  const move = useCallback((itemId: string, from: string, to: string, toIndex: number) => {
    setItems((prev) => {
      const fromCol = prev[from] ?? [];
      const item = fromCol.find((it) => it.id === itemId);
      if (!item) return prev;
      const nextFrom = fromCol.filter((it) => it.id !== itemId);
      const nextToBase = from === to ? nextFrom : (prev[to] ?? []).slice();
      const safeIndex = Math.max(0, Math.min(toIndex, nextToBase.length));
      nextToBase.splice(safeIndex, 0, item);
      if (from === to) {
        return { ...prev, [to]: nextToBase };
      }
      return { ...prev, [from]: nextFrom, [to]: nextToBase };
    });
  }, []);

  const addCard = useCallback((columnId: string, item: T, atIndex?: number) => {
    setItems((prev) => {
      const col = (prev[columnId] ?? []).slice();
      const i = typeof atIndex === 'number' ? Math.max(0, Math.min(atIndex, col.length)) : col.length;
      col.splice(i, 0, item);
      return { ...prev, [columnId]: col };
    });
  }, []);

  const removeCard = useCallback((itemId: string) => {
    setItems((prev) => {
      const next: KanbanItems<T> = {};
      for (const k of Object.keys(prev)) {
        next[k] = (prev[k] ?? []).filter((it) => it.id !== itemId);
      }
      return next;
    });
  }, []);

  const replace = useCallback((next: KanbanItems<T>) => setItems(next), []);

  return { items, move, addCard, removeCard, setItems: replace };
}
